package ai.flowrabbit;

import ai.flowrabbit.model.App;
import ai.flowrabbit.model.PublicationSettings;
import ai.flowrabbit.model.User;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class PublicationSettingsRestTest3 extends BaseTestCase {


    @Test
    public void test_org_acl(TestContext context) {
        log("test_org_acl", "enter");

        cleanUp();
        deploy(new Main(), context);

        User klaus = postUser("klaus", context);
        User jan = postUser("jan", context);
        User nerea = postUser("nerea", context);

        /**
         * Create new org and add Jan * Klaus as admin
         */
        this.createAdmin(context);

        JsonObject jansOrg = adminCreateOrganization(context,"JansFriends");
        String janOrgID = jansOrg.getString("id");

        this.adminAddOrgOwner(context, janOrgID, jan.getEmail());
        this.adminAddOrgUser(context, janOrgID, klaus.getEmail());
        this.adminAddOrgReader(context, janOrgID, nerea.getEmail());

        logout();
        assertLogin(context, jan.getEmail(), "123456789");
        App janApp = postApp("jans_app", false, context);
        getPublicSettings(janApp, context);

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
         * Login as klaus. He can get the settings and
         * also write them because he is in the org
         */
        logout();
        assertLogin(context, klaus.getEmail(), "123456789");
        // klaus can get pub token
        getPublicToken("JansFriends", "AAA", context);

        // should work with the AppOrgACL
        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "BBBB"),
        context);

        // he can also change the settings with an app token
        String klausAppToken = assertGetAppOrgToken(janApp, janOrgID, context);
        setJWT(klausAppToken);
        getPublicSettings(janApp, context);

        postPublicSettings(janApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put("orgID", jansOrg.getString("id"))
                .put("name", "BBBB"),
        context);



//
//        /**
//         * Login as Nerea, who cannot access
//         */
//        logout();
//        assertLogin(context, nerea.getEmail(), "123456789");
//        getPublicInvitationError("JansFriends", "AAA", context);
//        getPublicTokenByDomainError("jan.com", "AAA", context);
//        getPublicTokenByDomainError("app.jan.de", "AAA", context);

        log("test_org_acl", "exit");
    }


    @Test
    public void test_no_domain(TestContext context) {
        log("test_no_domain", "enter");

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
         * Publish in JansOrg
         */
        postPublicSettings(janApp, new JsonObject()
                        .put("mode", PublicationSettings.MODE_ORGANIZATION)
                        .put("orgID", jansOrg.getString("id"))
                        .put("name", "AAA"),
                context);

        getPublicToken("JansFriends", "AAA", context);
        getPublicTokenByDomainError("jan.com", "AAA", context);
        getPublicTokenByDomainError("app.jan.de", "AAA", context);
        getPublicTokenByDomainError("wrong.de", "AAA", context);

        /**
         * Login as klaus
         */
        assertLogin(context, klaus.getEmail(), "123456789");
        getPublicToken("JansFriends", "AAA", context);
        getPublicTokenByDomainError("jan.com", "AAA", context);
        getPublicTokenByDomainError("app.jan.de", "AAA", context);


        log("test_no_domain", "exit");
    }


    @Test
    public void test_password(TestContext context) {
        log("test_password", "enter");

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
         * Publish in JansOrg
         */
        postPublicSettings(janApp, new JsonObject()
                        .put("mode", PublicationSettings.MODE_ORGANIZATION)
                        .put("orgID", jansOrg.getString("id"))
                        .put(PublicationSettings.FIELD_PASSWORD, "123123")
                        .put("name", "BBB"),
                context);

        getPublicToken("JansFriends", "BBB", context);

        postPublicSettings(janApp,
                new JsonObject()
                        .put("mode", PublicationSettings.MODE_PASSWORD)
                        .put("orgID", jansOrg.getString("id"))
                        .put(PublicationSettings.FIELD_PASSWORD, "123123")
                        .put("name", "AAA"),
        context);

        getPublicTokenError("JansFriends", "AAA", context);
        getPublicTokenByPassword("JansFriends", "AAA", "123123", context);
        getPublicTokenByPasswordError("JansFriends", "AAA", "", context);
        getPublicTokenByPasswordError("JansFriends", "BBB", "123123", context);
        getPublicTokenByPasswordError("JansFriends", "AAA", "wrong", context);

        logout();
        getPublicTokenByPassword("JansFriends", "AAA", "123123", context);
        getPublicTokenByPasswordError("JansFriends", "BBB", "123123", context);
        getPublicTokenByPasswordError("JansFriends", "AAA", "wrong", context);


        log("test_password", "exit");
    }



}
