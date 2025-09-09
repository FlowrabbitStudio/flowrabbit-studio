package ai.flowrabbit.bus;

import ai.flowrabbit.model.AppEvent;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConnectionCheckerVehicle extends AbstractVerticle {

    public static final String TOPIC = "RequestMonitorVehicle";

    private static Logger logger = LoggerFactory.getLogger(ConnectionCheckerVehicle.class);


    private final String testURL = "google.com";

    private final Vertx vertx;

    private static ConnectionCheckerVehicle instance;

    private long timerID;

    private long flushInterval = 60 * 1000;

    public ConnectionCheckerVehicle(Vertx vertx) {
        this.vertx = vertx;
        DeploymentOptions options = new DeploymentOptions().setWorker(true);
        vertx.deployVerticle(this, options, h ->{
            if(h.succeeded()) {
                logger.error("ConnectionCheckerVehicle() > instance created");
                timerID = vertx.setPeriodic(flushInterval,  l ->{
                    this.checkURLs(this.testURL, null);
                });
            } else {
                logger.error("constructor() > Could not deploy ConnectionCheckerVehicle");
            }
        });
    }

    public static synchronized ConnectionCheckerVehicle start(Vertx vertx) {
        if (instance == null) {
            instance = new ConnectionCheckerVehicle(vertx);
        }
        return instance;
    }

    public static ConnectionCheckerVehicle getInstance() {
        return instance;
    }

    @Override
    public void stop() {
        this.logger.info("stop() > enter");
        vertx.cancelTimer(timerID);
        this.logger.debug("stop() > exit");
    }

    public void checkURLs(String testURL, Handler<Boolean> handler) {
        this.logger.info("checkURLs() > enter >" + testURL);
        try {
            WebClientOptions options = new WebClientOptions();
            options.setTrustAll(true);
            options.setConnectTimeout(2000);
            WebClient client = WebClient.create(vertx, options);

            client.get(80, testURL, "").timeout(2000).send(ar -> {
                if (ar.succeeded()) {
                    HttpResponse<Buffer> response = ar.result();
                    if (response.statusCode() != 200) {
                        sendError(testURL);
                        if (handler != null) {
                            handler.handle(false);
                        }
                    } else {
                        this.logger.error("checkURLs() > enter > Success > url: " + testURL);
                        if (handler != null) {
                            handler.handle(true);
                        }
                    }
                } else {
                    sendError(testURL);
                    if (handler != null) {
                        handler.handle(false);
                    }
                }
            });
        } catch (Exception e) {
            sendError(testURL);
            if (handler != null) {
                handler.handle(false);
            }
        }
    }

    private void sendError (String testURL) {
        this.logger.error("checkURLs() > Error > url:" + testURL);
        AppEvent.send(
            this.vertx.eventBus(),
            "system",
            AppEvent.TYPE_CONNECTION_CHECK_ERROR,
            testURL
        );
    }


}
