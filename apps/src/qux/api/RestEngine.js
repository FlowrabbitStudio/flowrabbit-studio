import Logger from "../core/Logger.js";
import RestUtil from "../../util/RestUtil.js";
import ConstantsUtil from "../../util/ConstantsUtil.js";

class RestEngine {
  constructor() {
    this.proxyURL = `/proxy`;
  }

  setProxyURL(url) {
    if (!url.endsWith("/proxy")) {
      url = url + "/proxy";
    }
    this.proxyURL = url;
    console.debug("RestEngine > setProxyURL: ", this.proxyURL);
  }



  run(request, data, hash, appID) {
    Logger.log(-1, "RestEngine.run()", hash, appID);

    if (request.method === "GET") {
      return this.get(request, data, hash, appID);
    }

    if (request.method === "POST" && request.input.type === "FORM") {
      return this.postOrPutForm(request, data, hash, appID);
    }
    if (request.method === "POST" && request.input.type === "JSON") {
      return this.postOrPut(request, data, hash, appID);
    }
    if (request.method === "POST" && (request.input.type === "IMAGE" || request.input.type === "FILE")) {
      return this.postOrPostImage(request, data, hash, appID);
    }

    if (request.method === "PATCH" && request.input.type === "JSON") {
      return this.postOrPut(request, data, hash, appID);
    }
    if (request.method === "PATCH" && request.input.type === "FORM") {
      return this.postOrPutForm(request, data, hash, appID);
    }
    if (request.method === "PATCH" && (request.input.type === "IMAGE" || request.input.type === "FILE")) {
      return this.postOrPostImage(request, data, hash, appID);
    }

    if (request.method === "PUT" && request.input.type === "JSON") {
      return this.postOrPut(request, data, hash, appID);
    }
    if (request.method === "PUT" && request.input.type === "FORM") {
      return this.postOrPutForm(request, data, hash, appID);
    }
    if (request.method === "PUT" && (request.input.type === "IMAGE" || request.input.type === "FILE")) {
      return this.postOrPostImage(request, data, hash, appID);
    }

    if (request.method === "DELETE") {
      return this.delete(request, data, hash, appID);
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
        req.url = req.url.replace("$REQUEST_ID", prevResult.request_id) + "/status";
        let result = {};
        while (!result.status || result.status !== "COMPLETED") {
          result = await this.get(req, values, hash, appID, true);
          if (!result.status || result.status !== "COMPLETED") {
            await RestUtil.delay(1000);
          }
        }
        const getreq = { ...request };
        getreq.url = prevResult.response_url || getreq.url.replace("$REQUEST_ID", prevResult.request_id);
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

    if (!response.ok) {
      // handle error as before
      response
        .json()
        .then((errorBody) => {
          const error = new Error(errorBody.error || response.statusText);
          error.status = response.status;
          reject(error);
        })
        .catch(() => {
          const error = new Error(response.statusText);
          error.status = response.status;
          reject(error);
        });
      return;
    }

    // At this point, response is OK (2xx)
    const contentType = response.headers.get("Content-Type");
    const contentLength = response.headers.get("Content-Length");

    // If no body is returned (like a 204 No Content or empty result)
    // you can check if content-length is 0 or if the scenario just doesn't return a body.
    if (response.status === 204 || ((contentLength === "0" || contentLength === null) && !contentType)) {
      // Return accepted for empty successful responses
      resolve("accepted");
      return;
    }

    // If the request output type is known ahead of time, we use it directly.
    // However, if you'd like to dynamically determine how to handle the response
    // based on content type, you can add logic here.
    //
    // For example, if your scenario might return Excel files, those often have MIME types like:
    // - application/vnd.ms-excel
    // - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

    if (request.output.type === "JSON") {
      // If response is supposed to be JSON but isn't, this may fail.
      // You could add a check for JSON content type:
      if (contentType && contentType.includes("application/json")) {
        response.json().then(resolve).catch(reject);
      } else {
        // If it doesn't look like JSON, handle gracefully
        // Maybe return text or "accepted" or handle as a fallback
        response
          .text()
          .then((text) => {
            if (text.trim().length === 0) {
              resolve("accepted");
            } else {
              // If not JSON but we expected JSON,
              // either treat as text or handle as an error based on your logic:
              resolve(text);
            }
          })
          .catch(reject);
      }
    } else if (request.output.type === "TEXT") {
      response
        .text()
        .then((text) => {
          if (text.trim().length === 0) {
            resolve("accepted");
          } else {
            resolve(text);
          }
        })
        .catch(reject);
    } else if (request.output.type === "IMAGE" || request.output.type === "FILE") {
      // For files (including images, excel, etc.), we can treat them as binary:
      response
        .blob()
        .then((blob) => {
          // If you know it's an Excel file, you might want to name it:
          // const fileName = `downloaded_file.xlsx`;
          // const file = new File([blob], fileName, { type: contentType });

          // Create a URL for the blob:
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        })
        .catch(reject);
    } else {
      // If no specific output type is set, you could default to text or JSON attempt:
      if (contentType && contentType.includes("application/json")) {
        response.json().then(resolve).catch(reject);
      } else if (
        contentType &&
        (contentType.includes("application/vnd.ms-excel") || contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
      ) {
        // Handle Excel as a file:
        response
          .blob()
          .then((blob) => {
            const fileUrl = URL.createObjectURL(blob);
            resolve(fileUrl);
          })
          .catch(reject);
      } else {
        // Default to text if nothing else matches
        response
          .text()
          .then((text) => {
            if (text.trim().length === 0) {
              resolve("accepted");
            } else {
              resolve(text);
            }
          })
          .catch(reject);
      }
    }
  }

  get(request, values, hash, appID, isProxy) {
    return new Promise(async (resolve, reject) => {
      let url = await RestUtil.buildURL(request, values);
      let header = await RestUtil.createDefaultHeader(request, values, undefined, undefined);

      url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID, isProxy);

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
      const header = await RestUtil.createDefaultHeader(request, values, undefined, undefined);
      const formData = new FormData();
      for (let key in values) {
        formData.append(key, values[key]);
      }

      url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID, isProxy);

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
      const header = await RestUtil.createDefaultHeader(request, values, undefined, undefined);

      url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID, isProxy);

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
      let header = await RestUtil.createDefaultHeader(request, values, undefined, undefined);

      url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID, isProxy);

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
      let header = await RestUtil.createDefaultHeader(request, values, undefined, undefined);

      url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID, isProxy);

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
    if ((rest.method === "POST" || rest.method === "PUT" || rest.method === "PATCH") && (rest.input.type === "JSON" || rest.input.type === "FORM")) {
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

  async secondApiCall(request, params, values, hash, appID) {
    let url = request.url + params;
    const condition = request.condition;
    let conditionValue = undefined;
    let header = await RestUtil.createDefaultHeader(request, values, undefined, undefined);
    url = this.makeProxyRequestIfNeeded(request, url, header, hash, appID);
    while (conditionValue !== condition.value) {
      const response = await fetch(url, {
        method: request.method,
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
      });
      if (response.status == 200 || response.status == 201) {
        if (request.output.type === "JSON") {
          try {
            const result = response.json();
            conditionValue = result[condition.key];
          } catch (e) {
            throw new Error(`Could not ${request.method} ${request.url}: ${e.message}`);
          }
        }
        if (request.output.type === "IMAGE") {
          response.arrayBuffer().then((buffer) => {
            const result = buffer;
            conditionValue = result[condition.key];
          });
        }
        return;
      }
    }
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
