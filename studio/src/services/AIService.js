import Logger from '../common/Logger'
import AbstractService from './AbstractService'
import * as StyleImporter from '../core/ai/StyleImporter'
import ConstantsUtil from "../util/ConstantsUtil";
import Services from './Services';

export default class AIService extends AbstractService {


    constructor() {
        super()
        this.logger = new Logger('AIService')
        this.messages = []
        this.language = 'YAML'
        const url = Services.getConfig().proxy_URL
        this.proxyURL = url + `/proxy`;
        console.debug('AIService.constructor', this.proxyURL)
    }

    reset () {
        this.messages = []
    }

    runText2JS (message, key, useFlowRabbitToken, jwtToken, app, schemaAsText) {

        const prompt =`
            

            ${message}

            The function has access to one big data object "data" which contains all the data.
            "data" is a JavaScript object. It has the following properties of type:

            ${schemaAsText}

            Please create script that writes the result back to the "data" object. Here is an example,
            how the script could look like:

            """
            function calculate(data) {
                return data.value1 + data.value2
            }
            data.result = calculate(data)
            """

            Do not include any examples how functions are called. Just the function itself.

            Return the result as JavaScript. You can add comments to the code if you think it 
            helps to understand the code. Do not include any additional text.

            
        `

        const request = {
            'url': 'https://api.openai.com/v1/chat/completions',
            'appID':  app.id,
            'hash': jwtToken,
            'openAIOrgID': 'Klaus',
            'flowRabbitTokenType': 'openai-chat-4o', // keep in sync with the model in data
            'data': {
                "model": 'gpt-4o',
                "messages": [
                    {
                        "role": "system", 
                        "content": `You are JavaScript GPT. You are really god at writing easy to understand JavaScript code.`
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ]
            }
        }

        if (useFlowRabbitToken) {
            request.token = "${secrets.flowrabbit}"
            request.useFlowRabbitToken = true
        } else {
            request.token = key
        }

        return this.runPrompt(request, 'js')
    }


    async runGPT4TurboYaml(message, key, useFlowRabbitToken, jwtToken, app, options, oldYaml) {

        let oldYamlText = ''
        if (!oldYaml) {
            oldYamlText = `
            In a previous run this yaml was generated:

            
            ${oldYaml}

            Try to update the yaml to include the new or changed elements.
            `
        }
        const prompt =`
            This is a UI language in YAML which has the following elements:

            CONTAINER: An element that can have child elements. I container has an list of CHILDREN elements. 
                A container has an attribute FLEX-DIRECTION. It can have the values ROW and COLUMN. ROW means,
                that the elements are aligned horizontal from left to right, COLUMN means the elements are aligned vertical from top to down.
                            
            LABEL: An Element that can show text. It has a CONTENT element. A label has a TYPE element which can be "Headline", "Label" or "Paragraph"

            BUTTON: An Element that can show text. It has a CONTENT element. 
            
            INPUT: An element to render a text field. It can have a PLACEHOLDER ELEMENT and a TYPE element. The TYPE can be "Text", "Checkbox", "RadioBox", "Switch", "Password" or "TextArea".
            
            IMAGE: An element to present an image. It has a CONTENT child element. Images are optional and should only be included if needed.

            TABLE: An element to present a table. It has a COLUMNS element which is a list of column names. 
            It also has a DATA element which is an ARRAY of ARRAY of string values.

            RADIO_GROUP: An element where the user can select one of several options. The ELEMENT has an OPTIONS child element, which is ARRAY of strings and 
            describes the different options the user can choose from. RADIO_GROUP elements are only used when the number of choices is less then 5. 

            CHECKBOX_GROUP: An element where the user can select one or more of several options. The ELEMENT has an OPTIONS child element, which is ARRAY of strings and 
            describes the different options the user can choose from. RADIO_GROUP elements are only used when the number of choices is less then 5. 

            DROPDOWN: An element which will render a dropdown menu where the user can select on of a large number of options. The ELEMENT has an OPTIONS 
            child element, which is ARRAY of strings and describes the different options the user can choose from. DROPDOWN elements are only used when 
            the number of choices is more than 5.
            
            DATE_PICKER: An element that allows the user to pick a date. It will open a calendar view. The DATE_PICKER has a content element.

            INPUT, DROPDOWN and DATE_PICKER elements can have an label above them to help the user understand what data the need to input.

            SEGMENT_BUTTON: An element of a group of buttons that allows the user to select one of several button options. The SEGMENT_BUTTON has an OPTIONS child element, which is ARRAY of strings and
            describes the different options the user can choose from. SEGMENT_BUTTON elements are only used when the number of choices is less then 5.

            Each if the elements can have a VARIABLE attribute. This defines in which variable the data if the input element should be stored. The value follows the "dot notation". 
            For instance a email input might have the value "email" or "user.email". 

            Please generate :

            ${message}

            ${oldYamlText}
            
            Return the result as YAML in the defined language. Do not include any additional text.
        `

        // FIX get here the responsive device type details
        const appType = app.type
        const screenWidth = app.screenSize.w

        const request = {
            'url': 'https://api.openai.com/v1/chat/completions',
            'appID':  app.id,
            'hash': jwtToken,
            'openAIOrgID': 'Klaus',
            'flowRabbitTokenType': 'openai-chat-4o', // keep in sync with the model in data
            'data': {
                "model": 'gpt-4o',
                "messages": [
                    {
                        "role": "system", 
                        "content": `You are design GPT. You are really good at deisgn web sites and mobile apps.`
                    },
                    {
                        "role": "system", 
                        "content": `The website you generate should run on a ${appType} device. The screen with is ${screenWidth} pixel`
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ]
            }
        }

        if (useFlowRabbitToken) {
            request.token = "${secrets.flowrabbit}"
            request.useFlowRabbitToken = true
        } else {
            request.token = key
        }

        return this.runPrompt(request, 'yaml')
    }

    async fetchProxy(req) {

        const headers = {}
        headers['Authorization'] = `Bearer ${req.token}`
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'
      

        if (headers) {
            let headerKeys = Object.keys(headers).join(';')
            headers['x-flowrabbit-headers'] = headerKeys
        }
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HOST] = req.url;
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HASH] = req.hash;
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_APP_ID] = req.appID;

        // for flowrabbit tokens we need to add some extra stuff
        if (req.useFlowRabbitToken) {
            headers['openai-organization'] = 'flowrabbit-gmbh'
            headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_USER_TOKEN] = req.hash;
            headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL_TYPE] = 'llm';
            headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MODEL] = req.flowRabbitTokenType;
            headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_MAX_TOKENS] = 4000;
        }
  
        try {
            const request = {
                method: "post",
                mode: 'cors',
                cache: 'no-cache',
                headers: headers,
                redirect: 'follow',
                referrer: 'no-referrer'
            } 
            request.body = JSON.stringify(req.data)            
            const response = await fetch(this.proxyURL, request)

            if (response.status === 405) {
                const data = await response.json()
                if (data.error && data.error.indexOf('budget')) {
                    return {
                        'error': "wizards.errors.budget"
                    }
                } else {
                    return {
                        'error': "wizards.errors.network"
                    }
                }
            }
            if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
                return {
                    'error': "wizards.errors.network"
                }
            }
         
            return await response.json()
            
        } catch (err) {
            this.logger.error("fetch", "Could not load", err)
            return {
                'error': "wizards.errors.network"
            }
        }
    }

    async runPrompt (request, returnType = 'html') {

        try {
            const start = Date.now()
            const res = await this.fetchProxy(request)
            const end = Date.now()
            this.logger.error('runPrompt() > API took ', end-start)

            if (res.choices && res.choices.length > 0) {
                const choice = res.choices[0]
                const content = choice?.message?.content
                if (returnType === 'html') {
                    return this.extractHTML(content)
                } else if (returnType === 'js') {
                    return this.extractJS(content)
                } else {
                    return this.extractYAML(content)
                }

            }
            if (res.error) { 
                this.logger.error('runPrompt() > Error from API', res)
                if (res.error === 'wizards.errors.budget') {
                    return {
                        error: 'design-gpt.error-no-budget'
                    }
                }
        
                return {
                    error: 'design-gpt.error-no-idea'
                }
                
            }
        } catch (err){
            return {
                error: 'design-gpt.error-server'
            }
        }
        return {
            error: 'design-gpt.error-no-idea'
        }
    }



    getStylePrompt (app, options) {
        if (!options.isCustomStyles) {
            return ''
        }
        try {

            const customStyles = StyleImporter.getCustomStyle(app)
            return `
                Unless further specified, use the following colors and backgrounds for the HTML elements:
                Screens should have one of the following background colors: ${this.join(customStyles?.screen?.background)}.
                Buttons should have one of the following background colors: ${this.join(customStyles?.button?.background)}.
                Buttons should have one of the following colors: ${this.join(customStyles?.button?.color)}.
                Labels, P and normal text should have one of the following colors: ${this.join(customStyles?.label?.color)}.
                INPUT elements should have one of the following background colors: ${this.join(customStyles?.input?.background)}.
                INPUT elements should have one of the following colors: ${this.join(customStyles?.input?.color)}.
                INPUT elements should have one of the following border color : ${this.join(customStyles?.input?.borderTopColor)}.
            `
        } catch (err) {
            this.logger.error('getStylePrompt', 'Error', err)
        }

        return ''
    }

    join(arr) {
        if (arr) {
            return arr.join(', ')
        }
        return ''
    }
    

    extractJS (content) {
     
        try {
            content = content.split('\n').slice(1, -1).join('\n')
            return {
                js: content
            }
        } catch (e) {
            console.debug('extractJS', content)
            console.error(e)
        }
        return {
            error: 'design-gpt.error-no-js'
        }
    }

    extractYAML (content) {
        try {
            content = content.split('\n').slice(1, -1).join('\n')
            return {
                yaml: content
            }
        } catch (e) {
            console.debug('extractYAML', content)
            console.error(e)
        }
        return {
            error: 'design-gpt.error-no-yaml'
        }
    }

    extractHTML (content) {
          
        if (!content) {
            return {
                error: 'error-no-content'
            }
        }
        const start = content.indexOf('html>')
        const end = content.indexOf('</html>')
        if (start > -1 && end > -1) {
            let innerHTML = content.substring(start + 5, end)
            innerHTML = innerHTML.replace('<html>', '')
            return {
                html: `<html>${innerHTML}</html>`
            }
        } 
        return {
            error: 'design-gpt.error-no-html'
        }
    }

    getAssistants () {
        return this._get('/v1/assistants')
    }

}