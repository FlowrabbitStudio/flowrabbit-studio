package ai.flowrabbit;

import ai.flowrabbit.model.*;
import ai.flowrabbit.util.*;
import com.google.common.base.Charsets;
import com.google.common.io.Closeables;
import ai.flowrabbit.bus.MongoLoggerHandler;
import ai.flowrabbit.bus.OrganizationInitializer;
import ai.flowrabbit.bus.RequestMonitorVehicle;
import ai.flowrabbit.rest.SecretRest;

import static java.nio.file.Files.readAllBytes;

import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.After;
import org.junit.Before;

import com.google.common.io.CharStreams;

import ai.flowrabbit.acl.Acl;
import io.vertx.core.AsyncResult;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Handler;
import io.vertx.core.Verticle;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.unit.TestContext;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.utility.DockerImageName;

import javax.imageio.ImageIO;

public class BaseTestCase {

	public static final String SECRET_DEFAULT_URL = "http://api.server.com/v1/post";

	public static final String SECRET_DEFAULT_DOMAIN = "*.server.com";

	protected Vertx vertx;

	protected MongoClient mongo;

	protected SyncMongoClient client;

	public JsonObject conf;

	public JSONMapper mapper = new JSONMapper();

	protected String team_db, inv_db, app_db, user_db, appEvent_db, commandStack_db, comments_db, event_db, image_db,
			annotation_db, command_db,mouse_db, notification_db, lib_db, lib_team_db, analytic_db, request_db,
			log_db, publicApp_db, organization_db, organizationMember_db, appData_db, appSecrets_db, secrets_db, app_analytics_db,
			 user_app_data_db, ai_model_db;

	protected BasicCookieStore cookieStore;

	protected CloseableHttpClient httpClient;

	protected int loglevel = 2;

	protected HashMap<String, List<Long>> restPerformance = new HashMap<String, List<Long>>();

	private String domain;
	
	private String jwt;

	private String clientAPIKey;

	public String clientAPIKeyValue = "awe3qecas23rvvsdvwe";

	private String serverURL = "http://localhost:8888";

	private MongoDBContainer mongoDBContainer;

	public void setJWT(String token) {
		this.jwt = token;
	}

	public void setClientAPIKey(String k) {
		this.clientAPIKey = k;
	}

	public String getJWT() {
		return this.jwt;
	}
	

	@Before
	public void before() {

//		mongoDBContainer = new MongoDBContainer(DockerImageName.parse("mongo:4.0.10"));
//		mongoDBContainer.start();

		log("before", "Mongo started");

		try {
			conf = new JsonObject(new String(readAllBytes(Paths.get("flowrabbit.conf"))));
			conf.put("mongo.table_prefix", "test");
			conf.put("image.folder.apps", "test/apps");
			conf.put("image.folder.user", "test/user");
			conf.put("backup.fs.folder", "test/backup");
			conf.put(Config.VERSION_FOLDER, "test/versions");
			conf.put(Config.CLIENT_API_KEY, clientAPIKeyValue);
			conf.put(Config.DB_ENCRYPTION_KEY, "testdbkey");
			conf.put("debug", true);

			//conf.put(Config.APP_SECRET_KEY, "sadi234sd123c");
		} catch (IOException e) {

		}

		this.serverURL = "http://localhost:" + conf.getInteger("http.port");

		vertx = Vertx.vertx();

		createSyncMongo();

		DB.setPrefix("test");

		app_db = DB.getTable(App.class);
		user_db = DB.getTable(User.class);
		commandStack_db = DB.getTable(CommandStack.class);
		command_db = DB.getTable(Command.class);
		comments_db = DB.getTable(Comment.class);
		log_db = DB.getTable(Log.class);
		event_db = DB.getTable(Event.class);
		image_db = DB.getTable(Image.class);
		annotation_db = DB.getTable(Annotation.class);
		inv_db = DB.getTable(Invitation.class);
		team_db = DB.getTable(Team.class);
		mouse_db = DB.getTable(Mouse.class);
		notification_db = DB.getTable(Notification.class);
		lib_db = DB.getTable(Library.class);
		lib_team_db = DB.getTable(LibraryTeam.class);
		appEvent_db = DB.getTable(AppEvent.class);
		analytic_db = DB.getTable(AnalyticEvent.class);
		request_db = DB.getTable(RequestEvent.class);
		publicApp_db = DB.getTable(PublicationSettings.class);
		organization_db = DB.getTable(Organization.class);
		organizationMember_db = DB.getTable(OrganizationTeam.class);
		appData_db = DB.getTable(AppData.class);
		appSecrets_db = DB.getTable(AppSecrets.class);
		secrets_db = DB.getTable(Secret.class);
		app_analytics_db = DB.getTable(AppAnalytics.class);
		user_app_data_db = DB.getTable(UserAppData.class);
		ai_model_db = DB.getTable(AiModel.class);

		cookieStore = new BasicCookieStore();
		jwt = null;

		httpClient = HttpClients.custom().setDefaultCookieStore(cookieStore).build();

		//DebugMailClient = false;



		System.out.println("\n\n\n--------------------------------\n\n");
	}

	@After
	public void after() throws IOException {
		vertx.close();
		httpClient.close();
		mongo.close();
		if (this.mongoDBContainer != null) {
			this.mongoDBContainer.close();
		}
	}
	protected void createSyncMongo() {
		JsonObject mongoConfig = Config.getMongo(conf);
		if (this.mongoDBContainer!=null) {
			mongoConfig.put("connection_string", this.mongoDBContainer.getConnectionString());
		}
		mongo = MongoClient.createShared(vertx,mongoConfig);
		client = new SyncMongoClient(mongo);
	}

	void delete(File f) {
		if (f.isDirectory()) {
			for (File c : f.listFiles())
				delete(c);
		}
	}




	protected void sleep(long m) {
		try {
			Thread.sleep(m);
		} catch (InterruptedException e) {
		}
	}

	protected void sleep() {
		try {
			Thread.sleep(500);
		} catch (InterruptedException e) {
		}
	}

	private void disableCookies () {
		log("disableCookies()", "enter");
		this.cookieStore.clear();
		httpClient = HttpClients.custom().disableCookieManagement().build();

	}
	
	public void cleanUp() {
		
		this.disableCookies();
		jwt = null;

		client.remove(app_db, App.all());
		client.remove(user_db, Model.all());
		client.remove(commandStack_db, Model.all());
		client.remove(comments_db, Model.all());
		client.remove(log_db, Model.all());
		client.remove(event_db, Model.all());
		client.remove(image_db, Model.all());
		client.remove(annotation_db, Model.all());
		client.remove(command_db, Model.all());
		client.remove(inv_db, Model.all());
		client.remove(team_db, Model.all());
		client.remove(mouse_db, Model.all());
		client.remove(notification_db, Model.all());
		client.remove(lib_db, Model.all());
		client.remove(lib_team_db, Model.all());
		client.remove(appEvent_db, Model.all());
		client.remove(analytic_db, Model.all());
		client.remove(request_db, Model.all());
		client.remove(publicApp_db, Model.all());
		client.remove(organization_db, Model.all());
		client.remove(organizationMember_db, Model.all());
		client.remove(appData_db, Model.all());
		client.remove(appSecrets_db, Model.all());
		client.remove(secrets_db, Model.all());
		client.remove(app_analytics_db, Model.all());
		client.remove(user_app_data_db, Model.all());
		client.remove(ai_model_db, Model.all());

		RequestMonitorVehicle.reset();
		MongoLoggerHandler.reset();
		OrganizationInitializer.reset();
	}

	public void debug(String method, String message) {
		log(4, method, message);
	}

	public void log(String method, String message) {
		log(3, method, message);
	}
	
	public void error(String method, String message) {
		log(0, method, message);
	}
	
	public void log(int level, String method, String message) {
		if (level <= loglevel)
			System.out.println(this.getClass().getSimpleName() + "." + method + "() > " + message);
	}

	public void logPerformance(String method, String url, long time) {
		String key = method + ":" + url;
		if (!restPerformance.containsKey(key)) {
			restPerformance.put(key, new ArrayList<Long>());
		}
		restPerformance.get(key).add(time);
	}

	public void printRestPerformance() {
		for (String key : restPerformance.keySet()) {
			Long count = restPerformance.get(key).stream().count();
			System.out.println(" - " + (count / restPerformance.get(key).size()) + "ms >> "
					+ restPerformance.get(key).size() + "x >>" +  key);
		}
	}

	public void print(List<JsonObject> results) {
		log("print", "#" + results.size() + " ");
		for (JsonObject result : results)
			System.out.println(result.encodePrettily());

	}

	public void print(String s) {
		System.out.println(s);
	}

	public void print(JsonArray results) {
		System.out.println("#" + results.size() + " ");
		System.out.println(results.encodePrettily());
	}

	public void print(String header, JsonArray results) {
		System.out.println("# " + header + " " + results.size() + " ");
		System.out.println(results.encodePrettily());
	}

	public Map<String, JsonObject> toMap(JsonArray list, String key) {
		Map<String, JsonObject> result = new HashMap<>();
		for (int i=0; i < list.size(); i++) {
			JsonObject o = list.getJsonObject(i);
			String k = o.getString(key);
			result.put(k, o);
		}
		return result;
	}


	public void print(String header, JsonObject result) {
		System.out.println(header + ": " + result.encodePrettily());
	}


	public void print(JsonObject results) {
		System.out.println(results.encodePrettily());
	}

	public void deploy(Verticle v, TestContext context) {

		CountDownLatch l = new CountDownLatch(1);

		DeploymentOptions options = new DeploymentOptions(new JsonObject().put("config", conf));

		vertx.deployVerticle(v, options, new Handler<AsyncResult<String>>() {

			@Override
			public void handle(AsyncResult<String> event) {

				if (event.succeeded()) {
					log("deploy", "exit > " + event.result());
					event.result();
				} else {
					// context.fail("Could not deploy verticle");
					event.cause().printStackTrace();
				}

				l.countDown();
			}
		});

		try {
			l.await();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		sleep(500);
	}

	public String getString(String url) {

		url = serverURL + url;
		try {
			long start = System.currentTimeMillis();
			HttpGet httpget = new HttpGet(url);
			if (this.jwt != null) {
				httpget.addHeader("Authorization", "Bearer " + this.jwt);
			}
			CloseableHttpResponse resp = httpClient.execute(httpget);

			if (resp.getStatusLine().getStatusCode() == 200) {
				InputStream is = resp.getEntity().getContent();
				String result = CharStreams.toString(new InputStreamReader(is));
				long end = System.currentTimeMillis();
				log("getString", "exit > " + url + " took :" + (end - start) + "ms");
				resp.close();
				return result;
			} else {
				resp.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;

	}

	public JsonObject post(String url, Object obj) {
		return post(url, mapper.toVertx(obj));
	}

	public JsonObject post(String url, JsonArray obj) {
		return post(url, obj.encode());
	}

	public JsonObject post(String url, JsonObject data) {
		return post(url, data.encode());
	}

	public JsonObject post(String url, String data) {
		log("post", url);
		url = serverURL + url;
		try {

			long start = System.currentTimeMillis();
			HttpPost post = new HttpPost(url);
			if (this.jwt != null) {
				post.addHeader("Authorization", "Bearer " + this.jwt);
			}
			
			if (this.domain != null){
				post.addHeader("app", this.domain);
			}

			if (this.clientAPIKey != null) {
				post.addHeader(SecretRest.FLOWRABBIT_API_KEY, clientAPIKey);
			}


			StringEntity input = new StringEntity(data);

			input.setContentType("application/json");
			post.setEntity(input);

			CloseableHttpResponse resp = httpClient.execute(post);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				String json = CharStreams.toString(new InputStreamReader(is));

				resp.close();
				long end = System.currentTimeMillis();
				logPerformance("POST", url, end - start);
				JsonObject result =  new JsonObject(json);

				if (result.containsKey("errors")) {
					System.err.println("post(): Error at URL: " + url);
				}
				return result;
			} else {
				resp.close();
				return new JsonObject().put("error", resp.getStatusLine().getStatusCode());
			}

		} catch (Exception e) {
			e.printStackTrace();

			return new JsonObject().put("error", "error");
		}

	}


	public JsonObject post(String url, String data, String headereKet, String headerValue) {
		log("post", url);
		url = serverURL + url;
		try {

			long start = System.currentTimeMillis();
			HttpPost post = new HttpPost(url);
			if (this.jwt != null) {
				post.addHeader("Authorization", "Bearer " + this.jwt);
			}

			if (this.domain != null){
				post.addHeader("app", this.domain);
			}

			if (this.clientAPIKey != null) {
				post.addHeader(SecretRest.FLOWRABBIT_API_KEY, clientAPIKey);
			}


			StringEntity input = new StringEntity(data);

			input.setContentType("application/json");
			post.setEntity(input);

			CloseableHttpResponse resp = httpClient.execute(post);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				String json = CharStreams.toString(new InputStreamReader(is));

				resp.close();
				long end = System.currentTimeMillis();
				logPerformance("POST", url, end - start);
				JsonObject result =  new JsonObject(json);

				if (result.containsKey("errors")) {
					System.err.println("post(): Error at URL: " + url);
				}
				return result;
			} else {
				resp.close();
				return new JsonObject().put("error", resp.getStatusLine().getStatusCode());
			}

		} catch (Exception e) {
			e.printStackTrace();

			return new JsonObject().put("error", "error");
		}

	}

	public JsonObject postFile(String url, String fileName) {
		log("post", url);
		url = serverURL + url;
		try {

			HttpPost post = new HttpPost(url);
			if (this.jwt != null) {
				post.addHeader("Authorization", "Bearer " + this.jwt);
			}

			File file = new File(fileName);
			if (!file.exists()) {
				error("post", "File " + file.getAbsolutePath() + " does not exits");
				return new JsonObject().put("error", "error").put("worngPath", fileName);
			}

			HttpEntity en = MultipartEntityBuilder.create().addBinaryBody(fileName, file).build();

			post.setEntity(en);

			CloseableHttpResponse resp = httpClient.execute(post);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				String json = CharStreams.toString(new InputStreamReader(is));

				resp.close();
				return new JsonObject(json);

			} else {
				resp.close();
				return new JsonObject().put("error", resp.getStatusLine().getStatusCode());
			}

		} catch (Exception e) {
			e.printStackTrace();

			return new JsonObject().put("error", "error");
		}

	}
	
	public JsonObject get(String url) {
		debug("get", url);
		url = serverURL + url;
		try {
			long start = System.currentTimeMillis();
			HttpGet httpget = new HttpGet(url);
			if (this.jwt != null) {
				httpget.addHeader("Authorization", "Bearer " + this.jwt);
			}

			if (this.clientAPIKey != null) {
				httpget.addHeader(SecretRest.FLOWRABBIT_API_KEY, clientAPIKey);
			}


			CloseableHttpResponse resp = httpClient.execute(httpget);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				String json = CharStreams.toString(new InputStreamReader(is));
				resp.close();

				long end = System.currentTimeMillis();
				logPerformance("GET", url, end - start);
				return new JsonObject(json);

			} else {
				//InputStream is = resp.getEntity().getContent();
//				String json = CharStreams.toString(new InputStreamReader(is));
//				print(json);

				resp.close();
				return new JsonObject().put("error", resp.getStatusLine().getStatusCode());
			}

		} catch (Exception e) {
			e.printStackTrace();
			return new JsonObject().put("error", "error");
		}

	}

	public JsonObject get(String url, String headerKey, String headerValue) {
		debug("get", url);
		url = serverURL + url;
		try {
			long start = System.currentTimeMillis();
			HttpGet httpget = new HttpGet(url);
			httpget.addHeader(headerKey, headerValue);
			if (this.jwt != null) {
				httpget.addHeader("Authorization", "Bearer " + this.jwt);
			}

			if (this.clientAPIKey != null) {
				httpget.addHeader(SecretRest.FLOWRABBIT_API_KEY, clientAPIKey);
			}


			CloseableHttpResponse resp = httpClient.execute(httpget);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				String json = CharStreams.toString(new InputStreamReader(is));
				resp.close();

				long end = System.currentTimeMillis();
				logPerformance("GET", url, end - start);
				return new JsonObject(json);

			} else {
				resp.close();
				return new JsonObject().put("error", resp.getStatusLine().getStatusCode());
			}

		} catch (Exception e) {
			e.printStackTrace();
			return new JsonObject().put("error", "error");
		}

	}



	public InputStream getRaw(String url) {
		debug("getRaw", url);
		url = serverURL + url;
		try {
			HttpGet httpget = new HttpGet(url);
			CloseableHttpResponse resp = httpClient.execute(httpget);
			if (resp.getStatusLine().getStatusCode() == 200) {
				return resp.getEntity().getContent();
			} else {
				error("getRaw()", "res"+ resp);
				resp.close();
				return null;
			}
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public int getRawStatusCode(String url) {
		debug("getRawStatusCode", url);
		url = serverURL + url;
		try {
			HttpGet httpget = new HttpGet(url);
			CloseableHttpResponse resp = httpClient.execute(httpget);
			return resp.getStatusLine().getStatusCode();

		} catch (Exception e) {
			e.printStackTrace();
			return -1;
		}
	}


	public <T> T get(String url, Class<T> cls) {
		debug("get", url);
		url = serverURL + url;
		try {
			HttpGet httpget = new HttpGet(url);
			if (this.jwt != null) {
				httpget.addHeader("Authorization", "Bearer " + this.jwt);
			}
			
			CloseableHttpResponse resp = httpClient.execute(httpget);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				String json = CharStreams.toString(new InputStreamReader(is));
				resp.close();

				return mapper.fromJson(json, cls);

			} else {
				resp.close();
				return null;
			}

		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}

	}
	
	public void logout() {
		delete("/rest/login");
		this.jwt = null;
	}

	public JsonArray getList(String url) {
		log("getList", url);
		url = serverURL + url;
		String json = null;
		try {

			long start = System.currentTimeMillis();
			HttpGet httpget = new HttpGet(url);
			if (this.jwt != null) {
				httpget.addHeader("Authorization", "Bearer " + this.jwt);
			}
			CloseableHttpResponse resp = httpClient.execute(httpget);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				json = CharStreams.toString(new InputStreamReader(is));
				resp.close();

				debug("getList", json);
				
				long end = System.currentTimeMillis();
				logPerformance("GET", url, end - start);

				try {
					return new JsonArray(json);
				} catch (Exception e){
					
				}
				return new JsonArray();

			} else {
				debug("getList", "Error :" + resp.getStatusLine().getStatusCode());
				resp.close();
				return new JsonArray().add(resp.getStatusLine().getStatusCode());
			}

		} catch (Exception e) {
			log("getList", "Error > " + json);
			e.printStackTrace();
			return null;
		}

	}

	public JsonObject delete(String url) {
		debug("delete", url);
		url = serverURL + url;
		try {
			long start = System.currentTimeMillis();
			HttpDelete httpget = new HttpDelete(url);
			if (this.jwt != null) {
				httpget.addHeader("Authorization", "Bearer " + this.jwt);
			}
			CloseableHttpResponse resp = httpClient.execute(httpget);

			if (resp.getStatusLine().getStatusCode() == 200) {

				InputStream is = resp.getEntity().getContent();

				String json = CharStreams.toString(new InputStreamReader(is));
				resp.close();

				long end = System.currentTimeMillis();
				logPerformance("DELETE", url, end - start);

				try {
					return new JsonObject(json);
				} catch (Exception e) {
					System.out.println(json);
					return new JsonObject().put("error", "error");
				}

			} else {
				resp.close();
				return new JsonObject().put("error", resp.getStatusLine().getStatusCode());
			}

		} catch (Exception e) {
			e.printStackTrace();
			return new JsonObject().put("error", "error");
		}

	}

	public JsonObject deletePermission(User user, App app, TestContext context) {
		List<JsonObject> acls = client.find(team_db, Team.findByUser(user));
		System.out.println("deletePermission() > user acls" + acls.size());
		int matches = 0;
		for(JsonObject acl : acls){
			String aclAppID = acl.getString("appID");
			if (aclAppID.equals(app.getId())){
				matches++;
			}
		}
		context.assertEquals(1, matches, "ACL not inclued");

		
		JsonObject result = delete("/rest/apps/" + app.getId() + "/team/" + user.getId() + ".json");
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));

		List<JsonObject> acls2 = client.find(team_db, Team.findByUser(user));
		context.assertEquals(acls.size()-1, acls2.size(), "Not one less");
		for(JsonObject acl : acls2){
			String aclAppID = acl.getString("appID");
			System.out.println(aclAppID + " ? " + app.getId());
			context.assertFalse(app.getId().equals(aclAppID));
		}

//      dunno since when this stopped working!
//		JsonObject mongo_app = client.findOne(app_db, App.findById(app.getId()));
//		JsonObject users = mongo_app.getJsonObject("users");
//		log("deletePermission", "findOne(mongo) > " + users);
//		context.assertFalse(users.containsKey(user.getId()));

		return result;
	}

	public JsonObject createPermission(User user, App app, int p, TestContext context) {
		JsonObject permission = new JsonObject().put("email", user.getEmail()).put("permission", p);
		JsonObject result = post("/rest/apps/" + app.getId() + "/team/", permission);

		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));

		JsonObject mongo_team = client.findOne(team_db, Team.findByUserAndApp(user, app.getId()));
		log("postPermission", "findOne(mongo) > " + mongo_team);
		context.assertEquals(mongo_team.getInteger(Team.PERMISSION), p, "Wrong permission in db");

		return result;
	}

	public JsonObject updatePermission(User user, App app, int p, TestContext context) {
		JsonObject permission = new JsonObject().put("permission", p);

		JsonObject result = post("/rest/apps/" + app.getId() + "/team/" + user.getId() + ".json", permission);
		log("updatePermission", " response > " + result.encode());
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));

		JsonObject mongo_team = client.findOne(team_db, Team.findByUserAndApp(user, app.getId()));
		debug("postPermission", "findOne(mongo) > " + mongo_team);
		context.assertEquals(mongo_team.getInteger(Team.PERMISSION), p, "Wrong permission in db");

		return result;
	}

	public JsonObject createPermissionError(User user, App app, int p, TestContext context) {
		JsonObject permission = new JsonObject().put("email", user.getEmail()).put("permission", p);
		JsonObject result = post("/rest/apps/" + app.getId() + "/team/", permission);
		debug("postPermissionError", "> " + result);
		print(result);
		context.assertTrue(result.containsKey("errors") || result.containsKey("error"));
		return result;
	}

	public JsonObject createPermissionError(User user, App app, int p, TestContext context, String errorCode) {
		JsonObject permission = new JsonObject().put("email", user.getEmail()).put("permission", p);
		JsonObject result = post("/rest/apps/" + app.getId() + "/team/", permission);
		debug("postPermissionError", "> " + result);
		print(result);
		context.assertTrue(result.containsKey("errors") || result.containsKey("error"));
		context.assertEquals(errorCode, result.getJsonArray("errors").getString(0));
		return result;
	}


	public JsonObject updatePermissionError(User user, App app, int p, TestContext context) {
		JsonObject permission = new JsonObject().put("permission", p);

		JsonObject result = post("/rest/apps/" + app.getId() + "/team/" + user.getId() + ".json", permission);
		debug("postPermissionError", "> " + result);
		context.assertTrue(result.containsKey("errors") || result.containsKey("error"));

		return result;
	}

	public JsonObject getApp(App app, TestContext context) {

		JsonObject result = get("/rest/apps/" + app.getId() + ".json");

		context.assertTrue(!result.containsKey("errors"), result.encode());
		context.assertTrue(!result.containsKey("error"), result.encode());
		context.assertTrue(result.containsKey("id"));

		return result;
	}
	
	

	public JsonObject getAppError(App app, TestContext context) {

		JsonObject result = get("/rest/apps/" + app.getId() + ".json");

		context.assertTrue(result.containsKey("errors") || result.containsKey("error"));
		context.assertTrue(!result.containsKey("id"));

		return result;
	}

	public JsonObject updateApp(App app, String name, TestContext context) {

		JsonObject update = new JsonObject().put("name", name);

		JsonObject result = post("/rest/apps/" + app.getId() + ".json", update);

		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));

		JsonObject mongo_app = client.findOne(app_db, App.findById(app.getId()));
		context.assertEquals(name, mongo_app.getString("name"));

		return result;
	}

	public JsonObject updateApp(App app, JsonObject update, TestContext context) {

		JsonObject result = post("/rest/apps/" + app.getId() + ".json", update);

		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));

		JsonObject mongo_app = client.findOne(app_db, App.findById(app.getId()));

		debug("udpateApp", mongo_app.encodePrettily());

		return result;
	}

	public JsonObject updateAppError(App app, String name, TestContext context) {

		JsonObject update = new JsonObject().put("name", name);

		JsonObject result = post("/rest/apps/" + app.getId() + ".json", update);
		context.assertTrue(result.containsKey("errors") || result.containsKey("error"));

		return result;
	}

	public App postApp(String name, boolean pub, TestContext context) {
		App app = createApp(name, pub);
		JsonObject result = post("/rest/apps", app);
	

		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("users"));
		context.assertTrue(!result.containsKey("invitations"));
		context.assertEquals(result.getBoolean("isPublic"), pub);

		app = mapper.fromVertx(result, App.class);
		context.assertEquals(result.getString("_id"), app.getId());

		return app;
	}

	public JsonObject deleteApp(TestContext context, String appID) {
		JsonObject result = delete("/rest/apps/" + appID +".json");
		print("deleteApp", result);
		return result;
	}

	public App postAppInOrg(String name, String orgID, TestContext context) {
		App app = createApp(name, false);
		JsonObject result = post("/rest/apps?orgID="+orgID, app);

		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("users"));
		context.assertTrue(!result.containsKey("invitations"));
		context.assertEquals(result.getBoolean("isPublic"), false);

		app = mapper.fromVertx(result, App.class);
		context.assertEquals(result.getString("_id"), app.getId());

		return app;
	}

	public void postAppInOrgError(String name, String orgID, TestContext context) {
		App app = createApp(name, false);
		JsonObject result = post("/rest/apps?orgID="+orgID, app);

		context.assertTrue(result.containsKey("errors"));
		context.assertEquals("apps.team.member.add.error.not.in.org", result.getJsonArray("errors").getString(0));

	}

	public JsonObject createApp(String name, int w, int h, TestContext context) {
		JsonObject app = new JsonObject();
		
		app.put("name", name);
		app.put("screenSize", new JsonObject().put("w" ,w).put("h", h));
		app.put("screens", new JsonObject());
		app.put("widgets", new JsonObject());
		app.put("isPublic", false);
		
		JsonObject result = post("/rest/apps", app);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("users"));
		context.assertTrue(!result.containsKey("invitations"));

		
		return result;
	}
	
	public JsonObject postAppAsJson(String name, boolean pub, TestContext context) {
		App app = createApp(name, pub);
		JsonObject result = post("/rest/apps", app);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("users"));
		context.assertTrue(!result.containsKey("invitations"));
		context.assertEquals(result.getBoolean("isPublic"), pub);

		context.assertEquals(result.getString("_id"), app.getId());

		return result;
	}

	public User postUser(String name, TestContext context) {
		User user = createUser(name);
		user.setPassword("123456789");
		JsonObject result = post("/rest/user", user);
		debug("postUser", result.encode());
		if (result.containsKey("errors")) {
			System.err.println("postUser(): Error" + result.toString());
		}
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));
		user.setId(result.getString("_id"));

		return user;
	}

	public User postUserWithOrgName(String name, String orgName, TestContext context) {

		JsonObject request = new JsonObject()
				.put("email" ,name + "@quant-ux.de")
				.put("lastname", orgName)
				.put("password", "123456789")
				.put("tos", true)
				.put("orgName", orgName)
				.put("name", name);


		JsonObject result = post("/rest/user", request);

		debug("postUser", result.encode());
		if (result.containsKey("errors")) {
			System.err.println("postUser(): Error" + result.toString());
		}
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));

		User user = createUser(name);
		user.setId(result.getString("_id"));
		return user;
	}

	public User postUserWithID(String name, String id, TestContext context) {

		JsonObject user = new JsonObject()
				.put("role", User.USER)
				.put("_id", id)
				.put("password", Util.hashPassword("123456789"))
				.put("paidUntil", System.currentTimeMillis() + 1000000)
				.put("tos", true)
				.put("name", name)
				.put("email", name + "@quant-ux.de");

		client.save(DB.getTable(User.class), user);

		return createUser(name);
	}

	public User postAppStoreUser(String name, TestContext context) {
		JsonObject request = new JsonObject()
				.put("email" ,name + "@quant-ux.de")
				.put("lastname", "AppShopper")
				.put("password", "123456789")
				.put("tos", true)
				.put("isAppStoreUser", true)
				.put("name", name);

		JsonObject result = post("/rest/user", request);
		if (result.containsKey("errors")) {
			System.err.println("postUser(): Error" + result.toString());
		}
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("isAppStoreUser"));
		context.assertEquals(User.APP_USER, result.getString("role"));
		User user = createUser(name);
		user.setId(result.getString("_id"));

		return user;
	}

	public User postUser(String name, String email, TestContext context) {
		User user = createUser(name);
		user.setEmail(email);
		user.setPassword("123456789");
		JsonObject result = post("/rest/user", user);
		debug("postUser", result.encode());
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));
		user.setId(result.getString("_id"));

		return user;
	}

	public JsonArray assertList(String url, int x, TestContext context) {
		JsonArray list = getList(url);
		log("assertList", "" + list.size() + " ?= " + x);
		if (list.size() == 1) {
			try {
				context.assertNotEquals(404, list.getInteger(0));
			} catch (Exception e) {
			}
		}
		context.assertEquals(x, list.size(), url);

		return list;
	}

	public void assertListError(String url, TestContext context) {
		this.assertListError(url, 401, context);
	}

	public void assertListError(String url, int expected, TestContext context) {
		JsonArray list = getList(url);
		log("assertListError", "" + list);
		context.assertEquals(1, list.size());
		context.assertEquals(expected, list.getInteger(0));
	}


	public JsonArray assertUserAppList(int size, TestContext context) {
		JsonArray apps = getList("/rest/apps/");
		context.assertEquals(size, apps.size());
		return apps;
	}

	public JsonArray assertOrgAppList(String orgID, int size, TestContext context) {
		JsonArray apps = getList("/rest/organizations/" + orgID + "/apps.json");
		context.assertEquals(size, apps.size());
		return apps;
	}

	public JsonArray assertOrgAppListError(String orgID, TestContext context) {
		JsonArray apps = getList("/rest/organizations/" + orgID + "/apps.json");
		context.assertEquals(1, apps.size());
		context.assertEquals(404, apps.getInteger(0));
		return apps;
	}



	public void assertPublicList(int size, TestContext context) {
		JsonArray apps = getList("/rest/apps/public");
		context.assertEquals(size, apps.size());
	}

	public void assertLogin(TestContext context, User user, String password) {
		JsonObject login = new JsonObject().put("email", user.getEmail()).put("password", password);
		JsonObject result = post("/rest/login", login);
		debug("assertLogin", "" + !result.containsKey("errors"));
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("password"));
		context.assertTrue(result.containsKey("token"));
		setJWT(result.getString("token"));
	}

	public JsonObject assertLogin(TestContext context, User u) {
		return assertLogin(context, u.getEmail(), "123456789");
	}

	public JsonObject assertLogin(TestContext context, String email, String password) {
		JsonObject login = new JsonObject().put("email", email).put("password", password);
		JsonObject result = post("/rest/login", login);
		debug("assertLogin", "" + !result.containsKey("errors"));
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("password"));
		context.assertTrue(result.containsKey("token"));
		context.assertEquals(email, result.getString("email"));

		setJWT(result.getString("token"));
		return result;
	}

	public JsonObject assertLoginError(TestContext context, String email, String password) {
		JsonObject login = new JsonObject().put("email", email).put("password", password);
		JsonObject result = post("/rest/login", login);
		debug("test", "loginError > " + result);
		context.assertTrue(result.containsKey("errors"), "assertLoginError() > login worked but should not!");
		context.assertTrue(!result.containsKey("_id"));
		context.assertTrue(!result.containsKey("password"));
		return result;
	}

	public App createApp(String name, boolean isPublic) {

		App app = new App();
		app.setName(name);
		app.setPublic(isPublic);
		app.setCreated(System.currentTimeMillis());
		app.setLastUpdate(System.currentTimeMillis());
		app.setScreenSize(375, 667);
	

		return app;

	}
	

	public void assertDirtyApp(TestContext context, App app) {
		sleep(500);
		JsonObject mongoApp = client.findOne(DB.getTable(App.class), App.findById(app.getId()));
		context.assertEquals(true, mongoApp.getBoolean("isDirty"));
	}
	

	protected User createUser(String name) {

		User user = new User();
		user.setName(name);
		user.setLastname("Tester");
		user.setTos(true);
		user.setRole(User.USER);
		user.setEmail(name + "@quant-ux.de");

		return user;
	}

	protected User createUser(String name, SyncMongoClient client) {

		User user = new User();
		user.setName(name);
		user.setRole(User.USER);
		user.setEmail(name + "@quant-ux.de");

		JsonObject json = mapper.toVertx(user);

		String id = client.insert(user_db, json);
		user.setId(id);

		return user;
	}

	public void assertComments(String url, int x, TestContext context) {
		JsonArray comments = getList(url);
		context.assertEquals(x, comments.size());
		log("assertComments", "" + comments);

		for (int i = 0; i < comments.size(); i++) {
			JsonObject c = comments.getJsonObject(0);
			context.assertTrue(c.containsKey("user"));
		}
	}

	public void assertCommentsError(String url, TestContext context) {
		JsonArray comments = getList(url);
		context.assertEquals(401, comments.getInteger(0));
		log("assertCommentsError", "" + comments);
	}

	public Comment deleteComment(Comment comment, TestContext context) {

		JsonObject result = delete("/rest/comments/apps/" + comment.getAppID() + "/" + comment.getId() + ".json");
		log("deleteComment", "" + result);

		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("errors"));

		return comment;
	}

	public void deleteCommentError(Comment comment, TestContext context) {

		JsonObject result = delete("/rest/comments/apps/" + comment.getAppID() + "/" + comment.getId() + ".json");
		log("deleteCommentError", "" + result);

		context.assertTrue(result.containsKey("error") || result.containsKey("errors"));

	}

	public Comment updateComment(Comment comment, String message, TestContext context) {

		comment.setMessage(message);

		log("updateComment", "" + comment);
		JsonObject result = post("/rest/comments/apps/" + comment.getAppID() + "/" + comment.getId() + ".json",
				mapper.toVertx(comment));
		log("updateComment", "" + result);

		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("userID"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(result.containsKey("lastUpdate"));
		context.assertEquals(result.getString("message"), message);

		return comment;
	}

	public Comment updateCommentError(Comment comment, String message, TestContext context) {

		comment.setMessage(message);

		JsonObject result = post("/rest/comments/apps/" + comment.getAppID() + "/" + comment.getId() + ".json",
				mapper.toVertx(comment));
		log("updateCommentError", "" + result);

		context.assertTrue(result.containsKey("error") || result.containsKey("errors"));

		return comment;
	}

	public Comment postComment(App app, String type, String msg, String ref, TestContext context) {

		Comment comment = new Comment();
		comment.setAppID("Evil");
		comment.setMessage(msg);
		comment.setType(type);
		if (ref != null)
			comment.setReference(ref);

		JsonObject result = post("/rest/comments/apps/" + app.getId(), mapper.toVertx(comment));
		log("postComment", "" + result);

		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(result.containsKey("userID"));
		context.assertTrue(result.containsKey("appID"));
		context.assertTrue(result.containsKey("created"));
		context.assertEquals(app.getId(), result.getString("appID"));

		comment.setId(result.getString("_id"));
		comment.setAppID(result.getString("appID"));

		return comment;
	}

	public void postCommentError(App app, String type, String msg, String ref, TestContext context) {

		Comment comment = new Comment();
		comment.setAppID(app.getId());
		comment.setMessage(msg);
		comment.setType(type);
		if (ref != null)
			comment.setReference(ref);

		JsonObject result = post("/rest/comments/apps/" + app.getId(), mapper.toVertx(comment));
		log("postCommentError", "" + result);

		context.assertTrue(!result.containsKey("_id"));
		context.assertTrue(result.containsKey("error") || result.containsKey("errors"));

	}

	public JsonObject createApp() {
		JsonObject app = new JsonObject();

		app.put("name", "APP");

		JsonObject screens = new JsonObject();
		screens.put("s1", new JsonObject().put("id", "s1").put("children", new JsonArray().add("w1").add("w2"))
				.put("props", new JsonObject().put("start", true)));
		screens.put("s2", new JsonObject().put("id", "s2").put("props", new JsonObject()));
		screens.put("s3", new JsonObject().put("id", "s3").put("props", new JsonObject().put("start", false)));
		app.put("screens", screens);

		JsonObject widgets = new JsonObject();
		widgets.put("w1", new JsonObject().put("id", "w1"));
		widgets.put("w2", new JsonObject().put("id", "w2"));
		widgets.put("w3", new JsonObject().put("id", "w3"));
		widgets.put("w4", new JsonObject().put("id", "w4"));
		widgets.put("w5", new JsonObject().put("id", "w5"));

		JsonObject users = new JsonObject();
		users.put("klaus", Acl.OWNER);
		users.put("dennis", Acl.READ);

		JsonObject invitations = new JsonObject();
		invitations.put("123", Invitation.TEST);
		invitations.put("abc", Invitation.READ);

		app.put("widgets", widgets);
		app.put("lines", new JsonObject());
		app.put("groups", new JsonObject());
		app.put("users", users);
		app.put("invitations", invitations);
		return app;
	}

	public void postImage(App app, TestContext context, String name) {
		postImage(app, context, name, true);
	}
	
	public void postImage(App app, TestContext context, String name, boolean resize) {

		String url = "/rest/images/"+app.getId();
		if (!resize) {
			url += "?resize=false";
		}
		JsonObject result = postFile(url, "src/test/resources/" +name);
		log("postImage", result.encode());
		

		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(result.containsKey("uploads"));
		
		JsonArray uploads = result.getJsonArray("uploads");
		context.assertEquals(1, uploads.size());
		
		JsonObject upload = uploads.getJsonObject(0);
		context.assertNotNull(upload);
		context.assertTrue(upload.containsKey("id"));
		context.assertTrue(upload.getInteger("width") > 0);
		context.assertTrue(upload.getInteger("width") <= Image.MAX_IMAGE_WIDTH * Image.SCALE_FACTOR );

		if (resize) {
			context.assertTrue(upload.getInteger("width") <= app.getScreenSize().get("w").intValue() * Image.SCALE_FACTOR);
		}
		context.assertTrue(upload.getInteger("height") > 0);
		
		
		sleep();
	}


	public void postImageError(App app, TestContext context) {
		
		JsonObject result = postFile("/rest/images/"+app.getId()+"/", "src/test/resources/test.png");
		log("postImage", result.encode());
		context.assertTrue(result.containsKey("errors") || result.containsKey("error"), app.toString());
		
	}

	public void deleteImage(TestContext context, App app, JsonObject image ) {
		// rest/images/:appID/:imageID/:ass/:file
		String imageID = image.getString("id");
		String imageULR = image.getString("url");

		JsonObject result = delete("/rest/images/"+app.getId() + "/" + imageID + "/" + imageULR);
		print("deleteImage", result);
	}
	

	public App setupApp(TestContext context, User klaus, User bernd) {

		assertLogin(context, klaus, "123456789");
		App app = postApp("klaus_app_public", true, context);
		

		postImage(app, context, "test.png");
		postImage(app, context, "test.png");
		JsonArray images = assertList("/rest/images/" + app.getId() + ".json", 2, context);

		
		/**
		 * Now add an images
		 */
		JsonObject fullApp = get("/rest/apps/"+ app.getId() + ".json");		
		addScreen(images, fullApp);
		addWidget(images, fullApp);		
		post("/rest/apps/"+ app.getId() + ".json", fullApp);
		
		/**
		 * Add commands
		 */
		assertStack(app, context);
		JsonObject command = new JsonObject().put("type", "AddScreen").put("new", new JsonObject().put("x",10)).put("id", "c1");
		command = postCommand(app, command, 1, 1, context);
		command = new JsonObject().put("type", "AddScreen").put("new", new JsonObject().put("x",10)).put("id", "c2");
		command = postCommand(app, command, 2, 2, context);
			
		/**
		 * Add events
		 */
		postEvent(app, "session1", "Click", context);
		postEvent(app, "session2", "Click", context);
		postEvent(app, "session3", "Click", context);
		postEvent(app, "session1", "Click", context);
		postEvent(app, "session1", "Click", context);
		assertList("/rest/events/" + app.getId() +".json", 5, context);
		
		/**
		 * Add ACL
		 */
		createPermission(bernd, app, Acl.READ, context);
		
		/**
		 * Add test settings
		 */
		JsonObject test = TestSetting.createEmpty(klaus, app.getId());
		post("/rest/test/" + app.getId() + ".json", test);
		
		/**
		 * Add comments
		 */
		postComment(app, "overview", "com 1", null, context);
		postComment(app, "overview", "com 2", null, context);
		postComment(app, "overview", "com 3", null, context);
		
		/**
		 * Add invitation
		 */
		getInvitation(app, context);
		
		/**
		 * Add Mouse
		 */
		fullApp = get("/rest/apps/"+ app.getId() + ".json");	
		log(4, "app", fullApp.encodePrettily());
		return app;
	}
	
	public JsonObject getInvitation(App app,TestContext context ){
		JsonObject result = get("/rest/invitation/" +app.getId() + ".json");
		log("getInvitation", ""+result);
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("errors"));
		return result;
	}


	public JsonObject getPublicApp(TestContext context, String token){
		JsonObject result = get("/rest/invitation/" + token+ "/app.json");
		log("getPublicApp", ""+result);
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("errors"));
		return result;
	}


	public JsonObject postCommand(App app, JsonObject command, int expectedPos, int extpectedLength, TestContext context){
		JsonObject result = post("/rest/commands/" +app.getId()+"/add", command);
		
		log("postCommand", "result > " + result.encode());
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("command"));
		context.assertEquals(expectedPos, result.getInteger("pos"));
		
		JsonObject stack = get("/rest/commands/" + app.getId() + ".json");
		context.assertEquals(expectedPos, stack.getInteger("pos"));
		context.assertEquals(extpectedLength, stack.getJsonArray("stack").size());
		
		log("postCommand", "stack > "+  stack.encode());
		return result;
	}
	
	private void addScreen(JsonArray images, JsonObject fullApp) {
		JsonObject screens = new JsonObject();
		fullApp.put("screens", screens);
		
		JsonObject image = images.getJsonObject(0);
		
		JsonObject backgroundImage = new JsonObject()
				.put("w", image.getInteger("w"))
				.put("h", image.getInteger("h"))
				.put("url", image.getString("url"));
		
		JsonObject screenStyle = new JsonObject()
				.put("backgroundImage", backgroundImage);
				
				
		JsonObject screen = new JsonObject()
				.put("id", "s10000")
				.put("name", "Screen 1")
				.put("style", screenStyle);

		screens.put("s10000", screen);
	}


	private void addWidget(JsonArray images, JsonObject fullApp) {
		JsonObject widgets = new JsonObject();
		fullApp.put("widgets", widgets);
		
		JsonObject image = images.getJsonObject(0);
		
		JsonObject backgroundImage = new JsonObject()
				.put("w", image.getInteger("w"))
				.put("h", image.getInteger("h"))
				.put("url", image.getString("url"));
		
		JsonObject screenStyle = new JsonObject()
				.put("backgroundImage", backgroundImage);
				
				
		JsonObject widget = new JsonObject()
				.put("id", "w10001")
				.put("name", "Widget 1")
				.put("style", screenStyle);

		widgets.put("w10001", widget);
	}
	
	
	public void postEvent(App app, String session, String type, TestContext context){
		JsonObject event = new JsonObject()
			.put("session", session)
			.put("user", "user")
			.put("screen", "s1")
			.put("widget", "w1")
			.put("type", type)
			.put("user", "user")
			.put("time", System.currentTimeMillis())
			.put("x", 3)
			.put("y", 4);
		
		JsonObject result = post("/rest/events/" + app.getId() +".json", event);
		log("postEvent", ""+result);
		context.assertTrue(!result.containsKey("error"));
		context.assertTrue(!result.containsKey("errors"));
	
	}
	
	public JsonObject assertStack(App app, TestContext context){
		JsonObject stack = get("/rest/commands/" + app.getId() + ".json");
		log("assertStack", "get(stack) : " + stack);
		context.assertTrue(!stack.containsKey("error"));
		context.assertTrue(!stack.containsKey("errors"));
		context.assertEquals(stack.getString("appID"), app.getId());
        return stack;
    }

	public String getString(File file) throws IOException {
		FileInputStream stream = new FileInputStream(file);
		String content = CharStreams.toString(new InputStreamReader(stream, Charsets.UTF_8));
		Closeables.closeQuietly(stream);
		return content;
	}

	public JsonObject popStack(App app, int count, int expectedPos, int extpectedLength, TestContext context){


		JsonObject result = delete("/rest/commands/" +app.getId()+"/pop/" + count);

		log("removeCommand", "result > " + result.encode());
		context.assertTrue(!result.containsKey("errors"));
		context.assertEquals(expectedPos, result.getInteger("pos"));

		JsonObject stack = get("/rest/commands/" + app.getId() + ".json");
		log("removeCommand", "stack > "+  stack.encodePrettily());
		context.assertEquals(expectedPos, stack.getInteger("pos"));
		context.assertEquals(extpectedLength, stack.getJsonArray("stack").size(), "Expectd stack length");


		return result;
	}

	public void assertStackOrder(JsonObject stack, int min, int distance, TestContext context) {

		JsonArray commands = stack.getJsonArray("stack");
		int lastId = min;
		for (int i=0; i < commands.size(); i++) {
			JsonObject c = commands.getJsonObject(i);
			int id = c.getInteger("id");
			//System.out.println(i + "> " +id + " : " +lastId);
			context.assertTrue(id >= min);
			context.assertTrue(id - lastId == distance);
			context.assertTrue(lastId < id);
			lastId = id;
		}
	}

	protected JsonObject postChanges(App app, JsonArray changes, TestContext context) {

		JsonObject result = post("/rest/apps/" +app.getId() + "/update", changes);
		context.assertTrue(!result.containsKey("error"), "Error contained");
		context.assertEquals("app.changes.succcess", result.getString("details"));

		JsonObject updateApp = client.findOne(app_db, App.findById(app.getId()));

		debug("postChanges", result.encode());
		log("postChanges", "App : " + updateApp.encodePrettily());

		return updateApp;
	}


	public JsonObject createChange(String type,String name, JsonObject newValue){
		return new JsonObject()
				.put("type", type)
				.put("name", name)
				.put("object", newValue);
	}

	public JsonObject createChange(String type,String name, JsonObject newValue,  String parent){
		return new JsonObject()
				.put("type", type)
				.put("parent", parent)
				.put("name", name)
				.put("object", newValue);
	}

	public JsonObject createChange(String type, String name,String newValue){
		return new JsonObject()
				.put("type", type)
				.put("name", name)
				.put("object", newValue);
	}


	public JsonObject createChange(String type, String name,int newValue){
		return new JsonObject()
				.put("type", type)
				.put("name", name)
				.put("object", newValue);
	}

	public JsonObject createAdmin (TestContext context) {
		User klaus = postUser("admin", context);
		JsonObject json = client.findOne(DB.getTable(User.class), new JsonObject().put("_id", klaus.getId()));
		json.put("role", User.ADMIN);
		client.save(DB.getTable(User.class), json);

		JsonObject admin = assertLogin(context, "admin@quant-ux.de", "123456789");
		context.assertEquals(admin.getString("role"), User.ADMIN);
		return admin;
	}

	public void adminRemoveOrgUser(TestContext context, String orgID, String userID) {
		JsonObject result = this.delete("/rest/admin/organizations/" + orgID + "/team/" +userID + ".json");
		context.assertTrue(!result.containsKey("errors"));
	}

	public void adminUpdateOrgUser(TestContext context, String orgID, String userID, int permission) {
		JsonObject request =  new JsonObject().put(OrganizationTeam.PERMISSION, permission);
		JsonObject result = this.post("/rest/admin/organizations/" + orgID + "/team/" +userID + ".json", request);
		context.assertTrue(!result.containsKey("errors"));
	}

	public void adminAddOrgUser(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.WRITE);
		JsonObject result = this.post("/rest/admin/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.success", result.getString("details"));
	}

	public void adminAddOrgReader(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.READ);
		JsonObject result = this.post("/rest/admin/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.success", result.getString("details"));
	}

	public void adminAddOrgOwner(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.OWNER);
		JsonObject result = this.post("/rest/admin/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.success", result.getString("details"));
	}

	public void adminInviteOrgUser(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.READ);
		JsonObject result = this.post("/rest/admin/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.invite", result.getString("details"));
	}

	public void adminAddOrgUserError(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, Acl.READ);
		JsonObject result = this.post("/rest/admin/organizations/" + orgID + "/team/",request);
		context.assertTrue(result.containsKey("error") || result.containsKey("errors"));
	}

	public JsonObject adminCreateOrganization(TestContext context, String name) {
		JsonObject result = this.post("/rest/admin/organizations/", new JsonObject()
				.put(Organization.FIELD_NAME, name)
				.put(Organization.FIELD_DISPLAY_NAME, name)
		);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(result.containsKey(Organization.FIELD_CREATED));
		context.assertEquals(name, result.getString(Organization.FIELD_NAME));
		context.assertEquals(name, result.getString(Organization.FIELD_DISPLAY_NAME));
		return result;
	}

	public JsonObject adminCreateOrganization(TestContext context, String name, long budget) {
		JsonObject org = new JsonObject()
				.put(Organization.FIELD_NAME, name)
				.put(Organization.FIELD_CREDITS_IN_CENTI_CENTS, budget);
		JsonObject result = this.post("/rest/admin/organizations/", org);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("_id"));
		context.assertTrue(result.containsKey(Organization.FIELD_CREATED));
		context.assertEquals(name, result.getString(Organization.FIELD_NAME));
		return result;
	}

	public void adminUpdateOrganization(TestContext context, JsonObject org) {
		JsonObject result  = this.post("/rest/admin/organizations/" + org.getString("id") + ".json", org);
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("errors"));
	}

	public JsonObject adminGetOrganization(TestContext context, String id) {
		JsonObject result  = this.get("/rest/admin/organizations/" +id + ".json");
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("errors"));
		return result;
	}

	public JsonArray adminFindAllOrganization(TestContext context) {
		JsonArray list = this.getList("/rest/admin/organizations.json");
		// we filter out auto orgs, because this messes up our test cases
		JsonArray result = new JsonArray();
		for (int i= 0; i < list.size(); i++) {
			JsonObject o = list.getJsonObject(i);
			result.add(o);
		}
		return result;
	}

	public JsonArray adminFindOrganization(TestContext context) {
		JsonArray list = this.getList("/rest/admin/organizations.json");
		// we filter out auto orgs, because this messes up our test cases
		JsonArray result = new JsonArray();
		for (int i= 0; i < list.size(); i++) {
			JsonObject o = list.getJsonObject(i);
			if (!o.containsKey(Organization.FIELD_IS_AUTO_ORG)) {
				result.add(o);
			}
		}
		return result;
	}

	public JsonObject adminFindOrganizationByID(TestContext context, String orgID) {
		JsonObject result = this.get("/rest/admin/organizations/" + orgID + ".json");
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("errors"));
		return result;
	}

	public JsonObject adminUpdateOrganizationByID(TestContext context, JsonObject org) {
		String orgID = org.getString("id");
		JsonObject result = this.post("/rest/admin/organizations/" + orgID + ".json", org);
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("errors"));
		return result;
	}


	public JsonArray adminFindOrganizationWithAuto(TestContext context) {
		JsonArray list = this.getList("/rest/admin/organizations.json");
		return list;
	}

	public JsonArray findOrganizationByUser(TestContext context, String userID) {
		JsonArray list = this.getList("/rest/user/" + userID +"/organizations.json");
		return list;
	}

	public JsonObject findOrganizationById(TestContext context, String id) {
		JsonObject res = this.get("/rest/organizations/" + id +".json");
		context.assertFalse(res.containsKey("error"));
		return res;
	}

	public JsonObject findOrganizationByIdError(TestContext context, String id) {
		JsonObject res = this.get("/rest/organizations/" + id + ".json");
		print(res);
		context.assertTrue(res.containsKey("error"));
		return res;
	}

	public JsonArray findOrganizationByUserError(TestContext context, String userID) {
		JsonArray list = this.getList("/rest/organizations/" + userID +"/organizations.json");
		context.assertEquals(1, list.size());
		context.assertEquals(404, list.getInteger(0));
		return list;
	}

	public JsonArray adminFindOrganizationTeam(TestContext context, String orgID) {
		JsonArray list = this.getList("/rest/admin/organizations/" + orgID+ "/team.json");
		return list;
	}

	public JsonArray adminFindOrganizationError(TestContext context) {
		JsonArray list = this.getList("/rest/admin/organizations.json");
		context.assertEquals(1, list.size());
		context.assertEquals(404, list.getInteger(0));
		return list;
	}

	public Map<Object, String> getInvitations(App app ){

		Map<Object, String> result = new HashMap<Object, String>();

		JsonObject invitations = get("/rest/invitation/" +app.getId() + ".json");

		invitations.forEach(c->{
			result.put(c.getValue(), c.getKey());
		});

		return result;
	}


	String assertGetToken(App app, TestContext context) {
		JsonObject res = this.get("/rest/apps/" + app.getId() + "/token.json");
		System.out.println(res.encodePrettily());
		context.assertTrue(res.containsKey("token"));
		context.assertTrue(res.containsKey("version"));
		context.assertTrue(res.containsKey("appID"));
		context.assertEquals(app.getId(), res.getString("appID"));
		return res.getString("token");
	}

	public JsonObject getPublicSettings(App app, TestContext context) {
		JsonObject result = get("/rest/apps/" + app.getId() + "/public.json");

		context.assertNotNull(result.getString("id"));
		context.assertEquals(result.getString("appID"), app.getId());
		context.assertTrue(result.containsKey("name"));
		context.assertTrue(result.containsKey("orgID"));
		context.assertTrue(result.containsKey("mode"));
		context.assertTrue(result.containsKey("versions"));
		context.assertTrue(result.containsKey("current"));
		return result;
	}

	public JsonObject postPublicSettings(App app, JsonObject data, TestContext context) {
		getPublicSettings(app, context);
		JsonObject result = post("/rest/apps/" + app.getId() + "/public.json", data);
		context.assertNotNull(result.getString("id"));
		context.assertEquals(result.getString("appID"), app.getId());
		context.assertTrue(result.containsKey("orgID"));
		return result;
	}

	public JsonObject getPublicToken(String orgName, String name, TestContext context) {
		JsonObject result = get("/rest/public/" + orgName + "/" + name + ".json");
		//print("getPublicToken", result);
		context.assertTrue(!result.containsKey("error"));
		context.assertNotNull(result.getString("token"));
		context.assertNotNull(result.getString("mode"));
		context.assertNotNull(result.getInteger("version"));
		context.assertNotNull(result.getString("appID"));
		return result;
	}

	public JsonObject getPublicTokenByPassword(String orgName, String name, String password, TestContext context) {
		JsonObject result = get("/rest/public/" + orgName + "/" + name + ".json", "x-flowrabbit-pwd", password);
		//System.out.println("getPublicInvitation() >> " + result.encodePrettily());
		context.assertTrue(!result.containsKey("error"));
		context.assertNotNull(result.getString("token"));
		context.assertNotNull(result.getString("mode"));
		context.assertNotNull(result.getInteger("version"));
		context.assertNotNull(result.getString("appID"));
		return result;
	}

	public JsonObject getPublicTokenError (String orgName, String name, TestContext context) {
		JsonObject result = get("/rest/public/" + orgName + "/" + name + ".json");
		System.out.println("getPublicTokenError() >> " + result.encodePrettily());
		context.assertTrue(result.containsKey("error") || result.containsKey("errors"));
//		int error = result.getInteger("error");
//		context.assertTrue(406 == error || 405 == error || 404 == error || 408 == error || 409 == error);
		return result;
	}

	public JsonObject getPurchaseTokenError (String orgName, String name, int expectedError, TestContext context) {
		JsonObject result = get("/rest/public/" + orgName + "/" + name + ".json");
		System.out.println("getPurchaseTokenError() >> " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		int error = result.getInteger("error");
		context.assertEquals(expectedError, error);
		return result;
	}

	public JsonObject getPublicTokenByPasswordError(String orgName, String name, String password, TestContext context) {
		JsonObject result = get("/rest/public/" + orgName + "/" + name + ".json", "x-flowrabbit-pwd", password);
		//System.out.println("getPublicInvitation() >> " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		int error = result.getInteger("error");
		context.assertTrue(406 == error || 404 == error);
		return result;
	}

	public JsonObject getPublicTokenByDomain(String domain, String name, TestContext context) {
		JsonObject result = get("/rest/public/abc/" + name + ".json?domain=" + domain);
		//System.out.println("getPublicInvitation() >> " + result.encodePrettily());
		context.assertTrue(!result.containsKey("error"));
		context.assertNotNull(result.getString("token"));
		context.assertNotNull(result.getInteger("version"));
		context.assertNotNull(result.getString("appID"));
		return result;
	}

	public JsonObject getPublicTokenByDomainError(String domain, String name, TestContext context) {
		JsonObject result = get("/rest/public/abc/" + name + ".json?domain=" + domain);
		//System.out.println("getPublicInvitation() >> " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		context.assertFalse(result.containsKey("token"));
		context.assertFalse(result.containsKey("version"));
		context.assertFalse(result.containsKey("appID"));
		return result;
	}



	public String assertGetAppToken(App app, TestContext context) {
		JsonObject res = this.get("/rest/apps/" + app.getId() + "/token.json");
		System.out.println(res.encodePrettily());
		context.assertTrue(res.containsKey("token"));
		return res.getString("token");
	}

	public String assertGetAppTokenError(App app, TestContext context) {
		JsonObject res = this.get("/rest/apps/" + app.getId() + "/token.json");
		context.assertTrue(res.containsKey("error"));
		context.assertFalse(res.containsKey("token"));
		return res.getString("token");
	}

	public String assertGetAppOrgToken(App app, String orgID, TestContext context) {
		JsonObject res = this.get("/rest/apps/" + app.getId() + "/token.json?orgID="+orgID);
		//System.out.println(res.encodePrettily());
		context.assertTrue(res.containsKey("token"));
		return res.getString("token");
	}

	public String assertGetAppOrgTokenError(App app, String orgID, TestContext context) {
		JsonObject res = this.get("/rest/apps/" + app.getId() + "/token.json?orgID="+orgID);
		context.assertTrue(res.containsKey("error"));
		context.assertFalse(res.containsKey("token"));
		return res.getString("token");
	}


	public JsonArray adminFindSecrets(TestContext context) {
		JsonArray list = this.getList("/rest/admin/secrets.json");
		return list;
	}

	public JsonArray findPublicSecrets(TestContext context) {
		JsonArray list = this.getList("/rest/public/secrets.json");
		return list;
	}

	public void findPublicSecretsError(TestContext context) {
		JsonArray list = this.getList("/rest/public/secrets.json");
		context.assertEquals(list.size(), 1);
		context.assertEquals(list.getInteger(0), 404);
	}



//	public JsonObject createSecret(TestContext context, String name, String value, String domain) {
//		JsonObject request = new JsonObject()
//				.put(Secret.FIELD_SECRET_NAME, name)
//				.put(Secret.FIELD_SECRET_VALUE, value)
//				.put(Secret.FIELD_SECRET_DOMAIN, domain);
//
//		JsonObject result = this.post("/rest/admin/secrets/", request);
//		context.assertTrue(!result.containsKey("error"));
//		return result;
//	}

//	public JsonObject createSecret(TestContext context, String name, String value, String domain, int pricePerRequest) {
//		JsonObject request = new JsonObject()
//				.put(Secret.FIELD_SECRET_NAME, name)
//				.put(Secret.FIELD_SECRET_VALUE, value)
//				.put(Secret.FIELD_SECRET_DOMAIN, domain)
//				.put(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_REQUEST, pricePerRequest);
//
//		JsonObject result = this.post("/rest/admin/secrets/", request);
//		context.assertTrue(!result.containsKey("error"));
//		return result;
//	}

	public JsonObject createSecret(TestContext context, String name, String value, String domain, int pricePerRequest, int priceByQuantity) {
		JsonObject request = new JsonObject()
				.put(Secret.FIELD_SECRET_NAME, name)
				.put(Secret.FIELD_SECRET_VALUE, value)
				.put(Secret.FIELD_SECRET_DOMAIN, domain)
				.put(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_QUANTITY, priceByQuantity)
				.put(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_REQUEST, pricePerRequest);

		JsonObject result = this.post("/rest/admin/secrets/", request);
		context.assertTrue(!result.containsKey("error"));
		return result;
	}

	public JsonObject updateSecret(TestContext context, JsonObject request, String name, String value, String domain) {
		request.put(Secret.FIELD_SECRET_NAME, name)
				.put(Secret.FIELD_SECRET_VALUE, value)
				.put(Secret.FIELD_SECRET_DOMAIN, domain);

		JsonObject result = this.post("/rest/admin/secrets/" + request.getString("id") + ".json", request);
		context.assertTrue(!result.containsKey("error"));
		return result;
	}

	public JsonObject deleteSecret(TestContext context, JsonObject request) {
		JsonObject result = this.delete("/rest/admin/secrets/" + request.getString("id") + ".json");
		context.assertTrue(!result.containsKey("error"));
		return result;
	}

	public void getPublicInvitationError (String orgName, String name, TestContext context) {
		JsonObject result = get("/rest/public/" + orgName + "/" + name + ".json");
		System.out.println("getPublicInvitationError() >> " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
	}

	public JsonObject getPublicError(App app, TestContext context) {
		JsonObject result = get("/rest/apps/" + app.getId() + "/public.json");
		context.assertTrue(result.containsKey("error"));
		return result;
	}

	public JsonObject postPublicError(App app, JsonObject data,  TestContext context) {
		JsonObject result = post("/rest/apps/" + app.getId() + "/public.json", data);
		System.out.println(result.encodePrettily());
		context.assertTrue(result.containsKey("errors"));
		return result;
	}

	public void userAddOrgReader(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.READ);
		JsonObject result = this.post("/rest/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.success", result.getString("details"));
	}

	public void userAddOrgUser(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.WRITE);
		JsonObject result = this.post("/rest/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.success", result.getString("details"));
	}

	public void userAddOrgOwner(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.OWNER);
		JsonObject result = this.post("/rest/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.success", result.getString("details"));
	}

	public void userAddOrgOwnerError(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.OWNER);
		JsonObject result = this.post("/rest/organizations/" + orgID + "/team/",request);
		context.assertTrue(result.containsKey("errors"));
		context.assertEquals("error", result.getString("type"));
	}

	public void userAddOrgUserError(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.WRITE);
		JsonObject result = this.post("/rest/organizations/" + orgID + "/team/",request);
		print(result);
		context.assertTrue(result.containsKey("errors"));
		context.assertEquals("error", result.getString("type"));
	}



	public void userUpdateOrgUser(TestContext context, String orgID, String userID, int permission) {
		JsonObject request =  new JsonObject().put(OrganizationTeam.PERMISSION, permission);
		JsonObject result = this.post("/rest/organizations/" + orgID + "/team/" +userID + ".json", request);
		context.assertTrue(!result.containsKey("errors"));
	}

	public JsonArray userFindOrganizationTeam(TestContext context, String orgID) {
		JsonArray list = this.getList("/rest/organizations/" + orgID+ "/team.json");
		context.assertFalse(list.getValue(0) instanceof Integer);
		return list;
	}

	public JsonArray userFindOrganizationTeamError(TestContext context, String orgID) {
		JsonArray list = this.getList("/rest/organizations/" + orgID+ "/team.json");
		context.assertEquals(404,  list.getInteger(0));
		return list;
	}

	public void userRemoveOrgUser(TestContext context, String orgID, String userID) {
		JsonObject result = this.delete("/rest/organizations/" + orgID + "/team/" +userID + ".json");
		context.assertTrue(!result.containsKey("errors"));
	}

	public void userInviteOrgUser(TestContext context, String orgID, String email) {
		JsonObject request =  new JsonObject().put("email", email).put(OrganizationTeam.PERMISSION, OrganizationTeam.WRITE);
		JsonObject result = this.post("/rest/organizations/" + orgID + "/team/",request);
		context.assertTrue(!result.containsKey("errors"));
		context.assertTrue(result.containsKey("status"));
		context.assertEquals("organization.team.add.invite", result.getString("details"));
	}


	JsonObject getPublicAppSecretsByHash(TestContext context, String hash, App app) {
		String url = "/rest/public/secrets/app/" + app.getId() + "/" + hash +"/secrets.json";
		JsonObject result = get(url, SecretRest.FLOWRABBIT_TARGET_URL, SECRET_DEFAULT_URL);
		//System.out.println("getPublicAppSecretsByHash() > " + result.encodePrettily());
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertFalse(result.containsKey("_id"));
		context.assertFalse(result.containsKey("appID"));
		context.assertFalse(result.containsKey("data"));
		return result;
	}

	JsonObject getPublicAppSecretsByHash(TestContext context, String hash, App app, String url) {
		String endpoint = "/rest/public/secrets/app/" + app.getId() + "/" + hash +"/secrets.json";
		JsonObject result = get(endpoint, SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicAppSecretsByHash() > " + result.encodePrettily());
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertFalse(result.containsKey("_id"));
		context.assertFalse(result.containsKey("appID"));
		context.assertFalse(result.containsKey("data"));
		return result;
	}


	public JsonObject getPublicAppSecretsByHashError(TestContext context, String hash, App app) {
		JsonObject result = get("/rest/public/secrets/app/" + app.getId() + "/" + hash +"/secrets.json", SecretRest.FLOWRABBIT_TARGET_URL, SECRET_DEFAULT_URL);
		//System.out.println("getAppSecretsByHash() > " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		return result;
	}

	JsonObject getPublicAppSecretsByHashName(TestContext context, String hash, String name, App app) {
		JsonObject result = get("/rest/public/secrets/app/" + app.getId() + "/" + hash +"/secrets.json", SecretRest.FLOWRABBIT_TARGET_URL, SECRET_DEFAULT_URL);
		//System.out.println("getPublicAppSecretsByHashName() > " + result.encodePrettily());
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertFalse(result.containsKey("_id"));
		context.assertFalse(result.containsKey("appID"));
		context.assertFalse(result.containsKey("data"));

		context.assertTrue(result.containsKey("secrets"));
		JsonObject secret = AppSecrets.getSecretByName(result, name);
		print("getPublicAppSecretsByHashName", secret);
		return secret;
	}

	JsonObject getPublicAppSecretsByHashNameError(TestContext context, String hash, String name, App app) {
		JsonObject result = get("/rest/public/secrets/app/" + app.getId() + "/" + hash +"/secrets.json", SecretRest.FLOWRABBIT_TARGET_URL, SECRET_DEFAULT_URL);
		//System.out.println("getPublicAppSecretsByHashName() > " + result.encodePrettily());
//		context.assertFalse(result.containsKey("error"));
//		context.assertFalse(result.containsKey("id"));
//		context.assertFalse(result.containsKey("_id"));
//		context.assertFalse(result.containsKey("appID"));
//		context.assertFalse(result.containsKey("data"));
//
//		context.assertTrue(result.containsKey("secrets"));
		JsonObject secret = AppSecrets.getSecretByName(result, name);
		context.assertNull(secret);
		return result;
	}

	public JsonObject getPublicSecretsByName(TestContext context, String hash, String name, String url)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json", SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByName() > " + result.encodePrettily());
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertEquals(name, result.getString("name"));
		return result;
	}

	public JsonObject getPublicSecretsByName(TestContext context, String hash, String name, String url, double quantity)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json?quantity=" + quantity, SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByName() > " + result.encodePrettily());
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertEquals(name, result.getString("name"));
		return result;
	}


	public JsonObject getPublicSecretsByNameNoMeter(TestContext context, String hash, String name, String url)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json?meter=false", SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByName() > " + result.encodePrettily());
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertEquals(name, result.getString("name"));
		return result;
	}

	public JsonObject getPublicSecretsByNameNoMeter(TestContext context, String hash, String name, String url, double quantity)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json?meter=false&quantity=" + quantity, SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByNameNoMeter(quantity) > " + result.encodePrettily());
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertEquals(name, result.getString("name"));
		return result;
	}

	public JsonObject getPublicSecretsByNameNoMeterError(TestContext context, String hash, String name, String url)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json?meter=false", SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByNameNoMeterError() > " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		return result;
	}

	public JsonObject getPublicSecretsByNameNoMeterError(TestContext context, String hash, String name, String url, double quantity)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json?meter=false&quantity=" + quantity, SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByNameNoMeterError(quantity) > " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		return result;
	}

	public JsonObject getPublicSecretsByNameError(TestContext context, String hash, String name, String url, double quantity)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json?quantity=" + quantity, SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByNameError() > " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		return result;
	}


	public JsonObject getPublicSecretsByNameError(TestContext context, String hash, String name, String url)  {
		JsonObject result = get("/rest/public/secrets/" + hash + "/secret/" + name +".json", SecretRest.FLOWRABBIT_TARGET_URL, url);
		//System.out.println("getPublicSecretsByNameError() > " + result.encodePrettily());
		context.assertTrue(result.containsKey("error"));
		return result;
	}




	public JsonObject getAppSecrets(App app, TestContext context) {
		return getAppSecrets(app.getId(), context);
	}

	public JsonObject getAppSecrets(String appID, TestContext context) {
		JsonObject result = get("/rest/apps/" + appID + "/secrets.json");
		context.assertFalse(result.containsKey("error"));
		context.assertFalse(result.containsKey("id"));
		context.assertFalse(result.containsKey("_id"));
		context.assertFalse(result.containsKey("appID"));
		context.assertFalse(result.containsKey("data"));
		return result;
	}

	public JsonObject getAppSecretsError(App app, TestContext context) {
		JsonObject result = get("/rest/apps/" + app.getId() + "/secrets.json");
		context.assertTrue(result.containsKey("error"));
		return result;
	}

	public JsonObject postAppSecrets(App app, JsonObject data, TestContext context) {
		JsonObject result = post("/rest/apps/" + app.getId() + "/secrets.json", data);
		//System.out.println("postSecrets() > " + result.encodePrettily());
		context.assertFalse(result.containsKey("id"));
		context.assertFalse(result.containsKey("_id"));
		context.assertFalse(result.containsKey("appID"));
		context.assertFalse(result.containsKey("data"));
		context.assertFalse(result.containsKey("errors"));
		return result;
	}

	public JsonObject postAppSecretsError(App app, JsonObject data, TestContext context) {
		JsonObject result = post("/rest/apps/" + app.getId() + "/secrets.json", data);
		System.out.println("postSecretsError() > " + result.encodePrettily());
		context.assertTrue(result.containsKey("errors"));
		return result;
	}


	public JsonObject getData(App app, TestContext context) {
		JsonObject result = get("/rest/apps/" + app.getId() + "/data.json");
		//System.out.println("getData() > " + result.encodePrettily());
//        context.assertTrue(result.containsKey("status"));
//        context.assertTrue(result.containsKey("appID"));
		return result;
	}

	public JsonObject getData(String appID, TestContext context) {
		JsonObject result = get("/rest/apps/" + appID + "/data.json");
		//System.out.println("getData() > " + result.encodePrettily());
//        context.assertTrue(result.containsKey("status"));
//        context.assertTrue(result.containsKey("appID"));
		return result;
	}

	public JsonObject getDataError(App app, TestContext context) {
		JsonObject result = get("/rest/apps/" + app.getId() + "/data.json");
		context.assertTrue(result.containsKey("error"));
		return result;
	}

	public JsonObject postData(App app, JsonArray data,  TestContext context) {
		JsonObject result = post("/rest/apps/" + app.getId() + "/data.json", data);
		System.out.println("postData() > " + result.encodePrettily());

		context.assertEquals("data.changes.success", result.getString("details"));
		context.assertEquals("ok", result.getString("status"));
		context.assertFalse(result.containsKey("errors"));
		return result;
	}

	public JsonObject meterSecretByPrepaidBudgetOrOrg(TestContext context, String token, String secretName, double quantity, int expected) {
		JsonObject res = this.post("/rest/public/secrets/" + token + "/secret/" + secretName + ".json", new JsonObject().put("quantity", quantity));
		context.assertTrue(!res.containsKey("error"));
		context.assertTrue(res.containsKey("total"));
		context.assertTrue(res.containsKey("budget"));
		context.assertEquals(expected, res.getInteger("total"));
		print("meterSecretByPrepaidBudgetOrOrg", res);
		return res;
	}

	public JsonObject meterSecretByPrepaidBudgetOrOrgError(TestContext context, String token, String secretName, double quantity, int expected) {
		JsonObject res = this.post("/rest/public/secrets/" + token + "/secret/" + secretName + ".json", new JsonObject().put("quantity", quantity));
		context.assertTrue(res.containsKey("error"));

		print("meterSecretByPrepaidBudgetOrOrgError", res);
		return res;
	}


	public void assertRawImage(TestContext context, App app, JsonArray images) throws IOException {
		assertRawImage(context, app, images, app.getScreenSize().get("w").intValue() * Image.SCALE_FACTOR);
	}

	public void assertRawImage(TestContext context, App app, JsonArray images, int maxWidth) throws IOException {
		this.assertRawImage(context, app, images, maxWidth, "");
	}


	public void assertRawImage(TestContext context, App app, JsonArray images, int maxWidth, String query) throws IOException {
		for(int i=0; i< images.size();i++){
			JsonObject img = images.getJsonObject(i);
			context.assertTrue(img.getInteger("width") > 0);
			context.assertTrue(img.getInteger("height") > 0);


			InputStream is = getRaw("/rest/images/" + img.getString("url") + "?token=" + this.getJWT()+query);


			context.assertTrue(is !=null);

			BufferedImage image = ImageIO.read(is);

			log("assertRaw", img.getString("url") + " > " +image.getWidth() );
			context.assertTrue(image.getWidth() <= Image.MAX_IMAGE_WIDTH * Image.SCALE_FACTOR, "Wrong width "+ image.getWidth());
			context.assertTrue(image.getWidth() <= maxWidth);

			is.close();


		}
	}

	public void assertRawError(TestContext context, App app, JsonArray images, String query) throws IOException {
		for(int i=0; i< images.size();i++){
			JsonObject img = images.getJsonObject(i);
			context.assertTrue(img.getInteger("width") > 0);
			context.assertTrue(img.getInteger("height") > 0);

			InputStream is = getRaw("/rest/images/" + img.getString("url") + "?token=" + this.getJWT()+query);
			context.assertNull(is);

		}
	}

	public void assertRawError(TestContext context, App app, JsonArray images) throws IOException {
		assertRawError(context, app, images, "");
	}


//	public JsonArray getAppStoreListSummary(TestContext context, int size) {
//		JsonArray result = this.getList("/rest/store/apps.json?summary=true");
//		context.assertEquals(size, result.size());
//		return result;
//	}
}
