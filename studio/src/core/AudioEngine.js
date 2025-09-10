import Logger from "./Logger";
import RestUtil from "../util/RestUtil.js";
import Services from "../services/Services.js";

class AudioEngine {
  constructor() {
    this.nodeURL = Services.getConfig().node_URL;
    //this.nodeURL = "http://localhost:8088";
  }
  runTranscriber(rest, data, hash, modelId) {
    Logger.log(-1, "DocEngine.run()");
    return this.transcribeAudio(rest, data, hash, modelId);
  }

  async transcribeAudio(rest, data, hash, appID) {
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

        if (typeof audioInput === "string" && audioInput.startsWith("data:")) {
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
          appID
        );
        console.debug(header);

        const response = await fetch(this.nodeURL + "/transcribe-audio", {
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

  runLiveTranscriber(rest, data, hash, modelId, onTranscriptCallback) {
    Logger.log(-1, "DocEngine.runLiveTranscriber()");
    return this.transcribeLiveAudio(
      rest,
      data,
      hash,
      modelId,
      onTranscriptCallback
    );
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
        this.recordingStartTime = Date.now();

        this.durationInterval = setInterval(() => {
          const elapsed = (Date.now() - this.recordingStartTime) / 1000;
          if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(
              JSON.stringify({
                type: "duration",
                duration: elapsed,
              })
            );
          }
        }, 1000);

        resolve();
      };

      microphone.onstop = () => {
        console.log("client: microphone closed");
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
      const header = await RestUtil.createDefaultHeader(
        configData,
        data,
        hash,
        appID
      );

      const wsProtocol = this.nodeURL.startsWith("https") ? "wss" : "ws";
      const wsURL =
        this.nodeURL.replace(/^https?/, wsProtocol) + "/live-transcription";

      const ws = new WebSocket(wsURL);
      const microphone = await this.getMicrophone();
      ws.onopen = async () => {
        console.log("WebSocket connection opened");
        ws.send(
          JSON.stringify({
            header: header,
            data: configData,
          })
        );
        await this.openMicrophone(microphone, ws);
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
        console.log("WebSocket connection closed" + event);
        this.closeMicrophone(microphone);
        this.stopAudioCapture();
      };

      ws.onerror = (error) => {
        this.closeMicrophone(microphone);
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
        formData.append("audio", audioInput, "audio.wav");  // Ensure it's named correctly
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
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const decodedAudioData = await audioContext.decodeAudioData(videoArrayBuffer);
  
      const numberOfChannels = decodedAudioData.numberOfChannels;
      const sampleRate = 16000; // Resample to 16kHz if needed
      const duration = decodedAudioData.duration;
  
      // Create an OfflineAudioContext for resampling
      const offlineAudioContext = new OfflineAudioContext(numberOfChannels, sampleRate * duration, sampleRate);
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
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, wavBufferLength - 8, true); // File size minus the 'RIFF' and size bytes
    this.writeString(view, 8, 'WAVE');
  
    // Write the fmt subchunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, format, true); // Audio format (1 for PCM)
    view.setUint16(22, numOfChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, byteRate, true); // Byte rate
    view.setUint16(32, blockAlign, true); // Block align
    view.setUint16(34, bitDepth, true); // Bits per sample
  
    // Write the data subchunk
    this.writeString(view, 36, 'data');
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
        view.setInt16(offset + sampleIndex * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); // Convert to 16-bit PCM
        sampleIndex++;
      }
    }
  }
}

export default new AudioEngine();
