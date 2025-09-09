package ai.flowrabbit.rest;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import ai.flowrabbit.bus.MongoLogger;

import ai.flowrabbit.model.*;
import ai.flowrabbit.services.IBlobService;
import io.vertx.core.AsyncResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.acl.UserAcl;
import ai.flowrabbit.bus.MailHandler;
import ai.flowrabbit.util.Domain;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.Mail;
import ai.flowrabbit.util.MongoREST;
import ai.flowrabbit.services.TokenService;
import ai.flowrabbit.util.Util;
import ai.flowrabbit.validation.UserValidator;
import io.vertx.core.Handler;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.RoutingContext;

public class UserREST extends MongoREST {

    private final String team_db;

    private final String org_team_db;

    private final String org_db;

    private long imageSize = 1024 * 1024;

    private Logger logger = LoggerFactory.getLogger(UserREST.class);


    private final IBlobService blobService;

    public UserREST(MongoClient db, IBlobService blobService, JsonObject conf) {
        super(db, User.class);
        this.blobService = blobService;
        this.imageSize = conf.getLong("image.size");
        this.team_db = DB.getTable(Team.class);
        this.org_team_db = DB.getTable(OrganizationTeam.class);
        this.org_db = DB.getTable(Organization.class);
        setACL(new UserAcl(db));
        setValidator(new UserValidator(db));
        setPartialUpdate(true);
    }

    public Handler<RoutingContext> current() {
        return event -> current(event);
    }

    public void current(RoutingContext event) {
        logger.info("current() > enter");
        User user = getUser(event);
        JsonObject json = mapper.toVertx(user);
        event.response().end(cleanJson(json).encode());
    }

    public Handler<RoutingContext> findById() {
        return event -> findById(event);
    }

    private void findById(RoutingContext event) {
        User user = getUser(event);
        String id = getId(event);
        if (user.hasRole(User.USER) || user.getId().equals(id)) {
            find(event);
        } else {
            logger.error("findById() > " + user + " tried to read user ");
            returnError(event, 404);
        }
    }

    public Handler<RoutingContext> login() {
        return event -> login(event);
    }

    protected void login(RoutingContext event) {

        JsonObject login = event.getBodyAsJson();


        /**
         * make sure data is there
         */
        if (login.containsKey("email") && login.containsKey("password")) {
            this.mongo.findOne(this.table, User.findByEmail(login.getString("email")), null, res -> {

                if (res.succeeded()) {
                    JsonObject user = res.result();
                    if (user != null) {
                        if (User.STATUS_BLOCKED.equals(user.getString("status"))) {
                            error("login", "Blocked user tried login");
                            returnError(event, "user.login.blocked");
                        } else if (User.STATUS_RETIRED.equals(user.getString("status"))) {
                            error("login", "Retired user tried login");
                            returnError(event, "user.login.fail");
                        } else {
                            /**
                             * Now check password!
                             */
                            checkPassword(event, login, user);
                        }
                    } else {
                        error("login", "No user with mail :" + login.getString("email"));
                        returnError(event, "user.login.fail");
                    }
                } else {
                    returnError(event, "user.login.fail");
                }
            });
        } else {
            returnError(event, "user.login.fail");
        }
    }


    public void checkPassword(RoutingContext event, JsonObject login, JsonObject user) {
        if (Util.matchPassword(login.getString("password"), user.getString("password"))) {
            setLoginUser(event, user);
        } else {
            updateFailedLogins(user);
            AppEvent.send(event, user.getString("email"), AppEvent.TYPE_USER_LOGIN_ERROR);
            logger.error("error() > *ATTENTION* Wrong login for " + user.getString("email"));
            returnError(event, "user.login.fail");
        }
    }

    /**
     * Set user in session and update Mongo KPIs.
     */
    public void setLoginUser(RoutingContext event, JsonObject user) {
        /**
         * Every thing fine. We can set the user in the session
         */
        setUser(mapper.fromVertx(user, User.class), event);

        /**
         * We update user data...
         */
        int loginCount = 0;
        if (user.containsKey("loginCount")) {
            loginCount = user.getInteger("loginCount");
        }
        loginCount++;
        user.put("loginCount", loginCount);
        user.put("lastlogin", System.currentTimeMillis());

        mongo.save(table, user, write -> {
            if (!write.succeeded()) {
                logger.error("login() > Could not update lastLogin");
            }
        });

        /**
         * Log for KPI
         */
        AppEvent.send(event, user.getString("email"), AppEvent.TYPE_USER_LOGIN);

        String token = TokenService.getToken(user);
        user.put("token", token);

        /**
         * Copy data here, other wise password  and so might be rewritten in the clean and
         * then in the async save the password is gone
         */
        event.response().end(cleanJson(user.copy()).encode());

    }


    private void updateFailedLogins(JsonObject user) {
        if (!user.containsKey("failedLoginAttempts")) {
            user.put("failedLoginAttempts", 0);
        }
        user.put("failedLoginAttempts", user.getInteger("failedLoginAttempts") + 1);
        mongo.save(table, user, write -> {
            if (!write.succeeded()) {
                logger.error("login() > Could not store failedLoginAttempts");
            }
        });
    }

    public Handler<RoutingContext> logout() {
        return event -> logout(event);
    }


    public void logout(RoutingContext event) {
        /**
         * Store for KPI
         */
        User user = getUser(event);
        AppEvent.send(event, user.getEmail(), AppEvent.TYPE_USER_LOGOUT);

        returnOk(event, "user.logged.out");
    }


    /********************************************************************************************
     * Delete
     ********************************************************************************************/

    public void afterDelete(RoutingContext event, String id) {
        logger.info("afterDelete() > " + id);

        JsonObject query = new JsonObject().put(Team.USER_ID, id);

        mongo.removeDocuments(this.team_db, query, res -> {
            if (res.succeeded()) {
                logger.error("Removed entries in team db");
            } else {
                logger.error("Could not clean up team db");
            }
        });


    }


    /********************************************************************************************
     * Create
     ********************************************************************************************/

    public void createExternalIfNotExists(RoutingContext event) {
        logger.info("createExternalIfNotExists() > ");

        JsonObject json = event.getBodyAsJson();
        if (!json.containsKey("id")) {
            returnError(event, 401);
        }
        if (!json.containsKey("email")) {
            returnError(event, 401);
        }
        if (!json.containsKey("name")) {
            returnError(event, 401);
        }

        String id = json.getString("id");
        this.mongo.findOne(this.table, User.findById(id), null, res -> {
            if (res.succeeded()) {
                JsonObject result = res.result();
                if (result != null) {
                    logger.info("createExternalIfNotExists() > Found user");
                    result.put("id", id);
                    result.remove("_id");
                    cleanJson(result);
                    returnJson(event, result);
                } else {
                    logger.info("createExternalIfNotExists() > Create user");
                    insertExternal(event, json, id);
                }
            } else {
                returnError(event, 401);
            }
        });
    }

    private void insertExternal(RoutingContext event, JsonObject json, String id) {
        logger.info("insertExternal() > Create user : " + id);

        json.remove("id");
        json.put("_id", id);

        Domain domain = Domain.get(event);
        json.put("domain", domain.getUrl());
        json.put("external", true);
        json.put("created", System.currentTimeMillis());
        json.put("lastUpdate", System.currentTimeMillis());
        json.put("email", json.getString("email").toLowerCase());
        json.put("external", true);
        json.put("role", User.USER);
        json.put("plan", "Free");
        json.put("newsletter", false);
        json.put("lastNotification", 0);
        json.put("password", Util.getRandomString());
        json.put("acceptedTOS", System.currentTimeMillis());
        json.put("acceptedPrivacy", System.currentTimeMillis());
        json.put("acceptedGDPR", true);

        this.mongo.insert(this.table, json, res -> {

            if (res.succeeded()) {
                this.logger.error("insertExternal() > Created user");

                json.put("id", id);
                cleanJson(json);
                returnJson(event, json);

                /**
                 * Also send email
                 */
                Mail.to(json.getString("email"))
                        .subject(domain.getMailSubjectWelcome())
                        .payload(new JsonObject())
                        .template(MailHandler.TEMPLATE_USER_CREATED)
                        .send(event);

            } else {
                this.logger.error("insertExternal() > could not save user", res.cause());
                returnError(event, 401);
            }
        });
    }

    protected void create(RoutingContext event, JsonObject request) {

        Domain domain = Domain.get(event);

        String email = request.getString("email").toLowerCase();
        String password = Util.hashPassword(request.getString("password"));
        String name = request.getString("name", "");
        String lastname = request.getString("lastname", "");

        JsonObject newUser = new JsonObject();
        newUser.put("name", name);
        newUser.put("lastname", lastname);
        newUser.put("created", System.currentTimeMillis());
        newUser.put("lastUpdate", System.currentTimeMillis());
        newUser.put("domain", domain.getUrl());
        newUser.put("paidUntil", -1);


        newUser.put("email", email);
        newUser.put("password", password);
        newUser.put("role", User.USER);
        newUser.put("plan", "Free");
        newUser.put("newsletter", false);
        newUser.put("lastNotification", 0);
        newUser.put("acceptedTOS", System.currentTimeMillis());
        newUser.put("acceptedPrivacy", System.currentTimeMillis());
        newUser.put("acceptedGDPR", true);

        if (request.containsKey("isAppStoreUser")) {
            newUser.remove("isAppStoreUser");
            newUser.put("role", User.APP_USER);
        }

        String orgInvite = getOrgInvite(request);

        mongo.insert(this.table, newUser, res -> {
            if (res.succeeded()) {
                onUserCreated(event, domain, request, newUser, orgInvite, res);
            } else {
                returnError(event, table + ".create.error");
            }
        });

    }

    private void onUserCreated(RoutingContext event, Domain domain, JsonObject request, JsonObject newUser, String orgInvite, AsyncResult<String> res) {
        String userID = res.result();
        newUser.put("_id", userID);
        logger.debug("create() > User " + newUser.encode());
        cleanJson(newUser);
        event.response().end(newUser.encode());

        /**
         * Also send email
         */
        Mail.to(newUser.getString("email"))
                .bcc(domain.getAdmin())
                .subject(domain.getMailSubjectWelcome())
                .payload(new JsonObject())
                .template(MailHandler.TEMPLATE_USER_CREATED)
                .send(event);

        /**
         * Log KPI
         */
        AppEvent.send(event, newUser.getString("email"), AppEvent.TYPE_USER_SIGNUP);

        /**
         * Add to org if needed
         */
        if (orgInvite != null) {
            this.addUserToOrg(userID, newUser.getString("email"), orgInvite);
        } else {
            // should we have a switch in here?
            String displayName = request.getString("orgName");
            if (displayName == null || displayName.trim().length() < 2) {
                logger.debug("onUserCreated() Use email");
                String email = newUser.getString("email");
                displayName = Organization.suggestDisplayName(email);
            }
            this.addCreateNewOrg(userID, displayName);
        }
    }


    private void addCreateNewOrg(String userID, String displayName) {
		logger.info("addCreateNewOrg() > user with org invite >{}<", displayName);
        try {
            Organization.suggestDomainNameAsUUID(mongo,100, finalName -> {
                JsonObject newOrg = Organization.create(
                        finalName,
                        displayName,
                        10000
                );

                this.mongo.insert(org_db, newOrg, saved -> {
                    if (saved.succeeded()) {
                        String orgID = saved.result();
                        logger.info("addCreateNewOrg() > Create org new > name:"+ finalName + ">  id: " +orgID);
                        addUserToOrgTeam(orgID, userID, OrganizationTeam.OWNER);
                    } else {
                       logger.info("addCreateNewOrg() > could not create org > name "+ finalName, saved.cause());
                    }
                });
            });

        } catch (Exception e) {
            logger.error("addCreateNewOrg() > Something wrong", e);
        }
	}

	private void addUserToOrgTeam(String orgID, String userID, int permission) {
		this.mongo.count(org_db, Organization.findById(orgID), exists -> {
			if (exists.succeeded() && exists.result() == 1) {
				JsonObject team = OrganizationTeam.create(userID, orgID, permission);
				mongo.insert(org_team_db, team, saved -> {
					logger.info("addUserToOrgTeam() > " + userID + " as " + permission);
				});
			} else {
				logger.error("addUserToOrgTeam() > Could not add" + orgID, exists.cause());
			}
		});
	}

	private void addUserToOrg(String userID, String email, String orgInvite) {
        logger.error("addUserToOrg() > user with org invite");

        try {
            JsonObject invite = TokenService.getOrgInvite(orgInvite);
            String orgID = invite.getString(OrganizationTeam.ORG_ID);
            String email2 = invite.getString("email");
            int permission = invite.getInteger(OrganizationTeam.PERMISSION);
            if (!email2.equals(email)) {
                logger.error("addUserToOrg() > Email does not match");
                return;
            }

			addUserToOrgTeam(orgID, userID, permission);

		} catch (Exception e) {
            logger.error("addUserToOrg() > Something wrong with the token");
        }

    }

    private String getOrgInvite(JsonObject json) {
        String orgInvite = null;
        if (json.containsKey("orgInvite")) {
            orgInvite = json.getString("orgInvite");
            json.remove("orgInvite");
        }
        return orgInvite;
    }


    /********************************************************************************************
     * Update
     ********************************************************************************************/

    /**
     * The acl was already validated. We just has the password and make sure
     * none is setting the role, plan or so...
     */
    public void update(RoutingContext event, String id, JsonObject json) {

        if (json.containsKey("password")) {
            json.put("password", Util.hashPassword(json.getString("password")));
        }

        if (json.containsKey("role")) {
            logger.error("update() > User " + getUser(event) + " tried to set role!");
            MongoLogger.error(event, getUser(event), this.getClass(), "update", "Hack role " + json.getString("role"));
            json.remove("role");
        }

        if (json.containsKey("paidUntil")) {
            logger.error("update() > User " + getUser(event) + " tried to set paidUntil!");
            MongoLogger.error(event, getUser(event), this.getClass(), "update", "Hack paidUntil");
            json.remove("paidUntil");
        }

        if (json.containsKey("domain")) {
            logger.error("update() > User " + getUser(event) + " tried to set domain!");
            json.remove("domain");
        }

        if (json.containsKey("status")) {
            logger.error("update() > User " + getUser(event) + " tried to set status!");
            json.remove("status");
        }

        if (json.containsKey("plan")) {
            logger.error("update() > User " + getUser(event) + " tried to set plan!");
            json.remove("plan");
        }

        if (json.containsKey("has")) {
            logger.error("update() > User " + getUser(event) + " tried to set has!");
            json.remove("has");
        }

        checkEmailUpdate(event, id, json);


    }

    private void checkEmailUpdate(RoutingContext event, String id, JsonObject json) {
        if (json.containsKey("email")) {
            logger.info("checkEmailUpdate() > User " + getUser(event) + " changed email");
            String email = json.getString("email");
            this.mongo.count(table, User.findByEmail(email), res -> {
                if (res.succeeded() && res.result() == 0) {
                    logger.warn("checkEmailUpdate() > User " + getUser(event) + " changed email");
                    AppEvent.send(event, json.getString("email"), AppEvent.TYPE_USER_CHANGE_EMAIL);
                    super.update(event, id, json);
                } else {
                    logger.warn("checkEmailUpdate() > User " + getUser(event) + " tried used mail!");
                    returnError(event, "user.update.email.taken");
                }
            });
        } else {
            super.update(event, id, json);
        }
    }


    protected void afterUpdate(RoutingContext event, String id, JsonObject json) {

        setUser(mapper.fromVertx(json, User.class), event);
    }


    /********************************************************************************************
     * Set Image
     ********************************************************************************************/


    public Handler<RoutingContext> setImage() {
        return event -> setImage(event);
    }

    public void setImage(RoutingContext event) {
        String id = event.request().getParam("id");
        if (this.acl != null) {
            this.acl.canWrite(getUser(event), event, allowed -> {
                if (allowed) {
                    setImage(event, id);
                } else {
                    returnError(event, 405);
                }
            });
        } else {
            this.setImage(event, id);
        }
    }

    public void setImage(RoutingContext event, String id) {
        List<FileUpload> files = new ArrayList<FileUpload>(event.fileUploads());
        if (files.size() == 1) {
            FileUpload file = files.get(0);
            setImage(event, id, file);
        } else {
            FileSystem fs = event.vertx().fileSystem();
            for (FileUpload file : files) {
                fs.delete(file.uploadedFileName(), res -> {
                    if (!res.succeeded()) {
                        logger.debug("setImage() > Could not delete", res.cause());
                    }
                });
            }
            returnError(event, 404);
        }
    }


    private void setImage(RoutingContext event, String id, FileUpload file) {
        if (checkImage(file)) {
            String userFolder = this.blobService.createFolder(event, id);
            String imageID = System.currentTimeMillis() + "";
            String type = Util.getFileType(file.fileName());
            String image = imageID + "." + type;
            String dest = userFolder + "/" + image;
            this.blobService.setBlob(event, file.uploadedFileName(), dest, uploadResult -> {
                if (uploadResult) {
                    onUserImageUploaded(event, id, image);
                } else {
                    returnError(event, "user.image.error2");
                }
            });
        } else {
            FileSystem fs = event.vertx().fileSystem();
            fs.delete(file.uploadedFileName(), res -> {
                if (!res.succeeded()) {
                    error("setImage", "Could not delete " + file.uploadedFileName());
                }
            });
            returnError(event, "user.image.wrong");
        }
    }


    private void onUserImageUploaded(RoutingContext event, String id, String image) {
        /**
         * Update session!
         */
        User user = getUser(event);
        user.setImage(image);
        setUser(user, event);

        /**
         * build a new user json and pass it to the update method,
         * which will alson send the response;
         */
        JsonObject json = new JsonObject().put("image", image);
        update(event, id, json);
    }

    private boolean checkImage(FileUpload file) {
        return file.size() < this.imageSize;
    }


    public Handler<RoutingContext> deleteImage() {
        return event -> deleteImage(event);
    }

    public void deleteImage(RoutingContext event) {
        String id = event.request().getParam("id");
        String image = event.request().getParam("image");
        if (this.acl != null) {
            this.acl.canWrite(getUser(event), event, allowed -> {
                if (allowed) {
                    this.mongo.findOne(table, User.findById(id), null, res -> {
                        if (res.succeeded() && res.result() != null) {

                            User user = getUser(event);
                            user.setImage(null);

                            JsonObject json = res.result();
                            json.remove("image");

                            JsonObject query = new JsonObject()
                                    .put("$unset", new JsonObject().put("image", ""));

                            mongo.updateCollection(table, User.findById(id), query, updated -> {
                                if (updated.succeeded()) {
                                    returnJson(event, cleanJson(json));
                                } else {
                                    returnError(event, 405);
                                    error("deleteImage", "Could not update user");
                                }
                            });
                            this.blobService.deleteFile(event, id, image, deleteResult -> {
                                if (!deleteResult) {
                                    error("deleteImage", "Could not delete image " + image);
                                }
                            });
                        } else {
                            error("deleteImage", "Could not load user");
                            returnError(event, 405);
                        }
                    });
                } else {
                    error("deleteImage", "The user " + getUser(event) + " tried to delete an image ");
                    returnError(event, 405);
                }
            });
        } else {
            getImage(event, id, image);
        }
    }


    /********************************************************************************************
     * Get Image
     ********************************************************************************************/


    public Handler<RoutingContext> getImage() {
        return event -> getImage(event);
    }


    public void getImage(RoutingContext event) {

        String id = event.request().getParam("id");
        String image = event.request().getParam("image");

        if (this.acl != null) {
            this.acl.canRead(getUser(event), event, allowed -> {
                if (allowed) {
                    getImage(event, id, image);
                } else {
                    returnError(event, 404);
                }
            });
        } else {
            getImage(event, id, image);
        }
    }


    public void getImage(RoutingContext event, String userID, String image) {
        this.blobService.getBlob(event, userID, image);
    }


    public Handler<RoutingContext> retire() {
        return event -> retireUser(event);
    }


    /********************************************************************************************
     * retire user
     ********************************************************************************************/

    public void retireUser(RoutingContext event) {
        logger.info("retireUser() > enter ");

        User user = getUser(event);
        if (!user.isGuest() && !user.isAdmin()) {

            JsonObject request = new JsonObject()
                    .put("status", User.STATUS_RETIRED);

            JsonObject update = new JsonObject()
                    .put("$set", request);

            mongo.updateCollection(table, User.findById(user.getId()), update, res -> {
                if (res.succeeded()) {
                    AppEvent.send(event, user.getEmail(), AppEvent.TYPE_USER_RETIRED);
                } else {
                    logger.error("retireUser() > could not save mongo", res.cause());
                }
            });

            this.logout(event);
        } else {
            error("retireUser", "The user " + getUser(event) + " tried to retire");
            returnError(event, 405);
        }

    }


    /********************************************************************************************
     * Update
     ********************************************************************************************/

    public void updateNotificationView(RoutingContext event) {
        User user = this.getUser(event);
        logger.debug("updateNotificationView() > enter > " + user);
        if (!user.isGuest()) {
            JsonObject update = new JsonObject().put("lastNotification", System.currentTimeMillis());
            partialUpdate(event, getUser(event).getId(), update);
        } else {
            logger.debug("updateNotificationView() > Called for guest...");
            returnOk(event, "user.notificaiton.update");
        }
    }

    public void getNotifcationView(RoutingContext event) {
        User user = this.getUser(event);
        logger.debug("updateNotificationView() > enter > " + user);
        if (!user.isGuest()) {
            mongo.findOne(table, User.findById(user.getId()), null, res -> {
                JsonObject result = new JsonObject();
                result.put("lastNotification", 0);
                if (res.succeeded()) {
                    JsonObject json = res.result();
                    if (json.containsKey("lastNotification")) {
                        result.put("lastNotification", json.getLong("lastNotification"));
                    }
                }
                returnJson(event, result);
            });
        } else {
            JsonObject result = new JsonObject();
            result.put("lastNotification", 0);
            returnJson(event, result);
        }
    }


    /********************************************************************************************
     * GDPR
     ********************************************************************************************/


    public void updatePrivacy(RoutingContext event) {
        User user = this.getUser(event);
        logger.debug("updatePrivacy() > enter > " + user);
        if (!user.isGuest()) {
            JsonObject update = new JsonObject().put("acceptedGDPR", true);
            partialUpdate(event, getUser(event).getId(), update);
            AppEvent.send(event, user.getEmail(), AppEvent.TYPE_USER_UDPATE_PRIVACY);
        } else {
            logger.debug("updateNotificationView() > Called for guest...");
            returnOk(event, "user.notificaiton.update");
        }
    }


    /********************************************************************************************
     * Helper
     ********************************************************************************************/

    protected JsonObject cleanJson(JsonObject user) {
        user.remove("password");
        return super.cleanJson(user);
    }


}
