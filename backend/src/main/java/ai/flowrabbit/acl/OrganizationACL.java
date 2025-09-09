package ai.flowrabbit.acl;

import ai.flowrabbit.model.Organization;
import ai.flowrabbit.model.OrganizationTeam;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OrganizationACL extends MongoAcl implements Acl{
    private Logger logger = LoggerFactory.getLogger(OrganizationACL.class);

    private final String org_team_db;
    public OrganizationACL(MongoClient client) {
        super(client);
        this.org_team_db = DB.getTable(OrganizationTeam.class);
    }

    @Override
    public void canCreate(User user, RoutingContext event,Handler<Boolean> handler) {
        handler.handle(false);
    }

    public void canCreateApp(User user, RoutingContext event,Handler<Boolean> handler) {
        String orgID = event.request().getParam("orgID");
        if (Organization.DEFAULT_ID.equals(orgID)) {
            logger.info("canCreateApp() > Create in default org");
            handler.handle(true);
        } else {
            canRead(user, event, handler);
        }
    }

    @Override
    public void canRead(User user, RoutingContext event,Handler<Boolean> handler) {
        String orgID = event.request().getParam("orgID");
        canRead(user, orgID, handler);
    }

    public void canRead(User user, String orgID, Handler<Boolean> handler) {
        String userID = user.getId();
        canRead(userID, orgID, handler);
    }

    public void canRead(String userID, String orgID, Handler<Boolean> handler) {
        logger.debug("canRead() > " + orgID + " > " + userID);
        JsonObject query = OrganizationTeam.findByReaderAndOrg(userID, orgID);
        client.count(org_team_db, query, res -> {
            if (res.succeeded() && res.result() >= 1l) {
                if (res.result() > 1) {
                    logger.error("canRead() > count bigger 1");
                }
                handler.handle(true);
            } else {
                handler.handle(false);
            }
        });
    }

    @Override
    public void canWrite(User user, RoutingContext event,Handler<Boolean> handler) {
        String userID = user.getId();
        String orgID = event.request().getParam("orgID");
        client.count(org_team_db, OrganizationTeam.findByOwnerAndOrg(userID, orgID), res -> {
            if (res.succeeded() && res.result() >= 1l) {
                if (res.result() > 1) {
                    logger.error("canWrite() > count bigger 1");
                }
                handler.handle(true);
            } else {
                handler.handle(false);
            }
        });
    }

    @Override
    public void canDelete(User user, RoutingContext event,Handler<Boolean> handler) {
        canWrite(user, event, handler);
    }
}
