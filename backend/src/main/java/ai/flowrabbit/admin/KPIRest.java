package ai.flowrabbit.admin;

import java.util.List;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.StaffACL;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.util.REST;

public class KPIRest extends REST{
	
	private final StaffACL acl = new StaffACL();
	
	private final MongoClient mongo;
	
	private final Logger logger = LoggerFactory.getLogger(KPIRest.class);


	public KPIRest(MongoClient db) {	 
		this.mongo = db;	
	}
	

	public Handler<RoutingContext> get() {
		return event -> get(event);
	}

	
	private void get(RoutingContext event) {
		logger.info("get() > enter");
	
		this.acl.isAdmin(getUser(event), event, allowed->{
			if(allowed){
				
				JsonArray result = new JsonArray();
				mongo.getCollections(collections->{
					if(collections.succeeded()){
						
						List<String> names = collections.result();
						count(event, names, result);
						
					} else {
						returnError(event, 404);
					}				
				});
				
			} 
		});
		
	}
	
	private void count(RoutingContext event, List<String> names, JsonArray result ){
		if(names.isEmpty()){
			returnJson(event, result);
		} else {
			String name = names.remove(0);
			mongo.count(name, Model.all(), count->{
				if(count.succeeded()){
					result.add(new JsonObject()
						.put("name", name)
						.put("count",count.result()));
					count(event, names, result);
				} else {
					returnError(event, 405);
				}
			});
		}
	}
}
