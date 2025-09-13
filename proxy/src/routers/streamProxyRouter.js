import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { parseURL } from "../utils/utils.js";  // Adjusted path as needed
import { onProxyReq, handleStreamingProxyResponse } from "../utils/proxyHandlers.js";
import {
  proxyCommonMiddleware,
  rawBodyBufferMiddleware,
  secretRetrievalMiddleware,
} from "../utils/proxyMiddlewares.js";

function streamingHeadersMiddleware(req, res, next) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // Explicitly disable buffering by reverse proxies (e.g. Nginx)
  res.setHeader("X-Accel-Buffering", "no");
  // Immediately flush headers
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }
  next();
}

function createCustomProxyMiddleware() {
  return createProxyMiddleware({
    target: "http://www.example.org",
    changeOrigin: true,
    ws: true,
    proxyTimeout: 60000,
    timeout: 60000,
    router: (req) => {
      const target = req._luisaHeaders["x-forwarded-host"] || "http://www.example.org";
      const { host } = parseURL(target);
      return host;
    },
    onProxyReq,
    pathRewrite: (path, req) => {
      const target = req._luisaHeaders["x-forwarded-host"] || "http://www.example.org";
      const { path: targetPath } = parseURL(target);
      return targetPath;
    },
    onError: (err, req, res) => {
      console.error("Proxy encountered an error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error proxying to API" });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      handleStreamingProxyResponse(proxyRes, req, res);
    },
    selfHandleResponse: true,
  });
}

const router = express.Router();
router.use(proxyCommonMiddleware);
router.use(rawBodyBufferMiddleware);
router.use(secretRetrievalMiddleware);
router.use(streamingHeadersMiddleware);
router.use("/", createCustomProxyMiddleware());

export default router;
