package ai.flowrabbit.rest;

import ai.flowrabbit.acl.OrganizationACL;

import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.util.RestUtil;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class OrganizationRest extends MongoREST {

    private final Logger logger = LoggerFactory.getLogger(OrganizationRest.class);

    private final String organizationDB;

    private final String pubsettingsDB;

    private final String organizationTeamDB;



    public OrganizationRest(MongoClient db) {
        super(db, Organization.class);
        this.setACL(new OrganizationACL(db));
        this.setIdParameter("orgID");
        this.organizationDB = DB.getTable(Organization.class);
        this.pubsettingsDB = DB.getTable(PublicationSettings.class);
        this.organizationTeamDB = DB.getTable(OrganizationTeam.class);
    }



    public Handler<RoutingContext> getUserRole() {
        return this::getUserRole;
    }

    private void getUserRole(RoutingContext event) {
        String orgID = event.request().getParam("orgID");
        User user = getUser(event);
        if (user.hasClaim()) {
            logger.error("getUserRole() > Claim roles not supported");
            returnError(event, 404);
            return;
        }
        this.mongo.findOne(organizationTeamDB, OrganizationTeam.findByUserAndOrg(user.getId(), orgID), null,  res ->{
            if (res.failed() || res.result() == null) {
                logger.error("getUserRole() > some error", res.cause());
                returnError(event, 404);
                return;
            }
            JsonObject team = res.result();
            returnJson( event, new JsonObject()
                    .put("role", OrganizationTeam.getRoleName(team))
            );
        });
    }


    public Handler<RoutingContext> findAppsByOrg() {
        return event -> findAppsByOrg(event);
    }

    private void findAppsByOrg(RoutingContext event) {
        String orgID = event.request().getParam("orgID");
        User user = getUser(event);
        if (Organization.DEFAULT_ID.equals(orgID)) {
            mongo.find(team_db, Team.findByUser(getUser(event)), res -> {
                if (res.succeeded()) {
                    Set<String> appIDs = new HashSet<>();
                    List<JsonObject> acls = res.result();
                    for (JsonObject acl : acls) {
                        if (acl.containsKey(Team.APP_ID) && acl.getString(Team.APP_ID) != null) {
                            appIDs.add(acl.getString(Team.APP_ID));
                        }
                    }
                    findAppsNotInPrivate(event, orgID, appIDs);
                } else {
                    logger.error("findAppsByTeam() Cannot read teamDB > {}", res.cause().getMessage());
                    returnError(event, 405);
                }
            });
        } else {
            this.acl.canRead(user, event, allowed -> {
                if (allowed) {
                    findAppsByTeam(event, orgID);
                } else {
                    logger.error("findAppsByOrg() > user {} tried to read apps from org {}", user, orgID);
                    returnError(event,404);
                }
            });
        }

    }

    private void findAppsNotInPrivate(RoutingContext event, String defaultOrgID, Set<String> teamAppIDs) {
        logger.info("findAppsNotInPrivate() > entre: # " + teamAppIDs.size());

        mongo.find(pubsettingsDB, PublicationSettings.findByApps(teamAppIDs), res -> {
            if (res.succeeded()) {
                List<JsonObject> settings = res.result();

                for (JsonObject setting : settings) {
                    String appID = setting.getString(PublicationSettings.FIELD_APP_ID);
                    String orgID = setting.getString(PublicationSettings.FIELD_ORG_ID);
                    if (!defaultOrgID.equals(orgID)) {
                        teamAppIDs.remove(appID);
                    }
                }
                JsonArray appIDs = new JsonArray();
                for (String id: teamAppIDs) {
                    appIDs.add(id);
                }
                RestUtil.findAppByIDs(mongo, event, appIDs);
            } else {
                logger.error("findAppsNotInPrivate() Cannot read teamDB > " + res.cause().getMessage());
                returnError(event, 405);
            }
        });
    }

    private void findAppsByTeam(RoutingContext event, String orgID) {
        mongo.find(team_db, Team.findByUser(getUser(event)), res -> {
            if (res.succeeded()) {
                Set<String> appIDs = new HashSet<>();
                List<JsonObject> acls = res.result();
                for (JsonObject acl : acls) {
                    if (acl.containsKey(Team.APP_ID) && acl.getString(Team.APP_ID) != null) {
                        appIDs.add(acl.getString(Team.APP_ID));
                    }
                }
                findAppsByOrg(event, orgID, appIDs);
            } else {
                logger.error("findAppsByTeam() Cannot read teamDB > " + res.cause().getMessage());
                returnError(event, 405);
            }
        });
    }

    private void findAppsByOrg(RoutingContext event, String orgID, Set<String> teamAppIDs) {
        mongo.find(pubsettingsDB, PublicationSettings.findByOrg(orgID), res -> {
            if (res.succeeded()) {
                List<JsonObject> settings = res.result();
                JsonArray appIDs = new JsonArray();
                for (JsonObject setting : settings) {
                    String appID = setting.getString(PublicationSettings.FIELD_APP_ID);
                    if (teamAppIDs.contains(appID)) {
                        appIDs.add(appID);
                    }
                }
                RestUtil.findAppByIDs(mongo, event, appIDs);
            } else {
                logger.error("findAppsByOrg() Cannot read teamDB > " + res.cause().getMessage());
                returnError(event, 405);
            }
        });
    }

    public Handler<RoutingContext> setDisplayName() {
        return event -> setDisplayName(event);
    }

    private void setDisplayName(RoutingContext event) {

        User user = getUser(event);
        String orgID = event.request().getParam("orgID");
        if (Organization.DEFAULT_ID.equals(orgID)) {
            logger.error("setDisplayName() > user {} tried to set >private< folder", user);
            returnError(event, 404);
            return;
        }

        JsonObject body = event.getBodyAsJson();
        String newName = body.getString(Organization.FIELD_DISPLAY_NAME);
        if (newName == null || newName.isEmpty()) {
            logger.error("setDisplayName() > user {} send empty name", user);
            returnError(event, 404);
            return;
        }

        this.acl.canWrite(user, event, allowed -> {
            if (allowed) {
                setDisplayName(event, orgID, newName);
            } else {
                logger.error("setDisplayName() > user {} tried to write folder from org >{}<", user, orgID);
                returnError(event,404);
            }
        });

    }

    private void setDisplayName(RoutingContext event, String orgID, String newName) {

        JsonObject update = new JsonObject()
                .put("$set", new JsonObject()
                        .put(Organization.FIELD_DISPLAY_NAME, newName));
        this.mongo.updateCollection(organizationDB, Organization.findById(orgID), update, res -> {
            if (res.succeeded()) {
                returnOk(event, "organization.update.displayName.ok");
            } else {
                returnError(event, 405);
            }
        });
    }

    public Handler<RoutingContext> setFolder() {
        return event -> setFolder(event);
    }

    private void setFolder(RoutingContext event) {
        User user = getUser(event);
        String orgID = event.request().getParam("orgID");
        if (Organization.DEFAULT_ID.equals(orgID)) {
            logger.error("setFolder() > user " + user + " tried to set >private< folder" );
            returnError(event, 404);
            return;
        }
        this.acl.canRead(user, event, allowed -> {
            if (allowed) {
                setFolder(event, orgID);
            } else {
                logger.error("setFolder() > user " + user + " tried to write folder from org >" + orgID + "<");
                returnError(event,404);
            }
        });
    }

    private void setFolder(RoutingContext event, String orgID) {
        JsonObject folder = event.getBodyAsJson();
        JsonObject update = new JsonObject()
                .put("$set", new JsonObject()
                        .put(Organization.FIELD_FOLDERS, folder));

        this.mongo.updateCollection(organizationDB, Organization.findById(orgID), update, res -> {
            if (res.succeeded()) {
                returnOk(event, "organization.update.folders.ok");
            } else {
                returnError(event, 405);
            }
        });
    }


    public Handler<RoutingContext> findPublishedApps() {
        return this::findPublishedApps;
    }

    private void findPublishedApps(RoutingContext event) {
        User user = getUser(event);
        String orgID = event.request().getParam("orgID");
        if (Organization.DEFAULT_ID.equals(orgID)) {
            logger.error("findPublishedApps() > user {} tried to set >private< folder", user);
            returnError(event, 404);
            return;
        }

        this.acl.canRead(user, event, allowed -> {
           if (allowed) {
               this.findPublishedApps(event, orgID);
           }  else {
               logger.error("findPublishedApps() > user {} tried to set {} without permission", user, orgID);
               returnError(event, 404);
           }
        });

    }

    private void findPublishedApps(RoutingContext event, String orgID) {

        this.mongo.find(pubsettingsDB, PublicationSettings.findByOrgAndPublic(orgID), res -> {
           if (res.succeeded()) {

               List<JsonObject> settings = res.result();
               JsonArray appIDs = new JsonArray();
               Map<String, JsonObject> settingsByApp = new HashMap<>();
               for (JsonObject setting : settings) {
                   String appID = setting.getString(PublicationSettings.FIELD_APP_ID);
                   appIDs.add(appID);

                   JsonObject abs =  new JsonObject()
                           .put(PublicationSettings.FIELD_NAME, setting.getString(PublicationSettings.FIELD_NAME))
                           .put(PublicationSettings.FIELD_MODE, setting.getString(PublicationSettings.FIELD_MODE));

                   settingsByApp.put(appID,abs);
               }
               RestUtil.findAppSummariesByIDs(mongo, appIDs, result -> {
                   if (result != null) {
                       for (int i=0; i < result.size(); i++) {
                            JsonObject app = result.getJsonObject(i);
                            String appID = app.getString("id");
                            app.put("pubSettings", settingsByApp.get(appID));
                       }
                       returnJson(event, result);
                   } else {
                       logger.error("findPublishedApps() > Mongo Error");
                       returnError(event, 404);
                   }
               });
           } else {
               logger.error("findPublishedApps() > error reading mongo");
               returnError(event, 404);
           }
        });

    }


//    public Handler<RoutingContext> setStripe() {
//        return event -> setStripe(event);
//    }
//
//    private void setStripe(RoutingContext event) {
//        User user = getUser(event);
//        String orgID = event.request().getParam("orgID");
//        if (Organization.DEFAULT_ID.equals(orgID)) {
//            logger.error("setFolder() > user " + user + " tried to set >private< folder" );
//            returnError(event, 404);
//            return;
//        }
//        this.acl.canWrite(user, event, allowed -> {
//            if (allowed) {
//                setStripe(event, orgID);
//            } else {
//                logger.error("setStripe() > user " + user + " tried to write STRIPE with ownership. org >" + orgID + "<");
//                returnError(event,404);
//            }
//        });
//    }
//
//    private void setStripe(RoutingContext event, String orgID) {
//        JsonObject folder = event.getBodyAsJson();
//        JsonObject update = new JsonObject()
//                .put("$set", new JsonObject()
//                        .put(Organization.FIELD_STRIPE, folder));
//        this.mongo.updateCollection(organizationDB, Organization.findById(orgID), update, res -> {
//            if (res.succeeded()) {
//                returnOk(event, "organization.update.stripe.ok");
//            } else {
//                returnError(event, 405);
//            }
//        });
//    }

}