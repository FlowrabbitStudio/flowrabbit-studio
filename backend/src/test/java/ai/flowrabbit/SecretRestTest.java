package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.services.TokenService;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class SecretRestTest extends BaseTestCase {


    @Test
    public void testCRUD(TestContext context) {
        log("testCRUD", "enter");

        /**
         * We test here that the flowrabbit secrets are measured on the organization
         * (not sure what happens in private??)
         */
        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 22);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publsihes
         */
        assertLogin(context, nerea.getEmail(), "123456789");

        App nerasApp = postApp("nerasApp", false, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        JsonObject aPublic = postPublicSettings(nerasApp, new JsonObject()
                    .put("mode", PublicationSettings.MODE_ORGANIZATION)
                    .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                    .put("name", "MyAiApp"), context);

        // should we publish???
        JsonObject res = getPublicToken("NerasFriends", "MyAiApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_ORG, tokenUser.getTokenType());

        // this happens in the proxy
        this.setClientAPIKey(this.clientAPIKeyValue);

        // first call will fail, because org has 0 budget
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL);

        // now we set some budget
        JsonObject orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        orgDb.put(Organization.FIELD_CREDITS_IN_MICRO_CENT, 100 * 2 + 7);
        client.save(DB.getTable(Organization.class), orgDb);
        print("Org > Step 1", orgDb);


        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL); // -2
        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL); // -2
        getPublicSecretsByName(context, token, "myService", SECRET_DEFAULT_URL); // -3
        getPublicSecretsByNameError(context, token, "alala", SECRET_DEFAULT_URL);

        orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        print("Org > Step 2", orgDb);

        context.assertEquals(200, orgDb.getInteger(Organization.FIELD_CREDITS_IN_MICRO_CENT)); // - 7 see above

        JsonObject callCounterMyApp = APICalls.getCallCounter(orgDb, "myai");
        context.assertEquals(2, callCounterMyApp.getInteger(APICalls.FIELD_CURRENT_API_CALLS));

        callCounterMyApp = APICalls.getCallCounter(orgDb, "myService");
        context.assertEquals(1, callCounterMyApp.getInteger(APICalls.FIELD_CURRENT_API_CALLS));

        // use the rest of the budget
        for (int i=0; i < 100; i++) {
            getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL);
        }
        sleep(2000);
        orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        print("Org > Step 3", orgDb);

        callCounterMyApp = APICalls.getCallCounter(orgDb, "myai");
        context.assertTrue(callCounterMyApp.getInteger(APICalls.FIELD_CURRENT_API_CALLS) > 98);
        context.assertTrue(3 > orgDb.getInteger(Organization.FIELD_CREDITS_IN_MICRO_CENT));


        sleep(4000);
        // we have exceeded the max, and calls will fail
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL);
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL);


        // the admin resets the tokens
        assertLogin(context, admin.getString("email"), "123456789");
        JsonObject orgAdmin = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        orgAdmin.put("id", orgAdmin.getString("_id"));
        orgAdmin.put(Organization.FIELD_CREDITS_IN_MICRO_CENT, 100);
        adminUpdateOrganization(context, orgAdmin);

        // check db is updated
        orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        context.assertEquals(100, orgDb.getInteger(Organization.FIELD_CREDITS_IN_MICRO_CENT));

        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL);

        // hacky
        getPublicSecretsByNameError(context, "wrong.token", "myai", SECRET_DEFAULT_URL);
        this.setClientAPIKey(null);
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL);
    }


    @Test
    public void testGetWithQuantity(TestContext context) {
        log("testGetWithQuantity", "enter");

        /**
         * We test here that the flowrabbit secrets are measured on the organization
         * (not sure what happens in private??)
         */
        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 20);

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends");
        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publsihes
         */
        assertLogin(context, nerea);

        App nerasApp = postApp("nerasApp", false, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        // should we publish???
        JsonObject res = getPublicToken("NerasFriends", "MyAiApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_ORG, tokenUser.getTokenType());

        // this happens in the proxy
        this.setClientAPIKey(this.clientAPIKeyValue);

        // now we set some budget
        JsonObject orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        orgDb.put(Organization.FIELD_CREDITS_IN_MICRO_CENT, 200);
        client.save(DB.getTable(Organization.class), orgDb);



        // now we request with quantity
        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL);
        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL, 2);
        sleep(100);

        // refused because 10 * 20 is more then the budget
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL, 10);

        // with no meter check stuff.
        getPublicSecretsByNameNoMeter(context, token, "myai", SECRET_DEFAULT_URL, 2);
        getPublicSecretsByNameNoMeter(context, token, "myai", SECRET_DEFAULT_URL, 7);
        getPublicSecretsByNameNoMeterError(context, token, "myai", SECRET_DEFAULT_URL, 20);

        sleep(1000);

        orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));

        // only the first two request were metered. The rest
        context.assertEquals(200 - (42), orgDb.getInteger("creditsInMicroCent"));

    }

    @Test
    public void testDomain(TestContext context) {
        log("testDomain", "enter");

        /**
         * We test here that the flowrabbit secrets are measured on the organization
         * (not sure what happens in private??)
         */
        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 22);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 3, 33);
        createSecret(context, "otherService", "ccc", "*.other.com", 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(3, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publsihes
         */
        assertLogin(context, nerea.getEmail(), "123456789");

        App nerasApp = postApp("nerasApp", false, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        // should we publish???
        JsonObject res = getPublicToken("NerasFriends", "MyAiApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_ORG, tokenUser.getTokenType());

        // this happens in the proxy
        this.setClientAPIKey(this.clientAPIKeyValue);

        // first call will fail, because org has 0 budget
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL);

        // now we set some budget
        JsonObject orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        orgDb.put(Organization.FIELD_CREDITS_IN_MICRO_CENT, 100 * 2 + 7);
        client.save(DB.getTable(Organization.class), orgDb);
        print("Org > Step 1", orgDb);


        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL);
        getPublicSecretsByName(context, token, "myService", SECRET_DEFAULT_URL);
        getPublicSecretsByName(context, token, "otherService", "http://api.other.com/user.json");


    }

    @Test
    public void testDomain2(TestContext context) {
        log("testDomain2", "enter");

        /**
         * We test here that the flowrabbit secrets are measured on the organization
         * (not sure what happens in private??)
         */
        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", "", 2, 22);
        createSecret(context, "myService", "bbb", "", 3, 33);
        createSecret(context, "otherService", "ccc", "*.other.com", 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(3, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publsihes
         */
        assertLogin(context, nerea.getEmail(), "123456789");

        App nerasApp = postApp("nerasApp", false, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        // should we publish???
        JsonObject res = getPublicToken("NerasFriends", "MyAiApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_ORG, tokenUser.getTokenType());

        // this happens in the proxy
        this.setClientAPIKey(this.clientAPIKeyValue);

        // first call will fail, because org has 0 budget
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL);

        // now we set some budget
        JsonObject orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        orgDb.put(Organization.FIELD_CREDITS_IN_MICRO_CENT, 100 * 2 + 7);
        client.save(DB.getTable(Organization.class), orgDb);
        print("Org > Step 1", orgDb);


        getPublicSecretsByNameError(context, token, "myai", "");
        getPublicSecretsByNameError(context, token, "myService", "");
        getPublicSecretsByName(context, token, "otherService", "http://api.other.com/user.json");

    }

    @Test
    public void testPrivateError(TestContext context) {
        log("testPrivateError", "enter");


        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 1, 1);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 1, 1);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context, "NerasFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publishes
         */
        assertLogin(context, nerea.getEmail(), "123456789");

        App nerasApp = postApp("nerasApp", false, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        JsonObject aPublic = postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, Organization.DEFAULT_ID)
                .put("name", "MyAiApp"), context);

        // should we publish???
        getPublicTokenError(Organization.DEFAULT_ID, "MyAiApp", context);

    }


    @Test
    public void testStudioToken(TestContext context) {
        log("testStudioToken", "enter");

        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 1000);
        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());


        createSecret(context, "myai", "topsecret1", SECRET_DEFAULT_DOMAIN, 110, 200);
        createSecret(context, "myService", "topsecret2", SECRET_DEFAULT_DOMAIN, 220, 300);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonObject nereaLogin = assertLogin(context, nerea);

        App nerasAppOrg = postApp("nerasApp", false, context);
        App nerasAppPrivate = postApp("nerasAppPrivate", false, context);
        getPublicSettings(nerasAppOrg, context);

        JsonObject aPublic = postPublicSettings(nerasAppOrg, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        this.setClientAPIKey(this.clientAPIKeyValue);

        // one app with an orh
        JsonObject invitation = getInvitation(nerasAppOrg, context);
        String hash = Invitation.getHash(invitation, Invitation.TEST);
        User invUser = TokenService.getUser(hash);
        context.assertEquals(User.TOKEN_STUDIO, invUser.getTokenType());
        context.assertEquals(nereasOrgId, invUser.getOrgID());
        context.assertEquals(true, invUser.hasClaim());
        context.assertTrue(invUser.isStudioToken());
        getPublicSecretsByName(context, hash, "myai", SECRET_DEFAULT_URL);

        User user = TokenService.getUser(hash);
        context.assertEquals(user.isPubClaim(), false);
        context.assertEquals(nereasOrgId, user.getOrgID());
        context.assertEquals(nerasAppOrg.getId(), user.getAppID());

        // check private app
        invitation = getInvitation(nerasAppPrivate, context);
        hash = Invitation.getHash(invitation, Invitation.TEST);
        getPublicSecretsByNameError(context, hash, "myai", SECRET_DEFAULT_URL);

        user = TokenService.getUser(hash);
        context.assertEquals(user.isPubClaim(), false);
        context.assertEquals(Organization.DEFAULT_ID, user.getOrgID());
        context.assertEquals(nerasAppPrivate.getId(), user.getAppID());
    }


    @Test
    public void testNoAccessWithUserToken(TestContext context) {
        log("testNoAccessWithUserToken", "enter");

        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 1000);
        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());


        createSecret(context, "myai", "topsecret1", SECRET_DEFAULT_DOMAIN, 110, 200);
        createSecret(context, "myService", "topsecret2", SECRET_DEFAULT_DOMAIN, 220, 300);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonObject nereaLogin = assertLogin(context, nerea);
        String userToken = nereaLogin.getString("token");

        App nerasAppOrg = postApp("nerasApp", false, context);
        App nerasAppPrivate = postApp("nerasAppPrivate", false, context);
        getPublicSettings(nerasAppOrg, context);

        JsonObject aPublic = postPublicSettings(nerasAppOrg, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        this.setClientAPIKey(this.clientAPIKeyValue);
        getPublicSecretsByNameError(context, userToken, "myai", SECRET_DEFAULT_URL);
    }


    @Test
    public void testPublicSecretDetails(TestContext context) {
        log("testPublicSecretDetails", "enter");

        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "topsecret1", "myai.com", 11, 111);
        createSecret(context, "myService", "topsecret2", "myService.com", 22, 222);
        createSecret(context, "noToken", "", "myService.com", 2, 0);
        createSecret(context, "noPrice", "asd", "myService.com", 0, 0);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(4, secrets.size());
        for (int i=0; i < secrets.size(); i++) {
            JsonObject s = secrets.getJsonObject(i);
            context.assertTrue(s.containsKey(Secret.FIELD_SECRET_VALUE));
            context.assertTrue(s.containsKey(Secret.FIELD_SECRET_PRICE_REQUEST_IN_MICRO_CENT));
            context.assertTrue(s.containsKey(Secret.FIELD_SECRET_PRICE_QUANTITY_IN_MICRO_CENT));
        }

        assertLogin(context, nerea);
        JsonArray pubSecrets = this.findPublicSecrets(context);
        context.assertEquals(2, pubSecrets.size());
        for (int i=0; i < pubSecrets.size(); i++) {
            JsonObject s = pubSecrets.getJsonObject(i);
            context.assertFalse(s.containsKey(Secret.FIELD_SECRET_VALUE));
            context.assertTrue(s.containsKey(Secret.FIELD_SECRET_PRICE_REQUEST_IN_MICRO_CENT));
            context.assertTrue(s.containsKey(Secret.FIELD_SECRET_PRICE_QUANTITY_IN_MICRO_CENT));
            context.assertFalse(s.containsKey(Secret.FIELD_SECRET_VALUE));
        }


        logout();
        this.findPublicSecretsError(context);

        // hacky
//        getSecretsByNameError(context, "wrong.token", "myai");
//        this.setClientAPIKey(null);
//        getSecretsByNameError(context, token, "myai");
    }

}
