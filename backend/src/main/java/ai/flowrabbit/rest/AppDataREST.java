package ai.flowrabbit.rest;

import ai.flowrabbit.acl.AppAcl;
import ai.flowrabbit.bus.MongoLogger;
import ai.flowrabbit.model.AppData;
import ai.flowrabbit.model.AppPart;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.util.MongoUtil;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class AppDataREST extends MongoREST {

    private final MongoUtil util = new MongoUtil();

    public AppDataREST(MongoClient db) {
        super(db, AppData.class);
        this.setIdParameter("appID");
        this.acl = new AppAcl(db);
        this.isPartialUpdate = true;
    }


    protected JsonObject createInstance(String appID){
        return new JsonObject()
                .put("appID", appID);
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
                    returnJson(event, json);
                } else {
                    json = createInstance(appID);
                    create(event, json);
                }
            } else {
                returnError(event, 404);
            }
        });
    }

    public Handler<RoutingContext> applyChanges() {
        return event -> applyChanges(event);
    }

    private void applyChanges(RoutingContext event) {
        this.acl.canWrite(getUser(event), event , allowed -> {
            String appID = getId(event, "appID");
            if (allowed) {
                this.applyChanges(event, appID);
            } else {
                error("applyChanges", "User " + getUser(event) + " tried to access " + event.request().path());
                returnError(event, 405);
            }
        });
    }

    private void applyChanges(RoutingContext event, String appID) {
        logger.info("applyChanges() > enter "+ appID);

        String json = event.getBodyAsString();
        if(json.startsWith("[") && json.endsWith("]")){
            try{
                JsonArray changes = new JsonArray(json);
                applyChanges(appID, changes, event);
            } catch(Exception e){
                error("applyChanges", "Exception: Could not parse json: "  + json);
                MongoLogger.error(event, getUser(event), this.getClass(), "getUser","Could not parse json: "  + json);
                returnError(event, 405);
            }
        } else {
            error("applyChanges", "No JsonArray passed: "  + json);
            returnError(event, 405);
        }
    }

    private void applyChanges(String appID, JsonArray changes, RoutingContext event) {

        JsonObject update = util.changeToMongo(changes);

        if(update.isEmpty()){
            returnError(event, "data.update.error.no.data");
            return;
        }

        mongo.updateCollection(table, AppPart.findByApp(appID), update, res -> {
            if(res.succeeded()){
                returnOk(event, "data.changes.success");
            } else {
                log("applyChanges", res.cause().getMessage());
                MongoLogger.error(event, getUser(event), this.getClass(), "applyChanges", "User " + getUser(event) + " >> Mongo Error " + res.cause().getMessage() + " >> " + update.encodePrettily());
                returnError(event, "app.update.error");
                System.out.println(res.cause().getMessage());
            }
        });

    }
}

