package ai.flowrabbit.bus;

import ai.flowrabbit.model.RequestEvent;
import ai.flowrabbit.util.DB;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RequestMonitorVehicle extends AbstractVerticle implements Handler<Message<JsonObject>> {

    public static final String TOPIC = "RequestMonitorVehicle";

    private static Logger logger = LoggerFactory.getLogger(RequestMonitorVehicle.class);

    private final MongoClient client;

    private final String table;

    private final Vertx vertx;

    private static RequestMonitorVehicle instance;

    private long timerID;

    private long flushInterval = 60 * 1000;

    private RequestSummary currentSummary;

    public static synchronized RequestMonitorVehicle start(Vertx vertx, MongoClient client){
        if(instance == null){
            instance = new RequestMonitorVehicle(vertx, client);
        }
        return instance;
    }

    public static void reset() {
        instance = null;
    }

    public static RequestMonitorVehicle getInstance() {
        return instance;
    }

    private RequestMonitorVehicle (Vertx vertx, MongoClient client) {
         this.table = DB.getTable(RequestEvent.class);
         this.client = client;
         this.vertx = vertx;

         DeploymentOptions options = new DeploymentOptions().setWorker(true);
         vertx.deployVerticle(this, options, h ->{
            if(h.succeeded()) {
                logger.info("RequestMonitorVehicle() > instance created");
                vertx.eventBus().consumer(TOPIC, this);
                timerID = vertx.setPeriodic(flushInterval,  l ->{
                    this.flushToDB();
                });
            } else {
                logger.error("constructor() > Could not deploy RequestMonitor");
            }
        });
    }

    @Override
    public void stop() {
        logger.info("stop() > enter");
        vertx.cancelTimer(timerID);
        logger.debug("stop() > exit");
    }


    public void flushToDB() {
        logger.info("flushToDB() > enter");
        if (this.currentSummary != null) {
            long count = this.currentSummary.count;
            if (count == 0) {
                count = 1;
            }
            JsonObject event = new JsonObject()
                    .put(RequestEvent.CREATED, System.currentTimeMillis())
                    .put(RequestEvent.MAX, this.currentSummary.max)
                    .put(RequestEvent.MIN, this.currentSummary.min)
                    .put(RequestEvent.COUNT, this.currentSummary.count)
                    .put(RequestEvent.SUM, this.currentSummary.sum)
                    .put(RequestEvent.MEAN, this.currentSummary.sum / count);
            this.client.insert(this.table, event, res -> {
               if (res.succeeded())  {
                   logger.info("flushToDB() > exit: Success");
               } else {
                   logger.error("flushToDB() > exit: Could not save", res.cause());
               }
            });
        }

        this.currentSummary = new RequestSummary();
    }

    @Override
    public void handle(Message<JsonObject> msg) {
        JsonObject body = msg.body();
        logger.info("handle() > enter: " + body);

        if (currentSummary == null) {
            this.currentSummary = new RequestSummary();
        }

        currentSummary.count ++;
        currentSummary.sum += body.getLong(RequestEvent.DURATION);
        currentSummary.max = Math.max(currentSummary.max, body.getLong(RequestEvent.DURATION));
        currentSummary.min = Math.min(currentSummary.min, body.getLong(RequestEvent.DURATION));

    }

    private class RequestSummary {
        private long max, min, count, sum;
    }
}
