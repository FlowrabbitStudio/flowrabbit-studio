package ai.flowrabbit;

import ai.flowrabbit.model.AppSecrets;

import ai.flowrabbit.util.SecretUtil;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class SecretUtilTest extends BaseTestCase {


    @Test
    public void test_filterByHost(TestContext context) {

        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret1")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "*.server.com")
                ).add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret2")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "456")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "*.server.com")
                ).add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret3")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "456")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "*.other.com")
                ).add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret4")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "456")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "other.com")
                ).add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret5")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "456")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "other.com")
                );
        JsonObject secrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);

        JsonArray found = SecretUtil.filterByHost(secrets, SECRET_DEFAULT_URL);
        context.assertEquals(2, found.size());

        found = SecretUtil.filterByHost(secrets, "https://other.com/api/users");
        context.assertEquals(3, found.size());

        found = SecretUtil.filterByHost(secrets, "https://api.other.com/api/users");
        context.assertEquals(1, found.size());

    }

    @Test
    public void test_secretMatchesHost(TestContext context) {

        JsonObject secret = new JsonObject()
                    .put(AppSecrets.FIELD_SECRET_KEY, "appSecret1")
                    .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                    .put(AppSecrets.FIELD_SECRET_DOMAIN, "*.server.com");


        context.assertTrue(SecretUtil.secretMatchesHost(secret, SECRET_DEFAULT_URL));
        //context.assertFalse(SecretUtil.secretMatchesHost(secret, "http://www.other.api.co,/user.json"));


    }

    @Test
    public void test_urlMatchPattern(TestContext context) {

        context.assertTrue(SecretUtil.hostMatchesPattern("server.com", "server.com"));
        context.assertTrue(SecretUtil.hostMatchesPattern( "api.server.com", "*.server.com"));
        context.assertTrue(SecretUtil.hostMatchesPattern( "v1.api.server.com", "*.server.com"));
        context.assertTrue(SecretUtil.hostMatchesPattern( "v1.api.server.com", "*.server.com"));
        context.assertTrue(SecretUtil.hostMatchesPattern( "server.com", "*.server.com"));
        context.assertTrue(SecretUtil.hostMatchesPattern("api.other.com", "*.api.other.com"));
        context.assertTrue(SecretUtil.hostMatchesPattern("v2.api.other.com", "*.api.other.com"));

        context.assertTrue(SecretUtil.hostMatchesPattern("fal.run", "*.fal.run"));
        context.assertTrue(SecretUtil.hostMatchesPattern("queue.fal.run", "*.fal.run"));

        context.assertFalse(SecretUtil.hostMatchesPattern( "api.v1.other.com", "*.server.com"));
        context.assertFalse(SecretUtil.hostMatchesPattern("api.server.com", "server.com"));
        context.assertFalse(SecretUtil.hostMatchesPattern("*.server.com", "server.com"));
        context.assertFalse(SecretUtil.hostMatchesPattern(".com", "server.com"));


    }

}
