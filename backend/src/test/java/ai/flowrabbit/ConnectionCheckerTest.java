package ai.flowrabbit;

import ai.flowrabbit.bus.ConnectionCheckerVehicle;
import ai.flowrabbit.model.AppEvent;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

//@RunWith(VertxUnitRunner.class)
public class ConnectionCheckerTest extends BaseTestCase {


       // @Test
        public void testRequest(TestContext context) throws InterruptedException {
            log("testRequest", "enter");

            cleanUp();
            deploy(new Main(), context);

            List<JsonObject> events = client.find(DB.getTable(AppEvent.class), Model.all());
            context.assertEquals(0, events.size());


            assertURL(context, "google.com", true);

            events = client.find(DB.getTable(AppEvent.class), Model.all());
            context.assertEquals(0, events.size());
            print(events);

            assertURL(context, "slfdjslFJHJsfhsdjhfhjsfknj.abc", false);

            sleep(1000);
            events = client.find(DB.getTable(AppEvent.class), Model.all());
            context.assertEquals(1, events.size());
            context.assertEquals(AppEvent.TYPE_CONNECTION_CHECK_ERROR, events.get(0).getString("type"));
            print(events);



            log("testRequest", "exit");
        }


        private void assertURL (TestContext context, String url, boolean exp) throws InterruptedException {
            System.out.print("Request..." + url);
            final CountDownLatch latch = new CountDownLatch(1);
            ConnectionCheckerVehicle.getInstance().checkURLs(url, res -> {
                System.out.println("  Done > " + res);
                context.assertEquals(exp, res);
                latch.countDown();
            });
            latch.await(6000, TimeUnit.MILLISECONDS);
        }
}
