//import Vue from 'vue'
class JSONPath {
  get(data, path = "") {
    if (data != null && data != undefined) {
      if (data[path] !== null && data[path] !== undefined) {
        return data[path];
      }
      if (path.indexOf(".") >= 0 || path.indexOf("[") >= 0) {
        let elements = this.getJsonPath(path);
        let current = elements.shift();
        let value = data[current];
        while (
          current != null &&
          current != undefined &&
          value !== null &&
          value != undefined &&
          elements.length > 0
        ) {
          current = elements.shift();
          value = value[current];
        }
        return value;
      }
    }
  }

  set(data, path = "", value) {
    //console.debug('JSONPath.set()', path, '>' + value + '<')
    let elements = this.getJsonPath(path);
    let current = elements.shift();
    let node = data;
    let i = 0;
    while (current !== null && current !== undefined && i < 100) {
      i++;
      if (elements.length > 0) {
        if (!node[current]) {
          // FIXME: This looks like a bug! This should be always true?? But be careful because of
          // the repeater...
          if (elements[0].toLowerCase) {
            this._set(node, current, {});
          } else {
            this._set(node, current, []);
          }
        }
        node = node[current];
        current = elements.shift();
      } else {
        this._set(node, current, value);
      }
    }
    return data;
  }

  _set(node, key, value) {
    /**
     * Not sure how this works for new props. Maybe we have to use VUE here
     */
    node[key] = value;
    //Vue.set(node, key, value)
  }

  getJsonPath(path) {
    return path.split(".").flatMap((p) => {
      if (p.indexOf("[") >= 0) {
        let parts = p.split("[");
        if (parts.length == 2) {
          let key = parts[0];
          let index = parts[1].substring(0, parts[1].length - 1) * 1;
          return [key, index];
        }
        return p.substring(1, p.length - 1) * 1;
      }
      return p;
    });
  }

  has(data, path) {
    //console.debug('JSONPath.has()', path, data)
    if (data != null && data != undefined) {
      if (data[path] != null && data[path] != null) {
        return true;
      }
      if (path.indexOf(".") >= 0 || path.indexOf("[") >= 0) {
        let elements = this.getJsonPath(path);
        let current = elements.shift();
        let value = data[current];
        while (
          current != null &&
          current != undefined &&
          value !== null &&
          value != undefined &&
          elements.length > 0
        ) {
          current = elements.shift();
          value = value[current];
        }

        return value !== undefined && value !== null;
      }
      return false;
    }
    return false;
  }

  deepMerge(target, source) {
    if (target === source) return target;

    // Handle primitive types and functions
    if (typeof target !== "object" || target === null) {
      // Concatenate strings if both are strings
      if (typeof target === "string" && typeof source === "string") {
        return target + " " + source;
      } else {
        return source;
      }
    }

    // Array handling
    if (Array.isArray(target) && Array.isArray(source)) {
      for (let n = 0; n < source.length; n++) {
        const sourceValue = source[n];
        if (n >= target.length) {
          // If target array is shorter, push new elements
          if (typeof sourceValue === "object" && sourceValue !== null) {
            target.push(Array.isArray(sourceValue) ? [] : {});
            this.deepMerge(target[n], sourceValue);
          } else {
            target.push(sourceValue);
          }
        } else {
          const targetValue = target[n];
          if (typeof sourceValue === "object" && sourceValue !== null) {
            if (typeof targetValue !== "object" || targetValue === null) {
              target[n] = Array.isArray(sourceValue) ? [] : {};
            }
            this.deepMerge(target[n], sourceValue);
          } else {
            // Concatenate strings if both are strings
            if (
              typeof targetValue === "string" &&
              typeof sourceValue === "string"
            ) {
              target[n] = targetValue + " " + sourceValue;
            } else {
              target[n] = sourceValue;
            }
          }
        }
      }
      return target;
    }

    // If types are different, replace target with source
    if (Array.isArray(target) !== Array.isArray(source)) {
      return source;
    }

    // Object handling
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const targetValue = target[key];
      const sourceValue = source[key];

      if (typeof sourceValue !== "object" || sourceValue === null) {
        // Concatenate strings if both are strings
        if (
          typeof targetValue === "string" &&
          typeof sourceValue === "string"
        ) {
          target[key] = targetValue + " " + sourceValue;
        } else {
          target[key] = sourceValue;
        }
      } else {
        if (!targetValue || typeof targetValue !== "object") {
          // Initialize the target key if it doesn't exist or isn't an object
          target[key] = Array.isArray(sourceValue) ? [] : {};
        }
        // Recursively merge nested objects
        this.deepMerge(target[key], sourceValue);
      }
    }

    return target;
  }
}

export default new JSONPath();
