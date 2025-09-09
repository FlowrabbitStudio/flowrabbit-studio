package ai.flowrabbit.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.bus.MailHandler;
import ai.flowrabbit.util.Mail;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class LogRest {

	private Logger logger = LoggerFactory.getLogger(LogRest.class);
	
	public void log(RoutingContext event) {
		
		JsonObject json = event.getBodyAsJson();
		if (json!=null){
		
			String message = json.getString("json");
			logger.error(message);

			Mail.to("klaus.schaefers@quant-ux.com")
				.subject("Client Error")
				.payload(json)
				.template(MailHandler.TEMPLATE_CLIENT_ERROR)
				.send(event);
			
		}
		
		event.response().end("{}");
	}

}
