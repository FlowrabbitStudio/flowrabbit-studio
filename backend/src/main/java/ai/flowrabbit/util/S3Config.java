package ai.flowrabbit.util;

public class S3Config {

    private final String url;
    private final String bucket;
    private final String accessKey;
    private final String secretAccessKey;

    S3Config(String url, String bucket, String accessKey, String secretAccessKey) {
        this.url = url;
        this.bucket = bucket;
        this.accessKey = accessKey;
        this.secretAccessKey = secretAccessKey;
    }

    public String getUrl() {
        return url;
    }

    public String getBucket() {
        return bucket;
    }

    public String getAccessKey() {
        return accessKey;
    }

    public String getSecretAccessKey() {
        return secretAccessKey;
    }


}
