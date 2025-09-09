package ai.flowrabbit;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AiModelTestTest extends BaseTestCase {

    @Test
    public void testCRUD(TestContext context) {
        log("testCRUD", "enter");

        cleanUp();
        deploy(new Main(), context);

        this.createAdmin(context);

        adminCreateAiModel(context, new JsonObject().put("name", "OpenAi"));
        adminCreateAiModel(context, new JsonObject().put("name", "DeepSeek"));


        JsonArray list = this.getList("/rest/ai/models.json");
        context.assertEquals(2, list.size());

    }

    public JsonObject adminCreateAiModel(TestContext context, JsonObject model) {
        JsonObject res = this.post("/rest/admin/ai/model/", model);
        context.assertFalse(res.containsKey("error"));

        return res;
    }
}
