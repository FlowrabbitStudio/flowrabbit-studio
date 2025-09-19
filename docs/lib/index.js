import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import multer from "multer";
import DocParser from "./components/DocParser.js";
import Transcriber from "./components/Transcriber.js";
import fs from "fs";
import FTPEngine from "./components/FTPEngine.js";
import "dotenv/config";
import _ from "lodash";
import axios from "axios";
import SecretService from "./components/SecretService.js";
import { WebSocketServer } from "ws";
import http from "http";
import { fileURLToPath } from "url";
import { URL } from "url";
import path from "path";
import { Blob } from "buffer";
import fetch from "node-fetch";
global.Blob = Blob;
globalThis.fetch = fetch;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiServer = process.env.FLR_INTERNAL_API_URL || 'http://localhost:8080';
const apiKey = process.env.FLR_CLIENT_API_KEY || process.env.FLR_CLIENT_API_KEY;
if (!apiKey) {
  console.error("Please create a .env file with the API_KEY");
  throw new Error("Please create a .env file with the API_KEY");
}
if (!apiServer) {
  console.error("Please create a .env file with the API_URL");
  throw new Error("Please create a .env file with the API_URL");
}
export const app = express();
const version = "FlowRabbit - Doc - 5.0.18";
const startedAt = new Date().toISOString();
const secretService = new SecretService(apiServer, apiKey);
const transcriber = new Transcriber(apiServer, apiKey);
const server = http.createServer(app);
const wss = new WebSocketServer({
  noServer: true
});
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import VideoAI from "./components/VideoAI.js";
const docUploads = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/doctmp/");
    },
    filename: function (req, file, cb) {
      const format = file.originalname.split(".").pop();
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + "." + format);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});
const preRecorderAudioUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/audiotmp/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = file.originalname.split(".").pop();
      cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});
const mdUploads = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/doctmp/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + ".md");
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});
app.use(cors());
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  console.log(pathname);
  if (pathname === "/live-transcription") {
    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
const setupDeepgram = (ws, headers, clientData, token, metadata) => {
  const deepgramClient = createClient(token || process.env.DEEPGRAM_API_KEY);
  const model = clientData.vars["model"] || "base";
  const deepgramOptions = {
    smart_format: true,
    model: model || "nova-2",
    ...clientData.vars
  };
  const deepgram = deepgramClient.listen.live(deepgramOptions);
  deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
    console.log("deepgram: connected");
    deepgram.addListener(LiveTranscriptionEvents.Transcript, data => {
      console.log("deepgram: transcript received");
      console.log("ws: transcript sent to client");
      console.log(data);
      metadata = data;
      ws.send(JSON.stringify(data));
    });
    deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
      console.log("deepgram: disconnected");
      let duration = metadata?.duration;
      if (duration) await transcriber.calculateCost({
        headers
      }, duration, token);
      deepgram.finish();
    });
    deepgram.addListener(LiveTranscriptionEvents.Error, async error => {
      console.log("deepgram: error received");
      console.error(error);
    });
    deepgram.addListener(LiveTranscriptionEvents.Warning, async warning => {
      console.log("deepgram: warning received");
      console.warn(warning);
    });
    deepgram.addListener(LiveTranscriptionEvents.Metadata, data => {
      console.log("deepgram: metadata received");
      console.log("ws: metadata sent to client");
      ws.send(JSON.stringify({
        metadata: data
      }));
    });
  });
  return deepgram;
};
wss.on("connection", ws => {
  console.log("ws: client connected");
  let deepgram;
  let isAuthenticated = false;
  let clientHeaders;
  let clientData;
  let token;
  let data = {};
  ws.on("message", message => {
    if (!isAuthenticated) {
      try {
        const initialData = JSON.parse(message);
        clientHeaders = initialData.header;
        clientData = initialData.data;
        secretService.getSecrets(clientHeaders, "https://api.deepgram.com").then(secrets => {
          token = getAuthToken("Authorization", clientHeaders, secrets);
          if (clientData.type === "deepgram") {
            deepgram = setupDeepgram(ws, clientHeaders, clientData, token);
            isAuthenticated = true;
            console.log("Client authenticated and Deepgram setup completed.");
          }
        }).catch(err => {
          console.error("Authentication failed:", err);
          ws.close();
        });
      } catch (err) {
        console.error("Failed to parse initial message:", err);
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
      deepgram = setupDeepgram(ws, clientHeaders, clientData, token, data);
    } else {
      console.log("ws: data couldn't be sent to deepgram");
    }
  });
  ws.on("close", () => {
    console.log("ws: client disconnected");
    if (deepgram) {
      deepgram.finish();
      deepgram.removeAllListeners();
      deepgram = null;
    }
  });
});
app.use("/doc", (req, res, next) => {
  req._luisaHeaders = req.headers;
  if (req.headers["x-flowrabbit-headers"]) {
    const allowedHeaders = req.headers["x-flowrabbit-headers"];
    const parts = allowedHeaders.toLowerCase().split(";");
    console.info("filterHeaders() > ", parts);
    const newHeaders = {};
    parts.forEach(key => {
      newHeaders[key] = req.headers[key];
    });
    req.headers = newHeaders;
  }
  next();
});
app.use("/doc", (req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  next();
});
app.use("/doc", (req, res, next) => {
  createProxyMiddleware({
    target: "http://www.example.org",
    changeOrigin: true,
    proxyTimeout: 60000,
    timeout: 60000,
    router: router,
    onProxyReq: onProxyReq,
    pathRewrite: pathRewrite,
    onError: (err, req, res) => {
      console.error("Proxy encountered an error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Error proxying to API"
        });
      }
    }
  })(req, res, next);
});
app.use(bodyParser.json({
  limit: "100mb"
}));
app.use(bodyParser.urlencoded({
  limit: "100mb",
  extended: true
}));

/**
 * Status
 */
app.get("/status.json", (req, res) => {
  res.send({
    version: version,
    startedAt: startedAt,
    status: "running"
  });
});

/**
 * Echo
 */
app.get("/echo.json", (req, res) => {
  res.send({
    host: req.baseUrl,
    path: req.path,
    query: req.query,
    headers: req.headers
  });
});
app.post("/echo.json", (req, res) => {
  res.send({
    host: req.baseUrl,
    path: req.path,
    query: req.query,
    headers: req.headers,
    body: req.body
  });
});
app.post("/doc-to-text", docUploads.single("doc"), async (req, res) => {
  try {
    console.info("doc-to-text");
    const parser = new DocParser();
    await parser.parseFile(req, res);
    console.info("doc-to-text done");
    removeFile(req);
  } catch (error) {
    console.error("Failed to process PDF:", error);
    removeFile(req);
    res.status(500).json({
      message: "Failed to process PDF",
      error: error.toString()
    });
  }
});
app.post("/text-to-doc", mdUploads.single("doc"), async (req, res) => {
  try {
    console.info("text-to-doc");
    const parser = new DocParser();
    await parser.converToDoc(req, res, __dirname);
    console.info("text-to-doc done");
    removeFile(req);
  } catch (error) {
    console.error("Failed to process PDF:", error);
    removeFile(req);
    res.status(500).json({
      message: "Failed to process PDF",
      error: error.toString()
    });
  }
});
app.post("/transcribe-audio", preRecorderAudioUpload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No audio file provided"
    });
  }
  if (req.file.mimetype !== "audio/wav") {
    return res.status(400).json({
      message: "Invalid audio format. Only WAV is supported."
    });
  }
  let secrets;
  try {
    console.info("get secrets");
    const headers = req.headers;
    secrets = await secretService.getSecrets(headers);
  } catch (error) {
    return handleError(error, res, req);
  } finally {
    removeFile(req);
  }
  try {
    console.info("transcribe-audio");
    const headers = req.headers;
    const token = getAuthToken("authorization", headers, secrets);
    await transcriber.transcribeAudio(req, res, token);
    removeFile(req);
    console.info("transcribe-audio done");
  } catch (error) {
    console.error("Transcription failed:", error);
    res.status(500).json({
      message: "Transcription failed",
      error: error.toString()
    });
  } finally {
    removeFile(req);
  }
});
app.post("/video", async (req, res) => {
  try {
    const headers = req.headers;
    const secrets = await secretService.getSecrets(headers);
    const token = getAuthToken("authorization", headers, secrets);
    const videoai = new VideoAI(apiServer, apiKey);
    await videoai.generateTextToVideo(req, res, token);
  } catch (error) {
    return handleError(error, res, req);
  }
});
app.post("/upload-file-ftp", docUploads.single("doc"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No audio file provided"
    });
  }
  try {
    const host = req.body.host;
    const user = req.body.user;
    const remotePath = req.body.path;
    const headers = req.headers;
    const secrets = await secretService.getSecrets(headers, host);
    const password = getAuthToken("authorization", headers, secrets);
    const config = {
      host: host,
      user: user,
      password: password
    };
    const ftpengine = new FTPEngine(config);
    const localPath = req.file.path;
    await ftpengine.uploadFile(localPath, remotePath);
    removeFile(req);
  } catch (error) {
    console.error("Transcription failed:", error);
    removeFile(req);
    res.status(500).json({
      message: "Transcription failed",
      error: error.toString()
    });
  }
});

/**
 * Proxy helpers
 */
export function parseURL(str) {
  const url = new URL(str);
  return {
    host: url.origin,
    path: url.pathname + url.search
  };
}
function router(req) {
  const headers = req._luisaHeaders;
  const target = headers["x-forwarded-host"];
  const url = parseURL(target);
  return url.host;
}
function removeFile(req) {
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, err => {
      if (err) {
        console.error("Failed to delete the file:", err);
      } else {
        console.log("Successfully deleted the file.");
      }
    });
  }
}
async function pathRewrite(path, req) {
  const headers = req._luisaHeaders;
  const target = headers["x-forwarded-host"];
  const hash = headers["x-flowrabbit-hash"];
  const appID = headers["x-flowrabbit-appid"];
  const url = parseURL(target);
  console.info("pathRewrite() > target " + target);
  if (hash && appID) {
    try {
      const secrets = await secretService.getSecrets(headers, url.host);
      req._luisaSecrets = secrets;
      req._luisaTarget = target;
    } catch (err) {
      console.error("pathRewrite() > Error could not get secrets > " + appID);
      console.error(err);
    }
  }
  return url.path;
}
async function onProxyReq(proxyReq, req) {
  const secrets = req._luisaSecrets;
  if (secrets) {
    const headers = req.headers;
    const target = req._luisaTarget;
    for (let key in headers) {
      const value = headers[key];
      const pos = value.indexOf("${secrets.");
      if (pos >= 0) {
        const secretKey = value.slice(pos + 10, -1);
        if (secrets[secretKey]) {
          const secret = secrets[secretKey];
          if (secretMatchesTarget(secret, target)) {
            console.info("onProxyReq() > Replace " + secretKey);
            const newValue = value.replace("${secrets." + secretKey + "}", secret.value);
            proxyReq.setHeader(key, newValue);
          } else {
            console.log("no matches: ");
            console.error("onProxyReq() > secret " + secretKey + " does not match");
          }
        }
      }
    }
  }
}
export function secretMatchesTarget(secret, target) {
  if (!target) {
    console.error("secretMatchesTarget() > No target");
    return false;
  }
  if (secret.domain) {
    if (target.indexOf(secret.domain) === 0) {
      return true;
    }
    return false;
  }
  // FIXME: This should not be allowed
  console.error("secretMatchesTarget() > No domain!");
  return true;
}
export function getAuthToken(key, headers, secrets) {
  const value = headers[key];
  if (!value) {
    headers[key.toLowerCase()];
  }
  if (value) {
    const pos = value.indexOf("${secrets.");
    if (pos >= 0) {
      const secretKey = value.slice(pos + 10, -1);
      if (secrets && secrets[secretKey]) {
        const newValue = secrets[secretKey].value;
        return newValue;
      }
    }
  }
  return value;
}
function handleError(error, res, req) {
  console.log("ERROR");
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    let errorMessage;
    switch (status) {
      case 405:
        errorMessage = "Error: No budget left";
        break;
      case 404:
        errorMessage = "Error: No organization found or missing data";
        break;
      default:
        errorMessage = `Error: Unexpected error with status code ${status}`;
    }
    res.status(status).json({
      error: errorMessage
    });
  } else {
    res.status(500).json({
      error: "Error: Unexpected error occurred"
    });
  }
}
server.listen(8088, () => {
  console.log("************************************");
  console.log("FlowRabbit - Docs");
  console.log("Version " + version);
  console.log("Listening on " + server.address().port);
  console.log("API " + apiServer);
  console.log("API-KEY " + process.env.API_KEY.length);
  console.log("************************************");
});