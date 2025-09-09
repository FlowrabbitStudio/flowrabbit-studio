package ai.flowrabbit.services;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import ai.flowrabbit.model.OrganizationTeam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import ai.flowrabbit.model.User;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class TokenService {


	private static Logger logger = LoggerFactory.getLogger(TokenService.class);

	private static String secret = null;
	
	private static int daysToExpire = 7;
	
	private static final String ISSUER = "MATC";
	
	private static final String CLAIM_ID = "id";
	
	private static final String CLAIM_EMAIL = "email";
	
	private static final String CLAIM_NAME = "name";
	
	private static final String CLAIM_LASTNAME = "lastname";
	
	private static final String CLAIM_ROLE = "role";

	private static final String CLAIM_APP_ID = "appID";

	private static final String CLAIM_ORG_ID = "orgID";

	private static final String CLAIM_IS_PURCHASE = "isPurchase";

	private static final String CLAIM_PURCHASE_ID = "purchaseID";

	private static final String CLAIM_IS_USAGE = "isUsage";

	private static final String CLAIM_PREPAID_BUDGET_ID = "prepaidBudgetID";

	private static final String CLAIM_IS_PUB = "isPub";

	private static final String CLAIM_ORG_PERMISSION = "orgPermission";

	private static final String CLAIm_APP_PERMISSION = "appPermission";

	private static final String CLAIM_TOKEN_TYPE = "tokenType";

			
	public static void setSecret(String secret) {
		TokenService.secret = secret;
	}


	public static String getAppToken(User user, String appID, int permission) {
		return getAppToken(user, appID, null, permission);
	}

	public static String getStudioToken(User user, String appID, String orgID, int permission) {
		if (secret == null) {
			logger.error("getStudioToken() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}

		try {
			Date ttl = getTTL(daysToExpire);

			Algorithm algorithm = Algorithm.HMAC256(TokenService.secret);
			String token = JWT.create()
					.withIssuer(ISSUER)
					.withClaim(CLAIM_ID, user.getId())
					.withClaim(CLAIM_EMAIL, user.getEmail())
					.withClaim(CLAIM_NAME, user.getName())
					.withClaim(CLAIM_LASTNAME, user.getLastname())
					.withClaim(CLAIM_ROLE, User.GUEST)
					.withClaim(CLAIM_APP_ID, appID)
					.withClaim(CLAIm_APP_PERMISSION, permission)
					.withClaim(CLAIM_ORG_ID, orgID)
					.withClaim(CLAIM_TOKEN_TYPE, User.TOKEN_STUDIO)
					.withExpiresAt(ttl)
					.sign(algorithm);
			return token;

		} catch (JWTCreationException e) {
			logger.error("getStudioToken() > Some exception", e);
		}
		return "SomeError";
	}

	private static String getAppToken(User user, String appID, String orgID, int permission) {

		if (secret == null) {
			logger.error("getToken() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}

		try {
			Date ttl = getTTL(daysToExpire);

			Algorithm algorithm = Algorithm.HMAC256(TokenService.secret);
			String token = JWT.create()
					.withIssuer(ISSUER)
					.withClaim(CLAIM_ID, user.getId())
					.withClaim(CLAIM_EMAIL, user.getEmail())
					.withClaim(CLAIM_NAME, user.getName())
					.withClaim(CLAIM_LASTNAME, user.getLastname())
					.withClaim(CLAIM_ROLE, User.GUEST)
					.withClaim(CLAIM_APP_ID, appID)
					.withClaim(CLAIm_APP_PERMISSION, permission)
					.withClaim(CLAIM_ORG_ID, orgID)
					.withClaim(CLAIM_TOKEN_TYPE, User.TOKEN_APP)
					.withExpiresAt(ttl)
					.sign(algorithm);
			return token;

		} catch (JWTCreationException e){
			logger.error("getToken() > Some exception", e);
		}

		return "SomeError";
	}

	public static String getPublicAppToken(User user, String appID, String orgID, int permission, String tokenType) {

		if (secret == null) {
			logger.error("getToken() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}

		try {
			Date ttl = getTTL(daysToExpire);

			Algorithm algorithm = Algorithm.HMAC256(TokenService.secret);
			String token = JWT.create()
					.withIssuer(ISSUER)
					.withClaim(CLAIM_ID, user.getId())
					.withClaim(CLAIM_EMAIL, user.getEmail())
					.withClaim(CLAIM_NAME, user.getName())
					.withClaim(CLAIM_LASTNAME, user.getLastname())
					.withClaim(CLAIM_ROLE, User.GUEST)
					.withClaim(CLAIM_APP_ID, appID)
					.withClaim(CLAIm_APP_PERMISSION, permission)
					.withClaim(CLAIM_ORG_ID, orgID)
					.withClaim(CLAIM_IS_PUB, true)
					.withClaim(CLAIM_TOKEN_TYPE, tokenType)
					.withExpiresAt(ttl)
					.sign(algorithm);
			return token;

		} catch (JWTCreationException e){
			logger.error("getToken() > Some exception", e);
		}

		return "SomeError";
	}


	public static String getUsagePublicAppToken(User user, String appID, String orgID, String prepaidBudgetID, int permission) {

		if (secret == null) {
			logger.error("getToken() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}

		try {
			Date ttl = getTTL(daysToExpire);

			Algorithm algorithm = Algorithm.HMAC256(TokenService.secret);
			String token = JWT.create()
					.withIssuer(ISSUER)
					.withClaim(CLAIM_ID, user.getId())
					.withClaim(CLAIM_EMAIL, user.getEmail())
					.withClaim(CLAIM_NAME, user.getName())
					.withClaim(CLAIM_LASTNAME, user.getLastname())
					.withClaim(CLAIM_ROLE, User.GUEST)
					.withClaim(CLAIM_APP_ID, appID)
					.withClaim(CLAIm_APP_PERMISSION, permission)
					.withClaim(CLAIM_ORG_ID, orgID)
					.withClaim(CLAIM_PREPAID_BUDGET_ID, prepaidBudgetID)
					.withClaim(CLAIM_IS_PUB, true)
					.withClaim(CLAIM_IS_USAGE, true)
					.withClaim(CLAIM_TOKEN_TYPE, User.TOKEN_USAGE)
					.withExpiresAt(ttl)
					.sign(algorithm);
			return token;

		} catch (JWTCreationException e){
			logger.error("getToken() > Some exception", e);
		}

		return "SomeError";
	}

	public static String getToken (JsonObject user) {
		return getToken(user, daysToExpire);
	}
	
	public static String getToken (JsonObject user, int days) {
		
		if (secret == null) {
			logger.error("getToken() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}
		
		try {
			Date ttl = getTTL(days);
			
		    Algorithm algorithm = Algorithm.HMAC256(TokenService.secret);
		    String token = JWT.create()
		        .withIssuer(ISSUER)
		        .withClaim(CLAIM_ID, user.getString("_id"))
		        .withClaim(CLAIM_EMAIL, user.getString("email"))
		        .withClaim(CLAIM_NAME, user.getString("name"))
		        .withClaim(CLAIM_LASTNAME, user.getString("lastname"))
		        .withClaim(CLAIM_ROLE, user.getString("role"))
		        .withExpiresAt(ttl)
		        .sign(algorithm);
		    return token;
		} catch (JWTCreationException e){
			logger.error("getToken() > Some exception", e);
		}
		return "SomeError";
	}

	public static String getOrgInviteToken (String orgId, String email, int permission, int days) {

		if (secret == null) {
			logger.error("getOrgInviteToken() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}

		try {
			Date ttl = getTTL(days);

			Algorithm algorithm = Algorithm.HMAC256(TokenService.secret);
			String token = JWT.create()
					.withIssuer(ISSUER)
					.withClaim(CLAIM_EMAIL, email)
					.withClaim(CLAIM_ORG_ID, orgId)
					.withClaim(CLAIM_ORG_PERMISSION, permission)
					.withClaim(CLAIM_TOKEN_TYPE, User.TOKEN_INVITATION)
					.withExpiresAt(ttl)
					.sign(algorithm);
			return token;
		} catch (JWTCreationException e){
			logger.error("getOrgInviteToken() > Some exception", e);
		}
		return "SomeError";
	}

	public static Date getTTL(int days) {
		LocalDateTime plus7Days = LocalDateTime.now().plusDays(days);
		Date ttl = Date.from(plus7Days.atZone(ZoneId.systemDefault()).toInstant());
		return ttl;
	}

	public static String getExpiresAt(RoutingContext event) {
		String token = event.request().getHeader("Authorization");
		if (token != null && token.length() > 10) {
			token = token.substring(7);
			return getExpiresAt(token);
		}
		String queryToken = event.request().getParam("token");
		if (queryToken != null && !queryToken.isEmpty()) {
			return getExpiresAt(queryToken);
		}
		return "-";
	}


	public static String getExpiresAt (String token) {
		if (token != null) {
			try {
				DecodedJWT jwt = JWT.decode(token);
				return jwt.getExpiresAt().toString();
			} catch (Exception e) {
				logger.error("getExpiresAt() > Some  while parsing the token: " + token);
			}
		}
		return "-";
	}

	public static User getUser(String token) {

		if (secret == null) {
			logger.error("getUser() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}
		
		try {
		    Algorithm algorithm = Algorithm.HMAC256(secret);
		    JWTVerifier verifier = JWT.require(algorithm)
		        .withIssuer(ISSUER)
		        .build(); //Reusable verifier instance
		    DecodedJWT jwt = verifier.verify(token);
		    
		    String email = jwt.getClaim(CLAIM_EMAIL).asString();
		    String id = jwt.getClaim(CLAIM_ID).asString();
		    String role = jwt.getClaim(CLAIM_ROLE).asString();
		    String name = jwt.getClaim(CLAIM_NAME).asString();
		    String lastname = jwt.getClaim(CLAIM_LASTNAME).asString();

		    User user = new User(id, name, lastname, email, role);

			if (!jwt.getClaim(CLAIM_APP_ID).isNull() && !jwt.getClaim(CLAIm_APP_PERMISSION).isNull()) {
				String appID = jwt.getClaim(CLAIM_APP_ID).asString();
				int appPermission = jwt.getClaim(CLAIm_APP_PERMISSION).asInt();
				// In previous versions we reset the id. This caused
				// some functions to be falsely secure.
				// user.setId("");
				user.setAppID(appID);
				user.setAppPermission(appPermission);
				user.setRole(User.TOKEN);
			}

			if (!jwt.getClaim(CLAIM_TOKEN_TYPE).isNull()) {
				user.setTokenType(jwt.getClaim(CLAIM_TOKEN_TYPE).asString());
			}

			if (!jwt.getClaim(CLAIM_IS_PUB).isNull()) {
				user.setPubClaim(jwt.getClaim(CLAIM_IS_PUB).asBoolean());
			}

			if (!jwt.getClaim(CLAIM_ORG_ID).isNull() && !jwt.getClaim(CLAIM_ORG_ID).asString().isEmpty()) {
				user.setOrgID(jwt.getClaim(CLAIM_ORG_ID).asString());
			}

			if (!jwt.getClaim(CLAIM_PURCHASE_ID).isNull()) {
				user.setPurchaseID(jwt.getClaim(CLAIM_PURCHASE_ID).asString());
			}

			if (!jwt.getClaim(CLAIM_IS_PURCHASE).isNull()) {
				user.setPurchase(jwt.getClaim(CLAIM_IS_PURCHASE).asBoolean());
			}

			if (!jwt.getClaim(CLAIM_PREPAID_BUDGET_ID).isNull()) {
				user.setPrepaidBudgetID(jwt.getClaim(CLAIM_PREPAID_BUDGET_ID).asString());
			}

			return user;
		    
		} catch (JWTVerificationException e){
			logger.error("getToken() > Something  while parsing the token: " + token);
		}
		
		return null;
	}

	public static JsonObject getOrgInvite(String token) {

		if (secret == null) {
			logger.error("getOrgInvite() > No secret");
			throw new IllegalStateException("TokenService needs secret!");
		}

		try {
			Algorithm algorithm = Algorithm.HMAC256(secret);
			JWTVerifier verifier = JWT.require(algorithm)
					.withIssuer(ISSUER)
					.build(); //Reusable verifier instance
			DecodedJWT jwt = verifier.verify(token);

			String email = jwt.getClaim(CLAIM_EMAIL).asString();
			String orgID = jwt.getClaim(CLAIM_ORG_ID).asString();
			int permission = jwt.getClaim(CLAIM_ORG_PERMISSION).asInt();

			JsonObject result = new JsonObject()
					.put(OrganizationTeam.ORG_ID, orgID)
					.put(OrganizationTeam.PERMISSION, permission)
					.put("email", email);


			return result;

		} catch (JWTVerificationException e){
			logger.error("getToken() > Something  while parsing the token: " + token);
		}

		return null;
	}

	public static User getUser(RoutingContext event) {
		String token = event.request().getHeader("Authorization");
		if (token != null && token.length() > 10) {
			token = token.substring(7);
			return getUser(token);
		}
		String queryToken = event.request().getParam("token");
		if (queryToken != null && !queryToken.isEmpty()) {
			return getUser(queryToken);
		}
		return null;
	}

}
