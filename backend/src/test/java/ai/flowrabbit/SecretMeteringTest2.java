package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.services.TokenService;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.junit.Assert.*;

@RunWith(VertxUnitRunner.class)
public class SecretMeteringTest2 extends BaseTestCase {


    @Test
    public void testAdditionalBudget() {
        log("testAdditionalBudget", "enter");

        JsonObject org = Organization.create("test", "test", 100);

        assertEquals(100, Organization.getTotalBudget(org));

        JsonObject secret = new JsonObject().put(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_REQUEST, 10);
        assertTrue(Organization.hasOrgBudgetLeft(org, secret, 0));

        secret = new JsonObject().put(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_REQUEST, 101);
        assertFalse(Organization.hasOrgBudgetLeft(org, secret, 0));

        org.put(Organization.FIELD_ADDITIONAL_CREDITS_IN_CENTI_CENTS, 200);
        assertEquals(300, Organization.getTotalBudget(org));

        assertTrue(Organization.hasOrgBudgetLeft(org, secret, 0));

        JsonObject update = Organization.deductCredits(org, 10);
        // make sure original object is untouched
        assertEquals(100, Organization.getCredits(org));
        assertEquals(200, Organization.getAdditionalCredits(org));

        assertEquals(90, Organization.getCredits(update));
        assertEquals(200, Organization.getAdditionalCredits(update));

        // overflow and discount from additional budget
        update = Organization.deductCredits(org, 110);
        print(update);
        assertEquals(190, Organization.getTotalBudget(update));
        assertEquals(0, Organization.getCredits(update));
        assertEquals(190, Organization.getAdditionalCredits(update));

        update = Organization.deductCredits(org, 290);
        assertEquals(10, Organization.getTotalBudget(update));
        assertEquals(0, Organization.getCredits(update));
        assertEquals(10, Organization.getAdditionalCredits(update));
    }


    @Test
    public void testQuantity() {
        log("testAdditionalBudget", "enter");

        JsonObject org = Organization.create("test", "test", 100);

        assertEquals(100, Organization.getTotalBudget(org));

        JsonObject secret = createSecret(10, 20);
        assertTrue(Organization.hasOrgBudgetLeft(org, secret, 2));
        assertTrue(Organization.hasOrgBudgetLeft(org, secret, 5));
        assertFalse(Organization.hasOrgBudgetLeft(org, secret, 6));

    }

    private static JsonObject createSecret(long creditsRequest, int creditsQuantity) {
        return new JsonObject()
                .put(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_REQUEST, creditsRequest)
                .put(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_QUANTITY, creditsQuantity);
    }

    @Test
    public void testAdditionalOrgBudget(TestContext context) {
        log("testAdditionalOrgBudget", "enter");

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


        postPublicSettings(nerasAppOrg, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        this.setClientAPIKey(this.clientAPIKeyValue);

        JsonObject orgDB = client.findOne(organization_db, Organization.findById(nereasOrgId));
        print(orgDB);

        // with my private token i cannot get any secrets and no metering

    }


}
