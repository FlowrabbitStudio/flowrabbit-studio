package ai.flowrabbit;

import java.util.List;

import ai.flowrabbit.services.TokenService;
import org.junit.Test;
import org.junit.runner.RunWith;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.User;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

@RunWith(VertxUnitRunner.class)
public class JWTTestCase extends BaseTestCase {



	@Test
	public void test_jwt_claims(TestContext context) {

		User user = new User();
		user.setId("1");
		user.setEmail("klaus@qaunt-ux.com");

		TokenService.setSecret("123");
		String token = TokenService.getAppToken(user, "app1", 1);

		User user2 = TokenService.getUser(token);
		context.assertEquals(user2.getEmail(), "klaus@qaunt-ux.com");
		context.assertEquals(user2.getId(), "1");
		context.assertEquals(user2.getAppID(), "app1");
		context.assertEquals(user2.getAppPermission(), 1);
		context.assertEquals(user2.getRole(), User.TOKEN);
		context.assertEquals(user2.hasClaim(), true);
		context.assertNull(user2.getOrgID());
	}

//	@Test
//	public void test_jwt_claims_org(TestContext context) {
//
//		User user = new User();
//		user.setId("1");
//		user.setEmail("klaus@qaunt-ux.com");
//
//		TokenService.setSecret("123");
//		String token = TokenService.getAppToken(user, "app1", "org1", 1);
//
//		User user2 = TokenService.getUser(token);
//		context.assertEquals(user2.getEmail(), "klaus@qaunt-ux.com");
//		context.assertEquals(user2.getId(), "");
//		context.assertEquals(user2.getAppID(), "app1");
//		context.assertEquals(user2.getAppPermission(), 1);
//		context.assertEquals(user2.getRole(), User.TOKEN);
//		context.assertEquals(user2.hasClaim(), true);
//		context.assertEquals(user2.getOrgID(), "org1");
//
//	}

	@Test
	public void test_jwt_pub_claims_org(TestContext context) {

		User user = new User();
		user.setId("1");
		user.setEmail("klaus@qaunt-ux.com");

		TokenService.setSecret("123");
		String token = TokenService.getPublicAppToken(user, "app1", "org1", 1, User.TOKEN_PUBLIC);

		User user2 = TokenService.getUser(token);
		context.assertEquals(user2.getEmail(), "klaus@qaunt-ux.com");
		context.assertEquals(user2.getId(), "1");
		context.assertEquals(user2.getAppID(), "app1");
		context.assertEquals(user2.getAppPermission(), 1);
		context.assertEquals(user2.getRole(), User.TOKEN);
		context.assertEquals(user2.hasClaim(), true);
		context.assertEquals(user2.getOrgID(), "org1");
		context.assertEquals(user2.isPubClaim(), true);
		context.assertEquals(user2.getTokenType(), User.TOKEN_PUBLIC);
	}
	
	@Test
	public void test_jwt(TestContext context){
		log("test_jwt", "enter");
		
		cleanUp();
		
		deploy(new Main(), context);

		/**
		 * create user
		 */
		User klaus = postUser("klaus", context);
		log("test_jwt", klaus.toString());
	
		/**
		 * make sure we cannot create an app without being logged in
		 */
		App app = createApp("Not_Allowed", false);
		JsonObject error = post("/rest/apps", app);
		log("test_jwt", "error > "+ error);
		context.assertEquals(error.getInteger("error"), 405);
		
		
		/**
		 * now login, we can create an app now
		 */
		JsonObject loginResult = assertLogin(context, "klaus@quant-ux.de", "123456789");
		context.assertTrue(loginResult.containsKey("token"));
		String token = loginResult.getString("token");
		log(0,"test_jwt", "token > "+ token.length());
		setJWT(token);
		
		
		/**
		 * create some apps
		 */
		App klaus_app_public = postApp("klaus_app_public", true, context);
		log("test_jwt", "klaus_app_public > "+ klaus_app_public);
		
		
		App klaus_app_private = postApp("klaus_app_private", false, context);
		log("test_jwt", "klaus_app_private > "+ klaus_app_private);
		
		
		/**
		 * check mongo if the apps are there
		 */
		List<JsonObject> allApps = client.find(app_db, Model.all());
		log("test_jwt", "klaus_apps > "+ allApps.size());
		context.assertEquals(2, allApps.size());

		
		/**
		 * test rest get
		 */
		JsonArray klaus_apps = getList("/rest/apps/");
		log("test_jwt", "klaus_apps > "+ klaus_apps.size());
		context.assertEquals(2, klaus_apps.size());
		
		JsonArray public_apps = getList("/rest/apps/public");
		log("test_jwt", "public_apps > "+ public_apps.size());
		context.assertEquals(1, public_apps.size());
		
		klaus_app_private = get("/rest/apps/" + klaus_app_private.getId() + ".json", App.class);
		context.assertNotNull(klaus_app_private);
		log("test_jwt", "klaus_app_private > "+ klaus_app_private);
		
		JsonObject result = get("/rest/apps/" + klaus_app_private.getId() + ".json");
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("users"));
		
			
		/**
		 * logout, user cannot read & write
		 */
		logout();
		
		
		JsonObject find_error = get("/rest/apps/" + klaus_app_private.getId() + ".json");
		log("test_jwt", "find(app) error : " + find_error);
		context.assertEquals(find_error.getInteger("error"), 401);
		
		find_error = get("/rest/commands/" + klaus_app_private.getId() + ".json");
		log("test_jwt", "find(app) error : " + find_error);
		context.assertEquals(find_error.getInteger("error"), 404);

		/**
		 * Check that token as query works
		 */
		JsonObject appFromQuery = get("/rest/apps/" + klaus_app_private.getId() + ".json?token=" + token);
		log("test_jwt", "find(appFromQuery) error : " + appFromQuery);
		context.assertTrue(!appFromQuery.containsKey("error"));
		context.assertTrue(!appFromQuery.containsKey("errors"));
		context.assertEquals("klaus_app_private", appFromQuery.getString("name"));

		JsonObject query_error = get("/rest/apps/" + klaus_app_private.getId() + ".json?token=sometoken");
		log("test_jwt", "find(app) error : " + query_error);
		context.assertEquals(query_error.getInteger("error"), 401);


		/**
		 * login again
		 */
		loginResult = assertLogin(context, "klaus@quant-ux.de", "123456789");
		context.assertTrue(loginResult.containsKey("token"));
		token = loginResult.getString("token");
		log("test_jwt", "token2 > "+ token);
		setJWT(token);
		
		klaus_app_private = get("/rest/apps/" + klaus_app_private.getId() + ".json", App.class);
		context.assertNotNull(klaus_app_private);
	
		
		log("test_jwt", "exit");
	}

}
