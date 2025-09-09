package ai.flowrabbit.acl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.model.User;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

public class StaffACL implements Acl{
		
		private Logger logger = LoggerFactory.getLogger(StaffACL.class);
		

		@Override
		public void canCreate(User user, RoutingContext event,Handler<Boolean> handler) {
			isStaff(user, event, handler);		
		}

		@Override
		public void canRead(User user, RoutingContext event,Handler<Boolean> handler) {
			isStaff(user, event, handler);		
		}

		@Override
		public void canWrite(User user, RoutingContext event,Handler<Boolean> handler) {
			isStaff(user, event, handler);		
		}

		@Override
		public void canDelete(User user, RoutingContext event,Handler<Boolean> handler) {
			isStaff(user, event, handler);
		}
		
		
		public void isStaff(User user, RoutingContext event,Handler<Boolean> handler) {
			if(user.hasRole(User.STAFF)){
				handler.handle(true);
			} else {
				logger.error("isStaff() > The user "+ user + " tried to read protected resource "+ event.request().path());
				event.response().setStatusCode(404).end();
			}
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
