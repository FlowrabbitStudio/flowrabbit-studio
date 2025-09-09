package ai.flowrabbit;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;

import ai.flowrabbit.migration.MigrateTeam;
import ai.flowrabbit.model.Model;

@RunWith(VertxUnitRunner.class)
public class MigrationTestCase extends BaseTestCase {
	
	@Test
	public void testACL(TestContext context){
		log("testACL", "enter");
		
		cleanUp();
		
		JsonObject app = createApp();
		
		String id = client.save(app_db, app);
		log("testACL", "Created app :" + id);
		List<JsonObject> result_apps = client.find(app_db, Model.all());
		context.assertEquals(1, result_apps.size(), "Apps not ported");
		
		MigrateTeam mig= new MigrateTeam(mongo);
		mig.run();
				
		sleep(2000);
		
		List<JsonObject> result_inv = client.find(inv_db, Model.all());
		context.assertEquals(2, result_inv.size(), "Invitaions not ported");
		for(JsonObject obj : result_inv){
			context.assertEquals(obj.getString("appID"), id);
			context.assertTrue(obj.getString("hash").equals("123") || obj.getString("hash").equals("abc"));
		}
		
		List<JsonObject> result_users = client.find(team_db, Model.all());
		context.assertEquals(2, result_users.size(), "Users not ported");
		for(JsonObject obj : result_users){
			context.assertEquals(obj.getString("appID"), id);
			context.assertTrue(obj.getString("userID").equals("klaus") || obj.getString("userID").equals("dennis"));
		}
		
		log("testACL", "exit");
	}


}
