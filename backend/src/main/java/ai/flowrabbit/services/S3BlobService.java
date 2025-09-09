package ai.flowrabbit.services;

import ai.flowrabbit.util.Config;
import io.vertx.core.Handler;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.File;
import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;

public class S3BlobService implements IBlobService {

    private static final Logger logger = LoggerFactory.getLogger(S3BlobService.class);

    private final String secretKey;

    private final String accessKey;

    private final String url;

    private final String bucketName;

    private final String prefix;

    private S3Client s3;

    private StaticCredentialsProvider staticCredentialsProvider;

    private static final Region region = Region.EU_CENTRAL_2;

    public S3BlobService(JsonObject conf, String prefix) {
        this.accessKey = conf.getString(Config.S3_ACCESS_KEY);
        this.secretKey = conf.getString(Config.S3_SECRET_ACCESS_KEY);
        this.url = conf.getString(Config.S3_URL);
        this.bucketName =  conf.getString(Config.S3_BUCKET);
        this.prefix = prefix;
        s3 = getS3Client();

        listBuckets(s3);
    }

    private S3Client getS3Client() {

        if (this.s3 == null) {
            AwsCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
            staticCredentialsProvider = StaticCredentialsProvider.create(credentials);

            // IONOS

            s3 = S3Client.builder()
                    .region(region)
                    .credentialsProvider(staticCredentialsProvider)
                    .endpointOverride(URI.create(url))
                    .build();
        }
        return s3;
    }

    public static void listBuckets(S3Client s3) {
        try {
            ListBucketsResponse response = s3.listBuckets();
            List<Bucket> bucketList = response.buckets();
            bucketList.forEach(bucket -> {
                logger.error("Bucket Name: {}", bucket.name());
            });
            logger.error("listBuckets(), Connected");
        } catch (S3Exception e) {
            logger.error("listBuckets(), can't connect {}", e.awsErrorDetails().errorMessage());
        }
    }

    @Override
    public void setBlob(RoutingContext event, String tempFileToUpload, String target, Handler<Boolean> handler) {
        logger.error("setBlob() > {} to {}/{}", tempFileToUpload, prefix, target);

        String key = prefix +"/" + target;
        File file = new File(tempFileToUpload);
        event.vertx().executeBlocking(promise -> {
            try {
                getS3Client().putObject(request ->
                                request
                                        .bucket(bucketName)
                                        .key(key)
                                        .ifNoneMatch("*"),
                        file.toPath());

                logger.error("setBlob() Done");
                promise.complete("true");
            } catch (Exception e) {
                logger.error("setBlob() Could not upload: {}", e.getMessage(), e);
                promise.complete("false");
            }
        }, result -> {
            handler.handle(true);
        });
    }

    @Override
    public void copyBlob(RoutingContext event, String source, String target, Handler<Boolean> handler) {
        logger.error("copyBlob() {} {}", source, target);

        String sourceKey = prefix + "/" + source;
        String targetKey = prefix + "/" + target;
        event.vertx().executeBlocking(promise -> {
            try {
                getS3Client().copyObject(request ->
                        request
                                .sourceBucket(bucketName)
                                .sourceKey(sourceKey)
                                .destinationBucket(bucketName)
                                .destinationKey(targetKey));

            } catch (Exception e) {
                logger.error("copyBlob() Could not upload: {}", e.getMessage(), e);
                promise.complete("false");
            }
        }, asyncResult -> {
            handler.handle(true);
        });
    }

    @Override
    public void getBlob(RoutingContext event, String folder, String file) {
        logger.error("getBlob() {} {}", folder, file);

        String useLocalCache = event.request().getParam("c");
        if ("true".equals(useLocalCache)) {
            downloadAndSendFile(event, folder, file);
        } else {
            sendPresignedURL(event, folder, file);
        }
    }

    private void downloadAndSendFile(RoutingContext event, String folder, String file) {
        String key = prefix +"/" + folder + "/" + file;
        FileSystem fileSystem = event.vertx().fileSystem();
        fileSystem.exists(key, exists -> {

            if (exists.succeeded() && exists.result()) {
                logger.error("downloadAndSendFile() > use cache > {}", file);
                event.response().putHeader("Cache-Control", "no-transform,public,max-age=86400,s-maxage=86401");
                event.response().putHeader("ETag", key);
                event.response().sendFile(key);
            } else {
                logger.error("downloadAndSendFile() > downlaod {}", file);
                event.vertx().executeBlocking(promise -> {

                    String appFolder = prefix +"/" + folder;
                    fileSystem.mkdirsBlocking(appFolder);

                    try {
                        GetObjectRequest request = GetObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .build();

                        Path downloadPath = Paths.get(key);

                        getS3Client().getObject(request, ResponseTransformer.toFile(downloadPath));

                        promise.complete();

                    } catch (Exception e) {
                        promise.fail("");
                        e.printStackTrace();
                    }

                }, asyncResult -> {
                    if (asyncResult.succeeded()) {

                        event.response().putHeader("Cache-Control", "no-transform,public,max-age=86400,s-maxage=86401");
                        event.response().putHeader("ETag", key);
                        event.response().sendFile(key);

                    } else {
                        event.response().setStatusCode(500).end();
                    }
                });

            }
        });
    }

    private void sendPresignedURL(RoutingContext event, String folder, String file) {
        String key = prefix +"/" + folder + "/" + file;
        logger.error("sendPresignedURL() {}", key);
        event.vertx().executeBlocking(promise -> {

            S3Presigner presigner = null;
            try {

                presigner = S3Presigner.builder()
                        .endpointOverride(URI.create(url))
                        .credentialsProvider(staticCredentialsProvider)
                        .region(region).build();

                GetObjectRequest objectRequest = GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

                GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofHours(24))
                        .getObjectRequest(objectRequest)
                        .build();

                PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
                logger.error("Presigned URL: [{}]", presignedRequest.url().toString());
                logger.info("HTTP method: [{}]", presignedRequest.httpRequest().method());

                promise.complete(presignedRequest.url().toString());
                presigner.close();


            } catch (Exception e) {
                logger.error("getBlob() > Could not get presigned URL", e);
                if (presigner != null) {
                    presigner.close();
                }
            }
        }, asyncResult -> {

            String url = (String) asyncResult.result();
            event.response().putHeader("Cache-Control", "no-transform,public,max-age=86400,s-maxage=86401");
            event.response().putHeader("ETag", key);
            event.response().putHeader("location", url).setStatusCode(302).end();
        });
    }

    @Override
    public String createFolder(RoutingContext event, String folder) {
        logger.error("createFolder() {}", folder);
        return folder;
    }

    @Override
    public void deleteFile(RoutingContext event, String folder, String fileName, Handler<Boolean> handler) {
        logger.info("deleteFile()");
        String key = prefix +"/" + folder + "/" + fileName;
        FileSystem fileSystem = event.vertx().fileSystem();
        if (fileSystem.existsBlocking(key)) {
            logger.info("deleteFile() > delete cache {}", key);
            fileSystem.deleteBlocking(key);
        }
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder().key(key).bucket(bucketName).build();
            getS3Client().deleteObject(request);
            logger.error("deleteFile() > deleted S3 {}", key);
        } catch (Exception e) {
            logger.error("deleteFile() > could not delete", e);
        }
        handler.handle(true);

    }

    public void deleteFolder(RoutingContext event, String folder) {
        logger.info("deleteFolder()");

        FileSystem fs = event.vertx().fileSystem();
        fs.exists(prefix , exists -> {
            if (exists.succeeded() && exists.result()) {
                fs.deleteRecursive(prefix, true, deleted -> {
                    if (!exists.succeeded()) {
                        logger.error("deleteFolder() > Could not delete path {}", prefix, deleted.cause());
                    } else {
                        logger.info("deleteFolder() > Deleted path {}", prefix);
                    }
                });
            }
        });

      event.vertx().executeBlocking(promise -> {

        List<S3Object> contents = getS3Objects(folder);
        for (S3Object o : contents) {
                try {
                    DeleteObjectRequest delRequest = DeleteObjectRequest.builder().key(o.key()).bucket(bucketName).build();
                    getS3Client().deleteObject(delRequest);
                    logger.error("deleteFolder() > Deleted key {}", o.key());
                } catch (Exception e) {
                    logger.error("deleteFolder() > Could not delete {}", o.key(), e);
                }
            }
            promise.complete();
        }, asyncResult -> {});

    }

    public List<S3Object> getS3Objects(String folder) {
        S3Client s3 = getS3Client();
        ListObjectsRequest request = ListObjectsRequest.builder()
                .bucket(bucketName)
                .prefix(prefix + "/" + folder)
                .build();
        ListObjectsResponse listObjectsResponse = s3.listObjects(request);
        List<S3Object> contents = listObjectsResponse.contents();
        return contents;
    }
}
