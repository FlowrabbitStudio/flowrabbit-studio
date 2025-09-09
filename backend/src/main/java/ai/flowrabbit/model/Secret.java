package ai.flowrabbit.model;

import ai.flowrabbit.services.BlowFishService;
import ai.flowrabbit.services.EncryptionService;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Secret extends Model{

    private static Logger logger = LoggerFactory.getLogger(Secret.class);

    public static String FIELD_SECRET_NAME = "name";

    public static String FIELD_SECRET_VALUE = "value";

    public static String FIELD_SECRET_DOMAIN = "domain";

    public static String FIELD_SECRET_PRICE_IN_CENTY_CENT_REQUEST = "pricing";

    public static String FIELD_SECRET_PRICE_IN_CENTY_CENT_QUANTITY = "pricingQuantity";

    public static String FIELD_VERSION = "version";

    public static String FIELD_LAST_UPDATED = "lastUpdated";

    public static String FIELD_CREATED = "created";

    public static int MAX_PRICE = 1000000;

    public static int computePrice(double quantity, int pricePerQuantity) {
        return (int) Math.ceil(pricePerQuantity * quantity);
    }


    public static int getPrice(JsonObject secret, double quantity) {
        if (quantity > 0 && secret.containsKey(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_QUANTITY)) {
            int price = secret.getInteger(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_QUANTITY, MAX_PRICE);
            logger.debug("getPrice() >  {} * {}", quantity, price );
            return computePrice(quantity, price);
        } else {
            return secret.getInteger(Secret.FIELD_SECRET_PRICE_IN_CENTY_CENT_REQUEST, MAX_PRICE);
        }
    }


    public static JsonObject decryptSecret(JsonObject secret, EncryptionService encryptionService) throws Exception {
        String value = secret.getString(FIELD_SECRET_VALUE);
        if (value != null && !value.isEmpty()) {
            String encrypted = encryptionService.decrypt(value);
            secret.put(FIELD_SECRET_VALUE, encrypted);
        } else {
            logger.error("decryptSecret() > could not decrypt  {}", secret.getString(FIELD_SECRET_NAME));
        }
        return secret;
    }

    public static JsonObject encryptSecret(JsonObject secret,  EncryptionService encryptionService) throws Exception {
        String encrypted = secret.getString(AppSecrets.FIELD_SECRET_VALUE);
        String value = encryptionService.encrypt(encrypted);
        secret.put(AppSecrets.FIELD_SECRET_VALUE, value);
        return secret;
    }

    public static JsonObject findByName(String name){
        return new JsonObject().put(FIELD_SECRET_NAME, name);
    }


}
