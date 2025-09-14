package ai.flowrabbit.rest;

import ai.flowrabbit.acl.AppAcl;
import ai.flowrabbit.acl.InvitationACL;
import ai.flowrabbit.bus.MongoLogger;

import ai.flowrabbit.model.*;
import ai.flowrabbit.services.EncryptionService;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.services.TokenService;
import ai.flowrabbit.util.SecretUtil;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class SecretRest extends MongoREST {

    public static final String FLOWRABBIT_API_KEY = "flowrabbit-api-key";

    public static final String FLOWRABBIT_TARGET_URL = "flowrabbit-target-url";

    private final Logger logger = LoggerFactory.getLogger(SecretRest.class);

    private final InvitationACL invACL;

    private final String apiKey;

    private final String appSecretDb;

    private final String secretDb;

    private final String orgDb;

    private final EncryptionService encryptionService;


    public SecretRest(MongoClient db, String apiKey, EncryptionService encryptionService) {
        super(db, App.class);
        setACL(new AppAcl(db));
        if (apiKey == null) {
            throw new RuntimeException();
        }
        this.apiKey = apiKey;
        this.invACL = new InvitationACL();
        this.appSecretDb = DB.getTable(AppSecrets.class);
        this.secretDb = DB.getTable(Secret.class);
        this.orgDb = DB.getTable(Organization.class);
        this.encryptionService = encryptionService;
    }


    public Handler<RoutingContext> meterBySecret() {
        return event -> meterBySecret(event);
    }

    private void meterBySecret(RoutingContext event) {

        final String apiKey = event.request().getHeader(FLOWRABBIT_API_KEY);
        final String name = event.request().getParam("name");
        final String hash = event.request().getParam("hash");

        JsonObject body = getJson(event);
        if (!body.containsKey("quantity")) {
            error("meterBySecret", "No quantity");
            returnError(event, "app.secret.no.quantity", 405);
            return;
        }

        double quantity = body.getDouble("quantity");

        if (quantity <= 0) {
            error("meterBySecret", "quantity to small");
            returnError(event, "app.secret.negative.quantity", 405);
            return;
        }

        if (apiKey == null) {
            error("meterBySecret", "No token passed");
            returnError(event, 404);
            return;
        }
        if (!apiKey.equals(this.apiKey)) {
            error("meterBySecret", "No client with apiKey");
            returnError(event, 404);
            return;
        }

        User user = TokenService.getUser(hash);
        if (!user.hasClaim()) {
            error("meterBySecret", "No claim for user "+ user);
            returnError(event, "app.secret.no.claim", 404);
            return;
        }

        if (Organization.DEFAULT_ID.equals(user.getOrgID())) {
            error("meterBySecret", "Default for user "+ user);
            returnError(event, "app.secret.private.org", 404);
            return;
        }

        this.mongo.findOne(secretDb, Secret.findByName(name), null, res -> {
            if(res.succeeded() && res.result() != null){
                JsonObject secret = res.result();
                if (!secret.containsKey(Secret.FIELD_SECRET_PRICE_QUANTITY_IN_MICRO_CENT)) {
                    logger.error("meterBySecretPrepaidBudget() > no price per quantity");
                    returnError(event, "app.secret.no.priceQuantity",405);
                    return;
                }

                meterBySecretOrg(event, user, secret, quantity);

            } else {
                error("meterBySecret", "No name: " + name);
                returnError(event, 404);
            }
        });

    }

    private void meterBySecretOrg(RoutingContext event, User user, JsonObject secret, double quantity) {

        // for now, we use the org as the container.
        mongo.findOne(orgDb, Organization.findById(user.getOrgID()), null, res -> {
            if (res.succeeded() && res.result() != null) {
                JsonObject org = res.result();

                int price = secret.getInteger(Secret.FIELD_SECRET_PRICE_QUANTITY_IN_MICRO_CENT);
                int totalPrice = Secret.calculatePriceInMicroCent(quantity, price);

                org = Organization.deductCredits(org, totalPrice);

                APICalls.incAnalytics(org, totalPrice);

                int newTotal = Organization.getTotalBudget(org);

                logger.info("meterBySecretOrg() > Dec by {} to {}cent for budget {}", totalPrice,newTotal, org.getString("_id"));

                returnJson(event, new JsonObject().put("total", totalPrice).put("budget", newTotal));

                mongo.save(orgDb, org, saved -> {
                    if (!saved.succeeded()) {
                        logger.error("meterBySecretOrg () Could not save", saved.cause());
                    }
                });
            } else {
                error("meterBySecretOrg", "No prepaid budget");
                returnError(event, 404);
            }
        });
    }





    public Handler<RoutingContext> findAppSecret() {
        return event -> findAppSecret(event, this.appSecretDb, AppSecrets.FIELD_PAYLOAD);
    }

    private void findAppSecret(RoutingContext event, String table, String payloadField) {
        logger.info("findAppSecret", "enter");
        final String apiKey = event.request().getHeader(FLOWRABBIT_API_KEY);
        final String url = event.request().getHeader(FLOWRABBIT_TARGET_URL);
        final String hash = event.request().getParam("hash");
        if (apiKey == null) {
            error("findAppSecret", "No token passed");
            returnError(event, 404);
            return;
        }
        if (!apiKey.equals(this.apiKey)) {
            error("findAppSecret", "No client with apiKey");
            returnError(event, 404);
            return;
        }

        if (url == null || url.isEmpty()) {
            error("findAppSecret", "Host can't be null");
            returnError(event, 404);
            return;
        }

        User user = TokenService.getUser(hash);
        if (!user.hasClaim()) {
            error("findAppSecret", "No no claim for user "+ user);
            returnError(event, "app.secret.no.claim", 404);
            return;
        }

        this.invACL.canTest(getUser(event), event, res ->{
            if(res){
                String appID = getId(event, "appID");
                findAppPartByHashEncrypt(event, table, payloadField, appID, url);
            } else {
                error("findAppPartByHash", "Could not read form mongo > " + event.request().path());
                returnError(event, 404);
            }
        });
    }

    private void findAppPartByHashEncrypt(RoutingContext event, String table, String payloadField, String appID, String url) {
        mongo.findOne(appSecretDb, AppPart.findByApp(appID) , null, res ->{
            if(res.succeeded()){
                JsonObject appPart = res.result();
                if (appPart != null && appPart.containsKey(payloadField)) {

                    try {
                        JsonObject encrypted = AppSecrets.decryptSecrets(appPart, encryptionService);
                        JsonArray filtered = SecretUtil.filterByHost(encrypted, url);
                        logger.error("findAppPartByHashEncrypt() > filterd {}", filtered.size() );
                        encrypted.put(AppSecrets.FIELD_SECRETS, filtered);
                        returnJson(event, encrypted);
                    } catch (Exception e) {
                        error("findAppPartByHash", "Cannot decrypt");
                        returnError(event, 404);
                    }
                } else {
                    error("findAppPartByHash", "Found no data or wrong > " + appID + " > " +payloadField + " > " + table);
                    logger.error("findAppPartByHash", "wrong data", appPart);
                    returnError(event, 404);
                }
            } else {
                returnError(event, 404);
            }
        });
    }

    public Handler<RoutingContext> findSecretByName() {
        return event -> findSecretByName(event);
    }

    private void findSecretByName(RoutingContext event) {
        final String url = event.request().getHeader(FLOWRABBIT_TARGET_URL);
        final String apiKey = event.request().getHeader(FLOWRABBIT_API_KEY);
        if (apiKey == null) {
            error("findSecretByHash", "No token passed");
            returnError(event, 404);
            return;
        }

        if (url == null || url.isEmpty()) {
            error("findSecretByHash", "No url passed");
            returnError(event, 404);
            return;
        }

        // make sure only proxy can call
        if (!apiKey.equals(this.apiKey)) {
            error("findSecretByHash", "No client with apiKey");
            returnError(event, 404);
            return;
        }

        final String name = event.request().getParam("name");
        final String hash = event.request().getParam("hash");

        final String quantityString = event.request().getParam("quantity");
        double quantity = 0;
        if (quantityString != null && !quantityString.isEmpty()) {
            try {
                quantity = Double.parseDouble(quantityString);
            } catch (Exception err) {
                logger.error("findSecretByHash() > Can parse quantity {}", quantityString);
                returnError(event, "No claim", 404);
                return;
            }
        }
        // ensure that the user is authenticated and it is a
        // claim token, not a user token
        User user = TokenService.getUser(hash);
        if (user == null) {
            error("findSecretByHash", "Can't parse token ");
            returnError(event, "Wrong token", 404);
            return;
        }
        if (!user.hasClaim() ) {
            error("findSecretByHash", "No no claim for user "+ user);
            returnError(event, "No claim", 404);
            return;
        }
        // we meter the tokens on the purchase, usage or the org
        else if (user.isStudioToken()) {
            logger.error("findSecretByHash() > Studio");
            findSecretByNameAndOrg(event, name, user, url, quantity);
        } else {
            findSecretByNameAndOrg(event, name, user, url, quantity);
        }
    }

    /********************************************************
     * Find & meter by ORGANIZATION
     ********************************************************/

    private void findSecretByNameAndOrg(RoutingContext event, String name, User user, String url, double quantity) {
        if (user.getOrgID() == null) {
            logger.error("findSecretByNameAndOrg() > No org id");
            returnError(event, "No org", 404);
            return;
        }

        if (Organization.DEFAULT_ID.equals(user.getOrgID())) {
            logger.error("findSecretByNameAndOrg() > Private org id");
            returnError(event, "Private org", 404);
            return;
        }

        // for now, we use the org as the container.
        mongo.findOne(orgDb, Organization.findById(user.getOrgID()), null, res -> {
            if (res.succeeded() && res.result() != null) {
                JsonObject org = res.result();
                findSecretByNameAndOrg(event, name, url, org, quantity);
            } else {
                error("findSecretByNameAndOrg", "No org with ID " + user.getOrgID());
                returnError(event, 404);
            }
        });
    }



    private void findSecretByNameAndOrg(RoutingContext event, String name, String url,JsonObject org, double quantity) {
        logger.info("findSecretByNameAndOrg() > {} > {} > {}", name, url, quantity);
        if (Organization.isBlocked(org)) {
            logger.error("findSecretByNameAndOrg() > org is blocked {}", org.getString("name"));
            returnError(event, "organization.blocked", 408);
            return;
        }

        this.mongo.findOne(secretDb, Secret.findByName(name), null, res -> {
            if(res.succeeded() && res.result() != null){
                logger.info("findSecretByNameAndOrg() > Found in DB {}", name);
                JsonObject secret = res.result();
                if (!SecretUtil.secretMatchesHost(secret, url)) {
                    logger.error("findSecretByNameAndOrg() > URL is wronf {}", name);
                    error("findSecretByNameAndOrg", "Wrong url "+ url);
                    returnError(event, 404);
                    return;
                }

                if (Organization.hasOrgBudgetLeft(org, secret, quantity)){
                    try {
                        JsonObject s = Secret.decryptSecret(secret, encryptionService);
                        logger.info("findSecretByNameAndOrg() > Return {}", name);
                        returnJson(event, s);
                        // meter async of not excluded
                        boolean meterOnRequest = !"false".equals(event.request().getParam("meter"));
                        incrementApiCallsForOrg(org, secret, name, meterOnRequest, quantity);
                    } catch (Exception e) {
                        logger.error("findSecretByNameAndOrg() > Could no decrypt {}", name, e);
                        returnError(event, 404);
                    }
                }  else {
                    logger.error("findSecretByNameAndOrg() > No budget left for org {}", org.getString("name"));
                    returnError(event, "No api calls left", 405);
                }
            } else {
                error("findSecretByNameAndOrg", "No name: " + name);
                returnError(event, 404);
                MongoLogger.error(event, getUser(event), this.getClass(), "findSecretByNameAndOrg", "No domain " + name);
            }
        });
    }

    private void incrementApiCallsForOrg(JsonObject org, JsonObject secret, String name, boolean meterOnRequest, double quantity) {
        JsonObject callCounter = APICalls.getCallCounter(org, name);
        int currentCalls = callCounter.getInteger(APICalls.FIELD_CURRENT_API_CALLS);
        callCounter.put(APICalls.FIELD_CURRENT_API_CALLS, currentCalls + 1);

        if (meterOnRequest) {
            int price = Secret.calculatePriceInMicroCent(secret, quantity);
            org = Organization.deductCredits(org, price);
            APICalls.incAnalytics(org, price);
        } else {
            logger.info("incrementApiCallsForOrg() > No metering");
        }

        mongo.save(orgDb, org, saved -> {
            if (!saved.succeeded()) {
                logger.error("incrementApiCallsForOrg () Could not save", saved.cause());
            }
        });
    }

    private void incrementApiCallsForOrg(JsonObject org, String name) {
        JsonObject callCounter = APICalls.getCallCounter(org, name);
        int currentCalls = callCounter.getInteger(APICalls.FIELD_CURRENT_API_CALLS);
        callCounter.put(APICalls.FIELD_CURRENT_API_CALLS, currentCalls + 1);
        logger.info("incrementApiCallsForOrg() Inc to " + (currentCalls + 1) + " for org " + org.getString(Organization.FIELD_NAME));
        mongo.save(orgDb, org, saved -> {
            if (!saved.succeeded()) {
                logger.error("incrementApiCallsForOrg () Could not save", saved.cause());
            }
        });
    }



    public Handler<RoutingContext> findPublicSecretList() {
        return event -> findPublicSecretList(event);
    }

    private void findPublicSecretList(RoutingContext event) {
        User user = getUser(event);
        if (!user.hasRole(User.USER)) {
            error("findPublicSecretList", "User " + user + " tried to read secret data");
            returnError(event, 404);
            return;
        }
        this.mongo.find(secretDb, Secret.all(), res -> {
            if (res.succeeded()) {
                List<JsonObject> result = res.result();
                for (JsonObject s: result) {
                    s.remove(Secret.FIELD_SECRET_VALUE);
                }
                returnJson(event, result);
            } else {
                error("findPublicSecretList", "Error > " + res.cause());
                returnError(event, 405);
            }
        });
    }
}
