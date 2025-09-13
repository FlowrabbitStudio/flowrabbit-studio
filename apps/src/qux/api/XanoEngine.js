import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'
import RestEngine from './RestEngine'

export default class XanoEngine {

    constructor(conf) {
        if (conf.proxy) {
            this.proxyURL = conf.proxy
        }
        Logger.log(-12, 'WebHookEngine.constructor() ', this.proxyURL)
    }


    async run(appID, hash, widget, viewModel) {
        Logger.log(-12, 'WebHookEngine.run() ', viewModel)

        if (!widget?.props?.api) {
            Logger.error('WebHookEngine.run() > no API')
        }

        const api = widget.props.api
        const request = {
            method: api.method,
            authType: 'Bearer',
            headers: [],
            output: {
                databinding: "", 
                template: "", 
                type: "TEXT", 
                hints: {}
            },
            input: {
                type: "JSON", 
                fileDataBinding: "", 
                template: api.template
            },
            token: api.token,
            isProxyEnabled: true,
            url: api.url
        }

        // we need a simple lookup map, because the rest engine does not use the
        // json path
        const requiredDataBindings = RestEngine.getNeededDataBings(request);
        const data = {};
        requiredDataBindings.forEach((path) => {
          let value = JSONPath.get(viewModel, path);
          data[path] = value;
        });
  

        let result = await RestEngine.run(request, data , hash, appID, true);
        try {
            result = JSON.parse(result)
        } catch {
            Logger.warn('WebHookEngine.run() > strange output', result)
        }
        this.setDataBinding(viewModel, result, widget.props.databinding)
        return null       
    }

    setDataBinding (viewModel, value, databinding) {
        JSONPath.set(viewModel, databinding.default, value);
    }
}