package ai.flowrabbit.admin;

import ai.flowrabbit.acl.AdminACL;
import ai.flowrabbit.model.AnalyticEvent;
import ai.flowrabbit.util.DB;
import ai.flowrabbit.util.JSONMapper;
import ai.flowrabbit.util.MongoResultPump;
import ai.flowrabbit.util.REST;
import io.vertx.core.MultiMap;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.*;

public class AdminAnalyticRest extends REST {


    private SimpleDateFormat dfMinute = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");

    private SimpleDateFormat dfHour = new SimpleDateFormat("yyyy-MM-dd'T'HH");

    private SimpleDateFormat dfDay = new SimpleDateFormat("yyyy-MM-dd");

    private final MongoClient db;
    private final AdminACL acl = new AdminACL();
    protected final JSONMapper mapper = new JSONMapper();
    private final String analytic_db;
    private int windowSizeHours = -24;


    private Logger logger = LoggerFactory.getLogger(AdminModelRest.class);

    public AdminAnalyticRest(MongoClient db) {
        this.db = db;
        this.analytic_db = DB.getTable(AnalyticEvent.class);
    }


    public void get(RoutingContext event) {
        this.logger.info("get() > enter");
        event.response().putHeader("content-type", "application/json");

        this.acl.isAdmin(getUser(event), event, allowed -> {
            if (allowed) {
                JsonObject query = getQuery(event);
                MongoResultPump pump = new MongoResultPump(event);
                db.findBatch(analytic_db, query)
                        .exceptionHandler(err -> pump.error())
                        .endHandler(v -> pump.end())
                        .handler(doc -> pump.pump(doc));

            } else {
                error("findAll", "User " + getUser(event) + " tried to  read " + event.request().path());
                returnError(event, 404);
            }
        });
    }


    public void getSummary(RoutingContext event) {
        this.logger.info("getSummary() > enter");
        event.response().putHeader("content-type", "application/json");

        this.acl.isAdmin(getUser(event), event, allowed -> {
            if (allowed) {
                JsonObject query = getQuery(event);
                db.find(analytic_db, query, res -> {
                    if (res.succeeded()) {
                        this.getSummary(event, res.result());
                    } else {
                        returnError(event, 400);
                    }
                });
            } else {
                error("getSummary", "User " + getUser(event) + " tried to  read " + event.request().path());
                returnError(event, 404);
            }
        });
    }

    private void getSummary(RoutingContext event, List<JsonObject> events) {

        Map<String, AggregatedEvents> result = new HashMap<>();

        String time = event.request().params().get("time");
        SimpleDateFormat df = getDateFormat(time);

        for (JsonObject e : events) {
            long millis = e.getLong(AnalyticEvent.CREATED);
            Calendar created=GregorianCalendar.getInstance();
            created.setTimeInMillis(millis);
            String key = df.format(created.getTime())
                    + "s:" + e.getString(AnalyticEvent.SCREEN, "")
                    + "w:" + e.getString(AnalyticEvent.WIDGET, "")
                    + "t:" + e.getString(AnalyticEvent.TYPE, "");
            if (!result.containsKey(key)) {
                result.put(key, new AggregatedEvents(e));
            }
            result.get(key).count ++;
        }

        List<AggregatedEvents> values = new ArrayList<>(result.values());
        event.response().end(mapper.toJson(values));

    }

    private SimpleDateFormat getDateFormat(String time) {
        if ("hour".equals(time)){
            return this.dfHour;
        }
        if ("minute".equals(time)){
            return this.dfMinute;
        }
        return this.dfDay;
    }


    private JsonObject getQuery (RoutingContext event) {
        MultiMap entries = event.queryParams();
        if (entries.contains("from") && entries.contains("to")) {
            long from = Long.parseLong(entries.get("from"));
            long to = Long.parseLong(entries.get("to"));
            if (entries.contains(AnalyticEvent.TYPE)) {
                String type = entries.get(AnalyticEvent.TYPE);
                return AnalyticEvent.inType(from, to, type);
            }
            if (entries.contains(AnalyticEvent.ORG)) {
                String orgID = entries.get(AnalyticEvent.ORG);
                return AnalyticEvent.inOrg(from, to, orgID);
            }
            return AnalyticEvent.in(from, to);
        }

        Calendar now = Calendar.getInstance();
        now.add(Calendar.HOUR, windowSizeHours);
        long date = now.getTimeInMillis();

        if (entries.contains(AnalyticEvent.TYPE)) {
            String type = entries.get(AnalyticEvent.TYPE);
            return AnalyticEvent.newerThan(date,type);
        }
        return AnalyticEvent.newerThan(date);
    }

    public void removeAll(RoutingContext event) {
        this.logger.info("removeAll() > enter");
        event.response().putHeader("content-type", "application/json");

        this.acl.isAdmin(getUser(event), event, allowed -> {
            if (allowed) {
                this.db.removeDocuments(this.analytic_db, AnalyticEvent.all(), res -> {
                    if (res.succeeded()) {
                        returnOk(event, "analytic.events.deleted");
                    } else {
                        returnError(event, 400);
                    }
                });
            } else {
                error("removeAll", "User " + getUser(event) + " tried to  read " + event.request().path());
                returnError(event, 404);
            }
        });
    }

    class AggregatedEvents {
        public long getCreated() {
            return created;
        }

        public void setCreated(long created) {
            this.created = created;
        }

        public String getScreen() {
            return screen;
        }

        public void setScreen(String screen) {
            this.screen = screen;
        }

        public String getWidget() {
            return widget;
        }

        public void setWidget(String widget) {
            this.widget = widget;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public String getOrg() {
            return org;
        }

        public void setOrg(String org) {
            this.org = org;
        }

        private long created;
        private String screen, widget, type, org;
        private long count = 0;

        AggregatedEvents (JsonObject e) {
            this.created = e.getLong(AnalyticEvent.CREATED);
            this.screen = e.getString(AnalyticEvent.SCREEN);
            this.widget = e.getString(AnalyticEvent.WIDGET);
            this.org = e.getString(AnalyticEvent.ORG);
            this.type = e.getString(AnalyticEvent.TYPE);
        }
    }
}
