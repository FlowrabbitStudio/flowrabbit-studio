package ai.flowrabbit.model;

import io.vertx.core.json.JsonObject;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class OrganizationTeam extends Model{

    public static final String ORG_ID = "orgID";

    public static final String USER_ID = "userID";

    public static final String PERMISSION = "permission";

    public static int NONE = 0;

    public static int USER = 1;

    public static int READ = 2;

    public static int WRITE = 3;

    public static int CLIENT = 4;

    public static int OWNER = 5;

    public static final Map<Integer, String> roleNames;

    static {
        Map<Integer, String> aMap = new HashMap<>();
        aMap.put(NONE, "NONE");
        aMap.put(USER, "USER");
        aMap.put(READ, "READ");
        aMap.put(WRITE, "WRITE");
        aMap.put(CLIENT, "CLIENT");
        aMap.put(OWNER, "OWNER");
        roleNames = Collections.unmodifiableMap(aMap);
    }

    public static JsonObject create(String userID, String orgID, int permission){
        return new JsonObject()
                .put(USER_ID, userID)
                .put(ORG_ID, orgID)
                .put(PERMISSION, permission);
    }

    public static String getRoleName(JsonObject team) {
        int role = team.getInteger(OrganizationTeam.PERMISSION, 0);
        return roleNames.get(role);
    }

    public static JsonObject create(User user, String orgID, int permission){
        return create(user.getId(), orgID, permission);
    }

    public static JsonObject canRead(User user, String orgID) {
        return new JsonObject()
                .put(ORG_ID, orgID)
                .put(USER_ID , user.getId())
                .put(PERMISSION, new JsonObject().put("$gte", READ));

    }

    public static JsonObject canWrite(User user, String orgID) {
        return new JsonObject()
                .put(ORG_ID, orgID)
                .put(USER_ID , user.getId())
                .put(PERMISSION, new JsonObject().put("$gte", WRITE));

    }

    public static JsonObject isOwner(User user, String orgID) {
        return new JsonObject()
                .put(ORG_ID, orgID)
                .put(USER_ID , user.getId())
                .put(PERMISSION, new JsonObject().put("$gte", OWNER));

    }

    public static JsonObject findByUser(String userID){
        return new JsonObject()
                .put(USER_ID,  userID)
                .put(PERMISSION, new JsonObject().put("$gte", READ));

    }

    public static JsonObject findByReaderAndOrg(User user, String orgID) {
        return findByReaderAndOrg(user.getId(), orgID);
    }

    public static JsonObject findByReaderAndOrg(String userID, String orgID){
        return new JsonObject()
                .put(USER_ID,  userID)
                .put(ORG_ID,  orgID)
                .put(PERMISSION, new JsonObject().put("$gte", READ));
    }

    public static JsonObject findByUserAndOrg(String userID, String orgID){
        return new JsonObject()
                .put(USER_ID,  userID)
                .put(ORG_ID,  orgID);
    }

    public static JsonObject findByUserAndOrg(User user, String orgID, int permission) {
        return findByUserAndOrg(user.getId(), orgID, permission);
    }
    public static JsonObject findByUserAndOrg(String userID, String orgID, int permission){
        return new JsonObject()
                .put(USER_ID,  userID)
                .put(ORG_ID,  orgID)
                .put(PERMISSION, new JsonObject().put("$gte", permission));
    }

    public static JsonObject findByOwnerAndOrg(String userID, String orgID){
        return new JsonObject()
                .put(USER_ID,  userID)
                .put(ORG_ID,  orgID)
                .put(PERMISSION, new JsonObject().put("$gte", OWNER));
    }

    public static JsonObject findByOrg(String orgID){
        return new JsonObject()
                .put(ORG_ID,orgID);
    }




}
