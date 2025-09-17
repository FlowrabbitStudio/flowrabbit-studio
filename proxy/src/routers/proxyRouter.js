import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { parseURL } from "../utils/utils.js";
import { onProxyReq, handleNormalProxyResponse } from "../utils/proxyHandlers.js";
import {
  proxyCommonMiddleware,
  rawBodyBufferMiddleware,
  secretRetrievalMiddleware,
} from "../utils/proxyMiddlewares.js";

function createCustomProxyMiddleware() {
  return createProxyMiddleware({
    target: "http://www.example.org", // Dummy target; router resolves dynamically.
    changeOrigin: true,
    ws: false,
    proxyTimeout: 60000,
    timeout: 60000,
    router: (req) => {
      const target = req._luisaHeaders["x-flowrabbit-proxy-target"];
      console.info(`Proxying request to target: ${target}`);
      const { host } = parseURL(target);
      console.info(`Proxying request to host: ${host}`);
      return host;
    },
    onProxyReq,
    pathRewrite: (path, req) => {
      const target = req._luisaHeaders["x-flowrabbit-proxy-target"];
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
      handleNormalProxyResponse(proxyRes, req, res);
    },
    selfHandleResponse: true,
  });
}

const router = express.Router();
router.use(proxyCommonMiddleware);
router.use(rawBodyBufferMiddleware);
router.use(secretRetrievalMiddleware);
router.use("/", createCustomProxyMiddleware());

export default router;
