package ai.flowrabbit;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Image;
import ai.flowrabbit.model.PublicationSettings;

import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;

@RunWith(VertxUnitRunner.class)
public class VersionRestTest extends BaseTestCase {

    @Test
    public void test_CRUD(TestContext context) throws IOException {
        log("test_CRUD", "enter");

        cleanUp();

        deploy(new Main(), context);


        /**
         * create user
         */
        postUser("klaus", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app1 = postApp("klaus_app_public", false, context);
        postImage(app1, context, "test.png");
        postImage(app1, context, "test.png");

        JsonObject pub1 = postPublicSettings(app1, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "MyPublicApp"), context);

        print(pub1);

        publishVersion(app1, context, 1);

        updateApp(app1, "klaus_app_public_2", context);

        publishVersion(app1, context, 2);

        FileSystem fs = vertx.fileSystem();

        context.assertTrue(fs.existsBlocking("test/versions/" + app1.getId() + "/1/app.json"));
        context.assertTrue(fs.existsBlocking("test/versions/" + app1.getId() + "/2/app.json"));


        pub1 = getPublicSettings(app1, context);
        context.assertEquals(2, pub1.getJsonArray(PublicationSettings.FIELD_VERSIONS).size());

        /**
         * Check that we get the stuff as well
         */
        JsonObject inv = getPublicToken("private", "MyPublicApp", context);
        String token = inv.getString("token");
        int version = inv.getInteger("version");

        JsonObject publicAppCurrent = getAppVersion(context, token, version);
        context.assertEquals("klaus_app_public_2", publicAppCurrent.getString("name"));

        JsonArray images = assertList("/rest/images/" + app1.getId() + ".json", 2, context);
        getVersionImage(context, token, version, images);


        /**
         * Check we can get old version
         */
        JsonObject publicAppV1 = getAppVersion(context, token, 1);
        print(publicAppV1);
        context.assertEquals("klaus_app_public", publicAppV1.getString("name"));
        getVersionImage(context, token, 1, images);

        /**
         * Check wrong version
         */
        getAppErrorVersion(context, token, 3);
        getVersionImageError(context, token, 3, images);

        /**
         * save for hacking
         */
        getAppErrorVersion(context, "asdasd", version);
        getVersionImageError(context, "sadasd", version, images);

        log("test_CRUD", "exit");
    }

    private void getVersionImageError(TestContext context, String token, int version, JsonArray images) throws IOException {
        for(int i=0; i< images.size();i++) {
            JsonObject img = images.getJsonObject(i);
            String url = img.getString("url");
            int statusCode = getRawStatusCode("/rest/public/version/" + version +  "/" + token + "/" + url);
            context.assertTrue(500 == statusCode || 404 == statusCode);
        }
    }

    private void getVersionImage(TestContext context, String token, int version, JsonArray images) throws IOException {
        for(int i=0; i< images.size();i++) {
            JsonObject img = images.getJsonObject(i);
            String url = img.getString("url");
            InputStream is = getRaw("/rest/public/version/" + version +  "/" + token + "/" + url);
            context.assertTrue(is !=null);
            BufferedImage image = ImageIO.read(is);
            context.assertTrue(image.getWidth() <= Image.MAX_IMAGE_WIDTH * Image.SCALE_FACTOR, "Wrong width "+ image.getWidth());
            is.close();
        }
    }

    private JsonObject getAppVersion(TestContext context, String token, int version) {
        JsonObject result = get("/rest/public/version/" + version + "/" + token + "/app.json");
        context.assertTrue(!result.containsKey("error"));
        return result;
    }

    private JsonObject getAppErrorVersion(TestContext context, String token, int version) {
        JsonObject result = get("/rest/public/version/" + version + "/" + token + "/app.json");
        context.assertTrue(result.containsKey("error"));
        return result;
    }

    private void publishVersion(App app, TestContext context, int expectedVersion) {
        JsonObject result = this.post("/rest/public/version/" + app.getId() + "/", new JsonObject());
        print(result);
        context.assertNotNull(result.getString("id"));
        context.assertEquals(result.getString("appID"), app.getId());
        context.assertTrue(result.containsKey("current"));
        context.assertEquals(expectedVersion, result.getInteger("current"));
    }
}
