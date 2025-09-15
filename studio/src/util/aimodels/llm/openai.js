import { cleanPromptString } from "./util.js";
// https://platform.openai.com/docs/pricing

export const openai_01_mini = {
  id: "openai-o1-mini",
  name: "GPT o1 Mini",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      helper: "Adjusts randomness in output. 1.0 is the most random, 0.0 is deterministic.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://replicate.com/docs/reference/http#authentication",
  getTemplate: (vars) => {
    let template = {
      model: "o1-mini",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      temperature: vars.temperature,
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      stream: vars.stream,
    };
    if (vars.json) {
      template["response_format"] = { type: "json_object" };
    }
    return template;
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  disableFlowrabbit: true,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
  },
};

export const openai_01_preview = {
  id: "openai-o1-preview",
  name: "GPT o1 Preview",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      helper: "Adjusts randomness in output. 1.0 is the most random, 0.0 is deterministic.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://replicate.com/docs/reference/http#authentication",
  disableFlowrabbit: true,
  getTemplate: (vars) => {
    let template = {
      model: "o1-preview",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      temperature: vars.temperature,
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      stream: vars.stream,
    };
    if (vars.json) {
      template["response_format"] = { type: "json_object" };
    }
    return template;
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
  },
};

export const openai_chat_gpt_4o_mini = {
  id: "openai-chat-gpt-4o-mini",
  name: "GPT-4o Mini",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      helper: "Adjusts randomness in output. 1.0 is the most random, 0.0 is deterministic.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://replicate.com/docs/reference/http#authentication",
  getTemplate: (vars) => {
    let template = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      temperature: vars.temperature,
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      stream: vars.stream,
    };
    if (vars.json) {
      template["response_format"] = { type: "json_object" };
    }
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
  },
};

export const openai_chat_gpt_4o = {
  id: "openai-chat-4o",
  name: "GPT-4o",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://replicate.com/docs/reference/http#authentication",
  getTemplate: (vars) => {
    let template = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      temperature: vars.temperature,
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      stream: vars.stream,
    };
    if (vars.json) {
      template["response_format"] = { type: "json_object" };
    }
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
  },
};

export const openai_chat_gpt_4o_mini_search_preview = {
  id: "gpt-4o-mini-search-preview",
  name: "GPT-4o Mini Search Preview",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      type: "DropDown",
      required: true,
      options: [
        {
          value: "high",
          label: "High (Most comprehensive context, highest cost, slower response.)",
        },
        { value: "medium", label: "Medium (Balanced context, cost, and latency.)" },
        {
          value: "low",
          label: "Low (Least context, lowest cost, fastest response, but potentially lower answer quality.)",
        },
      ],
      default: "low",
      id: "search_context_size",
      label: "Search Context Size",
      placeholder: "Search Context Size",
      helper: "The Search Context Size parameter controls how much context is retrieved from the web to help the tool formulate a response.",
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://replicate.com/docs/reference/http#authentication",
  getTemplate: (vars) => {
    let template = {
      model: "gpt-4o-mini-search-preview-2025-03-11",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      temperature: vars.temperature,
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      stream: vars.stream,
    };
    if (vars.json) {
      template["response_format"] = { type: "json_object" };
    }
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
  },
};

export const openai_chat_gpt_4o_search_preview = {
  id: "gpt-4o-search-preview",
  name: "GPT-4o Search Preview",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      type: "DropDown",
      required: true,
      options: [
        {
          value: "high",
          label: "High (Most comprehensive context, highest cost, slower response.)",
        },
        { value: "medium", label: "Medium (Balanced context, cost, and latency.)" },
        {
          value: "low",
          label: "Low (Least context, lowest cost, fastest response, but potentially lower answer quality.)",
        },
      ],
      default: "low",
      id: "search_context_size",
      label: "Search Context Size",
      placeholder: "Search Context Size",
      helper: "The Search Context Size parameter controls how much context is retrieved from the web to help the tool formulate a response.",
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://replicate.com/docs/reference/http#authentication",
  getTemplate: (vars) => {
    let template = {
      model: "gpt-4o-search-preview-2025-03-11",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      temperature: vars.temperature,
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      stream: vars.stream,
    };
    if (vars.json) {
      template["response_format"] = { type: "json_object" };
    }
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
  },
};

export const openai_chat_4_turbo = {
  id: "openai-chat-4-turbo",
  name: "GPT-4-Turbo",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://replicate.com/docs/reference/http#authentication",
  getTemplate: (vars) => {
    const template = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      temperature: vars.temperature,
      stream: vars.stream,
    };
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
    metricspath: {
      model: "model",
      tokens: "usage.total_tokens",
      cost: 0.002,
    },
  },
};

export const openai_chat_5 = {
  id: "openai-chat-5",
  name: "GPT-5",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "",
  getTemplate: (vars) => {
    const template = {
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      temperature: vars.temperature,
      stream: vars.stream,
    };
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
    metricspath: {
      model: "model",
      tokens: "usage.total_tokens",
      cost: 0.002,
    },
  },
};

export const openai_chat_5_nano = {
  id: "openai-chat-5-nano",
  name: "GPT-5 Nano",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "",
  getTemplate: (vars) => {
    const template = {
      model: "gpt-5-nano",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      temperature: vars.temperature,
      stream: vars.stream,
    };
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
    metricspath: {
      model: "model",
      tokens: "usage.total_tokens",
      cost: 0.002,
    },
  },
};

export const openai_chat_4_1_nano = {
  id: "gpt-4.1-nano",
  name: "GPT-4.1 Nano",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "",
  getTemplate: (vars) => {
    const template = {
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      temperature: vars.temperature,
      stream: vars.stream,
    };
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
    metricspath: {
      model: "model",
      tokens: "usage.total_tokens",
      cost: 0.002,
    },
  },
};


export const openai_chat_40_mini = {
  id: "gpt-4o-mini",
  name: "GPT-4.0 Mini",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "",
  getTemplate: (vars) => {
    const template = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      temperature: vars.temperature,
      stream: vars.stream,
    };
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
    metricspath: {
      model: "model",
      tokens: "usage.total_tokens",
      cost: 0.002,
    },
  },
};

export const openai_chat_5_mini = {
  id: "openai-chat-5-mini",
  name: "GPT-5 Mini",
  url: "https://api.openai.com/v1/chat/completions",
  type: "openai",
  headers: [
    { key: "Content-Type", value: "application/json" },
    { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
    { key: "X-Title", value: "Flowrabbit" },
  ],
  elements: [
    {
      type: "TextArea",
      required: true,
      id: "prompt",
      label: "Prompt",
      placeholder: "Write your prompt",
      class: "MatcAutoCompleteTextareaXS",
    },
    {
      type: "Number",
      id: "max_completion_tokens",
      label: "Max Tokens",
      default: 2048,
      helper: "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
      required: true,
      min: 1,
      max: 2048,
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
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "top_p",
      label: "Top P",
      helper: "Limits token selection to a cumulative probability threshold.",
      decimals: true,
    },
    {
      default: 1.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "presence_penalty",
      label: "Presence Penalty",
      helper: "Discourages reusing tokens from the prompt.",
      decimals: true,
    },
    {
      default: 0.0,
      min: 0,
      max: 2.0,
      type: "range",
      id: "frequency_penalty",
      label: "Frequency Penalty",
      helper: "Discourages frequent token repetition.",
      decimals: true,
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "",
  getTemplate: (vars) => {
    const template = {
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: cleanPromptString(vars.prompt),
        },
        {
          role: "system",
          content: vars.systemprompt || "You are an AI assistant that helps people find information.",
        },
      ],
      max_completion_tokens: vars.max_completion_tokens,
      top_p: vars.top_p,
      presence_penalty: vars.presence_penalty,
      frequency_penalty: vars.frequency_penalty,
      temperature: vars.temperature,
      stream: vars.stream,
    };
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_completion_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
    hasjsonoutput: true,
    metricspath: {
      model: "model",
      tokens: "usage.total_tokens",
      cost: 0.002,
    },
  },
};