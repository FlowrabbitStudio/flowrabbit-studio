package ai.flowrabbit;

import ai.flowrabbit.acl.Acl;
import ai.flowrabbit.model.*;
import ai.flowrabbit.services.TokenService;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AppTokenTest extends BaseTestCase {


    @Test
    public void test_OrgUser(TestContext context){
        log("test_OrgUser", "enter");

        cleanUp();

        deploy(new Main(), context);

        User klaus = postUser("klaus", context);
        User serhad = postUser("serhad", context);

        this.createAdmin(context);

        JsonObject org = adminCreateOrganization(context,"KlausJungx");
        String org1ID = org.getString("id");

        org = adminCreateOrganization(context,"KlausFriends");
        String org2ID = org.getString("id");

        this.adminAddOrgOwner(context, org1ID, klaus.getEmail());
        this.adminAddOrgUser(context, org2ID, klaus.getEmail());
        this.adminAddOrgUser(context, org1ID, serhad.getEmail());

        /**
         * create apps
         */
        assertLogin(context, klaus);
        App appOrg1 = postAppInOrg("klausOrg1", org1ID, context);
        App appPrivate = postAppInOrg("klausPrivate", Organization.DEFAULT_ID, context);

        createApp(context, appOrg1);
        createApp(context, appPrivate);

        String appOrg1Token = assertGetAppOrgToken(appOrg1, org1ID, context);
        User user = TokenService.getUser(appOrg1Token);
        context.assertFalse(user.isPubClaim());
        context.assertEquals(OrganizationTeam.OWNER, user.getAppPermission());

        String appToken = assertGetAppToken(appOrg1, context);
        user = TokenService.getUser(appToken);
        context.assertFalse(user.isPubClaim());
        context.assertEquals(Acl.OWNER, user.getAppPermission());

        /**
         * logout, user cannot read & write
         */
        logout();
        assertGetTokenError(appOrg1, context);
        getAppError(appOrg1, context);

        /**
         * Now check if we can read or write the app and the imahes
         */
        setJWT(appOrg1Token);
        assertAppUpdate(context, appOrg1);

        /**
         * check that the app token also works
         */
        setJWT(appToken);
        assertAppUpdate(context, appOrg1);

        /**
         * check private app, we cannot get an app token for private
         */
        assertGetAppOrgTokenError(appPrivate, Organization.DEFAULT_ID, context);

        // we cannot get another token with a claim
        assertGetAppTokenError(appPrivate, context);

        // but we can get a team token
        logout();
        assertLogin(context, klaus);
        String appPrivateToken = assertGetAppToken(appPrivate, context);
        user = TokenService.getUser(appPrivateToken);
        context.assertFalse(user.isPubClaim());

        setJWT(appPrivateToken);
        assertAppUpdate(context, appPrivate);

        // Check serhad
        logout();
        setJWT(null);
        assertLogin(context, serhad);

        // serhad can not get a token for the app
        assertGetAppTokenError(appPrivate, context);

        // serhad can get a token for the org
        String appOrg1TokenSerhard = assertGetAppOrgToken(appOrg1, org1ID, context);
        user = TokenService.getUser(appOrg1TokenSerhard);
        context.assertFalse(user.isPubClaim());
        context.assertEquals(OrganizationTeam.WRITE, user.getAppPermission());

        setJWT(appOrg1TokenSerhard);
        assertAppUpdate(context, appOrg1);

        log("test_OrgUser", "exit");
    }

    @Test
    public void test_hack(TestContext context) {
        log("test_hack", "enter");

        cleanUp();

        deploy(new Main(), context);

        User klaus = postUser("klaus", context);
        User serhad = postUser("serhad", context);
        User benna = postUser("benna", context);
        User nerea = postUser("nera", context);

        this.createAdmin(context);

        JsonObject org = adminCreateOrganization(context,"KlausJungx");
        String orgKlaus = org.getString("id");

        org = adminCreateOrganization(context,"BennaFriends");
        String orgBenna = org.getString("id");

        this.adminAddOrgOwner(context, orgKlaus, klaus.getEmail());
        this.adminAddOrgOwner(context, orgBenna, benna.getEmail());
        this.adminAddOrgUser(context, orgBenna, serhad.getEmail());

        /**
         * create apps
         */
        assertLogin(context, klaus);
        App klausOrg1 = postAppInOrg("klausOrg1", orgKlaus, context);
        App klausPrivate = postAppInOrg("klausPrivate", Organization.DEFAULT_ID, context);
        createPermission(serhad, klausPrivate, Acl.WRITE, context);
        createPermission(nerea, klausPrivate, Acl.READ, context);

//        assertGetAppToken(klausOrg1, context);
//        assertGetAppToken(klausPrivate, context);

        logout();
        assertLogin(context, benna);
        App bennaOrg1 = postAppInOrg("bennaOrg1", orgBenna, context);
        App bennaPrivate = postAppInOrg("bennaPrivae", Organization.DEFAULT_ID, context);

        assertGetAppToken(bennaOrg1, context);
        assertGetAppToken(bennaPrivate, context);
        assertGetAppTokenError(klausOrg1, context);
        assertGetAppTokenError(klausPrivate, context);


        // serhad can read klaus app, because he is in the team
        // and benna apps because he is in the org
        logout();
        assertLogin(context, serhad);
        assertGetAppToken(klausPrivate, context);
        // also over the org, because there is the fallback
        // over teams
        assertGetAppOrgToken(klausPrivate, orgBenna, context);
        assertGetAppOrgToken(klausPrivate, orgKlaus, context);
        assertGetAppTokenError(klausOrg1, context);
        assertGetAppOrgToken(bennaOrg1, orgBenna, context);
        assertGetAppOrgToken(bennaPrivate, orgBenna, context);

        // nera can also
        logout();
        assertLogin(context, nerea);
        assertGetAppToken(klausPrivate, context);
        assertGetAppTokenError(bennaOrg1, context);
        assertGetAppTokenError(bennaPrivate, context);
        assertGetAppTokenError(klausOrg1, context);
        assertGetAppOrgTokenError(bennaOrg1, orgBenna, context);
        assertGetAppOrgTokenError(bennaPrivate, orgBenna, context);
        assertGetAppOrgTokenError(klausOrg1, orgKlaus, context);

        // check not existing orgs
        logout();
        assertGetAppTokenError(klausPrivate, context);
        assertGetAppTokenError(bennaOrg1, context);
        assertGetAppTokenError(bennaPrivate, context);
        assertGetAppTokenError(klausOrg1, context);
        assertGetAppOrgTokenError(bennaOrg1, orgBenna, context);
        assertGetAppOrgTokenError(bennaPrivate, orgBenna, context);
        assertGetAppOrgTokenError(klausPrivate, orgKlaus, context);
        assertGetAppOrgTokenError(klausOrg1, orgKlaus, context);
    }


    @Test
    public void test_SingleUser(TestContext context){
        log("test_SingleUser", "enter");

        cleanUp();

        deploy(new Main(), context);

        /**
         * create user
         */
        User klaus = postUser("klaus", context);
        assertLogin(context, "klaus@quant-ux.de", "123456789");
        App klaus_app_private = postApp("klaus_app_private", false, context);

        postImage(klaus_app_private, context, "2000x4000_white.png", false);
        get("/rest/commands/" + klaus_app_private.getId() + ".json");

        // FIXME: We need to create an secret app part before
        getAppSecrets(klaus_app_private, context);
        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "a")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                );
        JsonObject newSecrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);
        postAppSecrets(klaus_app_private, newSecrets, context);
        getAppSecrets(klaus_app_private, context);

        String appToken = assertGetAppToken(klaus_app_private, context);
        User user = TokenService.getUser(appToken);
        context.assertFalse(user.isPubClaim());
        getApp(klaus_app_private, context);


        /**
         * logout, user cannot read & write
         */
        logout();
        assertGetTokenError(klaus_app_private, context);
        getAppError(klaus_app_private, context);

        /**
         * Now check if we can read or write the app and the imahes
         */
        setJWT(appToken);
        assertAppUpdate(context, klaus_app_private);
        log("test_SingleUser", "exit");
    }

    private void assertAppUpdate(TestContext context, App appOrg) {
        getApp(appOrg, context);
        get("/rest/commands/" + appOrg.getId() + ".json");

        JsonArray changes = new JsonArray();
        changes.add(createChange("update", "lastUUID", 2));
        changes.add(createChange("add", "grid", new JsonObject().put("x", 10).put("y", 10)));
        changes.add(createChange("add", "s1", new JsonObject().put("x", 10).put("y", 10).put("id", "s1"), "screens"));
        changes.add(createChange("add", "w1", new JsonObject().put("x", 1).put("y", 1).put("id","w1"), "widgets"));
        postChanges(appOrg, changes, context);

        postImage(appOrg, context, "2000x4000_white.png", false);

        // we can also work with the secrets
        getAppSecrets(appOrg, context);
        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "bb")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "456")
                );
        JsonObject newSecrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);
        postAppSecrets(appOrg, newSecrets, context);
        JsonObject updatedSecrets = getAppSecrets(appOrg, context);
        context.assertEquals("bb", updatedSecrets.getJsonArray("secrets").getJsonObject(0).getString("key"));

        // we get the hashes for images etc
        JsonObject invitations = getInvitation(appOrg, context);
        context.assertEquals(3, invitations.size());
    }

    private void createApp(TestContext context, App appOrg) {
        postImage(appOrg, context, "2000x4000_white.png", false);

        getAppSecrets(appOrg, context);
        JsonArray list = new JsonArray()
                .add(new JsonObject()
                        .put(AppSecrets.FIELD_SECRET_KEY, "a")
                        .put(AppSecrets.FIELD_SECRET_VALUE, "123")
                );
        JsonObject newSecrets = new JsonObject().put(AppSecrets.FIELD_SECRETS, list);
        postAppSecrets(appOrg, newSecrets, context);
        getAppSecrets(appOrg, context);
        getApp(appOrg, context);
    }

    JsonObject assertGetTokenError(App app, TestContext context) {
        JsonObject res = this.get("/rest/apps/" + app.getId() + "/token.json");
        context.assertTrue(res.containsKey("error"));
        return res;
    }

    public JsonObject createChange(String type,String name, JsonObject newValue){
        return new JsonObject()
                .put("type", type)
                .put("name", name)
                .put("object", newValue);
    }

}
