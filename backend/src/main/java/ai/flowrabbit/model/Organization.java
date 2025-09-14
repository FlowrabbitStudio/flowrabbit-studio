package ai.flowrabbit.model;

import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.Util;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class Organization extends Model{

    private static final Logger logger = LoggerFactory.getLogger(Organization.class);

    public static String STATUS_ACTIVE = "active";

    public static String STATUS_BLOCKED = "blocked";

    public static final String DEFAULT_ID = "private";

    public static final String DEFAULT_NAME = "private";

    public static final String FIELD_NAME = "name";

    public static final String FIELD_FOLDERS = "folders";

    public static final String FIELD_DOMAINS = "domains";

    public static final String FIELD_DISPLAY_NAME = "displayName";

    public static final String FIELD_IS_AUTO_ORG = "isAuto";

    public static final String FIELD_STATUS = "status";

    public static final String FIELD_CREDITS_IN_MICRO_CENT = "creditsInMicroCent";

    public static final String FIELD_ADDITIONAL_CREDITS_IN_MICRO_CENTS = "additionalCreditsInMicroCent";

    public static long DEFAUlT_CREDITS = 0;

    public static JsonObject create(
            String name, // acts as the kind of id in the urls
            String displayName,
            long creditsInCentiCent
    ) {
        return new JsonObject()
                .put(FIELD_NAME, name)
                .put(FIELD_DISPLAY_NAME, displayName)
                .put(FIELD_ADDITIONAL_CREDITS_IN_MICRO_CENTS, 0)
                .put(FIELD_CREDITS_IN_MICRO_CENT, creditsInCentiCent)
                .put(FIELD_IS_AUTO_ORG, true)
                .put(FIELD_STATUS, STATUS_ACTIVE)
                .put(FIELD_CREATED, System.currentTimeMillis());
    }

    public static boolean isBlocked(JsonObject org) {
        return STATUS_BLOCKED.equals(org.getString(FIELD_STATUS));
    }

    public static int getTotalBudget(JsonObject org) {
        return getCredits(org) + getAdditionalCredits(org);
    }

    public static int getCredits(JsonObject org){
        if (!org.containsKey(FIELD_CREDITS_IN_MICRO_CENT)) {
            org.put(FIELD_CREDITS_IN_MICRO_CENT, 0);
        }
        return org.getInteger(FIELD_CREDITS_IN_MICRO_CENT);
    }

    public static int getAdditionalCredits(JsonObject org){
        if (!org.containsKey(FIELD_ADDITIONAL_CREDITS_IN_MICRO_CENTS)) {
            org.put(FIELD_ADDITIONAL_CREDITS_IN_MICRO_CENTS, 0);
        }
        return org.getInteger(FIELD_ADDITIONAL_CREDITS_IN_MICRO_CENTS);
    }

    public static JsonObject deductCredits(JsonObject org, int price) {
        JsonObject update = org.copy();
        int credits = Organization.getCredits(org);
        int additionalCredits = Organization.getAdditionalCredits(org);

        credits -= price;
        if (credits < 0) {
            additionalCredits -= Math.abs(credits);
            credits = 0;
        }

        update.put(Organization.FIELD_CREDITS_IN_MICRO_CENT, credits);
        update.put(Organization.FIELD_ADDITIONAL_CREDITS_IN_MICRO_CENTS, additionalCredits);

        logger.info("deductCredits() > Dec to {} /{} centi-cent for {}", credits, additionalCredits, org.getString("_id"));
        return update;
    }



    public static boolean hasOrgBudgetLeft(JsonObject org, JsonObject secret, double quantity) {

        if (quantity > 0 && secret.containsKey(Secret.FIELD_SECRET_PRICE_QUANTITY_IN_MICRO_CENT)) {
            int totalCredits = getTotalBudget(org);
            int pricePerQuantity = secret.getInteger(Secret.FIELD_SECRET_PRICE_QUANTITY_IN_MICRO_CENT);
            int price = Secret.calculatePriceInMicroCent(quantity, pricePerQuantity);
            logger.info("hasOrgBudgetLeft() credits: {} > quantity: {} > price: {}", totalCredits, quantity, price);
            return totalCredits - price >= 0;
        }

        if (secret.containsKey(Secret.FIELD_SECRET_PRICE_REQUEST_IN_MICRO_CENT)) {
            int totalCredits = getTotalBudget(org);
            int price = secret.getInteger(Secret.FIELD_SECRET_PRICE_REQUEST_IN_MICRO_CENT);
            logger.info("hasOrgBudgetLeft() credits with default: {} > price: {}", totalCredits, price);
            return totalCredits - price >= 0;
        }
        return false;
    }


    public static JsonObject findByName(String name){
        return new JsonObject()
                .put("name",name);
    }

    public static JsonObject findByName(Collection<String> list){
        JsonArray names = new JsonArray();
        for (String id : list) {
            names.add(id);
        }
        return new JsonObject()
                .put("name", new JsonObject().put("$in", names));
    }

    public static JsonObject findByIds(List<String> list){
        JsonArray ids = new JsonArray();
        for (String id : list) {
            ids.add(id);
        }
        return new JsonObject()
                .put("_id", new JsonObject().put("$in", ids));
    }

    public static JsonObject findByDomain(String domain){
        return new JsonObject()
                .put(FIELD_DOMAINS, domain);
    }




    public static void suggestDomainNameAsUUID(MongoClient mongo, int max, Handler<String> callback) {

        String organizationDB = DB.getTable(Organization.class);
        Set<String> candidates = new LinkedHashSet<>(); // linked to maintain order;
        for (int i=1; i < max; i++) {
            candidates.add(Util.getUUID());
        }
        mongo.find(organizationDB, findByName(candidates), res-> {
            if (res.succeeded()) {
                Set<String> found = getOrgNames(res.result());
                for (String candidate : candidates) {
                    if (found.contains(candidate)) {
                        logger.error("suggestDomainName() > found {}", candidate);
                    } else {
                        callback.handle(candidate);
                        return;
                    }
                }
                logger.error("suggestDomainName() > All candidates taken");
                String random = Util.getRandomString();
                callback.handle(random);
            }
        });
    }

    public static Set<String> getOrgNames(List<JsonObject> orgs) {
        Set<String> names = new HashSet<>();
        for (JsonObject o : orgs) {
            names.add(o.getString(Organization.FIELD_NAME));
        }
        return names;
    }

    public static Set<String> getOrgDisplayNames(List<JsonObject> orgs) {
        Set<String> names = new HashSet<>();
        for (JsonObject o : orgs) {
            names.add(o.getString(Organization.FIELD_DISPLAY_NAME));
        }
        return names;
    }

    public static String suggestDisplayName(String email) {
        String localPart = email.split("@")[0];
        String[] words = localPart.split("[^a-zA-Z0-9]+");
        StringBuilder nameBuilder = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                nameBuilder.append(makeCap(word));
            }
        }
        return nameBuilder.toString().trim();
    }

    private static String makeCap(String str) {
        if (str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    public static String getDisplayName(JsonObject organization) {
        if (organization.containsKey(FIELD_DISPLAY_NAME)) {
            return organization.getString(FIELD_DISPLAY_NAME);
        }
        return organization.getString(FIELD_NAME);
    }
}
