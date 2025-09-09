package ai.flowrabbit.rest;



import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ai.flowrabbit.cms.Content;
import ai.flowrabbit.util.DB;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;

public class SiteMap implements Handler<RoutingContext>{

	private Logger logger = LoggerFactory.getLogger(SiteMap.class);
	
	private final MongoClient client;
	
	private String content_db = DB.getTable(Content.class);

	public SiteMap(MongoClient client) {
		this.client = client;
	}

	public void handle(RoutingContext event){
		logger.info("handle()");
		
		
		StringBuilder sb = new StringBuilder();
		
		
		sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
		sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
		
		sb.append(url("/features.html"));
		sb.append(url("/quant-ux.html"));
		sb.append(url("/termsofservice.html"));
		sb.append(url("/team.html"));
		sb.append(url("/sketch-prototyping.html"));
		
		client.find(content_db, Content.findByCategory("blog"), res->{
			
			if(res.succeeded()){
				List<JsonObject> contents = res.result();
				
				for(JsonObject content : contents){
				
					sb.append(url("/"  + content.getString(Content.FIELD_CATEGORY) + "/" + getEscapted(content.getString(Content.FIELD_TITLE) + "/" + content.getString("id"))));
				}
			}
			
			
			sb.append("</urlset>");
			
			event.response().end(sb.toString());
		});
		
	
	}
	
	public String getEscapted(String title){
		
		title = title.replaceAll("\\s", "_");
		title = title.replaceAll("\\.", "");
		title = title.replaceAll(",", "");
		title = title.replaceAll("-", "");
		title = title.replaceAll("\\?", "");
		title = title.replaceAll("<", "");
		title = title.replaceAll(">", "");
		title = title.replaceAll("__", "_");

		return title;
	}
	
	private String url(String s){
		return "  <url><loc>https://quant-ux.com" + s + "</loc></url>\n";
	}
	
	
	  
	
	
}
