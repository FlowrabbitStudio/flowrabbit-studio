package ai.flowrabbit;

import ai.flowrabbit.services.FSVersionService;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class VersionServiceTest extends BaseTestCase {


    @Test
    public void test_FSVersionService(TestContext context) {
        log("test_FSVersionService", "enter");

        cleanUp();
        FileSystem fs = vertx.fileSystem();
        if (fs.existsBlocking("test/versions")) {
            log("test_FSVersionService", "clean");
            fs.deleteRecursiveBlocking("test/versions", true);
        }

        FSVersionService s = new FSVersionService("test/versions");
        s.writeJSON(this.vertx, "myapp", "1", "app.json", new JsonObject().put("foo", "bar"));
        s.copyFile(vertx , "myapp", "1", "src/test/resources/test.png");

        context.assertTrue(fs.existsBlocking("test/versions/myapp/1/app.json"));
        context.assertTrue(fs.existsBlocking("test/versions/myapp/1/test.png"));

        log("test_FSVersionService", "exit");
    }


}
