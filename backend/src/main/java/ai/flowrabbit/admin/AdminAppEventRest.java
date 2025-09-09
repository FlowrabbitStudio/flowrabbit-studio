package ai.flowrabbit.admin;

import ai.flowrabbit.acl.AppEventACL;
import ai.flowrabbit.model.AppEvent;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.util.MongoResultPump;
import io.vertx.core.MultiMap;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;


public class AdminAppEventRest extends MongoREST {

	public AdminAppEventRest(MongoClient db) {
		super(db,  AppEvent.class);
		setACL(new AppEventACL());
	}

	public void findAll(RoutingContext event) {
		this.acl.canRead(getUser(event), event, allowed -> {
			if (allowed) {
				JsonObject query = getQuery(event);
				MongoResultPump pump = new MongoResultPump(event);
				mongo.findBatch(table, query)
						.exceptionHandler(err -> pump.error())
						.endHandler(v -> pump.end())
						.handler(doc -> pump.pump(doc));
			} else {
				error("findAll", "User " + getUser(event) + " tried to  read " + event.request().path());
				returnError(event, 404);
			}
		});
	}

	private JsonObject getQuery (RoutingContext event) {
		MultiMap entries = event.queryParams();
		JsonObject query = Model.all();
		if (entries.contains("from") && entries.contains("to")) {
			long from = Long.parseLong(entries.get("from"));
			long to = Long.parseLong(entries.get("to"));
			query.put(AppEvent.FIELD_CREATED,
					new JsonObject().put("$gte", from).put("$lte", to)
			);
		}

		if (entries.contains("type")) {
			query.put(AppEvent.FIELD_TYPE, entries.get("type"));
		}

		if (entries.contains("user")) {
			query.put(AppEvent.FIELD_USER, entries.get("user"));
		}

		return query;
	}
	
	
	
	
}
	
	