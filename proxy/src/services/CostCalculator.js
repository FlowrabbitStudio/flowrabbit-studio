// services/CostCalculator.js
import axios from "axios";

class CostCalculator {
  /**
   * @param {string} apiServer - The API server URL.
   * @param {string} apiKey - The API key.
   * @param {object} secretService - The secret service instance.
   */
  constructor(apiServer, apiKey, secretService) {
    this.apiServer = apiServer;
    this.apiKey = apiKey;
    this.secretService = secretService;
  }

  countTokens(text) {
    const charsPerToken = 4;
    return Math.ceil((text || "").length / charsPerToken);
  }

  calculateQuantityFromTokens(totalTokens) {
    return totalTokens / 1000000;
  }

  /**
   * Calculates the cost for a request.
   *
   * @param {object} req - Express request object.
   * @param {object} proxyResponse - The proxy response.
   * @param {Buffer} responseBody - Response body.
   * @param {string} tokensStream - Collected tokens in streaming mode.
   * @returns {Promise<number>}
   */
  async calculateCost(req, proxyResponse, responseBody, tokensStream) {
    const headers = req._luisaHeaders;
    try {
      // Only calculate cost for AppStore apps
      const aiModelId = headers["x-flowrabbit-secret-name"];
      const disableCredits = headers["x-flowrabbit-disable-c"];
      if (disableCredits && disableCredits !== "undefined" && disableCredits !== "false") {
        return 0;
      }

      if (aiModelId) {

        const type = headers["x-flowrabbit-model-type"];
        const hash = headers["x-flowrabbit-hash"];
        let quantity = headers["x-flowrabbit-quantity"] || 1;

        const bearerToken = headers["x-flowrabbit-user-token"];
        const url = `${this.apiServer}/rest/public/secrets/${hash}/secret/${aiModelId}.json`;
        const requestHeaders = {
          "flowrabbit-api-key": this.apiKey,
          Authorization: bearerToken,
        };

        let promptTokens = 0;
        let completionTokens = 0;
        let requestBody = null;
        if (req.rawBody && req.rawBody.length > 0) {
          try {
            requestBody = JSON.parse(req.rawBody.toString());
          } catch (e) {
            console.error("Failed to parse request body:", e);
          }
        }

        if (type === "llms") {
          if (requestBody && requestBody.messages) {
            requestBody.messages.forEach((msg) => {
              if (msg && msg.content) {
                promptTokens += this.countTokens(msg.content);
              }
            });
            console.log("Prompt tokens: " + promptTokens);
          }
          if (responseBody && !tokensStream) {
            const responseText = JSON.parse(responseBody.toString());
            const content =
              responseText.choices &&
              responseText.choices[0] &&
              responseText.choices[0].message &&
              responseText.choices[0].message.content;
            completionTokens = this.countTokens(content || "");
            console.log("Completion tokens: " + completionTokens);
          } else {
            completionTokens = this.countTokens(tokensStream);
            console.log("Completion tokens (streaming): " + completionTokens);
          }
          const totalTokens = promptTokens + completionTokens;
          console.log("Total tokens: " + totalTokens);
          quantity = this.calculateQuantityFromTokens(totalTokens);
        } else if (type === "textToSpeech") {
          // Additional logic if needed
        }

        if (typeof quantity === "string") quantity = parseInt(quantity);
        const data = { quantity };
        const result = await axios.post(url, data, { headers: requestHeaders });
        console.log("Charged: " + result.data);
        return result?.data;
      }
    } catch (error) {
      console.error("Failed to calculate cost", error);
    }
    return 0;
  }
}

export default CostCalculator;
