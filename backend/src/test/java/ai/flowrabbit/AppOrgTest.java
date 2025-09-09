package ai.flowrabbit;

import ai.flowrabbit.acl.Acl;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Organization;
import ai.flowrabbit.model.PublicationSettings;
import ai.flowrabbit.model.User;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.IOException;

@RunWith(VertxUnitRunner.class)
public class AppOrgTest extends BaseTestCase {
	

	@Test
	public void testCreateWithOrg(TestContext context) throws IOException{
		log("testCreateWithOrg", "enter");
		
		cleanUp();
	
		deploy(new Main(), context);

		User nerea = postUser("nerea", context);
		User klaus = postUser("klaus", context);
		User jan = postUser("jan", context);
//		User dennis = postUser("dennis", context);
//		User filipe = postUser("filipe", context);

		this.createAdmin(context);

		JsonObject org = adminCreateOrganization(context,"NereasHomies");
		String org1ID = org.getString("id");

		org = adminCreateOrganization(context,"NereasCrew");
		String org2ID = org.getString("id");

		org = adminCreateOrganization(context,"KlausFriends");
		String org3ID = org.getString("id");

		this.adminAddOrgOwner(context, org1ID, nerea.getEmail());
		this.adminAddOrgOwner(context, org2ID, nerea.getEmail());
		this.adminAddOrgUser(context, org1ID, klaus.getEmail());

		JsonArray orgs = this.adminFindOrganization(context);
		context.assertEquals(4, orgs.size());


		logout();

		// jan will create some private apps
		assertLogin(context, jan.getEmail(), "123456789");
		App app0a = postApp("app0a", false, context);
		App app0b = postApp("app0b", false, context);
		App app0c = postApp("app0c", false, context);
		App app0d = postApp("app0c", false, context);

		assertUserAppList(4, context);
		assertPubSettingsOrg(context, Organization.DEFAULT_ID, app0a);

		// nerea will now create some app
		logout();
		assertLogin(context, nerea.getEmail(), "123456789");
		JsonArray nereasOrgs = this.findOrganizationByUser(context, nerea.getId());
		context.assertEquals(4, nereasOrgs.size());

		App appOrg1a = postAppInOrg("appOrg1a", org1ID, context);
		App appOrg1b = postAppInOrg("appOrg1b", org1ID, context);
		App appOrg1c = postAppInOrg("appOrg1c",  org1ID, context);

		App appOrg2a = postAppInOrg("appOrg2a",  org2ID, context);
		App appOrg2b = postAppInOrg("appOrg2b",  org2ID, context);

		App appPrivateA = postAppInOrg("appPrivateA",  Organization.DEFAULT_ID, context);
		App appPrivateB = postAppInOrg("appPrivateB",  Organization.DEFAULT_ID, context);
		App appPrivateC = postApp("appPrivateC",  false, context);
		App appPrivateD = postApp("appPrivateD",  false, context);
		assertUserAppList(9, context);

//		List<JsonObject> apps = client.find(DB.getTable(PublicationSettings.class), PublicationSettings.findByOrg( org1ID));
//		print(apps);

		// we could still create an app with the same name, because the
		// pubsettings are created with no name!
		//postAppInOrgError("appOrg1a", org1ID, context);

		// add klaus
		createPermission(klaus, appOrg1b, Acl.READ, context);
		// FIXME: This should give an error!
		createPermissionError(klaus, appOrg2b, Acl.READ, context);
		createPermission(klaus, appPrivateB, Acl.READ, context);

		assertUserAppList(9, context);

		assertPubSettingsOrg(context, org1ID, appOrg1a);
		assertPubSettingsOrg(context, org2ID, appOrg2a);
		assertPubSettingsOrg(context, Organization.DEFAULT_ID, appPrivateA);

		// cannot publish in different org, so it will be set
		// to private
		App appPrivateE = postAppInOrg("appPrivateE", org3ID, context);
		assertUserAppList(10, context);
		assertPubSettingsOrg(context, Organization.DEFAULT_ID, appPrivateE);

		// check that nerea can see all apps in the orgs
		JsonArray org1Apps = assertOrgAppList(org1ID, 3, context);
		assertAppNamePrefix(context, org1Apps, "appOrg1");

		JsonArray org2Apps = assertOrgAppList(org2ID, 2, context);
		assertAppNamePrefix(context, org2Apps, "appOrg2");

		JsonArray nerasPrivate = assertOrgAppList(Organization.DEFAULT_ID, 5, context);
		assertAppNamePrefix(context, nerasPrivate, "appPrivate");

		// check nera can not read apps in org3
		assertOrgAppListError(org3ID, context);

		// check klaus can not see apps in the org
		logout();
		assertLogin(context, klaus.getEmail(), "123456789");
		assertUserAppList(2, context);

		// klaus can read one in org2
		org1Apps = assertOrgAppList(org1ID, 1, context);
		assertAppNamePrefix(context, org1Apps, "appOrg1");

		// klaus cannot read org2, altough he is a team member!
		// FIXME: This is very weird
		assertOrgAppListError(org2ID, context);

		JsonArray klausPrivate = assertOrgAppList(Organization.DEFAULT_ID, 1, context);
		assertAppNamePrefix(context, klausPrivate, "appPrivate");


		log("testCreateWithOrg", "exit");
	}

	@Test
	public void testOrgTeam(TestContext context) throws IOException{
		log("testCreateWithOrg", "enter");

		cleanUp();

		deploy(new Main(), context);

		User nerea = postUser("nerea", context);
		User klaus = postUser("klaus", context);

		this.createAdmin(context);

		JsonObject org = adminCreateOrganization(context,"NereasHomies");
		String org1ID = org.getString("id");

		org = adminCreateOrganization(context,"NereasCrew");
		String org2ID = org.getString("id");

		this.adminAddOrgOwner(context, org1ID, nerea.getEmail());
		this.adminAddOrgOwner(context, org2ID, nerea.getEmail());
		this.adminAddOrgUser(context, org1ID, klaus.getEmail());

		JsonArray orgs = this.adminFindOrganization(context);
		context.assertEquals(3, orgs.size());

		logout();

		// klaus can only read 2
		assertLogin(context, klaus.getEmail(), "123456789");
		JsonArray klausOrgs = this.findOrganizationByUser(context, klaus.getId());
		context.assertEquals(3, klausOrgs.size());
		userFindOrganizationTeam(context, org1ID);
		userFindOrganizationTeamError(context, org2ID);
		findOrganizationById(context, org1ID);
		findOrganizationByIdError(context, org2ID);

		// nerea will now create some app
		logout();
		assertLogin(context, nerea.getEmail(), "123456789");
		JsonArray nereasOrgs = this.findOrganizationByUser(context, nerea.getId());
		context.assertEquals(4, nereasOrgs.size());

		App appOrg1a = postAppInOrg("appOrg1a", org1ID, context);
		App appOrg1b = postAppInOrg("appOrg1b", org1ID, context);

		App appOrg2a = postAppInOrg("appOrg2a",  org2ID, context);
		App appOrg2b = postAppInOrg("appOrg2b",  org2ID, context);

		App appPrivateA = postAppInOrg("appPrivateA",  Organization.DEFAULT_ID, context);
		App appPrivateB = postApp("appPrivateB", false, context);

		// add klaus
		createPermission(klaus, appOrg1a, Acl.READ, context);
		createPermission(klaus, appOrg1b, Acl.READ, context);
		createPermissionError(klaus, appOrg2a, Acl.READ, context, "apps.team.member.add.error.not.in.org");
		createPermissionError(klaus, appOrg2b, Acl.READ, context);
		createPermission(klaus, appPrivateA, Acl.READ, context);
		createPermission(klaus, appPrivateB, Acl.READ, context);

		log("testCreateWithOrg", "exit");
	}


	@Test
	public void testMoveApp(TestContext context) throws IOException{
		log("testCreateWithOrg", "enter");

		cleanUp();

		deploy(new Main(), context);

		User nerea = postUser("nerea", context);

		this.createAdmin(context);

		JsonObject org = adminCreateOrganization(context,"NereasHomies");
		String org1ID = org.getString("id");

		org = adminCreateOrganization(context,"NereasCrew");
		String org2ID = org.getString("id");

		this.adminAddOrgOwner(context, org1ID, nerea.getEmail());
		this.adminAddOrgOwner(context, org2ID, nerea.getEmail());

		JsonArray orgs = this.adminFindOrganization(context);
		context.assertEquals(3, orgs.size());

		logout();


		// nerea will now create some app
		logout();
		assertLogin(context, nerea.getEmail(), "123456789");
		JsonArray nereasOrgs = this.findOrganizationByUser(context, nerea.getId());
		context.assertEquals(4, nereasOrgs.size());

		App appOrg1a = postAppInOrg("appOrg1a", org1ID, context);
		App appOrg1b = postAppInOrg("appOrg1b", org1ID, context);

		App appOrg2a = postAppInOrg("appOrg2a",  org2ID, context);
		App appOrg2b = postAppInOrg("appOrg2b",  org2ID, context);
		App appOrg2c = postAppInOrg("appOrg2c",  org2ID, context);

		App appPrivateA = postAppInOrg("appPrivateA",  Organization.DEFAULT_ID, context);
		App appPrivateB = postApp("appPrivateB", false, context);

		JsonArray org1Apps = assertOrgAppList(org1ID, 2, context);
		assertAppNamePrefix(context, org1Apps, "appOrg1");

		JsonArray org2Apps = assertOrgAppList(org2ID, 3, context);
		assertAppNamePrefix(context, org2Apps, "appOrg2");


		JsonObject pub1a = getPublicSettings(appOrg1a, context);
		JsonObject pub2a = getPublicSettings(appOrg2a, context);
		print(pub1a);
		postPublicSettings(appOrg1a, new JsonObject()
				.put("mode", PublicationSettings.MODE_TEAM)
				.put("orgID", org2ID)
				.put("name", "TheAPP"), context);

		pub1a = getPublicSettings(appOrg1a, context);
		print(pub1a);

		org1Apps = assertOrgAppList(org1ID, 1, context);
		assertAppNamePrefix(context, org1Apps, "appOrg1");

		org2Apps = assertOrgAppList(org2ID, 4, context);


		log("testCreateWithOrg", "exit");
	}

	private static void assertAppNamePrefix(TestContext context, JsonArray nerasPrivate, String prefix) {
		for (int i = 0; i < nerasPrivate.size(); i++) {
			JsonObject p = nerasPrivate.getJsonObject(i);
			context.assertTrue(p.getString("name").startsWith(prefix));
		}
	}

	private void assertPubSettingsOrg(TestContext context, String org1ID, App app1a) {
		JsonObject pub1a = getPublicSettings(app1a, context);
		context.assertEquals("forbidden", pub1a.getString(PublicationSettings.FIELD_MODE));
		context.assertEquals(org1ID, pub1a.getString(PublicationSettings.FIELD_ORG_ID));
	}


}
