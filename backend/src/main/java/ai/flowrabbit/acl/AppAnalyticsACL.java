package ai.flowrabbit.acl;

import ai.flowrabbit.model.User;
import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class AppAnalyticsACL extends AppAcl{

    public AppAnalyticsACL(MongoClient client) {
        super(client);
    }

    @Override
    public void canCreate(User user, RoutingContext event, Handler<Boolean> handler) {
        this.canRead(user, event, handler);
    }

    @Override
    public void canWrite(User user, RoutingContext event, Handler<Boolean> handler) {
        handler.handle(false);
    }

    @Override
    public void canDelete(User user, RoutingContext event, Handler<Boolean> handler) {
        handler.handle(false);
    }
}
