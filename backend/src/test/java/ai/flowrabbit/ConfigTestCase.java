package ai.flowrabbit;

import ai.flowrabbit.util.Config;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.HashMap;
import java.util.Map;

@RunWith(VertxUnitRunner.class)
public class ConfigTestCase extends BaseTestCase {


    @Test
    public void testSecureMongo () {
        JsonObject conf = new JsonObject()
                .put(Config.MONGO_USER, "serhad")
                .put(Config.MONGO_PASSWORD, "abs")
                .put(Config.MONGO_DB_NAME, "MATC")
                .put(Config.MONGO_USE_AUTH, true)
                .put(Config.MONGO_CONNECTION_STRING, "mongodb+srv://m-k70erg4h3n93nif8.mongodb.de-txl.ionos.com");

        JsonObject mongo = Config.getMongo(conf);
        Assert.assertEquals("mongodb+srv://serhad:abs@m-k70erg4h3n93nif8.mongodb.de-txl.ionos.com/MATC", mongo.getString("connection_string"));
    }

    @Test
    public void testMergeInEnv(TestContext context){
        log("testMergeInEnv", "enter");

        JsonObject config = new JsonObject().put("http.host", "XXX");

        Map<String, String> env = new HashMap<>();
        env.put(Config.ENV_HTTP_HOST, "https://other.com");

        JsonObject mergedConfig = Config.mergeEnvIntoConfig(config, env);
        context.assertEquals("https://other.com", mergedConfig.getString(Config.HTTP_HOST) );


        log("testMergeInEnv", "exit");
    }



    @Test
    public void testSetDefaults(TestContext context){
        log("testSetDefaults", "enter");

        JsonObject config = new JsonObject();
        JsonObject defaultConfig = Config.setDefaults(config);
        context.assertEquals("https://quant-ux.com", defaultConfig.getString(Config.HTTP_HOST) );

        log("testSetDefaults", "exit");
    }




}
