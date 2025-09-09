package ai.flowrabbit.util;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.vertx.ext.web.RoutingContext;

/**
 * Context object that holds domain specific configurations.
 */
public class Domain {

    private static Logger logger = LoggerFactory.getLogger(Domain.class);


    public static Domain flowrabbit = new Domain("Flowrabbit.ai", "support@flowrabbit.info", 1, true, "Welcome to Flowrabbit", "Flowrabbit - Support");

    private final String url;

    private final String admin;

    private final int freeMonths;

    private final boolean isFree;

    private final String mailSubjectWelcome, mailPlanUpdate;

    public static Domain get(RoutingContext event) {
        String app = event.request().getHeader("app");
        logger.debug("get() > " + app);
        return flowrabbit;
    }

    private Domain(String domain, String admin, int freeMoths, boolean isFree, String mailSubjectWelcome, String mailPlanUpdate) {
        this.admin = admin;
        this.url = domain;
        this.isFree = isFree;
        this.freeMonths = freeMoths;
        this.mailSubjectWelcome = mailSubjectWelcome;
        this.mailPlanUpdate = mailPlanUpdate;
    }

    public String getUrl() {
        return url;
    }

    public String getMailSubjectWelcome() {
        return mailSubjectWelcome;
    }

    public String getMailPlanUpdate() {
        return mailPlanUpdate;
    }

    public String getAdmin() {
        return admin;
    }

    public int getFreeMonths() {
        return freeMonths;
    }

    public boolean isFree() {
        return isFree;
    }
}
