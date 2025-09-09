package ai.flowrabbit.validation;

import ai.flowrabbit.model.OrganizationTeam;
import ai.flowrabbit.services.TokenService;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.ArrayList;
import java.util.List;

import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.ext.web.RoutingContext;

public class UserValidator extends MongValidator implements Validator{
	
	private String user_db = DB.getTable(User.class);

	public UserValidator(MongoClient client) {
		super(client);
	}


	
	@Override
	public void validate(RoutingContext event, JsonObject json, boolean isCreate, Handler<List<String>> handler) {
		List<String> errors = new ArrayList<String>();

		if (json.containsKey("orgInvite")) {
			String orgInvite = json.getString("orgInvite");
			try {
				JsonObject invite = TokenService.getOrgInvite(orgInvite);
				String inviteEmail = invite.getString("email");
				String userEmail = json.getString("email");
				if (!inviteEmail.equals(userEmail)) {
					errors.add("user.invite.invalid");
				}

				int permission = invite.getInteger(OrganizationTeam.PERMISSION);
				if (permission >= OrganizationTeam.OWNER) {
					errors.add("user.invite.invalid");
				}
			} catch (Exception e) {
				errors.add("user.invite.error");
			}
		}


		User user = mapper.fromVertx(json, User.class);
		
		if(user!=null){

			if(user.getEmail()== null || user.getEmail().isEmpty()){
				errors.add("user.email.invalid");
			}
			
			if(user.getPassword()!=null && user.getPassword().length() < 6){
				errors.add("user.password.invalid");
			}
			
			if(isCreate){
				if(!user.getTos()){
					errors.add("user.tos.invalid");
				}
				client.count(user_db, User.findByEmail(user.getEmail()), count -> {
					if(count.succeeded()){
						if(count.result() > 0){
							errors.add("user.email.not.unique");
						}
					} else {
						errors.add("user.validation.db");
					}
					handler.handle(errors);
				});
			} else {
				handler.handle(errors);
			}
		} else {
			errors.add("user.validation.json");
			handler.handle(errors);
		}
	}
}
