package ai.flowrabbit.admin;

import io.vertx.core.json.JsonObject;


import ai.flowrabbit.util.MongoFilter;

public class AppFilter2 implements MongoFilter<JsonObject, JsonObject>{


	@Override
	public JsonObject filter(JsonObject o) {
		
		
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
		
		
		return o;
	}
}
