
package ai.flowrabbit;

    import ai.flowrabbit.bus.RequestMonitorVehicle;

    import io.vertx.core.json.JsonArray;
    import io.vertx.ext.unit.TestContext;
    import io.vertx.ext.unit.junit.VertxUnitRunner;
    import org.junit.Test;
    import org.junit.runner.RunWith;


@RunWith(VertxUnitRunner.class)
public class AdminRestTest2 extends BaseTestCase {


    @Test
    public void test_request(TestContext context){
        log("test_request", "enter");

        cleanUp();
        deploy(new Main(), context);

        sleep(200);

        /**
         * create admin
         */
        this.createAdmin(context);

        JsonArray events = this.getList("/rest/admin/requests.json");
        context.assertEquals(0,events.size()); // 2 because admin created and logged in

        /**
         * force flushing to disk...
         */
        RequestMonitorVehicle.getInstance().flushToDB();
        this.sleep(500);

        events = this.getList("/rest/admin/requests.json");
        context.assertEquals(1,events.size()); // 2 because admin created and logged in
        context.assertEquals(3l, events.getJsonObject(0).getLong("count"));



        log("test_request", "exit");
    }




}
