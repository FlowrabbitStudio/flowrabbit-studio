package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.services.TokenService;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.List;

@RunWith(VertxUnitRunner.class)
public class UserAppDataTest extends BaseTestCase {


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
        User jan = postUser("jan", context);

        this.createAdmin(context);

        JsonArray orgs = this.adminFindOrganization(context);
        context.assertEquals(1, orgs.size());

        JsonObject nereasOrg = adminCreateOrganization(context, "NerasFriends");
        orgs = this.adminFindOrganization(context);
        context.assertEquals(2, orgs.size());
        String nereasOrgId = nereasOrg.getString("id");

        this.adminAddOrgUser(context, nereasOrg.getString("id"), nerea.getEmail());
        this.adminAddOrgUser(context, nereasOrg.getString("id"), jan.getEmail());

        /**
         * nera creates app and publishes
         */
        assertLogin(context, nerea);

        App nerasApp = postApp("nerasApp", false, context);
        getPublicSettings(nerasApp, context);

        // we publish the app as an org. so tokens should be measured under the org
        postPublicSettings(nerasApp, new JsonObject()
                .put("mode", PublicationSettings.MODE_ORGANIZATION)
                .put(PublicationSettings.FIELD_ORG_ID, nereasOrgId)
                .put("name", "MyAiApp"), context);

        assertCRUD(context, nereasOrgId, 1);

        assertLogin(context, jan);
        assertCRUD(context, nereasOrgId, 2);

        // check stuff is deleted
        assertLogin(context, nerea);
        deleteApp(context, nerasApp.getId());

        sleep(2000);
        List<JsonObject> all = client.find(DB.getTable(UserAppData.class), Model.all());
        context.assertEquals(0, all.size());
    }

    private void assertCRUD(TestContext context, String nereasOrgId, int count) {
        JsonObject res = getPublicToken("NerasFriends", "MyAiApp", context);
        String token = res.getString("token");
        User tokenUser = TokenService.getUser(token);
        context.assertEquals(nereasOrgId, tokenUser.getOrgID());
        context.assertEquals(User.TOKEN_ORG, tokenUser.getTokenType());

        // can't access with user token
        getUserAppDataError(context);
        updateUserAppDataError(context, new JsonObject());

        setJWT(token);
        JsonObject empty = getUserAppData(context);
        context.assertEquals(0, empty.size());

        JsonObject payload = new JsonObject().put("a", 1).put("b", "bbb");
        updateUserAppData(context, payload);

        List<JsonObject> all = client.find(DB.getTable(UserAppData.class), Model.all());
        context.assertEquals(count, all.size());
        JsonObject loaded = getUserAppData(context);
        context.assertEquals(loaded, payload);

        // update again. ensure that the DB count didn't update
        payload = new JsonObject().put("a", 1).put("b", "bbb").put("c", true);
        updateUserAppData(context, payload);
        context.assertEquals(count, all.size());
        loaded = getUserAppData(context);
        context.assertEquals(loaded, payload);
    }

    private JsonObject updateUserAppData(TestContext context, JsonObject data) {
        JsonObject jsonObject = this.post("/rest/data/user/app.json", data);
        context.assertFalse(jsonObject.containsKey("errors"));
       // print("updateUserAppData", jsonObject);
        return jsonObject;
    }

    private JsonObject updateUserAppDataError(TestContext context, JsonObject data) {
        JsonObject jsonObject = this.post("/rest/data/user/app.json", data);
        context.assertTrue(jsonObject.containsKey("errors"));
        context.assertEquals("wrong.token", jsonObject.getJsonArray("errors").getString(0));
       // print("updateUserAppData", jsonObject);
        return jsonObject;
    }

    private JsonObject getUserAppData(TestContext context) {
        JsonObject jsonObject = this.get("/rest/data/user/app.json");
        context.assertFalse(jsonObject.containsKey("errors"));
        //print("getUserAppData", jsonObject);
        return jsonObject;
    }

    private JsonObject getUserAppDataError(TestContext context) {
        JsonObject jsonObject = this.get("/rest/data/user/app.json");
        context.assertTrue(jsonObject.containsKey("errors"));
        context.assertEquals("wrong.token", jsonObject.getJsonArray("errors").getString(0));
       // print("getUserAppDataError", jsonObject);
        return jsonObject;
    }
}