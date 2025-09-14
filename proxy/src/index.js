import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Config from "./services/Config.js";
import SecretService from "./services/SecretService.js";
import CostCalculator from "./services/CostCalculator.js";

import proxyRouter from "./routers/proxyRouter.js";
import streamProxyRouter from "./routers/streamProxyRouter.js";

const version = "FlowRabbit Proxy 5.0.13";
const startedAt = new Date().toISOString();

const config = new Config();
const apiServer = config.getAPIServer();
const apiKey = await config.getAPIKey();

if (!apiKey) {
  console.error("No config value for FLR_CLIENT_API_KEY");
  throw new Error("No config value for FLR_CLIENT_API_KEY");
}

const secretService = new SecretService(apiServer, apiKey);
const costCalculator = new CostCalculator(apiServer, apiKey, secretService);

const app = express();

// Attach dependencies so that middleware/handlers can access them
app.locals.secretService = secretService;
app.locals.costCalculator = costCalculator;

// Global middleware for non-proxy endpoints
// Note: Exclude both /proxy and /stream so that they are not processed by body-parser.
app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true,
    type: (req) => !req.originalUrl.startsWith("/proxy") && !req.originalUrl.startsWith("/stream"),
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    type: (req) => !req.originalUrl.startsWith("/proxy") && !req.originalUrl.startsWith("/stream"),
  })
);
app.use(cors());

// Mount routers
app.use("/proxy", proxyRouter);
app.use("/stream", streamProxyRouter);

// Example status and echo endpoints
app.get("/status.json", (req, res) => {
  res.json({
    version,
    startedAt,
    status: "running",
  });
});

app.get("/echo.json", (req, res) => {
  res.json({
    host: req.baseUrl,
    path: req.path,
    query: req.query,
    headers: req.headers,
  });
});

app.post("/echo.json", (req, res) => {
  res.json({
    host: req.baseUrl,
    path: req.path,
    query: req.query,
    headers: req.headers,
    body: req.body,
  });
});

const server = app.listen(8084, () => {
  console.error("************************************");
  console.error("FlowRabbit - Proxy");
  console.error("Version " + version);
  console.error("Listening on " + server.address().port);
  console.error("API " + apiServer);
  console.error("API-KEY " + (apiKey ? apiKey.length : 0));
  console.error("************************************");
});

export { app, server };
