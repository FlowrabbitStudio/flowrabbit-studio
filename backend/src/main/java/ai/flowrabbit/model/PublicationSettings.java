package ai.flowrabbit.model;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.Set;

public class PublicationSettings extends AppPart{

    public static final String MODE_FORBIDDEN = "forbidden";
    public static final String MODE_TEAM = "team";
    public static final String MODE_PUBLIC = "public";
    public static final String MODE_ORGANIZATION = "organization";

    public static final String MODE_PASSWORD = "password";
    public static final String FIELD_VERSIONS = "versions";
    public static final String FIELD_CURRENT_VERSION = "current";

    public static final String FIELD_PREVIEWS = "previews";

    public static final String FIELD_ORG_ID = "orgID";
    public static final String FIELD_APP_ID = "appID";
    public static final String FIELD_MODE = "mode";
    public static final String FIELD_NAME = "name";
    public static final String FIELD_STORE = "store";

    public static final String FIELD_STORE_METERING_MODE = "meteringMode";
    public static final String FIELD_PASSWORD = "password";

    public static final String METERING_BY_PURCHASE = "purchase";

    public static final String METERING_BY_USAGE = "usage";

    public static JsonObject findByNameAndOrg(String name, String orgID){
        return new JsonObject()
                .put("name",name)
                .put("orgID", orgID);
    }

    public static JsonObject findByOrg(String orgID){
        return new JsonObject()
                .put("orgID", orgID);
    }

    public static JsonObject findByOrgAndPublic(String orgID){
        return new JsonObject()
                .put("orgID", orgID)
                .put(FIELD_MODE, new JsonObject().put("$ne", MODE_FORBIDDEN));
    }



    public static JsonObject createInstance(String appID){
        return new JsonObject()
                .put(FIELD_NAME, "")
                .put(FIELD_APP_ID, appID)
                .put(FIELD_MODE, PublicationSettings.MODE_FORBIDDEN)
                .put(FIELD_ORG_ID, Organization.DEFAULT_ID)
                .put(FIELD_CURRENT_VERSION, -1)
                .put(FIELD_VERSIONS, new JsonArray());
    }

    public static JsonObject createInstance(String appID, String orgID){
        return new JsonObject()
                .put(FIELD_NAME, "")
                .put(FIELD_APP_ID, appID)
                .put(FIELD_MODE, PublicationSettings.MODE_FORBIDDEN)
                .put(FIELD_ORG_ID, orgID)
                .put(FIELD_CURRENT_VERSION, -1)
                .put(FIELD_VERSIONS, new JsonArray());
    }

    public static JsonObject findByApps(Set<String> ids) {
        JsonArray temp = new JsonArray();
        for (String id : ids) {
            temp.add(id);
        }
        return new JsonObject().put(FIELD_APP_ID, new JsonObject().put("$in", temp));
    }

    public static JsonObject findByAppsAndOrg(Set<String> ids, String ordID) {
        JsonArray temp = new JsonArray();
        for (String id : ids) {
            temp.add(id);
        }
        return new JsonObject().put(FIELD_APP_ID, new JsonObject().put("$in", temp).put(FIELD_ORG_ID, ordID));
    }


    public static JsonObject findByAppIds(JsonArray ids){
        return new JsonObject().put(FIELD_APP_ID, new JsonObject().put("$in", ids));
    }


    public static List<JsonObject> clean(List<JsonObject> settings){
        for (JsonObject s : settings){
            s.put("id", s.getString("_id"));
            s.remove(PublicationSettings.FIELD_ORG_ID);
            s.remove(PublicationSettings.FIELD_PASSWORD);
            s.remove(PublicationSettings.FIELD_MODE);
            s.remove(PublicationSettings.FIELD_VERSIONS);
            s.remove(PublicationSettings.FIELD_CURRENT_VERSION);
        }
        return settings;
    }


    public static boolean isPurchase(JsonObject settings) {
        if (settings.containsKey(FIELD_STORE)) {
            JsonObject store = settings.getJsonObject(FIELD_STORE);
            String meteringMode = store.getString(FIELD_STORE_METERING_MODE);
            return METERING_BY_PURCHASE.equals(meteringMode);
        }
        return false;
    }
}
