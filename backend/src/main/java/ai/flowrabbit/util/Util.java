package ai.flowrabbit.util;

import io.vertx.core.file.FileSystem;
import io.vertx.ext.web.FileUpload;

import java.awt.image.BufferedImage;
import java.io.File;
import java.util.ArrayList;
import java.util.UUID;

import javax.imageio.ImageIO;

import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCrypt;

import com.google.common.base.Charsets;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;


public class Util {

	private static final Logger logger = LoggerFactory.getLogger(Util.class);
	 
	public static String getRandomString(){
		String r= hashPassword(UUID.randomUUID().toString());
		r = r.replace('?', 'x');
		r = r.replace('&', 'd');
		r = r.replace('$', 'a');
		r = r.replace('/', 'z');
		r = r.replace('.', 'y');
		return r;
	}
	
	public static BufferedImage resample(String filename,  int maxWidth) {
		try{
			File file = new File(filename);
			
			if(file.exists()){
				BufferedImage image = ImageIO.read(file);
//				if(maxWidth < image.getWidth()){
//
//					logger.info("resample() > Resample from + " + image.getWidth() + " to " + maxWidth + " (" + filename + ")");
//
//					int h = (int)(image.getHeight() * ((double)maxWidth  / (double)image.getWidth()));
//					image = Scalr.resize(image, Scalr.Method.QUALITY, Scalr.Mode.FIT_TO_WIDTH,  maxWidth, h);
//
//					if(file.exists()){
//						file.delete();
//					}
//					ImageIO.write(image, Util.getFileType(filename), file);
//				}
				return image;
			}
			
		} catch(Exception e){
			logger.error("resample() > could not convert psd > "+  filename);
		}
		
		return null;
	}
	
	
	public static void cleanUpUploads( ArrayList<FileUpload> delete, FileSystem fs){
		for(FileUpload file : delete){
			fs.delete(file.uploadedFileName(), res->{
				if(!res.succeeded()){
					res.cause().printStackTrace();
				}
			});
		}
	}

	public static String getUIVersion (RoutingContext event) {

		String cookieValue = event.request().headers().get("cookie");
		if (cookieValue != null) {
			String[] values= cookieValue.split(";");
			for (String value : values) {
				if (value.contains("quant-ux-ui")) {
					String[] cookieValues = value.split("=");
					if (cookieValues.length == 2) {
						return cookieValues[1];
					}
				}
			}
			return cookieValue;
		}
		return "????";
	}


	public static String getUUID(){
		return UUID
				.randomUUID()
				.toString()
				.replace("-", "");
	}

	public static String sha256(String s){
		HashFunction hf = Hashing.sha256();
		String hash = hf.hashString(s,Charsets.UTF_8).toString();
		return hash;
	}
	
	public static boolean matchPassword(String candidate, String storedHash){
		try{
			return BCrypt.checkpw(candidate, storedHash);
		} catch(Exception e){
			logger.error("matcPassword() > Something went wrong when using brypt", e);
		}
		return false;
	}	
	
	public static String hashPassword(String s){
		return BCrypt.hashpw(s, BCrypt.gensalt());
	}

	public static String getFileType(String fileName) {
		if(fileName!=null){
			return fileName.substring(fileName.lastIndexOf(".")+1, fileName.length()).toLowerCase();
		}
		return null;
	}
	
	public static String getFileName(String fileName) {
		if(fileName!=null){
			return fileName.substring(0, fileName.lastIndexOf("."));
		}
		return null;
	}

	public static BufferedImage getImage(String filename) {
		try{
			File file = new File(filename);
			if(file.exists()){
				BufferedImage image = ImageIO.read(file);
				return image;
			}
		} catch(Exception e){
			logger.error("getImage() > Could not get size > "+  filename);
		}
		return null;
	}
}
