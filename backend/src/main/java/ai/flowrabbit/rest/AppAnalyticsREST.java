package ai.flowrabbit.rest;

import ai.flowrabbit.lunarmare.Model;
import ai.flowrabbit.lunarmare.ModelFactory;
import ai.flowrabbit.acl.AppAnalyticsACL;
import ai.flowrabbit.model.AppAnalytics;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.JSONMapper;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.validation.ModelValidator;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

import java.util.*;

public class AppAnalyticsREST extends MongoREST {

    public AppAnalyticsREST(MongoClient db) {
        super(db, AppAnalytics.class);
        Model model = new ModelFactory().create("AppAnalytics")
                .addLong(AppAnalytics.CREATED)
                .addString(AppAnalytics.AI_MODEL)
                .addDouble(AppAnalytics.TOKENS)
                .build();

        this.setACL(new AppAnalyticsACL(db));
        this.setValidator(new ModelValidator(model));
    }

    @Override
    protected void beforeCreate(RoutingContext event, JsonObject json) {
        String appID = event.request().getParam("appID");
        json.put(AppAnalytics.APP_ID, appID);

        long millis = json.getLong(AppAnalytics.CREATED);
        Calendar created=GregorianCalendar.getInstance();
        created.setTimeInMillis(millis);

        json.put(AppAnalytics.MONTH, created.get(Calendar.MONTH) + 1);
        json.put(AppAnalytics.DAY, created.get(Calendar.DAY_OF_MONTH));
        json.put(AppAnalytics.YEAR, created.get(Calendar.YEAR));
    }

    public Handler<RoutingContext> findByApp() {
        return event -> findByApp(event);
    }

    private void findByApp(RoutingContext event) {
        String appID = event.request().getParam("appID");
        User user = getUser(event);
        this.acl.canRead(user, event, allowed -> {
            if (allowed) {
                findByApp(event, appID);
            } else {
                logger.error("findByApp() > user " + user + " tried to read app analytics");
                returnError(event, 404);
            }
        });
    }

    private void findByApp(RoutingContext event, String appID) {
        JsonObject query = getQuery(event, appID);
        SummaryMongoPump pump = new SummaryMongoPump(event);
        mongo.findBatch(table, query)
                .exceptionHandler(err -> pump.error())
                .endHandler(v -> pump.end())
                .handler(doc -> pump.pump(doc));
    }


    private JsonObject getQuery (RoutingContext event, String appID) {
        Calendar now = GregorianCalendar.getInstance();
        int m = now.get(Calendar.MONTH) + 1;
        int y = now.get(Calendar.YEAR);

        try {
            MultiMap entries = event.queryParams();
            if (entries.contains("m")) {
                m = Integer.parseInt(entries.get("m"));
            }

            if (entries.contains("y")) {
                y = Integer.parseInt(entries.get("y"));
            }
        } catch (Exception e) {
            this.logger.error("getQuery() > Could not parse query", e);
        }
        logger.info("getQuery() > m:" + m + " > y: " + y);
        return AppAnalytics.findByMonthAndYear(appID, m, y);
    }
}

class SummaryMongoPump {

    private final Map<String, AppAnalytics> result = new HashMap<>();

    private final RoutingContext event;

    public SummaryMongoPump(RoutingContext event){
        this.event = event;
    }

    public void error() {
        event.response().setStatusCode(405);
        event.response().end();
    }

    public void end() {
        JSONMapper mapper = new JSONMapper();
        event.response().putHeader("content-type", "application/json");
        List<AppAnalytics> values = new ArrayList<>(result.values());
        event.response().end(mapper.toJson(values));
    }

    public void pump(JsonObject e) {
        int m = e.getInteger(AppAnalytics.MONTH);
        int y = e.getInteger(AppAnalytics.YEAR);
        int d = e.getInteger(AppAnalytics.DAY);
        String model = e.getString(AppAnalytics.AI_MODEL);
        double tokens = e.getInteger(AppAnalytics.TOKENS);
        String key = String.format("%d-%d-%d-%s",d, m, y, model);
        if (!result.containsKey(key)) {
            AppAnalytics a = new AppAnalytics()
                    .setDay(d)
                    .setYear(y)
                    .setMonth(m)
                    .setModel(model);
            a.setId(key);
            result.put(key, a);
        }
        AppAnalytics a = result.get(key);
        a.incCount();
        a.incTokens(tokens);
    }
}