import { cleanPromptString } from "./util.js";

export const perplexity_llama_small_online = {
  id: "perplexity-llama-small-online",
  name: "Llama 3.1 Sonar Small",
  url: "https://api.perplexity.ai/chat/completions",
  type: "perplexity",
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
      class: "MatcAutoCompleteTextareaXXS",
    },
    {
      type: "Number",
      id: "max_tokens",
      label: "Max Tokens",
      default: 4096,
      helper: "Maximum number of tokens to generate (Limit: 4096).",
      required: true,
      min: 1,
      max: 4096,
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
      helper: "Adjusts the randomness of the output. 1.0 is the most random, 0.0 is deterministic.",
      decimals: true,
    },
    {
      default: 0,
      min: -2.0,
      max: 2.0,
      type: "range",
      required: true,
      id: "presence_penalty",
      label: "Presence Penalty",
      helper:
        "A value between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Incompatible with frequency_penalty.",
      decimals: true,
    },
    {
      default: 1,
      min: 0,
      max: 1,
      type: "range",
      required: true,
      id: "frequency_penalty",
      label: "Frequency Penalty",
      decimals: true,
      helper:
        "A multiplicative penalty greater than 0. Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. A value of 1.0 means no penalty. Incompatible with presence_penalty.",
    },
  ],
  authType: "Bearer",
  method: "POST",
  documentationAuthLink: "https://docs.perplexity.ai/reference/post_chat_completions",
  getTemplate: (vars) => {
    let template = {
      model: "llama-3.1-sonar-small-128k-online",
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
    };
    if (vars.temperature) template["temperature"] = vars.temperature;
    if (vars.max_tokens) template["max_tokens"] = vars.max_tokens;
    if (vars.presence_penalty) template["presence_penalty"] = vars.presence_penalty;
    if (vars.frequency_penalty) template["frequency_penalty"] = vars.frequency_penalty;
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
  },
};

export const perplexity_llama_sonar_large_online = {
  id: "perplexity-llama-sonar-large-online",
  name: "Llama 3.1 Sonar Large",
  url: "https://api.perplexity.ai/chat/completions",
  type: "perplexity",
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
      class: "MatcAutoCompleteTextareaXXS",
    },
    {
      type: "Number",
      id: "max_tokens",
      label: "Max Tokens",
      default: 4096,
      helper: "Maximum number of tokens to generate (Limit: 4096).",
      required: true,
      min: 1,
      max: 4096,
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
      default: 0,
      min: -2.0,
      max: 2.0,
      type: "range",
      required: true,
      id: "presence_penalty",
      label: "Presence Penalty",
      decimals: true,
      helper:
        "A value between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Incompatible with frequency_penalty.",
    },
    {
      default: 1,
      min: 0,
      max: 1,
      type: "range",
      required: true,
      id: "frequency_penalty",
      label: "Frequency Penalty",
      decimals: true,
      helper:
        "A multiplicative penalty greater than 0. Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. A value of 1.0 means no penalty. Incompatible with presence_penalty.",
    },
  ],
  method: "POST",
  authType: "Bearer",
  documentationAuthLink: "https://docs.perplexity.ai/reference/post_chat_completions",
  getTemplate: (vars) => {
    let template = {
      model: "llama-3.1-sonar-large-128k-online",
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
    };
    if (vars.temperature) template["temperature"] = vars.temperature;
    if (vars.max_tokens) template["max_tokens"] = vars.max_tokens;
    if (vars.presence_penalty) template["presence_penalty"] = vars.presence_penalty;
    if (vars.frequency_penalty) template["frequency_penalty"] = vars.frequency_penalty;
    return template;
  },
  injectContext: (template, context) => {
    const tmp = JSON.parse(template);
    const systemmessage = tmp.messages.find((msg) => msg.role === "system");
    tmp.messages = context.slice(0, context.length - 1);
    if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
    return JSON.stringify(tmp);
  },
  getMaxTokens: (vars) => vars.max_tokens,
  output: {
    path: "choices[0].message.content",
    type: "JSON",
    streampath: "choices[0].delta.content",
  },
};

export const perplexity_llama_3_8b_instruct = {
      id: "perplexity-llama-3-8b-instruct",
      name: "Llama 3.1 8b Instruct",
      url: "https://api.perplexity.ai/chat/completions",
      type: "perplexity",
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
          default: 0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: true,
          id: "presence_penalty",
          label: "Presence Penalty",
          decimals: true,
          helper:
            "A value between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Incompatible with frequency_penalty.",
        },
        {
          default: 1,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "frequency_penalty",
          label: "Frequency Penalty",
          decimals: true,
          helper:
            "A multiplicative penalty greater than 0. Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. A value of 1.0 means no penalty. Incompatible with presence_penalty.",
        },
      ],
      authType: "Bearer",
      method: "POST",
      documentationAuthLink: "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "llama-3.1-8b-instruct",
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
        };
        if (vars.temperature) template["temperature"] = vars.temperature;
        if (vars.max_tokens) template["max_tokens"] = vars.max_tokens;
        template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty) template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      injectContext: (template, context) => {
        const tmp = JSON.parse(template);
        const systemmessage = tmp.messages.find((msg) => msg.role === "system");
        tmp.messages = context.slice(0, context.length - 1);
        if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
        return JSON.stringify(tmp);
      },
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    }

export const perplexity_llama_3_70b_instruct = {
      id: "perplexity-llama-3-70b-instruct",
      name: "Llama 3.1 70b Instruct",
      url: "https://api.perplexity.ai/chat/completions",
      type: "perplexity",
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
          default: 0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: true,
          id: "presence_penalty",
          label: "Presence Penalty",
          decimals: true,
          helper:
            "A value between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Incompatible with frequency_penalty.",
        },
        {
          default: 1,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "frequency_penalty",
          label: "Frequency Penalty",
          decimals: true,
          helper:
            "A multiplicative penalty greater than 0. Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. A value of 1.0 means no penalty. Incompatible with presence_penalty.",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "llama-3.1-70b-instruct",
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
        };
        if (vars.temperature) template["temperature"] = vars.temperature;
        if (vars.max_tokens) template["max_tokens"] = vars.max_tokens;
        template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty) template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      injectContext: (template, context) => {
        const tmp = JSON.parse(template);
        const systemmessage = tmp.messages.find((msg) => msg.role === "system");
        tmp.messages = context.slice(0, context.length - 1);
        if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
        return JSON.stringify(tmp);
      },
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    }

export const perplexity_mixtral_8x7b_instruct = {
      id: "perplexity-mixtral-8x7b-instruct",
      name: "Perplexity Mixtral 8x7b Instruct",
      url: "https://api.perplexity.ai/chat/completions",
      type: "perplexity",
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
          default: 0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: true,
          id: "presence_penalty",
          label: "Presence Penalty",
          decimals: true,
          helper:
            "A value between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Incompatible with frequency_penalty.",
        },
        {
          default: 1,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "frequency_penalty",
          label: "Frequency Penalty",
          decimals: true,
          helper:
            "A multiplicative penalty greater than 0. Values greater than 1.0 penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. A value of 1.0 means no penalty. Incompatible with presence_penalty.",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "mixtral-8x7b-instruct",
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
        };
        if (vars.temperature) template["temperature"] = vars.temperature;
        if (vars.max_tokens) template["max_tokens"] = vars.max_tokens;
        if (vars.presence_penalty) template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty) template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      injectContext: (template, context) => {
        const tmp = JSON.parse(template);
        const systemmessage = tmp.messages.find((msg) => msg.role === "system");
        tmp.messages = context.slice(0, context.length - 1);
        if (systemmessage) tmp.messages = [...tmp.messages, systemmessage];
        return JSON.stringify(tmp);
      },
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    }