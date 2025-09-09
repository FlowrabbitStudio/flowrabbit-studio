package ai.flowrabbit.services;

import io.vertx.core.Vertx;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

public class FSVersionService implements IVersionService{

    private Logger logger = LoggerFactory.getLogger(FSVersionService.class);

    private final String folder;

    public FSVersionService(String versionFolder) {
        this.folder = versionFolder;
    }

    @Override
    public void copyFile(Vertx vertx, String appID, String version, String path) {
        try {
            FileSystem fs = vertx.fileSystem();
            if (!fs.existsBlocking(path)) {
                logger.error("copyFile() > Not existing" + path);
                return;
            }
            String folder = makeFolder(fs, appID, version);
            String fileName = new File(path).getName();
            String target = String.format("%s/%s", folder, fileName);
            fs.copyBlocking(path, target);
            logger.error("copyFile() > exit: " + target);
        } catch (Exception e) {
            this.logger.error("copyFile() > Something went wrong", e);
        }
    }

    @Override
    public void writeJSON(Vertx vertx, String appID, String version, String name, JsonObject data) {
        try {
            FileSystem fs = vertx.fileSystem();
            String folder = makeFolder(fs, appID, version);
            String file = String.format("%s/%s", folder, name);
            fs.writeFileBlocking(file, data.toBuffer());
            logger.error("writeJSON() > exit: " + file);
        } catch (Exception e) {
            this.logger.error("writeJSON() > Something went wrong", e);
        }
    }

    private String makeFolder(FileSystem fs,  String appID, String version) {
        String folder = String.format("%s/%s/%s", this.folder, appID, version);
        if (!fs.existsBlocking(folder)) {
            logger.error("makeFolder() > " + folder);
            fs.mkdirsBlocking(folder);
        }
        return folder;
    }

    public void getFile(RoutingContext event, String appID, String version, String name){
        String path = String.format("%s/%s/%s/%s", this.folder, appID, version, name);
        FileSystem fs = event.vertx().fileSystem();
        fs.exists(path, exists -> {
            if (exists.result()) {
                event.response().putHeader("Cache-Control", "no-transform,public,max-age=86400,s-maxage=86401");
                event.response().putHeader("ETag", path);
                event.response().sendFile(path);
            } else {
                logger.error("getFile() > file does not exist > " + path);
                event.response().setStatusCode(404);
                event.response().end();
            }
        });
    }
}
