package ai.flowrabbit;

import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;

import ai.flowrabbit.model.Notification;
import ai.flowrabbit.util.Domain;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

@RunWith(VertxUnitRunner.class)
public class NotificationTest extends BaseTestCase {
	

	@Test
	public void testUpdateNotication(TestContext context){
		log("testUpdateNotication", "enter");
		
		cleanUp();
		
		deploy(new Main(), context);
		
		User klaus = postUser("klaus", context);
		log(-1, "test_SingleUser", klaus.getId());
		assertLogin(context, "klaus@quant-ux.de", "123456789");
		
		Notification n1 = new Notification();
		n1.setTitle("4 All");
		n1.setPublic(true);
		n1.setDomain(Domain.flowrabbit.getUrl());
		n1.setCreated(System.currentTimeMillis());
		n1.setLastUpdate(System.currentTimeMillis());
		n1.setCreatedBy("klaus.schaefers@quant-ux.com");
		client.save(DB.getTable(Notification.class), mapper.toVertx(n1));

		Notification n2 = new Notification();
		n2.setTitle("4 Klaus");
		n2.setUserID(klaus.getId());
		n2.setPublic(false);
		n2.setDomain(Domain.flowrabbit.getUrl());
		n2.setCreated(System.currentTimeMillis());
		n2.setLastUpdate(System.currentTimeMillis());
		n2.setCreatedBy("klaus.schaefers@quant-ux.com");
		client.save(DB.getTable(Notification.class), mapper.toVertx(n2));
		

		JsonObject query = Notification.findByUserOrPublic(klaus.getId(), Domain.flowrabbit.getUrl());
		List<JsonObject> mongoNotications = client.find(DB.getTable(Notification.class), query);
		context.assertEquals(2, mongoNotications.size(), "Wrong count for klaus in mongo");
		
		JsonArray notifications = getList("/rest/notifications.json");
		context.assertEquals(2, notifications.size(), "Wrong count for klaus");
		
		JsonObject klausJSON = post("/rest/user/notification/last.json", new JsonObject());
		System.out.println(klausJSON.encodePrettily());

		
		
		log("testUpdateNotication", "exit");
	}

}
