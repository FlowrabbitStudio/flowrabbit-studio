package ai.flowrabbit.bus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.AppPart;
import ai.flowrabbit.util.DB;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

/**
 * Listens to App livecycle events and set for now the app dirty.
 * 
 * @author Klaus
 *
 */
public class DirtyHandler implements Handler<Message<JsonObject>>{

	private static Logger logger = LoggerFactory.getLogger(DirtyHandler.class);

	private final MongoClient client;
	
	
	public DirtyHandler(Vertx vertx, MongoClient client) {
		this.client = client;
		EventBus eb = vertx.eventBus();
		eb.consumer(App.BUS_APP_UPDATE, this);	
		eb.consumer(AppPart.BUS_APPPART_UPDATE, this);	
	}


	public static DirtyHandler start(Vertx vertx, MongoClient client	){
		return new DirtyHandler(vertx, client);
	}


	@Override
	public void handle(Message<JsonObject> message) {
		JsonObject json = message.body();
		String appID = json.getString("appID");
		setDirty(appID);
	}

	private void setDirty(String appID) {
		logger.debug("setDirty() > " + appID);
		
		JsonObject update = new JsonObject()
				.put("$set", new JsonObject().put("isDirty", true));
	
		client.updateCollection(DB.getTable(App.class), App.findById(appID), update, res -> {
			if (res.failed()){
				logger.error("setDirty() > Could not set dirty" + appID);
			}
		});
	}
}
