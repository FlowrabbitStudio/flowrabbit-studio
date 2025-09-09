//package de.vommond.matc.backup;
//
//import com.amazonaws.ClientConfiguration;
//import com.amazonaws.auth.AWSCredentials;
//import com.amazonaws.auth.AWSStaticCredentialsProvider;
//import com.amazonaws.auth.BasicAWSCredentials;
//import com.amazonaws.client.builder.AwsClientBuilder;
//import com.amazonaws.regions.Region;
//import com.amazonaws.regions.Regions;
//import com.amazonaws.services.s3.AmazonS3;
//import com.amazonaws.services.s3.AmazonS3Client;
//import com.amazonaws.services.s3.AmazonS3ClientBuilder;
//import com.amazonaws.services.s3.S3ClientOptions;
//import com.amazonaws.services.s3.model.ObjectListing;
//import com.amazonaws.services.s3.model.PutObjectRequest;
//import com.amazonaws.services.s3.model.S3Object;
//import com.amazonaws.services.s3.model.S3ObjectSummary;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//
//import java.io.File;
//import java.io.IOException;
//import java.io.InputStream;
//import java.nio.file.StandardCopyOption;
//import java.util.ArrayList;
//import java.util.List;
//
//public class S3BackupStorage implements IBackupStorage {
//
//    private Logger logger = LoggerFactory.getLogger(S3BackupStorage.class);
//
//
//    private AmazonS3 s3Client;
//
//    private final String bucket;
//
//    public S3BackupStorage(String key, String secret, String url, String bucket) {
//
//        this.bucket = bucket;
//
//        AWSCredentials credentials = new BasicAWSCredentials(key, secret);
//        ClientConfiguration clientConfiguration = new ClientConfiguration();
//        clientConfiguration.setSignerOverride("AWSS3V4SignerType");
//
//        this.s3Client = AmazonS3ClientBuilder
//                .standard()
//                .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(url, Regions.US_EAST_1.name()))
//                .withPathStyleAccessEnabled(true)
//                .withClientConfiguration(clientConfiguration)
//                .withCredentials(new AWSStaticCredentialsProvider(credentials))
//                .build();
//
//
//    }
//
//
//    @Override
//    public void writeApp(String appID, File temp) throws IOException {
//        this.writeFile(appID + ".zip", temp);
//    }
//
//    @Override
//    public void writeUsers(File temp) throws IOException {
//        this.writeFile("users.json", temp);
//    }
//
//    private void writeFile(String name, File temp) {
//        this.s3Client.putObject(bucket, name, temp);
//    }
//
//
//    @Override
//    public File getFile(String name) throws IOException {
//        S3Object object = this.s3Client.getObject(bucket, name);
//        if (object != null) {
//            File temp = this.createTempFile(name, object.getObjectContent());
//            return temp;
//        }
//        throw new IOException("File not found");
//    }
//
//    private File createTempFile(String name, InputStream stream) throws IOException {
//        String[] parts = name.split("\\.");
//        File temp = File.createTempFile(parts[0], "." +parts[1]);
//        java.nio.file.Files.copy(
//                stream,
//                temp.toPath(),
//                StandardCopyOption.REPLACE_EXISTING);
//        stream.close();
//        return temp;
//    }
//
//    public void onFileRestored (File temp) {
//        temp.delete();
//    }
//
//    @Override
//    public void appendWriter(IBackupStorage childWriter) {
//
//    }
//
//    @Override
//    public List<String> getAllFiles() {
//        List<String> result = new ArrayList<>();
//        ObjectListing objectListing = this.s3Client.listObjects(bucket);
//        addFiles(result, objectListing);
//
//        while (objectListing.isTruncated()) {
//            objectListing = this.s3Client.listNextBatchOfObjects (objectListing);
//            addFiles(result, objectListing);
//        }
//
//        return result;
//    }
//
//    private void addFiles(List<String> result, ObjectListing objectListing) {
//        List<S3ObjectSummary> objectSummaries = objectListing.getObjectSummaries();
//        for(S3ObjectSummary sum: objectSummaries) {
//            result.add(sum.getKey());
//        }
//    }
//}
