package ai.flowrabbit;

import ai.flowrabbit.backup.FileSystemBackupStorage;
import ai.flowrabbit.backup.IBackupStorage;
import ai.flowrabbit.mocks.MockS3BackupStorage;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


@RunWith(VertxUnitRunner.class)
public class BackupWriterTest extends BackupServiceBaseTest{

    @Test
    public void testFileSystemApp(TestContext context) throws IOException, InterruptedException {
        log("testFileSystemApp", "enter");

        IBackupStorage storage = new FileSystemBackupStorage("test/backup/");
        File temp = writeTempFile("app", "This is an app backup");
        storage.writeApp("123", temp);
        String content = readFileAsString("test/backup/123.zip");
        context.assertEquals("This is an app backup", content);
        temp.delete();

        log("testFileSystemApp", "exit");
    }



    @Test
    public void testFileSystemUsers(TestContext context) throws IOException, InterruptedException {
        log("testFileSystemUsers", "enter");

        IBackupStorage storage = new FileSystemBackupStorage("test/backup/");
        File temp = writeTempFile("users", "Some users");
        storage.writeUsers(temp);
        String content = readFileAsString("test/backup/users.json");
        context.assertEquals("Some users", content);
        temp.delete();

        log("testFileSystemUsers", "exit");
    }

    @Test
    public void testFileSystemChain(TestContext context) throws IOException, InterruptedException {
        log("testFileSystemApp", "enter");

        FileSystemBackupStorage fs = new FileSystemBackupStorage("test/backup/");
        MockS3BackupStorage s3 = new MockS3BackupStorage();
        fs.appendWriter(s3);
        File app = writeTempFile("app", "This is an app backup");
        fs.writeApp("123", app);

        File users = writeTempFile("users", "This is an app backup");
        fs.writeUsers(users);

        context.assertNotNull(s3.getApp("123"));
        context.assertEquals(app.getAbsolutePath(), (s3.getApp("123").getAbsolutePath()));

        context.assertNotNull(s3.getUsers());
        context.assertEquals(users.getAbsolutePath(), (s3.getUsers().getAbsolutePath()));

        app.delete();
        users.delete();

        log("testFileSystemApp", "exit");
    }

    private String readFileAsString(String s) throws IOException {
        Path p = Paths.get(s);
        byte[] bytes = Files.readAllBytes(p);
        return new String(bytes);
    }

    private File writeTempFile(String app, String s) throws IOException {
        File temp = File.createTempFile(app, ".tmp");
        FileWriter writer = new FileWriter(temp);
        writer.write(s);
        writer.close();
        return temp;
    }
}
