package ai.flowrabbit.rest;

import ai.flowrabbit.model.User;
import ai.flowrabbit.model.UserAppData;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserAppDataRest extends MongoREST {

    private static Logger logger = LoggerFactory.getLogger(UserAppDataRest.class);

    public UserAppDataRest(MongoClient db) {
        super(db, UserAppData.class);
        this.setIdParameter("appID");
    }

    public Handler<RoutingContext> findByAppAndUser() {
        return event -> findByAppAndUser(event);
    }

    private void findByAppAndUser(RoutingContext event) {

        User user = getUser(event);
        if (!isValidUser(event, user)) {
            logger.error("findByAppAndUser() > wrong token");
            returnError(event, 500);
            return;
        }

        logger.info("findByAppAndUser() > user: {} > app: {}", user.getAppID(), user.getId());
        this.mongo.findOne(table, UserAppData.findByAppAndUser(user.getAppID(), user.getId()), null, res -> {
           if (res.succeeded()) {
               JsonObject data = res.result();
               System.out.println("Found " + data);
               if (data == null) {
                   data = UserAppData.createInstance(user);
               }
               if (!data.containsKey(UserAppData.FIELD_PAYLOAD)) {
                   logger.error("findByAppAndUser() Messed up data", res.cause());
                   data.put(UserAppData.FIELD_PAYLOAD, new JsonObject());
               }
               returnJson(event, data.getJsonObject(UserAppData.FIELD_PAYLOAD));
           } else {
               returnError(event, 500);
               logger.error("findByAppAndUser() can't find in mongo", res.cause());
           }
        });
    }

    public Handler<RoutingContext> updateByAppAndUser() {
        return event -> updateByAppAndUser(event);
    }

    private void updateByAppAndUser(RoutingContext event) {

        User user = getUser(event);
        if (!isValidUser(event, user)) {
            logger.error("updateByAppAndUser() > wrong token");
            returnError(event, 500);
            return;
        }

        JsonObject payload = getJson(event);
        if (payload == null) {
            logger.error("updateByAppAndUser() > wrong token");
            returnError(event, 500);
            return;
        }

        this.mongo.findOne(table, UserAppData.findByAppAndUser(user.getAppID(), user.getId()), null, res -> {
            if (res.succeeded()) {
                JsonObject data = res.result();
                if (data == null) {
                    logger.error("updateByAppAndUser() > user: {} > app: {}", user.getAppID(), user.getId());
                    data = UserAppData.createInstance(user);
                    data.put(UserAppData.FIELD_PAYLOAD, payload);
                    this.mongo.save(table, data, saved -> {

                        if (saved.succeeded()) {
                            logger.error("updateByAppAndUser() > new {} in {}", saved.result(), this.table);
                            returnJson(event, payload);
                        } else {
                            returnError(event, 500);
                            logger.error("updateByAppAndUser() can't create new", res.cause());
                        }
                    });
                } else {
                    data.put(UserAppData.FIELD_PAYLOAD, payload);
                    data.put(UserAppData.FIELD_LAST_UPDATE, System.currentTimeMillis());
                    this.mongo.save(table, data, saved -> {
                        if (saved.succeeded()) {
                            returnJson(event, payload);
                        } else {
                            returnError(event, 500);
                            logger.error("updateByAppAndUser() can't update", res.cause());
                        }
                    });
                }
            } else {
                returnError(event, 500);
                logger.error("findByAppAndUser() can't find in mongo", res.cause());
            }
        });
    }

    private boolean isValidUser(RoutingContext event, User user) {
        if (!user.hasClaim()) {
            returnError(event, "wrong.token");
            return false;
        }

        if (user.getAppID() == null) {
            returnError(event, "wrong.token");
            return false;
        }

        if (user.getId() == null) {
            returnError(event, "wrong.token");
            return false;
        }
        return true;
    }
}
