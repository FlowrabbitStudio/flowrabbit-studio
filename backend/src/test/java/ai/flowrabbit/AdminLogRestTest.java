package ai.flowrabbit;

import ai.flowrabbit.bus.MongoLogger;
import ai.flowrabbit.model.User;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AdminLogRestTest extends BaseTestCase {

    @Test
    public void testFileLog(TestContext context){
        log("testFileLog", "enter");

        cleanUp();
        deploy(new Main(), context);

        this.createAdmin(context);
        JsonArray log = this.getList("/rest/admin/log/last.json");
        context.assertNotNull(log);
        context.assertTrue(!log.isEmpty());

        log = this.getList("/rest/admin/log/last.json?lines=2");
        print(log);
        context.assertNotNull(log);
        context.assertEquals(2, log.size());

        log("testFileLog", "exit");
    }


    @Test
    public void test_error_log(TestContext context){
        log("test_error_log", "enter");

        cleanUp();
        deploy(new Main(), context);

        this.createAdmin(context);
        MongoLogger.error(this.vertx.eventBus(), new User(), AdminLogRestTest.class, "test_error_log", "Test");
        sleep(500);

        JsonArray list = this.getList("/rest/admin/logs.json");
        context.assertEquals(1, list.size());
        this.delete("/rest/admin/logs.json");
        list = this.getList("/rest/admin/logs.json");
        context.assertEquals(0, list.size());

        log("test_error_log", "exit");
    }


    @Test
    public void test_error_log_auth(TestContext context){
        log("test_error_log_auth", "enter");

        cleanUp();
        deploy(new Main(), context);

        this.createUser("Guest");
        MongoLogger.error(this.vertx.eventBus(), new User(), AdminLogRestTest.class, "test_error_log", "Test");
        sleep(500);
        this.assertListError("/rest/admin/logs.json", 404, context);
        log("test_error_log_auth", "exit");
    }



}
