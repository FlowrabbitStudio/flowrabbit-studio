package ai.flowrabbit;

import java.io.File;
import java.time.LocalDateTime;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.acl.ImageACL;
import ai.flowrabbit.acl.InvitationCommentACL;
import ai.flowrabbit.acl.OrganizationACL;
import ai.flowrabbit.admin.*;
import ai.flowrabbit.bus.*;

import ai.flowrabbit.model.*;
import ai.flowrabbit.rest.*;
import ai.flowrabbit.services.*;
import ai.flowrabbit.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ai.flowrabbit.backup.BackupREST;
import ai.flowrabbit.backup.BackupVerticle;
import ai.flowrabbit.backup.FileSystemBackupStorage;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mail.MailClient;
import io.vertx.ext.mail.MailConfig;
import io.vertx.ext.mail.StartTLSOptions;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;

public class Main extends AbstractVerticle {

	public static final String VERSION = "FlowRabbit@1.0.86";

	public static final String BUS_IMAGES_UPLOADED = "images.uploaded";

	private MongoClient client;

	private MailClient mail;

	private final Logger logger = LoggerFactory.getLogger(Main.class);

	private HttpServer server;

	private boolean isDebug = false;

	private final String startedTime = LocalDateTime.now().toString();

	public static String ADMIN = "support@flowrabbit.ai";

	private EncryptionService encryptionService;

	private IVersionService versionService;

	@Override
	public void start() {
		this.logger.error("start() > enter {}", VERSION);

		/*
		 * Load config
		 */
		JsonObject config = this.getConfig();
		if(config.containsKey("debug")){
			this.isDebug = config.getBoolean("debug");
			this.logger.info("start() > isDebug : " + this.isDebug);
		}

		/*
		 * Create MongoDB client
		 */
		initMongo(config);

		/*
		 * Set body and cookie handler
		 */
		Router router = Router.router(vertx);
		router.route().handler(BodyHandler.create().setMergeFormAttributes(false));
		router.route().handler(CorsHandler.create("*")
				.allowedMethod(HttpMethod.GET)
				.allowedMethod(HttpMethod.POST)
				.allowedMethod(HttpMethod.DELETE)
				.allowedMethod(HttpMethod.PUT)
				.allowedMethod(HttpMethod.OPTIONS)
				.allowedHeader("Access-Control-Request-Method")
				.allowedHeader("Access-Control-Allow-Credentials")
				.allowedHeader("Access-Control-Allow-Origin")
				.allowedHeader("Access-Control-Allow-Headers")
				.allowedHeader("Content-Type"));

		initRequestMonitor(router);

		/*
		 * Init Token Service
		 */
		initTokenService(config);

		/*
		 * Init Encryption Service
		 */
		initEncryptionService(config);

		/*
		 * Init Encryption Service
		 */
		initVersionService(config);

		/*
		 * Create mail client
		 */
		initBackup(router, config);

		/*
		 * Create mail client
		 */
		initMail(router, config);

		/*
		 * REST Services
		 */
		initStatus(router);
		initUserRest(config, router);
		initOrganization(router, config);
		initAppRest(router, config);
		initRuntimeSecrets(router, config);
		initPublish(router, config);
		initTeamRest(router);
		initCommandRest(router);
		initCommentRest(router);
		initEventRest(router);
		initInvitationRest(router, config);
		initTestRest(router);
		initTemplate(router,config);
		initLogRest(router, config);
		initNotification(router,config);
		initAnalytics(router, config);
		initAIProxy(router);
		initUserAppData(router);
		initAIRest(router);

		/*
		 * Init BUS
		 */
		initBus(config);

		/*
		 * init admin
		 */
		initAdmin(router,config);

		/*
		 * Launch server
		 */
		HttpServerOptions options = new HttpServerOptions()
			.setCompressionSupported(true);


		this.server = vertx.createHttpServer(options)
			.requestHandler(router::accept)
			.listen(config.getInteger("http.port"));


		logger.error("******************************");
		logger.error("* FlowRabbit " + VERSION + " launched!");
		logger.error("*   - Admin: " + ADMIN);
		logger.error("*   - Version: " + VERSION);
		logger.error("*   - Port: " + config.getInteger("http.port"));
		logger.error("*   - Env :" + Config.getDeployment(config));
		logger.error("*   - Mongo :" + config.getString(Config.MONGO_CONNECTION_STRING));

		logger.error("******************************");

		vertx.setTimer(2000, x -> this.sendBootMessage());
	}

	private void initAIRest(Router router) {
		AiModelRest rest = new AiModelRest(client);
		router.route(HttpMethod.GET, "/rest/ai/models.json").handler(rest.findAll());
	}

	private void initUserAppData(Router router) {

		UserAppDataRest rest = new UserAppDataRest(client);

		router.route(HttpMethod.GET, "/rest/data/user/app.json").handler(rest.findByAppAndUser());
		router.route(HttpMethod.POST, "/rest/data/user/app.json").handler(rest.updateByAppAndUser());
	}

	private void initVersionService(JsonObject config) {
		this.versionService = new FSVersionService(Config.getVersionFolder(config));
	}

	private void initEncryptionService(JsonObject config) {
		try {
			this.encryptionService = new BlowFishService(Config.getDBEncryptionKey(config));
		} catch (Exception e) {
			throw new RuntimeException("initEncryptionService() > Could not load db key");
		}
	}

	private void initRequestMonitor(Router router) {
		logger.info("initRequestMonitor() > enter");

		RequestMonitor monitor = new RequestMonitor();
		router.route().handler(monitor::logRequest);

		RequestMonitorVehicle.start(vertx, client);
	}

	private void sendBootMessage () {
		if (!this.isDebug) {
			logger.error("sendBootMessage() > Enter");
			Mail.to(ADMIN)
					.template(MailHandler.TEMPLATE_START_UP)
					.subject("Martelo Server Started")
					.payload(new JsonObject().put("version", Main.VERSION).put("name", Main.ADMIN))
					.send(vertx.eventBus());
		}

	}

	private JsonObject getConfig() {
		logger.info("getConfig() > Enter");
		JsonObject config = this.config();
		JsonObject defaultConfig = Config.setDefaults(config);
		JsonObject mergedConfig = Config.mergeEnvIntoConfig(defaultConfig);
		Main.ADMIN = Config.getAdmin(mergedConfig, Main.ADMIN);
		return mergedConfig;
	}

	private void initStatus(Router router) {
		router.route(HttpMethod.GET, "/rest/status.json").handler(event -> {
			logger.error("getStatus() > enter");
			client.getCollections(res -> {
				logger.error("getStatus() > exit {}", res.succeeded());
				if (res.succeeded()) {
					event.response().end(new JsonObject()
							.put("started", startedTime)
							.put("version", VERSION)
							.put("healthy", true)
							.encodePrettily());
				} else {
					event.response().end(new JsonObject()
							.put("started", startedTime)
							.put("version", VERSION)
							.put("healthy", false)
							.encodePrettily());
				}
			});

		});
	}

	private void initBackup(Router router, JsonObject config) {
		/*
		 * Update handler that sets app to dirty
		 */
		DirtyHandler.start(vertx, client);

		if (config.containsKey("backup.fs.folder")){
			String folder = config.getString("backup.fs.folder");
			File f = new File(folder);
			if (f.exists()) {
				FileSystemBackupStorage storage = new FileSystemBackupStorage(folder);
				BackupVerticle.create(vertx, client, storage, config.getString("backup.fs.folder"));
			} else {
				logger.error("initBackup() > Folder does not exist > "  + f.getAbsolutePath() );
			}

			BackupREST rest = new BackupREST();
			router.route(HttpMethod.GET, "/rest/backup/apps/:appID.json").handler(rest::backupApp);
			router.route(HttpMethod.GET, "/rest/backup/user.json").handler(rest::backupUsers);
		}

	}

	public void initTokenService (JsonObject config) {
		if (config.containsKey(Config.JWT_PASSWORD)){
			String password = Config.getJwtPassword(config);
			TokenService.setSecret(password);
			logger.error("initTokenService() > Much success");
		} else if (config.containsKey("cookieSession")){
			JsonObject cookieConf = config.getJsonObject("cookieSession");
			TokenService.setSecret(cookieConf.getString("password"));
			logger.error("initTokenService() > Old config");
		} else {
			TokenService.setSecret(Util.getRandomString());
			logger.error("initTokenService() > No key. Use random!");
		}
	}

	private void initAIProxy (Router router) {
		OpenAIProxyRest proxy = new OpenAIProxyRest("api.openai.com");
		router.route(HttpMethod.POST, "/ai/openai.json").handler(proxy::forward);
	}


	private void initNotification(Router router, JsonObject config) {
		NotificationREST rest = new NotificationREST(client);
		router.route(HttpMethod.GET, "/rest/notifications.json").handler(rest::findByUser);
	}


	private void initLogRest(Router router, JsonObject config) {
		logger.info("initLogRest() > enter");
		LogRest log = new LogRest();
		router.route(HttpMethod.POST, "/rest/log/error").handler(log::log);
	}

	private void initAnalytics(Router router, JsonObject config) {
		logger.info("initAnalytics() > enter");
		AnalyticREST analytics = new AnalyticREST(client);
		router.route(HttpMethod.POST, "/rest/analytics").handler(analytics.create());
	}

	private void initAdmin(Router router, JsonObject config) {
		logger.info("intiAdmin() > enter");

		/*
		 * Make sure we have one admin
		 */
		Setup.instance(config, client);

		/*
		 * Staff stuff: KPI, User, Notifications
		 */
		KPIRest kpi = new KPIRest(this.client);
		router.route(HttpMethod.GET, "/rest/admin/overview.json").handler(kpi.get());

		AdminMongoIndexRest indexRest = new AdminMongoIndexRest(client);
		router.route(HttpMethod.GET, "/rest/admin/index/all.json").handler(indexRest.get());
		router.route(HttpMethod.POST, "/rest/admin/index/update.json").handler(indexRest.update());

		StaffModelRest staff = new StaffModelRest(client);
		router.route(HttpMethod.GET, "/rest/admin/users.json").handler(staff.find(User.class, new UserFilter()));
		router.route(HttpMethod.DELETE, "/rest/admin/users/:id.json").handler(staff.delete(User.class, this::cleanUpUser));
		router.route(HttpMethod.POST, "/rest/admin/users/:id/:child").handler(staff.updateChild(User.class, true) );
		router.route(HttpMethod.POST, "/rest/admin/users/:id").handler(staff.update(User.class) );
		router.route(HttpMethod.GET, "/rest/admin/users/:id.json").handler(staff.findByID(User.class, MongoFilter.Default("password")));

		router.route(HttpMethod.GET, "/rest/admin/notification.json").handler(staff.find(Notification.class));
		router.route(HttpMethod.GET, "/rest/admin/notification/:id.json").handler(staff.findByID(Notification.class, MongoFilter.Default()));
		router.route(HttpMethod.POST, "/rest/admin/notification.json").handler(staff.create(Notification.class) );
		router.route(HttpMethod.POST, "/rest/admin/notification/:id.json").handler(staff.update(Notification.class) );
		router.route(HttpMethod.DELETE, "/rest/admin/notification/:id.json").handler(staff.delete(Notification.class, null) );

		/*
		 *  Admin stuff: Performance, ActiveUSers, Apps
		 */

		AdminEventRest performance = new AdminEventRest(this.client, PerformanceEvent.class);
		router.route(HttpMethod.GET, "/rest/admin/performance.json").handler(performance.get());
		router.route(HttpMethod.DELETE, "/rest/admin/performance.json").handler(performance.delete());

		AdminEventRest metrics = new AdminEventRest(this.client, Metric.class);
		router.route(HttpMethod.GET, "/rest/admin/metrics.json").handler(metrics.get());
		router.route(HttpMethod.DELETE, "/rest/admin/metrics.json").handler(metrics.delete());

		AdminEventRest request = new AdminEventRest(this.client, RequestEvent.class);
		router.route(HttpMethod.GET, "/rest/admin/requests.json").handler(request.get());
		router.route(HttpMethod.DELETE, "/rest/admin/requests.json").handler(request.delete());

		AdminEventRest logs = new AdminEventRest(this.client, Log.class);
		router.route(HttpMethod.GET, "/rest/admin/logs.json").handler(logs.get());
		router.route(HttpMethod.DELETE, "/rest/admin/logs.json").handler(logs.delete());


		AdminLogService fileLog = new AdminLogService();
		router.route(HttpMethod.GET, "/rest/admin/log/last.json").handler(fileLog.getLog());


		AdminModelRest adminModel = new AdminModelRest(client, new FindOptions().setFields(App.summaryFields()));
		router.route(HttpMethod.GET, "/rest/admin/apps.json").handler(adminModel.find(App.class, new AppFilter()));

		AdminModelRest adminPub = new AdminModelRest(client);
		router.route(HttpMethod.GET, "/rest/admin/publications.json").handler(adminPub.find(PublicationSettings.class));

		AdminTeamRest team = new AdminTeamRest(this.client);
		router.route(HttpMethod.GET, "/rest/admin/team/:appID.json").handler(team.findTeam());

		AdminAnalyticRest analytics = new AdminAnalyticRest(this.client);
		router.route(HttpMethod.GET, "/rest/admin/analytics/all.json").handler(analytics::get);
		router.route(HttpMethod.DELETE, "/rest/admin/analytics/all.json").handler(analytics::removeAll);
		router.route(HttpMethod.GET, "/rest/admin/analytics/summary/:time.json").handler(analytics::getSummary);

		AdminAppEventRest rest = new AdminAppEventRest(client);
		router.route(HttpMethod.GET, "/rest/admin/event.json").handler(rest::findAll);
		router.route(HttpMethod.GET, "/rest/admin/event/:user.json").handler(rest.findBy());

		OrganizationTeamRest orgTeamRest = new OrganizationTeamRest(client, new AdminACL(), true);
		router.route(HttpMethod.GET, "/rest/admin/organizations/:orgID/team.json").handler(orgTeamRest.findUsersByOrg());
		router.route(HttpMethod.POST, "/rest/admin/organizations/:orgID/team/").handler(orgTeamRest.createPermission());
		router.route(HttpMethod.POST, "/rest/admin/organizations/:orgID/team/:userID.json").handler(orgTeamRest.updatePermission());
		router.route(HttpMethod.DELETE, "/rest/admin/organizations/:orgID/team/:userID.json").handler(orgTeamRest.removePermission());


		AdminOrganizationREST orgRest = new AdminOrganizationREST(client);
		router.route(HttpMethod.GET, "/rest/admin/organizations.json").handler(orgRest.findAll());
		router.route(HttpMethod.GET, "/rest/admin/organizations/paging/all.json").handler(orgRest.findPaging(Organization.class, "name"));
		router.route(HttpMethod.GET, "/rest/admin/organizations/:id.json").handler(orgRest.find());
		router.route(HttpMethod.POST, "/rest/admin/organizations/:id.json").handler(orgRest.update());
		router.route(HttpMethod.DELETE, "/rest/admin/organizations/:id.json").handler(orgRest.delete());
		router.route(HttpMethod.POST, "/rest/admin/organizations/").handler(orgRest.create());


		AdminSecretRest adminSecretRest = new AdminSecretRest(client, encryptionService);
		router.route(HttpMethod.GET, "/rest/admin/secrets.json").handler(adminSecretRest.findAll());
		router.route(HttpMethod.GET, "/rest/admin/secrets/:id.json").handler(adminSecretRest.find());
		router.route(HttpMethod.POST, "/rest/admin/secrets/:id.json").handler(adminSecretRest.update());
		router.route(HttpMethod.DELETE, "/rest/admin/secrets/:id.json").handler(adminSecretRest.delete());
		router.route(HttpMethod.POST, "/rest/admin/secrets/").handler(adminSecretRest.create());

		AdminModelRest aiAdminRest = new AdminModelRest(client);
		router.route(HttpMethod.GET, "/rest/admin/ai/model/all.json").handler(aiAdminRest.find(AiModel.class));
		router.route(HttpMethod.POST, "/rest/admin/ai/model/").handler(aiAdminRest.create(AiModel.class));
		router.route(HttpMethod.GET, "/rest/admin/ai/model/:id.json").handler(aiAdminRest.findByID(AiModel.class, MongoFilter.Default()));
		router.route(HttpMethod.POST, "/rest/admin/ai/model/:id.json").handler(aiAdminRest.update(AiModel.class));
		router.route(HttpMethod.DELETE, "/rest/admin/ai/model/:id.json").handler(aiAdminRest.delete(AiModel.class, null));

		AppEventHandler.create(vertx, client);

		logger.info("intiAdmin() > exit");
	}




	private void initMongo(JsonObject config) {
		JsonObject mongoConfig = Config.getMongo(config);

		if(mongoConfig.containsKey("table_prefix")){
			DB.setPrefix(mongoConfig.getString("table_prefix"));
		}

		if (config.containsKey(Config.MONGO_TABLE_PREFIX)) {
			logger.info("initMongo() Set DB prefix to {}", config.getString(Config.MONGO_TABLE_PREFIX));
			DB.setPrefix(config.getString(Config.MONGO_TABLE_PREFIX));
		}

		client = MongoClient.createShared(vertx, mongoConfig);
	}


	private void initTemplate(Router router, JsonObject config) {
		TemplateRest templates = new TemplateRest(config.getBoolean("debug"));
		router.route(HttpMethod.GET, "/rest/themes/core.js").handler(templates.get());
	}


	private void initMail(Router router, JsonObject config){
		logger.info("initMail() > enter");

		JsonObject mailConfig = Config.getMail(config);
		if (mailConfig.containsKey("user")){
			mail = createMail(mailConfig);
			MailHandler.start(
					vertx,
					mail,
					mailConfig.getString("user"),
					Config.getHttpHost(config)
			);
			logger.error("initMail() > created mail {}", mailConfig.getString("user"));
		}

		ContactRest contact = new ContactRest();
		router.route(HttpMethod.POST, "/rest/contact").handler(contact::send);
	}

	private MailClient createMail(JsonObject config){

		logger.info("createMail() > enter {}", config.getString("user"));

		if (this.isDebug){
			return new DebugMailClient();
		} else{
			String user = config.getString("user");
			String password = config.getString("password");
			String host = config.getString("host");

			MailConfig mailConfig = new MailConfig();
			mailConfig.setHostname(host);
			mailConfig.setPort(587);
			mailConfig.setStarttls(StartTLSOptions.REQUIRED);
			mailConfig.setAuthMethods("DIGEST-MD5, CRAM-SHA256, CRAM-SHA1, CRAM-MD5, PLAIN, LOGIN");
			mailConfig.setUsername(user);
			mailConfig.setPassword(password);
			mailConfig.setKeepAlive(false);
			return MailClient.createShared(vertx, mailConfig);
		}
	}


	private void initBus(JsonObject config) {

		PerformanceHandler.start(vertx, client);

		MongoLoggerHandler.start(vertx, client);

		DeploymentOptions options = new DeploymentOptions().setWorker(true);
		vertx.deployVerticle(new ImageVerticle(client, config), options);

		options = new DeploymentOptions().setWorker(true);
		vertx.deployVerticle(new VMHeater(client), options);

		OrganizationInitializer.getInstance().init(client, DB.getTable(Organization.class));
	}

	private void initCommandRest(Router router) {

		CommandStackREST commandStack = new CommandStackREST(client);
		/*
		 * complete getters and setters
		 */
		router.route(HttpMethod.GET, "/rest/commands/:appID.json").handler(commandStack.findOrCreateByApp());
		router.route(HttpMethod.POST, "/rest/commands/:appID.json").handler(commandStack.updateByApp());

		/*
		 * partial updates
		 */
		router.route(HttpMethod.POST, "/rest/commands/:appID/add").handler(commandStack.add());
		router.route(HttpMethod.DELETE, "/rest/commands/:appID/pop/:count").handler(commandStack.pop());
		router.route(HttpMethod.DELETE, "/rest/commands/:appID/shift/:count").handler(commandStack.shift());
		router.route(HttpMethod.POST, "/rest/commands/:appID/undo").handler(commandStack.undo());
		router.route(HttpMethod.POST, "/rest/commands/:appID/redo").handler(commandStack.redo());
	}

	private void initTestRest(Router router) {

		TestSettingsRest rest = new TestSettingsRest(client, TestSetting.class, "testID");
		router.route(HttpMethod.GET, "/rest/test/:appID.json").handler(rest.findOrCreateByApp());
		router.route(HttpMethod.POST, "/rest/test/:appID.json").handler(rest.updateByApp());
	}


	private void initEventRest(Router router) {

		EventRest event = new EventRest(client);
		event.setBatch(true);
		router.route(HttpMethod.POST, "/rest/events/:appID.json").handler(event.create());
		router.route(HttpMethod.GET, "/rest/events/:appID.json").handler(event.findBy());
		router.route(HttpMethod.GET, "/rest/events/:appID/:session.json").handler(event.findBy());
		router.route(HttpMethod.GET, "/rest/events/:appID/all/count.json").handler(event.countBy());
		router.route(HttpMethod.DELETE, "/rest/events/:appID/:session.json").handler(event.deleteBy());
	}


	private void initInvitationRest(Router router, JsonObject config) {

		InvitationREST invitation = new InvitationREST(
				client
		);

		router.route(HttpMethod.GET, "/rest/invitation/:appID.json").handler(invitation.findByApp());
		router.route(HttpMethod.GET, "/rest/invitation/:hash/app.json").handler(invitation.findAppByHash());
		router.route(HttpMethod.GET, "/rest/invitation/:hash/update.json").handler(invitation::infLastAppUpdateByHash);

		router.route(HttpMethod.GET, "/rest/invitation/:appID/:hash/test.json").handler(invitation.findTestByHash());
		router.route(HttpMethod.POST, "/rest/invitation/:appID/:hash/events.json").handler(invitation.addEvents());
		router.route(HttpMethod.POST, "/rest/invitation/:appID/:hash/mouse.json").handler(invitation.addMouse());

		// should go to different route
		//router.route(HttpMethod.GET, "/rest/invitation/:appID/:hash/secrets.json").handler(invitation.findSecretByHash());
		router.route(HttpMethod.GET, "/rest/invitation/:appID/:hash/data.json").handler(invitation.findAppDataByHash());
	}


	private void initCommentRest(Router router) {
		CommentREST comment = new CommentREST(client);


		router.route(HttpMethod.GET, "/rest/comments/apps/:appID.json").handler(comment.findBy());
		router.route(HttpMethod.GET, "/rest/comments/apps/:appID/:type.json").handler(comment.findBy());
		router.route(HttpMethod.GET, "/rest/comments/apps/:appID/:reference/:type.json").handler(comment.findBy());

		router.route(HttpMethod.GET, "/rest/comments/count/apps/:appID/:type.json").handler(comment.count());
		router.route(HttpMethod.GET, "/rest/comments/count/apps/:appID/:reference/:type.json").handler(comment.count());


		router.route(HttpMethod.POST, "/rest/comments/apps/:appID").handler(comment.create());
		router.route(HttpMethod.POST, "/rest/comments/apps/:appID/:commentID.json").handler(comment.update());
		router.route(HttpMethod.DELETE, "/rest/comments/apps/:appID/:commentID.json").handler(comment.delete());

		CommentREST invitationComment = new CommentREST(client,new InvitationCommentACL(client))
			.exlcudeUrlParameter("hash");

		router.route(HttpMethod.GET, "/rest/comments/hash/:hash/:appID.json").handler(invitationComment.findBy());
		router.route(HttpMethod.GET, "/rest/comments/hash/:hash/:appID/:type.json").handler(invitationComment.findBy());
		router.route(HttpMethod.GET, "/rest/comments/hash/:hash/:appID/:reference/:type.json").handler(invitationComment.findBy());

		router.route(HttpMethod.GET, "/rest/comments/count/hash/:hash/:appID/:type.json").handler(invitationComment.count());
		router.route(HttpMethod.GET, "/rest/comments/count/hash/:hash/:appID/:reference/:type.json").handler(invitationComment.count());

		router.route(HttpMethod.GET, "/rest/comments/hash/:hash/:appID/:type/count.json").handler(invitationComment.count());
		router.route(HttpMethod.GET, "/rest/comments/hash/:hash/:appID/:reference/:type/count.json").handler(invitationComment.count());

		router.route(HttpMethod.POST, "/rest/comments/hash/:hash/:appID").handler(invitationComment.create());
		router.route(HttpMethod.POST, "/rest/comments/hash/:hash/:appID/:commentID.json").handler(invitationComment.update());
		router.route(HttpMethod.DELETE, "/rest/comments/hash/:hash/:appID/:commentID.json").handler(invitationComment.delete());
	}

	private void initTeamRest(Router router){

		TeamREST team = new TeamREST(client);

		router.route(HttpMethod.GET, "/rest/apps/:appID/team.json").handler(team.getTeam());
		router.route(HttpMethod.GET, "/rest/apps/:appID/suggestions/team.json").handler(team.getSuggestion());
		router.route(HttpMethod.POST, "/rest/apps/:appID/team/").handler(team.createPermission());
		router.route(HttpMethod.POST, "/rest/apps/:appID/team/:userID.json").handler(team.updatePermission());
		router.route(HttpMethod.DELETE, "/rest/apps/:appID/team/:userID.json").handler(team.removePermission());
	}

	private void initAppRest(Router router, JsonObject config) {

		String imageFolder = Config.getImageFolderApps(config);
		IBlobService blobService = getBlobService(imageFolder, config);

		AppREST app = new AppREST(client, config.getString("image.folder.apps"), blobService);
		router.route(HttpMethod.GET, "/rest/apps").handler(app.findByUser());
		router.route(HttpMethod.POST, "/rest/apps").handler(app.create());
		router.route(HttpMethod.GET, "/rest/apps/:appID.json").handler(app.find());
		router.route(HttpMethod.GET, "/rest/apps/public").handler(app.findPublic());
		router.route(HttpMethod.POST, "/rest/apps/props/:appID.json").handler(app.update());
		router.route(HttpMethod.POST, "/rest/apps/:appID.json").handler(app.update());
		router.route(HttpMethod.DELETE, "/rest/apps/:appID.json").handler(app.delete());
		router.route(HttpMethod.POST, "/rest/apps/copy/:appID").handler(app.copy());

		/*
		 * partial updates via JSON changes
		 */
		router.route(HttpMethod.POST, "/rest/apps/:appID/update").handler(app.applyChanges());

		/*
		 * Images
		 */

		ImageREST image = new ImageREST(client, blobService, config);
		image.setACL(new ImageACL(client));
		image.setIdParameter("appID");

		router.route(HttpMethod.GET, "/rest/images/:appID/:image").handler(image.getImage());
		router.route(HttpMethod.GET, "/rest/images/:hash/:appID/:image").handler(image.getInvitationImage());
		router.route(HttpMethod.POST, "/rest/images/:appID").handler(image.setImage());
		router.route(HttpMethod.GET, "/rest/images/:appID.json").handler(image.findBy());
		router.route(HttpMethod.DELETE, "/rest/images/:appID/:imageID/:ass/:file").handler(image.delete());


		/*
		 * App Token
		 */
		AppTokenREST appTokenREST = new AppTokenREST(client);
		router.route(HttpMethod.GET, "/rest/apps/:appID/token.json").handler(appTokenREST.get());

		/*
		 * Publication Settings
		 */
		PublicationSettingsREST publicApp = new PublicationSettingsREST(client);
		router.route(HttpMethod.GET, "/rest/apps/:appID/public.json").handler(publicApp.findByApp());
		router.route(HttpMethod.POST, "/rest/apps/:appID/public.json").handler(publicApp.update());

		/*
		 * App data
		 */
		AppDataREST appDataRest = new AppDataREST(client);
		router.route(HttpMethod.GET, "/rest/apps/:appID/data.json").handler(appDataRest.findByApp());
		router.route(HttpMethod.POST, "/rest/apps/:appID/data.json").handler(appDataRest.applyChanges());

		/*
		 * App secrets
		 */
		AppSecretREST appSecretREST = new AppSecretREST(client, encryptionService);
		router.route(HttpMethod.GET, "/rest/apps/:appID/secrets.json").handler(appSecretREST.findByApp());
		router.route(HttpMethod.POST, "/rest/apps/:appID/secrets.json").handler(appSecretREST.update());

		/*
		 * App Analytics
		 */
		AppAnalyticsREST appAnalyticsREST = new AppAnalyticsREST(client);
		router.route(HttpMethod.GET, "/rest/apps/:appID/analytics.json").handler(appAnalyticsREST.findByApp());
		router.route(HttpMethod.POST, "/rest/apps/:appID/analytics.json").handler(appAnalyticsREST.create());

	}

	private IBlobService getBlobService(String imageFolder, JsonObject config) {
		logger.error("getBlobService() > Create FileSystemBlobService()");
		return new FileSystemBlobService(imageFolder);
	}

	private void initPublish(Router router, JsonObject config) {
		/*
		 * Publishing versions
		 */
		PublicRest publicRest = new PublicRest(
				client,
				this.versionService,
				config.getString("image.folder.apps")
		);
		router.route(HttpMethod.GET, "/rest/public/:orgName/:appName.json").handler(publicRest.getPublicToken());
		router.route(HttpMethod.GET, "/rest/public/version/:version/:hash/app.json").handler(publicRest.getApp());
		router.route(HttpMethod.GET, "/rest/public/version/:version/:hash/:appID/:image").handler(publicRest.getImage());
		router.route(HttpMethod.POST, "/rest/public/version/:appID/").handler(publicRest.publishVersion());
	}

	private void initRuntimeSecrets(Router router, JsonObject config) {
		SecretRest secretRest = new SecretRest(
			client,
			Config.getAPIKey(config),
			encryptionService
		);
		// should be deprecated
		router.route(HttpMethod.GET, "/rest/invitation/:appID/:hash/secrets.json").handler(secretRest.findAppSecret());
		router.route(HttpMethod.GET, "/rest/public/secrets/app/:appID/:hash/secrets.json").handler(secretRest.findAppSecret());

		// get secret, and deducts defaultPricing or the quantity pricing, if the
		// quantity is passed.
		// If the meter parameter is "false", the price will not be deducted, and
		// the credits stay the same
		router.route(HttpMethod.GET, "/rest/public/secrets/:hash/secret/:name.json").handler(secretRest.findSecretByName());
		// org.credit = org.credit - req.quantity * secret.pricePerQuantity
		router.route(HttpMethod.POST, "/rest/public/secrets/:hash/secret/:name.json").handler(secretRest.meterBySecret());
		// use to set prices prices or so
		router.route(HttpMethod.GET, "/rest/public/secrets.json").handler(secretRest.findPublicSecretList());

	}



	private void initUserRest(JsonObject config, Router router) {

		String imageFolder = Config.getImageFolderUser(config);
		IBlobService blobService = getBlobService(imageFolder, config);
		UserREST user = new UserREST(client,blobService, config);

		router.route(HttpMethod.POST, "/rest/user").handler(user.create());
		router.route(HttpMethod.POST, "/rest/user/:id/images/").handler(user.setImage());
		router.route(HttpMethod.GET, "/rest/user/:id/images/:name/:image").handler(user.getImage());
		router.route(HttpMethod.DELETE, "/rest/user/:id/images/:image").handler(user.deleteImage());
		router.route(HttpMethod.POST, "/rest/user/:id.json").handler(user.update());
		router.route(HttpMethod.GET, "/rest/user/:id.json").handler(user.findById());
		router.route(HttpMethod.GET, "/rest/user").handler(user.current());
		router.route(HttpMethod.POST, "/rest/login").handler(user.login());
		router.route(HttpMethod.DELETE, "/rest/login").handler(user.logout());
		router.route(HttpMethod.GET, "/rest/retire").handler(user.retire());
		router.route(HttpMethod.POST, "/rest/user/notification/last.json").handler(user::updateNotificationView);
		router.route(HttpMethod.GET, "/rest/user/notification/last.json").handler(user::getNotifcationView);
		router.route(HttpMethod.POST, "/rest/user/privacy/update.json").handler(user::updatePrivacy);

		router.route(HttpMethod.POST, "/rest/user/external").handler(user::createExternalIfNotExists);

		PasswordRest pass = new PasswordRest(client);
		router.route(HttpMethod.POST, "/rest/user/password/request").handler(pass.resetPassword());
		router.route(HttpMethod.POST, "/rest/user/password/set").handler(pass.setPassword());
	}

	private void initOrganization(Router router, JsonObject config) {
		OrganizationTeamRest orgTeamRest = new OrganizationTeamRest(client, new OrganizationACL(client), false);
		//router.route(HttpMethod.GET, "/rest/organizations/:userID/organizations.json").handler(orgTeamRest.findByUser());
		router.route(HttpMethod.GET, "/rest/organizations/:orgID/team.json").handler(orgTeamRest.findUsersByOrg());
		router.route(HttpMethod.POST, "/rest/organizations/:orgID/team/").handler(orgTeamRest.createPermission());
		router.route(HttpMethod.POST, "/rest/organizations/:orgID/team/:userID.json").handler(orgTeamRest.updatePermission());
		router.route(HttpMethod.DELETE, "/rest/organizations/:orgID/team/:userID.json").handler(orgTeamRest.removePermission());
		// users orgs are part of their objects
		router.route(HttpMethod.GET, "/rest/user/:userID/organizations.json").handler(orgTeamRest.findByUser());


		// users can see their org, change folders and set strip
		OrganizationRest orgRest = new OrganizationRest(client);
		router.route(HttpMethod.GET, "/rest/organizations/:orgID.json").handler(orgRest.find());
		router.route(HttpMethod.GET, "/rest/organizations/:orgID/apps.json").handler(orgRest.findAppsByOrg());
		router.route(HttpMethod.POST, "/rest/organizations/:orgID/folders.json").handler(orgRest.setFolder());
		router.route(HttpMethod.POST, "/rest/organizations/:orgID/displayName.json").handler(orgRest.setDisplayName());
		router.route(HttpMethod.GET, "/rest/organizations/:orgID/published/apps.json").handler(orgRest.findPublishedApps());
		router.route(HttpMethod.GET, "/rest/organizations/:orgID/whoami.json").handler(orgRest.getUserRole());


		//router.route(HttpMethod.POST, "/rest/organizations/:orgID/stripe.json").handler(orgRest.setStripe());
	}


	public void cleanUpUser(String id) {
		/*
		 * Also remove this guy from all teams!!
		 */
		JsonObject query =  new JsonObject().put(Team.USER_ID, id);
		client.removeDocuments(DB.getTable(Team.class), query, res ->{
			if(res.succeeded()){
				logger.info("StaffModelRest.delete(User) > Removed entries in team db for user "+ id);
			} else {
				logger.error("Could not clean up team db");
			}
		});

		/*
		 * Also remove notifactions!
		 */
		client.removeDocuments(DB.getTable(Notification.class), Notification.findByUser(id), res ->{
			if(res.succeeded()){
				logger.info("StaffModelRest.delete(Notification) > Removed entries in team db for user "+ id);
			} else {
				logger.error("Could not clean up team db");
			}
		});
	}




	@Override
	public void stop(){

		try {

			client.close();
			server.close();
			mail.close();

			System.out.println("******************************");
			System.out.println("* MATC STOP                  *");
			System.out.println("******************************");

			super.stop();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}