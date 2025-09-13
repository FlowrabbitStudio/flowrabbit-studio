import _ from "lodash";

/**
 * Processes a chunk of streaming data.
 *
 * This function accumulates data until newline boundaries, then splits the data into lines.
 * Each line is trimmed and parsed as JSON (if possible). Depending on the line content,
 * the data at the configured streamPath is extracted and immediately written to the response.
 *
 * @param {string} contents - The chunk contents as a string.
 * @param {object} res - The HTTP server response object.
 * @param {string} streamPath - The lodash path used to extract the data from the JSON.
 */
const processBuffer = (contents, res, streamPath) => {
  // Ensure there is a buffer for incomplete data.
  res.partialData = res.partialData || "";
  res.partialData += contents;

  // Split the accumulated data on newlines.
  const lines = res.partialData.split("\n");
  // Keep any incomplete line in the buffer.
  res.partialData = lines.pop();

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Skip empty lines

    let json;
    try {
      if (trimmed.startsWith("data: ") && !trimmed.includes("[DONE]")) {
        // Extract JSON string after "data: "
        json = JSON.parse(trimmed.slice(6).trim());
      } else if (trimmed.startsWith(": ")) {
        json = JSON.parse(trimmed.slice(2).trim());
      } else if (trimmed.includes("[DONE]")) {
        res.end();
        return;
      } else {
        // Attempt to parse any other line format as JSON.
        json = JSON.parse(trimmed);
      }
    } catch (error) {
      console.error("Failed to parse streamed JSON:", error, "Line:", line);
      return;
    }

    if (json && streamPath) {
      // If the JSON contains citations, store them.
      if (json.citations) {
        res.citations = json.citations;
      }
      // Use lodash to get the data at the specified stream path.
      const data = _.get(json, streamPath);
      if (data) {
        const buf = Buffer.from(data, "utf-8");
        res.write(buf);
        // Immediately flush if the method is available.
        if (typeof res.flush === "function") {
          res.flush();
        }
        res.tokensStream = (res.tokensStream || "") + data;
      }
    }
  });
};

/**
 * Handles proxy responses for streaming requests.
 *
 * The function:
 * 1. Accumulates the raw response (for cost calculation).
 * 2. Processes incoming data chunks as soon as they arrive.
 * 3. When the stream ends, it processes any remaining data and calculates the cost.
 *
 * @param {object} proxyResponse - The proxied backend response.
 * @param {object} request - The Express request object.
 * @param {object} serverResponse - The Express response object.
 */
export function handleStreamingProxyResponse(proxyResponse, request, serverResponse) {
  // Initialize an accumulator for the complete response (for cost calculation).
  let responseBody = Buffer.alloc(0);
  const headers = request._luisaHeaders;
  // Determine the stream path (case-insensitive lookup).
  const streamPathHeader = Object.keys(headers).find((h) => h.toLowerCase() === "x-flowrabbit-stream-path");
  const streamPath = headers[streamPathHeader];

  // Initialize tokensStream (to accumulate the streamed token data).
  serverResponse.tokensStream = "";

  // Process each data chunk.
  proxyResponse.on("data", (chunk) => {
    responseBody = Buffer.concat([responseBody, chunk]);
    processBuffer(chunk.toString(), serverResponse, streamPath);
  });

  // When the backend ends its response:
  proxyResponse.on("end", () => {
    // Process any remaining data.
    if (serverResponse.partialData && serverResponse.partialData.length > 0) {
      processBuffer("\n", serverResponse, streamPath);
    }

    // Calculate cost using the accumulated response and tokens stream.
    const costCalculator = request.app.locals.costCalculator;
    costCalculator
      .calculateCost(request, proxyResponse, responseBody, serverResponse.tokensStream)
      .then((cost) => {
        console.log("Cost:", cost);
        // Optionally, if there are citations, write them to the response.
        if (serverResponse.citations) {
          serverResponse.write("\n---CITATIONS_START---\n");
          serverResponse.write(JSON.stringify(serverResponse.citations));
          serverResponse.write("\n---CITATIONS_END---\n");
        }
        serverResponse.end();
      })
      .catch((err) => {
        console.error("Error calculating cost:", err);
        if (!serverResponse.headersSent) {
          serverResponse.writeHead(500, { "Content-Type": "application/json" });
          serverResponse.end(JSON.stringify({ error: "Error calculating cost" }));
        }
      });
  });

  proxyResponse.on("error", (err) => {
    console.error("Proxy response encountered an error:", err);
    if (!serverResponse.headersSent) {
      serverResponse.writeHead(500, { "Content-Type": "application/json" });
      serverResponse.end(JSON.stringify({ error: "Error processing proxy response" }));
    }
  });
}

/**
 * Handles proxy responses for normal (non-streaming) requests.
 *
 * Buffers the entire response, calculates cost, injects it into the JSON,
 * and then sends the modified response.
 *
 * @param {object} proxyResponse - The proxied backend response.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export function handleNormalProxyResponse(proxyResponse, req, res) {
  let responseBody = Buffer.alloc(0);
  proxyResponse.on("data", (chunk) => {
    responseBody = Buffer.concat([responseBody, chunk]);
  });
  proxyResponse.on("end", () => {
    const costCalculator = req.app.locals.costCalculator;
    costCalculator
      .calculateCost(req, proxyResponse, responseBody, "")
      .then((cost) => {
        try {
          const responseBodyStr = responseBody.toString();
          if (responseBodyStr) {
            const responseJson = JSON.parse(responseBodyStr);
            responseJson.cost = cost;
            const modifiedResponseBody = JSON.stringify(responseJson);
            const newHeaders = { ...proxyResponse.headers };
            delete newHeaders["content-length"];
            delete newHeaders["Content-Length"];
            res.writeHead(proxyResponse.statusCode, { ...newHeaders, "Content-Type": "application/json" });
            res.end(modifiedResponseBody);
          } else {
            res.writeHead(proxyResponse.statusCode, { ...proxyResponse.headers, "Content-Type": "application/json" });
            res.end(JSON.stringify({ cost }));
          }
        } catch (err) {
          console.error("Failed to process non-streaming response:", err);
          const newHeaders = { ...proxyResponse.headers };
          delete newHeaders["content-length"];
          delete newHeaders["Content-Length"];
          res.writeHead(proxyResponse.statusCode, { ...newHeaders, "X-Cost": cost });
          res.end(responseBody);
        }
      })
      .catch((err) => {
        console.error("Error calculating cost:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Error calculating cost" }));
        }
      });
  });
  proxyResponse.on("error", (err) => {
    console.error("Proxy response error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error processing proxy response" }));
    }
  });
}

/**
 * onProxyReq handler remains unchanged.
 *
 * It replaces any placeholders in headers with secret values and writes the raw body if present.
 *
 * @param {object} proxyReq - The proxy request object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export function onProxyReq(proxyReq, req, res) {
  const secrets = req._luisaSecrets;
  if (secrets) {
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value && value.indexOf("${secrets.") !== -1) {
        const secretKey = value.slice(value.indexOf("${secrets.") + 10, -1);
        if (secrets[secretKey]) {
          console.info(`onProxyReq() > Replacing secret for key ${secretKey}`);
          const newValue = value.replace(`\${secrets.${secretKey}}`, secrets[secretKey].value);
          proxyReq.setHeader(key, newValue);
        }
      }
    });
  }
  if (req.rawBody && req.rawBody.length > 0) {
    proxyReq.write(req.rawBody);
  }
}
