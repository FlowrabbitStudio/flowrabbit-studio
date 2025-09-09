package ai.flowrabbit.admin;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.util.MongoIndexUtil;
import ai.flowrabbit.util.REST;
import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AdminMongoIndexRest extends REST {

    private final AdminACL acl = new AdminACL();

    private final MongoClient db;

    private Logger logger = LoggerFactory.getLogger(AdminMongoIndexRest.class);

    public AdminMongoIndexRest(MongoClient db) {
        this.db = db;
    }


    public Handler<RoutingContext> get() {
        return event -> get(event);
    }

    public void get(RoutingContext event) {
        acl.isAdmin(getUser(event), event, allowed -> {
            if (allowed) {
                MongoIndexUtil.getIndexes(db, indexes -> {
                    returnJson(event, indexes);
                });
            } else {
                logger.error("get() get called without admin");
                returnError(event, 404);
            }
        });
    }

    public Handler<RoutingContext> update() {
        return event -> update(event);
    }

    public void update(RoutingContext event) {
        acl.isAdmin(getUser(event), event, allowed -> {
            if (allowed) {
                MongoIndexUtil.createIndexes(db, indexes -> {
                    returnJson(event, indexes);
                });
            } else {
                logger.error("update() get called without admin");
                returnError(event, 404);
            }
        });
    }
}
