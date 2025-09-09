package ai.flowrabbit.admin;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;

public class Setup {
	
	private Logger logger = LoggerFactory.getLogger(Setup.class);
	
	private MongoClient client;

	private JsonObject config;
	
	private final String user_db;
	
	private static Setup instance;
	
	public static synchronized Setup instance(JsonObject config, MongoClient client){
		if(instance == null){
			instance  =new Setup(config, client);
			instance.run();
		}
		return instance;
	}
	
	private Setup(JsonObject config, MongoClient client) {
		this.client = client;
		this.config = config;
		this.user_db = DB.getTable(User.class);
	}
	
	private void run(){
		logger.info("run() > enter");
		
		if(config.containsKey("admin")){
			String admin = config.getString("admin");
			client.count(user_db, User.findByEmail(admin), res->{
				if(res.succeeded() && res.result()== 0l){
					logger.info("run() > create admin '" + admin +"'");
					JsonObject user = new JsonObject()
						.put("email", admin)
						.put("role", User.ADMIN);
					
					client.save(user_db, user, saved->{
						if(saved.succeeded()){
							logger.info("run() >Created admin...");
						} else {
							logger.error("run() > Could not save amdin ", saved.cause());
						}
					});
				}
			});
		}
		logger.info("run() > exit");	
	}

}
