package ai.flowrabbit.services;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public interface IVersionService {

    void copyFile(Vertx vertx, String appID, String version, String path);

    void writeJSON(Vertx vertx, String appID, String version, String name, JsonObject data);

    void getFile(RoutingContext event, String appID, String version, String name);
}
