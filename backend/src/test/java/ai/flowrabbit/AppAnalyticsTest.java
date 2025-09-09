package ai.flowrabbit;
import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;

@RunWith(VertxUnitRunner.class)
public class AppAnalyticsTest extends BaseTestCase {

    SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy", Locale.ENGLISH);


    @Test
    public void testCRUD(TestContext context) throws IOException, ParseException {
        log("testCRUD", "enter");
        cleanUp();
        deploy(new Main(), context);


        User klaus = postUser("klaus", context);
        User serhad = postUser("serhad", context);
        assertLogin(context, klaus.getEmail(), "123456789");
        App app = postApp("app",  false, context);
        String appID = app.getId();

        getPublicSettings(app, context);
        postPublicSettings(app, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "MyApp"), context);
        JsonObject publicToken = getPublicToken("private", "MyApp", context);
        print(publicToken);

        long now = formatter.parse("25-07-2024").getTime();
        for (int i=0; i < 100; i++) {
            postAppAnalytics(context, appID, now + (i * 3600000), "openAI", 1);
            postAppAnalytics(context, appID, now + (i * 3600000), "azure", 2);
        }

        sleep(500);
        long count = client.count(DB.getTable(AppAnalytics.class), AppPart.findByApp(appID));
        context.assertEquals(200l, count);

        // we cannot write if we are logged out
        logout();
        postAppAnalyticsError(context, appID, now, "XXX", 1);

        // use public token
        setJWT(publicToken.getString("token"));
        postAppAnalytics(context, appID, now, "YYY", 1);

        sleep(300);
        count = client.count(DB.getTable(AppAnalytics.class), AppPart.findByApp(appID));
        context.assertEquals(201l, count);


        // check that we can get data
        assertLogin(context, klaus.getEmail(), "123456789");
        JsonArray result = getAppAnalytics(context, appID, 7, 2024);
        context.assertTrue(result.size() > 0);

        // FIXME: This will not work next month
//        result = getAppAnalytics(context, appID, -1, -1);
//        print(result);
//        context.assertTrue(result.size() > 0);


        result = getAppAnalytics(context, appID, 6, 2024);
        context.assertTrue(result.size() == 0);

        // analytics are protected
        logout();
        result = getAppAnalytics(context, appID, 7, 2024);
        context.assertTrue(result.size() == 1);
        context.assertEquals(404, result.getInteger(0));

        assertLogin(context, serhad);
        result = getAppAnalytics(context, appID, 7, 2024);
        context.assertTrue(result.size() == 1);
        context.assertEquals(404, result.getInteger(0));

        result = getAppAnalytics(context, appID, 4, 2024);
        context.assertTrue(result.size() == 1);
        context.assertEquals(404, result.getInteger(0));

//
//        List<JsonObject> all = client.find(DB.getTable(AppAnalytics.class), AppPart.findByApp(appID));
//        for (JsonObject a: all) {
//            print(a);
//        }

//        JsonArray events = getAppAnalytics(context, appID, );

    }

    private JsonArray getAppAnalytics(TestContext context, String appID, int month, int year) {
        if (month > 0)
            return this.getList("/rest/apps/" + appID + "/analytics.json?m=" + month + "&y=" + year);
        else
            return this.getList("/rest/apps/" + appID + "/analytics.json");
    }

    private JsonObject postAppAnalytics(TestContext context, String appID, long created, String model, double tokens) {
        JsonObject data = new JsonObject()
                .put(AppAnalytics.CREATED, created)
                .put(AppAnalytics.AI_MODEL, model)
                .put(AppAnalytics.TOKENS, tokens);


        JsonObject result = this.post("/rest/apps/" + appID + "/analytics.json", data);
        context.assertFalse(result.containsKey("error"));
        context.assertFalse(result.containsKey("errors"));
        context.assertTrue(result.containsKey("id"));

        return result;
    }

    private JsonObject postAppAnalyticsError(TestContext context, String appID, long created, String model, double tokens) {
        JsonObject data = new JsonObject()
                .put(AppAnalytics.CREATED, created)
                .put(AppAnalytics.AI_MODEL, model)
                .put(AppAnalytics.TOKENS, tokens);

        JsonObject result = this.post("/rest/apps/" + appID + "/analytics.json", data);
        context.assertTrue(result.containsKey("error"));
        context.assertEquals(405, result.getInteger("error"));
        return result;
    }

}
