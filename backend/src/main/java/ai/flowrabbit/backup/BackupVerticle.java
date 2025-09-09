package ai.flowrabbit.backup;

import java.util.List;

import ai.flowrabbit.Main;
import ai.flowrabbit.model.AppEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Metric;
import ai.flowrabbit.util.DB;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;

public class BackupVerticle extends AbstractVerticle {
	
	public static final String BACKUP_BUS_APP = "matc.backup.app";
	
	public static final String BACKUP_BUS_USERS = "matc.backup.users";
	
	protected String metricTable;	
	
	private static Logger logger = LoggerFactory.getLogger(BackupVerticle.class);

	private static BackupVerticle instance;
	
	private final Vertx vertx;
	
	private final MongoClient client;
	
	private final IBackupStorage storage;
	
	private final String imageFolder;

	private long timerID;
	
	public BackupVerticle(Vertx vertx, MongoClient client, IBackupStorage storage, String imageFolder) {
		logger.error("constructor()"); 
		this.vertx = vertx;
		this.client = client;
		this.storage = storage;
		this.imageFolder = imageFolder;
		this.metricTable = DB.getTable(Metric.class);
	}

	public static synchronized BackupVerticle create(Vertx vertx, MongoClient client,  IBackupStorage storage, String imageFolder){
		if(instance == null){
			/**
			 * Deploy ONE instance as worker
			 */
			DeploymentOptions options = new DeploymentOptions().setWorker(true);
			instance = new BackupVerticle(vertx, client, storage, imageFolder);
			vertx.deployVerticle(instance, options, h ->{
				if(!h.succeeded()){
					logger.error("constructor() > Could not deploy BackupVerticle");
				}
			});
		}
		return instance;
	}
	

	@Override
	public void start() {
		logger.info("start() > enter");
		
		try{
			/**
			 * We query periodically for apps that need backup. If we find some,
			 * we push the ids to the bus, and let the handle method call the backup service.
			 * The bus will also be used by the backup rest
			 */
			timerID = vertx.setPeriodic(60 * 60 * 1000, l ->{
				this.checkBackup();
				this.checkUsers();
			});
			this.checkBackup();
			vertx.eventBus().consumer(BACKUP_BUS_APP, this::backupApp);
			vertx.eventBus().consumer(BACKUP_BUS_USERS, this::backupUsers);
		} catch(Exception e){
			logger.error("start ()Could not start");
		}
		
		logger.debug("start() > exit");
	}
	
	private void checkBackup() {
		logger.error("checkBackup() > enter");

		try{
			client.findWithOptions(DB.getTable(App.class), App.findDirty(), new FindOptions().setFields(App.summaryFields()), res ->{
				if (res.succeeded()){
					List<JsonObject> apps = res.result();
					logger.info("checkBackup() > Found Dirty: " + apps.size());

					for (JsonObject app : apps) {
						logger.info("checkBackup() > Backup " + app.getString("_id"));
						JsonObject msg = new JsonObject();
						msg.put("appID", app.getString("_id"));
						long start = System.currentTimeMillis();
						vertx.eventBus().send(BACKUP_BUS_APP, msg, res2 -> {
							if (res2.succeeded()) {
								long size = (long) res2.result().body();
								long end = System.currentTimeMillis();
								long duration = end - start;
								logger.info("checkBackup() > Done " + app.getString("_id") + " > size " + size);
								this.logMetric("checkBackup", duration, size);
								AppEvent.send(vertx.eventBus(), Main.ADMIN, AppEvent.TYPE_BACKUP);
							} else {
								logger.info("checkBackup() > Error: " + app.getString("_id"));
							}
						});
					}

				} else {
					logger.error("handle() > Could not find dirty", res.cause());
				}
			});
		} catch (Exception e) {
			logger.error("handle() > Exception", e);
		}
	}
	
	public void logMetric(String method, long ms, long size){
		JsonObject timeMeasurent = new JsonObject()
				.put("c", "BackupVehicle")
				.put("m", method)
				.put("created", System.currentTimeMillis())
				.put("t", ms)
				.put("s", size);
		
		this.client.save(metricTable, timeMeasurent, res -> {
			if (res.failed()){
				logger.error("logMetric() > Exception on save", res.cause());
			}
		});
	}
	

	@Override
	public void stop() {
		logger.info("stop() > enter");
		
		vertx.cancelTimer(timerID);
		
		logger.debug("stop() > exit");
	}


	public void backupApp(Message<JsonObject> message) {
		logger.info("backupApp() > enter");
		
		JsonObject json = message.body();
		if (json.containsKey("appID")){
			String appID = json.getString("appID");
			BackupService service = new BackupService(client, imageFolder, storage);
			service.backupApp(appID, res -> {
				if (res.success()) {
					setAppNotDirty(appID, res.size());
				} else {
					logger.error("backupApp() > Service returned false");
				}
				// make sure we just send primitive
				message.reply(res.size());
			});
		} else {
			logger.error("backupApp() > NO app ID");
			message.reply(false);
		}
		
		logger.info("backupApp() > exit");
	}
	
	public void setAppNotDirty(String appID, long size) {
		logger.info("setAppNotDirty() > enter " + appID); 
		
		JsonObject data = new JsonObject()
				.put("isDirty", false)
				.put("sizeBackup", size)
				.put("lastBackup", System.currentTimeMillis());
		
		JsonObject update = new JsonObject()
				.put("$set", data);

		client.updateCollection(DB.getTable(App.class), App.findById(appID), update, res -> {
			if (res.failed()){
				logger.error("setAppNotDirty() > Could not set dirty" + appID);
			}
		});
	}

	public void checkUsers() {
		logger.debug("backupUsers() > enter");

		BackupService service = new BackupService(client, imageFolder, storage);
		long start = System.currentTimeMillis();
		service.backupUsers(res -> {
			if (!res.success()) {
				logger.error("backupUsers() > Could not backup users");
			}
			long end = System.currentTimeMillis();
			this.logMetric("backupUsers", end-start, res.size());
		});

		logger.info("backupUsers() > exit");
	}
	
	public void backupUsers(Message<JsonObject> message) {
		logger.debug("backupUsers(bus) > enter");
				
		BackupService service = new BackupService(client, imageFolder, storage);
		long start = System.currentTimeMillis();
		service.backupUsers(res -> {
			if (!res.success()) {
				logger.info("backupUsers() > Could not backup users");
			}
			message.reply(res.size());
			long end = System.currentTimeMillis();
			this.logMetric("backupUsers", end-start, res.size());
		});
		
		logger.info("backupUsers() > exit");
	}
	

}
