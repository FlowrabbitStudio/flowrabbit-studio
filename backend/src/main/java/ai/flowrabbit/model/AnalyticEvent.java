package ai.flowrabbit.model;

import io.vertx.core.json.JsonObject;

public class AnalyticEvent extends Model {

    public static final String CREATED = "created";

    public static final String SCREEN = "screen";

    public static final String TYPE = "type";

    public static final String WIDGET = "widget";

    public static final String ORG = "org";

    public static JsonObject newerThan(long date, String type){
        return new JsonObject()
                .put(AnalyticEvent.CREATED,  new JsonObject().put("$gte", date))
                .put(AnalyticEvent.TYPE, type);
    }

    public static JsonObject newerThan(long date){
        return new JsonObject()
                .put(AnalyticEvent.CREATED,  new JsonObject().put("$gte", date));
    }

    public static JsonObject in(long from, long end){
        return new JsonObject()
                .put(AnalyticEvent.CREATED,  new JsonObject().put("$gte", from).put("$lte", end));
    }

    public static JsonObject inType(long from, long end, String type){
        return new JsonObject()
                .put(AnalyticEvent.CREATED,  new JsonObject().put("$gte", from).put("$lte", end))
                .put(AnalyticEvent.TYPE, type);
    }


    public static JsonObject inOrg(long from, long end, String org){
        return new JsonObject()
                .put(AnalyticEvent.CREATED,  new JsonObject().put("$gte", from).put("$lte", end))
                .put(AnalyticEvent.ORG, org);
    }

}
