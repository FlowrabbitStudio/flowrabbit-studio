import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import axios from "axios";
import fs from "fs";
import SecretService from "./SecretService.js";

class Transcriber {

  constructor(apiServer, apiKey) {
    this.apiKey = apiKey;
    this.apiServer = apiServer;
    this.secretService = new SecretService(apiServer, apiKey); 
  }

  async transcribeAudio(req, res, token) {
    try {
      let filePath = req.file?.path;
      const result = await this.transcribeFile(filePath, req, token);
      const transcription =
        result.results.channels[0].alternatives[0].transcript;
      let duration = result?.metadata?.duration;
      if (duration) await this.calculateCost(req, duration, token);
      res.send({ text: transcription, ...result });
    } catch (error) {
      console.error("Failed to process audio:", error);
      res
        .status(500)
        .json({ message: "Failed to process audio", error: error.toString() });
    }
  }

  async transcribeFile(file, req, apiKey) {
    const deepgram = createClient(apiKey);
    const data = JSON.parse(req.body.data);
    if (data.type === "deepgram") {
      const model = data.vars["model"];
      const detectLanguage = data.vars["detect_language"];
      const fileBuffer = fs.readFileSync(file)
      const { result, error } =
        await deepgram.listen.prerecorded.transcribeFile(
          fileBuffer,
          {
            model: model || "nova-2",
            smart_format: true,
            detect_language: detectLanguage || false,
            ...data.vars,
          }
        );
      if (error) throw error;
      return result;
    }
    return "";
  }

  isAppStoreApp(headers) {
    const isappstore = headers["x-flowrabbit-appstore"];
    return isappstore;
  }

  async calculateCost(req, duration, token) {
    const luisaheaders = req.headers;
    try {
      if (luisaheaders) {
        const isAppStoreApp = this.isAppStoreApp(luisaheaders);
        if (!isAppStoreApp) return 0;
        const aiModelId = luisaheaders["x-flowrabbit-secret-name"];
        const disableCredits = luisaheaders["x-flowrabbit-disable-c"];
        if (
          disableCredits &&
          disableCredits !== "undefined" &&
          disableCredits !== "false"
        ) {
          return 0;
        }
        if (aiModelId) {
          const type = luisaheaders["x-flowrabbit-model-type"];
          const hash = luisaheaders["x-flowrabbit-hash"];
          let quantity = luisaheaders["x-flowrabbit-quantity"] || 1;
          console.log(`For model type ${type} calling model ${aiModelId}`);

          duration = duration / 60;
          console.log("Min:" + duration);

          const bearerToken = luisaheaders["x-flowrabbit-user-token"];
          const url = `${this.apiServer}/rest/public/secrets/${hash}/secret/${aiModelId}.json`;
          const headers = {
            "flowrabbit-api-key": this.apiKey,
            Authorization: bearerToken,
          };
          if (typeof quantity === "string") quantity = parseInt(quantity);

          const data = {
            quantity: duration,
          };

          const result = await axios.post(url, data, { headers });
          console.log(result.data)
          return result?.data;
        }
      }
    } catch (error) {
      console.log("Failed to calculate cost", error);
    }
    return 0;
  }

  setupDeepgram(ws, headers, clientData, token) {
    const deepgramClient = createClient(token || process.env.DEEPGRAM_API_KEY);
    const model = clientData.vars["model"] || "base";
    const deepgramOptions = {
      smart_format: true,
      model: model || "nova-2",
      ...clientData.vars,
    };
    const deepgram = deepgramClient.listen.live(deepgramOptions);

    deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
      console.log("deepgram: connected");

      deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
        console.log("deepgram: transcript received");
        console.log("ws: transcript sent to client");
        ws.send(JSON.stringify(data));
      });

      deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
        console.log("deepgram: disconnected");
        deepgram.finish();
      });

      deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
        console.log("deepgram: error received");
        console.error(error);
      });

      deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
        console.log("deepgram: warning received");
        console.warn(warning);
      });

      deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
        console.log("deepgram: metadata received");
        console.log("ws: metadata sent to client");
        ws.send(JSON.stringify({ metadata: data }));
      });
    });

    return deepgram;
  }

  async connectLiveTranscription(ws, deepgram, isAuthenticated, clientHeaders, clientData, token, message) {
    console.log("ws: client connected");
    if (!isAuthenticated) {
      try {
        const initialData = JSON.parse(message);
        clientHeaders = initialData.header;
        clientData = initialData.data;

        const secrets = await this.secretService.getSecrets(
          clientHeaders,
          "https://api.deepgram.com"
        );
        token = this.secretService.getAuthToken("Authorization", clientHeaders, secrets);

        if (clientData.type === "deepgram") {
          deepgram = this.setupDeepgram(ws, clientHeaders, clientData, token);
          isAuthenticated = true;
          console.log("Client authenticated and Deepgram setup completed.");
        }
      } catch (err) {
        console.error("Authentication failed:", err);
        ws.close();
      }
      return;
    }

    // Process audio data
    console.log("ws: client data received");

    if (deepgram.getReadyState() === 1 /* OPEN */) {
      console.log("ws: data sent to deepgram");
      deepgram.send(message);
    } else if (deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
      console.log("ws: data couldn't be sent to deepgram");
      console.log("ws: retrying connection to deepgram");

      deepgram.finish();
      deepgram.removeAllListeners();
      deepgram = this.setupDeepgram(ws, clientHeaders, clientData, token);
    } else {
      console.log("ws: data couldn't be sent to deepgram");
    }

    ws.on("close", () => {
      console.log("ws: client disconnected");
      if (deepgram) {
        deepgram.finish();
        deepgram.removeAllListeners();
        deepgram = null;
      }
    });
  }

  closeLiveTranscription(deepgram) {
    console.log("ws: client disconnected");
    if (deepgram) {
      deepgram.finish();
      deepgram.removeAllListeners();
      deepgram = null;
    }
  }
}

export default Transcriber;
