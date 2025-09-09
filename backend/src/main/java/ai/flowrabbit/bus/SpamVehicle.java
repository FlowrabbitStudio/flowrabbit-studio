package ai.flowrabbit.bus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

/**
 * This Vehicle will start sending a lot off spam to our users
 * 
 * @author Klaus
 *
 */
public class SpamVehicle extends AbstractVerticle {
	
	private final Logger logger = LoggerFactory.getLogger(SpamVehicle.class);

	private MongoClient client;
	
	private final JsonObject config;
	
	public SpamVehicle(MongoClient client, JsonObject config){
		this.client = client;
		this.config = config;
	}
	
	@Override
	public void start() {
		this.logger.info("start() > enter");
		
		/**
		 * Set timeout of 1 day 
		 */
		
		/**
		 * 1) Write where have you been
		 */
		
		/**
		 * 2) Notifications
		 * 
		 * a) Tests
		 * 
		 * b) Changes in one of my apps ( unlikely)
		 */
		
		/**
		 * 3) 2nd Welcome news letter
		 */
		
		/**
		 * Payment Reminders
		 */

		this.logger.info("start() > exit");
	}
}