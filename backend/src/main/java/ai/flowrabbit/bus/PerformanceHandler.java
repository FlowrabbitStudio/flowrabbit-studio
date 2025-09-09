package ai.flowrabbit.bus;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.lunarmare.util.MonitoringVerticle;
import ai.flowrabbit.model.PerformanceEvent;
import ai.flowrabbit.util.DB;

public class PerformanceHandler implements Handler<Message<JsonObject>> {

	private Logger logger = LoggerFactory.getLogger(MailHandler.class);
	
	private MongoClient client;
	
	private String table = DB.getTable(PerformanceEvent.class);
	
	private static PerformanceHandler instance;
	
	public static synchronized PerformanceHandler start(Vertx vertx, MongoClient client){
		if(instance == null){
			instance =new PerformanceHandler(vertx, client);
		}
		return instance;
	}
	
	
	private PerformanceHandler(Vertx vertx, MongoClient client){
		
		this.client = client;
		
		MonitoringVerticle monitor = new MonitoringVerticle();
		DeploymentOptions options = new DeploymentOptions().setWorker(true);
		vertx.deployVerticle(monitor,options, h ->{
			if(h.succeeded()){
				vertx.eventBus().consumer(MonitoringVerticle.TOPIC, this);
			} else {
				logger.error("constructor() > Could not deploy MonitoringVerticle");
			}
		});
	}
	
	@Override
	public void handle(Message<JsonObject> event) {
		JsonObject msg = event.body();
		logger.info("onMessage() > CPU : " + msg.getDouble(MonitoringVerticle.SYSTEM_CPU_LOAD) + " > Java : " + msg.getDouble(MonitoringVerticle.PROCESS_CPU_LOAD));
		
		client.insert(table, msg, res ->{
			if(!res.succeeded()){
				logger.error("handle() > Could not write to mongo");
			}
		});
	}

}
