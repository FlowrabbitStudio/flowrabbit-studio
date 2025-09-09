package ai.flowrabbit.acl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class ExamplesAcl extends MongoAcl implements Acl {
	
	private final String app_db;
	
	private Logger logger = LoggerFactory.getLogger(AppAcl.class);

	public ExamplesAcl(MongoClient client) {
		super(client, "appID");
		this.app_db = DB.getTable(App.class);
	}

	@Override
	public void canCreate(User user, RoutingContext event, Handler<Boolean> handler) {
		logger.error("canCreate() > The user " + user  +" tried to create an examples!");
		handler.handle(false);
	}

	@Override
	public void canRead(User user, RoutingContext event, Handler<Boolean> handler) {
		String appID = getId(event);	
		client.count(app_db, App.findPublicByID(appID), isPublic ->{
			assertOne(isPublic, handler, event, user);
		});
	}

	@Override
	public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
		logger.error("canWrite() > The user " + user  +" tried to write an examples!");
		handler.handle(false);
		
	}

	@Override
	public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
		logger.error("canDelete() > The user " + user  +" tried to write an examples!");
		handler.handle(false);
		
	}

}
