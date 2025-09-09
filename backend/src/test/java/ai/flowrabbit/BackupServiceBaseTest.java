package ai.flowrabbit;

import ai.flowrabbit.backup.BackupService;
import ai.flowrabbit.model.*;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonObject;
import org.junit.Assert;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CountDownLatch;

public class BackupServiceBaseTest extends BaseTestCase {

    protected void backupUsers(BackupService backup) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        backup.backupUsers(res -> {
            latch.countDown();
        });
        latch.await();
    }

    protected void backupApp(BackupService backup, App app) throws InterruptedException {
        CountDownLatch latch2 = new CountDownLatch(1);
        backup.backupApp(app.getId(), res -> {
            latch2.countDown();
        });
        latch2.await();
    }

    protected void cleanBackupFolder (String folder) {
        Arrays.stream(new File(folder).listFiles()).forEach(File::delete);
    }

    protected void cleanSystem(App app) {
        this.cleanUp();
        this.cleanupImages(app);
        Assert.assertEquals(0, client.find(DB.getTable(App.class), App.all()).size());
        Assert.assertEquals(0, client.find(DB.getTable(User.class), User.all()).size());
    }
    protected long countBackups (String folder) {
        File dir = new File(folder);
        if (dir.isDirectory()) {
            return Arrays.stream(dir.listFiles()).filter(f -> f.isFile()).count();
        }
        return -1l;
    }

    public void assertRestoreUsers(List<JsonObject> users) {
        List<JsonObject> restoredUsers = client.find(DB.getTable(User.class), User.all());
        HashMap<String, JsonObject> restoredUsersByID = new HashMap<>();
        for (int i=0; i < restoredUsers.size(); i++){
            JsonObject r = restoredUsers.get(i);
            restoredUsersByID.put(r.getString("_id"), r);
        }
        Assert.assertEquals(users.size(), restoredUsers.size());
        for (int i=0; i < users.size(); i++){
            JsonObject u = users.get(i);
            JsonObject r = restoredUsersByID.get(u.getString("_id"));
            Assert.assertNotNull(r);
            Assert.assertEquals(u.getString("_id"), r.getString("_id"));
            Assert.assertEquals(u.getString("email"), r.getString("email"));
        }
    }


    protected void assertRestoreApp (App app) {
        log("assertRestoreApp", "enter");

        JsonObject restoredApp = client.findOne(DB.getTable(App.class), App.findById(app.getId()));
        Assert.assertNotNull(restoredApp);
        Assert.assertEquals(app.getName(), restoredApp.getValue("name"));

        Assert.assertEquals(2, client.count(DB.getTable(Team.class), Model.all()));

        User klaus = getUser("klaus@quant-ux.de");
        User bernd = getUser("bernd@quant-ux.de");

        Assert.assertEquals(1, client.count(DB.getTable(Team.class), Team.isOwner(klaus, app.getId())));
        Assert.assertEquals(1, client.count(DB.getTable(Team.class), Team.canRead(bernd, app.getId())));
        Assert.assertEquals(0, client.count(DB.getTable(Team.class), Team.canWrite(bernd, app.getId())));


        List<JsonObject> images = client.find(DB.getTable(Image.class), Image.findByApp(app.getId()));
        Assert.assertEquals(2, images.size());

        for (JsonObject img : images) {
            String url = img.getString("url");
            Assert.assertNotNull(url);

            InputStream is = getRaw("/rest/images/" + url + "?token=" + this.getJWT());
            Assert.assertNotNull(is);

            try {
                BufferedImage image = ImageIO.read(is);
                is.close();
                Assert.assertTrue(image.getWidth() > 0);
                Assert.assertTrue(image.getHeight() > 0);
                log("assertRestoreApp", "Loaded " + url);
            } catch (IOException e) {
                Assert.fail("Cannot read image");
            }
        }


        log("assertRestoreApp", "exit");
    }

    protected void cleanupImages(App app) {
        String imageFolderName = conf.getString("image.folder.apps") + "/" + app.getId();
        File imageFolder = new File(imageFolderName);
        if (imageFolder.exists()){
            File[] entries = imageFolder.listFiles();
            for (File entry : entries) {
                log("testRestore", "Deleet image"  + entry.getName());
                entry.delete();
            }
            imageFolder.delete();
        }
    }


    private User getUser(String email) {
        JsonObject u = client.findOne(DB.getTable(User.class), User.findByEmail(email));
        Assert.assertNotNull(u);
        return mapper.fromVertx(u, User.class);
    }


}
