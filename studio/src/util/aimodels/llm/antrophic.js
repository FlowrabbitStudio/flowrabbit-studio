import { cleanPromptString } from "./util.js";

export const antrophic_35_sonnet = {
  id: "antrophic-35-sonnet",
  name: "Claude 3.5 Sonnet",
  url: "https://api.anthropic.com/v1/messages",
  type: "claude",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
    { key: "anthropic-version", value: "2023-06-01" },
  ],
  elements: [
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
      default: 1024,
      type: "Number",
      required: true,
      id: "max_tokens",
      label: "Max Tokens",
      helper: "The max tokens allowed returned by the model",
      decimals: true,
    },
  ],
  getMaxTokens: (vars) => vars.max_tokens,
  method: "POST",
  authHeader: "x-api-key",
  documentationAuthLink: "https://docs.anthropic.com/en/api/getting-started",
  getTemplate: (vars) => {
    let template = {
      model: "claude-3-5-sonnet-20240620",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
      ],
      stream: vars.stream,
      max_tokens: vars.max_tokens || 1024,
    };
    if (vars.temperature) template["temperature"] = vars.temperature;
    if (vars.presence_penalty) template["presence_penalty"] = vars.presence_penalty;
    if (vars.frequency_penalty) template["frequency_penalty"] = vars.frequency_penalty;
    if (vars.systemprompt) {
      template.messages.push({
        role: "assistant",
        content: vars.systemprompt,
      });
    }
    return template;
  },
  output: {
    path: "content[0].text",
    type: "JSON",
    streampath: "delta.text",
  },
};

export const antrophic_3_sonnet = {
  id: "antrophic-3-sonnet",
  name: "Claude 3 Sonnet",
  url: "https://api.anthropic.com/v1/messages",
  type: "claude",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
    { key: "anthropic-version", value: "2023-06-01" },
  ],
  elements: [
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
      default: 1024,
      type: "Number",
      required: true,
      id: "max_tokens",
      label: "Max Tokens",
      helper: "The max tokens allowed returned by the model",
      decimals: true,
    },
  ],
  getMaxTokens: (vars) => vars.max_tokens,
  method: "POST",
  authHeader: "x-api-key",
  documentationAuthLink: "https://docs.anthropic.com/en/api/getting-started",
  getTemplate: (vars) => {
    let template = {
      model: "claude-3-sonnet-20240229",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
      ],
      stream: vars.stream,
      max_tokens: vars.max_tokens || 1024,
    };
    if (vars.temperature) template["temperature"] = vars.temperature;
    if (vars.presence_penalty) template["presence_penalty"] = vars.presence_penalty;
    if (vars.frequency_penalty) template["frequency_penalty"] = vars.frequency_penalty;
    if (vars.systemprompt) {
      template.messages.push({
        role: "assistant",
        content: vars.systemprompt,
      });
    }
    return template;
  },
  output: {
    path: "content[0].text",
    type: "JSON",
    streampath: "delta.text",
  },
};

export const antrophic_3_opus = {
  id: "antrophic-3-opus",
  name: "Claude 3 Opus",
  url: "https://api.anthropic.com/v1/messages",
  type: "claude",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
    { key: "anthropic-version", value: "2023-06-01" },
  ],
  elements: [
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
      default: 1024,
      type: "Number",
      required: true,
      id: "max_tokens",
      label: "Max Tokens",
      helper: "The max tokens allowed returned by the model",
      decimals: true,
    },
  ],
  getMaxTokens: (vars) => vars.max_tokens,
  method: "POST",
  authHeader: "x-api-key",
  documentationAuthLink: "https://docs.anthropic.com/en/api/getting-started",
  getTemplate: (vars) => {
    let template = {
      model: "claude-3-opus-20240229",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
      ],
      stream: vars.stream,
    };
    if (vars.temperature) template["temperature"] = vars.temperature;
    if (vars.tools) template["tools"] = vars.tools;
    if (vars.tool_choice) template["tool_choice"] = vars.tool_choice;
    if (vars.max_tokens) template["max_tokens"] = vars.max_tokens;
    if (vars.systemprompt) {
      template.messages.push({
        role: "assistant",
        content: vars.systemprompt,
      });
    }
    return template;
  },
  output: {
    path: "content[0].text",
    type: "JSON",
    streampath: "delta.text",
  },
};
