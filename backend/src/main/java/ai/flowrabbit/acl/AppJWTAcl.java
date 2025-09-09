package ai.flowrabbit.acl;

import ai.flowrabbit.model.User;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AppJWTAcl implements Acl{

    private final String id;

    private Logger logger = LoggerFactory.getLogger(AppAcl.class);

    public AppJWTAcl(){
        this("appID");
    }

    public AppJWTAcl(String id){
        this.id = id;
    }

    public void checkClaim(User user, String appID, int permission, Handler<Boolean> handler) {
        if (user.getAppID().equals(appID) && user.getAppPermission() >= permission) {
            handler.handle(true);
        } else {
            handler.handle(false);
        }
    }

    protected String getId(RoutingContext event) {
        return event.request().getParam(id);
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
        logger.error("canRead() > "+ appID +  " / "+event.request().path());
        canRead(user, event, appID, handler );
    }

    public void canRead(User user, RoutingContext event, String appID, Handler<Boolean> handler) {

        if (user.hasClaim()) {
            checkClaim(user, appID, Acl.READ, handler);
        } else {
            handler.handle(false);
        }
    }

    @Override
    public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
        String appID = getId(event);
        if (user.hasClaim()) {
            checkClaim(user, appID, Acl.WRITE, handler);
        } else {
           handler.handle(false);
        }
    }

    @Override
    public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
        String appID = getId(event);
        if (user.hasClaim()) {
            checkClaim(user, appID, Acl.WRITE, handler);
        } else {
            handler.handle(false);
        }
    }
}
