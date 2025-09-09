package ai.flowrabbit.rest;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.StaffACL;
import ai.flowrabbit.model.Notification;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.Domain;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class NotificationREST extends MongoREST{
	
	private Logger logger = LoggerFactory.getLogger(NotificationREST.class);
		
	public NotificationREST(MongoClient db) {
		super(db, Notification.class);
		this.setACL(new StaffACL());
	}
	
	public void findByUser(RoutingContext event) {
		logger.info("findByUser() > enter");
		User user = getUser(event);
		Domain d = Domain.get(event);
		mongo.find(table, Notification.findByUserOrPublic(user.getId(), d.getUrl()), res -> {
			if(res.succeeded()){
				List<JsonObject> json = res.result();
				if(json!=null){
					returnJson(event, json);
				} else {
					returnError(event, 404);
				}
			} else {
				returnError(event, 404);
			}
		});
	}
	
}
