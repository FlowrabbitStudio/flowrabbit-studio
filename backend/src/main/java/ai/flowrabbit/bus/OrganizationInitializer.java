package ai.flowrabbit.bus;

import ai.flowrabbit.model.Organization;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
public class OrganizationInitializer {

    private final Logger logger = LoggerFactory.getLogger(OrganizationInitializer.class);

    private static OrganizationInitializer instance = new OrganizationInitializer();

    private boolean isInitialized = false;

    public static synchronized OrganizationInitializer getInstance() {
        return instance;
    }

    public static void reset(){
        instance = new OrganizationInitializer();
    }

    public synchronized void init(MongoClient mongo, String table) {
        if (!this.isInitialized) {
            this.isInitialized = true;

            mongo.count(table, Organization.findById(Organization.DEFAULT_ID), res -> {
                if (res.succeeded()) {
                    logger.error("init() > found {} ", res.result());
                    if (res.result() == 0) {

                        JsonObject defaultOrg = new JsonObject()
                                .put("_id", Organization.DEFAULT_ID)
                                .put("name", Organization.DEFAULT_NAME)
                                .put("default", true);

                        mongo.save(table, defaultOrg, saved -> {
                            if (saved.succeeded()) {
                                logger.debug("init() > Create default org {}", saved.result());
                            } else {
                                logger.error("init() > ERROR. Could not create default org {}", saved.result(), saved.cause());
                                this.isInitialized = false;
                            }
                        });
                    }
                } else {
                    logger.error("init() > Could not count() ", res.cause());
                }
            }) ;

        }
    }

}