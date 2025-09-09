package ai.flowrabbit.rest;

import ai.flowrabbit.util.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.bus.MailHandler;
import ai.flowrabbit.util.Domain;
import ai.flowrabbit.util.Mail;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ContactRest {


	private Logger logger = LoggerFactory.getLogger(ContactRest.class);
	
	public void send(RoutingContext event) {
		Domain domain = Domain.get(event);
		
		JsonObject json = event.getBodyAsJson();
		if(json!=null){
		
			String message = json.getString("message");
			logger.info("send() >" + message);
			json = json.put("quant-ux-ui-version", Util.getUIVersion(event));

			Mail.to(domain.getAdmin())
				.subject("Contact Form")
				.payload(json)
				.template(MailHandler.TEMPLATE_CONTACT)
				.send(event);
			
		}
		
		event.response().end("{}");
	}
}
