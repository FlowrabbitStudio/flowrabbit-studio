package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AppRestTest7 extends BaseTestCase {


    @Test
    public void testDeleteCleanup(TestContext context) {
        log("testDeleteCleanup", "enter");

        cleanUp();
        deploy(new Main(), context);
        FileSystem fs = vertx.fileSystem();

        User klaus = postUser("klaus", context);
        assertLogin(context, klaus, "123456789");
        App app = postApp("klaus_app_public", true, context);

        /**
         * Add data
         */
        assertList("/rest/images/" + app.getId() + ".json", 0, context);
        postImage(app, context, "test.png");
        assertList("/rest/images/" + app.getId() + ".json", 1, context);


        /**
         * Add data
         */
        getData(app, context);
        JsonArray changes = new JsonArray();
        changes.add(createChange(
                "add",
                "var", new JsonObject().put("type", "object").put("default", new JsonObject()),
                "schema")
        );
        postData(app, changes, context);

        /**
         * Add Secrets
         */
        getAppSecrets(app, context);
        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "a")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "http://flowrabbit.ai")
                );
        JsonObject newSecrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);
        postAppSecrets(app, newSecrets, context);

        context.assertEquals(1l, client.count(DB.getTable(AppSecrets.class), Model.all()));
        context.assertEquals(1l, client.count(DB.getTable(AppData.class), Model.all()));
        context.assertEquals(1l, client.count(DB.getTable(Team.class), Model.all()));
        context.assertEquals(1l, client.count(DB.getTable(Image.class), Model.all()));

        String imageFolder = conf.getString("image.folder.apps");
        String folder = imageFolder +"/" + app.getId();
        context.assertTrue(fs.existsBlocking(folder));

        deleteApp(context, app.getId());
        sleep(2000);

        context.assertEquals(0l, client.count(DB.getTable(AppSecrets.class), Model.all()));
        context.assertEquals(0l, client.count(DB.getTable(AppData.class), Model.all()));
        context.assertEquals(0l, client.count(DB.getTable(Team.class), Model.all()));
        context.assertEquals(0l, client.count(DB.getTable(Image.class), Model.all()));


        context.assertFalse(fs.existsBlocking(folder));


        log("testAppCopy", "enter");
    }
}
