package ai.flowrabbit;

import ai.flowrabbit.model.Secret;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class AdminSecretRestTest extends BaseTestCase {


    @Test
    public void testCRUD(TestContext context) {
        log("testCRUD", "enter");

        cleanUp();
        deploy(new Main(), context);

        JsonObject admin = this.createAdmin(context);

        JsonArray secrets = this.adminFindSecrets(context);
        context.assertEquals(0, secrets.size());

        JsonObject sec1 = createSecret(context, "a", "aaa", "a.com", 1, 2);
        print(sec1);
        context.assertTrue("aaa".equals(sec1.getString(Secret.FIELD_SECRET_VALUE)));


        JsonObject dbSec = this.client.findOne(DB.getTable(Secret.class), Secret.findById(sec1.getString("id")));
        context.assertFalse("aaa".equals(dbSec.getString(Secret.FIELD_SECRET_VALUE)));
        print(dbSec);

        secrets = this.adminFindSecrets(context);
        context.assertEquals(1, secrets.size());
        context.assertEquals("aaa", secrets.getJsonObject(0).getString(Secret.FIELD_SECRET_VALUE));

        JsonObject sec2 = updateSecret(context, sec1, "bb", "bbb", "bbb.com");
        secrets = this.adminFindSecrets(context);
        context.assertEquals(1, secrets.size());
        context.assertEquals("bbb", secrets.getJsonObject(0).getString(Secret.FIELD_SECRET_VALUE));

        createSecret(context, "c", "ccc", "c.com", 1, 11);
        createSecret(context, "d", "ddd", "d.com", 2, 22);

        deleteSecret(context, sec2);
        secrets = this.adminFindSecrets(context);
        context.assertEquals(2, secrets.size());

        logout();

        assertListError( "/rest/admin/secrets.json", 404, context);
    }




}
