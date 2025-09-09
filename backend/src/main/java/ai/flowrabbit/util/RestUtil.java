package ai.flowrabbit.util;

import ai.flowrabbit.model.App;
import ai.flowrabbit.services.PreviewService;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class RestUtil {

    private static Logger logger = LoggerFactory.getLogger(RestUtil.class);

    private static final PreviewService preview = new PreviewService();

    public static void findAppByIDs(MongoClient mongo, RoutingContext event, JsonArray appIDs) {
        logger.info("findAppByIDs() > enter: # " + appIDs.size());
        String summary = event.request().getParam("summary");

        if ("true".equals(summary)) {
            /*
             * Just return the summary in here
             */
            findAppSummariesByIDs(mongo, appIDs, result -> {
                if (result != null) {
                    event.response().end(result.encode());
                } else {
                    logger.error("findAppByIDs() > Mongo Error");
                    returnError(event, 404);
                }
            });
        } else {
            findFullAppsByIDs(mongo, event, appIDs);
        }

    }

    private static void findFullAppsByIDs(MongoClient mongo, RoutingContext event, JsonArray appIDs) {
        String appDB = DB.getTable(App.class);
        mongo.find(appDB, App.findByIDS(appIDs), appRes -> {

            if (appRes.succeeded()) {
                long dbDone = System.currentTimeMillis();

                List<JsonObject> apps = appRes.result();
                JsonArray result = new JsonArray();
                for (JsonObject app : apps) {
                    /*
                     * Sometimes the app might be marked for deletion, but it is still not deleted!
                     */
                    if (!App.isDeleted(app)) {
                        /*
                         * Filter out all not needed widgets etc to speed up loading
                         */
                        app = preview.create(app);
                        app = cleanJson(app);
                        result.add(app);
                    } else {
                        logger.info("findAppByIDs() > deleted app " + app);
                    }
                }
                event.response().end(result.encode());

            } else {
                logger.error("findAppByIDs() > Mongo Error : " + appRes.cause().getMessage());
                returnError(event, 404);
            }
        });
    }

    public static void findAppSummariesByIDs(MongoClient mongo, JsonArray appIDs, Handler<JsonArray> handler) {
        String appDB = DB.getTable(App.class);
        FindOptions options = new FindOptions().setFields(App.summaryFields());
        mongo.findWithOptions(appDB, App.findByIDS(appIDs), options, appRes -> {
            if (appRes.succeeded()) {
                List<JsonObject> apps = appRes.result();
                JsonArray result = new JsonArray();
                for (JsonObject app : apps) {
                    /*
                     * Sometimes the app might be marked for deletion, but it is still not deleted!
                     */
                    if (!App.isDeleted(app)) {
                        /*
                         * Filter out all not needed widgets etc to speed up loading
                         */
                        app = preview.create(app);
                        app = cleanJson(app);
                        result.add(app);
                    }
                }

                handler.handle(result);

            } else {
                logger.error("findAppSummariesByIDs() > Mongo Error {}", appRes.cause().getMessage());
                handler.handle(null);
            }
        });
    }

    private static void returnError(RoutingContext event, int code) {
        event.response().setStatusCode(code);
        event.response().end();
    }

    private static void returnJson(RoutingContext event, JsonObject result) {
        event.response().putHeader("content-type", "application/json");
        event.response().end(result.encodePrettily());
    }

    private static JsonObject cleanJson(JsonObject json) {
        json.remove("users");
        json.remove("invitations");
        if (json.containsKey("_id")) {
            json.put("id", json.getString("_id"));
        }
        return json;
    }
}
