package ai.flowrabbit.acl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Team;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;

public class AppAcl extends MongoAcl implements Acl{
	
	private final String app_db, team_db;

	private boolean allowPubTokens = true;
	
	private Logger logger = LoggerFactory.getLogger(AppAcl.class);
	
	public AppAcl(MongoClient client){
		this(client, "appID");
	}

	public AppAcl(MongoClient client, boolean allowPubTokens){
		this(client, "appID");
		this.allowPubTokens = allowPubTokens;
	}
	
	public AppAcl(MongoClient client, String id){
		super(client, id);
		this.app_db = DB.getTable(App.class);
		this.team_db = DB.getTable(Team.class);
	}

	
	@Override
	public void canCreate(User user, RoutingContext event, Handler<Boolean> handler) {
		if(user.hasRole(User.USER) || user.hasRole(User.ADMIN)){
			handler.handle(true);
		} else {
			handler.handle(false);
		}
	}

	@Override
	public void canRead(User user, RoutingContext event, Handler<Boolean> handler) {
		String appID = getId(event);
		canRead(user, event, appID, handler );
	}

	public void canRead(User user, RoutingContext event, String appID, Handler<Boolean> handler) {
		// this logic is wrong
		if (hasClaim(user)) {
			if (!isAllowPubTokens(user)) {
				logger.error("canRead() > User " + user + " tried to access with pub token");
				handler.handle(false);
				return;
			}
			checkClaim(user, appID, Acl.READ, handler);
		} else {
			canReadACL(user, event, appID, handler);
		}
	}

	private boolean isAllowPubTokens(User user) {
		if (user.isPubClaim()) {
			return this.allowPubTokens;
		}
		return true;
	};

	private boolean hasClaim(User user) {
		return user.hasClaim();
	}

	private void canReadACL(User user, RoutingContext event, String appID, Handler<Boolean> handler) {
		/**
		 * First check if there is a Team entry, otherwise check if app is public
		 */
		client.count(team_db, Team.canRead(user, appID), res -> {
			if (res.succeeded() && res.result() >= 1l) {
				if (res.result() > 1) {
					logger.error("canRead() > count bigger 1");
				}
				handler.handle(true);
			} else {
				logger.error("canRead() > Check Public because > success: " + res.succeeded() + " >> count:" + res.result());
				client.count(app_db, App.findPublicByID(appID), isPublic -> {
					assertOne(isPublic, handler, event, user);
				});
			}
		});
	}

	@Override
	public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
		String appID = getId(event);
		if (hasClaim(user)) {
			if (!isAllowPubTokens(user)) {
				logger.error("canWrite() > User " + user + " tried to access with pub token");
				handler.handle(false);
				return;
			}
			checkClaim(user, appID, Acl.WRITE, handler);
		} else {
			client.count(team_db, Team.canWrite(user, appID), res->{
				assertOne(res, handler, event, user);
			});
		}
	}

	@Override 
	public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
		String id = getId(event);
		client.count(team_db, Team.isOwner(user, id),  res->{
			assertOne(res, handler, event, user);
		});
	}
}
