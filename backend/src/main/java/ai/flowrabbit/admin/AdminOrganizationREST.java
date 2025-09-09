package ai.flowrabbit.admin;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.Organization;
import ai.flowrabbit.util.MongoPaging;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.util.MongoResultPump;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Calendar;

public class AdminOrganizationREST extends MongoREST {

    private Logger logger = LoggerFactory.getLogger(AdminOrganizationREST.class);

    public AdminOrganizationREST(MongoClient db) {
        super(db, Organization.class);
        this.setACL(new AdminACL());
    }

    protected void beforeCreate(RoutingContext event, JsonObject json){
        json.put(Organization.FIELD_CREATED, Calendar.getInstance().getTimeInMillis());

        // we should check here if the name is unique...
    }

    public Handler<RoutingContext>  findPaging(Class<?> model, String ... queryKeys) {
        return event -> findPaging(event, model, queryKeys);
    }

    private void findPaging(RoutingContext event, Class<?> model, String[] queryKeys) {
        logger.info("findPaging()");
        this.acl.canRead(getUser(event), event, allowed -> {
            if (allowed) {
                MongoPaging.run(this.mongo, event, model, queryKeys);
            }
        });
    }


    public Handler<RoutingContext> findAll() {
        return event -> findAll(event);
    }

    private void findAll(RoutingContext event) {
        this.acl.canRead(getUser(event), event , allowed -> {
            if (allowed) {
                MongoResultPump pump = new MongoResultPump(event);
                this.mongo.findBatch(this.table, Model.all())
                        .exceptionHandler(err -> pump.error())
                        .endHandler(v -> pump.end())
                        .handler(doc -> pump.pump(cleanJson(doc))); ;
            } else {
                returnError(event, 405);
            }
        });
    }
}

