package ai.flowrabbit;


import ai.flowrabbit.backup.BackupService;
import ai.flowrabbit.backup.FileSystemBackupStorage;
import ai.flowrabbit.backup.IBackupStorage;
import ai.flowrabbit.backup.RestoreResult;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.Model;
import ai.flowrabbit.model.User;
import io.vertx.ext.unit.TestContext;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

//@RunWith(VertxUnitRunner.class)
public class BackupServiceTest2 extends BackupServiceBaseTest{

    private static final String backupFolder = "test/backup/";


    //@Test
    public void testMultiApps(TestContext context) throws IOException, InterruptedException {
        log("testMultiApps", "enter");

        cleanUp();
        deploy(new Main(), context);
        createMultiAppsAndBackupThem(context);

        cleanUp();
        context.assertEquals(0l, client.count(app_db, Model.all()));

        IBackupStorage storage = new FileSystemBackupStorage(backupFolder);
        BackupService backup = new BackupService(
                mongo,
                conf.getString("image.folder.apps"),
                storage
        );
        List<RestoreResult> restoreResults = backup.restoreAppsAndUsers();
        context.assertEquals(11, restoreResults.size());
        for (RestoreResult r : restoreResults) {
            context.assertEquals(0l, r.getIgnored());
            context.assertEquals(0l, r.getErrors());
            if (r.getType().equals(RestoreResult.TYPE_USER)) {
                context.assertTrue(40l <= r.getRestored());
            } else {
                context.assertEquals(1l, r.getRestored());
            }
        }

        log("testMultiApps", "exit");
    }

    //@Test
    public void testMultiAppsNoOverride(TestContext context) throws IOException, InterruptedException {
        log("testMultiAppsNoOverride", "enter");

        cleanUp();
        deploy(new Main(), context);
        createMultiAppsAndBackupThem(context);


        IBackupStorage storage = new FileSystemBackupStorage(backupFolder);
        BackupService backup = new BackupService(
                mongo,
                conf.getString("image.folder.apps"),
                storage
        );

        List<RestoreResult> restoreResults = backup.restoreAppsAndUsers();
        context.assertEquals(11, restoreResults.size());
        for (RestoreResult r : restoreResults) {
            context.assertEquals(0l, r.getErrors());
            if (r.getType().equals(RestoreResult.TYPE_USER)) {
                context.assertTrue(40l <= r.getIgnored());
            } else {
                context.assertEquals(1l, r.getIgnored());
            }
        }

        log("testMultiAppsNoOverride", "exit");
    }

    private void createMultiAppsAndBackupThem(TestContext context) throws InterruptedException {
        cleanBackupFolder(backupFolder);


        for (int i =0; i < 10; i++) {
            postUser("dennis" + i, context);
            postUser("martin" + i, context);
        }

        List<App> apps = new ArrayList<App>();
        for (int i=0; i < 10; i++) {
            User klaus = postUser("klaus" + i, context);
            User serhad = postUser("serhad" + i, context);
            App app = setupApp(context, klaus, serhad);
            apps.add(app);
        }

        IBackupStorage storage = new FileSystemBackupStorage(backupFolder);
        BackupService backup = new BackupService(mongo, conf.getString("image.folder.apps"), storage);

        backupUsers(backup);
        for (App app : apps) {
            backupApp(backup, app);
        }

        context.assertEquals(11l,countBackups(backupFolder));
    }


}
