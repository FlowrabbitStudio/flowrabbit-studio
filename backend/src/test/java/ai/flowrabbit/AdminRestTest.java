package ai.flowrabbit;

import ai.flowrabbit.model.AppEvent;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;


@RunWith(VertxUnitRunner.class)
public class AdminRestTest extends BaseTestCase {




    @Test
    public void test_security(TestContext context) {
        log("test_security", "enter");

        cleanUp();
        deploy(new Main(), context);

        this.assertListError("/rest/admin/users.json", 404, context);
        this.assertListError("/rest/admin/apps.json", 404, context);
        this.assertListError("/rest/log/event", 404, context);
        this.assertListError("/rest/admin/performance.json", 404, context);


        log("test_security", "exit");
    }

    @Test
    public void test_users(TestContext context){
        log("test_users", "enter");

        cleanUp();
        deploy(new Main(), context);


        /**
         * create admin
         */
        this.createAdmin(context);

        JsonArray users = this.getList("/rest/admin/users.json");
        context.assertTrue( users.size() >= 1);// there should be also a klaus

        log("test_users", "exit");
    }

    @Test
    public void test_appEvents(TestContext context){
        log("test_appEvents", "enter");

        cleanUp();
        deploy(new Main(), context);


        /**
         * create admin
         */
        this.createAdmin(context);

        JsonArray events = this.getList("/rest/admin/event.json");
        context.assertEquals(2, events.size()); // 2 because admin created and logged in


        client.save(DB.getTable(AppEvent.class), createAppEvent(AppEvent.TYPE_USER_LOGIN, "A",1));
        client.save(DB.getTable(AppEvent.class), createAppEvent(AppEvent.TYPE_USER_LOGIN, "A",100));
        client.save(DB.getTable(AppEvent.class), createAppEvent(AppEvent.TYPE_APP_CREATE, "A",200));
        client.save(DB.getTable(AppEvent.class), createAppEvent(AppEvent.TYPE_APP_CREATE, "A",300));
        client.save(DB.getTable(AppEvent.class), createAppEvent(AppEvent.TYPE_APP_CREATE, "A",500));

        events = this.getList("/rest/admin/event.json");
        context.assertEquals(7, events.size());


        events = this.getList("/rest/admin/event.json?from=100&to=300");
        context.assertEquals(3, events.size());

        events = this.getList("/rest/admin/event.json?from=100&to=300&type=" + AppEvent.TYPE_APP_CREATE);
        context.assertEquals(2, events.size());

        events = this.getList("/rest/admin/event.json?type=" + AppEvent.TYPE_APP_CREATE);
        context.assertEquals(3, events.size());

        log("test_appEvents", "exit");
    }


    @Test
    public void test_performance(TestContext context){
        log("test_performance", "enter");

        cleanUp();
        deploy(new Main(), context);


        /**
         * create admin
         */
        this.createAdmin(context);

        JsonArray events = this.getList("/rest/admin/performance.json");
        context.assertTrue(events.size() >= 0); // 2 because admin created and logged in



        log("test_performance", "exit");
    }



    @Test
    public void test_analytic_events(TestContext context){
        log("test_analytic_events", "enter");

        cleanUp();
        deploy(new Main(), context);


        /**
         * create admin
         */
        this.createAdmin(context);

        post("/rest/analytics", new JsonObject().put("screen", "a").put("type", "view"));
        post("/rest/analytics", new JsonObject().put("screen", "b").put("type", "view"));
        post("/rest/analytics", new JsonObject().put("screen", "a").put("type", "view"));


        JsonArray events = this.getList("/rest/admin/analytics/all.json");
        context.assertTrue( events.size() == 3);


        JsonArray summary = this.getList("/rest/admin/analytics/summary/minute.json");
        context.assertTrue( summary.size() == 2);

        log("test_analytic_events", "exit");
    }


    @Test
    public void test_analytic_events2(TestContext context){
        log("test_analytic_events2", "enter");

        cleanUp();
        deploy(new Main(), context);


        /**
         * create admin
         */
        this.createAdmin(context);

        post("/rest/analytics", new JsonObject().put("screen", "a").put("type", "view"));
        post("/rest/analytics", new JsonObject().put("screen", "b").put("type", "view"));
        post("/rest/analytics", new JsonObject().put("screen", "c").put("type", "click"));


        JsonArray events = this.getList("/rest/admin/analytics/all.json");
        context.assertTrue( events.size() == 3);

        events = this.getList("/rest/admin/analytics/all.json?type=view");
        context.assertTrue( events.size() == 2);

        events = this.getList("/rest/admin/analytics/all.json?type=click");
        context.assertTrue( events.size() == 1);


        JsonArray summary = this.getList("/rest/admin/analytics/summary/minute.json");
        context.assertTrue( summary.size() == 3);

        summary = this.getList("/rest/admin/analytics/summary/minute.json?type=view");
        context.assertTrue( summary.size() == 2);

        log("test_analytic_events2", "exit");
    }


    private JsonObject createAppEvent(String type, String value, long millis) {
        JsonObject appEvent =  new JsonObject()
                .put(AppEvent.FIELD_USER, "test@quant-ux.de")
                .put(AppEvent.FIELD_CREATED, millis)
                .put(AppEvent.FIELD_TYPE, type)
                .put(AppEvent.FIELD_VALUE, value);
        return appEvent;
    }





}
