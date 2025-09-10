import ConstantsUtil from "./ConstantsUtil.js";
import Logger from "../core/Logger.js";
import lang from "../dojo/_base/lang";

const getAuthType = (request) => {
  if (request.authType === "Bearer") {
    return "Bearer";
  }
  if (request.authType === "Basic") {
    return "Basic";
  }
  return request.authType || "";
};

const createDefaultHeader = async (request, values, hash, appID) => {
  let token = await buildToken(request, values);
  let authType = getAuthType(request);
  let headers = {};

  if (request.input.type === "JSON") {
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json";
  }

  if (request.isFlowrabbitSecret) {
    headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL] = request.aiModelId;
    headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MAX_TOKENS] = request.output?.maxTokens;
    headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL_TYPE] = request.modelType;
    headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_QUANTITY] = request.quantity || 1;
    headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_DISABLE_CREDITS] = request.disableCredits || false;
    const authHeader = request.authHeader || "Authorization";
    headers[authHeader] = `${authType}`.trim() + " ${secrets.flowrabbit}";
    if (request.userToken) {
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_USER_TOKEN] = `Bearer ${request.userToken}`;
    }
  } else if (token) {
    const authHeader = request.authHeader || "Authorization";
    headers[authHeader] = `${authType} ${token}`.trim();
  }

  if (hash) headers["x-flowrabbit-hash"] = hash;
  if (appID) headers["x-flowrabbit-appid"] = appID;

  if (request && request.input && request.input.type === "url") {
    return { "Content-Type": "application/json", Accept: "application/json" };
  }

  if (request.headers) {
    request.headers.forEach((header) => {
      let key = fillSimpleString(header.key, values);
      let value = fillSimpleString(header.value, values);
      headers[key] = value;
    });
  }

  return headers;
};

const parseString = (s, result, filterSecrets = false) => {
  if (!s) {
    return;
  }
  if (typeof s !== "string") {
    return;
  }
  const matches = s.match(/\$\{(.*?)\}/g);
  if (matches) {
    matches.forEach((m) => {
      const variable = m.substring(2, m.length - 1);
      if (!isScretVariable(variable) || !filterSecrets) {
        if (result.indexOf(variable) < 0) {
          result.push(variable);
        }
      }
    });
  }
};

const isProxyRequest = (request) => {
  let isProxy = false;
  if ((request.token && isScretVariable(request.token)) || request.isProxyEnabled) {
    isProxy = true;
  }
  if (request.headers) {
    request.headers.forEach((header) => {
      if (isScretVariable(header.key)) {
        isProxy = true;
      }
      if (isScretVariable(header.value)) {
        isProxy = true;
      }
      if (
        header.key === ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL
      ) {
        isProxy = true;
      }
    });
  }
  return isProxy;
};

const isScretVariable = (variable) => {
  return variable.indexOf("secrets.") >= 0;
};

const clone = (obj) => {
  if (!obj) {
    return null;
  }
  return JSON.parse(JSON.stringify(obj));
};

const fixTypes = (request, data) => {
  if (request.input.types) {
    const types = request.input.types;
    for (let key in types) {
      const type = types[key];
      if (data[key] !== undefined && type) {
        if (type === "number") {
          data[key] = data[key] * 1;
        }
        if (type === "boolean") {
          data[key] = data[key] == "true" || data[key] == true;
        }
      }
    }
  }
};

const getValueByPath = (obj, path) => {
  const parts = path.replace(/\]/g, "").split(/\.|\[/);
  let currentPart = obj;
  for (let part of parts) {
    if (currentPart[part] === undefined) {
      return undefined; // or any default value
    }
    currentPart = currentPart[part];
  }
  return currentPart;
};

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const buildURL = async (request, values) => {
  let url = await fillString(request.url, values, false);
  return url;
};


const buildToken = async (request, values) => {
  if (request.token) {
    const data = await fillString(request.token, values, true);
    Logger.log(1, "RestUtil.buildToken()", "exit", data);
    return data;
  }
};

const buildData = async (request, values) => {
  let dataTemplate;

  if (typeof request.input.template === 'string') {
    const replacedTemplate = await replacePlaceholders(request.input.template, values);
    dataTemplate = JSON.parse(replacedTemplate);
  } else {
    dataTemplate = request.input.template;
  }

  let data = await fillObject(dataTemplate, values);
  Logger.log(1, "RestUtil.buildData()", "exit", data);

  return JSON.stringify(data);
};

const replacePlaceholders = async (template, values) => {
  for (const key in values) {
    const unquotedPattern = new RegExp(`(?<!")\\$\\{${key}\\}(?!")`, 'g');
    let value = await getStringFilelValue(getValueByKey(values, key), true, true);
    template = template.replace(unquotedPattern, value);
  }
  return template;
};

const replacePlaceholdersTyped = async (template, values) => {
  for (const key in values) {
    const unquotedPattern = new RegExp(`(?<!")\\$\\{${key}\\}(?!")`, 'g');
    let value = await getStringFilelValue(getValueByKey(values, key), true, true);

    // Replace unquoted instances directly, preserving type (e.g., for numbers, booleans)
    if (typeof value === 'string') {
      // Use JSON.stringify to ensure any special characters are escaped properly
      template = template.replace(unquotedPattern, JSON.stringify(value));
    } else {
      // For non-string values, insert them directly without quotes
      template = template.replace(unquotedPattern, value);
    }
  }
  return template;
};

const fillObject = async (obj, values, encodeFiles = true, encodeImgUri = true) => {
  if (typeof obj === 'string') {
    const placeholderMatch = obj.match(/^\$\{([^}]+)\}$/);
    if (placeholderMatch) {
      const key = placeholderMatch[1];
      let value = getValueByKey(values, key);
      value = await getStringFilelValue(value, encodeFiles, encodeImgUri);
      return value;
    } else {
      return await fillString(obj, values, encodeFiles, encodeImgUri);
    }
  } else if (Array.isArray(obj)) {
    return await Promise.all(obj.map(item => fillObject(item, values, encodeFiles, encodeImgUri)));
  } else if (obj !== null && typeof obj === 'object') {
    let result = {};
    for (let key in obj) {
      result[key] = await fillObject(obj[key], values, encodeFiles, encodeImgUri);
    }
    return result;
  } else {
    return obj;
  }
};

const fillString = async (s, values, encodeFiles = true, encodeImgUri = true) => {
  for (let key in values) {
    let value = getValueByKey(values, key);
    value = await getStringFilelValue(value, encodeFiles, encodeImgUri);
    let pattern = "${" + key + "}";
    s = replacePattern(s, pattern, value);
  }
  if (s.indexOf("${") >= 0) {
    Logger.log(-1, "RestUtil.fillString()", "> Not all parameters replaced!" + s);
  }
  return s;
};

const cleanString = (value) => {
  if (!value) return value;
  if (typeof value !== "string") return value;
  return value
    .replaceAll(/\\/g, "\\\\") // Escape backslashes
    .replaceAll(/\\"/g, "'")
    .replaceAll(/\\\"/g, "'")
    .replaceAll(/„|“/g, "") // Remove „ and “ characters
    .replaceAll(/\n/g, " ") // Replace new lines with a space
    .replaceAll(/\r/g, " ") // Replace carriage returns with a space
    .replaceAll(/\t/g, " "); // Replace tabs with a space
};

const fillSimpleString = (s, values) => {
  let matches = getDataBindingVariables(s);

  matches.forEach((key) => {
    if (values[key] !== undefined) {
      let value = getValueByKey(values, key);
      let pattern = "${" + key + "}";
      s = replacePattern(s, pattern, value);
    } else {
      Logger.warn(
        "RestUtil.fillSimpleString()",
        "Could not find >" + key + "<"
      );
    }
  });
  return s;
};

const replacePattern = (s, pattern, value) => {
  if (typeof s === 'string') {
    let i = 0;
    while (s.indexOf(pattern) >= 0 && i < 100) {
      s = s.replace(pattern, String(value));
      i++;
    }
  }
  return s;
};

const getDataBindingVariables = (s) => {
  let matches = [];
  parseString(s, matches);
  return matches;
};

const getValueByKey = (values, key) => {
  const value = values[key];
  if (typeof value === "string") {
    return cleanString(value);
  }
  return value;
};


const getStringFilelValue = async (value, encodeFiles, encodeImgUri) => {
  // Helper function to read the file as an ArrayBuffer
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  };

  // Check if the value is a file object and encode accordingly
  if (value != "undefined" && value && value.name && value.size) {
    if (encodeImgUri && value.type.startsWith("image/")) {
      const arrayBuffer = await readFileAsArrayBuffer(value);
      const base64Flag = `data:${value.type};base64,`;
      const imageStr = arrayBufferToBase64(arrayBuffer);
      return base64Flag + imageStr;
    } else if (encodeFiles) {
      const arrayBuffer = await readFileAsArrayBuffer(value);
      return arrayBufferToBase64(arrayBuffer);
    }
  }
  return value;
};

const readFileAsBase64 = async (file) => {
  let result = await base64(file);
  return result;
};

const dataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (error) => reject(error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
};

const base64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (error) => reject(error);
    reader.onload = () => {
      let bytes = Array.from(new Uint8Array(reader.result));
      let base64StringFile = btoa(
        bytes.map((item) => String.fromCharCode(item)).join("")
      );
      resolve(base64StringFile);
    };
    reader.readAsArrayBuffer(file);
  });
};

function extractDatabindingValues(template) {
  const variablePattern = /\${([^}]+)}/; // Regular expression to match ${variablename}
  const variablesMap = {};
  function traverse(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        traverse(obj[key]);
      } else if (
        typeof obj[key] === "string" &&
        variablePattern.test(obj[key])
      ) {
        const match = obj[key].match(variablePattern);
        if (match && match[1]) {
          variablesMap[key] = match[1];
        }
      }
    }
  }
  if (template) {
    const json = JSON.parse(template);
    traverse(json);
    return variablesMap;
  }
  return {};
}

function buildHints(prefix, object) {
  const hints = {};
  visitResult(object, hints, "<" + prefix);
  return hints;
}

function visitResult(object, result, prefix) {
  try {
    if (prefix.length > 300) {
      return;
    }
    if (Array.isArray(object)) {
      let path = prefix + "[0]";
      result[path] = "Array";
      object.forEach((o) => {
        visitResult(o, result, path);
      });
      return;
    }
    if (lang.isObject(object)) {
      for (let key in object) {
        let o = object[key];
        let path = prefix + "_" + key;
        result[path] = "Object";
        visitResult(o, result, path);
      }
      return;
    }
  } catch (e) {
    console.error(e);
    console.error(e.stack);
  }
}

const RestUtil = {
  fixTypes,
  clone,
  isScretVariable,
  isProxyRequest,
  parseString,
  createDefaultHeader,
  getAuthType,
  getValueByPath,
  delay,
  buildURL,
  base64,
  dataUrl,
  buildData,
  buildToken,
  fillString,
  fillSimpleString,
  getDataBindingVariables,
  getStringFilelValue,
  readFileAsBase64,
  cleanString,
  replacePattern,
  replacePlaceholders,
  replacePlaceholdersTyped,
  getValueByKey,
  extractDatabindingValues,
  buildHints,
};
export default RestUtil;
