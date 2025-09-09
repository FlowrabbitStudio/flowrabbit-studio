package ai.flowrabbit.admin;

import ai.flowrabbit.model.Model;
import ai.flowrabbit.util.MongoResultPump;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

import java.util.Calendar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.REST;

public class AdminEventRest extends REST{
	
	private final AdminACL acl = new AdminACL();
	
	private final MongoClient db;
	
	private Logger logger = LoggerFactory.getLogger(AdminEventRest.class);

	private int windowSizeHours = -24;
	
	private String table;

	public AdminEventRest(MongoClient db, Class<?> cls) {
		this.db = db;
		this.table = DB.getTable(cls);
	}
	

	public Handler<RoutingContext> get() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				get(event);
			}
		};
	}

	
	private void get(RoutingContext event) {
		logger.info("get()");
		this.acl.isAdmin(getUser(event), event, allowed->{
			if(allowed){
				JsonObject query = getQuery(event);
				MongoResultPump pump = new MongoResultPump(event);
				db.findBatch(table, query)
						.exceptionHandler(err -> pump.error())
						.endHandler(v -> pump.end())
						.handler(doc -> pump.pump(doc));
			} 
		});
		
	}

	private JsonObject getQuery (RoutingContext event) {
		MultiMap entries = event.queryParams();
		if (entries.contains("from") && entries.contains("to")) {
			long from = Long.parseLong(entries.get("from"));
			long to = Long.parseLong(entries.get("to"));
			return Model.in(from, to);
		}
		Calendar now = Calendar.getInstance();
		now.add(Calendar.HOUR, windowSizeHours);
		long date = now.getTimeInMillis();
		return Model.newerThan(date);
	}
	

	public Handler<RoutingContext> delete() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				delete(event);
			}
		};
	}

	
	private void delete(RoutingContext event) {
		logger.error("delete()");
		this.acl.isAdmin(getUser(event), event, allowed->{
			if(allowed){
				db.removeDocument(table, Model.all(), res->{
					if(res.succeeded()){
						returnOk(event, table + ".event.deleted");
					} else {
						returnError(event, 405);
					}
				});
			} 
		});
		
	}



}
