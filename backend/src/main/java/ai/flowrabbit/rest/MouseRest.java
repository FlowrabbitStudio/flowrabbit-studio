package ai.flowrabbit.rest;

import ai.flowrabbit.acl.EventAcl;
import ai.flowrabbit.model.Mouse;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class MouseRest extends MongoREST {

	public MouseRest(MongoClient db) {
		super(db, Mouse.class);
		setACL(new EventAcl(db));
	}

	@Override
	protected void beforeCreate(RoutingContext event, JsonObject json){
		String appID = getId(event, "appID");
		json.put("appID", appID);
	}
}
