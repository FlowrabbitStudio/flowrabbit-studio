package ai.flowrabbit.admin;

import java.util.HashMap;
import java.util.List;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.Team;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class AdminTeamRest extends MongoREST {
	
	private final AdminACL acl = new AdminACL();
	
	private final String team_db, user_db;
	
	public AdminTeamRest(MongoClient db) {
		super(db, App.class);
		this.team_db = DB.getTable(Team.class);
		this.user_db = DB.getTable(User.class);
	}
	


	public Handler<RoutingContext> findTeam() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				getTeam(event);
			}
		};
	}
	
	
	private void getTeam(RoutingContext event) {
		
		event.response().putHeader("content-type", "application/json");
		
		String appID = getId(event, "appID");
	
		this.acl.isAdmin(getUser(event), event , allowed -> {
			if (allowed) {
				this.getTeam(event, appID);
			} else {
				error("getTeam", "User " + getUser(event) + " tried to  read " + event.request().path());
				returnError(event, 404);
			}
		});
		
	}
	
	private void getTeam(RoutingContext event, String appID) {
		//log("getTeam", "enter > " + id);
		
		mongo.find(team_db, Team.findByApp(appID), res -> {
			if(res.succeeded()){				
				
				List<JsonObject> userACLs = res.result();		
				
				HashMap<String, Integer> userIDs = getUserMap(userACLs);
				
				getUsersByIds(event, userIDs);
				
			} else {
				returnError(event, "team.error");
			}
		});
				
	}
	

	private HashMap<String, Integer> getUserMap(List<JsonObject> userACLs) {
		HashMap<String, Integer> userIDs = new HashMap<String, Integer>();
		for(JsonObject acl : userACLs){			
			userIDs.put(acl.getString(Team.USER_ID), acl.getInteger(Team.PERMISSION));			
		}
		return userIDs;
	}
	
	
	protected void getUsersByIds(RoutingContext event, HashMap<String,Integer> userIDs) {
		
		JsonArray ids = new JsonArray();
		
		for(String id : userIDs.keySet()){
			ids.add(id);
		}
		
		mongo.findWithOptions(user_db, User.findByIDS(ids), Model.getFindOptions("name", "lastname", "email", "image"),  res -> {
			
			if(res.succeeded()){
				JsonArray result = new JsonArray();
				List<JsonObject> users = res.result();
				for(JsonObject user : users){
					user.put("permission", userIDs.get(user.getString("_id")));
					result.add(cleanJson(user));
				}
				
				event.response().end(result.encode());
			} else {
				returnError(event, 404);
			}
		});
	
	}
	
	protected JsonObject cleanJson(JsonObject user){
		user.remove("password");
		return super.cleanJson(user);
	}

}
