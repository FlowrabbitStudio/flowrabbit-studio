package ai.flowrabbit.backup;

import ai.flowrabbit.model.*;
import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import com.google.common.io.CharStreams;
import com.google.common.io.Closeables;

import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.SyncMongoClient;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.Map.Entry;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

public class BackupService {
	
	private final Logger logger = LoggerFactory.getLogger(BackupService.class);
	
	private final MongoClient client;
	
	private final SyncMongoClient syncClient;
	
	private final String imageFolder;
	
	private final IBackupStorage storage;
	
	
	public BackupService(MongoClient client, String imageFolder, IBackupStorage storage){
		this.client = client;
		this.storage = storage;
		this.syncClient = new SyncMongoClient(client);
		this.imageFolder = imageFolder;
	}
	
	public BackupService(MongoClient client, String imageFolder){
		this.client = client;
		this.storage = null;
		this.syncClient = new SyncMongoClient(client);
		this.imageFolder = imageFolder;
	}
	
	public void backupUsers (Handler<BackupResult> handler){
		logger.info("backupUsers() > enter");
		client.find(DB.getTable(User.class), Model.all(), res -> {
			if (res.succeeded()){
				JsonArray users = new JsonArray();
				List<JsonObject> result = res.result();
				for (JsonObject user : result){
					user.remove("password");
					user.remove("role");
					users.add(user);
				}
				backupUsers(users, handler);
			  	 
			} else {
				logger.error("backupUsers() > Error while loading users from mongo", res.cause());
			}
		});
	}
	
	public void backupUsers (JsonArray users , Handler<BackupResult> handler){
		logger.info("backupUsers() > enter " + users.size());
		
	   	try {
	   		/**
	   		 * Write to temp
	   		 */
			File temp = File.createTempFile("users",".tmp");
			FileWriter writer = new FileWriter(temp);
			writer.write(users.encodePrettily());
			writer.close();
	
			/**
			 * Add to storage
			 */
			storage.writeUsers(temp);
			
			/**
			 * call handler
			 */
			handler.handle(new BackupResult(true, temp));
			
			/**
	 	     * Delete temp
	 	     */
			temp.delete();
			
			
		} catch (IOException e){
			logger.error("backupUsers() > error writing temp ", e);
			handler.handle(new BackupResult(false, e));
		}
	}
	
	public void backupApp(String appID, Handler<BackupResult> handler){
		logger.info("backupApp() > " + appID);
		
		final Map<String,String> jsons = new HashMap<>();
		client.findOne(DB.getTable(App.class), Model.findById(appID), null, res -> {
			if (res.succeeded() ){
				if (res.result()!=null){
					jsons.put(DB.getTable(App.class), res.result().encodePrettily());
					List<String> parts =  Lists.newArrayList(App.getModelParts());
					this.laodAppPart(appID, jsons, parts, handler);
				} else {
					logger.error("backupApp() > Could find app: " + appID);
				}
			} else {
				logger.error("backupApp() > Could not load app: " + appID, res.cause());
			}
		});
	}
	
	private void laodAppPart(String appID, Map<String,String> jsons, List<String> parts, Handler<BackupResult> handler){
		/**
		 * Run through all model parts. If the list is empty, we will
		 * write the result. 
		 * Improve: Could we do this as promises
		 */
		if (!parts.isEmpty()){
			String part = parts.remove(0);
			logger.debug("laodAppPart() " + part + "@" + appID); 
			client.find(part, AppPart.findByApp(appID), res ->{
				if (res.succeeded()){
					JsonArray list = new JsonArray();
					List<JsonObject> result = res.result();
					for (JsonObject obj : result){
						list.add(obj);
					}
					jsons.put(part, list.encodePrettily());
					/**
					 * Call for next part
					 */
					laodAppPart(appID, jsons, parts, handler);
				} else {
					logger.error("laodAppPart() > Could not load app-part: " + part + "@"+ appID, res.cause());
				}
			});
		} else {
			logger.debug("laodAppPart() > exit " + appID); 
			write(appID, jsons, handler);
		}
	}

	public void write(String appID, Map<String,String> jsons, Handler<BackupResult> handler) {
		logger.debug("write() > enter " + appID); 
		try {
			//create a temp file
	 	   	File temp = File.createTempFile(appID, ".tmp");
	 	   	
	 	
		 	ZipOutputStream out = new ZipOutputStream(new FileOutputStream(temp));
		 	
		 	/**
		 	 * Write JSONS
		 	 */
		 	for (Entry<String, String> entry : jsons.entrySet()){
		 		logger.debug("write() >  " + entry.getKey()); 
		 		
		 		ZipEntry e = new ZipEntry(entry.getKey() + ".json");
			 	out.putNextEntry(e);
			 	byte[] data = entry.getValue().getBytes();
			 	out.write(data, 0, data.length);
			 	out.closeEntry();
		 	}
		 	
		 	/**
		 	 * Write images
		 	 */
		 	Set<String> written = new HashSet<>();
		 	if (jsons.containsKey(DB.getTable(Image.class))){
		 		JsonArray images= new JsonArray(jsons.get(DB.getTable(Image.class)));
		 		for (int i = 0; i< images.size(); i++){
		 			JsonObject image = images.getJsonObject(i);
		 			if (image.containsKey("url")) {
		 				String url = image.getString("url");
		 				File imageFile = new File(this.imageFolder + "/" + url);
		 				if (imageFile.exists() && !written.contains(url)) {
		 					writeImage(out, imageFile);
		 					written.add(url);
		 				} else {
		 					logger.error("write() > Cannot find image file " + imageFile.getAbsolutePath());
		 				}	
		 			}
		 		}
		 	}
	 	    out.close();
 	   	
	 	    try {
		 	    /**
		 	     * Write to storage
		 	     */
		 	    if (this.storage != null) {
			 	    storage.writeApp(appID, temp);
			 	   	
			 	    /**
			 	     * call handler
			 	     */
					handler.handle(new BackupResult(true, temp));
					
			 	    /**
			 	     * Delete temp
			 	     */
				 	temp.delete();
		 	    } else {
		 	    	/**
		 	    	 * The download handler will handle the temp file
		 	    	 * and pipe it the the output stream. Afterwards, that
		 	    	 * handler must delete it.
		 	    	 */
		 	    	handler.handle(new BackupResult(true, temp));
		 	    }
	 	    } catch (Exception e) {
	 	    	logger.error("write() > error on handle result " + appID, e); 
	 	    	temp.delete();
	 	    }
		 	
			logger.info("write() > exit " + appID); 
		} catch (Exception e){
			logger.error("write() > Got error", e); 
			handler.handle(new BackupResult(false, e));
		}
	}

	

	public void writeImage(ZipOutputStream out, File imageFile) throws IOException, FileNotFoundException {
		try {
			ZipEntry e = new ZipEntry(imageFile.getName());
			out.putNextEntry(e);
			
			FileInputStream in = new FileInputStream(imageFile);
			byte[] buffer = new byte[1024];
			int len;
			while ((len = in.read(buffer)) > 0) {
				out.write(buffer, 0, len);
			}
			in.close();
			out.closeEntry();
			logger.info("writeImage() > wrote " + imageFile.getName());
		} catch (Exception e){
			logger.error("writeImage() > could not zip file", e);
		}
	}

	public List<RestoreResult> restoreAppsAndUsers() {
		logger.error("restoreAppsAndUsers() > enter");
		List<RestoreResult> result = new ArrayList();

		List<String> filesNames = this.storage.getAllFiles();
		for (String fileName : filesNames){
			try {
				File file = this.storage.getFile(fileName);

				if ("users.json".equals(fileName)){
					RestoreResult userResult = restoreUsers(file);
					result.add(userResult);
				} else {
					RestoreResult appResult = restoreApp(file);
					result.add(appResult);
				}

				// S3 clients mus delete the file
				this.storage.onFileRestored(file);

			} catch (Exception e) {
				logger.error("restoreAppsAndUsers() > Could not restore   " + fileName);
				RestoreResult errorResult = new RestoreResult(fileName, true);
				errorResult.incError();
				result.add(errorResult);
			}
		}

		return result;
	}




	public RestoreResult restoreUsers(File file) throws IOException {
		logger.info("restoreUsers() > enter " + file.getName());
		RestoreResult result = new RestoreResult(file.getAbsolutePath(), true);

		try {
			String fileAsString = readString(file);
			restoreUser(result, fileAsString);
		} catch (IOException e) {
			logger.error("restoreUsers() > Could not restore", e);
			throw e;
		} 
		return result;
	}


	private void restoreUser(RestoreResult result, String fileAsString) {
		JsonArray users = new JsonArray(fileAsString);
		logger.info("restoreUsers() > Found " + users.size() + " users");

		List<JsonObject> dbUsers = syncClient.find(DB.getTable(User.class), Model.all());
		Set<String> usersId = new HashSet<>();
		for (JsonObject dbUser: dbUsers) {
			usersId.add(dbUser.getString("_id"));
		}


		for (int i=0; i < users.size(); i++){
			JsonObject user = users.getJsonObject(i);
			String oldId = user.getString("_id");
			if (!usersId.contains(oldId)) {
				String id = syncClient.insert(DB.getTable(User.class), user);
				if (id == null) {
					logger.info("restoreUsers() > Restored user:  " + user.getString("_id"));
					result.incRestored();
				} else  {
					logger.info("restoreUsers() > Error with  " + user.getString("_id") + " != " + id);
					result.incError();
				}
			} else {
				logger.info("restoreUsers() > User already in db: " + oldId);
				result.incIgnored();
			}
		}
	}


	public RestoreResult restoreApp(File file) throws Exception {
		logger.info("restoreApp() > enter " + file.getName());
		RestoreResult result = new RestoreResult(file.getAbsolutePath(), false);


		try {
			String appId = file.getName().split("\\.")[0];
			if (appId != null) {
				long count = syncClient.count(DB.getTable(App.class), App.findById(appId));
				if (count > 0) {
					logger.error("restoreApp() > return. App exists > " + appId);
					result.incIgnored();
					return result;
				}
			}

			ZipFile zipFile = new ZipFile(file);
			
			List<ZipEntry> images = new ArrayList<>();
			Enumeration<? extends ZipEntry> entries = zipFile.entries();		 
			while(entries.hasMoreElements()){
			     ZipEntry entry = entries.nextElement();
			     if (entry.getName().endsWith("png") || 
			         entry.getName().endsWith("jpg") || 
			         entry.getName().endsWith("jpeg") ||
			         entry.getName().endsWith(".gif")) {
			    	 images.add(entry);
				 }
			}
			        
			logger.info("restoreApp() > Found Images : " + images.size()); 
			
		
		    entries = zipFile.entries();		 
		    while(entries.hasMoreElements()){
		        ZipEntry entry = entries.nextElement();
		        logger.debug("restoreApp() > File " + entry.getName()); 
		        InputStream stream = zipFile.getInputStream(entry);
	        	String content = CharStreams.toString(new InputStreamReader(stream, Charsets.UTF_8));
	        	Closeables.closeQuietly(stream);
	        	if (entry.getName().endsWith("app.json")) {
	        		this.restoreObject(App.class, content);
	        		this.restoreImages(content, images, zipFile);
			    }
		        if (entry.getName().endsWith("team.json")) {
		        	this.restoreArray(Team.class, content);
		        }
		        if (entry.getName().endsWith("event.json")) {
		        	this.restoreArray(Event.class, content);
		        }
		        if (entry.getName().endsWith("testsetting.json")) {
		        	this.restoreArray(TestSetting.class, content);
		        }
		        if (entry.getName().endsWith("invitation.json")) {
		        	this.restoreArray(Invitation.class, content);
		        }
		        if (entry.getName().endsWith("image.json")) {
		        	this.restoreArray(Image.class, content);
		        }
		        if (entry.getName().endsWith("commandstack.json")) {
		        	this.restoreArray(CommandStack.class, content);
		        }
		        if (entry.getName().endsWith("annotation.json")) {
		        	this.restoreArray(Annotation.class, content);
		        }
		        if (entry.getName().endsWith("mouse.json")) {
		        	this.restoreArray(Mouse.class, content);
		        }
		    }
		    zipFile.close();
			result.incRestored();
		    
		}catch(Exception e){
			logger.error("restoreApp() > Error processing zip", e);
			throw e;
		}

		return result;
	}
	
	private void restoreImages(String appContent, List<ZipEntry> files, ZipFile zipFile) throws IOException {

		
		JsonObject app = new JsonObject(appContent);
		String appID = app.getString("_id");
		if (appID != null) {
			File folder = new File(imageFolder +"/" + appID);
			if (!folder.exists()){
				folder.mkdirs();
			}
			for (ZipEntry file: files){
				String target = imageFolder +"/" + appID + "/" + file.getName();
				if (!Files.exists(Paths.get(target))){
					try {
						InputStream is = zipFile.getInputStream(file);
						Files.copy(is, Paths.get(target));
						logger.info("restoreImages() > Restored " + target);
					} catch (IOException e) {
						logger.error("restoreImages() > Could not write " + target, e);
						throw e;
					}
				} else {
					logger.error("restoreImages() > Image exists: " + target);
				}
			}
		} else {
			logger.error("restoreImages() > No app ID, cannot restore images");
		}
	}

	void restoreObject(Class<?> cls, String content) {
		try {
			JsonObject object = new JsonObject(content);
			restoreObject(cls, object);
		} catch (Exception e) {
			logger.info("restoreObject() > Error with  " + cls.getName() + " " + content );
			throw e;
		}
	}
	
	void restoreArray(Class<?> cls, String content) {
		JsonArray objects = new JsonArray(content);
		for (int i=0; i < objects.size(); i++){
			JsonObject object = objects.getJsonObject(i);
			restoreObject(cls, object);
		}
	}
	
	
	void restoreObject(Class<?> cls, JsonObject object) {
		String id = syncClient.insert(DB.getTable(cls), object);
		if (id == null){
			logger.info("restoreObject() > Restored  " + cls.getSimpleName() + " " + object.getString("_id") );
		} else {
			logger.info("restoreObject() > Error with  " + object.getString("_id")  +" != "  + id );
			throw new IllegalStateException("Could not recreate object in db!");
		}
	}

	private String readString(File file) throws IOException {
		FileInputStream stream = new FileInputStream(file);
		String content = CharStreams.toString(new InputStreamReader(stream, Charsets.UTF_8));
		Closeables.closeQuietly(stream);
		return content;
	}



}
