import Logger from "./Logger";
import Services from '../services/Services'
import RestUtil from "../util/RestUtil";
import ConstantsUtil from "../util/ConstantsUtil";

class StreamEngine {

    constructor() {        
        this.proxyURLStream = `${Services.getConfig().proxy_URL}/proxy?stream=${true}`;
  }

  async runAndProcessStream(request, values, hash, appID, type) {
    try {
      const stream = await this.runStream(request, values, hash, appID, type);
      return stream;
    } catch (error) {
      console.error("Error processing stream:", error);
      throw error;
    }
  }

  runStream(request, values, hash, appID) {
    return new Promise(async (resolve, reject) => {
      Logger.log(-1, "RestEngine.runStream()", hash, appID);

      try {
        let url = await RestUtil.buildURL(request, values);
        let header = await this.createDefaultHeader(request, values);
        let data = await RestUtil.buildData(request, values);
        let streamPath = request.output?.streampath;

        url = this.makeProxyStreamRequestIfNeeded(
          request,
          url,
          header,
          hash,
          appID,
          streamPath,
          true
        );

        const fetchOptions = {
          method: "POST",
          headers: header,
          mode: "cors",
          cache: "no-cache",
          redirect: "follow",
          referrer: "no-referrer",
          body: data,
          signal: null,
        };
        const response = await fetch(url, fetchOptions);
        if (response.ok) {
          const reader = response.body.getReader();
          const stream = new ReadableStream({
            start: (controller) => {
              this.handleStreamData(reader, controller, reject);
            },
          });
          resolve(stream);
        } else {
          if (response.status === 405) reject(new Error(`Not Flowrabbit Credits left`));
          reject(new Error(`Stream failed with status: ${response.status}`));
        }
      } catch (error) {
        Logger.log(-1, "RestEngine.runStream() error", error);
        reject(new Error(`Streaming failed: ${error.message}`));
      }
    });
  }

  async handleStreamData(reader, controller, reject) {
    const push = () => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
            const chunkText = new TextDecoder().decode(value);
            controller.enqueue(chunkText);
          } else {
            console.error("Unexpected value type:", value);
          }
          push();
        })
        .catch((error) => {
          console.error("Stream reading failed:", error);
          controller.error(error);
          reject(error);
        });
    };

    push();
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
      return;
    }
    reject(
      Error(
        `Could not ${request.method} ${request.url}: ${response.statusText}`
      )
    );
  }

  makeProxyStreamRequestIfNeeded(request, url, headers, hash, appID, streamPath, isProxy) {
    if (RestUtil.isProxyRequest(request) || isProxy) {
      if (headers) {
        let headerKeys = Object.keys(headers).join(";");
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT] = headerKeys;
      }
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HOST] = url;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HASH] = hash;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_APP_ID] = appID;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_STREAM_PATH] = streamPath;

      return this.proxyURLStream;
    }
    return url;
  }

  async createDefaultHeader(request, values) {
    let token = await RestUtil.buildToken(request, values);
    let authType = RestUtil.getAuthType(request);
    let headers = {};

    if (request.input.type === "JSON") {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
    }

    if (request.isFlowrabbitSecret) {
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL] = request.aiModelId;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MAX_TOKENS] = request.output?.maxTokens;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL_TYPE] = request.modelType;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_OUTPUT_PATH] = request.output.path;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_QUANTITY] = request.quantity || 1;
      headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_DISABLE_CREDITS] = request.disableCredits;
      const authHeader = request.authHeader || "Authorization";
      headers[authHeader] = `${authType}`.trim() + " ${secrets.flowrabbit}";
    } else if (token) {
      const authHeader = request.authHeader || "Authorization";
      headers[authHeader] = `${authType} ${token}`.trim();
    }

    if (request.headers) {
      request.headers.forEach((header) => {
        let key = RestUtil.fillSimpleString(header.key, values);
        let value = RestUtil.fillSimpleString(header.value, values);
        headers[key] = value;
      });
    }

    return headers;
  }

  isFlowrabbitModel = (headers) => {
    const flowrabbitHeader = headers.find((header) => header.key === ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL);
    return flowrabbitHeader
  }

}
export default new StreamEngine();
