package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.List;

@RunWith(VertxUnitRunner.class)
public class PublicationSettingsRestTest extends BaseTestCase {


    @Test
    public void test_CRUD(TestContext context) {
        log("test_CRUD", "enter");

        cleanUp();

        deploy(new Main(), context);

        sleep(200);

        List<JsonObject> orgs = client.find(DB.getTable(Organization.class), Model.all());
        context.assertEquals(orgs.size(), 1);


        /**
         * create user
         */
        postUser("klaus", context);
        postUser("serhad", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app1 = postApp("klaus_app_public", false, context);
        App app2 = postApp("klaus_app_public", false, context);

        JsonObject pub1 = getPublicSettings(app1, context);
        JsonObject pub2 = getPublicSettings(app2, context);

        postPublicSettings(app1, new JsonObject().put("name", "Test"), context);
        getPublicSettings(app1, context);

        // cannot use the same name
        postPublicError(app2, new JsonObject().put("name", "Test"), context);

        // is not published
        getPublicInvitationError("private", "Test", context);

        // set mode to team and public
        postPublicSettings(app1, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "Team"), context);
        postPublicSettings(app2, new JsonObject().put("mode", PublicationSettings.MODE_PUBLIC).put("name", "Public"), context);


        getPublicToken("private", "Team", context);
        getPublicToken("private", "Public", context);

        logout();
        getPublicError(app1, context);
        getPublicInvitationError("private", "Team", context);
        getPublicToken("private", "Public", context);


        // some not existing stuff
        getPublicInvitationError("dennis", "Public", context);
        getPublicInvitationError("private", "abc", context);

        // users are validated
        assertLogin(context, "serhad@quant-ux.de", "123456789");
        getPublicInvitationError("private", "Team", context);
        getPublicToken("private", "Public", context);


        log("test_CRUD", "exit");
    }


    @Test
    public void test_forbidden(TestContext context) {
        log("test_forbidden", "enter");

        cleanUp();

        deploy(new Main(), context);

        sleep(200);

        List<JsonObject> orgs = client.find(DB.getTable(Organization.class), Model.all());
        context.assertEquals(orgs.size(), 1);


        /**
         * create user
         */
        postUser("klaus", context);
        postUser("serhad", context);

        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App app1 = postApp("klaus_app_public", false, context);

        getPublicSettings(app1, context);

        postPublicSettings(app1, new JsonObject().put("name", "Test"), context);
        getPublicSettings(app1, context);


        // is not published
        getPublicInvitationError("private", "Test", context);

        // set mode to team and public
        postPublicSettings(app1, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "Team"), context);

        getPublicToken("private", "Team", context);

        // when set to forbidden, not token can be returned
        postPublicSettings(app1, new JsonObject().put("mode", PublicationSettings.MODE_FORBIDDEN).put("name", "Team"), context);
        getPublicTokenError("private", "Team", context);


        postPublicSettings(app1, new JsonObject().put("mode", "SOMEHACK").put("name", "Team"), context);
        getPublicTokenError("private", "Team", context);

        log("test_CRUD", "exit");
    }

    @Test
    public void test_CRUD_ORG(TestContext context) {
        log("test_CRUD_ORG", "enter");

        cleanUp();
        deploy(new Main(), context);

        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);
        JsonObject admin = this.createAdmin(context);

        /**
         * Create new org and add Jan
         */
        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject jansOrg = adminCreateOrganization(context,"JansFriends");
        JsonObject klausOrg = adminCreateOrganization(context,"KlausEnemies");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(3, orgs.size());

        this.adminAddOrgUser(context, jansOrg.getString("id"), jan.getEmail());

        JsonArray team = adminFindOrganizationTeam(context, jansOrg.getString("id"));
        context.assertEquals(1, team.size());

        /**
         * Create an app as Jan
         */
        assertLogin(context, jan.getEmail(), "123456789");
        App janApp = postApp("jans_app", false, context);
        App janApp2 = postApp("jans_app2", false, context);
        getPublicSettings(janApp, context);
        getPublicSettings(janApp2, context);
        postPublicSettings(janApp, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "TheAPP"), context);
        getPublicToken("private", "TheAPP", context);

        /**
         * Change the org
         */
        JsonArray jansOrgs = this.findOrganizationByUser(context, jan.getId());
        context.assertEquals(3, jansOrgs.size());
        print(jansOrgs);

        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "TheAPP"), context);

        getPublicToken("JansFriends", "TheAPP", context);

        // change back
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "TheAPP"), context);

        getPublicToken("private", "TheAPP", context);
        getPublicInvitationError("JansFriends", "TheAPP", context);

        // change again
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "TheAPP"), context);
        getPublicToken("JansFriends", "TheAPP", context);

        // keep everything the same just change visibility
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_PUBLIC)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "TheAPP"), context);
        getPublicToken("JansFriends", "TheAPP", context);

        // we can put another app in the domain
        postPublicSettings(janApp2, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "TheOtherApp"), context);
        getPublicToken("JansFriends", "TheOtherApp", context);

        // check that we cannot call another app in the same org the same name
        postPublicError(janApp2, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "TheAPP"), context);

        // Jan cannot use klaus org
        postPublicError(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", klausOrg.getString("id"))
                .put("name", "TheAPP"), context);

        log("test_CRUD", "exit");
    }

    @Test
    public void test_CRUD_ORG_BUG(TestContext context) {
        log("test_CRUD_ORG_BUG", "enter");

        cleanUp();
        deploy(new Main(), context);

        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);
        JsonObject admin = this.createAdmin(context);

        /**
         * Create new org and add Jan
         */
        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject jansOrg = adminCreateOrganization(context,"JansFriends");
        JsonObject klausOrg = adminCreateOrganization(context,"KlausEnemies");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(3, orgs.size());

        this.adminAddOrgUser(context, jansOrg.getString("id"), jan.getEmail());
        this.adminAddOrgUser(context, jansOrg.getString("id"), klaus.getEmail());
        this.adminAddOrgUser(context, klausOrg.getString("id"), klaus.getEmail());

        JsonArray jansTeam = adminFindOrganizationTeam(context, jansOrg.getString("id"));
        context.assertEquals(2, jansTeam.size());

        JsonArray klausTeam = adminFindOrganizationTeam(context, klausOrg.getString("id"));
        context.assertEquals(1, klausTeam.size());


        /**
         * Create an app as Jan
         */

        JsonArray jansOrgs = this.findOrganizationByUser(context, jan.getId());
        context.assertEquals(3, jansOrgs.size());
        print(jansOrgs);

        assertLogin(context, jan.getEmail(), "123456789");
        App janApp = postApp("jans_app", false, context);
        App janApp2 = postApp("jans_app2", false, context);
        App janApp3 = postApp("jans_app3", false, context);
        getPublicSettings(janApp, context);
        getPublicSettings(janApp2, context);
        getPublicSettings(janApp3, context);

        /**
         *
         */
        postPublicSettings(janApp, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "AAA"), context);
        getPublicToken("private", "AAA", context);

        postPublicSettings(janApp2, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "BBB"), context);
        getPublicToken("private", "BBB", context);

        postPublicSettings(janApp3, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "CCC"), context);
        getPublicToken("private", "CCC", context);

        /**
         * Create apps as klaus
         */
        assertLogin(context, klaus.getEmail(), "123456789");
        App klausApp = postApp("klaus_app", false, context);
        App klausApp2 = postApp("klaus_app_2", false, context);
        getPublicSettings(klausApp, context);
        getPublicSettings(klausApp2, context);

        postPublicSettings(klausApp, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "DDD"), context);
        getPublicToken("private", "DDD", context);

        postPublicSettings(klausApp2, new JsonObject().put("mode", PublicationSettings.MODE_TEAM).put("name", "EEE"), context);
        getPublicToken("private", "EEE", context);


        /**
         * change back to jan
         */
        assertLogin(context, jan.getEmail(), "123456789");

        /**
         * Change org
         */
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "AAA"), context);

        getPublicToken("JansFriends", "AAA", context);

        /**
         * Change back to private
         */
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "AAA"), context);

        /**
         * cannot change to taken names
         */
        postPublicError(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "BBB"), context);

        postPublicError(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "EEE"), context);

        /**
         * can change to other org with given name
         */
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "BBB"), context);


        /**
         * Change to klaus
         */
        assertLogin(context, klaus.getEmail(), "123456789");

        // change back
        postPublicSettings(klausApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "DDD"), context);

        postPublicSettings(klausApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", klausOrg.getString("id"))
                .put("name", "DDD"), context);

        postPublicSettings(klausApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_FORBIDDEN)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "DDD"), context);

        postPublicError(klausApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_PUBLIC)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "BBB"), context);

        postPublicSettings(klausApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "DDD"), context);

        postPublicError(klausApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "BBB"), context);


        /**
         * Change back to jan
         */
        assertLogin(context, jan.getEmail(), "123456789");

        postPublicError(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_TEAM)
                .put("orgID", Organization.DEFAULT_ID)
                .put("name", "BBB"), context);


        log("test_CRUD", "exit");
    }

    @Test
    public void test_Org(TestContext context) {
        log("test_CRUD", "enter");

        cleanUp();
        deploy(new Main(), context);

        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);
        User nerea = postUser("nerea", context);


        /**
         * Create new org and add Jan * Klaus as admin
         */
        this.createAdmin(context);
        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject jansOrg = adminCreateOrganization(context,"JansFriends");
        JsonObject nereasOrg = adminCreateOrganization(context,"NerasFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(3, orgs.size());

        this.adminAddOrgUser(context, jansOrg.getString("id"), jan.getEmail());
        this.adminAddOrgUser(context, jansOrg.getString("id"), klaus.getEmail());
        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());

        /**
         * Create an app as Jan
         */
        JsonArray jansOrgs = this.findOrganizationByUser(context, jan.getId());
        context.assertEquals(3, jansOrgs.size());
        print(jansOrgs);

        assertLogin(context, jan.getEmail(), "123456789");
        App janApp = postApp("jans_app", false, context);
        getPublicSettings(janApp, context);

        /**
         * Check Jan cannot publish in Nereas org
         */
        postPublicError(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put("orgID", nereasOrg.getString("id"))
                .put("name", "AAA"),
        context);

        /**
         * Publish in JansOrg
         */
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "AAA"),
        context);

        getPublicToken("JansFriends", "AAA", context);

        /**
         * Login as klaus
         */
        assertLogin(context, klaus.getEmail(), "123456789");
        getPublicToken("JansFriends", "AAA", context);


        /**
         * Login as Nerea, who cannot access
         */
        assertLogin(context, nerea.getEmail(), "123456789");
        getPublicInvitationError("JansFriends", "AAA", context);

        log("test_CRUD", "exit");
    }



}
