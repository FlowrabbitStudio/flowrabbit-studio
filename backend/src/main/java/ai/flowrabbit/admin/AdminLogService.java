package ai.flowrabbit.admin;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.util.REST;

import io.vertx.core.Handler;
import io.vertx.core.file.FileSystem;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.RoutingContext;
import org.apache.commons.io.input.ReversedLinesFileReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

public class AdminLogService extends REST {

    private final AdminACL acl = new AdminACL();


    private Logger logger = LoggerFactory.getLogger(AdminLogService.class);

    public Handler<RoutingContext> getLog() {
        return event -> getLog(event);
    }

    public void getLog(RoutingContext event) {

        int lines = getLines(event);
        this.acl.isAdmin(getUser(event), event , allowed -> {
            if (allowed) {

                FileSystem fileSystem = event.vertx().fileSystem();
                if (fileSystem.existsBlocking("logs/app.log")) {
                    JsonArray result = new JsonArray();
                    try {
                        ReversedLinesFileReader fr = ReversedLinesFileReader
                                .builder()
                                .setFile(new File("logs/app.log"))
                                .get();

                        String line;
                        do {
                            line = fr.readLine();
                            result.add(line);
                        } while (line != null && result.size() < lines);
                        fr.close();

                    }catch (Exception e) {
                        logger.error("getLog() > Something went wrong");
                        e.printStackTrace();
                    }

                    returnJson(event, result);
                } else {
                    returnError(event, 403);
                }
            } else {
                logger.error("create() User {} tried to read log", getUser(event));
                returnError(event, 404);
            }
        });
    }

    private int getLines(RoutingContext event) {
        int lines = 1000;
        String param = event.request().getParam("lines");
        if (param != null && !param.isEmpty()) {
            try {
                lines = Integer.parseInt(param);
            } catch (Exception e) {
                logger.error("getLog() > wrong lines param {}", param);
            }
        }
        return lines;
    }
}

