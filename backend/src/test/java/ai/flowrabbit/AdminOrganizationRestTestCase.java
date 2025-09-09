package ai.flowrabbit;

import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.Organization;
import ai.flowrabbit.model.OrganizationTeam;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.DebugMailClient;
import ai.flowrabbit.services.TokenService;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.List;

@RunWith(VertxUnitRunner.class)
public class AdminOrganizationRestTestCase extends BaseTestCase {
    
    public void testSetup() {
        
    }
    @Test
    public void testHack(TestContext context) {
        log("testHack", "enter");

        cleanUp();
        deploy(new Main(), context);

        User klaus = postUser("klaus", context);

        this.adminFindOrganizationError(context);

        assertLogin(context, klaus.getEmail(), "123456789");
        this.adminFindOrganizationError(context);
    }

    @Test
    public void testHack2(TestContext context) {
        log("testHack2", "enter");

        cleanUp();
        deploy(new Main(), context);

        JsonObject admin = this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject org = adminCreateOrganization(context,"JansFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());

        User klaus = postUser("klaus", context);
        assertLogin(context, klaus.getEmail(), "123456789");

        this.adminAddOrgUserError(context, org.getString("id"), klaus.getEmail());

        logout();
        this.adminAddOrgUserError(context, org.getString("id"), klaus.getEmail());
    }

    @Test
    public void testCRUD(TestContext context) {
        log("testCRUD", "enter");

        cleanUp();
        deploy(new Main(), context);


        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);
        User nera = postUser("nera", context);

        JsonObject admin = this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject org = adminCreateOrganization(context,"JansFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());

        JsonArray team = adminFindOrganizationTeam(context, org.getString("id"));
        context.assertEquals(0, team.size());

        DebugMailClient.getMails().clear();
        this.adminAddOrgUser(context, org.getString("id"), klaus.getEmail());
        this.adminAddOrgUser(context, org.getString("id"), jan.getEmail());
        this.adminAddOrgOwner(context, org.getString("id"), nera.getEmail());

        team = adminFindOrganizationTeam(context, org.getString("id"));
        context.assertEquals(3, team.size());

        // make sure some mails were send
        sleep(1000);
        context.assertEquals(3, DebugMailClient.getMails().size());
        context.assertTrue(DebugMailClient.getMails().get(0).getText().contains("JansFriends"));


        // check we cannot add twice
        this.adminAddOrgUserError(context, org.getString("id"), jan.getEmail());

        // invite user
        DebugMailClient.getMails().clear();
        this.adminInviteOrgUser(context, org.getString("id"), "new.user@one.de");

        sleep(1000);
        context.assertEquals(1, DebugMailClient.getMails().size());
        context.assertTrue(DebugMailClient.getMails().get(0).getText().contains("create_account.html?invite="));
        System.out.println(DebugMailClient.getMails().get(0).getText());


        // make sure we have only two member, new user just got a mail
        team = adminFindOrganizationTeam(context, org.getString("id"));
        context.assertEquals(3, team.size());

        adminRemoveOrgUser(context, org.getString("id"), klaus.getId());
        team = adminFindOrganizationTeam(context, org.getString("id"));
        context.assertEquals(2, team.size());


        adminUpdateOrgUser(context, org.getString("id"), jan.getId(), OrganizationTeam.OWNER);
        team = adminFindOrganizationTeam(context, org.getString("id"));
        context.assertEquals(2, team.size());
        context.assertEquals(OrganizationTeam.OWNER, team.getJsonObject(0).getInteger(OrganizationTeam.PERMISSION));

        logout();

        // check that jan can see his orgs
        assertLogin(context, jan.getEmail(), "123456789");
        JsonArray jansOrgs = this.findOrganizationByUser(context, jan.getId());
        context.assertEquals(3, jansOrgs.size());

        // he cannot see others orgs
        this.findOrganizationByUserError(context, klaus.getId());
        this.findOrganizationByUserError(context, "someid");

        // guest can's see shit
        logout();
        this.findOrganizationByUserError(context, jan.getId());

        // admin can read
        assertLogin(context, admin.getString("email"), "123456789");
        jansOrgs = this.findOrganizationByUser(context, jan.getId());
        context.assertEquals(3, jansOrgs.size());
    }

    @Test
    public void testUserInvite(TestContext context) {
        log("testCRUD", "enter");

        cleanUp();
        deploy(new Main(), context);


        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);

        JsonObject admin = this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject org = adminCreateOrganization(context,"JansFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());

        JsonArray team = adminFindOrganizationTeam(context, org.getString("id"));
        context.assertEquals(0, team.size());

        // invite user
        DebugMailClient.getMails().clear();
        this.adminInviteOrgUser(context, org.getString("id"), "new.user@one.de");

        sleep(1000);
        context.assertEquals(1, DebugMailClient.getMails().size());
        context.assertTrue(DebugMailClient.getMails().get(0).getText().contains("create_account.html?invite="));
        System.out.println(DebugMailClient.getMails().get(0).getText());

        String token = TokenService.getOrgInviteToken(org.getString("id"), "new.user@one.de", 2, 1);

        JsonObject loginRequest = new JsonObject()
                .put("email", "new.user@one.de")
                .put("password", "123456789")
                .put("orgInvite", token)
                .put("tos", true);

        JsonObject result = post("/rest/user", loginRequest);
        context.assertTrue(!result.containsKey("error"));
        context.assertTrue(!result.containsKey("errors"));
        context.assertFalse(result.containsKey("orgInvite"));

        // link to org is added async, thus wait a little
        sleep(1000);
        List<JsonObject> orgTeam = client.find(DB.getTable(OrganizationTeam.class), Model.all());
        context.assertEquals(4, orgTeam.size());

        // bad token with wring permission
        token = TokenService.getOrgInviteToken(org.getString("id"), "new.user@two.de", 5, 1);
        loginRequest.put("orgInvite", token).put("email", "new.user@two.de");
        JsonObject error = post("/rest/user", loginRequest);
        context.assertTrue(error.containsKey("errors"));
        context.assertEquals("user.invite.invalid", error.getJsonArray("errors").getString(0));

        // bad token with different mail
        token = TokenService.getOrgInviteToken(org.getString("id"), "new.user@three.de", 2, 1);
        loginRequest.put("orgInvite", token).put("email", "new.user@two.de");
        error = post("/rest/user", loginRequest);
        context.assertTrue(error.containsKey("errors"));
        context.assertEquals("user.invite.invalid", error.getJsonArray("errors").getString(0));

        // bad random token
        loginRequest.put("orgInvite", "dsfasdasd");
        error = post("/rest/user", loginRequest);
        context.assertTrue(error.containsKey("errors"));
        context.assertEquals("user.invite.error", error.getJsonArray("errors").getString(0));
    }


    @Test
    public void testCustomDomain(TestContext context) {
        log("testCustomDomain", "enter");

        cleanUp();
        deploy(new Main(), context);

        this.createAdmin(context);
        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        adminCreateOrganization(context,"NoDomain");
        JsonObject happyOrg = adminCreateOrganization(context,"HappyDotCom");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(3, orgs.size());

        happyOrg.put(Organization.FIELD_DOMAINS, new JsonArray().add("happy.com").add("feliz.pt"));
        adminUpdateOrganization(context, happyOrg);

        JsonObject loaded = adminGetOrganization(context, happyOrg.getString("id"));
        context.assertTrue(loaded.containsKey(Organization.FIELD_DOMAINS));

        // everyone can query by domain name
        logout();

    }


}
