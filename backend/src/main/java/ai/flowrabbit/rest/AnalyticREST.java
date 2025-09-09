package ai.flowrabbit.rest;

import ai.flowrabbit.acl.RoleACL;
import ai.flowrabbit.model.AnalyticEvent;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AnalyticREST extends MongoREST {

    private static Logger logger = LoggerFactory.getLogger(AnalyticREST.class);

    public AnalyticREST(MongoClient db) {
        super(db, AnalyticEvent.class);
        setACL(new RoleACL()
                .create(User.GUEST)
                .delete(User.ADMIN)
                .read(User.GUEST)
                .write(User.ADMIN)
        );
    }


    @Override
    protected void beforeCreate(RoutingContext event, JsonObject json){
        if (!json.containsKey(AnalyticEvent.CREATED)) {
            json.put(AnalyticEvent.CREATED, System.currentTimeMillis());
        }
    }
}
