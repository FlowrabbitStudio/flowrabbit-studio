import axios from "axios";

export function proxyCommonMiddleware(req, res, next) {
  req._luisaHeaders = req.headers;

  if (req.headers["x-flowrabbit-headers"]) {
    const allowedHeaders = req.headers["x-flowrabbit-headers"];
    const parts = allowedHeaders.toLowerCase().split(";");
    console.info("filterHeaders() > ", parts);
    const newHeaders = {};
    parts.forEach((key) => {
      newHeaders[key] = req.headers[key];
    });
    req.headers = newHeaders;
  }
  next();
}

export function rawBodyBufferMiddleware(req, res, next) {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    req.rawBody = Buffer.concat(chunks);
    next();
  });
}

export async function secretRetrievalMiddleware(req, res, next) {
  const { "x-forwarded-host": target, "x-flowrabbit-hash": hash, "x-flowrabbit-appid": appID } =
    req._luisaHeaders || {};
  console.info(`checkRequest() > target ${target}`);

  if (hash && appID) {
    try {
      // secretService is attached to app.locals in index.js
      const secretService = req.app.locals.secretService;
      const secrets = await secretService.getSecrets(req._luisaHeaders, target);
      req._luisaSecrets = secrets;
      req._luisaTarget = target;
      return next();
    } catch (error) {
      console.error(`Error retrieving secrets for appID: ${appID}`, error);
      const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
      let errorMessage;
      switch (status) {
        case 405:
          errorMessage = "Error: No budget left";
          break;
        case 408:
          errorMessage = "Error: Organization is blocked";
          break;
        case 409:
          errorMessage = "Error: Organization is not paid";
          break;
        case 404:
          errorMessage = "Error: No organization found or missing data";
          break;
        default:
          errorMessage = `Error: Unexpected error with status code ${status}`;
      }
      if (!res.headersSent) {
        return res.status(status).json({ error: errorMessage });
      }
      return;
    }
  }
  next();
}
