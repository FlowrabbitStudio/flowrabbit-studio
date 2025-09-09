package ai.flowrabbit.model;

import io.vertx.core.json.JsonObject;

public class RequestEvent extends Model {

    public static final String CREATED = "created";

    public static final String DURATION = "duration";

    public static final String PATH = "path";

    public static final String MAX = "max";

    public static final String MIN = "min";

    public static final String MEAN = "mean";

    public static final String COUNT = "count";

    public static final String SUM = "sum";


    public static JsonObject newerThan(long date){
        return new JsonObject()
                .put(RequestEvent.CREATED,  new JsonObject().put("$gte", date));
    }

    public static JsonObject in(long from, long end){
        return new JsonObject()
                .put(RequestEvent.CREATED,  new JsonObject().put("$gte", from).put("$lte", end));
    }

}
