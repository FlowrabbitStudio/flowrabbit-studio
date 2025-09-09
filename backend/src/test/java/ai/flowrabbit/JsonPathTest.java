package ai.flowrabbit;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

import org.junit.Test;
import org.junit.runner.RunWith;

import ai.flowrabbit.util.JsonPath;

@RunWith(VertxUnitRunner.class)
public class JsonPathTest extends BaseTestCase {
	
	@Test
	public void test(TestContext context){
		log("test", "enter");
	
		JsonObject obj = new JsonObject().put("a", new JsonObject().put("b", 1));
		JsonPath path = new JsonPath(obj);
		
		context.assertEquals(1, path.getInteger("a", "b"));
		
		
		log("test", "exit");
	}

	
}
