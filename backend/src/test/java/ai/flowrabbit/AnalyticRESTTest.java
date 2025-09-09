package ai.flowrabbit;

import ai.flowrabbit.model.AnalyticEvent;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.List;

@RunWith(VertxUnitRunner.class)
public class AnalyticRESTTest extends BaseTestCase {


    @Test
    public void test(TestContext context){
        log("test", "enter");

        cleanUp();
        deploy(new Main(), context);

        post("/rest/analytics", new JsonObject().put("screen", "start").put("type", "view"));

        List<JsonObject> events = this.client.find(DB.getTable(AnalyticEvent.class), AnalyticEvent.all());
        context.assertEquals(1, events.size());

        for (JsonObject o : events) {
            context.assertTrue(o.containsKey(AnalyticEvent.CREATED));
            context.assertTrue(o.containsKey(AnalyticEvent.TYPE));
        }

        print(events);

        log("test", "exit");
    }



}
