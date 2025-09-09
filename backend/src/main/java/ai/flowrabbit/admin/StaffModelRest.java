package ai.flowrabbit.admin;

import java.util.List;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.StaffACL;
import ai.flowrabbit.model.AppEvent;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoFilter;
import ai.flowrabbit.util.REST;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;


public class StaffModelRest extends REST{

	private final StaffACL acl = new StaffACL();
	
	private final MongoClient db;
	
	private Logger logger = LoggerFactory.getLogger(AdminModelRest.class);


	public StaffModelRest(MongoClient db) {
		this.db = db;
	}
	
	
	public Handler<RoutingContext> create(Class<?> model) {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				create(event, model);
			}
		};
	}
	
	
	
	public void create(RoutingContext event, Class<?> model) {
		logger.info("create(" + model.getName() + ") > enter");
		this.acl.isStaff(getUser(event), event, isAllowed -> {
			if (isAllowed){
				JsonObject json = getJson(event);
				db.insert(DB.getTable(model), json, res -> {
					if (res.succeeded()){
						returnOk(event, "staff.create.ok");
					} else {
						returnError(event, "staff.create.error");
						logger.error("create(" + model.getName() + ") > Error. COuld not insert", res.cause());
					}
				});
				
			} else {
				logger.error("create(" + model.getName() + ") > Not allowed" + getUser(event));
				//MongoLogger.error(event, getUser(event), this.getClass(), "create", model.getName() + " > Not allowed for user " + getUser(event));
				returnError(event, 405);
			}
		});
	}
	
	public Handler<RoutingContext> find(Class<?> model) {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				find(event, model, null);
			}
		};
	}
	
	
	
	public Handler<RoutingContext> find(Class<?> model,MongoFilter<List<JsonObject>, List<JsonObject>> filter) {
		return event -> find(event, model, filter);
	}

	
	private void find(RoutingContext event, Class<?> model, MongoFilter<List<JsonObject>, List<JsonObject>> filter) {
		logger.info("find()");
		this.acl.isStaff(getUser(event), event, allowed->{
			if(allowed){
				
				db.find(DB.getTable(model),Model.all() , res->{
					if(res.succeeded()){
						List<JsonObject> list = res.result();
						if(filter!= null){
							list = filter.filter(list);
						}
						returnJson(event,list );
					} else {
						returnError(event, 405);
					}
				});
			}  else {
				logger.error("find(" + model.getName() + ") > Not allowed" + getUser(event));
				//MongoLogger.error(event, getUser(event), this.getClass(), "find", model.getName() + " > Not allowed for user " + getUser(event));
				returnError(event, 405);
			}
		});
	}
	
	
	
	
	
	public Handler<RoutingContext> findBy(Class<?> model) {
		return event -> findBy(event, model);
	}
	
	private void findBy(RoutingContext event, Class<?> model) {
		logger.info("findBy() > ");
		this.acl.isStaff(getUser(event), event, allowed->{
			if(allowed){
				JsonObject query = getPathQuery(event);
				db.find(DB.getTable(model),query , res->{
					if(res.succeeded()){
						List<JsonObject> list = res.result();
						returnJson(event,list );
					} else {
						returnError(event, 405);
					}
				});
			}  else {
				logger.error("findBy() > Not allowed" + getUser(event));
				//MongoLogger.error(event,getUser(event), this.getClass(), "findBy", model.getName() + " > Not allowed for user " + getUser(event));
				returnError(event, 405);
			}
		});
	}
	
	public Handler<RoutingContext> findByID(Class<?> model, MongoFilter<JsonObject, JsonObject> filter) {
		return event -> findByID(event, model, filter);
	}
	
	private void findByID(RoutingContext event, Class<?> model, MongoFilter<JsonObject, JsonObject> filter) {
		String id = getId(event, "id");
		logger.info("findByID() > " + id);

		this.acl.isStaff(getUser(event), event, allowed->{
			if(allowed){
				db.findOne(DB.getTable(model),Model.findById(id), null , res->{
					if(res.succeeded()){
						JsonObject obj = res.result();
						returnJson(event, filter.filter(obj));
					} else {
						returnError(event, 405);
					}
				});
			} else {
				logger.error("findByID(" + model.getName() + ") > Not allowed" + getUser(event));
				//MongoLogger.error(event, getUser(event), this.getClass(), "findByID", model.getName() + " > Not allowed for user " + getUser(event));
				returnError(event, 405);
			}
		});
	}
	
	

	public Handler<RoutingContext> delete(Class<?> model, Handler<String> handler) {
		return event -> delete(event, model, handler);
	}

	
	private void delete(RoutingContext event, Class<?> model, Handler<String> handler) {
		logger.info("delete()");
		this.acl.isStaff(getUser(event), event, allowed->{
			if(allowed){
				String id = getId(event);
				db.removeDocuments(DB.getTable(model),Model.findById(id) , res->{
					if(res.succeeded()){
						AppEvent.send(event, getUser(event).getEmail(), AppEvent.TYPE_STAFF_DELETE, DB.getTable(model) + ":" + id);
						returnOk(event,model.getSimpleName()+".delete.succeess");
						if(handler!=null){
							handler.handle(id);
						}
					} else {
						returnError(event, 405);
					}
				});
			} else {
				logger.error("delete(" + model.getName() + ") > Not allowed" + getUser(event));
				//MongoLogger.error(event, getUser(event), this.getClass(), "delete", model.getName() + " > Not allowed for user " + getUser(event));
				returnError(event, 405);
			}
		});
		
	}
	
	

	public Handler<RoutingContext> update(Class<?> model) {
		return event -> update(event, model);
	}
	
	public void update(RoutingContext event, Class<?> model) {
		logger.info("update()");
		this.acl.isStaff(getUser(event), event, allowed->{
			if(allowed){
				
				String id = getId(event);
				if(id != null) {
					
					JsonObject json = event.getBodyAsJson();
					
					json = new JsonObject().put("$set", json);

					db.updateCollection(DB.getTable(model), Model.findById(id), json, res -> {
						if(res.succeeded()){
							returnOk(event, "model.update.partial.ok");
							AppEvent.send(event, getUser(event).getEmail(), AppEvent.TYPE_STAFF_UPDATE, DB.getTable(model) + ":" + id);
						} else {
							logger.error("particalUpdate() > Cannot update "+ res.cause().getMessage());
							returnError(event, "model.update.error");
						}
					});
				}
			} else {
				logger.error("update(" + model.getName() + ") > Not allowed" + getUser(event));
				//MongoLogger.error(event, getUser(event), this.getClass(), "update", model.getName() + " > Not allowed for user " + getUser(event));
				returnError(event, 405);
			}
		});
		
	}
	
	
	public Handler<RoutingContext> updateChild(Class<?> model,boolean isArray) {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				updateChild(event, model, isArray);
			}
		};
	}
	
	public void updateChild(RoutingContext event, Class<?> model, boolean isArray) {
		logger.info("update(" + model.getName() + ")");
		this.acl.isStaff(getUser(event), event, allowed->{
			if(allowed){
				
				String id = getId(event);
				String child = getId(event, "child");
				JsonObject body = event.getBodyAsJson();
				
			
				if(body.containsKey(child)){
					JsonObject json = new JsonObject();
					
					if(isArray){
						json.put(child, body.getJsonArray(child));	
					} else {
						json.put(child, body.getJsonObject(child));	
					}
					
					json = new JsonObject().put("$set", json);

					db.updateCollection(DB.getTable(model), Model.findById(id), json, res -> {
						if(res.succeeded()){
							returnOk(event, "model.update.partial.ok");
							AppEvent.send(event, getUser(event).getEmail(), AppEvent.TYPE_STAFF_UPDATE, DB.getTable(model) + ":" + id);
						} else {
							logger.error("particalUpdate() > Cannot update "+ res.cause().getMessage());
							returnError(event, "model.update.error");
						}
						
					});
				} else {
					logger.error("particalUpdate" + model.getName() + "() > Cannot update not existing  child in body " + child );
					returnError(event, "model.update.error");
				}
			}  else {
				logger.error("particalUpdate(" + model.getName() + ") > Not allowed" + getUser(event));
				//MongoLogger.error(event, getUser(event), this.getClass(),  "particalUpdate", model.getName() + " > Not allowed for user " + getUser(event));
				returnError(event, 405);
			}
		});
		
	}
	
	
	protected JsonObject getPathQuery(RoutingContext event) {
		JsonObject query = new JsonObject();
		MultiMap map = event.request().params();
		List<Entry<String, String>> list = map.entries();

		for(Entry<String,String> entry : list){
			if(entry.getValue() != null){
				query.put(entry.getKey(),entry.getValue());
			}
		}
		return query;
	}
	
}
