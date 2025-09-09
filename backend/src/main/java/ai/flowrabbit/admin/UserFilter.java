package ai.flowrabbit.admin;

import io.vertx.core.json.JsonObject;

import java.util.List;

import ai.flowrabbit.util.MongoFilter;

public class UserFilter implements MongoFilter<List<JsonObject>, List<JsonObject>>{

	@Override
	public List<JsonObject> filter(List<JsonObject> input) {
		for(JsonObject o : input){
			o.remove("password");		
			o.put("id", o.getString("_id"));
		}
		return input;
	}

}