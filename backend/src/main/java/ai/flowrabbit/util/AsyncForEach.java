package ai.flowrabbit.util;

import io.vertx.core.Handler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;


public class AsyncForEach<T> implements AsyncForEachExecute<T>, ASyncForEachThen<T> {

    private final Logger logger = LoggerFactory.getLogger(AsyncForEach.class);
    private final List<T> list;

    private AsyncMethod<T> method;

    private Handler<Boolean> done;

    private boolean fired= false;

    private T item;

    public interface AsyncMethod<T> {
        void run(T item, Handler<Boolean> next);
    }

    public AsyncForEach (List<T> list) {
        this.list = list;
    }

    public ASyncForEachThen<T> execute(AsyncMethod<T> method) {
        this.method = method;
        return this;
    }

    public void then(Handler<Boolean> done) {
        this.done = done;
        this.next();
    }

    private void next() {
        if (fired) {
            logger.error("next() > Called after FIRED > " + this.item);
            return;
        }
        if (list.isEmpty()) {
            done.handle(true);
            this.fired = true;
        } else {
            this.item = list.remove(0);
            try {
                method.run(item, result -> {
                    this.next();
                });
            } catch (Exception err) {
                err.printStackTrace();
                this.next();
            }
        }
    }

    public static <T> AsyncForEachExecute<T> forEach(List<T> list){
        return new AsyncForEach(list);
    }
}
