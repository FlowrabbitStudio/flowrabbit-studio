package ai.flowrabbit.util;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class MongoPaging {

    private static final Logger logger = LoggerFactory.getLogger(MongoPaging.class);

    private long count = -1;

    private long limit = 50;

    private long offset = 0;

    private JsonArray items = new JsonArray();

    public MongoPaging() {

    }

    public static void run(MongoClient db, RoutingContext event, Class<?> model, String ... queryKeys) {
        MongoPaging result = new MongoPaging();
        String table = DB.getTable(model);
        JsonObject query = getQuery(event, queryKeys);

        db.count(table, query, res -> {
            if (res.succeeded()) {
                long count = res.result();
                result.setCount(count);

                try {

                    int offset = getParamAInt(event, "offset", 0);
                    int limit = getParamAInt(event, "limit", 100);
                    result.setLimit(limit);
                    result.setOffset(offset);
                    FindOptions options = new FindOptions();
                    options.setLimit(limit);
                    options.setSkip(offset);

                    String sortBy = event.request().getParam("sortBy");
                    if (sortBy != null) {
                        int order =  getParamAInt(event, "order", 1);
                        JsonObject sort = new JsonObject().put(sortBy, order);
                        options.setSort(sort);
                    }

       

                    logger.error("run() > offset:" + offset + " > limit:" + limit + " > count:" + count + " > query:" + query.encode());
                    db.findWithOptions(table, query, options, found -> {
                        if (found.succeeded()) {
                            List<JsonObject> items = found.result();
                            for (JsonObject o : items) {
                                o.put("id", o.getString("_id"));
                                o.remove("_id");
                                result.add(o);
                            }
                            returnJson(event, result.toJSON());
                        } else {
                            logger.error("findPaging() > Param error", found.cause());
                            returnError(event, 405);
                        }
                    });

                } catch (Exception e) {
                    logger.error("findPaging() > Param error", e);
                    returnError(event, 405);
                }

            } else {
                logger.error("findPaging() > Mongo error", res.cause());
                returnError(event, 405);
            }
        });
    }

    private static JsonObject getQuery(RoutingContext event, String[] queryKeys) {
        JsonObject query = new JsonObject();
        for (String key : queryKeys) {
            String value = event.request().getParam(key);
            if (value != null) {
                query.put(key, new JsonObject().put("$regex", value));
            }
        }
        return query;
    }

    protected static void returnError(RoutingContext event, int code) {
        event.response().setStatusCode(code);
        event.response().end();
    }

    protected static void returnJson(RoutingContext event, JsonObject result){
        event.response().putHeader("content-type", "application/json");
        event.response().end(result.encodePrettily());
    }

    private static int getParamAInt(RoutingContext event, String key, int defaultValue) {
        String offset = event.request().getParam(key);
        if (offset != null) {
            return Integer.parseInt(offset);
        }
        return defaultValue;
    }

    public JsonObject toJSON() {
        return new JsonObject()
                .put("offset", offset)
                .put("limit", limit)
                .put("count", count)
                .put("items", items);
    }

    public long getCount() {
        return count;
    }

    public MongoPaging setCount(long count) {
        this.count = count;
        return this;
    }

    public long getOffset() {
        return offset;
    }

    public MongoPaging setOffset(long offset) {
        this.offset = offset;
        return this;
    }

    public long getLimit() {
        return limit;
    }

    public MongoPaging setLimit(long limit) {
        this.limit = limit;
        return this;
    }

    public JsonArray getItems() {
        return items;
    }

    public MongoPaging setItems(JsonArray items) {
        this.items = items;
        return this;
    }

    public MongoPaging add(JsonObject o) {
        this.items.add(o);
        return this;
    }
}
