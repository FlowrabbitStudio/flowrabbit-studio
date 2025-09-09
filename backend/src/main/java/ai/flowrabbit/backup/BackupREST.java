package ai.flowrabbit.backup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.util.REST;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class BackupREST extends REST{

	private Logger logger = LoggerFactory.getLogger(BackupREST.class);
	
	private AdminACL acl = new AdminACL();

	public void backupApp(RoutingContext event){
		logger.info("backupApp() > enter");
		acl.isAdmin(getUser(event), event, isAllowed -> {
			if (isAllowed){
				String appID = event.pathParam("appID");
				if (appID != null && !appID.isEmpty()){
					JsonObject msg = new JsonObject();
					msg.put("appID", appID);
					event.vertx().eventBus().send(BackupVerticle.BACKUP_BUS_APP, msg, res ->{
						logger.info("backupApp() > exit" + res.succeeded());
						if (res.succeeded()){
							long size = (long) res.result().body();
							JsonObject result = new JsonObject()
									.put("details", "backup.app.done")
									.put("size", size)
									.put("status", "ok");
							
							returnJson(event, result);
						} else {
							returnError(event, 405);
						}
					});
				} else {
					logger.error("backupApp() > NO APP ID");
					returnOk(event, "backup.app.error.app");
				}
			} else {
				logger.error("backupApp() > NOT ADMIN");
				returnOk(event, "backup.app.error");
			}
		});
	}

	public void backupUsers(RoutingContext event){
		acl.isAdmin(getUser(event), event, isAllowed -> {
			if (isAllowed){
				logger.debug("backupUsers() > enter");
				event.vertx().eventBus().send(BackupVerticle.BACKUP_BUS_USERS, new JsonObject(), res->{
					if (res.succeeded()){
						long size = (long) res.result().body();
						JsonObject result = new JsonObject()
								.put("details", "backup.user.done")
								.put("size", size)
								.put("status", "ok");
						
						returnJson(event, result);
					} else {
						returnError(event, 405);
					}
				});
			} else {
				logger.error("backupUsers() > NOT ADMIN");
				returnOk(event, "backup.user.error");
			}
		});
	}
}
