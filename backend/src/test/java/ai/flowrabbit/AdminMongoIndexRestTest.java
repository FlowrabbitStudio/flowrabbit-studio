package ai.flowrabbit;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AdminMongoIndexRestTest extends BaseTestCase {

    @Test
    public void testGet(TestContext context) {
        log("testHack", "enter");

        cleanUp();
        deploy(new Main(), context);
        createAdmin(context);

        JsonObject all = get("/rest/admin/index/all.json");
        context.assertNotNull(all);
        print(all);

    }

    @Test
    public void testUpdate(TestContext context) {
        log("testUpdate", "enter");

        cleanUp();
        deploy(new Main(), context);
        createAdmin(context);

        JsonObject all = post("/rest/admin/index/update.json", new JsonObject());
        context.assertNotNull(all);
        print(all);

    }
}
