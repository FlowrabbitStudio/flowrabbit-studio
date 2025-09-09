package ai.flowrabbit.util;

import io.vertx.core.Handler;

public interface ASyncForEachThen<T> {
    void then(Handler<Boolean> done);
}
