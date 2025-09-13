export function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

export function getUserName(user) {
  if (user.name || user.lastname) {
    return user.name + " " + user.lastname;
  }
  return user.lastname;
}

export function getActionNames(design) {
  let result = new Set();

  Object.values(design.widgets).forEach((w) => {
    addActionNames(w, result);
  });

  Object.values(design.screens).forEach((w) => {
    addActionNames(w, result);
  });

  return Array.from(result);
}

function addActionNames(e, result) {
  if (e.props.callbacks) {
    let callbacks = e.props.callbacks;
    for (let event in callbacks) {
      let callback = callbacks[event];
      if (callback) {
        result.add(callback);
      }
    }
  }
}

export function getActionByName(actionName, app) {
  if (app.data && app.data.actions) {
    return app.data.actions.find((a) => a.id === actionName);
  }
}
