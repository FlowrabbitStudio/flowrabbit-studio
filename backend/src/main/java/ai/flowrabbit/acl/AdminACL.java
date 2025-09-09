package ai.flowrabbit.acl;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.model.User;

public class AdminACL implements Acl{
	
	private Logger logger = LoggerFactory.getLogger(AdminACL.class);
	

	@Override
	public void canCreate(User user, RoutingContext event,Handler<Boolean> handler) {
		isAdmin(user, event, handler);		
	}

	@Override
	public void canRead(User user, RoutingContext event,Handler<Boolean> handler) {
		isAdmin(user, event, handler);		
	}

	@Override
	public void canWrite(User user, RoutingContext event,Handler<Boolean> handler) {
		isAdmin(user, event, handler);		
	}

	@Override
	public void canDelete(User user, RoutingContext event,Handler<Boolean> handler) {
		isAdmin(user, event, handler);
	}
	

	public void isAdmin(User user, RoutingContext event,Handler<Boolean> handler) {
		if(user.hasRole(User.ADMIN)){
			handler.handle(true);
		} else {
			logger.error("isAdmin() > The user "+ user + " tried to read protected resource "+ event.request().path());
			event.response().setStatusCode(404).end();
		}
	}

}
