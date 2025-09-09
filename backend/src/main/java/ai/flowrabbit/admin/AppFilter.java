package ai.flowrabbit.admin;

import io.vertx.core.json.JsonObject;

import java.util.List;

import ai.flowrabbit.util.MongoFilter;

public class AppFilter implements MongoFilter<List<JsonObject>, List<JsonObject>>{

	@Override
	public List<JsonObject> filter(List<JsonObject> input) {
		
		for(JsonObject o : input){
			if(o.containsKey("screens")){
				o.put("screenCount", o.getJsonObject("screens").size());
			}
			if(o.containsKey("widgets")){
				o.put("widgetCount", o.getJsonObject("widgets").size());
			}

			o.remove("screens");		
			o.remove("widgets");
			o.remove("lines");
			o.remove("templates");
			o.remove("groups");
			o.put("id", o.getString("_id"));
		}
		
		return input;
	}

}
