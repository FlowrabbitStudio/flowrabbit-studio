import Logger from '../core/Logger'
import Services from "../../services/Services";
import StreamEngine from './StreamEngine';

class OpenAIEngine {
    constructor() {
        this.proxyURL = `${Services.getConfig().proxy_URL}/proxy`;
    }

    findAssistants (appID, hash, openAIToken) {
        return this.get('https://api.openai.com/v1/assistants?order=desc&limit=20', appID, hash, openAIToken)
    }

    async query(appID, hash, openAIToken, assistant, content, version, stream = false) {
        Logger.log(-1, "query() > enter " +  assistant + " > " + content)

        // create thread
        const thread = await this.post('https://api.openai.com/v1/threads', appID, hash, openAIToken,{}, version)
        const message = await this.post(`https://api.openai.com/v1/threads/${thread.id}/messages`,appID, hash, openAIToken, {     
            "role": "user",
            "content": content              
        }, version)

        Logger.log(1, "query() > message: ", message)

        if (stream) {
            return new Promise((resolve, reject) => {
                this.streamRun(`https://api.openai.com/v1/threads/${thread.id}/runs`, appID, hash, openAIToken, {
                    assistant_id: assistant,
                    stream: true
                }, version, resolve, reject);
            });
        } else {
            const run = await this.post(`https://api.openai.com/v1/threads/${thread.id}/runs`, appID, hash, openAIToken, {
                assistant_id: assistant
            }, version)
    
            let result = {status:"queued"}
            let count = 0
            while ((result.status === "queued" || result.status === 'in_progress') && !result.completed_at && count < 50) {
            await this.sleep(2000)
                result = await this.get(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, appID, hash, openAIToken, version)
                Logger.log(2, "query() > busy wait: ", result.status, result.completed_at)
                count++
            }
            if (result.status === 'completed') {
                const messages = await this.get(`https://api.openai.com/v1/threads/${thread.id}/messages`,  appID, hash, openAIToken, version)
                if (messages.data.length > 1) {
                    const answer = messages.data.filter(m => m.role === "assistant")[0]
                    if (answer) {
                        Logger.log(2, "query() > answer: ", answer)
                        return answer.content[0].text.value
                    } else {
                        throw new Error("No assistant answer")
                    }
                  
                } else {
                    throw new Error("Not enough answers")
                }   
            }
            throw new Error("Something was wrong. Run did not complete")
        }
    }

    sleep (ms) {
        Logger.log(-1, "sleep() > ", ms)
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, ms)
        })
    }

    post(url, appID, hash, openAIToken, data, version) {
        const headers = this.createDefaultHeader(url, appID, hash, openAIToken, undefined, version)
        return new Promise((resolve, reject) => {

            fetch(`${Services.getConfig().proxy_URL}/proxy`, {
                method: "POST",
                mode: 'cors',
                cache: 'no-cache',
                headers: headers,
                redirect: 'follow',
                referrer: 'no-referrer',
                body: JSON.stringify(data)
            })
            .then(response => {
                this.handleOutput(resolve, reject, response)
            }).catch(e => {
                reject(e)
            });

        })
    }

    get(url, appID, hash, openAIToken, version) {
        const headers = this.createDefaultHeader(url, appID, hash, openAIToken, undefined, version)
        return new Promise((resolve, reject) => {

            fetch(`${Services.getConfig().proxy_URL}/proxy`, {
                method: "GET",
                mode: 'cors',
                cache: 'no-cache',
                headers: headers,
                redirect: 'follow',
                referrer: 'no-referrer'
            })
            .then(response => {
                this.handleOutput(resolve, reject, response)
            }).catch(e => {
                reject(e)
            });

        })
    }

    handleOutput(resolve, reject, response) {
        Logger.log(2, "OpenAIEngine.handleOutput()", "enter", response)

        if (response.status == 200 || response.status == 201) {
          
            try {
                resolve(response.json())
            } catch (e) {
                reject(new Error(`Could not parse JSON`,e))
            }
           
            return;
        }
        reject(Error(`Some REST error`))
    }

    createDefaultHeader(url, appID, hash, openAIToken, authType='Bearer', version) {
        const headers = {}
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'
        headers['Authorization'] = `${authType} ${openAIToken}`.trim()
        headers['OpenAI-Beta'] = `assistants=${version || 'v1'}`

        if (headers) {
            let headerKeys = Object.keys(headers).join(';')
            headers['x-flowrabbit-headers'] = headerKeys
        }
        headers['x-forwarded-host'] = url
        headers['x-flowrabbit-hash'] = hash
        headers['x-flowrabbit-appid'] = appID

        return headers
    }

    streamRun(url, appID, hash, openAIToken, data, version, resolve, reject) {
        const headers = this.createDefaultHeader(url, appID, hash, openAIToken, undefined, version);
        fetch(`${Services.getConfig().proxy_URL}/proxy` + '?stream=true', {
            method: "POST",
            mode: 'cors',
            cache: 'no-cache',
            headers: headers,
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(data)
        })
        .then(response => {
            this.handleStreamOutput(resolve, reject, response);
        }).catch(e => {
            reject(e);
        });
    }

    handleStreamOutput(resolve, reject, response) {
        Logger.log(2, "OpenAIEngine.handleStreamOutput()", "enter", response);

        if (response.status === 200 || response.status === 201) {
            const reader = response.body.getReader();
            const stream = new ReadableStream({
                start: (controller) => {
                    StreamEngine.handleStreamData(reader, controller, reject);
                }
            });
            // Return the stream via resolve or process the stream here directly
            resolve(stream);
        }
        reject(Error(`Some REST error`));
    }

}

export default new OpenAIEngine();
