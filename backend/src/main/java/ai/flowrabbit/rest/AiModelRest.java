package ai.flowrabbit.rest;

import ai.flowrabbit.acl.RoleACL;
import ai.flowrabbit.model.AiModel;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.Handler;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class AiModelRest extends MongoREST {

    public AiModelRest(MongoClient db) {
        super(db, AiModel.class);
        setACL(new RoleACL());
    }

    public Handler<RoutingContext> findAll() {
        return this::findAll;
    }

    private void findAll(RoutingContext event) {
        this.mongo.find(table, AiModel.all(), found -> {
           if(found.succeeded()) {
               returnJson(event, found.result());
           } else {
               returnError(event, 404);
           }
        });
    }



}
