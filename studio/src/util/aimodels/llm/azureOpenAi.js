import { cleanPromptString } from "./util.js";

export const azureOpenAI = {
  id: "azure-openai",
  name: "OpenAI",
  url: "https://{{resource}}.openai.azure.com/openai/deployments/{{deployment}}/chat/completions?api-version={{apiversion}}",
  type: "azure",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "flex",
      content: [
        {
          type: "Input",
          required: true,
          id: "resource",
          label: "Your Resource Name",
          placeholder: "Azure OpenAI Resource.",
          helper: "The name of your Azure OpenAI Resource.",
        },
        {
          type: "Input",
          required: true,
          id: "deployment",
          label: "Deployment Id",
          placeholder: "Deployment Name",
          helper: "The deployment name you chose when you deployed the model.",
        },
      ],
    },
    {
      type: "Input",
      required: true,
      id: "apiversion",
      label: "API version",
      placeholder: "YYYY-MM-DD",
      helper: "The API version to use for this operation. This follows the YYYY-MM-DD format.",
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
  ],
  method: "POST",
  authHeader: "api-key",
  documentationAuthLink: "https://learn.microsoft.com/en-us/azure/ai-services/openai/reference",
  getTemplate: (vars) => {
    const template = {
      messages: [
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
      ],
      stream: vars.stream,
      temperature: vars.temperature,
    };
    return template;
  },
  disableFlowrabbit: true,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
  },
};
