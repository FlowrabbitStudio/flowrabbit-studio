package ai.flowrabbit.validation;

import java.util.List;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public interface Validator {

	public void validate(RoutingContext event, JsonObject obj, boolean isUpdate, Handler<List<String>> handler);
	
}
