import Services from "../services/Services";
import ConstantsUtil from "../util/ConstantsUtil";
import RestUtil from "../util/RestUtil";
import Logger from "./Logger";


class VideoEngine {
  constructor() {
    this.nodeURL = Services.getConfig().node_URL || "http://localhost:8088";
  }

  async processVideoRequest(rest, values, hash, appID) {
    return new Promise(async (resolve, reject) => {
      let url = this.nodeURL + "/video";
      let data = await RestUtil.buildData(rest, values);
      let header = await RestUtil.createDefaultHeader(
        rest,
        values,
        hash,
        appID
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
    }
    response
      .text()
      .then((errorText) => {
        let errorMessage;

        if (response.status === 401) {
          // If the status is 401, return the generic authentication error message
          errorMessage = "The authentication key is not correct";
        } else {
          // Default error message if parsing fails or error is not found
          errorMessage = `Could not ${request.method} ${request.url}: ${response.statusText}`;

          try {
            const error = JSON.parse(errorText);

            if (error.message) {
              errorMessage = error.message;
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          } catch (e) {
            // If JSON parsing fails, append the original errorText if available
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
        }

        reject(new Error(errorMessage));
      })
      .catch(() => {
        reject(
          new Error(
            `Could not ${request.method} ${request.url}: ${response.statusText}`
          )
        );
      });
  }
}

export default new VideoEngine();
