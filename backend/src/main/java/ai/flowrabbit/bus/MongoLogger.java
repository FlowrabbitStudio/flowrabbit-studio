package ai.flowrabbit.bus;

import ai.flowrabbit.model.Log;
import ai.flowrabbit.model.User;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;


public class MongoLogger {


    public static void error(RoutingContext event, User user, Class cls, String method, String message) {
        error(event.vertx().eventBus(), user, cls, method, message);
    }

    public static void error(EventBus bus, User user, Class cls, String method, String message){

        JsonObject busMessage = new JsonObject();
        busMessage.put(Log.FIELD_CREATED, System.currentTimeMillis());
        busMessage.put(Log.FIELD_LEVEL, 0);
        busMessage.put(Log.FIELD_METHOD, method);
        busMessage.put(Log.FIELD_CLS, cls.getSimpleName());
        busMessage.put(Log.FIELD_MESSAGE, message);
        busMessage.put(Log.FIELD_USER, user.getEmail());

        bus.send(MongoLoggerHandler.TOPIC, busMessage);

    }
}
