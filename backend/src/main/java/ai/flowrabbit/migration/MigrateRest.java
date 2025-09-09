package ai.flowrabbit.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class MigrateRest {
	
	private Logger logger = LoggerFactory.getLogger(MigrateRest.class);
	
	private MongoClient mongo;
	
	public MigrateRest(MongoClient mongo){
		this.mongo = mongo;
	}
	
	public Handler<RoutingContext> run() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				logger.info("handle() > enter");
				
				//MigrateTeam acl = new MigrateTeam(mongo);
				//acl.run();
				
				event.response().end("Nothing to run");
				logger.info("handle() > exit");
			}
		};
	}

}
