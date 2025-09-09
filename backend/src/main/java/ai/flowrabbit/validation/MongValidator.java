package ai.flowrabbit.validation;

import io.vertx.ext.mongo.MongoClient;
import ai.flowrabbit.util.JSONMapper;

public class MongValidator {


	protected final MongoClient client;
	
	protected final JSONMapper mapper = new JSONMapper();
	
	public MongValidator(MongoClient client){
		this.client = client;
	}
}
