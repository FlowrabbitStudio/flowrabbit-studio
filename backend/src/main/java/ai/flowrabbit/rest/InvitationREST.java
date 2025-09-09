package ai.flowrabbit.rest;

import ai.flowrabbit.acl.Acl;
import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoREST;

import ai.flowrabbit.services.TokenService;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.AppAcl;
import ai.flowrabbit.acl.InvitationACL;

public class InvitationREST extends MongoREST {

	private final String app_db, event_db, test_db, mouse_db, app_data_db, pub_settings_db;
	
	private Logger logger = LoggerFactory.getLogger(InvitationREST.class);

	private final InvitationACL invACL;

	private  final Acl appACL;


	public InvitationREST(MongoClient db) {
		super(db, App.class);
		setACL(new AppAcl(db));
		this.appACL = new AppAcl(db);
		this.invACL = new InvitationACL();
		this.app_db = DB.getTable(App.class);
		this.event_db = DB.getTable(Event.class);
		this.test_db = DB.getTable(TestSetting.class);
		this.mouse_db = DB.getTable(Mouse.class);
		this.pub_settings_db = DB.getTable(PublicationSettings.class);
		this.app_data_db = DB.getTable(AppData.class);
	}
	
	
	public Handler<RoutingContext> findByApp() {
		return event -> findByApp(event, null);
	}

	private void findByApp(RoutingContext event, Handler<JsonObject> handler) {
		/**
		 * People that can write the app can also ask 
		 */
		this.appACL.canWrite(getUser(event), event , allowed -> {
			String appID = getId(event, "appID");
			if (allowed) {
				this.findByApp(event, appID, handler);
			} else {
				error("findByApp", "User " + getUser(event) + " tried to access " + event.request().path());
				returnError(event, 405);
			}
		});
		
	}
	
	private void findByApp(RoutingContext event, String appID, Handler<JsonObject> handler) {
		this.mongo.findOne(pub_settings_db, PublicationSettings.findByApp(appID), null, res -> {
			if (res.succeeded()) {
				JsonObject settings = res.result();
				String orgID = Organization.DEFAULT_ID;
				if (settings != null) {
					orgID = settings.getString(PublicationSettings.FIELD_ORG_ID);
				}
				createTokens(event, appID, orgID);
			} else {
				error("findByApp", "Some mongo error");
				returnError(event, 405);
			}
		});
	}

	private void createTokens(RoutingContext event, String appID, String orgID) {
		User user = getUser(event);
		logger.info("createTokens() > appID:  " + appID + " > orgID: " + orgID + " > user: " + user );


		JsonObject result = new JsonObject();

		String testHash = TokenService.getStudioToken(user, appID, orgID, Invitation.TEST);
		result.put(testHash, Invitation.TEST);

		String readHash = TokenService.getStudioToken(user, appID, orgID, Invitation.READ);
		result.put(readHash, Invitation.READ);

		// IS this ever needed?
		String writeHash = TokenService.getStudioToken(user, appID, orgID, Invitation.WRITE);
		result.put(writeHash, Invitation.WRITE);

		returnJson(event, cleanJson(result));
	}


	/********************************************************************************************
	 * find???ByHash
	 ********************************************************************************************/


	public Handler<RoutingContext> findAppByHash() {
		return event -> findAppByHash(event);
	}

	private void findAppByHash(RoutingContext event) {
		String hash = getId(event, "hash");
		logger.info("findAppByHash() > enter > " + hash);

		User hashUser = getHashUser(event);
		if (!hashUser.hasClaim()) {
			logger.info("findAppByHash() > hash has no claim > " + hash);
			returnError(event, 404);
			return;
		}

		if (hashUser.getOrgID() != null) {
			// we could still check if the org is blocked,
			// but this might be a little expensive and not
			// work of the data is loaded through the publication
			// endpoint
			//
			// Maybe it does not make a big difference because
			// the users will get a fresh token on reload
			findAppByID(event, hash, hashUser);
		} else {
			findAppByID(event, hash, hashUser);
		}
	}

	private void findAppByID(RoutingContext event, String hash, User hashUser) {
		String appID = hashUser.getAppID();
		mongo.find(app_db, App.findById(appID), res ->{
			if(res.succeeded()){
				List<JsonObject> apps = res.result();
				if(apps.size() == 1){
					JsonObject app  =apps.get(0);
					returnJson(event, cleanJson(app));
				} else {
					error("findAppByHash", "Found  not *1* but " +  apps.size() + " apps with hash "+ hash);
					returnError(event, 404);
				}
			} else {
				returnError(event, 404);
			}
		});
	}


	@Deprecated
	public void infLastAppUpdateByHash(RoutingContext event) {
		logger.info("infLastAppUpdateByHash() > enter");
		String hash = getId(event, "hash");
		User hashUser = getHashUser(event);
		if (!hashUser.hasClaim()) {
			logger.info("infLastAppUpdateByHash() > hash has no claim > " + hash);
			returnError(event, 404);
			return;
		}

		String appID = hashUser.getAppID();
		JsonObject fields = new JsonObject()
				.put("screens", 0)
				.put("groups", 0)
				.put("widgets", 0)
				.put("templates", 0)
				.put("grid", 0)
				.put("lines", 0);

		mongo.findOne(app_db, App.findById(appID),fields, appRes->{
			if(appRes.succeeded()){
				JsonObject result = appRes.result();
				if (result!= null){
					event.response().end(result.encode());
				} else {
					logger.error("infLastAppUpdateByHash() > Could not find live " + appID);
					returnError(event, 404);
				}
			} else {
				logger.error("infLastAppUpdateByHash() > Mongo Error : " + appRes.cause().getMessage());
				returnError(event, 404);
			}
		});
	}


	
	public Handler<RoutingContext> findTestByHash() {
		return event -> findTestByHash(event);
	}

	private void findTestByHash(RoutingContext event) {
		this.invACL.canTest(getUser(event), event, res ->{
			if(res){
				String appID = getId(event, "appID");
				findTestByApp(event, appID);		
			} else {
				error("findTestByHash", "Could not read form mongo > " + event.request().path());
				returnError(event, 404);
			}
		});		
	}
	
	
	private void findTestByApp(RoutingContext event, String appID) {
		
		mongo.find(test_db, TestSetting.findByApp(appID) , res ->{
			if(res.succeeded()){
				List<JsonObject> testSettings = res.result();
				
				if(testSettings.size() == 0){
					logger.info("findTestByApp() > No test settings for " + appID + "Return empty settings"); 
					
					JsonObject  json = new JsonObject()					
						.put("appID", getId(event, "appID"))
						.put("created", System.currentTimeMillis())
						.put("tasks", new JsonArray());
					
					returnJson(event, json);
				} else if(testSettings.size() == 1){
					JsonObject testSetting  =testSettings.get(0);
					returnJson(event, cleanJson(testSetting));
				
				} else {
					error("findTestByApp", "Found more or less then *1* app for the given appID!" + testSettings.size() + " > " + appID);
					returnError(event, 404);
				}
			} else {
				returnError(event, 404);
			}
		});
	}

	/********************************************************************************************
	 * findByHash
	 ********************************************************************************************/


	public Handler<RoutingContext> findAppDataByHash() {
		return event -> findAppPartByHash(event, this.app_data_db, AppData.FIELD_DATA);
	}
	private void findAppPartByHash(RoutingContext event, String table, String payloadField) {
		this.invACL.canTest(getUser(event), event, res ->{
			if(res){
				String appID = getId(event, "appID");
				findAppPartByHash(event, table, payloadField, appID);
			} else {
				error("findAppPartByHash", "Could not read form mongo > " + event.request().path());
				returnError(event, 404);
			}
		});
	}

	private void findAppPartByHash(RoutingContext event, String table, String payloadField, String appID) {
		mongo.findOne(table, AppPart.findByApp(appID) , null,  res ->{
			if(res.succeeded()){
				JsonObject appPart = res.result();
				if (appPart != null) {
					returnJson(event, appPart);
				} else {
					error("findAppPartByHash", "Found no data or worng > " + appID + " > " +payloadField + " > " + table);
					returnError(event, 404);
				}
			} else {
				returnError(event, 404);
			}
		});
	}


	/********************************************************************************************
	 * findByHash
	 ********************************************************************************************/



	/********************************************************************************************
	 * findByHash
	 ********************************************************************************************/




	public Handler<RoutingContext> addEvents() {
		return event -> addEvents(event, event_db);
	}

	public Handler<RoutingContext> addMouse() {
		return event -> addEvents(event, mouse_db );
	}

	private void addEvents(RoutingContext event, String db) {
		this.invACL.canTest(getUser(event), event, res ->{
			if(res){
				String appID = getId(event, "appID");
				addEvents(event, appID, db);
			} else {
				error("addEvents", "User " + getUser(event) + " tried to add events to app "+ event.request().path());
				returnError(event, 404);
			}
		});
	}

	private void addEvents(RoutingContext event, String appID, String db) {
		JsonObject json = getJson(event);
		json.put("appID", appID);
		mongo.insert(db, json, res->{
			if(res.succeeded()){
				returnOk(event, "events.added");
				if(json.containsKey("type") && "SessionStart".equals(json.getString("type"))){
					AppEvent.send(event, getUser(event).getEmail(), AppEvent.TYPE_APP_TEST, appID);
				}
			} else {
				returnError(event, 404);
			}
		});
	}

	protected JsonObject cleanJson(JsonObject json){
		json.remove("users");
		json.remove("invitations");
		return super.cleanJson(json);
	}




}
