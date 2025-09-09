package ai.flowrabbit.util;

import ai.flowrabbit.model.AppSecrets;
import ai.flowrabbit.model.Secret;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.regex.Pattern;

public class SecretUtil {

    private static final Logger logger = LoggerFactory.getLogger(SecretUtil.class);

    public static boolean secretMatchesHost(JsonObject secret, String url) {
        if (!secret.containsKey(Secret.FIELD_SECRET_DOMAIN)) {
            logger.trace("secretMatchesHost() > Secret does not have domain {}", secret.getString(Secret.FIELD_SECRET_NAME));
            return false;
        }
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            String domain = secret.getString(Secret.FIELD_SECRET_DOMAIN);
            boolean matches = hostMatchesPattern(host, domain);
            logger.trace("secretMatchesHost() > Check  {} ? {} = {}", domain, host, matches);
            return matches;
        } catch (Exception err) {
            logger.error("secretMatchesHost() > Could not parse host {}", url);
        }
        return false;
    }


    public static JsonArray filterByHost(JsonObject data, String url) {

        JsonArray result = new JsonArray();
        if (!data.containsKey(AppSecrets.FIELD_SECRETS)) {
            logger.error("filterByHost() > no secrets in data");
            return result;
        }
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            JsonArray secrets = data.getJsonArray(AppSecrets.FIELD_SECRETS);
            for (int i = 0; i < secrets.size(); i++) {
                JsonObject secret = secrets.getJsonObject(i);
                String domain = secret.getString(AppSecrets.FIELD_SECRET_DOMAIN);
                boolean matches = hostMatchesPattern(host, domain);
                logger.trace("filterByHost() > Check  {} ? {} = {}", domain, host, matches);
                if (matches) {
                    result.add(secret);
                }
            }
        } catch (Exception err) {
            logger.error("filterByHost() > Could not parse host {}", url);
        }
        return result;
    }

    public static boolean hostMatchesPattern(String host, String pattern) {
        if (host == null || pattern == null) {
            logger.trace("hostMatchesPattern() > Null params host:{} , pattern: {}", host, pattern);
            return false;
        }
        if (!pattern.contains("*")) {
            return pattern.equals(host);
        } else {
            String regex = pattern
                    .replace(".", "\\.")
                    .replace("*", ".*");

            if (pattern.startsWith("*.")) {
                String baseDomain = pattern.substring(2); // Remove "*."
                regex = ".*\\." + baseDomain.replace(".", "\\.") + "|" + baseDomain.replace(".", "\\.");
            }

            Pattern compiledPattern = Pattern.compile("^" + regex + "$");
            return compiledPattern.matcher(host).matches();
        }
    }
}
