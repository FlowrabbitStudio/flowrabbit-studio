package ai.flowrabbit.acl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Team;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;

public class ImageACL extends MongoAcl implements Acl{

    private final String app_db, team_db;

    private Logger logger = LoggerFactory.getLogger(AppAcl.class);

    public ImageACL(MongoClient client){
        this(client, "appID");
    }


    public ImageACL(MongoClient client, String id){
        super(client, id);
        this.app_db = DB.getTable(App.class);
        this.team_db = DB.getTable(Team.class);
    }


    @Override
    public void canCreate(User user, RoutingContext event, Handler<Boolean> handler) {
        if(user.hasRole(User.USER) || user.hasRole(User.ADMIN) || user.hasRole(User.TOKEN)){
            handler.handle(true);
        } else {
            handler.handle(false);
        }
    }

    @Override
    public void canRead(User user, RoutingContext event, Handler<Boolean> handler) {
        String appID = getId(event);
        logger.debug("canRead() > "+ appID);

        if (user.hasClaim()) {
            checkClaim(user, appID, Acl.READ, handler);
        } else {
            canReadACL(user, event, handler, appID);
        }
    }

    private void canReadACL(User user, RoutingContext event, Handler<Boolean> handler, String appID) {
        /**
         * First check if there is an Team entry, otherwise check if app is public
         */
        client.count(team_db, Team.canRead(user, appID), res -> {
            /**
             * FIXME: This is an ugly workaround. Sometimes we have double entries in the team list...
             */
            if (res.succeeded() && res.result() >= 1l) {
                if (res.result() > 1) {
                    logger.error("canRead() > count bigger 1");
                }
                handler.handle(true);
            } else {
                logger.error("canRead() > Check Public because > success: " + res.succeeded() + " >> count:" + res.result());
                client.count(app_db, App.findPublicByID(appID), isPublic -> {
                    assertOne(isPublic, handler, event, user);
                });
            }
        });
    }

    @Override
    public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
        String appID = getId(event);
        if (user.hasClaim()) {
            checkClaim(user, appID, Acl.WRITE, handler);
        } else {
            client.count(team_db, Team.canWrite(user, appID), res->{
                assertOne(res, handler, event, user);
            });
        }

    }

    @Override
    public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
        String appID = getId(event);
        if (user.hasClaim()) {
            checkClaim(user, appID, Acl.WRITE, handler);
        } else {
            client.count(team_db, Team.canWrite(user, appID), res -> {
                assertOne(res, handler, event, user);
            });
        }
    }




}
