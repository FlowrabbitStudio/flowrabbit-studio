const flowrabbitHeaders = {
  HEADER_FLOWRABBIT: 'x-flowrabbit-headers',
  HEADER_FLOWRABBIT_MODEL: "x-flowrabbit-secret-name",
  HEADER_FLOWRABBIT_HOST: 'x-flowrabbit-proxy-target',
  HEADER_FLOWRABBIT_HASH: 'x-flowrabbit-hash',
  HEADER_FLOWRABBIT_APP_ID: "x-flowrabbit-appid",
  HEADER_FLOWRABBIT_STREAM_PATH: "x-flowrabbit-stream-path",
  HEADER_FLOWRABBIT_MAX_TOKENS: "x-flowrabbit-max-tokens",
  HEADER_FLOWRABBIT_QUANTITY: "x-flowrabbit-quantity",
  HEADER_FLOWRABBIT_MODEL_TYPE: "x-flowrabbit-model-type",
  HEADER_FLOWRABBIT_USER_TOKEN: "x-flowrabbit-user-token",
  HEADER_FLOWRABBIT_OUTPUT_PATH: "x-flowrabbit-output-path",
  HEADER_FLOWRABBIT_DISABLE_CREDITS: "x-flowrabbit-disable-c",
  HEADER_FLOWRABBIT_APPSTORE: "x-flowrabbit-appstore"
};

const brands = [
  { id: "flowrabbit", label: "Flowrabbit", logo: "ai-flowrabbit" },
  { id: "azure", label: "Azure", logo: "ai-azure" },
  { id: "claude", label: "Claude", logo: "ai-claude" },
  { id: "gemini", label: "Gemini", logo: "ai-gemini" },
  { id: "openai", label: "OpenAI", logo: "ai-openai" },
  { id: "openrouter", label: "Open Router", logo: "ai-openrouter" },
  { id: "perplexity", label: "Perplexity", logo: "ai-perplexity" },
  { id: "replicate", label: "Replicate", logo: "ai-replicate" },
  {
    id: "blackforestlabs",
    label: "Black Forest Labs",
    logo: "ai-blackforestlabs",
  },
  { id: "deepgram", label: "Deepgram", logo: "ai-deepgram" },
  { id: "elevenlabs", label: "ElevenLabs", logo: "ai-elevenlabs" },
];

const ConstantsUtil = {
  flowrabbitHeaders,
  brands
};

export default ConstantsUtil;
