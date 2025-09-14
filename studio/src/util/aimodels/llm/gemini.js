import { cleanPromptString } from "./util.js";

export const gemini_vertex_ai = {
      id: "gemini-vertex-ai",
      name: "Gemini",
      url: "https://{{location}}-aiplatform.googleapis.com/v1/projects/{{project}}/locations/{{location}}/publishers/google/models/{{model}}:generateContent",
      type: "gemini",
      headers: [{ key: "Content-Type", value: "application/json" }],
      elements: [
        {
          type: "flex",
          content: [
            {
              type: "Input",
              required: true,
              id: "project",
              label: "Project ID",
              placeholder: "Your GCP Project ID",
              helper: "The ID of your Google Cloud project.",
            },
            {
              type: "Input",
              required: true,
              id: "location",
              label: "Location",
              placeholder: "Location",
              helper: "The location of your Vertex AI resources.",
            },
          ],
        },
        {
          type: "DropDown",
          required: true,
          options: [
            {
              value: "gemini-1.5-flash-preview-0514",
              label: "Gemini 1.5 Flash",
            },
            { value: "gemini-1.5-pro-preview-0514", label: "Gemini 1.5 Pro" },
            {
              value: "gemini-1.0-pro-vision-001",
              label: "Gemini 1.0 Pro Vision",
            },
            { value: "gemini-1.0-pro-002", label: "Gemini 1.0 Pro" },
          ],
          default: "gemini-1.0-pro-002",
          id: "model",
          label: "Model ID",
          placeholder: "Model ID",
          helper: "The ID of the Gemini model.",
        },
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Write your prompt",
          class: "MatcAutoCompleteTextareaXXS",
        },
      ],
      advanced: [
        {
          type: "TextArea",
          id: "systemprompt",
          label: "System Prompt",
          placeholder: "Write your system prompt",
          class: "MatcAutoCompleteTextareaXXS",
        },
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper: "Temperature",
          decimals: true,
        },
        {
          default: 2024,
          type: "Number",
          required: true,
          id: "maxOutputTokens",
          label: "Max Output Tokens",
          helper: "The maximum number of output tokens to be generated per message.",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://cloud.google.com/vertex-ai/docs/generative-ai/gemini",
      getTemplate: (vars) => {
        return {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: cleanPromptString(vars.prompt),
                },
              ],
            },
            {
              role: "system",
              parts: [
                {
                  text: cleanPromptString(vars.systemprompt) || "You are an AI assistant that helps people find information.",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: vars.temperature,
            maxOutputTokens: vars.maxOutputTokens,
          },
        };
      },
      output: {
        path: "predictions[0].content",
        type: "JSON",
        streampath: "predictions[0].delta.content",
      },
    }