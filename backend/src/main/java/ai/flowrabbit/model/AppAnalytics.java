package ai.flowrabbit.model;

import io.vertx.core.json.JsonObject;

public class AppAnalytics extends AppPart{

    public static final String CREATED = "created";

    public static final String AI_MODEL = "model";

    public static final String TOKENS = "tokens";

    public static final String MONTH = "m";

    public static final String DAY = "d";

    public static final String YEAR = "y";

    private int year;

    private int month;

    private int day;

    private String model;

    private int count = 0;

    private double tokens = 0;

    public int incCount() {
        count++;
        return count;
    }

    public double incTokens(double t) {
        this.tokens += t;
        return tokens;
    }

    public int getYear() {
        return year;
    }

    public AppAnalytics setYear(int year) {
        this.year = year;
        return this;
    }

    public int getMonth() {
        return month;
    }

    public AppAnalytics setMonth(int month) {
        this.month = month;
        return this;
    }

    public int getDay() {
        return day;
    }

    public AppAnalytics setDay(int day) {
        this.day = day;
        return this;
    }

    public String getModel() {
        return model;
    }

    public AppAnalytics setModel(String model) {
        this.model = model;
        return this;
    }

    public int getCount() {
        return count;
    }

    public AppAnalytics setTokens(int tokens) {
        this.tokens = tokens;
        return this;
    }

    public double getTokens() {
        return tokens;
    }

    public static JsonObject findByMonthAndYear(String appID, int m, int y) {
        return new JsonObject()
                .put(APP_ID ,appID)
                .put(YEAR, y)
                .put(MONTH, m);
    }
}
