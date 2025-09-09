package ai.flowrabbit.acl;

import ai.flowrabbit.model.OrganizationTeam;
import ai.flowrabbit.model.PublicationSettings;
import ai.flowrabbit.model.Team;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AppOrgACL extends MongoAcl implements Acl{

    private final String team_db, org_team_db, pub_settings;

    private boolean allowPubTokens = true;

    private Logger logger = LoggerFactory.getLogger(AppAcl.class);

    public AppOrgACL(MongoClient client){
        this(client, "appID");
    }

    public AppOrgACL(MongoClient client, String id){
        super(client, id);
        this.org_team_db = DB.getTable(OrganizationTeam.class);
        this.team_db = DB.getTable(Team.class);
        this.pub_settings = DB.getTable(PublicationSettings.class);
    }


    @Override
    public void canCreate(User user, RoutingContext event, Handler<Boolean> handler) {
        if(user.hasRole(User.USER) || user.hasRole(User.ADMIN)){
            handler.handle(true);
        } else {
            handler.handle(false);
        }
    }

    @Override
    public void canRead(User user, RoutingContext event, Handler<Boolean> handler) {
        String appID = getId(event);
        canRead(user, event, appID, handler );
    }

    public void canRead(User user, RoutingContext event, String appID, Handler<Boolean> handler) {
        if (isAllowedClaim(user)) {
            checkClaim(user, appID, Acl.READ, handler);
        } else {
            canReadTeamACL(user, event, appID, handler);
        }
    }

    private boolean isAllowedClaim(User user) {
        if (user.hasClaim()) {
            if (user.isPubClaim()) {
                return this.allowPubTokens;
            }
            return true;
        }
        return false;
    }

    private void canReadTeamACL(User user, RoutingContext event, String appID, Handler<Boolean> handler) {
        /**
         * First check if there is a Team entry, otherwise check if app is public
         */
        client.count(team_db, Team.canRead(user, appID), res -> {
            if (res.succeeded() && res.result() >= 1l) {
                handler.handle(true);
            } else {
                hasOrgPermission(user, appID,OrganizationTeam.READ, handler);
            }
        });
    }

    private void hasOrgPermission(User user, String appID, int permission, Handler<Boolean> handler) {

        client.findOne(pub_settings, PublicationSettings.findByApp(appID), null, res -> {
            if (res.succeeded() && res.result() != null) {
                JsonObject settings = res.result();
                String orgID = settings.getString(PublicationSettings.FIELD_ORG_ID);
                client.count(org_team_db, OrganizationTeam.findByUserAndOrg(user, orgID, permission), count -> {
                    if (count.succeeded() && count.result() >=1) {
                        handler.handle(true);
                    } else {
                        logger.error("canReadOrgACL() > user not org " + orgID);
                        handler.handle(false);
                    }
                });
            } else {
                logger.error("canReadOrgACL() > no pub settings for app " + appID);
                handler.handle(false);
            }
        });
    }

    @Override
    public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
        String appID = getId(event);
        if (isAllowedClaim(user)) {
            checkClaim(user, appID, Acl.WRITE, handler);
        } else {
            client.count(team_db, Team.canWrite(user, appID), res->{
                if (res.succeeded() && res.result() >= 1l) {
                    handler.handle(true);
                } else {
                    hasOrgPermission(user, appID,OrganizationTeam.WRITE, handler);
                }
            });
        }
    }

    @Override
    public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
        String id = getId(event);
        client.count(team_db, Team.isOwner(user, id),  res->{
            assertOne(res, handler, event, user);
        });
    }

}
