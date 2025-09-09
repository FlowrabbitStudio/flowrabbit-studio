package ai.flowrabbit.model;

import ai.flowrabbit.services.BlowFishService;
import ai.flowrabbit.services.EncryptionService;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AppSecrets extends AppPart{

    private static final Logger logger = LoggerFactory.getLogger(AppSecrets.class);

    /**
     * we have data as {
     *     payload: {
     *         secrets: [
     *              {key: value: domain}
     *         ]
     *     }
     * }
     */

    public static String FIELD_PAYLOAD = "payload";

    public static String FIELD_SECRETS = "secrets";

    public static String FIELD_SECRET_KEY = "key";

    public static String FIELD_SECRET_VALUE = "value";

    public static String FIELD_SECRET_DOMAIN = "domain";

    public static String FIELD_VERSION = "version";

    public static JsonObject decryptSecrets(JsonObject data, EncryptionService encryptionService) throws Exception {
        JsonObject payload = data.getJsonObject(AppSecrets.FIELD_PAYLOAD);
        JsonArray secrets = payload.getJsonArray(AppSecrets.FIELD_SECRETS);

        if (payload.containsKey(AppSecrets.FIELD_VERSION)) {
            for (int i = 0; i < secrets.size(); i++) {
                JsonObject secret = secrets.getJsonObject(i);
                String value = secret.getString(AppSecrets.FIELD_SECRET_VALUE);
                String encrypted = encryptionService.decrypt(value);
                secret.put(AppSecrets.FIELD_SECRET_VALUE,encrypted);
            }
        }

        return payload;
    }

    public static void encryptSecrets(JsonObject payload, EncryptionService encryptionService) throws Exception {
        JsonArray secrets = payload.getJsonArray(AppSecrets.FIELD_SECRETS);
        for (int i=0; i < secrets.size(); i++) {
            JsonObject secret = secrets.getJsonObject(i);
            String encrypted = secret.getString(AppSecrets.FIELD_SECRET_VALUE);
            String value = encryptionService.encrypt(encrypted);
            secret.put(AppSecrets.FIELD_SECRET_VALUE, value);
        }
        payload.put(AppSecrets.FIELD_VERSION, 2);
    }

    public static JsonObject getSecretByName(JsonObject data, String name) {
        if (!data.containsKey(AppSecrets.FIELD_SECRETS)) {
            logger.error("getSecretByName() > no secrets in data");
            return null;
        }
        JsonArray secrets = data.getJsonArray(AppSecrets.FIELD_SECRETS);
        for (int i=0; i < secrets.size(); i++) {
            JsonObject secret = secrets.getJsonObject(i);
            String key = secret.getString(AppSecrets.FIELD_SECRET_KEY);
            if (name.equals(key)) {
                return  secret;
            }
        }
        return null;
    }



}
