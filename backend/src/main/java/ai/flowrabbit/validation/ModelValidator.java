package ai.flowrabbit.validation;

import ai.flowrabbit.lunarmare.Model;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.ArrayList;
import java.util.List;

public class ModelValidator implements Validator {

    private final Model model;

    public ModelValidator(Model m) {
        this.model = m;
    }

    @Override
    public void validate(RoutingContext event, JsonObject obj, boolean isUpdate, Handler<List<String>> handler) {
        List<String> errors = new ArrayList<>();
        if (!this.model.isValid(obj)) {
            errors.add(this.model.getName() + ".notValid");
        }
        handler.handle(errors);
    }
}
