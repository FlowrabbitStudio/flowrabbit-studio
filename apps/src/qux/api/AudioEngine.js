import RestUtil from "../../util/RestUtil";
import Logger from "../core/Logger";
import Services from "../../services/Services";

class AudioEngine {
  constructor() {
    this.nodeURL = Services.getConfig().node_URL;
    //this.nodeURL = "http://localhost:8088";
  }
  runTranscriber(rest, data, hash, modelId) {
    Logger.log(-1, "DocEngine.run()");
    return this.transcribeAudio(rest, data, hash, modelId);
  }

  async transcribeAudio(rest, data, hash, appID, isAppStore) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileDataBinding = rest.input?.fileDataBinding;
        if (fileDataBinding) {
          const filedata = data[fileDataBinding];
          if (!filedata) return;
          let audioInput = filedata.file || filedata;
          let duration = filedata.duration;

          const isFileOrBlob =
            typeof audioInput === "object" &&
            (audioInput instanceof File || audioInput instanceof Blob);
          const isURL = typeof audioInput === "string";

          if (
            typeof audioInput === "string" &&
            audioInput.startsWith("data:")
          ) {
            audioInput = this.dataURLtoBlob(audioInput);
          }

          if (isFileOrBlob) {
            // Check if the file is a video before extracting audio
            const fileType = audioInput.type;

            console.log(`Original file size: ${audioInput.size / 1024} KB`);

            if (fileType.startsWith("video/")) {
              console.log("File is a video. Extracting audio...");
              audioInput = await this.extractAudioFromVideo(audioInput);

              console.log(
                `Extracted audio file size: ${audioInput.size / 1024} KB`
              );
            } else {
              console.log("File is not a video, no need to extract audio.");
            }
          }

          const configData = {
            ...rest,
            audio: audioInput,
            isFileOrBlob,
            isURL,
            duration,
          };

          const formData = await this.buildFormData(configData);

          for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }

          const header = await RestUtil.createDefaultHeader(
            configData,
            data,
            hash,
            appID,
            isAppStore
          );

          fetch(Services.getConfig().node_URL + "/transcribe-audio", {
            method: "POST",
            mode: "cors",
            headers: header,
            cache: "no-cache",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: formData,
          })
            .then((response) => {
              this.handleOutput(resolve, reject, rest, response);
            })
            .catch((e) => {
              reject(e);
            });
        }
      } catch (e) {
        console.error("Error during transcription:", e);
        throw e;
      }
    });
  }
  handleOutput(resolve, reject, request, response) {
    Logger.log(2, "RestEngine.handleOutput()", "enter", response);

    if (response.ok) {
      try {
        resolve(response.json());
      } catch (e) {
        reject(
          new Error(`Could not ${request.method} ${request.url}: ${e.message}`)
        );
      }
      return "";
    } else {
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
    }
  }

  async runLiveTranscriber(
    rest,
    data,
    hash,
    modelId,
    mediaValue,
    isAppStore,
    onTranscriptCallback
  ) {
    Logger.log(-1, "DocEngine.runLiveTranscriber()");
    return this.transcribeLiveAudio(
      rest,
      data,
      hash,
      modelId,
      mediaValue,
      isAppStore,
      onTranscriptCallback
    );
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

  async getMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch (error) {
      console.error("error accessing microphone:", error);
      throw error;
    }
  }

  async closeMicrophone(microphone) {
    microphone.stop();
  }

  transcribeLiveAudio(
    rest,
    data,
    hash,
    appID,
    mediaValue,
    isAppStore,
    onTranscriptCallback
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const configData = {
          ...rest,
          hash: hash,
          appID: appID,
        };

        const header = await RestUtil.createDefaultHeader(
          configData,
          data,
          hash,
          appID,
          isAppStore
        );

        const wsProtocol = Services.getConfig().node_URL.startsWith("https") ? "wss" : "ws";
        const wsURL =
        Services.getConfig().node_URL.replace(/^https?/, wsProtocol) + "/live-transcription";

        const ws = new WebSocket(wsURL);

        ws.onopen = async () => {
          console.log("WebSocket connection opened");
          ws.send(
            JSON.stringify({
              header: header,
              data: configData,
            })
          );
          await this.openMicrophone(mediaValue, ws);
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message) {
            if (onTranscriptCallback) {
              onTranscriptCallback(message);
            }
          }
        };

        ws.onclose = (event) => {
          console.log("WebSocket connection closed: " + event.code);
          this.closeMicrophone(mediaValue);
          resolve();
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.closeMicrophone(mediaValue);
          reject(error);
        };

        this.websocket = ws;
      } catch (e) {
        console.error("Error during live transcription:", e);
        reject(e);
      }
    });
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

  async buildFormData(configData) {
    const formData = new FormData();
    if (configData.input.type === "file") {
      const file = configData.file;
      formData.append("doc", file);
    } else if (configData.input.type === "url") {
      formData.append("url", configData.input.url);
    } else if (configData.input.type === "AUDIO") {
      const audioInput = configData.audio;

      if (configData.isFileOrBlob) {
        formData.append("audio", audioInput, "audio.wav"); // Ensure it's named correctly
      } else if (configData.isURL) {
        const audioBlob = await this.getBlobFromUrl(audioInput);
        formData.append("audio", audioBlob, "audio.wav");
      } else {
        throw new Error("Invalid audio input type.");
      }

      formData.append("data", JSON.stringify(configData));
    }
    return formData;
  }

  dataURLtoBlob(dataurl) {
    const [header, data] = dataurl.split(",");
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const binary = atob(data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
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

  async extractAudioFromVideo(videoFileAsBlob) {
    try {
      // Convert the video Blob to ArrayBuffer
      const videoArrayBuffer = await videoFileAsBlob.arrayBuffer();

      // Create an AudioContext to decode the audio data
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const decodedAudioData = await audioContext.decodeAudioData(
        videoArrayBuffer
      );

      const numberOfChannels = decodedAudioData.numberOfChannels;
      const sampleRate = 16000; // Resample to 16kHz if needed
      const duration = decodedAudioData.duration;

      // Create an OfflineAudioContext for resampling
      const offlineAudioContext = new OfflineAudioContext(
        numberOfChannels,
        sampleRate * duration,
        sampleRate
      );
      const soundSource = offlineAudioContext.createBufferSource();

      // Connect the buffer and render the audio
      soundSource.buffer = decodedAudioData;
      soundSource.connect(offlineAudioContext.destination);
      soundSource.start();

      const renderedBuffer = await offlineAudioContext.startRendering();
      console.log("Rendered AudioBuffer:", renderedBuffer);

      // Convert the rendered AudioBuffer to WAV using audiobuffer-to-wav
      const wavArrayBuffer = this.audioBufferToWav(renderedBuffer);

      // Create a Blob for the WAV file
      const wavBlob = new Blob([wavArrayBuffer], { type: "audio/wav" });

      console.log("Extracted valid WAV audio Blob:", wavBlob);

      return wavBlob;
    } catch (error) {
      console.error("Error extracting audio from video:", error);
      throw error;
    }
  }

  audioBufferToWav(buffer, options = {}) {
    const numOfChannels = buffer.numberOfChannels;
    const sampleRate = options.sampleRate || buffer.sampleRate;
    const format = options.format || 1; // PCM format
    const bitDepth = options.bitDepth || 16; // 16-bit depth

    // Calculate the necessary buffer size
    const blockAlign = numOfChannels * (bitDepth / 8);
    const byteRate = sampleRate * blockAlign;
    const wavBufferLength = 44 + buffer.length * blockAlign; // 44 bytes for WAV header

    // Create an ArrayBuffer for the final WAV file
    const wavBuffer = new ArrayBuffer(wavBufferLength);
    const view = new DataView(wavBuffer);

    // Write the RIFF header
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, wavBufferLength - 8, true); // File size minus the 'RIFF' and size bytes
    this.writeString(view, 8, "WAVE");

    // Write the fmt subchunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, format, true); // Audio format (1 for PCM)
    view.setUint16(22, numOfChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, byteRate, true); // Byte rate
    view.setUint16(32, blockAlign, true); // Block align
    view.setUint16(34, bitDepth, true); // Bits per sample

    // Write the data subchunk
    this.writeString(view, 36, "data");
    view.setUint32(40, wavBufferLength - 44, true); // Subchunk2Size (data size)

    // Write the PCM data
    if (bitDepth === 16) {
      this.floatTo16BitPCM(view, 44, buffer);
    } else {
      throw new Error("Only 16-bit depth is supported at this time.");
    }

    return wavBuffer;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  floatTo16BitPCM(view, offset, buffer) {
    const channels = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let sampleIndex = 0;
    const length = buffer.length;

    // Interleave the channels
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i])); // Clamp the sample between -1 and 1
        view.setInt16(
          offset + sampleIndex * 2,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        ); // Convert to 16-bit PCM
        sampleIndex++;
      }
    }
  }
}

export default new AudioEngine();
