package ai.flowrabbit;

import ai.flowrabbit.backup.BackupService;
import ai.flowrabbit.backup.FileSystemBackupStorage;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import org.junit.Assert;

import java.util.List;


//@RunWith(VertxUnitRunner.class)
public class BackupServiceS3Test extends BackupServiceBaseTest{


    //@Test
    public void testRestore(TestContext context) throws Exception {
        log("testRestore", "enter");

        cleanUp();
        //setupS3();

        deploy(new Main(), context);

        User klaus = postUser("klaus", context);
        User bernd = postUser("bernd", context);
        App app = setupApp(context, klaus, bernd);

        List<JsonObject> apps = client.find(DB.getTable(App.class), App.all());
        List<JsonObject> users = client.find(DB.getTable(User.class), User.all());
        Assert.assertEquals(1, apps.size());
        Assert.assertTrue(users.size() >= 2);

        FileSystemBackupStorage fsStorage = new FileSystemBackupStorage("test/backup/");


        BackupService backup = new BackupService(mongo, conf.getString("image.folder.apps"), fsStorage);
        this.backupApp(backup, app);
        this.backupUsers(backup);

        // restore
        this.cleanSystem(app);
//
//        // restore
//        BackupService restore = new BackupService(mongo, conf.getString("image.folder.apps"), );
//        List<RestoreResult> restoreResults = restore.restoreAppsAndUsers();
//        context.assertEquals(2, restoreResults.size());

        assertRestoreUsers(users);
        assertRestoreApp(app);


    }



}
