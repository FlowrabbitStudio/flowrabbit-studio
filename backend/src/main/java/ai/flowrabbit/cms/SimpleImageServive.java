package ai.flowrabbit.cms;

import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.Acl;
import ai.flowrabbit.acl.RoleACL;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.REST;
import io.vertx.core.Handler;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.RoutingContext;

public class SimpleImageServive extends REST {
	
	private final String imageFolder;
	
	private long imageSize = 1024 * 1024;
	
	private Logger logger = LoggerFactory.getLogger(SimpleImageServive.class);
	
	private final Acl acl;
		
	public SimpleImageServive(String folder, long mx) {
		logger.info("constructor() > " + folder);
		this.imageSize = mx;
		this.imageFolder = folder;
		this.acl = new RoleACL()
			.create(User.ADMIN)
			.delete(User.ADMIN)
			.write(User.ADMIN)
			.read(User.GUEST);
	}
	

	/********************************************************************************************
	 * Find all images
	 ********************************************************************************************/


	public Handler<RoutingContext> list() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				list(event);
			}

			
		};
	}
	
	private void list(RoutingContext event) {
		this.acl.canWrite(getUser(event), event, allowed -> {
			if (allowed) {
				
				JsonArray result = new JsonArray();
				FileSystem fs = event.vertx().fileSystem();
			
				List<String> files = fs.readDirBlocking(imageFolder);
				for(String file : files){
					
					if(file.indexOf(imageFolder) ==0){
						file = file.substring(imageFolder.length(), file.length());
					}
					
					result.add(file);
				}
				
				returnJson(event, result);
				
			} else {
				error("find", "User "+ getUser(event) + " tried to list image to "+ event.request().path());
				returnError(event, 405);
			}
		});
		
	}
	
	

	/********************************************************************************************
	 * Set Image
	 ********************************************************************************************/

	public Handler<RoutingContext> setImage() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				setImage(event);
			}
		};
	}

	public void setImage(RoutingContext event) {
		
	
		this.acl.canWrite(getUser(event), event, allowed -> {
			if (allowed) {
				uploadImage(event);
			} else {
				error("setImage", "User "+ getUser(event) + " tried to upload image to "+ event.request().path());
				returnError(event, 405);
			}
		});
		
	
	}
	
	public void uploadImage(RoutingContext event) {
			
		Set<FileUpload> files = event.fileUploads();
		
		try{
			FileSystem fs = event.vertx().fileSystem();
			for(FileUpload file : files){
				String uploadedFileName =  file.uploadedFileName();
				if(checkImage(file)){
					String dest = imageFolder + "/"+file.fileName();
					fs.moveBlocking(uploadedFileName, dest);
				} else {
					this.logger.error("uploadImage() > Not good " + file.fileName());
					fs.deleteBlocking(uploadedFileName);
				}
			
				
			}
			returnOk(event, "image.upload.ok");
		} catch(Exception e){
			this.logger.error("uploadImage() > Error " + e.getMessage());
			e.printStackTrace();
			returnError(event, 405);
		}
	}
	
	
	
	
	private boolean checkImage(FileUpload file) {
		/**
		 * FIXME: add mime type checking in here too!
		 */
		return file.size() < this.imageSize;
	}

	
	
	/********************************************************************************************
	 * Get Image
	 ********************************************************************************************/


	public Handler<RoutingContext> getImage() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				getImage(event);
			}
		};
	}
	

	public void getImage(RoutingContext event) {
		String image = event.request().getParam("image");
		logger.info("getImage() >  " + image);
	
		this.acl.canRead(getUser(event), event, allowed -> {
			if (allowed) {
				getImage(event, image);
			} else {
				logger.error("getImage() > " + getUser(event) + " tried to read the image " +event.request().path() );
				returnError(event, 404);
			}
		});
	}
	

	public void getImage(RoutingContext event, String image) {
		String file = imageFolder +"/" + image ;
		FileSystem fs = event.vertx().fileSystem();
			
		fs.exists(file, exists-> {
			if(exists.succeeded() && exists.result()){
			
				event.response().putHeader("Cache-Control", "no-transform,public,max-age=86400,s-maxage=86401");
				event.response().putHeader("ETag", image);
				event.response().sendFile(file);
			} else {
				error("getImage", "Not file with name "+ file);
				returnError(event,404);
			}
		});
	}


	

	/********************************************************************************************
	 * delete
	 ********************************************************************************************/

	public Handler<RoutingContext> delete() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				delete(event);
			}
		};
	}

	public void delete(RoutingContext event) {
		
		String image = event.request().getParam("image");
		String file = imageFolder +"/" + image ;
		logger.error("delete() > enter " +  file);
		
		FileSystem fs = event.vertx().fileSystem();
		fs.deleteBlocking(file);
		
		returnOk(event,"image.deleted.ok");
		
		
	}



}
