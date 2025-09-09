package ai.flowrabbit.rest;

import ai.flowrabbit.acl.AppOrgACL;
import ai.flowrabbit.bus.MongoLogger;
import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class PublicationSettingsREST extends MongoREST {

    private final String organizationTeamDB;

    private final AppOrgACL appACL;

    public PublicationSettingsREST(MongoClient db) {
        super(db, PublicationSettings.class);
        this.setIdParameter("appID");
        this.appACL = new AppOrgACL(db);
        this.acl = this.appACL;
        this.isPartialUpdate = true;
        this.organizationTeamDB = DB.getTable(OrganizationTeam.class);
    }


    public Handler<RoutingContext> findByApp() {
        return event -> findByApp(event);
    }

    private void findByApp(RoutingContext event) {
        this.acl.canWrite(getUser(event), event, allowed -> {
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
            if (res.succeeded()) {
                JsonObject json = res.result();
                if (json != null) {
                    returnJson(event, cleanJson(json));
                } else {
                    json = PublicationSettings.createInstance(appID);
                    create(event,json);
                }
            } else {
                returnError(event, 404);
            }
        });
    }

    private void validateOrg(RoutingContext event, String appID, JsonObject change, Handler<Boolean> handler) {
        if (!change.containsKey("orgID")) {
            handler.handle(true);
            return;
        }

        if (Organization.DEFAULT_ID.equals(change.getString("orgID"))) {
            handler.handle(true);
            return;
        }

        String orgID = change.getString("orgID");
        User user = getUser(event);
        mongo.count(organizationTeamDB, OrganizationTeam.findByReaderAndOrg(user, orgID), res -> {
            if (res.succeeded() && res.result() >= 1) {
                handler.handle(true);
            } else {
                handler.handle(false);
                MongoLogger.error(
                        event,
                        getUser(event),
                        PublicationSettingsREST.class,
                        "validateOrg",
                        "User " + user + " tried to access org " + orgID
                );
                this.error("validateOrg", "User " + user + " tried to access org " + orgID);
            }
        });
    }

    private void validateAppName(String appID, JsonObject change, Handler<Boolean> handler) {
        if (!change.containsKey("name")) {
            handler.handle(true);
            return;
        }

        mongo.findOne(table, AppPart.findByApp(appID), null, res -> {
            if (res.succeeded()) {
                JsonObject dbObject = res.result();
                // FIXME this expects a settings to be there,
                // which might not be the case for new ones
                if (dbObject == null) {
                    handler.handle(false);
                    return;
                }
                String orgID = change.getString("orgID");
                if (orgID == null || orgID.isEmpty()) {
                    orgID = dbObject.getString("orgID");
                }
                validateAppNameAndOrg(change, orgID, appID, handler);
            } else {
                handler.handle(false);
            }
        });
    }

    private void validateAppNameAndOrg(JsonObject change, String orgID, String appID, Handler<Boolean> handler) {

        String name = change.getString("name");
        if (name == null || name.isEmpty()) {
            logger.info("validateAppName() > Name is null or empty: {}", name);
            handler.handle(false);
            return;
        }

        this.logger.info("validate() > name: {} {} ", name, appID);
        this.mongo.findOne(this.table, PublicationSettings.findByNameAndOrg(name, orgID), null, res -> {
            if (res.succeeded()) {

                JsonObject oldPubSettings = res.result();
                if (oldPubSettings == null) {
                    logger.info("validateAppName() > no old app: {}", name);
                    handler.handle(true);
                    return;
                }

                // if the same name for the same app, so no change
                if (appID.equals(oldPubSettings.getString("appID"))) {
                    logger.info("validateAppName() > Same name: {}", name);
                    handler.handle(true);
                    return;
                }

                logger.error("validateAppName() > Name not unique : {}", name);
                handler.handle(false);
            } else {
                logger.error("validateAppName() > Mongo error");
                handler.handle(false);
            }
        });
    }


    protected void partialUpdate(RoutingContext event, String appID, JsonObject change) {
        // check that the user can access the org
        this.validateOrg(event, appID, change, hasAccessToOrg -> {
            if (hasAccessToOrg) {
                this.validateAppName(appID, change, isUnique -> {
                    if (isUnique) {
                        partialUpdateChecked(event, appID, change);
                    } else {
                        returnError(event, "not.unique.name");
                    }
                });
            } else {
                logger.error("particalUpdate() > " + getUser(event) + " tried to set app in wrong org");
                returnError(event, "not.valid.org");
            }
        });
    }

    private void partialUpdateChecked(RoutingContext event, String appID, JsonObject change) {
        change = new JsonObject().put("$set", change);
        mongo.updateCollection(table, PublicationSettings.findByApp(appID), change, res -> {
            if (res.succeeded()) {
                returnUpdate(event, appID);
            } else {
                logger.error("particalUpdate() > Cannot update " + res.cause().getMessage());
                returnError(event, "partial.update.error");
            }
        });
    }

    protected void returnUpdate(RoutingContext event, String appID) {
        mongo.findOne(table, PublicationSettings.findByApp(appID), null, res -> {
            if (res.succeeded()) {
                JsonObject result = res.result();
                if (result != null) {
                    event.response().end(cleanJson(result).encode());
                } else {
                    returnError(event, table + ".return.error");
                }
            } else {
                returnError(event, table + ".return.error");
            }
        });
    }



}
