package ai.flowrabbit.rest;

import ai.flowrabbit.acl.AppAcl;
import ai.flowrabbit.model.AppPart;
import ai.flowrabbit.model.AppSecrets;
import ai.flowrabbit.model.PublicationSettings;

import ai.flowrabbit.services.BlowFishService;
import ai.flowrabbit.services.EncryptionService;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class AppSecretREST extends MongoREST {

    private EncryptionService encryptionService;

    public AppSecretREST(MongoClient db, EncryptionService encryptionService) {
        super(db, AppSecrets.class);
        this.setIdParameter("appID");
        this.acl = new AppAcl(db, false);
        this.isPartialUpdate = true;
        this.encryptionService = encryptionService;
    }


    protected JsonObject createInstance(String appID){
        return new JsonObject()
                .put("appID", appID)
                .put(AppSecrets.FIELD_PAYLOAD, new JsonObject());
    }

    public Handler<RoutingContext> findByApp() {
        return event -> findByApp(event);
    }

    private void findByApp(RoutingContext event) {
        this.acl.canWrite(getUser(event), event , allowed -> {
            String appID = getId(event, "appID");
            if (allowed) {
                this.findOrCreateByApp(event, appID);
            } else {
                error("findByApp", "User " + getUser(event) + " tried to access " + event.request().path());
                returnError(event, 405);
            }
        });
    }

    public void findOrCreateByApp(RoutingContext event, String appID) {
        mongo.findOne(table, AppPart.findByApp(appID), null, res -> {
            if(res.succeeded()){
                JsonObject json = res.result();
                if (json!=null){
                    try {
                        returnJson(event, AppSecrets.decryptSecrets(json, this.encryptionService));
                    } catch (Exception e) {
                        error("findOrCreateByApp", "Cannot decrypt");
                        returnError(event, 404);
                    }
                } else {
                    json = createInstance(appID);
                    create(event, json);
                }
            } else {
                returnError(event, 404);
            }
        });
    }

    protected void partialUpdate(RoutingContext event, String appID, JsonObject payload) {

        if (!isValid(payload)) {
            logger.error("partialUpdate() > Wrong data");
            returnError(event, "partial.update.error.valid");
            return;
        }

        try {
            AppSecrets.encryptSecrets(payload, encryptionService);
        } catch (Exception err) {
            logger.error("partialUpdate() >cannot encrypt", err);
            returnError(event, "partial.update.error.db");
            return;
        }


        final JsonObject data = new JsonObject().put(AppSecrets.FIELD_PAYLOAD, payload);
        final JsonObject change = new JsonObject().put("$set", data);
        mongo.updateCollection(table, PublicationSettings.findByApp(appID), change, res -> {
            if(res.succeeded()){
                returnUpdateAppPart(event, appID);
            } else {
                logger.error("partialUpdate() > Cannot update "+ res.cause().getMessage());
                returnError(event, "partial.update.error");
            }
        });
    }




    private boolean isValid(JsonObject payload) {
        try {
            if (!payload.containsKey(AppSecrets.FIELD_SECRETS)) {
                logger.error("isValid() > No secrets");
                return false;
            }
            JsonArray secrets = payload.getJsonArray(AppSecrets.FIELD_SECRETS);
            for (int i=0; i < secrets.size(); i++) {
                JsonObject secret = secrets.getJsonObject(i);
                if (!secret.containsKey(AppSecrets.FIELD_SECRET_KEY)) {
                    logger.error("isValid() > No key");
                    return false;
                }
                if (!secret.containsKey(AppSecrets.FIELD_SECRET_VALUE)) {
                    logger.error("isValid() > No value");
                    return false;
                }
            }

        } catch (Exception e) {
            logger.error("isValid() > Something went wrong", e);
            return false;
        }

        return true;
    }

    protected JsonObject cleanJson(JsonObject data) {
        return  data.getJsonObject(AppSecrets.FIELD_PAYLOAD);
    }
}
