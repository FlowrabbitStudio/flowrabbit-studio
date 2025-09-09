package ai.flowrabbit.model;

import io.vertx.core.json.JsonObject;

public class UserAppData extends AppPart{

    public static final String FIELD_APP_ID = APP_ID;

    public static final String FIELD_CREATED = "created";

    public static final String FIELD_LAST_UPDATE = "lastUpdate";
    public static final String FIELD_USER_ID = USER_ID;

    public static final String FIELD_PAYLOAD = "payload";

    public static JsonObject findByAppAndUser (String appID, String userID) {
        return new JsonObject()
                .put(FIELD_APP_ID, appID)
                .put(FIELD_USER_ID, userID);
    }

    public static JsonObject createInstance(User user) {
        return new JsonObject()
                .put(FIELD_APP_ID, user.getAppID())
                .put(FIELD_USER_ID, user.getId())
                .put(FIELD_PAYLOAD, new JsonObject())
                .put(FIELD_LAST_UPDATE, System.currentTimeMillis())
                .put(FIELD_CREATED, System.currentTimeMillis());
    }
}
