package ai.flowrabbit.cms;

import java.util.Collection;

import ai.flowrabbit.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public class Content extends Model{
	
	public static final String FIELD_KEY = "key";
	
	public static final String FIELD_LANGUAGE = "ln";

	public static final String FIELD_TXT = "txt";
	
	public static final String FIELD_TITLE = "title";
	
	public static final String FIELD_CATEGORY = "category";
	
	public static final String FIELD_IMG = "img";
	
	public static final String FIELD_DATE = "date";
	
	public static final String FIELD_PREVIEW = "preview";

	public static JsonObject findByKeys(Collection<String> ids){
		JsonArray array = new JsonArray();
		for(String id : ids){
			array.add(id);
		}
		return findByKeys(array);
	}
	
	public static JsonObject findByKeys(JsonArray ids){
		 return new JsonObject()
	    	.put(FIELD_KEY, new JsonObject().put("$in", ids));
	}
	
	
	public static JsonObject findByKey(String key){
		 return new JsonObject()
	    	.put(FIELD_KEY, key);
	}
	
	
	public static JsonObject findByCategory(String key){
		 return new JsonObject()
	    	.put(FIELD_CATEGORY, key);
	}
}
