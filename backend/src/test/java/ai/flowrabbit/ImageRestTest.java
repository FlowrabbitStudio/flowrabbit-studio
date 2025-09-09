package ai.flowrabbit;

import java.io.IOException;

import org.junit.Test;
import org.junit.runner.RunWith;

import ai.flowrabbit.acl.Acl;
import ai.flowrabbit.model.App;
import ai.flowrabbit.model.User;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;

@RunWith(VertxUnitRunner.class)
public class ImageRestTest extends BaseTestCase {


	@Test
	public void testNoResize(TestContext context) throws InterruptedException, IOException {
		log("testNoResize", "enter");

		cleanUp();
		deploy(new Main(), context);

		User klaus = postUser("klaus", context);
		assertLogin(context, klaus, "123456789");

		App klaus_app_private = postApp("klaus_app_private", false, context);
		assertList("/rest/images/" + klaus_app_private.getId() + ".json", 0, context);

		/**
		 * do an upload
		 */
		postImage(klaus_app_private, context, "2000x4000_white.png", false);
		JsonArray images = assertList("/rest/images/" + klaus_app_private.getId() + ".json", 1, context);
		assertRawImage(context, klaus_app_private, images, 2000);

	}


		@Test
	public void testImageUploads(TestContext context) throws InterruptedException, IOException {
		log("testImageUploads", "enter");

		cleanUp();

		deploy(new Main(), context);

		/**
		 * create user
		 */
		User klaus = postUser("klaus", context);
		User bernd = postUser("bernd", context);
		User dennis = postUser("dennis", context);
		

		assertLogin(context, klaus, "123456789");
		
		App klaus_app_public = postApp("klaus_app_public", true, context);
		App klaus_app_private = postApp("klaus_app_private", false, context);
		createPermission(dennis, klaus_app_private, Acl.READ, context);
		createPermission(bernd, klaus_app_private, Acl.WRITE, context);
		assertList("/rest/images/" + klaus_app_private.getId() + ".json", 0, context);
		
		/**
		 * do an upload
		 */
		postImage(klaus_app_public, context, "test.png");
		assertList("/rest/images/" + klaus_app_public.getId() + ".json", 1, context);

		postImage(klaus_app_private, context, "test.png");
		postImage(klaus_app_private, context, "2000x4000_white.png", false);
		assertList("/rest/images/" + klaus_app_private.getId() + ".json", 2, context);

		/**
		 * Login as Dennis, he cannot write, but read
		 */
		assertLogin(context, dennis, "123456789");
		postImageError(klaus_app_private, context);
		postImageError(klaus_app_public, context);
		JsonArray images = assertList("/rest/images/" + klaus_app_private.getId() + ".json", 2, context);

		assertRawImage(context, klaus_app_private, images, 3000);

		/**
		 * Logout. Private images cannot be seen, public onses can
		 */
		logout();
		assertRawError(context, klaus_app_private, images);

		/**
		 * Guest cannot post
		 */
		postImageError(klaus_app_private, context);
		postImageError(klaus_app_public, context);


		/**
		 * Examples can be loaded
		 */
		JsonArray publicImages = assertList("/rest/images/" + klaus_app_public.getId() + ".json", 1, context);
		assertRawImage(context, klaus_app_public, publicImages, 2000);

		
	}







}
