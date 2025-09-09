package ai.flowrabbit.bus;

import ai.flowrabbit.lunarmare.Model;
import ai.flowrabbit.lunarmare.ModelFactory;
import ai.flowrabbit.model.Log;
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

public class MongoLoggerHandler extends AbstractVerticle implements Handler<Message<JsonObject>> {

    public static final String TOPIC = "ErrorHandlerVehicle";

    private static Logger logger = LoggerFactory.getLogger(MongoLoggerHandler.class);

    private final MongoClient client;

    private final String table;

    private static MongoLoggerHandler instance;

    private Model validator;

    public static synchronized MongoLoggerHandler start(Vertx vertx, MongoClient client) {
        if (instance == null) {
            instance = new MongoLoggerHandler(vertx, client);
        }
        return instance;
    }
    public static void reset() {
        instance = null;
    }


    public static MongoLoggerHandler getInstance() {
        return instance;
    }

    private MongoLoggerHandler(Vertx vertx, MongoClient client) {
        this.table = DB.getTable(Log.class);
        this.client = client;
        this.vertx = vertx;

        this.validator = new ModelFactory().create("MailMessage")
                .addString(Log.FIELD_CLS)
                .addString(Log.FIELD_MESSAGE)
                .addString(Log.FIELD_METHOD)
                .addString(Log.FIELD_USER)
                .addInt(Log.FIELD_LEVEL)
                .addLong(Log.FIELD_CREATED)
                .build();


        DeploymentOptions options = new DeploymentOptions().setWorker(true);
        vertx.deployVerticle(this, options, h -> {
            if (h.succeeded()) {
                logger.info("MongoLogger() > instance created");
                vertx.eventBus().consumer(TOPIC, this);
            } else {
                logger.error("constructor() > Could not deploy MongoLogger");
            }
        });
    }

    @Override
    public void handle(Message<JsonObject> msg) {
        logger.info("handle() > enter");

        JsonObject body = msg.body();
        if (validator.isValid(body)) {
            client.insert(table, body, res->{
                logger.debug("handle() > saved");
            });
        } else {
            logger.error("handle() > Wrong message {}", body.encodePrettily());
        }


    }
}
