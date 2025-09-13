const cleanPromptString = (prompt) => {
  if (!prompt) return "";
  return prompt.replaceAll(/"/g, "'");
};

const llms = {
  id: "llms",
  title: "Text AI",
  icon: "mdi mdi-chat",
  logo: "ai-text",
  brands: [
    { id: "azure", label: "Azure", logo: "ai-azure" },
    { id: "claude", label: "Claude", logo: "ai-claude" },
    { id: "gemini", label: "Gemini", logo: "ai-gemini" },
    { id: "openai", label: "OpenAI", logo: "ai-openai" },
    { id: "openrouter", label: "Open Router", logo: "ai-openrouter" },
    { id: "perplexity", label: "Perplexity", logo: "ai-perplexity" },
  ],
  models: [
    {
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
              helper:
                "The deployment name you chose when you deployed the model.",
            },
          ],
        },
        {
          type: "Input",
          required: true,
          id: "apiversion",
          label: "API version",
          placeholder: "YYYY-MM-DD",
          helper:
            "The API version to use for this operation. This follows the YYYY-MM-DD format.",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://learn.microsoft.com/en-us/azure/ai-services/openai/reference",
      getTemplate: (vars) => {
        const template = {
          messages: [
            {
              role: "system",
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
    },

    {
      id: "openrouter-meta-llama-3.2-3b-instruct-free",
      name: "Meta Llama 3.2 Free",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
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
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Controls randomness. 1.0 is the most random, 0.0 is deterministic.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Limits token selection to a cumulative probability threshold.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Discourages using tokens from the prompt.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
      getTemplate: (vars) => {
        return {
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "user",
              content: cleanPromptString(vars.prompt),
            },
          ],
          temperature: vars.temperature,
          max_tokens: vars.max_tokens,
          top_p: vars.top_p,
          presence_penalty: vars.presence_penalty,
          frequency_penalty: vars.frequency_penalty,
          stream: vars.stream,
        };
      },
      getMaxTokens: (vars) => vars.max_tokens,
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
      id: "openrouter-pixtral-12b-free",
      name: "MistralAI Pixtral 12B Free",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
      headers: [{ key: "Content-Type", value: "application/json" }],
      authType: "Bearer",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Enter your prompt",
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
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Adjusts randomness in output. 1.0 is most random, 0.0 is deterministic.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Restricts token selection to a cumulative probability threshold.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Discourages repeating tokens from the prompt.",
          decimals: true,
        },
        {
          default: 0.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "frequency_penalty",
          label: "Frequency Penalty",
          helper: "Discourages repeating frequently used tokens.",
          decimals: true,
        },
      ],
      method: "POST",
      output: {
        path: "choices[0].message.content",
        type: "JSON",
      },
      getTemplate: (vars) => {
        return {
          model: "mistralai/pixtral-12b:free",
          messages: [{ role: "user", content: vars.prompt }],
          temperature: vars.temperature,
          max_tokens: vars.max_tokens,
          top_p: vars.top_p,
          presence_penalty: vars.presence_penalty,
          frequency_penalty: vars.frequency_penalty,
          stream: vars.stream, // Added stream property for LLMs
        };
      },
      getMaxTokens: (vars) => vars.max_tokens, // Added getMaxTokens function
    },
    {
      id: "mistral-7b-instruct",
      name: "Mistral 7B Free",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
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
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Controls randomness. 1.0 is the most random, 0.0 is deterministic.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Limits token selection to a cumulative probability threshold.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Discourages using tokens from the prompt.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
      getTemplate: (vars) => {
        return {
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "user",
              content: cleanPromptString(vars.prompt),
            },
          ],
          temperature: vars.temperature,
          max_tokens: vars.max_tokens,
          top_p: vars.top_p,
          presence_penalty: vars.presence_penalty,
          frequency_penalty: vars.frequency_penalty,
          stream: vars.stream,
        };
      },
      getMaxTokens: (vars) => vars.max_tokens,
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
      id: "openrouter-gemini-flash",
      name: "Gemini Flash",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
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
        },
        {
          type: "Number",
          id: "max_tokens",
          label: "Max Tokens",
          default: 2048,
          helper: "Maximum tokens to generate. The limit is 4096.",
          required: true,
          min: 1,
          max: 4096,
        },
      ],
      advanced: [
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          decimals: true,
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Controls randomness. 1.0 is the most random, 0.0 is the most deterministic.",
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          decimals: true,
          id: "top_p",
          label: "Top P",
          helper:
            "Limits token selection to a cumulative probability threshold.",
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          decimals: true,
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Discourages reusing tokens from the prompt.",
        },
        {
          default: 0.0,
          min: 0,
          max: 2.0,
          type: "range",
          decimals: true,
          id: "frequency_penalty",
          label: "Frequency Penalty",
          helper: "Discourages repeating tokens.",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
      getTemplate: (vars) => {
        return {
          model: "google/gemini-flash-1.5",
          messages: [
            { role: "user", content: cleanPromptString(vars.prompt) },
            {
              role: "system",
              content: cleanPromptString(vars.systemprompt),
            },
          ],
          stream: vars.stream,
          temperature: vars.temperature,
          max_tokens: vars.max_tokens,
          top_p: vars.top_p,
          presence_penalty: vars.presence_penalty,
          frequency_penalty: vars.frequency_penalty,
        };
      },
      getMaxTokens: (vars) => vars.max_tokens,
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
      id: "openrouter-mythomax-l2-13b",
      name: "Gryphe Mythomax L2 13B",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
      headers: [{ key: "Content-Type", value: "application/json" }],
      authType: "Bearer",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Enter your prompt",
        },
        {
          type: "Number",
          id: "max_tokens",
          label: "Max Tokens",
          default: 4096,
          helper: "Maximum number of tokens to generate. Limit: 4096.",
          required: true,
          min: 1,
          max: 4096,
        },
      ],
      advanced: [
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          decimals: true,
          id: "temperature",
          label: "Temperature",
          helper: "Controls randomness (0.0: deterministic, 1.0: most random).",
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          decimals: true,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Token selection limited to a cumulative probability threshold.",
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          decimals: true,
          type: "range",
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Discourages repeated tokens from the prompt.",
        },
        {
          default: 0.0,
          min: 0,
          max: 2.0,
          decimals: true,
          type: "range",
          id: "frequency_penalty",
          label: "Frequency Penalty",
          helper: "Discourages frequent token repetition.",
        },
      ],
      method: "POST",
      output: {
        path: "choices[0].message.content",
        type: "JSON",
      },
      getTemplate: (vars) => {
        return {
          model: "gryphe/mythomax-l2-13b",
          messages: [{ role: "user", content: vars.prompt }],
          temperature: vars.temperature,
          max_tokens: vars.max_tokens,
          top_p: vars.top_p,
          presence_penalty: vars.presence_penalty,
          frequency_penalty: vars.frequency_penalty,
          stream: vars.stream,
        };
      },
      getMaxTokens: (vars) => {
        return vars.max_tokens;
      },
    },
    {
      id: "openrouter-mythomax-l2-13b-free",
      name: "Gryphe Mythomax L2 13B Free",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
      headers: [{ key: "Content-Type", value: "application/json" }],
      authType: "Bearer",
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "prompt",
          label: "Prompt",
          placeholder: "Enter your prompt",
        },
        {
          type: "Number",
          id: "max_tokens",
          label: "Max Tokens",
          default: 4096,
          helper: "Maximum number of tokens to generate. Limit: 4096.",
          required: true,
          min: 1,
          max: 4096,
        },
      ],
      advanced: [
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          decimals: true,
          id: "temperature",
          label: "Temperature",
          helper: "Controls randomness (0.0: deterministic, 1.0: most random).",
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          decimals: true,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Token selection limited to a cumulative probability threshold.",
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          decimals: true,
          type: "range",
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Discourages repeated tokens from the prompt.",
        },
        {
          default: 0.0,
          min: 0,
          max: 2.0,
          decimals: true,
          type: "range",
          id: "frequency_penalty",
          label: "Frequency Penalty",
          helper: "Discourages frequent token repetition.",
        },
      ],
      method: "POST",
      output: {
        path: "choices[0].message.content",
        type: "JSON",
      },
      getTemplate: (vars) => {
        return {
          model: "gryphe/mythomax-l2-13b:free",
          messages: [{ role: "user", content: vars.prompt }],
          temperature: vars.temperature,
          max_tokens: vars.max_tokens,
          top_p: vars.top_p,
          presence_penalty: vars.presence_penalty,
          frequency_penalty: vars.frequency_penalty,
          stream: vars.stream,
        };
      },
      getMaxTokens: (vars) => {
        return vars.max_tokens;
      },
    },
    {
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://docs.anthropic.com/en/api/getting-started",
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
        if (vars.presence_penalty)
          template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty)
          template["frequency_penalty"] = vars.frequency_penalty;
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
    },
    {
      id: "antrophic-3-sonnet",
      name: "Claude 3 Sonet",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://docs.anthropic.com/en/api/getting-started",
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
        if (vars.presence_penalty)
          template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty)
          template["frequency_penalty"] = vars.frequency_penalty;
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
    },
    {
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://docs.anthropic.com/en/api/getting-started",
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
    },
    {
      id: "gemini-vertex-ai",
      name: "Gemini",
      // url: "https://{{location}}-aiplatform.googleapis.com/v1/projects/{{project}}/locations/{{location}}/publishers/google/models/gemini-1.5-pro:streamGenerateContent",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
          helper:
            "The maximum number of output tokens to be generated per message.",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink:
        "https://cloud.google.com/vertex-ai/docs/generative-ai/gemini",
      /*https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference?hl=es-419#examples*/
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
                  text:
                    cleanPromptString(vars.systemprompt) ||
                    "You are an AI assistant that helps people find information.",
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
    },
    {
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
        },
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Adjusts randomness in output. 1.0 is the most random, 0.0 is deterministic.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
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
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
    },
    {
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
        },
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Adjusts randomness in output. 1.0 is the most random, 0.0 is deterministic.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
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
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
    },
    {
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
        },
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Adjusts randomness in output. 1.0 is the most random, 0.0 is deterministic.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
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
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
    },
    {
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
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
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
    },
    
    {
      id: "gpt-4o-mini-search-preview",
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "Adjusts randomness in output. 1.0 is the most random, 0.0 is deterministic.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0,
          max: 2.0,
          type: "range",
          id: "top_p",
          label: "Top P",
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
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
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
        const tmp = JSON.parse(template)
        const systemmessage = tmp.messages.find((msg) => msg.role === "system")
        tmp.messages = context.slice(0, context.length - 1);
        if (systemmessage) tmp.messages = [...tmp.messages, systemmessage]
        return JSON.stringify(tmp)
      },
      getMaxTokens: (vars) => vars.max_completion_tokens,
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
        hasjsonoutput: true,
      },
    },
    {
      id: "gpt-4o-search-preview",
      name: "GPT-4o Preview",
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
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
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
        const tmp = JSON.parse(template)
        const systemmessage = tmp.messages.find((msg) => msg.role === "system")
        tmp.messages = context.slice(0, context.length - 1);
        if (systemmessage) tmp.messages = [...tmp.messages, systemmessage]
        return JSON.stringify(tmp)
      },
      getMaxTokens: (vars) => vars.max_completion_tokens,
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
        hasjsonoutput: true,
      },
    },
    {
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
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
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
    },
    {
      id: "openai-chat-35",
      name: "GPT 3.5-Turbo",
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
          helper:
            "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.",
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
          helper:
            "Limits token selection to a cumulative probability threshold.",
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
      getMaxTokens: (vars) => vars.max_completion_tokens,
      method: "POST",
      authType: "Bearer",
      documentationAuthLink:
        "https://replicate.com/docs/reference/http#authentication",
      getTemplate: (vars) => {
        const template = {
          model: "gpt-3.5-turbo-0125",
          messages: [
            {
              role: "user",
              content: cleanPromptString(vars.prompt),
            },
            {
              role: "system",
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
        hasjsonoutput: true,
      },
    },
    {
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
        },
        {
          default: 0.7,
          min: 0,
          max: 1,
          type: "range",
          required: true,
          id: "temperature",
          label: "Temperature",
          helper:
            "Adjusts the randomness of the output. 1.0 is the most random, 0.0 is deterministic.",
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
      documentationAuthLink:
        "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
        if (vars.presence_penalty)
          template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty)
          template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      getMaxTokens: (vars) => vars.max_tokens,
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "llama-3.1-sonar-large-128k-online",
          messages: [
            {
              role: "system",
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
        if (vars.presence_penalty)
          template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty)
          template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      getMaxTokens: (vars) => vars.max_tokens,
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "llama-3.1-8b-instruct",
          messages: [
            {
              role: "system",
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
        if (vars.frequency_penalty)
          template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "llama-3.1-70b-instruct",
          messages: [
            {
              role: "system",
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
        if (vars.frequency_penalty)
          template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
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
          helper:
            "A system prompt in the LLM (Large Language Model) API is an initial instruction or set of guidelines provided to the language model before any user interaction begins. This prompt sets the context, tone, and behavior for the model's responses throughout the conversation. It effectively tells the model who it is, how it should behave, and what style or format to follow when generating replies.",
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
      documentationAuthLink:
        "https://docs.perplexity.ai/reference/post_chat_completions",
      getTemplate: (vars) => {
        let template = {
          model: "mixtral-8x7b-instruct",
          messages: [
            {
              role: "system",
              content:
                vars.systemprompt ||
                "You are an AI assistant that helps people find information.",
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
        if (vars.presence_penalty)
          template["presence_penalty"] = vars.presence_penalty;
        if (vars.frequency_penalty)
          template["frequency_penalty"] = vars.frequency_penalty;
        return template;
      },
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
      id: "llm-openrouter-llama",
      name: "Llama 3.1 70B",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
        { key: "X-Title", value: "Flowrabbit" },
      ],
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "user_message",
          label: "User Message",
          placeholder: "What is the meaning of life?",
          helper: "Enter the message for the model to respond to",
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://openrouter.ai/docs",
      getTemplate: (vars) => ({
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: vars.user_message }],
        stream: vars.stream,
      }),
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
      id: "llm-openrouter-antrophic-claude",
      name: "Claude 3.5 Sonnet",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
        { key: "X-Title", value: "Flowrabbit" },
      ],
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "user_message",
          label: "User Message",
          placeholder: "What is the meaning of life?",
          helper: "Enter the message for the model to respond to",
        },
      ],
      advanced: [
        {
          default: 1.0,
          min: 0.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "temperature",
          label: "Temperature",
          helper: "Controls the variety in responses.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "top_p",
          label: "Top P",
          helper:
            "Limits the model's choices to a percentage of likely tokens.",
          decimals: true,
        },
        {
          default: 0,
          min: 0,
          type: "Number",
          required: false,
          id: "top_k",
          label: "Top K",
          helper: "Limits the model's choice of tokens at each step.",
        },
        {
          default: 0.0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "frequency_penalty",
          label: "Frequency Penalty",
          helper: "Controls the repetition of tokens.",
          decimals: true,
        },
        {
          default: 0.0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Adjusts the likelihood of repeating tokens.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "repetition_penalty",
          label: "Repetition Penalty",
          helper: "Reduces the repetition of tokens from the input.",
          decimals: true,
        },
        {
          default: 0.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "min_p",
          label: "Min P",
          helper: "Minimum probability for a token to be considered.",
          decimals: true,
        },
        {
          default: 0.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "top_a",
          label: "Top A",
          helper: "Focuses choices based on the highest probability token.",
          decimals: true,
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://openrouter.ai/docs",
      getTemplate: (vars) => ({
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: vars.user_message }],
        temperature: vars.temperature,
        top_p: vars.top_p,
        top_k: vars.top_k,
        frequency_penalty: vars.frequency_penalty,
        presence_penalty: vars.presence_penalty,
        repetition_penalty: vars.repetition_penalty,
        min_p: vars.min_p,
        top_a: vars.top_a,
        stream: vars.stream,
      }),
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
      id: "llm-openrouter-gemini-pro",
      name: "Gemini Pro",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
        { key: "X-Title", value: "Flowrabbit" },
      ],
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "user_message",
          label: "User Message",
          placeholder: "What is the meaning of life?",
          helper: "Enter the message for the model to respond to",
        },
      ],
      advanced: [
        {
          default: 1.0,
          min: 0.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "temperature",
          label: "Temperature",
          helper: "Controls the variety in responses.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "top_p",
          label: "Top P",
          helper:
            "Limits the model's choices to a percentage of likely tokens.",
          decimals: true,
        },
        {
          default: 0,
          min: 0,
          type: "Number",
          required: false,
          id: "top_k",
          label: "Top K",
          helper: "Limits the model's choice of tokens at each step.",
        },
        {
          default: 0.0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "frequency_penalty",
          label: "Frequency Penalty",
          helper: "Controls the repetition of tokens.",
          decimals: true,
        },
        {
          default: 0.0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Adjusts the likelihood of repeating tokens.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "repetition_penalty",
          label: "Repetition Penalty",
          helper: "Reduces the repetition of tokens from the input.",
          decimals: true,
        },
        {
          default: 0.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "min_p",
          label: "Min P",
          helper: "Minimum probability for a token to be considered.",
          decimals: true,
        },
        {
          default: 0.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "top_a",
          label: "Top A",
          helper: "Focuses choices based on the highest probability token.",
          decimals: true,
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://openrouter.ai/docs",
      getTemplate: (vars) => ({
        model: "google/gemini-pro-1.5-exp",
        messages: [{ role: "user", content: vars.user_message }],
        temperature: vars.temperature,
        top_p: vars.top_p,
        top_k: vars.top_k,
        frequency_penalty: vars.frequency_penalty,
        presence_penalty: vars.presence_penalty,
        repetition_penalty: vars.repetition_penalty,
        min_p: vars.min_p,
        top_a: vars.top_a,
        stream: vars.stream,
      }),
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
    {
      id: "llm-openrouter-gpt-mini",
      name: "GPT Mini",
      url: "https://openrouter.ai/api/v1/chat/completions",
      type: "openrouter",
      headers: [
        { key: "Content-Type", value: "application/json" },
        { key: "HTTP-Referer", value: "https://www.flowrabbit.ai" },
        { key: "X-Title", value: "Flowrabbit" },
      ],
      elements: [
        {
          type: "TextArea",
          required: true,
          id: "user_message",
          label: "User Message",
          placeholder: "What is the meaning of life?",
          helper: "Enter the message for the model to respond to",
        },
      ],
      advanced: [
        {
          default: 1.0,
          min: 0.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "temperature",
          label: "Temperature",
          helper: "Controls the variety in responses.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "top_p",
          label: "Top P",
          helper:
            "Limits the model's choices to a percentage of likely tokens.",
          decimals: true,
        },
        {
          default: 0,
          min: 0,
          type: "Number",
          required: false,
          id: "top_k",
          label: "Top K",
          helper: "Limits the model's choice of tokens at each step.",
        },
        {
          default: 0.0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "frequency_penalty",
          label: "Frequency Penalty",
          helper: "Controls the repetition of tokens.",
          decimals: true,
        },
        {
          default: 0.0,
          min: -2.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "presence_penalty",
          label: "Presence Penalty",
          helper: "Adjusts the likelihood of repeating tokens.",
          decimals: true,
        },
        {
          default: 1.0,
          min: 0.0,
          max: 2.0,
          type: "range",
          required: false,
          id: "repetition_penalty",
          label: "Repetition Penalty",
          helper: "Reduces the repetition of tokens from the input.",
          decimals: true,
        },
        {
          default: 0.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "min_p",
          label: "Min P",
          helper: "Minimum probability for a token to be considered.",
          decimals: true,
        },
        {
          default: 0.0,
          min: 0.0,
          max: 1.0,
          type: "range",
          required: false,
          id: "top_a",
          label: "Top A",
          helper: "Focuses choices based on the highest probability token.",
          decimals: true,
        },
      ],
      method: "POST",
      authType: "Bearer",
      documentationAuthLink: "https://openrouter.ai/docs",
      getTemplate: (vars) => ({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: vars.user_message }],
        temperature: vars.temperature,
        top_p: vars.top_p,
        top_k: vars.top_k,
        frequency_penalty: vars.frequency_penalty,
        presence_penalty: vars.presence_penalty,
        repetition_penalty: vars.repetition_penalty,
        min_p: vars.min_p,
        top_a: vars.top_a,
        stream: vars.stream,
      }),
      output: {
        path: "choices[0].message.content",
        type: "JSON",
        streampath: "choices[0].delta.content",
      },
    },
  ],
};

export default llms;
