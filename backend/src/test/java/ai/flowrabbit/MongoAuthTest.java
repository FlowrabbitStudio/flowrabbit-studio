package ai.flowrabbit;

import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.Config;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.SyncMongoClient;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.unit.TestContext;

//@RunWith(VertxUnitRunner.class)
public class MongoAuthTest extends BaseTestCase {

    //@Test
    public void testAuth(TestContext context) {
        log("testCRUD", "enter");

        // db.createUser({user: "test", pwd:"123", roles:["dbAdmin"]})
        print("count" + client.count(DB.getTable(User.class), Model.all()));
    }

    //@Override
    protected void createSyncMongo() {
        conf.put(Config.MONGO_USER, "test");
        conf.put(Config.MONGO_PASSWORD, "123");

        JsonObject mongoConfig = Config.getMongo(conf);
        mongo = MongoClient.createShared(vertx,mongoConfig);
        client = new SyncMongoClient(mongo);
    }
}