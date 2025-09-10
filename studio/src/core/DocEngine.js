import Logger from "./Logger";
import Services from "../services/Services";

class DocEngine {
  constructor() {
    this.nodeURL = Services.getConfig().node_URL;
    //this.nodeURL = "http://localhost:8088";
  }
  runParser(config, data, hash, appID) {
    Logger.log(-1, "DocEngine.run()", hash, appID);
    return this.parseDocuments(config, data, hash, appID);
  }
  async parseDocuments(config, data, hash, appID) {
    Logger.log(1, "DocEngine.parseDocuments()", "enter >");
    return new Promise(async (resolve, reject) => {
      const fileDataBinding = config.input?.fileDataBinding;
      const files = data[fileDataBinding];
      if (files) {
        const configData = {
          file: data[fileDataBinding],
          ...config,
        };
        const formData = await this.buildFormData(configData);
        const header = await this.createDefaultHeader(configData, hash, appID, data);
        fetch(`${Services.getConfig().node_URL}` + "/doc-to-text", {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: header,
          redirect: "follow",
          referrer: "no-referrer",
          body: formData,
        })
          .then((response) => {
            response.json().then((data) => resolve(data.text));
          })
          .catch((e) => {
            reject(e);
          });
      } else {
        resolve("");
      }
    });
  }
  runLiveTranscriber(rest, data, hash, modelId, onTranscriptCallback) {
    Logger.log(-1, "DocEngine.runLiveTranscriber()");
    return this.transcribeLiveAudio(rest, data, hash, modelId, onTranscriptCallback);
  }

  async getMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch (error) {
      console.error("error accessing microphone:", error);
      throw error;
    }
  }

  async openMicrophone(microphone, socket) {
    return new Promise((resolve) => {
      microphone.onstart = () => {
        console.log("client: microphone opened");
        document.body.classList.add("recording");
        resolve();
      };

      microphone.onstop = () => {
        console.log("client: microphone closed");
        document.body.classList.remove("recording");
      };

      microphone.ondataavailable = (event) => {
        console.log("client: microphone data received");
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      microphone.start(1000);
    });
  }

  async closeMicrophone(microphone) {
    microphone.stop();
  }

  async transcribeLiveAudio(rest, data, hash, appID, onTranscriptCallback) {
    try {
      const configData = {
        ...rest,
        hash: hash,
        appID: appID,
      };
      const header = await this.createDefaultHeader(configData, hash, appID);

      const wsProtocol = Services.getConfig().node_URL.startsWith("https") ? "wss" : "ws";
      const wsURL = Services.getConfig().node_URL.replace(/^https?/, wsProtocol) + "/live-transcription";

      const ws = new WebSocket(wsURL);

      ws.onopen = () => {
        console.log("WebSocket connection opened");
        ws.send(
          JSON.stringify({
            header: header,
            data: configData,
          })
        );
        this.getMicrophone().then(async (microphone) => {
          await this.openMicrophone(microphone, ws);
        });
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message && message.channel && message.channel.alternatives) {
          const transcript = message.channel.alternatives[0].transcript;
          console.log("Transcript:", transcript);
          if (onTranscriptCallback) {
            onTranscriptCallback(transcript);
          }
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        this.stopAudioCapture();
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.websocket = ws;
    } catch (e) {
      console.error("Error during live transcription:", e);
      throw e;
    }
  }

  async startAudioCapture() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options = { mimeType: "audio/webm" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`);
      return;
    }
    return new MediaRecorder(stream, options);
  }

  stopAudioCapture() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.close();
    }
  }

  runTranscriber(rest, data, hash, modelId) {
    Logger.log(-1, "DocEngine.run()");
    return this.transcribeAudio(rest, data, hash, modelId);
  }

  async transcribeAudio(rest, data, hash, appID) {
    try {
      const fileDataBinding = rest.input?.fileDataBinding;
      if (fileDataBinding) {
        const audioInput = data[fileDataBinding];

        // Determine if it's a File, Blob, or URL
        const isFileOrBlob = typeof audioInput === "object" && (audioInput instanceof File || audioInput instanceof Blob);
        const isURL = typeof audioInput === "string";

        const configData = {
          ...rest,
          audio: audioInput,
          isFileOrBlob,
          isURL,
        };

        const formData = await this.buildFormData(configData);

        // Log formData content for debugging
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        const header = await this.createDefaultHeader(configData, hash, appID);
        console.debug(header);

        const response = await fetch(Services.getConfig().node_URL + "/transcribe-audio", {
          method: "POST",
          mode: "cors",
          headers: header,
          cache: "no-cache",
          redirect: "follow",
          referrerPolicy: "no-referrer",
          body: formData,
        });
        console.log("Response status:", response.status);

        const result = await response.json();
        console.log("Transcription result:", result);

        return result;
      }
      return "";
    } catch (e) {
      console.error("Error during transcription:", e);
      throw e;
    }
  }

  runTextToDoc(configData, data, hash, appID) {
    Logger.log(-1, "DocEngine.run()", hash, appID);
    return this.parseTextToDoc(configData, data, hash, appID);
  }

  async parseTextToDoc(config, data, hash, appID) {
    Logger.log(1, "DocEngine.parseDocument()", "enter >");
    return new Promise(async (resolve, reject) => {
      const databinding = config.input?.databinding;
      const configData = {
        valuestr: data[databinding],
        ...config,
      };
      const formData = await this.buildFormData(configData);
      const header = await this.createDefaultHeader(configData, hash, appID, data);
      fetch(`${Services.getConfig().node_URL}` + "/text-to-doc", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: header,
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: formData,
      })
        .then((response) => response.blob())
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const format = configData.output.format;
          let urlWithDocxExtension;
          if (format === "docx") {
            urlWithDocxExtension = `${blobUrl}#output.docx`;
          }
          if (format === "csv") {
            urlWithDocxExtension = `${blobUrl}#output.csv`;
          } else if (format === "excel") {
            urlWithDocxExtension = `${blobUrl}#output.xlsx`;
          } else if (format === "pdf") {
            urlWithDocxExtension = `${blobUrl}#output.pdf`;
          }
          resolve(urlWithDocxExtension);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  async buildFormData(configData) {
    const formData = new FormData();
    if (configData.input.type === "file") {
      const file = configData.file;
      formData.append("doc", file);
      Logger.log(-1, "DocEngine.buildFormData()", "file added", formData);
    } else if (configData.input.type === "url") {
      formData.append("url", configData.input.url);
      Logger.log(-1, "DocEngine.buildFormData()", "url added", formData);
    } else if (configData.input.type === "AUDIO") {
      const audioInput = configData.audio;

      if (configData.isFileOrBlob) {
        // Audio input is a File or Blob (in-memory)
        formData.append("audio", audioInput);
      } else if (configData.isURL) {
        // Audio input is a URL, fetch and convert to Blob
        const audioBlob = await this.getBlobFromUrl(audioInput);
        formData.append("audio", audioBlob, "recording.wav");
      } else {
        throw new Error("Invalid audio input type.");
      }

      formData.append("data", JSON.stringify(configData));
      Logger.log(-1, "DocEngine.buildFormData()", "audio added", formData);
    } else if (configData.input.type === "markdown") {
      const content = typeof configData.valuestr === "object" ? JSON.stringify(configData.valuestr) : configData.valuestr;
      formData.append("doc", content);
      formData.append("format", configData.output.format);
      Logger.log(-1, "DocEngine.buildFormData()", "value added", formData);
    }
    return formData;
  }

  async getBlobFromUrl(audioUrl) {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error("Failed to fetch the audio blob:", error);
      throw error;
    }
  }

  handleOutput(resolve, reject, response) {
    Logger.log(2, "DocEngine.handleOutput()", "enter", response);
    if (response.ok) {
      response.json().then((data) => {
        Logger.log(2, "DocEngine.handleOutput()", "exit", data);
        resolve(data);
      });
      return;
    }
    reject(new Error(`Could not process the document: ${response.statusText}`));
  }

  async createDefaultHeader(request, hash, appID, values) {
    let headers = {};
    headers["x-flowrabbit-hash"] = hash;
    headers["x-flowrabbit-appid"] = appID;
    if (request && request.input && request.input.type === "url") {
      return { "Content-Type": "application/json", Accept: "application/json" };
    }

    if (request.token) {
      let token = await this.buildToken(request, values);
      headers["Authorization"] = `${token}`.trim();
    }
    return headers;
  }

  async buildToken(request, values) {
    let data = await this.fillString(request.token, values, true);
    Logger.log(1, "RestEngine.buildToken()", "exit", data);
    return data;
  }

  async fillString(s, values) {
    for (let key in values) {
      let value = this.getValueByKey(values, key);
      let pattern = "${" + key + "}";
      s = this.replacePattern(s, pattern, value);
    }
    if (s.indexOf("${") >= 0) {
      Logger.log(-1, "RestEngine.fillString()", "> Not all parameters replaced!" + s);
    }
    return s;
  }

  replacePattern(s, pattern, value) {
    let i = 0;
    while (s.indexOf(pattern) >= 0 && i < 100) {
      s = s.replace(pattern, value);
      i++;
    }
    return s;
  }

  getValueByKey(values, key) {
    return values[key];
  }

  getAuthType(request) {
    if (request.authType === "Bearer") {
      return "Bearer";
    }
    if (request.authType === "Basic") {
      return "Basic";
    }
    return "";
  }
}

export default new DocEngine();
