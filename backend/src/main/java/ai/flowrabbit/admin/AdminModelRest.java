package ai.flowrabbit.admin;

import java.util.List;
import java.util.Map.Entry;

import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoFilter;
import ai.flowrabbit.util.MongoPaging;
import ai.flowrabbit.util.REST;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.model.Model;
import io.vertx.core.Handler;
import io.vertx.core.MultiMap;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;


public class AdminModelRest extends REST {

	private final AdminACL acl = new AdminACL();
	
	private final MongoClient db;
	
	private Logger logger = LoggerFactory.getLogger(AdminModelRest.class);

	private FindOptions options;

	public AdminModelRest(MongoClient db) {
		this.db = db;
	}
	
	public AdminModelRest(MongoClient db, FindOptions options) {
		this.db = db;
		this.options = options;
	}


	public Handler<RoutingContext> create(Class<?> model) {
		return event -> createAcl(event, model);
	}

	public void createAcl(RoutingContext event, Class<?> model) {
		event.response().putHeader("content-type", "application/json");

		this.acl.isAdmin(getUser(event), event , allowed -> {
			if (allowed) {
				this.createAllowed(event, model);
			} else {
				error("create", "User " + getUser(event) + " tried to  create " + event.request().path());
				returnError(event, 405);
			}
		});
	}

	private void createAllowed(RoutingContext event, Class<?> model) {
		JsonObject json = getJson(event);
		if(json!=null){
			create(event, model, json);
		} else{
			returnError(event, 405);
		}
	}

	protected void create(RoutingContext event,Class<?> model, JsonObject json) {
		db.insert(DB.getTable(model), json, res -> {
			logger.info("create() > " + res.result() + " in " + model.getSimpleName());
			if (res.succeeded()) {
				json.put("_id", res.result());
				json.put("id", res.result());
				returnJson(event, json);
			} else {
				res.cause().printStackTrace();
				returnError(event, model.getSimpleName() + ".create.error");
			}
		});
	}
	
	public Handler<RoutingContext> find(Class<?> model) {
		return event -> find(event, model, null);
	}

	public Handler<RoutingContext> find(Class<?> model, MongoFilter<List<JsonObject>, List<JsonObject>> filter) {
		return event -> find(event, model, filter);
	}

	private void find(RoutingContext event, Class<?> model, MongoFilter<List<JsonObject>, List<JsonObject>> filter) {
		logger.info("find()");
		this.acl.isAdmin(getUser(event), event, allowed->{
			if(allowed){
				if (this.options != null){
					db.findWithOptions(DB.getTable(model),Model.all(), options, res->{
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
				} else {
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
				}
				
			} 
		});
	}


	public Handler<RoutingContext>  findPaging(Class<?> model, String ... queryKeys) {
		return event -> findPaging(event, model, queryKeys);
	}

	private void findPaging(RoutingContext event, Class<?> model, String[] queryKeys) {
		logger.info("findPaging()");
		this.acl.isAdmin(getUser(event), event, allowed -> {
			if (allowed) {
				MongoPaging.run(db, event, model, queryKeys);
			}
		});
	}



	public Handler<RoutingContext> findBy(Class<?> model) {
		return event -> findBy(event, model);
	}
	
	private void findBy(RoutingContext event, Class<?> model) {
		logger.info("findBy() > ");
		this.acl.isAdmin(getUser(event), event, allowed->{
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
			} 
		});
	}
	
	public Handler<RoutingContext> findByID(Class<?> model, MongoFilter<JsonObject, JsonObject> filter) {
		return event -> findByID(event, model, filter);
	}
	
	private void findByID(RoutingContext event, Class<?> model, MongoFilter<JsonObject, JsonObject> filter) {
		String id = getId(event, "id");
		logger.info("findByID() > " + id);

		this.acl.isAdmin(getUser(event), event, allowed->{
			if(allowed){
				db.findOne(DB.getTable(model),Model.findById(id), null , res->{
					if(res.succeeded()){
						JsonObject obj = res.result();
						returnJson(event, filter.filter(obj));
					} else {
						returnError(event, 405);
					}
				});
			} 
		});
	}
	
	

	public Handler<RoutingContext> delete(Class<?> model, Handler<String> handler) {
		return event -> delete(event, model, handler);
	}

	
	private void delete(RoutingContext event, Class<?> model, Handler<String> handler) {
		logger.info("delete()");
		this.acl.isAdmin(getUser(event), event, allowed->{
			if(allowed){
				String id = getId(event);
				db.removeDocuments(DB.getTable(model),Model.findById(id) , res->{
					if(res.succeeded()){
						returnOk(event,model.getSimpleName()+".delete.succeess");
						if(handler!=null){
							handler.handle(id);
						}
					} else {
						returnError(event, 405);
					}
				});
			} 
		});
		
	}
	
	

	public Handler<RoutingContext> update(Class<?> model) {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				update(event, model);
			}
		};
	}
	
	public void update(RoutingContext event, Class<?> model) {
		logger.info("update()");
		this.acl.isAdmin(getUser(event), event, allowed->{
			if(allowed){
				String id = getId(event);
				if(id != null) {
					JsonObject json = event.getBodyAsJson();
					json = new JsonObject().put("$set", json);
					db.updateCollection(DB.getTable(model), Model.findById(id), json, res -> {
						if(res.succeeded()){
							returnOk(event, "model.update.partial.ok");
						} else {
							logger.error("particalUpdate() > Cannot update "+ res.cause().getMessage());
							returnError(event, "model.update.error");
						}
					});
				}
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
		logger.info("update()");
		this.acl.isAdmin(getUser(event), event, allowed->{
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
						} else {
							logger.error("particalUpdate() > Cannot update "+ res.cause().getMessage());
							returnError(event, "model.update.error");
						}
					});
				} else {
					logger.error("particalUpdate() > Cannot update not existing  child in body " + child );
					returnError(event, "model.update.error");
				}
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
