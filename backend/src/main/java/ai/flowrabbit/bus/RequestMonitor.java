package ai.flowrabbit.bus;

import ai.flowrabbit.model.RequestEvent;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RequestMonitor {

    private Logger logger = LoggerFactory.getLogger(MailHandler.class);

    public void logRequest(RoutingContext routingContext) {


        long start = System.currentTimeMillis();

        routingContext.next();

        long end = System.currentTimeMillis();

        JsonObject msg = new JsonObject()
                .put(RequestEvent.PATH, routingContext.request().path())
                .put(RequestEvent.CREATED, start)
                .put(RequestEvent.DURATION, end - start);

        routingContext
                .vertx()
                .eventBus()
                .publish(RequestMonitorVehicle.TOPIC, msg);
    }
}
