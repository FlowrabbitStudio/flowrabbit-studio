package ai.flowrabbit;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Organization;
import ai.flowrabbit.model.PublicationSettings;
import ai.flowrabbit.model.User;

import ai.flowrabbit.services.TokenService;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class OrganizationBlockTest extends BaseTestCase {


    @Test
    public void testOrg(TestContext context) {
        log("testOrg", "enter");
        this.assertBlock(context, PublicationSettings.MODE_ORGANIZATION, User.TOKEN_ORG);
    }


    @Test
    public void testTeam(TestContext context) {
        log("testTeam", "enter");
        this.assertBlock(context, PublicationSettings.MODE_TEAM, User.TOKEN_TEAM);
    }

    @Test
    public void testPublic(TestContext context) {
        log("testPublic", "enter");
        this.assertBlock(context, PublicationSettings.MODE_PUBLIC, User.TOKEN_PUBLIC);
    }



    public void assertBlock(TestContext context, String mode, String tokenType) {

        log("assertBlock", "enter");

        cleanUp();
        deploy(new Main(), context);

        JsonObject admin = this.createAdmin(context);

        createSecret(context, "myai", "aaa", SECRET_DEFAULT_DOMAIN, 2, 22);
        createSecret(context, "myService", "bbb", SECRET_DEFAULT_DOMAIN, 3, 33);
        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        User jan = postUser("jan", context);
        sleep(1000);

        // no login as jan and start to invite people
        assertLogin(context, jan);
        JsonArray jansOrgs = this.findOrganizationByUser(context, jan.getId());
        context.assertEquals(2, jansOrgs.size());

        JsonObject org = toMap(jansOrgs, Organization.FIELD_DISPLAY_NAME).get("Jan");
        String janOrgId = org.getString("id");
        String jansOrgName = org.getString("name");
        context.assertEquals(10000, org.getInteger(Organization.FIELD_CREDITS_IN_MICRO_CENT));



        App jansApp = postApp("JansApp", false, context);
        getPublicSettings(jansApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        postPublicSettings(jansApp, new JsonObject()
                .put("mode", mode)
                .put(PublicationSettings.FIELD_ORG_ID, janOrgId)
                .put("name", "JansApp"), context);


        JsonObject res = getPublicToken(jansOrgName, "JansApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(janOrgId, tokenUser.getOrgID());
        context.assertEquals(tokenType, tokenUser.getTokenType());


        logout();

        // this happens in the proxy
        this.setClientAPIKey(this.clientAPIKeyValue);

        // first call will fail, because org has 0 budget
        getPublicSecretsByName(context, token, "myai", SECRET_DEFAULT_URL); //-2
        getPublicSecretsByNameNoMeter(context, token, "myai", SECRET_DEFAULT_URL); // nothing substracted


        // we get get the app with the token
        getPublicApp(context, token);

        // just one call was deducted
        JsonObject orgDb = client.findOne(DB.getTable(Organization.class), Organization.findById(janOrgId));
        context.assertEquals(9998, orgDb.getInteger(Organization.FIELD_CREDITS_IN_MICRO_CENT));

        // now the admin will block the org
        assertLogin(context, admin.getString("email"), "123456789");
        JsonObject adminOrg = adminFindOrganizationByID(context, janOrgId);
        adminOrg.put(Organization.FIELD_STATUS, Organization.STATUS_BLOCKED);
        adminUpdateOrganizationByID(context, adminOrg);
        adminOrg = adminFindOrganizationByID(context, janOrgId);
        context.assertTrue(Organization.isBlocked(adminOrg));



        // now we can not get any secret
        getPublicSecretsByNameError(context, token, "myai", SECRET_DEFAULT_URL); //-2

        // also when logged in, the app can't be loaded any more
        assertLogin(context, jan);
        getPublicTokenError(jansOrgName, "JansApp", context);

        // yet the token is still active :(
        getPublicApp(context, token);
    }

}
