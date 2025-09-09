package ai.flowrabbit;

import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.Organization;
import ai.flowrabbit.model.OrganizationTeam;
import ai.flowrabbit.model.User;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RunWith(VertxUnitRunner.class)
public class UserCustomOrgTest extends BaseTestCase {

    @Test
    public void testCreateCustomOrg(TestContext context) {
        log("testCRUD", "enter");

        cleanUp();
        deploy(new Main(), context);

        List<JsonObject> orgs = client.find(organization_db, Model.all());
        context.assertEquals(1, orgs.size());

        User nerea = postUser("nerea", context);
        postUser("jan", context);
        postUser("j.a.n", context);
        postUserWithOrgName("ner.ea", "rabbits", context);
        postUserWithOrgName("n.er.ea", "rabbits1", context);

        sleep(1000);


        orgs = client.find(organization_db, Model.all());
        context.assertEquals(6, orgs.size());

        Set<String> orgNames = Organization.getOrgDisplayNames(orgs);
        context.assertTrue(orgNames.contains("Jan"));
        context.assertTrue(orgNames.contains("Nerea"));
        context.assertTrue(orgNames.contains("JAN"));
        context.assertTrue(orgNames.contains("rabbits"));
        context.assertTrue(orgNames.contains("rabbits1"));

        assertLogin(context, nerea);

        // check nerea has a her own org
        List<JsonObject> nereasOrgs = toObjectList(findOrganizationByUser(context, nerea.getId()));
        context.assertEquals(2, nereasOrgs.size());

        JsonObject nereaOrg = nereasOrgs
                .stream()
                .filter(o -> o.getString(Organization.FIELD_DISPLAY_NAME).equals("Nerea"))
                .findFirst()
                .get();

        // check she is manager in the team
        JsonArray team = userFindOrganizationTeam(context, nereaOrg.getString("id"));
        context.assertEquals(1, team.size());
        context.assertEquals(OrganizationTeam.OWNER, team.getJsonObject(0).getInteger(OrganizationTeam.PERMISSION));
        context.assertEquals(nerea.getId(), team.getJsonObject(0).getString("id"));
    }

    public List<JsonObject> toObjectList(JsonArray a) {
        List<JsonObject> result = new ArrayList<>();
        for (int i=0; i < a.size(); i++) {
            result.add(a.getJsonObject(i));
        }
        return result;
    }

//    @Test
//    public void testOrgName(TestContext context) throws InterruptedException {
//        log("testOrgName", "enter");
//
//        cleanUp();
//        deploy(new MATC(), context);
//
//        this.createAdmin(context);
//
//        adminCreateOrganization(context,"nerea");
//        adminCreateOrganization(context,"nerea1");
//        adminCreateOrganization(context,"klausschaefers");
//        adminCreateOrganization(context,"klausschaefers1");
//
//        JsonArray orgs = this.adminFindOrganization(context);
//        context.assertEquals(5, orgs.size());
//
//
//        context.assertEquals("baba", getSuggestion("baba", 100));
//        context.assertEquals("filipeschaefers", getSuggestion("filipe.schaefers@gmail.com", 100));
//        context.assertEquals("nerea2", getSuggestion("nerea@gmail.com", 100));
//        context.assertEquals("klausschaefers2", getSuggestion("klaus.schaefers@gmail.com", 100));
//
//        // we test just 1 candidate, so klaus wont' be in and we get some random stuff
//        context.assertNotNull("klausschaefers2", getSuggestion("klaus.schaefers@gmail.com", 1));
//
//    }

    @Test
    public void testExtraName(TestContext context) throws InterruptedException {
        log("testExtraName", "enter");

        context.assertEquals("Nerea", Organization.suggestDisplayName("nerea@gmail.com"));
        context.assertEquals("NereaJensen", Organization.suggestDisplayName("nerea.jensen@gmail.com"));
        context.assertEquals("NereaJensen", Organization.suggestDisplayName("nerea.jensen"));
    }
}
