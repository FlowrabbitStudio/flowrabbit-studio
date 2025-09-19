import SecretService from "./SecretService.js";
import { fal } from "@fal-ai/client";
import fetch from 'node-fetch-polyfill';
class VideoAI {
  constructor(apiServer, apiKey) {
    this.apiKey = apiKey;
    this.apiServer = apiServer;
    this.secretService = new SecretService(apiServer, apiKey);
  }
  async generateTextToVideo(req, res, token) {
    try {
      if (!token) {
        res.status(500).json({
          message: "Video generation filed"
        });
      }
      fal.config({
        fetch: fetch,
        credentials: token
      });
      const headers = req.headers;
      const body = req.body;
      const modelId = headers["x-flowrabbit-model-id"];
      let result = await fal.subscribe(modelId, {
        input: body,
        logs: true,
        onQueueUpdate: update => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map(log => log.message).forEach(console.log);
          }
        }
      });
      console.log("Video generated successfully");
      res.send(result);
    } catch (error) {
      console.error("Video generation filed:", error);
      res.status(500).json({
        message: "Video generation filed",
        error: error.toString()
      });
    }
  }
}
export default VideoAI;