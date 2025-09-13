import Logger from '../core/Logger'
class FTPEngine {
    constructor() {
        this.proxyURL = 'http://localhost:8084' // 'http://localhost:8084'
    }

    runUploadFile(config, data, hash, modelId) {
        Logger.log(-1, "FTPEngine.run()");
        return this.uploadFile(config, data, hash, modelId);
    }

    async transcribeAudio(config, data, hash, appID) {
        try {
            const fileDataBinding = config.input?.fileDataBinding;
            if (fileDataBinding) {
                const configData  = {
                    doc: data[fileDataBinding],
                    ...config
                }           
                const formData = await this.buildFormData(configData);
                const header = await this.createDefaultHeader(configData, hash, appID)
                console.debug(header)
                // No need to set the Content-Type explicitly; fetch will handle this.
                const response = await fetch(this.proxyURL + '/upload-file-ftp', {
                    method: "POST",
                    mode: 'cors',
                    headers: header,
                    cache: 'no-cache',
                    redirect: 'follow',
                    referrer: 'no-referrer',
                    body: formData
                });
        
                const result = await response.json();
                return result.text;
            }
            return "";
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
    
    async buildFormData(configData) {
        const formData = new FormData();
        if (configData.input.type === 'file') {
            const file = configData.input.file;
            formData.append("pdf", file);
            Logger.log(-1, "DocEngine.buildFormData()", "file added", formData);
        } else if (configData.input.type === 'url') {
            formData.append("url", configData.input.url);
            Logger.log(-1, "DocEngine.buildFormData()", "url added", formData);
        } else if (configData.input.type === 'AUDIO') {
            const audioFile = configData.audio;
            const audioBlob = await this.getBlobFromUrl(audioFile);            
            formData.append("audio", audioBlob, "recording.wav");
            formData.append("data", configData);
            Logger.log(-1, "DocEngine.buildFormData()", "url added", formData);
        } 
        return formData;
    }
    async getBlobFromUrl(audioUrl) {
        try {
            const response = await fetch(audioUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const audioBlob = await response.blob();
            return audioBlob;
        } catch (error) {
            console.error('Failed to fetch the audio blob:', error);
            throw error;
        }
    }
    handleOutput(resolve, reject, response) {
        Logger.log(2, "DocEngine.handleOutput()", "enter", response);
        if (response.ok) {
            response.json().then(data => {
                Logger.log(2, "DocEngine.handleOutput()", "exit", data);
                resolve(data);
            });
            return;
        }
        reject(new Error(`Could not process the document: ${response.statusText}`));
    }
    async createDefaultHeader(request, hash, appID, values) {
        let headers = {}
        let token = await this.buildToken(request, values)
        headers['x-flowrabbit-hash'] = hash
        headers['x-flowrabbit-appid'] = appID
        if (request && request.input && request.input.type === 'url') {
            return { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        }

        if (token) {
            headers['Authorization'] = `${token}`.trim()
        }
        return headers
    }

    async buildToken(request, values) {
        let data = await this.fillString(request.token, values, true);
        Logger.log(1, "FTPEngine.buildToken()", "exit", data)
        return data;
    }

    async fillString(s, values) {
        for (let key in values) {
            let value = this.getValueByKey(values, key)
            let pattern = "${" + key + "}"
            s = this.replacePattern(s, pattern, value)
        }
        if (s.indexOf('${') >= 0) {
            Logger.log(-1, "FTPEngine.fillString()", "> Not all parameters replaced!" + s)
        }
        return s
    }

    replacePattern(s, pattern, value) {
        let i = 0
        while (s.indexOf(pattern) >= 0 && i < 100) {
            s = s.replace(pattern, value)
            i++
        }
        return s
    }

    getValueByKey(values, key) {
        /**
         * Shouldn't this be JSONPath?
         */
        return values[key]
    }

    getAuthType(request) {
        if (request.authType === 'Bearer') {
            return 'Bearer'
        }
        if (request.authType === 'Basic') {
            return 'Basic'
        }
        return ''
    }
}
export default new FTPEngine();