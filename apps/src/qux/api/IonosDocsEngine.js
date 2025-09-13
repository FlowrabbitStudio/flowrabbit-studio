import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'
import ConstantsUtil from "../../util/ConstantsUtil.js";
import { Base64 } from 'js-base64';

export default class IonosDocsEngine {

    constructor(conf) {
        if (conf.proxy) {
            this.proxyURL = conf.proxy
        }
        Logger.log(-12, 'IonosDocsEngine.constructor() ', this.proxyURL)
    }


    async run(appID, hash, widget, viewModel) {
        Logger.log(-12, 'IonosDocsEngine.run() ', viewModel)

        if (!widget?.props?.api) {
            Logger.error('IonosDocsEngine.run() > no API')
            return
        }
        if (!widget?.props?.databinding?.input) {
            Logger.error('IonosDocsEngine.run() > no input daatbinding')
            return
        }

        this.setLoading(widget, viewModel, true)

        const api = widget.props.api
        const query = JSONPath.get(viewModel, widget.props.databinding.input)
        if (!query) {
            Logger.warn('IonosDocsEngine.run() > No query')
        }

        try {
            const url = `https://inference.de-txl.ionos.com/collections/${api.collectionID}/query`
            const response = await this.fetch(
                url, 
                'POST', 
                {
                    "limit": api.k,
                    "query": query
                }, 
                api.token,
                hash, 
                appID
            )
            if (response && response?.properties?.matches) {
                const matches = response.properties.matches.map(d => {
                    return this.mapDoc(d.document)
                })
                if (api.returnString) {
                    const str = matches.map(d => {
                        return d.content
                    }).join('.\n\n')
                    this.setDataBinding(viewModel, str, widget.props.databinding)
                } else {
                    this.setDataBinding(viewModel,matches, widget.props.databinding)
                }
            } else {
                Logger.error("IonosDocsEngine.run() > Straneg result", response)
  
            }
        } catch (err) {
            Logger.error("IonosDocsEngine.run() > Some error", err)
        }
        this.setLoading(widget, viewModel, false)
  
        return null       
    }

    setLoading(widget, viewModel, value) {
        if (widget?.props?.databinding?.loading) {
            console.debug('setLoading', widget?.props?.databinding?.loading)
            JSONPath.set(viewModel, widget?.props?.databinding?.loading, value)
            Logger.log(-12, 'IonosDocsEngine.setLoading() > ', value)
        }
    }

    mapDoc(d) {
        return {
            id: d.id,
            name: this.mapName(d.properties.name),
            flwID: d.properties.name,
            created: d.metadata.createdDate,
            content: Base64.decode(d.properties.content),
            chunk: d.properties?.labels?.chunk
        }
    }

    mapName(name) {
        if (name.indexOf('_flw_')) {
            return name.split('_flw_')[0]
        }
        return name
    }

    async fetch(url, method, data, authToken, hash, appID) {
     
        const headers = {}
        headers['Authorization'] = `Bearer ${authToken}`
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'
        if (headers) {
            let headerKeys = Object.keys(headers).join(';')
            headers['x-flowrabbit-headers'] = headerKeys
        }
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HOST] = url;
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HASH] = hash;
        headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_APP_ID] = appID;

        try {
            const request = {
                method: method,
                mode: 'cors',
                cache: 'no-cache',
                headers: headers,
                redirect: 'follow',
                referrer: 'no-referrer'
            }
            if (data) {
                request.body = JSON.stringify(data)
            }
            const response = await fetch(this.proxyURL, request)
            if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
                Logger.error("fetch", "Wrong status", response)
                return
            }
            return await response.json()
        } catch (err) {
            Logger.error("fetch", "Could not load", err)
        }
    }

    setDataBinding (data, value, databinding) {
        const path = databinding.output
        if (path) {
            JSONPath.set(data, path, value)
        }
    }
}