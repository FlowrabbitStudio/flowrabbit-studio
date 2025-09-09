package ai.flowrabbit;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import ai.flowrabbit.backup.RestoreResult;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import com.google.common.io.Closeables;

import ai.flowrabbit.backup.BackupService;
import ai.flowrabbit.backup.FileSystemBackupStorage;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;


@RunWith(VertxUnitRunner.class)
public class BackupServiceTest extends BackupServiceBaseTest {
	
	@Test
	public void testApp(TestContext context) throws IOException, InterruptedException{
		log("testApp", "enter");
		
		cleanUp();
		deploy(new Main(), context);

		User klaus = postUser("klaus", context);
		User bernd = postUser("bernd", context);
		App app = setupApp(context, klaus, bernd);

		FileSystemBackupStorage storage = new FileSystemBackupStorage("test/backup/");
		BackupService backup = new BackupService(mongo, conf.getString("image.folder.apps"), storage);
		CountDownLatch latch = new CountDownLatch(1);
		backup.backupApp(app.getId(), res -> {
			 latch.countDown();
			 log(-1,"testApp", "file size " + res.size());
		});
		latch.await();
		
		/**
		 * Check if stuff is correct
		 */
		File file = storage.getApp(app.getId());
		context.assertNotNull(file, "Backup file is null");
		context.assertTrue(file.exists(), "Backup file does not exits");
		
		Map<String, String> jsons = getJSONS(file);
		String zipApp = jsons.get(DB.getTable(App.class) + ".json");
		context.assertNotNull(zipApp);

		JsonObject jsonApp = this.getApp(app, context);
		JsonObject jsonZip = new JsonObject(zipApp);
		jsonApp.remove("isDirty");
		jsonZip.remove("isDirty");
		assertJson(context, jsonApp, jsonZip);
		context.assertEquals(jsonApp, jsonZip);
		
		file.delete();
				
		log("test", "exit");
	}

	@Test
	public void testRestoreUsersNotOverride(TestContext context) throws Exception {
		log("testRestoreUsersNotOverride", "enter");

		cleanUp();
		deploy(new Main(), context);

		User klaus = postUser("klaus", context);
		User bernd = postUser("bernd", context);

		List<JsonObject> users = client.find(DB.getTable(User.class), User.all());


		FileSystemBackupStorage storage = new FileSystemBackupStorage("test/backup/");
		BackupService backup = new BackupService(mongo, conf.getString("image.folder.apps"), storage);
		CountDownLatch latch = new CountDownLatch(1);
		backup.backupUsers(res -> {
			latch.countDown();
			log(-1,"testRestore", "User done");
		});
		latch.await();


		File userFile = storage.getUsers();
		RestoreResult result = backup.restoreUsers(userFile);
		context.assertEquals(0, (int) result.getRestored());
		context.assertEquals(users.size(), (int) result.getIgnored());

		List<JsonObject> users2 = client.find(DB.getTable(User.class), User.all());
		context.assertEquals(users2.size(), users.size());
	}

	@Test
	public void testRestoreAppNotOverride(TestContext context) throws Exception {
		log("testRestoreUsersNotOverride", "enter");

		cleanUp();
		deploy(new Main(), context);

		User klaus = postUser("klaus", context);
		User bernd = postUser("bernd", context);
		App app = setupApp(context, klaus, bernd);

		List<JsonObject> apps = client.find(DB.getTable(App.class), App.all());
		List<JsonObject> users = client.find(DB.getTable(User.class), User.all());

		Assert.assertEquals(1, apps.size());
		Assert.assertTrue(users.size() >= 2);

		FileSystemBackupStorage storage = new FileSystemBackupStorage("test/backup/");
		BackupService backup = new BackupService(mongo, conf.getString("image.folder.apps"), storage);
		CountDownLatch latch = new CountDownLatch(1);
		backup.backupApp(app.getId(), res -> {
			latch.countDown();
			log(-1,"testRestore", "App done. size " + res.size());
		});
		latch.await();

		/**
		 * Get files
		 */
		File appFile = storage.getApp(app.getId());
		context.assertNotNull(appFile);

		RestoreResult appRestoreResult = backup.restoreApp(appFile);
		context.assertEquals(0, (int) appRestoreResult.getRestored());

		log("testRestoreUsersNotOverride", "exit");
	}

	@Test
	public void testRestore(TestContext context) throws Exception {
		log("testRestore", "enter");
		
		cleanUp();
		deploy(new Main(), context);

		User klaus = postUser("klaus", context);
		User bernd = postUser("bernd", context);
		App app = setupApp(context, klaus, bernd);
		
		List<JsonObject> apps = client.find(DB.getTable(App.class), App.all());
		List<JsonObject> users = client.find(DB.getTable(User.class), User.all());
		
		Assert.assertEquals(1, apps.size());
		Assert.assertTrue(users.size() >= 2);

		FileSystemBackupStorage storage = new FileSystemBackupStorage("test/backup/");
		BackupService backup = new BackupService(mongo, conf.getString("image.folder.apps"), storage);
		CountDownLatch latch = new CountDownLatch(2);
		backup.backupApp(app.getId(), res -> {
			 latch.countDown();
			 log(-1,"testRestore", "App done. size " + res.size());
		});
		backup.backupUsers(res -> {
			latch.countDown();
			 log(-1,"testRestore", "User done");
		});
		
		latch.await();
		
		/**
		 * Get files
		 */
		File appFile = storage.getApp(app.getId());
		File userFile = storage.getUsers();
		

		/**
		 * Check if stuff is correct
		 */
		this.cleanUp();
		this.cleanupImages(app);


		Assert.assertEquals(0, client.find(DB.getTable(App.class), App.all()).size());
		Assert.assertEquals(0, client.find(DB.getTable(User.class), User.all()).size());

		RestoreResult userRestoreResult = backup.restoreUsers(userFile);
		context.assertEquals(users.size(), (int) userRestoreResult.getRestored());

		RestoreResult appRestoreResult = backup.restoreApp(appFile);
		context.assertEquals(1, (int) appRestoreResult.getRestored());
		
		assertRestoreUsers(users);
		assertRestoreApp(app);
		
		appFile.delete();
		userFile.delete();
				
		log("testRestore", "exit");
	}



	

	@Test
	public void testUsers(TestContext context) throws IOException, InterruptedException{
		log("testUsers", "enter");
		
		cleanUp();
		deploy(new Main(), context);
		
		
		postUser("klaus", context);
		postUser("bernd", context);


		FileSystemBackupStorage storage = new FileSystemBackupStorage("test/backup/");
		BackupService backup = new BackupService(mongo, conf.getString("image.folder.apps"), storage);
		CountDownLatch latch = new CountDownLatch(1);
		backup.backupUsers(res -> {
			latch.countDown();
		});
		
		/**
		 * Backup stuff runs async...
		 */
		latch.await();
		
		/**
		 * Check if stuff is correct
		 */
		File file = storage.getUsers();
		context.assertNotNull(file, "Backup file is null");
		context.assertTrue(file.exists(), "Backup file does not exits");
		

    	String content = getString(file);
    	
    	JsonArray users = new JsonArray(content);
    	context.assertTrue(2 <= users.size(), "Wromg number of users " + users.size());
    	
    	context.assertTrue(!users.getJsonObject(0).containsKey("password") ,"Password");
    	context.assertTrue(!users.getJsonObject(1).containsKey("password") ,"Password");
        
		
		file.delete();
				
		log("testUsers", "exit");
	}




	/**
	 * FIXME: Make this better!
	 */
	public void assertJson(TestContext context, JsonObject expected, JsonObject observed) {
		Set<String> fields = expected.fieldNames();
		Set<String> fieldsB = observed.fieldNames();
		for (String field : fields){
			context.assertTrue(observed.containsKey(field), "Field " + field + " not in obsereved");
			Object expValue = expected.getValue(field);
			Object obsValue = observed.getValue(field);
			context.assertEquals(expValue, obsValue, "Values not ok for " + field);
		}
		for (String field : fieldsB){
			context.assertTrue(observed.containsKey(field), "Field " + field + " not expected");
			Object expValue = expected.getValue(field);
			Object obsValue = observed.getValue(field);
			context.assertEquals(expValue, obsValue, "Observed values not ok for " + field);
		}
	}


	public Map<String, String> getJSONS(File file) {
		HashMap<String, String> jsons = new HashMap<>();
		try{
			
			ZipFile zipFile = new ZipFile(file);
		    Enumeration<? extends ZipEntry> entries = zipFile.entries();		 
		    while(entries.hasMoreElements()){
		        ZipEntry entry = entries.nextElement();     
	        	InputStream stream = zipFile.getInputStream(entry);
	        	String content = CharStreams.toString(new InputStreamReader(stream, Charsets.UTF_8));
	        	Closeables.closeQuietly(stream);
	        	jsons.put(entry.getName(), content);
		    }
		    zipFile.close();
		}catch(Exception e){
			e.printStackTrace();
		}
		return jsons;
	}



	

	
}