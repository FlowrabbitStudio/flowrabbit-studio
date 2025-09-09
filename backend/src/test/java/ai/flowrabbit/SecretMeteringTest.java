package ai.flowrabbit;

import ai.flowrabbit.acl.Acl;

import ai.flowrabbit.model.*;
import ai.flowrabbit.services.TokenService;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class SecretMeteringTest extends BaseTestCase {


    @Test
    public void testNoAccessWithUserToken(TestContext context) {
        log("testNoAccessWithUserToken", "enter");

        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 22);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 100);
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());


        JsonObject nereaLogin = assertLogin(context, nerea);
        String userToken = nereaLogin.getString("token");
        User tokenUser = TokenService.getUser(userToken);
        context.assertEquals(User.TOKEN_USER, tokenUser.getTokenType());
        context.assertFalse(tokenUser.isStudioToken());
        context.assertFalse(tokenUser.hasClaim());
        context.assertFalse(tokenUser.isPubClaim());
        context.assertNull(tokenUser.getOrgID());
        context.assertNull(tokenUser.getPurchaseID());
        context.assertEquals("",tokenUser.getAppID());

        App nerasAppOrg = postApp("nerasApp", false, context);
        getPublicSettings(nerasAppOrg, context);

        JsonObject aPublic = postPublicSettings(nerasAppOrg, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        this.setClientAPIKey(this.clientAPIKeyValue);

        // with my private token i canot get any secrets and no metering
        getPublicSecretsByNameError(context, userToken, "myai", SECRET_DEFAULT_URL);
        getPublicSecretsByNameNoMeterError(context, userToken, "myai", SECRET_DEFAULT_URL);
        meterSecretByPrepaidBudgetOrOrgError(context, userToken, "myai", 2, 44);

    }

    @Test
    public void testStudio(TestContext context) {
        log("testStudio", "enter");

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

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 100);
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        assertLogin(context, nerea);

        App nerasAppOrg = postApp("nerasApp", false, context);
        getPublicSettings(nerasAppOrg, context);

        postPublicSettings(nerasAppOrg, new JsonObject()
                .put("mode", PublicationSettings.MODE_FORBIDDEN)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        this.setClientAPIKey(this.clientAPIKeyValue);

        // one app with an orh
        JsonObject invitation = getInvitation(nerasAppOrg, context);
        String hash = Invitation.getHash(invitation, Invitation.TEST);
        User invUser = TokenService.getUser(hash);
        context.assertEquals(User.TOKEN_STUDIO, invUser.getTokenType());
        context.assertTrue(invUser.isStudioToken());
        context.assertTrue(invUser.hasClaim());
        context.assertFalse(invUser.isPubClaim());
        context.assertEquals(nerasAppOrg.getId(), invUser.getAppID());
        context.assertEquals(nereasOrgId, invUser.getOrgID());


        assertMetering(context, nereasOrgId, hash);


    }


    @Test
    public void testOrgMetering(TestContext context) {
        log("testOrgMetering", "enter");


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

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 100);
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

        assertMetering(context, nereasOrgId, token);
    }

    private void assertMetering(TestContext context, String nereasOrgId, String token) {
        // this happens in the proxy
        this.setClientAPIKey(this.clientAPIKeyValue);

        // first call will fail, because org has 0 budget
        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL); //-2

        getPublicSecretsByNameNoMeter(context, token, "myai", SECRET_DEFAULT_URL); // nothing substracted
        getPublicSecretsByNameNoMeter(context, token, "myai", SECRET_DEFAULT_URL);

        // just one call was deducted
        JsonObject orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        context.assertEquals(98, orgDb.getInteger(Organization.FIELD_CREDITS_IN_CENTI_CENTS));

        // now we meter per call
        meterSecretByPrepaidBudgetOrOrg(context, token, "myai", 2, 44);

        sleep(1000);

        orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        print(orgDb);
        context.assertEquals(98-44, orgDb.getInteger(Organization.FIELD_CREDITS_IN_CENTI_CENTS));


        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL); //-2
        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL); //-2
        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL); //-2

        // some wrong domain
        getPublicSecretsByNameError(context, token, "myai", "http://other.api.com"); //-0

        orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(nereasOrgId));
        context.assertEquals(98-50, orgDb.getInteger(Organization.FIELD_CREDITS_IN_CENTI_CENTS));
    }


    @Test
    public void testTeamMetering(TestContext context) {
        log("testTeamMetering", "enter");


        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        User klaus = postUser("klaus", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 22);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 100);
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publsihes
         */
        assertLogin(context, nerea.getEmail(), "123456789");

        App nerasApp = postApp("nerasApp", false, context);
        createPermission(klaus, nerasApp, Acl.READ, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        JsonObject aPublic = postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        assertLogin(context, klaus);

        // should we publish???
        JsonObject res = getPublicToken("NerasFriends", "MyAiApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_TEAM, tokenUser.getTokenType());

        // this happens in the proxy
        assertMetering(context, nereasOrgId, token);
    }

    @Test
    public void testPublicMetering(TestContext context) {
        log("testPublicMetering", "enter");


        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        User klaus = postUser("klaus", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 22);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 100);
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publsihes
         */
        assertLogin(context, nerea.getEmail(), "123456789");

        App nerasApp = postApp("nerasApp", false, context);
        createPermission(klaus, nerasApp, Acl.READ, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        JsonObject aPublic = postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_PUBLIC)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        assertLogin(context, klaus);

        // should we publish???
        JsonObject res = getPublicToken("NerasFriends", "MyAiApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_PUBLIC, tokenUser.getTokenType());

        // this happens in the proxy
        assertMetering(context, nereasOrgId, token);
    }

    @Test
    public void testPasswordMetering(TestContext context) {
        log("testPasswordMetering", "enter");


        cleanUp();
        deploy(new Main(), context);
        User nerea = postUser("nerea", context);
        User klaus = postUser("klaus", context);
        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 22);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends", 100);
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * nera creates app and publsihes
         */
        assertLogin(context, nerea.getEmail(), "123456789");

        App nerasApp = postApp("nerasApp", false, context);
        createPermission(klaus, nerasApp, Acl.READ, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        JsonObject aPublic = postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_PASSWORD)
                .put(PublicationSettings.FIELD_PASSWORD, "123123")
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        assertLogin(context, klaus);

        // should we publish???
        JsonObject res = getPublicTokenByPassword("NerasFriends", "MyAiApp", "123123", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_PASSWORD, tokenUser.getTokenType());

        // this happens in the proxy
        assertMetering(context, nereasOrgId, token);
    }


}
