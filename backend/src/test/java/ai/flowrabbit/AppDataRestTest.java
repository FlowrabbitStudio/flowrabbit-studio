package ai.flowrabbit;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Invitation;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.JsonPath;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AppDataRestTest extends BaseTestCase {


    @Test
    public void test_CRUD(TestContext context) {
        log("test_CRUD", "enter");

        cleanUp();

        deploy(new Main(), context);


        /**
         * create user
         */
        User klaus = postUser("klaus", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app1 = postApp("klaus_app_public", false, context);

        getData(app1, context);

        JsonArray changes = new JsonArray();
        changes.add(createChange(
                "add",
                "var", new JsonObject().put("type", "object").put("default", new JsonObject()),
                "schema")
        );
        postData(app1, changes, context);

        JsonObject data2 = getData(app1, context);
        JsonPath p = new JsonPath(data2);
        context.assertEquals("object", p.getString("schema", "var", "type"));


        changes = new JsonArray();
        changes.add(createChange(
                "add",
                "var.child", new JsonObject().put("type", "int").put("default", 10),
                "schema")
        );
        postData(app1, changes, context);
        JsonObject data3 = getData(app1, context);
        p = new JsonPath(data3);
        context.assertEquals(10, p.getInteger("schema", "var", "child", "default"));

        changes = new JsonArray();
        changes.add(createChange(
                "add",
                "var.child", new JsonObject().put("type", "int").put("default", 11),
                "schema")
        );
        postData(app1, changes, context);
        JsonObject data4 = getData(app1, context);
        p = new JsonPath(data4);
        context.assertEquals(11, p.getInteger("schema", "var", "child", "default"));

        // update
        changes = new JsonArray();
        changes.add(createChange(
                "update",
                "var.child", new JsonObject().put("type", "int").put("default", 12),
                "schema")
        );
        postData(app1, changes, context);
        JsonObject data5 = getData(app1, context);
        p = new JsonPath(data5);
        context.assertEquals(12, p.getInteger("schema", "var", "child", "default"));

        // delete stuff
        changes = new JsonArray();
        changes.add(createChange(
                "delete",
                "var", new JsonObject().put("type", "int").put("default", 12),
                "schema")
        );
        postData(app1, changes, context);
        JsonObject data6 = getData(app1, context);
        context.assertTrue(data6.containsKey("schema"));
        context.assertFalse(data6.getJsonObject("schema").containsKey("var"));

        JsonObject invitation = getInvitation(app1, context);
        String hash = Invitation.getHash(invitation, Invitation.TEST);

        JsonObject invData = getDataByHash(app1, hash, context);
        //context.assertEquals(invData.getString("car"), "audi");

        logout();
        getDataError(app1, context);

        log("test_CRUD", "exit");
    }

    JsonObject getDataByHash(App app, String hash, TestContext context) {
        JsonObject result = get("/rest/invitation/" + app.getId() + "/" + hash +"/data.json");
        System.out.println("getDataByHash() > " + result.encodePrettily());
        context.assertFalse(result.containsKey("error"));
        return result;
    }


}
