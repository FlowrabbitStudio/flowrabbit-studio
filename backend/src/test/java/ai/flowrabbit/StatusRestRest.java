package ai.flowrabbit;

import org.junit.Test;
import org.junit.runner.RunWith;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

@RunWith(VertxUnitRunner.class)
public class StatusRestRest extends BaseTestCase {


	@Test
	public void test(TestContext context){
		log("test", "enter");
		
		cleanUp();
		
		deploy(new Main(), context);

		JsonObject status = get("/rest/status.json");
		context.assertNotNull(status);
		context.assertEquals(Main.VERSION, status.getString("version"));
	}
}
