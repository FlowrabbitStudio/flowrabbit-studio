package ai.flowrabbit.rest;

import ai.flowrabbit.acl.AppAcl;
import ai.flowrabbit.bus.MongoLogger;


import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.services.TokenService;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class AppTokenREST extends MongoREST {

    private final String organizationTeamDB;

    public AppTokenREST(MongoClient db) {
        super(db, App.class);
        this.setACL(new AppAcl(db));
        this.setIdParameter("appID");
        this.organizationTeamDB = DB.getTable(OrganizationTeam.class);
    }

    public Handler<RoutingContext> get() {
        return event -> get(event);
    }

    private void get(RoutingContext event) {
        String appID = getId(event);

        User user = getUser(event);
        if (user.hasClaim()) {
            logger.error("get() > Claim token not allowed");
            returnAccessError(event, appID);
            return;
        }
        String orgID = event.request().getParam("orgID");
        if (orgID!=null && !Organization.DEFAULT_ID.equals(orgID)) {
            getByOrg(event, appID, user);
        } else {
            getByTeam(event, appID, user);
        }
    }

    private void getByTeam(RoutingContext event, String appID, User user) {
        mongo.findOne(team_db, Team.findByUserAndApp(user, appID), null, res -> {
            if (res.succeeded()) {
                JsonObject acl = res.result();
                if (acl != null) {

                    String token  = TokenService.getAppToken(user, appID, acl.getInteger(Team.PERMISSION));

                    returnJson(event, new JsonObject()
                            .put("token", token)
                            .put(Team.PERMISSION, acl.getInteger(Team.PERMISSION)));

                } else {
                    returnAccessError(event, appID);
                }
            } else {
                returnAccessError(event, appID);
            }
        });
    }

    private void getByOrg(RoutingContext event, String appID, User user) {
        String orgID = event.request().getParam("orgID");
        if (Organization.DEFAULT_ID.equals(orgID)) {
            logger.error("getByOrg() > " + user + " tried to access default org");
            returnAccessError(event, appID);
            return;
        }
        if (orgID != null) {
            JsonObject query = OrganizationTeam.findByReaderAndOrg(user, orgID);
            System.out.println(query.encodePrettily());
            mongo.findOne(organizationTeamDB, query, null, res -> {
                if (res.succeeded()) {
                    JsonObject acl = res.result();
                    if (acl != null) {
                        String token = TokenService.getAppToken(
                                user,
                                appID,
                                acl.getInteger(OrganizationTeam.PERMISSION)
                        );
                        returnJson(event, new JsonObject()
                                .put("token", token)
                                .put(Team.PERMISSION, acl.getInteger(Team.PERMISSION)));
                    } else {
                        getByTeam(event, appID, user);
                    }
                } else {
                    returnAccessError(event, appID);
                }
            });
        } else {
            returnAccessError(event, appID);
        }
    }

    private void returnAccessError(RoutingContext event, String appID) {
        MongoLogger.error(
                event,
                getUser(event),
                AppTokenREST.class,
                "get",
                "User \" + getUser(event) + \" tried to get token without access to " + appID
        );
        returnError(event, 405);
    }


}
