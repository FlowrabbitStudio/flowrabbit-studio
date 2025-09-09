package ai.flowrabbit.migration;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.model.Team;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Invitation;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.util.DB;

public class MigrateTeam {
	
	private MongoClient mongo;
	
	private Logger logger = LoggerFactory.getLogger(MigrateTeam.class);

	
	public MigrateTeam(MongoClient mongo){
		this.mongo = mongo;
	}
	
	public void run(){
		System.err.println("MigrateTeam.run() > enter()");
		
		String inv_db = DB.getTable(Invitation.class);
		String acl_db = DB.getTable(Team.class);
		
		
		mongo.find(DB.getTable(App.class), Model.all(), res->{
			if(res.succeeded()){
				List<JsonObject> apps = res.result();
				logger.info("run() > Port " +apps.size() + " apps!");
				for(JsonObject app : apps){
					String appID = app.getString("_id");
					if(app.containsKey("users")){
						logger.info("run() > App " +appID + " port users"); 
						
						JsonObject users = app.getJsonObject("users");
						Set<String> usersIDs = users.fieldNames();
						for(String userID : usersIDs){
							JsonObject acl = Team.create(userID, appID, users.getInteger(userID));
					
							mongo.insert(acl_db, acl, aclWrite ->{
								if(!aclWrite.succeeded()){
									logger.error("run() Could not save ACL : " + acl.encode()); 
									aclWrite.cause().printStackTrace();
								} else {
									logger.info("run() Created acl > " + aclWrite.result());
									
								}
							});
						}
					
					}
					
					if(app.containsKey("invitations")){
						logger.info("run() > App " + app.getString("_id") + " port invitations"); 
						
						JsonObject invs = app.getJsonObject("invitations");
						Set<String> invIDs = invs.fieldNames();
						for(String invID : invIDs){
							
							JsonObject inv = Invitation.create(invID, appID, invs.getInteger(invID));
							
							mongo.insert(inv_db, inv, invWrite ->{
							
								if(!invWrite.succeeded()){
									logger.error("run() Could not save Invitation" + inv.encode()); 
									invWrite.cause().printStackTrace();
								} else {
									logger.info("run() Created invitation > " + invWrite.result());
								
								}
							});
						}
					}
					
				}
				
				
			} else {
				System.err.println("MigrateTeam.run() Could not load apps");
			}
		});
		
		
		System.err.println("MigrateTeam.acl() > exit()");
	}

}
