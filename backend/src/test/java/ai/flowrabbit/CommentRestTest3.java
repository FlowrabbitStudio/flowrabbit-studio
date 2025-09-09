package ai.flowrabbit;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Comment;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.Map;

@RunWith(VertxUnitRunner.class)

public class CommentRestTest3 extends BaseTestCase {


	@Test
	public void test(TestContext context){
		log("test", "enter");
		
		cleanUp();
		
		deploy(new Main(), context);
	
		postUser("klaus", context);
		assertLogin(context, "klaus@quant-ux.de", "123456789");
		App app = postApp("klaus_app_public", true, context);
		
		Map<Object, String> invitations = getInvitations(app);
		String hash = invitations.get(1);
		
		assertLogin(context, "klaus@quant-ux.de", "123456789");
		Comment klausComment = postComment(app, hash, "ScreenComment", "klaus 1", "s2", context);
		postComment(app, hash, "ScreenComment", "klaus 2", "s2", context);
		postComment(app, hash, "ScreenComment", "klaus 3", "s2", context);
		JsonArray comments = getList("/rest/comments/hash/" +hash+"/" + app.getId() + "/s2/ScreenComment.json"); 
		context.assertEquals(3, comments.size());
		
		
		logout();
		Comment guestComment = postComment(app, hash, "ScreenComment", "Guest", "s2", context);


		assertLogin(context, "klaus@quant-ux.de", "123456789");

		comments = getList("/rest/comments/hash/" +hash+"/" + app.getId() + "/s2/ScreenComment.json");
		context.assertEquals(4, comments.size());

		deleteComment(guestComment, context);
		comments = getList("/rest/comments/hash/" +hash+"/" + app.getId() + "/s2/ScreenComment.json");
		context.assertEquals(3, comments.size());

		
		log("test", "exit");
	}
	

	public void assertComments(String url, int x,  TestContext context ){
		JsonArray comments = getList(url); 
		context.assertEquals(x, comments.size());
		log("assertComments", "" + comments);
		
		for(int i=0; i< comments.size(); i++){
			JsonObject c = comments.getJsonObject(0);
			context.assertTrue(c.containsKey("user"));
		}
	}
	
	public void assertCommentsError(String url, TestContext context ){
		JsonArray comments = getList(url); 
		context.assertEquals(404, comments.getInteger(0));
		log("assertCommentsError", "" + comments);
	}
	
	public Comment deleteComment(String hash, Comment comment, TestContext context ){

		JsonObject result = delete("/rest/comments/hash/" + hash +"/"+ comment.getAppID() + "/" + comment.getId() + ".json");
		log("deleteComment", "" + result);
		
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("errors"));

		return comment;
	}
	
	
	
	public void deleteCommentError(String hash, Comment comment, TestContext context ){

		JsonObject result = delete("/rest/comments/hash/" + hash +"/" + comment.getAppID() + "/" + comment.getId() + ".json");
		log("deleteCommentError", "" + result);
		
		context.assertTrue(result.containsKey("error") || result.containsKey("errors"));

	}
	

	public Comment updateComment(String hash, Comment comment,  String message, TestContext context ){

		comment.setMessage(message);
		
		log("updateComment", "" + comment);
		JsonObject result = post("/rest/comments/hash/" + hash +"/" + comment.getAppID() + "/" + comment.getId() + ".json", mapper.toVertx(comment));
		log("updateComment", "" + result);
		
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("userID"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(result.containsKey("lastUpdate"));
		context.assertEquals(result.getString("message"), message);
		
		return comment;
	}
	
	public Comment updateCommentError(String hash, Comment comment,  String message, TestContext context ){

		comment.setMessage(message);
		
		JsonObject result = post("/rest/comments/hash/" + hash +"/" + comment.getAppID() + "/" + comment.getId() + ".json", mapper.toVertx(comment));
		log("updateCommentError", "" + result);
		
		context.assertTrue(result.containsKey("error") || result.containsKey("errors"));

		
		return comment;
	}
	
	public Comment postComment(App app, String hash, String type, String msg, String ref, TestContext context ){

		Comment comment = new Comment();
		comment.setAppID("Evil");
		comment.setMessage(msg);
		comment.setType(type);
		if(ref!=null)
			comment.setReference(ref);
		
		JsonObject result = post("/rest/comments/hash/" + hash +"/" + app.getId(), mapper.toVertx(comment));
		log("postComment", "" + result);
		
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(result.containsKey("userID"));
		context.assertTrue(result.containsKey("appID"));
		context.assertTrue(result.containsKey("created"));
		context.assertEquals(app.getId(), result.getString("appID"));
		
		comment.setId(result.getString("_id"));
		comment.setAppID(result.getString("appID"));
		
		return comment;
	}
	
	
	public void postCommentError(App app, String hash, String type, String msg, String ref, TestContext context ){

		Comment comment = new Comment();
		comment.setAppID(app.getId());
		comment.setMessage(msg);
		comment.setType(type);
		if(ref!=null)
			comment.setReference(ref);
		
		JsonObject result = post("/rest/comments/hash/" + hash +"/" + app.getId(), mapper.toVertx(comment));
		log("postCommentError", "" + result);
		
		context.assertTrue(!result.containsKey("_id"));
		context.assertTrue(result.containsKey("error") ||result.containsKey("errors") );
		
	}
	
	
}
