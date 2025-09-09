package ai.flowrabbit;

import ai.flowrabbit.util.MongoIndexUtil;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@RunWith(VertxUnitRunner.class)
public class MongoIndexUtilTest extends BaseTestCase {


    @Test
    public void testGet(TestContext context) throws InterruptedException {

        CountDownLatch latch = new CountDownLatch(1);
        MongoIndexUtil.getIndexes(mongo, result -> {
            print(result);
            context.assertNotNull(result);
            latch.countDown();
        });
        latch.await(1000, TimeUnit.MILLISECONDS);
    }

    @Test
    public void testCreate(TestContext context) throws InterruptedException {

        CountDownLatch latch = new CountDownLatch(1);
        MongoIndexUtil.createIndexes(mongo, result -> {
            print(result);
            context.assertNotNull(result);
            latch.countDown();
        });
        latch.await(1000, TimeUnit.MILLISECONDS);


    }
}
