package ai.flowrabbit.rest;

import ai.flowrabbit.acl.AppAcl;
import ai.flowrabbit.acl.InvitationACL;
import ai.flowrabbit.bus.MongoLogger;


import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.services.IVersionService;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.services.TokenService;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class PublicRest extends MongoREST {

    private Logger logger = LoggerFactory.getLogger(PublicRest.class);

    private final String publicationSettingsDB, appDB, imageDB;

    private final IVersionService versionService;

    private final String imageFolder;

    private final InvitationACL invACL;

    private final AppAcl appACL;

    private final String organizationDB;

    private final String orgTeamDb;

    public PublicRest(MongoClient db, IVersionService versionService, String imageFolder) {
        super(db, PublicationSettings.class);
        this.setIdParameter("appID");
        this.appACL = new AppAcl(db);
        this.acl = this.appACL;
        this.invACL = new InvitationACL();
        this.imageFolder = imageFolder;
        this.publicationSettingsDB = DB.getTable(PublicationSettings.class);
        this.appDB = DB.getTable(App.class);
        this.imageDB = DB.getTable(Image.class);
        this.organizationDB = DB.getTable(Organization.class);
        this.orgTeamDb = DB.getTable(OrganizationTeam.class);
        this.versionService = versionService;
    }

    public Handler<RoutingContext> publishVersion() {
        return routingContext -> publishVersion(routingContext);
    }

    private void publishVersion(RoutingContext event) {
        this.acl.canWrite(getUser(event), event , allowed -> {
            String appID = getId(event, "appID");
            if (allowed) {
                this.publishVersion(event, appID);
            } else {
                error("publishVersion", "User " + getUser(event) + " tried to access " + event.request().path());
                returnError(event, 405);
            }
        });
    }

    private void publishVersion(RoutingContext event, String appID) {
        mongo.findOne(publicationSettingsDB, AppPart.findByApp(appID), null, res -> {
            if(res.succeeded()){
                JsonObject json = res.result();
                // should not happen because UI should call pubrest before
                if (json ==null){
                    json = PublicationSettings.createInstance(appID);
                }
                // legacy settings might not have the versions
                if (!json.containsKey(PublicationSettings.FIELD_VERSIONS)) {
                    json.put(PublicationSettings.FIELD_VERSIONS, new JsonArray());
                }
                publishVersionApp(event, appID, json);
            } else {
                returnError(event, 404);
            }
        });

    }

    private void publishVersionApp(RoutingContext event, String appID, JsonObject pubSettings) {
        logger.debug("publishVersionApp() > enter " + appID);

        JsonArray versions = pubSettings.getJsonArray(PublicationSettings.FIELD_VERSIONS);
        int newVersion = getNewVersion(versions);


        this.mongo.findOne(appDB, App.findById(appID), null, res -> {
            if(res.succeeded()){
                JsonObject app = res.result();
                this.versionService.writeJSON(
                        event.vertx(),
                        appID,
                        Integer.toString(newVersion),
                        "app.json",
                        app
                );
                publishVersionImages(event, appID, pubSettings, newVersion);
            } else {
                returnError(event, 404);
            }
        });
    }

    private void publishVersionImages(RoutingContext event, String appID, JsonObject pubSettings, int newVersion) {
        logger.debug("publishVersionImages() > enter " + appID);


        this.mongo.find(imageDB, AppPart.findByApp(appID), res -> {
            if (res.succeeded()) {
                List<JsonObject> images = res.result();
                for (JsonObject image : images) {
                    String url = image.getString("url");
                    versionService.copyFile(
                            event.vertx(),
                            appID,
                            Integer.toString(newVersion),
                            imageFolder + "/" + url
                    );
                    System.out.println(image);
                }
                publishVersionEnd(event, pubSettings, newVersion);
            } else {
                logger.error("publishVersionImages() > cannot get images");
                returnError(event, 404);
            }
        });
    }


    private void publishVersionEnd(RoutingContext event, JsonObject pubSettings, int newVersion) {

        JsonArray versions = pubSettings.getJsonArray(PublicationSettings.FIELD_VERSIONS);
        versions.add(new JsonObject()
                .put("version", newVersion)
                .put("created", System.currentTimeMillis())
                .put("user", getUser(event).getId())
        );

        pubSettings.put(PublicationSettings.FIELD_CURRENT_VERSION, newVersion);

        this.mongo.save(publicationSettingsDB, pubSettings, saved -> {
           if (saved.succeeded()) {
               returnJson(event, cleanJson(pubSettings));
           } else {
               returnError(event, 404);
           }
        });
    }

    private static int getNewVersion(JsonArray versions) {
        int newVersion = 1;
        if (versions.size() > 0) {
            JsonObject last = versions.getJsonObject(versions.size() - 1);
            newVersion = last.getInteger("version") + 1;
        }
        return newVersion;
    }


    public Handler<RoutingContext> getApp() {
        return routingContext -> getApp(routingContext);
    }

    private void getApp(RoutingContext event) {

        String hash = getId(event, "hash");
        String version = getId(event, "version");
        logger.info("getApp() > enter > " + hash);

        User hashUser = getHashUser(event);
        if (!hashUser.hasClaim()) {
            logger.info("getApp() > hash has no claim > " + hash);
            returnError(event, 404);
            return;
        }

        String appID = hashUser.getAppID();
        if (appID == null) {
            logger.info("getApp() > hash has no app > ");
            returnError(event, 404);
            return;
        }
        versionService.getFile(event, appID, version, "app.json");

    }

    public Handler<RoutingContext> getImage() {
        return routingContext -> getImage(routingContext);
    }

    private void getImage(RoutingContext event) {
        this.invACL.canTest(getUser(event), event, res ->{
            if(res){
                String appID  = event.request().getParam("appID");
                String version = event.request().getParam("version");
                String image = event.request().getParam("image");

                versionService.getFile(event, appID, version, image);
            } else {
                logger.error("getImage() > " + getUser(event) + " tried to read the image " +event.request().path() );
                returnError(event, 404);
            }
        });
    }


    public Handler<RoutingContext> getPublicToken() {
        return event -> getPublicToken(event);
    }


    private void getPublicToken(RoutingContext event) {
        String domain = getId(event, "domain");
        String appName = getId(event, "appName");
        if (domain != null && !domain.isEmpty()) {
            mongo.find(organizationDB, Organization.findByDomain(domain), res -> {
                if (res.succeeded() && res.result().size() == 1) {
                    JsonObject org = res.result().get(0);
                    if (org != null && org.containsKey(Organization.FIELD_NAME)) {
                        String orgName = org.getString(Organization.FIELD_NAME);
                        getPublicTokenByOrgAndApp(event, orgName, appName);
                    } else {
                        returnError(event, 404);
                    }
                } else {
                    returnError(event, 404);
                }
            });
        } else {
            String orgName = getId(event, "orgName");
            getPublicTokenByOrgAndApp(event, orgName, appName);
        }
    }

    private void getPublicTokenByOrgAndApp(RoutingContext event, String orgName, String appName) {
        mongo.findOne(organizationDB, Organization.findByName(orgName), null, res -> {
            if (res.succeeded()) {
                JsonObject org = res.result();
                if (org != null) {

                    if (Organization.isBlocked(org)) {
                        logger.error("getPublicTokenByOrgAndApp() > Access to blocked organization");
                        returnError(event, "organization.blocked");
                        return;
                    }

                    String orgID = org.getString("_id");
                    getPublicToken(event, orgID, appName);
                } else {
                    MongoLogger.error(
                            event,
                            getUser(event),
                            PublicationSettingsREST.class,
                            "getPublicTokenByOrgAndApp",
                            "Access to not existing org"
                    );
                    returnError(event, 404);
                }

            } else {
                MongoLogger.error(
                        event,
                        getUser(event),
                        PublicationSettingsREST.class,
                        "getInvitation",
                        "Access to not existing org"
                );
                returnError(event, 404);
            }
        });
    }

    void getPublicToken(RoutingContext event, String orgID, String appName) {
        mongo.findOne(table, PublicationSettings.findByNameAndOrg(appName, orgID), null, res -> {
            if (res.succeeded()) {

                JsonObject settings = res.result();
                if (settings != null) {
                    String appID = settings.getString("appID");
                    String mode = settings.getString("mode");
                    if (PublicationSettings.MODE_FORBIDDEN.equals(mode)) {
                        returnError(event, 404);
                    } else if (PublicationSettings.MODE_TEAM.equals(mode)) {
                        returnTeamInvitation(event, appID, orgID, settings);
                    } else if (PublicationSettings.MODE_ORGANIZATION.equals(mode)) {
                        returnOrgInvitation(event, orgID, appID, settings);
                    } else if (PublicationSettings.MODE_PUBLIC.equals(mode)) {
                        returnInvitation(event, appID, orgID, settings, User.TOKEN_PUBLIC);
                    } else if (PublicationSettings.MODE_PASSWORD.equals(mode)) {
                        returnPasswordInvitation(event, appID, orgID, settings);
                    } else {
                        logger.error("getPublicToken() > wrong type :" + mode);
                        returnError(event, 404);
                    }
                } else {
                    logger.error("getPublicToken() > No app with name :" + appName + " in org: " + orgID );
                    MongoLogger.error(
                            event, getUser(event),
                            PublicationSettingsREST.class,
                            "getInvitation",
                            "Access to not existing name"
                    );

                    returnError(event, 404);
                }

            } else {
                returnError(event, 404);
                MongoLogger.error(
                        event, getUser(event),
                        PublicationSettingsREST.class,
                        "getInvitation",
                        "Access to not existing name"
                );
            }
        });
    }





    private void returnPasswordInvitation(RoutingContext event, String appID, String orgID, JsonObject settings) {
        String password = event.request().getHeader("x-flowrabbit-pwd");
        if (password == null || password.isEmpty()) {
            logger.error("returnPasswordInvitation() > No password in header");
            returnError(event, 406);
            return;
        }

        if (settings.containsKey(PublicationSettings.FIELD_PASSWORD)) {
            String expected = settings.getString(PublicationSettings.FIELD_PASSWORD);
            if (expected.equals(password)) {
                returnInvitation(event, appID, orgID, settings, User.TOKEN_PASSWORD);
            } else {
                logger.error("returnPasswordInvitation() > Password does not match");
                returnError(event, 406);
            }
        } else {
            logger.error("returnPasswordInvitation() > No password defined");
            returnError(event, 404);
        }
    }

    private void returnOrgInvitation(RoutingContext event, String orgID, String appID, JsonObject settings) {
        User user = getUser(event);

        // We filter out 'private' org and save a trip to the db.
        // In there would be in link between org and user, so
        // in the end the result is the same.
        if (Organization.DEFAULT_ID.equals(orgID)) {
            logger.error("returnOrgInvitation() > user " + user + " tried to access the DEFAULT ord");
            returnError(event, 405);
            return;
        }

        this.mongo.count(orgTeamDb, OrganizationTeam.findByReaderAndOrg(user.getId(), orgID), result -> {
            if (result.succeeded() && result.result() > 0) {
                returnInvitation(event, appID, orgID, settings, User.TOKEN_ORG);
            } else {
                MongoLogger.error(
                        event, getUser(event),
                        PublicationSettingsREST.class,
                        "returnOrgInvitation",
                        "Access without org"
                );
                logger.error("returnOrgInvitation() > user " + user + " tried to access " +orgID);
                returnError(event, 405);
            }
        });
    }

    private void returnTeamInvitation(RoutingContext event, String appID, String orgID, JsonObject settings) {
        User user = getUser(event);
        this.appACL.canRead(user, event, appID, allowed -> {
            if (allowed) {
                returnInvitation(event, appID, orgID, settings, User.TOKEN_TEAM);
            } else {
                MongoLogger.error(
                        event, getUser(event),
                        PublicationSettingsREST.class,
                        "returnTeamInvitation",
                        "Access without team"
                );
                returnError(event, 405);
                logger.error("returnTeamInvitation() > The user " + user + " tried to access " + appID);
            }
        });
    }

    void returnInvitation(RoutingContext event, String appID, String orgID, JsonObject settings, String tokenType) {
        logger.info("returnInvitation() > " + appID + " > " + tokenType);
        int version = -1;
        if (settings.containsKey(PublicationSettings.FIELD_CURRENT_VERSION)) {
            version = settings.getInteger(PublicationSettings.FIELD_CURRENT_VERSION);
        }
        String jwtToken = TokenService.getPublicAppToken(getUser(event), appID, orgID, Invitation.READ, tokenType);
        JsonObject result = new JsonObject()
                .put("token", jwtToken)
                .put("appID", appID)
                .put("mode", "default")
                .put("version", version)
                .put("path", event.request().path());
        returnJson(event, result);
    }

}
