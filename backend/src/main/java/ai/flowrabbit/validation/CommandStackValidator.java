package ai.flowrabbit.validation;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Collections;
import java.util.List;

public class CommandStackValidator implements Validator{

	@Override
	public void validate(RoutingContext event, JsonObject obj, boolean isUpdate, Handler<List<String>> handler) {
		handler.handle(Collections.emptyList());
		
	}

}
