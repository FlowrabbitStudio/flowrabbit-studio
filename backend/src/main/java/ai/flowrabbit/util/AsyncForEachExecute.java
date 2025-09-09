package ai.flowrabbit.util;

public interface AsyncForEachExecute<T> {

    ASyncForEachThen<T> execute(AsyncForEach.AsyncMethod<T> method);
}
