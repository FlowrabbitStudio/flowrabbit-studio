package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.DebugMailClient;
import ai.flowrabbit.util.JsonPath;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.List;
import java.util.Map;

@RunWith(VertxUnitRunner.class)
public class OrganizationRestTest extends BaseTestCase {

    @Test
    public void testCRUD(TestContext context) {
        log("testCRUD", "enter");

        cleanUp();
        deploy(new Main(), context);


        User nerea = postUser("nerea", context);
        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);
        User dennis = postUser("dennis", context);
        User filipe = postUser("filipe", context);

        JsonObject admin = this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject org = adminCreateOrganization(context,"JansFriends");
        String jansOrgId = org.getString("id");

        JsonObject dennisInc = adminCreateOrganization(context,"DennisInc");
        String dennisIncId = dennisInc.getString("id");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(3, orgs.size());

        JsonArray team = adminFindOrganizationTeam(context, org.getString("id"));
        context.assertEquals(0, team.size());

        // we make jan the owner
        DebugMailClient.getMails().clear();
        this.adminAddOrgOwner(context, org.getString("id"), jan.getEmail());

        // make sure some mails were send
        sleep(1000);
        context.assertEquals(1, DebugMailClient.getMails().size());
        context.assertTrue(DebugMailClient.getMails().get(0).getText().contains("JansFriends"));

        // check we cannot add twice
        this.adminAddOrgUserError(context, jansOrgId, jan.getEmail());
        team = adminFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(1, team.size());

        logout();

        // no login as jan and start to invite people
        assertLogin(context, jan.getEmail(), "123456789");
        JsonArray jansOrgs = this.findOrganizationByUser(context, jan.getId());
        context.assertEquals(3, jansOrgs.size());

        // he cannot see others orgs
        this.findOrganizationByUserError(context, klaus.getId());
        this.findOrganizationByUserError(context, "someid");

        // jan can get the org by id
        JsonObject jansLoaded = findOrganizationById(context, jansOrgId);
        print(jansLoaded);
        context.assertEquals("JansFriends", jansLoaded.getString("name"));

        // jan can see his team
        team = userFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(1, team.size());

        // now add klaus & nerea
        userAddOrgReader(context, jansOrgId, klaus.getEmail());
        userAddOrgUser(context, jansOrgId, nerea.getEmail());
        team = userFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(3, team.size());

        // check that jan cannot mess with dennis org
        findOrganizationByIdError(context, dennisIncId);
        userAddOrgUserError(context, dennisIncId, nerea.getEmail());
        userFindOrganizationTeamError(context, dennisIncId);

        // invite user that does not exist
        DebugMailClient.getMails().clear();
        this.userInviteOrgUser(context, jansOrgId, "new.user@one.de");

        sleep(1000);
        context.assertEquals(1, DebugMailClient.getMails().size());
        String mailtext = DebugMailClient.getMails().get(0).getText();
        print(mailtext);
        context.assertTrue(mailtext.contains("create_account.html?invite="));
        context.assertTrue(mailtext.contains("JansFriends"));

        // make nera also owner
        userUpdateOrgUser(context, org.getString("id"), nerea.getId(), OrganizationTeam.OWNER);
        team = userFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(3, team.size());
        Map<String, JsonObject> byName = toMap(team, "name");
        context.assertEquals(OrganizationTeam.OWNER, byName.get("nerea").getInteger("permission"));
        context.assertEquals(OrganizationTeam.READ, byName.get("klaus").getInteger("permission"));
        context.assertEquals(OrganizationTeam.OWNER, byName.get("jan").getInteger("permission"));

        // now login as Nerea
        logout();
        assertLogin(context, nerea.getEmail(), "123456789");

        // she can load jans org
        jansLoaded = findOrganizationById(context, jansOrgId);
        context.assertEquals("JansFriends", jansLoaded.getString("name"));

        team = userFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(3, team.size());

        // she can add people, because she is owner
        userAddOrgUser(context, jansOrgId, dennis.getEmail());
        team = userFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(4, team.size());

        // login klaus
        logout();
        assertLogin(context, klaus.getEmail(), "123456789");

        // klaus can see the users
        team = userFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(4, team.size());

        // but he cannot add to jans org, althoug he is a member
        userAddOrgUserError(context, jansOrgId, filipe.getEmail());

        // he can also not mess with dennis org
        findOrganizationByIdError(context, dennisIncId);
        userAddOrgUserError(context, dennisIncId, nerea.getEmail());
        userFindOrganizationTeamError(context, dennisIncId);

        // login as jan and delete one user
        logout();
        assertLogin(context, jan);
        userRemoveOrgUser(context, jansOrgId, dennis.getId());
        team = userFindOrganizationTeam(context, jansOrgId);
        context.assertEquals(3, team.size());


        // guest can't do anything
        logout();
        findOrganizationByIdError(context, jansOrgId);
        findOrganizationByUserError(context, jansOrgId);
        userAddOrgUserError(context, jansOrgId, nerea.getEmail());
        userFindOrganizationTeamError(context, jansOrgId);

        findOrganizationByUserError(context, dennisIncId);
        findOrganizationByIdError(context, dennisIncId);
        userAddOrgUserError(context, dennisIncId, klaus.getEmail());
        userFindOrganizationTeamError(context, dennisIncId);


    }


    @Test
    public void testOwner(TestContext context) {
        log("testOwner", "enter");

        cleanUp();
        deploy(new Main(), context);


        User nerea = postUser("nerea", context);
        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);
        User dennis = postUser("dennis", context);
        User filipe = postUser("filipe", context);
        User bernardo = postUser("bernardo", context);
        User goran = postUser("goran", context);

        JsonObject admin = this.createAdmin(context);

        JsonObject org = adminCreateOrganization(context,"FilipesCrew");
        String orgID = org.getString("id");

        this.adminAddOrgOwner(context, orgID, filipe.getEmail());
//        print(client.find(DB.getTable(OrganizationTeam.class), Model.all()));
//        print(org);


        // filipe is an owner and can set other owners
        logout();
        assertLogin(context, filipe);
        this.userAddOrgUser(context, orgID, klaus.getEmail());
        this.userAddOrgReader(context, orgID, jan.getEmail());
        this.userAddOrgOwner(context, orgID, nerea.getEmail());

        // nera is an owner can set other owners
        logout();
        assertLogin(context, nerea);
        this.userAddOrgOwner(context, orgID, dennis.getEmail());

        // klaus is a reader and can add other readers, but
        // he cannot add owners
        logout();
        assertLogin(context, klaus);
        this.userAddOrgUser(context, orgID, goran.getEmail());
        this.userAddOrgOwnerError(context, orgID, bernardo.getEmail());
    }


    @Test
    public void testFolder(TestContext context) {
        log("testFolder", "testFolder");

        cleanUp();
        deploy(new Main(), context);

        User jan = postUser("jan", context);
        User klaus = postUser("klaus", context);

        JsonObject admin = this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject org = adminCreateOrganization(context,"JansFriends");
        String jansOrgId = org.getString("id");
        this.adminAddOrgOwner(context, jansOrgId, jan.getEmail());
        this.adminAddOrgUser(context, jansOrgId, klaus.getEmail());

        JsonObject org2 = adminCreateOrganization(context,"SerhardsFriends");
        String serhadsOrgID = org2.getString("id");

        logout();
        assertLogin(context, klaus);
        JsonObject folders = new JsonObject().put("name", "root");
        List<JsonObject> acls = client.find(DB.getTable(OrganizationTeam.class), Model.all());
        print(acls);
        updateOrgFolder(context, jansOrgId, folders);

        JsonObject updatedOrg = findOrganizationById(context, jansOrgId);
        context.assertTrue(updatedOrg.containsKey(Organization.FIELD_FOLDERS));
        context.assertEquals("root", JsonPath.getString(updatedOrg, "folders", "name" ));

        folders = new JsonObject().put("children", new JsonObject().put("name", "Draft"));
        updateOrgFolder(context, jansOrgId, folders);
        updatedOrg = findOrganizationById(context, jansOrgId);
        context.assertTrue(updatedOrg.containsKey(Organization.FIELD_FOLDERS));

        context.assertEquals("Draft", JsonPath.getString(updatedOrg, "folders", "children", "name" ));

        // we cannot write to other orh
        updateOrgFolderError(context,serhadsOrgID, new JsonObject().put("foo", "bar"));
        updateOrgFolderError(context, "Somethingrandom", new JsonObject().put("foo", "bar"));
        updateOrgFolderError(context, Organization.DEFAULT_ID, new JsonObject().put("foo", "bar"));
    }

    @Test
    public void testDisplayName(TestContext context) {
        log("testDisplayName", "enter");

        cleanUp();
        deploy(new Main(), context);

        User jan = postUser("jan", context);
        User klaus = postUser("klaus", context);

        JsonObject admin = this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject org = adminCreateOrganization(context,"JansFriends");
        String jansOrgId = org.getString("id");
        this.adminAddOrgOwner(context, jansOrgId, jan.getEmail());
        this.adminAddOrgUser(context, jansOrgId, klaus.getEmail());

        JsonObject org2 = adminCreateOrganization(context,"SerhardsFriends");
        String serhadsOrgID = org2.getString("id");

        // login as jan, who is owner. he can change the stripe stuug
        logout();
        assertLogin(context, jan);
        JsonObject newName = new JsonObject().put("displayName", "OglumsBuddys");
        updateDisplayName(context, jansOrgId, newName);

        JsonObject updatedOrg = findOrganizationById(context, jansOrgId);
        context.assertTrue(updatedOrg.containsKey(Organization.FIELD_DISPLAY_NAME));
        context.assertEquals("OglumsBuddys", updatedOrg.getString(Organization.FIELD_DISPLAY_NAME));

        // check klaus canot write
        logout();
        assertLogin(context, klaus);
        updateDisplayNameError(context, jansOrgId, newName);
        updateDisplayNameError(context,serhadsOrgID, new JsonObject().put("foo", "bar"));
        updateDisplayNameError(context, "Somethingrandom", new JsonObject().put("foo", "bar"));
        updateDisplayNameError(context, Organization.DEFAULT_ID, new JsonObject().put("foo", "bar"));

    }


    private JsonObject updateDisplayName(TestContext context, String jansOrgId, JsonObject folders) {
        JsonObject res = this.post("/rest/organizations/" + jansOrgId +"/displayName.json", folders);
        context.assertFalse(res.containsKey("error"));
        context.assertEquals("organization.update.displayName.ok", res.getString("details"));
        return res;
    }

    private JsonObject updateDisplayNameError(TestContext context, String jansOrgId, JsonObject folders) {
        JsonObject res = this.post("/rest/organizations/" + jansOrgId +"/displayName.json", folders);
        context.assertTrue(res.containsKey("error"));
        return res;
    }



    private JsonObject updateStripe(TestContext context, String jansOrgId, JsonObject folders) {
        JsonObject res = this.post("/rest/organizations/" + jansOrgId +"/stripe.json", folders);
        context.assertFalse(res.containsKey("error"));
        context.assertEquals("organization.update.stripe.ok", res.getString("details"));
        return res;
    }

    private JsonObject updateStripeError(TestContext context, String jansOrgId, JsonObject folders) {
        JsonObject res = this.post("/rest/organizations/" + jansOrgId +"/stripe.json", folders);
        context.assertTrue(res.containsKey("error"));
        return res;
    }



    private JsonObject updateOrgFolder(TestContext context, String jansOrgId, JsonObject folders) {
        JsonObject res = this.post("/rest/organizations/" + jansOrgId +"/folders.json", folders);
        context.assertFalse(res.containsKey("error"));
        context.assertEquals("organization.update.folders.ok", res.getString("details"));
        return res;
    }

    private JsonObject updateOrgFolderError(TestContext context, String jansOrgId, JsonObject folders) {
        JsonObject res = this.post("/rest/organizations/" + jansOrgId +"/folders.json", folders);
        context.assertTrue(res.containsKey("error"));
        return res;
    }

    @Test
    public void testHash(TestContext context) {
        log("testPublishedAppList", "enter");

        cleanUp();
        deploy(new Main(), context);

        JsonObject admin = this.createAdmin(context);
        JsonObject otherOrg = adminCreateOrganization(context, "SomeOtherOrg");

    }

    @Test
    public void testPublishedAppList(TestContext context) {
        log("testPublishedAppList", "enter");

        cleanUp();
        deploy(new Main(), context);

        JsonObject admin = this.createAdmin(context);
        JsonObject otherOrg = adminCreateOrganization(context,"SomeOtherOrg");
        String otherOrgId = otherOrg.getString("id");

        User benna = postUserWithOrgName("benna", "BennaInc", context);

        assertLogin(context, benna);
        JsonArray organizationByUser = this.findOrganizationByUser(context, benna.getId());
        //print(organizationByUser);
        context.assertEquals(2, organizationByUser.size());
        Map<String, JsonObject> name = toMap(organizationByUser, "displayName");
        String orgID = name.get("BennaInc").getString("id");

        App app1 = postAppInOrg("app1", orgID, context);
        App app2 = postAppInOrg("app2", orgID, context);
        App app3 = postAppInOrg("app3", orgID, context);
        App app4 = postAppInOrg("app4", orgID, context);

        getPublicSettings(app1, context);
        getPublicSettings(app2, context);
        getPublicSettings(app3, context);
        getPublicSettings(app4, context);

        // set mode to team and public
        postPublicSettings(app1, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "App1"), context);
        postPublicSettings(app2, new JsonObject().put("mode", PublicationSettings.MODE_PUBLIC).put("name", "App2"), context);
        postPublicSettings(app3, new JsonObject().put("mode", PublicationSettings.MODE_FORBIDDEN).put("name", "App3"), context);
        postPublicSettings(app4, new JsonObject().put("mode", PublicationSettings.MODE_PASSWORD).put("name", "App4"), context);


        //print(client.find(DB.getTable(PublicationSettings.class), Model.all()));

        JsonArray publishedAppInOrg = findPublishedAppInOrg(context, orgID);
        context.assertEquals(3, publishedAppInOrg.size());
        print(publishedAppInOrg);
        for (int i=0; i < publishedAppInOrg.size(); i++) {
            JsonObject app = publishedAppInOrg.getJsonObject(i);
            context.assertTrue(app.containsKey("pubSettings"));
            context.assertEquals(benna.getId(),app.getString("createdBy"));
        }

        postPublicSettings(app4, new JsonObject().put("mode", PublicationSettings.MODE_FORBIDDEN).put("name", "App4"), context);
        publishedAppInOrg = findPublishedAppInOrg(context, orgID);
        context.assertEquals(2, publishedAppInOrg.size());
    }


    @Test
    public void testWHOAMI(TestContext context) {
        log("testWHOAMI", "enter");

        cleanUp();
        deploy(new Main(), context);

        User jan = postUser("jan", context);
        User klaus = postUser("klaus", context);
        User serhad = postUser("serhad", context);

        this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject org = adminCreateOrganization(context, "JansFriends");
        String jansOrgId = org.getString("id");
        this.adminAddOrgOwner(context, jansOrgId, jan.getEmail());
        this.adminAddOrgUser(context, jansOrgId, klaus.getEmail());
        this.adminAddOrgReader(context, jansOrgId, serhad.getEmail());

        assertLogin(context, jan);
        JsonObject role = this.get("/rest/organizations/" + jansOrgId + "/whoami.json");
        context.assertEquals("OWNER", role.getString("role"));
        print(role);

        assertLogin(context, klaus);
        role = this.get("/rest/organizations/" + jansOrgId + "/whoami.json");
        context.assertEquals("WRITE", role.getString("role"));

        assertLogin(context, serhad);
        role = this.get("/rest/organizations/" + jansOrgId + "/whoami.json");
        context.assertEquals("READ", role.getString("role"));

    }

        public JsonArray findPublishedAppInOrg(TestContext context, String orgID) {
        String url  = "/rest/organizations/" + orgID + "/published/apps.json";
        JsonArray list = this.getList(url);
        return list;
    }




}
