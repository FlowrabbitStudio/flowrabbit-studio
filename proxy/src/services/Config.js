import "dotenv/config";

export default class Config {

    constructor() {
    }

    async getAPIKey () {
        return process.env.FLR_CLIENT_API_KEY;
    }

    getAPIServer () {
        return process.env.FLR_API_URL;
    }
}
