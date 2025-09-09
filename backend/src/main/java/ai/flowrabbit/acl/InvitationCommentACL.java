package ai.flowrabbit.acl;

import ai.flowrabbit.services.TokenService;
import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import ai.flowrabbit.model.AppPart;
import ai.flowrabbit.model.Comment;
import ai.flowrabbit.model.Invitation;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;

public class InvitationCommentACL extends MongoAcl implements Acl{
	

	private final String comment_db;	
	
	public InvitationCommentACL(MongoClient client){
		super(client);
		comment_db = DB.getTable(Comment.class);
	}


	public boolean checkClaim(RoutingContext event, String appID, int permission) {
		String hash = event.request().getParam("hash");
		User hashUser = TokenService.getUser(hash);
		if (hashUser.getAppID().equals(appID) && hashUser.getAppPermission() >= permission) {
			return true;
		}
		return false;
	}
	
	@Override
	public void canCreate(User user, RoutingContext event, Handler<Boolean> handler) {
		canRead(user, event, handler);
	}


	@Override
	public void canRead(User user, RoutingContext event, Handler<Boolean> handler) {
		String appID = event.request().params().get("appID");
		if (checkClaim(event, appID, Invitation.READ)) {
			handler.handle(true);
		} else {
			handler.handle(true);
		}
	}

	@Override
	public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
		String appID = event.request().params().get("appID");
		String commentID = event.request().params().get("commentID");

		if (checkClaim(event, appID, Invitation.TEST)) {
			client.count(comment_db, AppPart.isAuthor(user.getId(), commentID), res2->{
				assertOne(res2, handler, event, user);
			});
		} else {
			handler.handle(false);
		}
	}

	@Override
	public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
		canWrite(user, event, handler);
	}
	


}
