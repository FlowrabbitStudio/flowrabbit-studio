package ai.flowrabbit.rest;


import ai.flowrabbit.bus.MailHandler;
import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.Domain;
import ai.flowrabbit.util.Mail;
import ai.flowrabbit.util.MongoREST;

import ai.flowrabbit.acl.Acl;
import ai.flowrabbit.services.TokenService;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class OrganizationTeamRest extends MongoREST {

    private final Logger logger = LoggerFactory.getLogger(OrganizationTeamRest.class);

    private final String user_db, org_team_db, org_db;

    private final boolean allowAdmin;

    public OrganizationTeamRest(MongoClient db, Acl acl, boolean allowAdmin) {
        super(db, Organization.class);
        this.acl = acl;
        this.user_db = DB.getTable(User.class);
        this.org_team_db = DB.getTable(OrganizationTeam.class);
        this.org_db = DB.getTable(Organization.class);
        this.allowAdmin = allowAdmin;
    }

    /********************************************************************************************
     * setTeam
     ********************************************************************************************/

    public Handler<RoutingContext> createPermission() {
        return event -> createPermission(event);
    }

    private void createPermission(RoutingContext event) {
        JsonObject json = event.getBodyAsJson();
        if (!json.containsKey("permission")) {
            returnError(event, 405);
            return;
        }
        int permission = json.getInteger("permission");
        if (!isValidPermission(permission)) {
            returnError(event, 405);
            return;
        }
        if (!json.containsKey("email")) {
            returnError(event, 405);
            return;
        }

        String orgID = getId(event, "orgID");
        User user = getUser(event);
        canWritePermission(event, user, orgID, permission, allowed -> {
            if (allowed) {
                this.createPermission(event, orgID, permission);
            } else {
                logger.error("createPermission() > User " + getUser(event) + " tried to set team at " + orgID);
                returnError(event, "apps.team.member.add.error.read");
            }
        });
    }


    public void canWritePermission(RoutingContext event, User user, String orgID, int permission, Handler<Boolean> handler){
        if(user.hasRole(User.ADMIN) && allowAdmin){
            handler.handle(true);
            return;
        }
        JsonObject query = OrganizationTeam.findByUserAndOrg(user,orgID, OrganizationTeam.WRITE);
        this.mongo.findOne(org_team_db, query, null, res -> {
            if (res.succeeded()) {
                JsonObject principlePermission = res.result();
                if (principlePermission == null) {
                    logger.error("canWritePermission() > User " + getUser(event) + " tried to set org at " + orgID);
                    handler.handle(false);
                    return;
                }

                if (permission > principlePermission.getInteger(OrganizationTeam.PERMISSION)) {
                    logger.error("canWritePermission() > User " + getUser(event) + " tried to set too high org " + orgID);
                    handler.handle(false);
                } else {
                    handler.handle(true);
                }
            } else {
                logger.error("canWritePermission() > User " + getUser(event) + " tried to set org at " + orgID);
                handler.handle(false);
            }
        });
    }

    private void createPermission(RoutingContext event, String orgID, int permission) {
        JsonObject json = event.getBodyAsJson();
        String email = json.getString("email");

        mongo.findOne(user_db, User.findByEmail(email), null, res -> {
            if (res.succeeded()) {
                JsonObject user = res.result();
                if (user != null) {
                    createPermission(event, orgID, user, permission);
                } else {
                    logger.error("createPermission() > Cloud not find member with email " + email);
                    inviteNewUserToOrg(event, orgID, email, permission);
                }
            } else {
                returnError(event, "organization.team.error.no.user");
            }
        });
    }

    private void inviteNewUserToOrg(RoutingContext event, String orgID, String email, int permission) {
        logger.error("inviteNewUserToOrg() > Invite " + email + " to " + orgID);

        this.mongo.findOne(org_db, Organization.findById(orgID), null, found -> {
            if (found.succeeded() && found.result() != null) {

                JsonObject organization = found.result();
                Domain domain = Domain.get(event);
                String inviteKey = TokenService
                        .getOrgInviteToken(orgID, email, permission, 2);

                JsonObject payload = new JsonObject()
                        .put("inviteKey", inviteKey)
                        .put("orgName", Organization.getDisplayName(organization))
                        .put("email", email);

                Mail.to(email)
                        .bcc(domain.getAdmin())
                        .subject(domain.getMailSubjectWelcome())
                        .payload(payload)
                        .template(MailHandler.TEMPLATE_ORG_INVITE)
                        .send(event);

                AppEvent.send(
                        event,
                        getUser(event).getEmail(),
                        AppEvent.TYPE_ORGANISATION_TEAM_INVITE
                );

                returnOk(event, "organization.team.add.invite");

            } else {
                logger.error("inviteNewUserToOrg() > Could not read org");
                returnError(event, "organization.team.add.invite");
            }
        });

    }


    private void createPermission(RoutingContext event, String orgID, JsonObject user, int permission) {
        logger.debug("createPermission() > enter");

        String userID = user.getString("_id");
        JsonObject team = OrganizationTeam.create(userID, orgID, permission);
        mongo.count(org_team_db, OrganizationTeam.findByReaderAndOrg(userID, orgID), found -> {
            if (found.succeeded() && found.result() == 0) {
                mongo.insert(org_team_db, team, res -> {
                    if (res.succeeded()) {
                        returnOk(event, "organization.team.add.success");
                        onUserAdded(event, orgID, user);
                    } else {
                        res.cause().printStackTrace();
                        returnError(event, 405);
                    }
                });
            } else {
                logger.error("createPermission() > User already created in " + orgID);
                returnError(event, "organization.team.error.user.in.team");
            }
        });
    }

    private void onUserAdded(RoutingContext event, String orgID, JsonObject user) {
        Domain domain = Domain.get(event);
        mongo.findOne(org_db, Organization.findById(orgID), null, found -> {
            if (found.succeeded() && found.result() != null) {
                JsonObject org = found.result();

                JsonObject payload = new JsonObject()
                        .put("orgName", org.getString("name"))
                        .put("name", user.getString("email"));

                Mail.to(user.getString("email"))
                        .bcc(domain.getAdmin())
                        .subject(domain.getMailSubjectWelcome())
                        .payload(payload)
                        .template(MailHandler.TEMPLATE_ORG_ADD)
                        .send(event);


                AppEvent.send(event, getUser(event).getEmail(), AppEvent.TYPE_ORGANISATION_TEAM_ADD);

            } else {
                logger.error("onUserAdded() > No org with id");
            }
        });


    }

    /********************************************************************************************
     * update permission
     ********************************************************************************************/


    public Handler<RoutingContext> updatePermission() {
        return event -> updatePermission(event);
    }

    private void updatePermission(RoutingContext event) {
        String orgID = getId(event, "orgID");
        JsonObject json = event.getBodyAsJson();
        if (!json.containsKey("permission")) {
            error("updatePermission", "Wrong json from user " + getUser(event));
            returnError(event, 403);
            return;
        }
        int permission = json.getInteger("permission");
        if (!isValidPermission(permission)) {
            error("updatePermission", "Wrong permission from user " + getUser(event));
            returnError(event, 403);
            return;
        }
        User user = getUser(event);
        canWritePermission(event, user, orgID, permission, allowed -> {
            if (allowed) {
                this.updatePermission(event, orgID, permission);
            } else {
                error("createPermission", "User " + user + " tried to set team at " + orgID);
                returnError(event, "organization.team.add.error.read");
            }
        });
    }

    private static boolean isValidPermission(int permission) {
        return permission > 0 && permission < OrganizationTeam.OWNER + 1;
    }

    private void updatePermission(RoutingContext event, String orgID, int permission) {
        logger.info("updatePermission() > enter");

        String userIDToAdd = getId(event, "userID");
        JsonObject update = new JsonObject()
                .put("$set", new JsonObject()
                        .put(OrganizationTeam.PERMISSION, permission));

        /**
         * We update no all entries for the user / org combination!
         */
        mongo.updateCollection(org_team_db, OrganizationTeam.findByUserAndOrg(userIDToAdd, orgID), update, res -> {
            if (res.succeeded()) {
                returnOk(event, "organization.team.update.success");
            } else {
                logger.error("updatePermission() > Mongo Error" + res.cause().getMessage());
                returnError(event, "organization.team.update.error.email");
            }
        });
    }

    /********************************************************************************************
     * remove permission
     ********************************************************************************************/

    public Handler<RoutingContext> findUsersByOrg() {
        return event -> findUsersByOrg(event);
    }

    private void findUsersByOrg(RoutingContext event) {
        String orgID = getId(event, "orgID");
        this.acl.canRead(getUser(event), event, allowed -> {
            if (allowed) {
                this.findUsersByOrg(event, orgID);
            } else {
                logger.error("getTeam() > User " + getUser(event) + " tried to  read " + event.request().path());
                returnError(event, 404);
            }
        });
    }

    private void findUsersByOrg(RoutingContext event, String orgID) {
        //log("getTeam", "enter > " + id);
        event.response().putHeader("content-type", "application/json");
        mongo.find(org_team_db, OrganizationTeam.findByOrg(orgID), res -> {
            if (res.succeeded()) {
                List<JsonObject> userACLs = res.result();
                HashMap<String, Integer> userIDs = getUserMap(userACLs);
                getUsersByIds(event, userIDs);
            } else {
                returnError(event, "organization.team.error");
            }
        });
    }

    private HashMap<String, Integer> getUserMap(List<JsonObject> userACLs) {
        HashMap<String, Integer> userIDs = new HashMap<String, Integer>();
        for (JsonObject acl : userACLs) {
            userIDs.put(acl.getString(OrganizationTeam.USER_ID), acl.getInteger(OrganizationTeam.PERMISSION));
        }
        return userIDs;
    }

    protected void getUsersByIds(RoutingContext event, HashMap<String, Integer> userIDs) {
        JsonArray ids = new JsonArray();
        for (String id : userIDs.keySet()) {
            ids.add(id);
        }
        mongo.findWithOptions(user_db, User.findByIDS(ids), Model.getFindOptions("name", "lastname", "email", "image"), res -> {
            if (res.succeeded()) {
                JsonArray result = new JsonArray();
                List<JsonObject> users = res.result();
                for (JsonObject user : users) {
                    user.put("permission", userIDs.get(user.getString("_id")));
                    result.add(cleanJson(user));
                }
                event.response().end(result.encode());
            } else {
                returnError(event, 404);
            }
        });
    }

    /********************************************************************************************
     * remove permission
     ********************************************************************************************/
    public Handler<RoutingContext> findByUser() {
        return event -> findByUser(event);
    }

    private void findByUser(RoutingContext event) {
        String userID = getId(event, "userID");
        User user = this.getUser(event);
        if (user.getId().equals(userID) || user.hasRole(User.ADMIN)) {
            mongo.find(org_team_db, OrganizationTeam.findByUser(userID), teamResponse -> {
                if (teamResponse.succeeded()) {
                    List<JsonObject> team = teamResponse.result();
                    List<String> orgIDS = team.stream().map(t -> t.getString(OrganizationTeam.ORG_ID)).collect(Collectors.toList());
                    orgIDS.add(Organization.DEFAULT_ID);
                    JsonObject query = Organization.findByIds(orgIDS);
                    this.mongo.find(org_db, Organization.findByIds(orgIDS), orgResponse -> {
                        if (orgResponse.succeeded()) {
                            List<JsonObject> result = orgResponse.result();
                            returnJson(event, result);
                        } else {
                            logger.error("findByUser() > Could not read");
                            returnError(event, 405);
                        }
                    });
                } else {
                    logger.error("findByUser() > Could not read");
                    returnError(event, 405);
                }
            });
        } else {
            logger.error("findByUser() > User " + getUser(event) + " tried to read permission of other users");
            returnError(event, 404);
        }
    }


    public Handler<RoutingContext> removePermission() {
        return event -> removePermission(event);
    }


    public void removePermission(RoutingContext event) {
        String orgID = getId(event, "orgID");
        String userID = getId(event, "userID");
        User user = getUser(event);

        /**
         * only people that can write an app, can add team members and remove them
         */
        this.acl.canWrite(user, event, allowed -> {
            if (allowed) {
                this.removePermission(event, orgID, userID);
            } else {
                error("removePermission", "User " + getUser(event) + " tried to remove permission at " + orgID);
                returnError(event, "organization.team.remove.error");
            }
        });
    }

    public void removePermission(RoutingContext event, String orgID, String userID) {
        mongo.removeDocuments(org_team_db, OrganizationTeam.findByUserAndOrg(userID, orgID), res -> {
            if (res.succeeded() && res.result().getRemovedCount() > 0) {
                returnOk(event, "organization.team.remove.success");
            } else {
                res.cause().printStackTrace();
                returnError(event, 404);
            }
        });
    }
}
