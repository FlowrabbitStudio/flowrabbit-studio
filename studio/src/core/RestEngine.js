import Logger from "./Logger";

import Services from "../services/Services";
import RestUtil from "../util/RestUtil.js";
import ConstantsUtil from "../util/ConstantsUtil.js";
import JSONPath from "src/core/JSONPath";
class RestEngine {
  constructor() {
    this.proxyURL = `/proxy`;
  }


  setProxyURL(url) {
    this.proxyURL = url;
    console.debug("RestEngine > setProxyURL: ", this.proxyURL);
  }


  async run(request, data, hash, appID, isProxy = false, isAi = false) {
    Logger.log(1, "RestEngine.run()", hash, appID, isProxy);

    let response;
    const startTime = Date.now();
    if (request.method === "GET") {
      response = await this.get(request, data, hash, appID, isProxy);
    } else if (request.method === "POST" && request.input.type === "FORM") {
      response = await this.postOrPutForm(request, data, hash, appID, isProxy);
    } else if (request.method === "POST" && request.input.type === "JSON") {
      response = await this.postOrPut(request, data, hash, appID, isProxy);
    } else if (
      request.method === "POST" &&
      (request.input.type === "IMAGE" || request.input.type === "FILE")
    ) {
      response = await this.postOrPostImage(
        request,
        data,
        hash,
        appID,
        isProxy
      );
    } else if (request.method === "PATCH" && request.input.type === "JSON") {
      response = await this.postOrPut(request, data, hash, appID, isProxy);
    } else if (request.method === "PATCH" && request.input.type === "FORM") {
      response = await this.postOrPutForm(request, data, hash, appID, isProxy);
    } else if (
      request.method === "PATCH" &&
      (request.input.type === "IMAGE" || request.input.type === "FILE")
    ) {
      response = await this.postOrPostImage(
        request,
        data,
        hash,
        appID,
        isProxy
      );
    } else if (request.method === "PUT" && request.input.type === "JSON") {
      response = await this.postOrPut(request, data, hash, appID, isProxy);
    } else if (request.method === "PUT" && request.input.type === "FORM") {
      response = await this.postOrPutForm(request, data, hash, appID, isProxy);
    } else if (
      request.method === "PUT" &&
      (request.input.type === "IMAGE" || request.input.type === "FILE")
    ) {
      response = await this.postOrPostImage(
        request,
        data,
        hash,
        appID,
        isProxy
      );
    } else if (request.method === "DELETE") {
      response = await this.delete(request, data, hash, appID, isProxy);
    }

    // Post AI usage to analytics if it's an AI request
    if (isAi && response) {
      await this.postAiUsageToAnalytics(request, response, appID, startTime);
    }

    return response;
  }

  async postAiUsageToAnalytics(request, response, appID, startTime) {
    try {
      const endTime = Date.now(); // Capture end time
      const latency = endTime - startTime; // Calculate latency in milliseconds
      const metricsPath = request.output.metricspath;
      if (!metricsPath) return;

      const usageData = JSONPath.get(response, metricsPath);
      if (usageData) {
        const analyticsData = {
          model: usageData.model || "unknown",
          tokens: usageData.tokens || 0,
          count: usageData.count || 1,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate(),
          latency: latency,
          pricing: metricsPath.pricing,
          totalcost: (metricsPath.pricing / 1000) * (usageData.tokens || 0),
        };

        // Post the analytics data
        await Services.getModelService().saveAnalytics(appID, analyticsData);
        Logger.log(
          1,
          "RestEngine.postAiUsageToAnalytics()",
          "Analytics data saved",
          analyticsData
        );
      }
    } catch (error) {
      Logger.error(
        "RestEngine.postAiUsageToAnalytics()",
        "Failed to post analytics data",
        error
      );
    }
  }

  async runAPILoop(prevResult, request, values, hash, appID, type) {
    try {
      if (type === "replicate") {
        Logger.log(1, "runAPILoop: Get replicate by Job Id: ");
        request.url = prevResult.urls.get;
        let result = {};
        while (!result.status || result.status !== "succeeded") {
          result = await this.get(request, values, hash, appID, true);
          if (!result.status || result.status !== "succeeded") {
            await RestUtil.delay(1000);
          }
        }
        let path = request.output.path || "";
        return RestUtil.getValueByPath(result, path);
      } else if (type === "blackforestlabs") {
        Logger.log(1, "runAPILoop: Get Forest Lab by Job Id: ");
        const req = { ...request };
        req.url = req.url + prevResult.id;
        let result = {};
        while (!result.status || result.status !== "Ready") {
          result = await this.get(req, values, hash, appID, true);
          if (!result.status || result.status !== "Ready") {
            await RestUtil.delay(1000);
          }
        }
        let path = req.output.path || "";
        return RestUtil.getValueByPath(result, path);
      } else if (type === "fal") {
        Logger.log(1, "runAPILoop: Get Fal Video by Job Id: ");
        const req = { ...request };
        req.url = req.url.replace("$REQUEST_ID", prevResult.request_id) + "/status"
        let result = {};
        while (!result.status || result.status !== "COMPLETED") {
          result = await this.get(req, values, hash, appID, true);
          if (!result.status || result.status !== "COMPLETED") {
            await RestUtil.delay(1000);
          }
        }
        const getreq = { ...request };
        getreq.url = prevResult.response_url || getreq.url.replace("$REQUEST_ID", prevResult.request_id)
        const res = await this.get(getreq, values, hash, appID, true);
        let path = getreq.output.path || "";
        return RestUtil.getValueByPath(res, path);
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
      throw new Error("Something was wrong. Run did not complete");
    }
  }

  async buildFormData(request, values) {
    const formData = new FormData();
    const lines = request.input.template.split("\n");
    for (let line of lines) {
      const parts = line.split(":");
      if (parts.length === 2) {
        const key = parts[0];
        const value = parts[1];
        const data = await RestUtil.fillString(value, values, true);
        formData.append(key, data);
      } else {
        throw new Error("RestEngine.buildFormData() > template not ok");
      }
    }
    Logger.log(-1, "RestEngine.buildFormData()", "exit", formData);
    return formData;
  }

  handleOutput(resolve, reject, request, response) {
    Logger.log(2, "RestEngine.handleOutput()", "enter", response);

    if (response.status == 200 || response.status == 201) {
      if (request.output.type === "JSON") {
        try {
          resolve(response.json());
        } catch (e) {
          reject(
            new Error(
              `Could not ${request.method} ${request.url}: ${e.message}`
            )
          );
        }
      }
      if (request.output.type === "TEXT") {
        resolve(response.text());
      }
      if (request.output.type === "IMAGE") {
        response.arrayBuffer().then((buffer) => {
          resolve(buffer);
        });
      }
      if (request.output.type === "FILE") {
        response
          .blob()
          .then((blob) => {
            const fileUrl = URL.createObjectURL(blob);
            resolve(fileUrl);
          })
          .catch((e) => {
            reject(
              new Error(
                `Could not ${request.method} ${request.url}: ${e.message}`
              )
            );
          });
      }
      return;
    }
    response
      .text()
      .then((errorText) => {
        let errorMessage;

        if (response.status === 401) {
          errorMessage = "The authentication key is not correct";
        } else if (response.status === 405)  {
          errorMessage = "Not Flowrabbit Credits left";
        } else {
          errorMessage = `Could not ${request.method} ${request.url}: ${response.statusText}`;

          try {
            const error = JSON.parse(errorText);

            if (error.message) {
              errorMessage = error.message;
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          } catch (e) {
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        }

        reject(new Error(errorMessage));
      })
      .catch(() => {
        // Fallback in case the response text could not be retrieved
        reject(
          new Error(
            `Could not ${request.method} ${request.url}: ${response.statusText}`
          )
        );
      });
  }

  get(request, values, hash, appID, isProxy) {
    return new Promise(async (resolve, reject) => {
      let url = await RestUtil.buildURL(request, values);
      let header = await RestUtil.createDefaultHeader(request, values);

      url = this.makeProxyRequestIfNeeded(
        request,
        url,
        header,
        hash,
        appID,
        isProxy
      );

      fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
      })
        .then((response) => {
          this.handleOutput(resolve, reject, request, response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  postOrPostImage(request, values, hash, appID, isProxy) {
    return new Promise(async (resolve, reject) => {
      let url = await RestUtil.buildURL(request, values);
      const header = await RestUtil.createDefaultHeader(request, values);
      const formData = new FormData();
      for (let key in values) {
        formData.append(key, values[key]);
      }

      url = this.makeProxyRequestIfNeeded(
        request,
        url,
        header,
        hash,
        appID,
        isProxy
      );

      fetch(url, {
        method: request.method,
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
        body: formData,
      })
        .then((response) => {
          this.handleOutput(resolve, reject, request, response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  postOrPutForm(request, values, hash, appID, isProxy) {
    Logger.log(1, "RestEngine.postOrPutForm()", "enter >");
    return new Promise(async (resolve, reject) => {
      let url = await RestUtil.buildURL(request, values);
      const formData = await this.buildFormData(request, values);
      const header = await RestUtil.createDefaultHeader(request, values);

      url = this.makeProxyRequestIfNeeded(
        request,
        url,
        header,
        hash,
        appID,
        isProxy
      );

      fetch(url, {
        method: request.method,
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
        body: formData,
      })
        .then((response) => {
          this.handleOutput(resolve, reject, request, response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  postOrPut(request, values, hash, appID, isProxy) {
    return new Promise(async (resolve, reject) => {

      let url = await RestUtil.buildURL(request, values);
      let data = await RestUtil.buildData(request, values);
      let header = await RestUtil.createDefaultHeader(request, values);

      url = this.makeProxyRequestIfNeeded(
        request,
        url,
        header,
        hash,
        appID,
        isProxy
      );

      fetch(url, {
        method: request.method,
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
        body: data,
      })
        .then((response) => {
          this.handleOutput(resolve, reject, request, response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  delete(request, values, hash, appID, isProxy) {
    return new Promise(async (resolve, reject) => {
      let url = await RestUtil.buildURL(request, values);
      let header = await RestUtil.createDefaultHeader(request, values);

      url = this.makeProxyRequestIfNeeded(
        request,
        url,
        header,
        hash,
        appID,
        isProxy
      );

      fetch(url, {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
      })
        .then((response) => {
          this.handleOutput(resolve, reject, request, response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
  getNeededDataBings(rest) {
    let result = [];
    RestUtil.parseString(rest.url, result);
    RestUtil.parseString(rest.token, result, true);
    if (
      (rest.method === "POST" ||
        rest.method === "PUT" ||
        rest.method === "PATCH") &&
      (rest.input.type === "JSON" || rest.input.type === "FORM")
    ) {
      RestUtil.parseString(rest.input.template, result);
    }
    if (rest.input.fileDataBinding) {
      result.push(rest.input.fileDataBinding);
    }
    if (rest.headers) {
      rest.headers.forEach((header) => {
        RestUtil.parseString(header.key, result, true);
        RestUtil.parseString(header.value, result, true);
      });
    }

    return result;
  }
  getNeededDataBingsAI(rest, aiModel) {
    let result = {};
    let reverseMapping = {};

    const addBinding = (key, type) => {
      if (key) {
        result[key] = type;
      }
    };

    const extractVariableNames = (str) => {
      const variables = [];
      RestUtil.parseString(str, variables, true);
      return variables;
    };

    const createVariableToFieldMap = (templateStr) => {
      const regex = /"([^"]+)"\s*:\s*"\${([^}]+)}/g;
      let match;
      const map = {};
      while ((match = regex.exec(templateStr)) !== null) {
        const fieldId = match[1];
        const varName = match[2];
        map[varName] = fieldId;
        reverseMapping[fieldId] = varName;
      }
      return map;
    };

    const isFileTypeInAiModel = (fieldId, aiModel) => {
      const checkElements = (elements) => {
        return elements.some((el) => el.id === fieldId && el.type === "file");
      };

      if (aiModel) {
        if (aiModel.elements && checkElements(aiModel.elements)) {
          return true;
        }
        if (aiModel.advanced && checkElements(aiModel.advanced)) {
          return true;
        }
      }
      return false;
    };

    const variableToFieldMap = createVariableToFieldMap(rest.input.template);

    extractVariableNames(rest.input.template).forEach((varName) => {
      const fieldId = variableToFieldMap[varName];
      if (!fieldId || !isFileTypeInAiModel(fieldId, aiModel)) {
        addBinding(varName, "text");
      }
    });

    extractVariableNames(rest.url).forEach((varName) => addBinding(varName));
    extractVariableNames(rest.token).forEach((varName) => addBinding(varName));

    if (rest.headers) {
      rest.headers.forEach((header) => {
        extractVariableNames(header.key).forEach((varName) =>
          addBinding(varName)
        );
        extractVariableNames(header.value).forEach((varName) =>
          addBinding(varName)
        );
      });
    }

    if (aiModel) {
      const checkElements = (elements) => {
        elements.forEach((el) => {
          if (el.type === "file") {
            addBinding(reverseMapping[el.id] || el.id, "file");
          }
        });
      };

      if (aiModel.elements) checkElements(aiModel.elements);
      if (aiModel.advanced) checkElements(aiModel.advanced);
    }

    return result;
  }

  makeProxyRequestIfNeeded(request, url, headers, hash, appID, isProxy) {
    if (RestUtil.isProxyRequest(request) || isProxy) {
      //Logger.log(1, "RestUtil.makeProxyRequestIfNeeded() > make proxy", hash, appID);
      if (headers) {
        let headerKeys = Object.keys(headers).join(";");
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT] = headerKeys;
      }
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HOST] = url;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HASH] = hash;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_APP_ID] = appID;

      return this.proxyURL;
    }
    return url;
  }
}
export default new RestEngine();
