import RestUtil from "../../util/RestUtil";
import Logger from "../core/Logger";
import Services from "../../services/Services";
import ConstantsUtil from "../../util/ConstantsUtil";

class VideoEngine {
  constructor() {
    this.nodeURL = Services.getConfig().node_URL;
  }

  async processVideoRequest(rest, values, hash, appID, isAppStore) {
    return new Promise(async (resolve, reject) => {
      let url = this.nodeURL + "/video";
      let data = await RestUtil.buildData(rest, values);
      let header = await RestUtil.createDefaultHeader(
        rest,
        values,
        hash,
        appID,
        isAppStore
      );

      header["x-flowrabbit-model-id"] = rest.aimodel;

      fetch(url, {
        method: rest.method,
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrer: "no-referrer",
        body: data,
      })
        .then((response) => {
          this.handleOutput(resolve, reject, rest, response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
  makeProxyRequestIfNeeded(request, url, headers, hash, appID, isProxy) {
    if (RestUtil.isProxyRequest(request) || isProxy) {
      Logger.log(
        -1,
        "RestUtil.makeProxyRequestIfNeeded() > make proxy",
        hash,
        appID
      );
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

  handleOutput(resolve, reject, request, response) {
    Logger.log(2, "RestEngine.handleOutput()", "enter", response);

    if (response.ok) {
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
    } else {
      response.json().then(errorBody => {
        const error = new Error(errorBody.error || response.statusText);
        error.status = response.status;
        reject(error);
      }).catch(() => {
        const error = new Error(response.statusText);
        error.status = response.status; 
        reject(error);
      });
    }
   return;
  }
}

export default new VideoEngine();
