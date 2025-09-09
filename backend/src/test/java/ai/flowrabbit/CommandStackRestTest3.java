package ai.flowrabbit;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

import org.junit.Test;
import org.junit.runner.RunWith;

import ai.flowrabbit.model.App;

@RunWith(VertxUnitRunner.class)
public class CommandStackRestTest3 extends BaseTestCase {

    @Test
    public void test_wrong_position(TestContext context){
        log("test_wrong_position", "enter");

        cleanUp();

        deploy(new Main(), context);

        postUser("klaus", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app = postApp("klaus_app_public", true, context);


        log("test_Command", "Created App > "+ app.getId());
        getStack(app, context);


        for(int i=1; i< 300; i++){
            JsonObject command = new JsonObject().put("type", "AddWidget").put("new", new JsonObject().put("x",10)).put("id", i);
            postCommand(app, command, i, i, context);
        }

        JsonObject stack = getStack(app, context);
        context.assertEquals(299, stack.getInteger("pos"));
        context.assertEquals(299, stack.getJsonArray("stack").size());
        assertStackOrder(stack,0,1, context);

        postUndo(app, 298, 299, context);
        postUndo(app, 297, 299, context);
        postUndo(app, 296, 299, context);
        postUndo(app, 295, 299, context);
        postUndo(app, 294, 299, context);

        popStack(app, 5, 294, 294, context);

        JsonObject updatedStack = getStack(app, context);
        context.assertEquals(updatedStack.getJsonArray("stack").size(), 294);
        assertStackOrder(updatedStack,0,1, context);

        JsonObject command = new JsonObject().put("type", "AddWidget").put("new", new JsonObject().put("x",10)).put("id", "c301" );
        postCommand(app, command, 295, 295, context);


        log("test_Command", "exit");
    }


    public JsonObject getStack(App app, TestContext context){
        JsonObject stack = get("/rest/commands/" + app.getId() + ".json");
        log("assertStack", "get(stack) : " + stack);
        context.assertTrue(!stack.containsKey("error"));
        context.assertTrue(!stack.containsKey("errors"));
        context.assertEquals(stack.getString("appID"), app.getId());
        return stack;
    }


    public void postRedo(App app,  int expectedPos, int extpectedLength, TestContext context){
        log("postRedo", "enter");
        JsonObject result = post("/rest/commands/" +app.getId()+"/redo", new JsonObject());
        context.assertTrue(!result.containsKey("errors"));
        context.assertEquals(expectedPos, result.getInteger("pos"));

        JsonObject stack = get("/rest/commands/" + app.getId() + ".json");
        log("postRedo", "stack > "+  stack.encode());
        context.assertEquals(expectedPos, stack.getInteger("pos"));
        context.assertEquals(extpectedLength, stack.getJsonArray("stack").size());

    }

    public void postUndo(App app, int expectedPos, int extpectedLength, TestContext context){
        log("postUndo", "enter");
        JsonObject result = post("/rest/commands/" +app.getId()+"/undo", new JsonObject().put("as","as"));
        context.assertTrue(!result.containsKey("errors"));
        context.assertEquals(expectedPos, result.getInteger("pos"));

        JsonObject stack = get("/rest/commands/" + app.getId() + ".json");
        log("postRedo", "stack > "+  stack.encode());
        context.assertEquals(expectedPos, stack.getInteger("pos"));
        context.assertEquals(extpectedLength, stack.getJsonArray("stack").size());

    }


    public JsonObject postCommand(App app, JsonObject command, int expectedPos, int extpectedLength, TestContext context){
        JsonObject result = post("/rest/commands/" +app.getId()+"/add", command);

        log("postCommand", "result > " + result.encode());
        context.assertTrue(!result.containsKey("errors"));
        context.assertTrue(result.containsKey("command"));
        context.assertEquals(expectedPos, result.getInteger("pos"));

        JsonObject stack = get("/rest/commands/" + app.getId() + ".json");
        context.assertEquals(expectedPos, stack.getInteger("pos"));
        context.assertEquals(extpectedLength, stack.getJsonArray("stack").size());

        log("postCommand", "stack > "+  stack.encode());
        return result;
    }


}
