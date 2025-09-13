import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'

export default class JsonParserEngine {

    constructor() {

    }

    async run(appID, hash, widget, viewModel) {
        Logger.log(2, 'JsonParserEngine.run() ', viewModel)
        const inputPath = widget.props?.databinding?.input
        const outputPath = widget.props?.databinding?.output
        const txt = JSONPath.get(viewModel, inputPath)
        if (!txt) {
            Logger.error('JsonParserEngine.run() > no input')
            return
        }
        try {
            const parsed = this.parse(txt)
            if (outputPath) {
                JSONPath.set(viewModel, outputPath, parsed)
                Logger.log(-12, 'JsonParserEngine.run() exit ', parsed, outputPath)
            }
        }
        catch (e) {
            Logger.error('JsonParserEngine.run() > invalid JSON', e)
            return
        }
    }

    parse(txt) {
        Logger.log(-2, 'JsonParserEngine.parse() ', txt)
        let jsonStart = txt.indexOf('[');
        let jsonEnd = txt.lastIndexOf(']');
        if (jsonStart === -1 || jsonEnd === -1) {
            jsonStart = txt.indexOf('{');
            jsonEnd = txt.lastIndexOf('}');
        }
        
        if (jsonStart === -1 || jsonEnd === -1) {            
            Logger.error('JsonParserEngine.run() > no input')
            return
        }
        
        const jsonString = txt.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);
        return parsed;
    }

   
}
