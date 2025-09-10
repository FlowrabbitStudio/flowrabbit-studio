package ai.flowrabbit.util;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class Config {

    private static final Logger logger = LoggerFactory.getLogger(Config.class);

    public static final String ENV_ADMIN_EMAIL = "FLR_ADMIN_EMAIL";

    public static final String ENV_ADMIN_PASSWORD = "FLR_ADMIN_PASSWORD";

    public static final String ENV_HTTP_HOST = "FLR_HTTP_HOST";

    public static final String ENV_HTTP_PORT = "FLR_HTTP_PORT";

    public static final String ENV_MONGO_DB_NAME = "FLR_MONGO_DB_NAME";

    public static final String ENV_MONGO_TABLE_PREFIX = "FLR_MONGO_TABLE_PREFIX";

    public static final String ENV_MONGO_CONNECTION_STRING = "FLR_MONGO_CONNECTION_STRING";

    public static final String ENV_MONGO_AUTH= "FLR_ENV_MONGO_AUTH";

    public static final String ENV_MONGO_USER = "FLR_ENV_MONGO_USER";

    public static final String ENV_MONGO_PASSWORD = "FLR_ENV_MONGO_PASSWORD";

    public static final String ENV_MAIl_USER = "FLR_MAIL_USER";

    public static final String ENV_MAIl_PASSWORD = "FLR_MAIL_PASSWORD";

    public static final String ENV_MAIL_HOST = "FLR_MAIL_HOST";

    public static final String ENV_JWT_PASSWORD = "FLR_JWT_PASSWORD";

    public static final String ENV_IMAGE_FOLDER_USER = "FLR_IMAGE_FOLDER_USER";

    public static final String ENV_IMAGE_FOLDER_APPS = "FLR_IMAGE_FOLDER_APPS";

    public static final String ENV_VERSION_FOLDER_APPS = "FLR_VERSION_FOLDER_APPS";

    public static final String ENV_DB_ENCRYPTION_KEY = "FLR_DB_ENCRYPTION_KEY";

    public static final String ENV_CLIENT_API_KEY = "FLR_CLIENT_API_KEY";

    public static final String ENV_DEPLOYMENT = "FLR_DEPLOYMENT";

    public static final String ADMIN_EMAIL = "admin.email";

    public static final String ADMIN_PASSWORD = "admin.password";

    public static final String HTTP_HOST = "http.host";

    public static final String HTTP_PORT = "http.port";

    public static final String MONGO_DB_NAME = "mongo.db_name";

    public static final String MONGO_TABLE_PREFIX = "mongo.table_prefix";

    public static final String MONGO_CONNECTION_STRING = "mongo.connection_string";

    public static final String MONGO_USER = "mongo.user";

    public static final String MONGO_USE_AUTH = "mongo.auth";

    public static final String MONGO_PASSWORD = "mongo.password";

    public static final String MAIl_USER = "mail.user";

    public static final String MAIl_PASSWORD = "mail.password";

    public static final String MAIL_HOST = "mail.host";

    public static final String JWT_PASSWORD = "jwt.password";

    public static final String IMAGE_FOLDER_USER = "image.folder.user";

    public static final String IMAGE_FOLDER_APPS = "image.folder.apps";

    public static final String S3_USE = "s3.use";

    public static final String S3_URL = "s3.url";

    public static final String S3_BUCKET = "s3.bucket";

    public static final String S3_ACCESS_KEY = "s3.accessKey";

    public static final String S3_SECRET_ACCESS_KEY = "s3.secretAccessKey";

    public static final String CLIENT_API_KEY = "client.api.key";

    public static final String DB_ENCRYPTION_KEY = "db.encryption.key";

    public static final String VERSION_FOLDER = "version.folder";

    public static final String DEPLOYMENT = "deployment";

    public static JsonObject getMail(JsonObject config) {
        JsonObject mailConfig = config.getJsonObject("mail");
        if (mailConfig == null) {
            mailConfig = new JsonObject()
                    .put("user", config.getString(MAIl_USER))
                    .put("password", config.getString(MAIl_PASSWORD))
                    .put("host", config.getString(MAIL_HOST));
        }
        return mailConfig;
    }

    public static String getAPIKey(JsonObject config) {
        return config.getString(CLIENT_API_KEY);
    }

    public static boolean isDebug(JsonObject config) {
        return config.getBoolean("debug");
    }

    public static S3Config getS3(JsonObject config) {
        return new S3Config(
            config.getString(S3_URL),
            config.getString(S3_BUCKET),
            config.getString(S3_ACCESS_KEY),
            config.getString(S3_SECRET_ACCESS_KEY)
        );
    }

    public static String getJwtPassword(JsonObject config) {
        if (!config.containsKey(JWT_PASSWORD)) {
            throw new RuntimeException("No JWT password");
        }
        return config.getString(JWT_PASSWORD);
    }

    public static String getDBEncryptionKey(JsonObject config) {
        if (!config.containsKey(DB_ENCRYPTION_KEY)) {
            throw new RuntimeException("No DB key provided");
        }
        return config.getString(DB_ENCRYPTION_KEY);
    }


    public static String getImageFolderApps(JsonObject config) {
        if (!config.containsKey(IMAGE_FOLDER_APPS)) {
            throw new RuntimeException("No APP image folder key provided");
        }
        return config.getString(IMAGE_FOLDER_APPS);
    }

    public static String getImageFolderUser(JsonObject config) {
        if (!config.containsKey(IMAGE_FOLDER_USER)) {
            throw new RuntimeException("No user image folder key provided");
        }
        return config.getString(IMAGE_FOLDER_USER);
    }

    public static String getDeployment(JsonObject config) {
        return config.getString(DEPLOYMENT);
    }


    public static String getVersionFolder(JsonObject config) {
        if (!config.containsKey(VERSION_FOLDER)) {
            throw new RuntimeException("No version key provided");
        }
        return config.getString(VERSION_FOLDER);
    }

    public static boolean useS3(JsonObject config) {
        if (config.containsKey(S3_USE)) {
            return config.getBoolean(S3_USE);
        }
        return false;
    }


    public static String getHttpHost(JsonObject config) {
        return config.getString(HTTP_HOST);
    }

    public static JsonObject getMongo(JsonObject config) {

        JsonObject mongoConfig = new JsonObject()
            .put("connection_string", config.getString(Config.MONGO_CONNECTION_STRING))
            .put("db_name", config.getString(Config.MONGO_DB_NAME));

        String mongoPassword = config.getString(MONGO_PASSWORD, "");
        String mongoUser = config.getString(MONGO_USER, "");
        boolean mongoUseAuth = config.getBoolean(MONGO_USE_AUTH, false);
        if (mongoUseAuth && !mongoPassword.isEmpty() && !mongoUser.isEmpty()) {
            logger.error("getMongo() > Use auth {} > {}", mongoUser, mongoPassword.length());

            String connectionString = config.getString(Config.MONGO_CONNECTION_STRING);
            String tableName = config.getString(Config.MONGO_DB_NAME);
            String[] parts = connectionString.split("://");
            if (parts.length == 2) {
                String protocol = parts[0];
                String host = parts[1];
                String authConnectionString = protocol
                        + "://" + mongoUser
                        + ":" + mongoPassword
                        + "@" + host
                        + "/" + tableName;

                mongoConfig.put("connection_string", authConnectionString);

            } else {
                logger.error("getMongo() > connection string not splittable");
            }

            mongoConfig.put("username", mongoUser);
            mongoConfig.put("password", mongoPassword);
            mongoConfig.put("trustAll", true);
        } else {
            logger.error("getMongo() > No auth");
        }

        return mongoConfig;
    }

    public static JsonObject setDefaults(JsonObject config){
        JsonObject result = config.copy();
        if (!result.containsKey(HTTP_HOST)) {
            result.put(HTTP_HOST, "https://quant-ux.com");
        }
        return result;
    }

    public static JsonObject mergeEnvIntoConfig(JsonObject config){
        return mergeEnvIntoConfig(config, System.getenv());
    }

    public static JsonObject mergeEnvIntoConfig(JsonObject config, Map<String, String> env) {
        logger.error("mergeEncIntoConfig() > enter");
        JsonObject result = config.copy();


        if (env.containsKey(ENV_ADMIN_EMAIL)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_ADMIN_EMAIL);
            result.put(ADMIN_EMAIL, env.get(ENV_ADMIN_EMAIL));
        }
        if (env.containsKey(ENV_ADMIN_PASSWORD)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_ADMIN_PASSWORD);
            result.put(ADMIN_PASSWORD, env.get(ENV_ADMIN_PASSWORD));
        }

        if (env.containsKey(ENV_HTTP_HOST)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_HTTP_HOST);
            result.put(HTTP_HOST, env.get(ENV_HTTP_HOST));
        }
        if (env.containsKey(ENV_HTTP_PORT)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_HTTP_PORT);
            try {
                result.put(HTTP_PORT, Integer.parseInt(env.get(ENV_HTTP_PORT)));
            }catch (Exception e) {
                logger.error("Config.mergeEncIntoConfig() > coould not parse int for http.port");
            }
        }

        if (env.containsKey(ENV_MAIL_HOST)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MAIL_HOST);
            result.put(MAIL_HOST, env.get(ENV_MAIL_HOST));
        }
        if (env.containsKey(ENV_MAIl_USER)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MAIl_USER);
            result.put(MAIl_USER, env.get(ENV_MAIl_USER));
        }
        if (env.containsKey(ENV_MAIl_PASSWORD)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MAIl_PASSWORD);
            result.put(MAIl_PASSWORD, env.get(ENV_MAIl_PASSWORD));
        }

        if (env.containsKey(ENV_MONGO_CONNECTION_STRING)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MONGO_CONNECTION_STRING);
            result.put(MONGO_CONNECTION_STRING, env.get(ENV_MONGO_CONNECTION_STRING));
        }
        if (env.containsKey(ENV_MONGO_DB_NAME)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MONGO_DB_NAME);
            result.put(MONGO_DB_NAME, env.get(ENV_MONGO_DB_NAME));
        }
        if (env.containsKey(ENV_MONGO_TABLE_PREFIX)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MONGO_TABLE_PREFIX);
            result.put(MONGO_TABLE_PREFIX, env.get(ENV_MONGO_TABLE_PREFIX));
        }

        if (env.containsKey(ENV_MONGO_USER)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MONGO_USER);
            result.put(MONGO_USER, env.get(ENV_MONGO_USER));
        }

        if (env.containsKey(ENV_MONGO_AUTH)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MONGO_AUTH);
            String rawValue = env.get(ENV_MONGO_AUTH);
            result.put(MONGO_USE_AUTH, "false".equals(rawValue));
        }

        if (env.containsKey(ENV_MONGO_PASSWORD)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_MONGO_PASSWORD);
            result.put(MONGO_PASSWORD, env.get(ENV_MONGO_PASSWORD));
        }

        if (env.containsKey(ENV_JWT_PASSWORD)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_JWT_PASSWORD);
            result.put(JWT_PASSWORD, env.get(ENV_JWT_PASSWORD));
        }


        if (env.containsKey(ENV_IMAGE_FOLDER_USER)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_IMAGE_FOLDER_USER);
            result.put(IMAGE_FOLDER_USER, env.get(ENV_IMAGE_FOLDER_USER));
        }
        if (env.containsKey(ENV_IMAGE_FOLDER_APPS)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_IMAGE_FOLDER_APPS);
            result.put(IMAGE_FOLDER_APPS, env.get(ENV_IMAGE_FOLDER_APPS));
        }
        if (env.containsKey(ENV_VERSION_FOLDER_APPS)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_VERSION_FOLDER_APPS);
            result.put(VERSION_FOLDER, env.get(ENV_VERSION_FOLDER_APPS));
        }

        if (env.containsKey(ENV_DB_ENCRYPTION_KEY)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_DB_ENCRYPTION_KEY);
            result.put(DB_ENCRYPTION_KEY, env.get(ENV_DB_ENCRYPTION_KEY));
        }


        if (env.containsKey(ENV_CLIENT_API_KEY)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_CLIENT_API_KEY);
            result.put(CLIENT_API_KEY, env.get(ENV_CLIENT_API_KEY));
        }



        if (env.containsKey(ENV_DEPLOYMENT)) {
            logger.warn("mergeEncIntoConfig() > " + ENV_DEPLOYMENT);
            result.put(DEPLOYMENT, env.get(ENV_DEPLOYMENT));
        }

        return result;
    }


    public static String getAdminEmail(JsonObject mergedConfig, String defaultAdmin) {
        return mergedConfig.getString(ADMIN_EMAIL, defaultAdmin);
    }

    public static String getAdminPassword(JsonObject mergedConfig) {
        return mergedConfig.getString(ADMIN_PASSWORD);
    }
}


