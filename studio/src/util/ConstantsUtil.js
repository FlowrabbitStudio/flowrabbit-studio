const ScreenSettingsTypes = {
    Start: 'start',
    Segment: 'segment',
    Popup: 'overlay'
}

const flowrabbitHeaders = {
    HEADER_FLOWRABBIT: 'x-flowrabbit-headers',
    HEADER_FLOWRABBIT_MODEL: "x-flowrabbit-secret-name",
    HEADER_FLOWRABBIT_HOST: 'x-forwarded-host',
    HEADER_FLOWRABBIT_HASH: 'x-flowrabbit-hash',
    HEADER_FLOWRABBIT_APP_ID: "x-flowrabbit-appid",
    HEADER_FLOWRABBIT_STREAM_PATH: "x-flowrabbit-stream-path",
    HEADER_FLOWRABBIT_MAX_TOKENS: "x-flowrabbit-max-tokens",
    HEADER_FLOWRABBIT_QUANTITY: "x-flowrabbit-quantity",
    HEADER_FLOWRABBIT_MODEL_TYPE: "x-flowrabbit-model-type",
    HEADER_FLOWRABBIT_USER_TOKEN: "x-flowrabbit-user-token",
    HEADER_FLOWRABBIT_OUTPUT_PATH: "x-flowrabbit-output-path",
    HEADER_FLOWRABBIT_DISABLE_CREDITS: "x-flowrabbit-disable-c"
}

const DEFAULT_ORG_ID = "private";
const DEFAULT_ORG_LABEL = "Default";

const ConstantsUtil = {
    ScreenSettingsTypes,
    flowrabbitHeaders,
    DEFAULT_ORG_ID,
    DEFAULT_ORG_LABEL
}


export default ConstantsUtil;