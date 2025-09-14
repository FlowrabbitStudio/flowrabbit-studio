package ai.flowrabbit.admin;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.Secret;
import ai.flowrabbit.services.BlowFishService;
import ai.flowrabbit.services.EncryptionService;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.util.MongoResultPump;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AdminSecretRest extends MongoREST {

    private static final Logger logger = LoggerFactory.getLogger(AdminSecretRest.class);

    private final EncryptionService encryptionService;

    public AdminSecretRest(MongoClient db, EncryptionService encryptionService) {
        super(db, Secret.class);
        this.setACL(new AdminACL());
        this.encryptionService = encryptionService;
    }

    protected void beforeCreate(RoutingContext event, JsonObject json){
        try {
            json.put(Secret.FIELD_CREATED, System.currentTimeMillis());
            Secret.encryptSecret(json, this.encryptionService);
        } catch (Exception e) {
            logger.error("beforeCreate() > could not encrypt", e);
        }
    }

    protected void beforeUpdate(RoutingContext event, String id, JsonObject json) {
        try {
            json.put(Secret.FIELD_LAST_UPDATED, System.currentTimeMillis());
            Secret.encryptSecret(json, this.encryptionService);
        } catch (Exception e) {
            logger.error("beforeUpdate() > could not encrypt", e);
        }
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

    protected JsonObject cleanJson(JsonObject doc){
        try {
            Secret.decryptSecret(doc, this.encryptionService);
        } catch (Exception e) {
            logger.error("cleanJson() > could not decrypt > ", doc.getString(Secret.FIELD_SECRET_NAME));
        }
        return super.cleanJson(doc);
    }
}
