package ai.flowrabbit.validation;

import java.util.ArrayList;
import java.util.List;

import ai.flowrabbit.model.PublicationSettings;
import ai.flowrabbit.util.DB;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import ai.flowrabbit.util.MongoREST;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AppValidator extends MongValidator implements Validator{

	private static Logger logger = LoggerFactory.getLogger(AppValidator.class);
	private final String pubsettingsDB;

	public AppValidator(MongoClient client, MongoREST rest) {
		super(client);
		this.pubsettingsDB = DB.getTable(PublicationSettings.class);
	}

	@Override
	public void validate(RoutingContext event, JsonObject json, boolean isUpdate, Handler<List<String>> handler) {
		String orgID = event.request().getParam("orgID");
		List<String> errors = new ArrayList<>();
//		if (orgID != null && !Organization.DEFAULT_ID.equals(orgID)) {
//			String name = json.getString("name");
//			logger.error("validate() > found org " + orgID + " > check " + name );
//			this.client.count(pubsettingsDB, PublicationSettings.findByNameAndOrg(name, orgID), res -> {
//				if (res.succeeded()) {
//					if (res.result() != 0) {
//						errors.add("app.create.name.not.unique.in.org");
//						logger.error("validate() > ERROR found " + res.result() + " apps with name " + name + " in " + orgID);
//					}
//				} else {
//					errors.add("app.create.mongo.error");
//				}
//				handler.handle(errors);
//			});
//		} else {
			handler.handle(errors);
		//}
	}

}
