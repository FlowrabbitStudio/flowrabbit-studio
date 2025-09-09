package ai.flowrabbit.model;

import io.vertx.core.json.JsonObject;

import java.text.SimpleDateFormat;
import java.util.Date;

public interface APICalls {

    String FIELD_API_CALLS = "apiCalls";

    String FIELD_MAX_API_CALLS = "maxApiCalls";

    String FIELD_CURRENT_API_CALLS = "currentApiCalls";

    String FIELD_ANALYTICS = "analytics";

    public SimpleDateFormat simpleDateFormat = new SimpleDateFormat("MM-yyyy");

    static void incAnalytics(JsonObject jsonObject, long amount) {
        JsonObject analytics = getAnalytics(jsonObject);
        String key = getMonthYear();
        if (!analytics.containsKey(key)) {
            analytics.put(key, 0);
        }
        long oldCurrent = analytics.getLong(key);
        long newCurrent = oldCurrent + amount;
        analytics.put(key, newCurrent);
    }

    public static String getMonthYear() {
        String key = simpleDateFormat.format(new Date());
        return key;
    }

    public static JsonObject getAnalytics(JsonObject jsonObject){
        if (!jsonObject.containsKey(APICalls.FIELD_ANALYTICS)) {
            jsonObject.put(APICalls.FIELD_ANALYTICS, new JsonObject());
        }
        JsonObject analytics = jsonObject.getJsonObject(APICalls.FIELD_ANALYTICS);
        return analytics;
    }

    static void resetCurrent(JsonObject jsonObject){
        if (!jsonObject.containsKey(APICalls.FIELD_API_CALLS)) {
            jsonObject.put(APICalls.FIELD_API_CALLS, new JsonObject());
        }
        JsonObject apiCalls = jsonObject.getJsonObject(APICalls.FIELD_API_CALLS);
        for (String field : apiCalls.fieldNames()) {
            JsonObject counter = apiCalls.getJsonObject(field);
            counter.put(FIELD_CURRENT_API_CALLS, 0);
        }
    }

    static JsonObject getCallCounter(JsonObject jsonObject, String name) {
        if (!jsonObject.containsKey(APICalls.FIELD_API_CALLS)) {
            jsonObject.put(APICalls.FIELD_API_CALLS, new JsonObject());
        }
        JsonObject apiCalls = jsonObject.getJsonObject(APICalls.FIELD_API_CALLS);
        if (!apiCalls.containsKey(name)) {
            apiCalls.put(name, new JsonObject().put(FIELD_CURRENT_API_CALLS, 0));
        }

        JsonObject callCounter = apiCalls.getJsonObject(name);
        return callCounter;
    }
}
