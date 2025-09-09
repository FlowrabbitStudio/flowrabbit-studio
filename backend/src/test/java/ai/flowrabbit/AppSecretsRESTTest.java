package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.services.BlowFishService;
import ai.flowrabbit.services.TokenService;
import ai.flowrabbit.util.SecretUtil;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AppSecretsRESTTest extends BaseTestCase {



    @Test
    public void test_legacy(TestContext context) throws Exception {
        log("test_legacy", "enter");

        JsonArray secrets = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "a")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "http://flowrabbit.ai")
                );
        JsonObject payload = new JsonObject().put(AppSecrets.FIELD_SECRETS, secrets);
        JsonObject data = new JsonObject().put(AppSecrets.FIELD_PAYLOAD, payload);
        JsonObject result = AppSecrets.decryptSecrets(data, new BlowFishService("sad"));

        context.assertEquals(result.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_KEY), "a");
        context.assertEquals(result.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_VALUE), "123");
        context.assertEquals(result.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_DOMAIN), "http://flowrabbit.ai");

    }
    @Test
    public void test_encryption(TestContext context) throws Exception {
        log("test_encryption", "enter");

        BlowFishService s = new BlowFishService("sad");

        JsonArray secrets = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "a")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "http://flowrabbit.ai")
                );

        JsonObject payload = new JsonObject().put(AppSecrets.FIELD_SECRETS, secrets);
        AppSecrets.encryptSecrets(payload, s);

        Assert.assertEquals(2, (int)payload.getInteger(AppSecrets.FIELD_VERSION));
        Assert.assertNotEquals("123", payload.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_KEY));

        JsonObject data = new JsonObject().put(AppSecrets.FIELD_PAYLOAD, payload);
        JsonObject result = AppSecrets.decryptSecrets(data, s);

        context.assertEquals(result.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_KEY), "a");
        context.assertEquals(result.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_VALUE), "123");
        context.assertEquals(result.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_DOMAIN), "http://flowrabbit.ai");
        print(result);
    }

    @Test
    public void test_CRUD(TestContext context) {
        log("test_CRUD", "enter");

        cleanUp();

        deploy(new Main(), context);


        /**
         * create user
         */
        User klaus = postUser("klaus", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app1 = postApp("klaus_app_public", false, context);

        getAppSecrets(app1, context);

        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "a")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, "flowrabbit.ai")
                );
        JsonObject newSecrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);
        postAppSecrets(app1, newSecrets, context);

        JsonObject data2 = getAppSecrets(app1, context);
        context.assertEquals(data2.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_KEY), "a");
        context.assertEquals(data2.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_VALUE), "123");
        context.assertEquals(data2.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_DOMAIN), "flowrabbit.ai");


        postAppSecretsError(app1, new JsonObject().put("as", "1"), context);

        JsonObject invitation = getInvitation(app1, context);
        String hash = Invitation.getHash(invitation, Invitation.TEST);

        this.setClientAPIKey(this.clientAPIKeyValue);
        JsonObject invData = getPublicAppSecretsByHash(context, hash, app1, "https://flowrabbit.ai/api/post");
        context.assertEquals(invData.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_KEY), "a");
        context.assertEquals(invData.getJsonArray(AppSecrets.FIELD_SECRETS).getJsonObject(0).getString(AppSecrets.FIELD_SECRET_VALUE), "123");


        JsonObject notFound = getPublicAppSecretsByHash(context, hash, app1, "https://other.ai/api/post");
        context.assertEquals(0, notFound.getJsonArray(AppSecrets.FIELD_SECRETS).size());
        print("not ound", notFound);

        logout();
        getAppSecretsError(app1, context);

        log("test_CRUD", "exit");
    }

    @Test
    public void test_NoPublicTokens(TestContext context) {

        log("test_NoPublicTokens", "enter");

        cleanUp();

        deploy(new Main(), context);


        /**
         * create user
         */
        User klaus = postUser("klaus", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app1 = postApp("klaus_app_public", false, context);

        getAppSecrets(app1, context);

        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret1")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, SECRET_DEFAULT_DOMAIN)
                ).add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret2")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "456")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, SECRET_DEFAULT_DOMAIN)
                );
        JsonObject newSecrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);
        postAppSecrets(app1, newSecrets, context);

        getPublicSettings(app1, context);
        postPublicSettings(app1, new JsonObject()
                .put("name", "Test")
                .put("mode", PublicationSettings.MODE_TEAM),
        context);

        // we can use an app token to get the secret
        String appToken = assertGetAppToken(app1, context);
        User appTokenUser = TokenService.getUser(appToken);
        context.assertFalse(appTokenUser.isPubClaim());

        setJWT(appToken);
        JsonObject secrets = getAppSecrets(app1, context);
        context.assertEquals(2, secrets.getJsonArray("secrets").size());

        // we cannot use a pub token to get an app secrets
        String pubToken = getPublicToken("private", "Test", context)
                .getString("token");
        User pubTokenUser = TokenService.getUser(pubToken);
        context.assertTrue(pubTokenUser.isPubClaim());

        logout();
        setJWT(pubToken);
        getAppSecretsError(app1, context);

    }

    @Test
    public void test_PubToken(TestContext context) {

        log("test_PubToken", "enter");

        cleanUp();

        deploy(new Main(), context);

        // create a user
        postUser("klaus", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app1 = postApp("klaus_app_public", false, context);
        App app2 = postApp("klaus_app_public2", false, context);

        getAppSecrets(app1, context);

        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret1")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, SECRET_DEFAULT_DOMAIN)
                ).add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "appSecret2")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "456")
                        .put(AppSecrets.FIELD_SECRET_DOMAIN, SECRET_DEFAULT_DOMAIN)
                );
        JsonObject newSecrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);
        postAppSecrets(app1, newSecrets, context);

        getPublicSettings(app1, context);
        postPublicSettings(app1, new JsonObject()
                        .put("name", "Test")
                        .put("mode", PublicationSettings.MODE_TEAM),
                context);

        this.setClientAPIKey(this.clientAPIKeyValue);

        // we cannot use a pub token to get an app secrets
        // from "/rest/apps/" + app.getId() + "/secrets.json
        String pubToken = getPublicToken("private", "Test", context).getString("token");
        logout();

        // get from /rest/invitation/" + app.getId() + "/" + hash +"/secrets.json
        JsonObject appSecretsByHash = getPublicAppSecretsByHash(context, pubToken, app1);
        context.assertEquals(2, appSecretsByHash.getJsonArray("secrets").size());

        // get "/rest/public/secrets/app/" + app.getId() + "/" + hash +"/"+ name +".json"
        JsonObject appSecret1 = getPublicAppSecretsByHashName(context, pubToken, "appSecret1",app1);
        context.assertEquals("123", appSecret1.getString(AppSecrets.FIELD_SECRET_VALUE));

        JsonObject appSecret2 = getPublicAppSecretsByHashName(context, pubToken, "appSecret2",app1);
        context.assertEquals("456", appSecret2.getString(AppSecrets.FIELD_SECRET_VALUE));

        // test some hacky stuff
        getPublicAppSecretsByHashNameError(context, "wrongtoken", "appSecret1",app1);
        getPublicAppSecretsByHashNameError(context, pubToken, "appSecret2",app2);
        getPublicAppSecretsByHashNameError(context, pubToken, "appSecret3",app1);
        getPublicAppSecretsByHashError(context, pubToken, app2);
        getPublicAppSecretsByHashError(context, "wrongtoken", app1);

        // check that the endpoint only works with a valid API key
        this.setClientAPIKey("asdsad");
        getPublicAppSecretsByHashNameError(context, pubToken, "appSecret1",app1);

    }

    //@Test
    public void test_CheckDomain(TestContext context) {

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
        context.assertEquals(2, found.size());

        found = SecretUtil.filterByHost(secrets, "https://api.other.com/api/users");
        context.assertEquals(1, found.size());

    }


}
