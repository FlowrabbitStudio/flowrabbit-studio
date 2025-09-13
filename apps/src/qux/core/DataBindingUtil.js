import Logger from "./Logger";
class DataBindingUtil {
  addDefaultDataBinding(model) {
    const widgetToScreenName = {};
    for (let screenId in model.screens) {
      let screen = model.screens[screenId];
      let children = screen.children;
      if (children) {
        children.forEach((widgetId) => {
          widgetToScreenName[widgetId] = screen.name;
        });
      }
    }
    for (let widgetId in model.widgets) {
      const widget = model.widgets[widgetId];
      const screenName = widgetToScreenName[widgetId] ? widgetToScreenName[widgetId] : "canvas";
      if (widget && widget.props) {
        if (!widget.props.databinding || Object.values(widget.props.databinding) === 0) {
          widget.props.databinding = {
            default: this.getDefaultDataBinding(screenName, widget),
          };
          Logger.log(2, "DataBindingUtil.addDefaultDataBinding() > ", widget.props.databinding);
        }
      }
    }
    return model;
  }

  getDefaultDataBinding(screenName, widget) {
    /**
     * RadioBoxes need some special handling. We create a binding for the group if specified
     */
    if (widget.type === "RadioBox2" && widget.props && widget.props.formGroup) {
      return this.escapeSpaces(`${screenName}.${widget.props.formGroup}`);
    }
    return this.escapeSpaces(`${screenName}.${widget.name}`);
  }

  escapeSpaces(s) {
    return s.replace(/\s+/g, "_").toLowerCase();
  }

  addDataBindingLinks(model) {
    if (model.lines) {
      for (let id in model.lines) {
        const line = model.lines[id];
        if (line.databinding) {
          const databinding = line.databinding;
          if (databinding.variables) {
            const to = model.widgets[line.to];
            const from = model.widgets[line.from];
            if (to && from) {
              const executorMethod = `_set_${from.type}_${databinding.type}`;
              //Logger.log(-10, 'DataBindingUtil.addDataBindingLinks() > ' + executorMethod)
              if (this[executorMethod] && this[executorMethod] instanceof Function) {
                this[executorMethod](from, to, databinding);
              } else {
                this.setDefault(from, to, databinding);
              }
            }
          } else {
            Logger.error("DataBindingUtil.addDataBindingLinks() > no varibales in databinding", line);
          }
        }
      }
    }

    return model;
  }

  _set_Chat_inputOutput(chatWidget, to) {    
    if (to?.props?.rest) {
      const rest = to?.props?.rest;
      const vars = rest?.vars;
      if (vars?.stream) {
        chatWidget.props.stream = true;
      }
    }
  }

  setDefault(from, to, databinding) {
    const toDataBinding = this.getToDataBinding(to);
    const fromDataBinding = from?.props.databinding;
    if (!toDataBinding || !fromDataBinding) {
      Logger.error("DataBindingUtil.setDefault() > no data binding for " + to.id + " or " + from.id);
      return;
    }

    for (let fromKey in databinding.variables) {
      let toKey = databinding.variables[fromKey];

      if (!toDataBinding[toKey]) {
        toDataBinding[toKey] = `${to.id}_${toKey}`;
      }
      // we will do a hard overwrite here
      //if (!fromDataBinding[fromKey]) {
      const varibale = toDataBinding[toKey];
      Logger.log(5, "DataBindingUtil.setDefault() > In " + to.id + " set " + fromKey + " to " + varibale);
      fromDataBinding[fromKey] = varibale;
      //}
    }
  }

  getToDataBinding(to) {
    /**
     * for rest widgets we create a fake data binding...
     */
    if (to?.props?.rest) {
      const rest = to?.props?.rest;
      const result = {
        default: rest.output.databinding,
      };
      if (rest?.input?.template) {
        const templateVars = this.getVarsFromString(rest.input.template);
        if (templateVars.length > 0) {
          result.template = templateVars[templateVars.length - 1];
        }
        if (templateVars.length !== 1) {
          Logger.warn("DataBindingUtil.getToDataBinding() > To many variables in template. Will take the last!", templateVars);
        }
      }
      if (rest?.input?.databinding) {
        result.template = rest.input.databinding;
      }
      return result;
    }
    return to?.props.databinding;
  }

  getVarsFromString(s) {
    const result = [];
    const matches = s.match(/\$\{(.*?)\}/g);
    if (matches) {
      matches.forEach((m) => {
        const variable = m.substring(2, m.length - 1);
        if (result.indexOf(variable) < 0) {
          result.push(variable);
        }
      });
    }
    return result;
  }
}
export default new DataBindingUtil();
