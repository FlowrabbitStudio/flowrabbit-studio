package ai.flowrabbit.cms;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.github.jknack.handlebars.Handlebars;
import com.github.jknack.handlebars.Template;

import ai.flowrabbit.acl.RoleACL;
import ai.flowrabbit.model.User;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.MongoREST;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.file.FileSystem;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.mongo.UpdateOptions;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class CMSRest extends MongoREST {

	private final Logger logger = LoggerFactory.getLogger(CMSRest.class);

	private boolean disbaleCache = true;

	/**
	 * Template folder
	 */
	private static final String webroot = "trash/webroot";

	private final Handlebars handlebars;

	private HashMap<String, Template> templateCache = new HashMap<String, Template>();

	private HashMap<String, List<String>> replacementCache = new HashMap<String, List<String>>();

	private final String content_db;

	private String wrapperTemplate = "/index.html";

	public CMSRest(MongoClient db, boolean disbaleCache) {
		super(db, Content.class);

		setACL(new RoleACL().create(User.ADMIN).delete(User.ADMIN).read(User.GUEST).write(User.ADMIN));

		this.disbaleCache = disbaleCache;
		this.handlebars = new Handlebars();
		this.content_db = DB.getTable(Content.class);

	}

	public void renderDefault(RoutingContext context) {

		try {

			Template wrapper = getTemplate(this.wrapperTemplate, context);

			HashMap<String, String> values = new HashMap<>();
			values.put("content", "<div class=\"MatcLoading\">Loading...</div>");
			String result = wrapper.apply(values);

			context.response().end(result);

		} catch (Exception e) {
			logger.error("renderDefault", e);
			context.response().setStatusCode(404).end();
		}
	}

	public void wrap(Router router, String url, String include) {

		router.route(HttpMethod.GET, url).handler(wrapTemplate(include));

	}

	private Handler<RoutingContext> wrapTemplate(String include) {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				wrapTemplate(event, include);
			}
		};
	}

	private void wrapTemplate(RoutingContext context, String include) {
		logger.info("wrapTemplate() > enter " + include);

		try {

			Template wrapper = getTemplate(this.wrapperTemplate, context);

			getFilledTemplate(context, include, content -> {

				try {

					HashMap<String, String> values = new HashMap<>();
					values.put("content", content);
					String result = wrapper.apply(values);

					context.response().end(result);

				} catch (Exception e) {
					logger.error("wrapTemplate() > error wrapping : " + this.wrapperTemplate + " >> " + e.getMessage());
					context.next();
				}

			});

		} catch (Exception e) {
			logger.error("wrapTemplate() > Error : " + e.getMessage());
			context.next();

		}
	}

	public void getFilledTemplate(RoutingContext context, String name, Handler<String> handler) {

		try {
			Template template = getTemplate(name, context);

			List<String> replacements = this.getReplacements(name);

			if (template != null && replacements != null) {

				/**
				 * Set prefix if needed
				 */
				String prefix = getDomainPrefix(context);

				List<String> prefixedReplacements = getPrefixedReplacements(replacements, prefix);

				mongo.find(content_db, Content.findByKeys(prefixedReplacements), res -> {

					if (res.succeeded()) {

						List<JsonObject> contents = res.result();

						try {

							HashMap<String, String> values = getReplacementValues(context, replacements, contents, prefix);

							String result = template.apply(values);

							handler.handle(result);

						} catch (Exception e) {
							logger.error("getFilledTemplate() > Error filling template " + e.getMessage());
							e.printStackTrace();
						}

					} else {
						logger.warn("wrapTemplate() > Some mongo issue >> " + res.cause().getMessage());
						context.response().setStatusCode(404).end();
					}

				});

			} else {
				logger.warn("getFilledTemplate() > Could not get template or replacemnets for " + name);
				context.response().setStatusCode(404).end();
			}

		} catch (IOException e) {
			this.logger.error("getFilledTemplate() > Error" + e.getMessage());
			context.next();
		}
	}

	
	public Handler<RoutingContext> renderTemplate() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				renderTemplate(event);
			}
		};
	}

	private void renderTemplate(RoutingContext context) {

		try {
			String name = context.request().path();
			name = name.substring(name.indexOf("/", 1), name.length());

			/**
			 * FIXME: Add some stupid caching here?
			 */
			getAndFilleTemplate(context, name);

		} catch (Exception e) {
			logger.error("renderTemplate() > Could not render : " + context.request().path() + " >> " + e.getMessage());
			context.response().setStatusCode(404).end();
		}
	}

	
	
	/**
	 * Load content with :id and render it into template
	 */
	public Handler<RoutingContext> renderContent(String template) {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				renderContent(event, template);
			}
		};
	}

	private void renderContent(RoutingContext context, String templateName) {

		String id = context.request().getParam("id");
		try {
			
			Template wrapper = getTemplate(this.wrapperTemplate, context);

			Template template = getTemplate(templateName, context);
			
			mongo.findOne(content_db, Content.findById(id),null, res -> {

				if(res.succeeded()){
					
					try {
						
						JsonObject content = res.result();
						
						
						HashMap<String, String> values = new HashMap<>();
						values.put("title", content.getString(Content.FIELD_TITLE));
						values.put("date", content.getString(Content.FIELD_DATE));
						if(content.containsKey(Content.FIELD_PREVIEW)){
							values.put("preview", content.getString(Content.FIELD_PREVIEW));
						} else {
							values.put("preview", "---");
						}
						
						String txt = template.apply(values);
						
						
						values = new HashMap<>();
						values.put("content", txt);
						String result = wrapper.apply(values);

						context.response().end(result);
					} catch(Exception e){
						logger.error("renderContent() > Could not render : " + context.request().path());
						e.printStackTrace();
						context.response().setStatusCode(404).end();
					}
					
					
					
				} else {
					logger.error("renderContent() > Could not load : " + context.request().path());
					context.response().setStatusCode(404).end();
				}
			});
			

		} catch (Exception e) {
			logger.error("renderContent() > Could not read : " + context.request().path() + " >> " + e.getMessage());
			context.response().setStatusCode(404).end();
		}
	}

	/********************************************************************************************
	 * Helper
	 ********************************************************************************************/

	private List<String> getPrefixedReplacements(List<String> replacements, String prefix) {
		List<String> prefixedReplacements = new ArrayList<>();
		for (String replacement : replacements) {
			prefixedReplacements.add(prefix + replacement);
		}
		return prefixedReplacements;
	}

	
	private void getAndFilleTemplate(RoutingContext context, String name) throws IOException {
		/**
		 * Parse string string in here... Get all refs
		 */
		Template template = getTemplate(name, context);
		List<String> replacements = this.getReplacements(name);

		if (template != null && replacements != null) {

			/**
			 * Set prefix if needed
			 */
			String prefix = getDomainPrefix(context);

			List<String> prefixedReplacements = getPrefixedReplacements(replacements, prefix);

			mongo.find(content_db, Content.findByKeys(prefixedReplacements), res -> {

				if (res.succeeded()) {
					List<JsonObject> contents = res.result();
					fillTemplate(context, template, replacements, contents, prefix);
				} else {
					logger.warn("getByName() > Some mongo issue >> " + res.cause().getMessage());
					context.response().setStatusCode(404).end();
				}

			});

		} else {
			logger.warn("getByName() > Could not get template or replacemnets for " + name);
			context.response().setStatusCode(404).end();
		}
	}

	private String getDomainPrefix(RoutingContext context) {
		String url = context.request().absoluteURI();
		String prefix = "";
		if (url.contains("flowalytics.com") || (url.contains("127.0.0.1"))) {
			prefix = "flow_";
		}
		return prefix;
	}

	private void fillTemplate(RoutingContext context, Template template, List<String> replacements,
			List<JsonObject> contents, String prefix) {
		try {

			HashMap<String, String> values = getReplacementValues(context, replacements, contents, prefix);

			context.response().end(template.apply(values));

		} catch (IOException e) {
			logger.warn("getByName() > Some handlbars issue >> " + e.getMessage());
			context.response().setStatusCode(404).end();
		}
	}

	/**
	 * Get replacement for handlebars templates. Add contents and also user
	 */
	private HashMap<String, String> getReplacementValues(RoutingContext context, List<String> replacements,
			List<JsonObject> contents, String prefix) {

		HashMap<String, String> values = new HashMap<>();

		HashMap<String, String> temp = new HashMap<>();
		for (JsonObject content : contents) {
			temp.put(content.getString(Content.FIELD_KEY), content.getString(Content.FIELD_TXT));
		}
		for (String replacement : replacements) {
			if (!temp.containsKey(prefix + replacement)) {
				logger.warn("getByName() > No content with key : " + prefix + replacement);
				values.put(replacement, "TBD..." + replacement);
			} else {
				values.put(replacement, temp.get(prefix + replacement));
			}
		}

		User user = getUser(context);
		values.put("role", user.getRole());

		return values;
	}

	private List<String> getReplacements(String name) {
		return replacementCache.get(name);
	}

	public Template getTemplate(String name, RoutingContext context) throws IOException {

		if (!templateCache.containsKey(name) || this.disbaleCache) {

			logger.info("getTemplate() > read : " + name);

			Vertx vertx = context.vertx();
			FileSystem fileSystem = vertx.fileSystem();
			fileSystem.readDirBlocking(webroot);

			Buffer b = fileSystem.readFileBlocking(webroot + name);
			String txt = b.toString();

			/**
			 * Create handlebar template
			 */
			Template template = handlebars.compileInline(txt);
			templateCache.put(name, template);

			/**
			 * parse out the variables
			 */
			parseReplacements(name, txt);
		}

		return templateCache.get(name);
	}

	private void parseReplacements(String name, String txt) {
		ArrayList<String> replacements = new ArrayList<String>();
		Pattern pattern = Pattern.compile("\\{\\{(\\w)*\\}\\}");
		Matcher matcher = pattern.matcher(txt);
		while (matcher.find()) {
			String replacement = txt.substring(matcher.start() + 2, matcher.end() - 2);
			if (!replacements.contains(replacement)) {
				replacements.add(replacement);
			}

		}

		replacementCache.put(name, replacements);
	}

	/********************************************************************************************
	 * Create or update by key
	 ********************************************************************************************/

	public Handler<RoutingContext> createOrUpdateKey() {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				createOrUpdateKey(event);
			}
		};
	}

	private void createOrUpdateKey(RoutingContext event) {

		acl.canCreate(getUser(event), event, allowed -> {

			if (allowed) {
				JsonObject content = event.getBodyAsJson();

				content.put(Content.FIELD_LANGUAGE, "en");

				/**
				 * DO here the prefix stuff
				 */
				String prefix = getDomainPrefix(event);
				String key = prefix + content.getString(Content.FIELD_KEY);
				content.put(Content.FIELD_KEY, key);

				UpdateOptions options = new UpdateOptions().setUpsert(true);

				JsonObject update = new JsonObject().put("$set", content);

				mongo.updateCollectionWithOptions(content_db, Content.findByKey(key), update, options, res -> {

					if (res.succeeded()) {
						logger.warn("createOrUpdateKey() > done! " + key + " > " + prefix);
						returnOk(event, "cms.update.ok");
					} else {
						logger.error("createOrUpdateKey() > Error: Could not update  " + key);
						res.cause().printStackTrace();
						returnError(event, 405);
					}
				});

			} else {
				logger.error("createOrUpdateKey() > The user " + getUser(event) + " tried to write "
						+ event.request().path());
				returnError(event, 404);
			}
		});

	}

	/********************************************************************************************
	 * Create or update by key
	 ********************************************************************************************/

	public Handler<RoutingContext> findByCatgory(String category) {
		return new Handler<RoutingContext>() {
			@Override
			public void handle(RoutingContext event) {
				findByCatgory(event, category);
			}
		};
	}

	private void findByCatgory(RoutingContext event, String category) {
		mongo.find(content_db, Content.findByCategory(category), res -> {
			if (res.succeeded()) {
				List<JsonObject> contents = res.result();
				returnJson(event, contents);
			} else {
				res.cause().printStackTrace();
				returnError(event, 405);
			}
		});
	}

	
	
}
