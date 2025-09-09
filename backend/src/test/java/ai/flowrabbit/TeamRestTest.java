package ai.flowrabbit;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

import org.junit.Test;
import org.junit.runner.RunWith;

import ai.flowrabbit.acl.Acl;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Team;
import ai.flowrabbit.model.User;

@RunWith(VertxUnitRunner.class)
public class TeamRestTest extends BaseTestCase {
	
	@Test
	public void test(TestContext context){
		log("test", "enter");
		
		super.loglevel = 3;
		
		cleanUp();
		
		deploy(new Main(), context);
		
		
		/**
		 * create user
		 */
		User klaus = postUser("klaus", context);
		User bernd = postUser("bernd", context);
		User dennis = postUser("dennis", context);
		
		/**
		 * Klaus creates app and add bernd and dennis
		 */
		assertLogin(context, "klaus@quant-ux.de", "123456789");
		App klaus_app_private = postApp("klaus_app_private", false, context);
		
		JsonObject acl1 = client.findOne(team_db, Team.findByUserAndApp(klaus, klaus_app_private.getId()));
		log("test", " owner acls : "+ acl1.encode());
		context.assertEquals(acl1.getString(Team.USER_ID), klaus.getId());
		context.assertEquals(acl1.getString(Team.APP_ID), klaus_app_private.getId());
		context.assertEquals(acl1.getInteger(Team.PERMISSION), Acl.OWNER);
		
		createPermission(dennis, klaus_app_private, Acl.READ, context);
		createPermission(bernd, klaus_app_private, Acl.WRITE, context);
		
		updatePermission(bernd, klaus_app_private, Acl.READ, context);
		
		JsonArray team = getList("/rest/apps/"+klaus_app_private.getId() + "/team.json");
		context.assertEquals(3, team.size());
		log("test", "team >" + team.encodePrettily());
		
		JsonArray suggestions = getList("/rest/apps/"+klaus_app_private.getId() + "/suggestions/team.json");
		context.assertEquals(3, suggestions.size());
		log("test", "team >" + suggestions.encodePrettily());


		// creating a permission again will create an error
		createPermissionError(dennis, klaus_app_private, Acl.READ, context);
		
		
	}
	


}
