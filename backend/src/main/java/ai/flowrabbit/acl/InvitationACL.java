package ai.flowrabbit.acl;

import ai.flowrabbit.services.TokenService;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;
import ai.flowrabbit.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class InvitationACL implements Acl{


	private Logger logger = LoggerFactory.getLogger(InvitationACL.class);

	public InvitationACL() {

	}

	@Override
	public void canCreate(User user, RoutingContext event,Handler<Boolean> handler) {
		canTest(user, event, handler);
	}

	@Override
	public void canRead(User user, RoutingContext event, Handler<Boolean> handler) { 
		canTest(user, event, handler);
	}

	@Override
	public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
		canTest(user, event, handler);
	}

	@Override
	public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
		canTest(user, event, handler);
	}
	
	public void canTest(User user, RoutingContext event, Handler<Boolean> handler){
		String appID  = event.request().getParam("appID");
		String hash = event.request().getParam("hash");

		if (appID == null) {
			logger.error("canTest() > no app id");
			handler.handle(false);
		}

		User hashUser = TokenService.getUser(hash);
		if (hashUser.hasClaim()) {
			checkClaim(hashUser, appID, 0, handler);
		} else {
			handler.handle(false);
		}
	}

	public void checkClaim(User user, String appID, int permission, Handler<Boolean> handler) {
		if (user.getAppID().equals(appID) && user.getAppPermission() >= permission) {
			handler.handle(true);
		} else {
			handler.handle(false);
		}
	}

}
