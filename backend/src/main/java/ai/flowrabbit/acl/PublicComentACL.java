package ai.flowrabbit.acl;

import ai.flowrabbit.model.AppPart;
import ai.flowrabbit.model.Comment;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class PublicComentACL extends MongoAcl implements Acl{
	
	private final String comment_db;	
	
	public PublicComentACL(MongoClient client){
		super(client);
		comment_db = DB.getTable(Comment.class);
	}

	
	@Override
	public void canCreate(User user, RoutingContext event, Handler<Boolean> handler) {
		if(user.hasRole(User.USER)){
			handler.handle(true);
		} else{
			handler.handle(false);
		}
	}


	@Override
	public void canRead(User user, RoutingContext event, Handler<Boolean> handler) {
		handler.handle(true);
	}

	

	@Override
	public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
		String commentID = event.request().params().get("commentID");
		
		/**
		 * now check if the user is the author
		 */
		client.count(comment_db, AppPart.isAuthor(user.getId(), commentID), res2->{
			assertOne(res2, handler, event, user);
		});
	}



	@Override
	public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
		canWrite(user, event, handler);
	}
	


}
