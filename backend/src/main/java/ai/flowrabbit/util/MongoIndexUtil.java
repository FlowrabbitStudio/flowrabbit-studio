package ai.flowrabbit.util;

import ai.flowrabbit.model.*;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class MongoIndexUtil {

    private static Logger logger = LoggerFactory.getLogger(MongoIndexUtil.class);



    public static void getIndexes(MongoClient client, Handler<JsonObject> handler) {
        client.getCollections(collections->{
            JsonObject result = new JsonObject();
            if(collections.succeeded()){
                List<String> names = collections.result();

                AsyncForEach.forEach(names).execute((name, next) -> {
                    getIndex(client, name , found -> {
                        result.put(name, found);
                        next.handle(true);
                    });
                }).then(done -> {
                    handler.handle(result);
                });

            } else {
                logger.error("getIndexes() > could not get collections", collections.cause());
                handler.handle(result);
            }
        });
    }

    private static void getIndex(MongoClient client, String collection, Handler<JsonObject> handler ){

        JsonObject command = new JsonObject()
                .put("listIndexes",collection);

        client.runCommand("listIndexes", command, res -> {

            JsonObject result = new JsonObject();
            result.put("collection",collection);

            if (res.succeeded()) {
                JsonArray indexNames = new JsonArray();
                try {
                    JsonArray indexes = res.result().getJsonObject("cursor").getJsonArray("firstBatch");
                    for (int i=0; i < indexes.size(); i++) {
                        JsonObject index = indexes.getJsonObject(i);
                        indexNames.add(index.getString("name"));
                    }
                    result.put("indexes" , indexNames);
                } catch (Exception err) {
                    logger.error("getIndex() Could not parse {}", collection);
                    result.put("error", "Could not parse");
                }
            } else {
                logger.error("getIndex() Could not read {}", collection);
                result.put("error", res.cause().getMessage());
            }

            handler.handle(result);
        });
    }

    public static void createIndexes(MongoClient client, Handler<JsonObject> handler) {

        List<MongoIndex> indexes = getIndexToBeCreated();
        JsonObject result = new JsonObject();
        AsyncForEach.forEach(indexes).execute((index, next) -> {
            createIndex(client, index.getCollection(), index.getFields() , found -> {
                result.put(index.collection, found);
                next.handle(true);
            });
        }).then(done -> {
            handler.handle(result);
        });
    }



    private static void createIndex(
            MongoClient client,
            String collection,
            String[] fields,
            Handler<JsonObject> handler
    ) {
        JsonObject keys = new JsonObject();
        for (String field : fields) {
            keys.put(field, 1);
        }

        String name = getIndexName(collection, fields);

        JsonObject index = new JsonObject()
                .put("key",keys)
                .put("name", name);

        JsonObject command = new JsonObject()
                .put("createIndexes", collection)
                .put("indexes", new JsonArray().add(index));

        client.runCommand("createIndexes", command, created -> {
            JsonObject result = new JsonObject();
            if (created.succeeded() && created.result() != null) {
                logger.info("createIndexes() > Suscess " + collection + " " + fields);
                result.put("name", name);
                result.put("collection", collection);
                result.put("none", created.result().getString("note"));
            } else {
               logger.error("createIndex() > Some error",created.cause());
            }
            handler.handle(result);
        });

    }

    private static String getIndexName(String collection, String[] fields) {
        String name = collection;
        for (String field : fields) {
            name += "_"+field;
        }
        return name;
    }

    private static List<MongoIndex>  getIndexToBeCreated() {
        List<MongoIndex> indexes = new ArrayList<>();

        indexes.add(new MongoIndex(Organization.class, "name"));
        indexes.add(new MongoIndex(Organization.class, "domains"));

        indexes.add(new MongoIndex(App.class, "isPublic"));
        indexes.add(new MongoIndex(App.class, "isDirty"));

        indexes.add(new MongoIndex(Comment.class, "appID"));

        indexes.add(new MongoIndex(Team.class, "userID"));
        indexes.add(new MongoIndex(Team.class, "userID", "permission"));
        indexes.add(new MongoIndex(Team.class, "appID"));
        indexes.add(new MongoIndex(Team.class, "appID", "userID", "permission"));

        indexes.add(new MongoIndex(Image.class, "appID"));

        indexes.add(new MongoIndex(Image.class, "appID"));

        indexes.add(new MongoIndex(AppEvent.class, "created"));
        indexes.add(new MongoIndex(AppEvent.class, "type"));
        indexes.add(new MongoIndex(AppEvent.class, "created", "type"));

        indexes.add(new MongoIndex(CommandStack.class, "appID"));

        indexes.add(new MongoIndex(User.class, "email"));

        indexes.add(new MongoIndex(PerformanceEvent.class, "created"));
        indexes.add(new MongoIndex(AnalyticEvent.class, "created"));
        indexes.add(new MongoIndex(RequestEvent.class, "created"));


        indexes.add(new MongoIndex(OrganizationTeam.class, "userID"));
        indexes.add(new MongoIndex(OrganizationTeam.class, "userID", "orgID"));

        indexes.add(new MongoIndex(PublicationSettings.class, PublicationSettings.FIELD_APP_ID));
        indexes.add(new MongoIndex(PublicationSettings.class, PublicationSettings.FIELD_ORG_ID));
        indexes.add(new MongoIndex(PublicationSettings.class, PublicationSettings.FIELD_NAME, PublicationSettings.FIELD_ORG_ID));
        indexes.add(new MongoIndex(PublicationSettings.class, PublicationSettings.FIELD_STORE));

        indexes.add(new MongoIndex(AppSecrets.class, AppSecrets.APP_ID));

        indexes.add(new MongoIndex(Secret.class, Secret.FIELD_SECRET_NAME));

        indexes.add(new MongoIndex(UserAppData.class, UserAppData.FIELD_USER_ID));
        indexes.add(new MongoIndex(UserAppData.class, UserAppData.FIELD_USER_ID, UserAppData.APP_ID));

        indexes.add(new MongoIndex(AppData.class, AppData.APP_ID));

        return indexes;
    }

    private static class MongoIndex{

        private String collection;

        private String[] fields;

        MongoIndex(Class<? extends Model> cls, String... fields) {
            this.collection = DB.getTable(cls);
            this.fields = fields;
        }

        public String getCollection() {
            return collection;
        }

        public MongoIndex setCollection(String collection) {
            this.collection = collection;
            return this;
        }

        public String[] getFields() {
            return fields;
        }

        public MongoIndex setFields(String[] fields) {
            this.fields = fields;
            return this;
        }
    }
}
