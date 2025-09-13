import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'

export default class AirtabelEngine {

    constructor(conf) {
        if (conf.proxy) {
            this.proxyURL = conf.proxy
        }
        Logger.log(-12, 'AirtabelEngine.constructor() ', this.proxyURL)
    }


    async run(appID, hash, widget, data) {
        Logger.log(-12, 'AirtabelEngine.run() ', data)
        const api = widget.props.api
        if (this['_run_'+ api.operation]) {
            const result = await this['_run_'+ api.operation](appID, hash, data, widget)
            this.setDataBinding(data,result, widget.props.databinding)
        } else {
            Logger.error('AirtabelEngine.run() > Not supported operation', api.operation)
        }
    }

    async _run_readTable(appID, hash, data, widget){
        Logger.log(-12, 'AirtabelEngine._run_readTable() ', data)
        const api = widget.props.api
        const token =  api.token
        const pageSize = this.getInputData(data, api, 'pageSize')
        const url = `https://api.airtable.com/v0/${api.baseId}/${api.tableIdOrName}/?pageSize=${pageSize}`       
        
     
        let result = await this.fetch(appID, hash, token, url, "GET")
        let records = result.records
        let count = 0
        while (result && result.offset && count < 50) {
            const next = `https://api.airtable.com/v0/${api.baseId}/${api.tableIdOrName}/?pageSize=${pageSize}&offset=${result.offset}`   
            result = await this.fetch(appID, hash, token, next, "GET")
            records = records.concat(result.records)
            count++
        }
        return records
    }

    async _run_createRow(appID, hash, data, widget){
        const api = widget.props.api
        const token =  api.token
        const url = `https://api.airtable.com/v0/${api.baseId}/${api.tableIdOrName}`
        const create = this.buildRequest(api, data)
        let result = await this.fetch(appID, hash, token, url, "POST", create)
        return result
    }

    async _run_readRow(appID, hash, data, widget){
        const api = widget.props.api 
        const token =  api.token
        let recordID = this.getInputData(data, api, 'recordId')   
        const url = `https://api.airtable.com/v0/${api.baseId}/${api.tableIdOrName}/${recordID}`   
        let result = await this.fetch(appID, hash, token, url, "GET")
        return result
    }

    async _run_updateRow(appID, hash, data, widget){
        const api = widget.props.api 
        const token =  api.token
        let recordID = this.getInputData(data, api, 'recordId')   
        const url = `https://api.airtable.com/v0/${api.baseId}/${api.tableIdOrName}/${recordID}`   
        const update = this.buildRequest(api, data, 'recordId')
        let result = await this.fetch(appID, hash, token, url, "PATCH", update)
        return result
    }

    async _run_deleteRow(appID, hash, data, widget){
        const api = widget.props.api 
        const token =  api.token
        let recordID = this.getInputData(data, api, 'recordId')   
        const url = `https://api.airtable.com/v0/${api.baseId}/${api.tableIdOrName}/${recordID}`   
        let result = await this.fetch(appID, hash, token, url, "DELETE")
        return result
    }

    setDataBinding (data, value, databinding) {
        const path = databinding.default
        JSONPath.set(data, path, value)
    }
    async fetch(appID, hash, authToken, url, method, data) {

        const headers = {}
        headers['Authorization'] = `Bearer ${authToken}`
        headers['Content-Type'] = 'application/json'
        headers['Accept'] = 'application/json'

        if (headers) {
            let headerKeys = Object.keys(headers).join(';')
            headers['x-flowrabbit-headers'] = headerKeys
        }
        headers['x-forwarded-host'] = url
        headers['x-flowrabbit-hash'] = hash
        headers['x-flowrabbit-appid'] = appID

  
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
        if (response.status !== 200) {
            throw new Error(response.json())
        }

        return await response.json()
 
    }

    buildRequest (api, data, exclude) {
        const request = {
            fields: {
            }                 
        }
        api.input.forEach(i => {
            if (i.id !== exclude) {
                const path = this.getDataBinding(i)
                const value = JSONPath.get(data, path)
                if (value !== undefined) {        
                    request.fields[i.id] = this.convertType(value, i)
                }
           }              
        })
        return request
    }

    getDataBinding(input) {
        let v = input.variable
        if (v) {
            const matches = v.match(/\$\{(.*?)\}/g)
            if (matches) {
                v = v.substring(2, v.length - 1)
            }
        }
        return v
    }

    convertType (value, i) {
        if (i.type === 'checkbox') {
            return value === 'true'
        }
        if (i.type === 'bool') {
            return value === 'true'
        }
        if (i.type === 'number') {
            return value * 1
        }
        return value
    }

    getInputData(data, api, key) {
        if (!api.input) {
            console.debug('getInputData > api', JSON.stringify(api, null, 2))
            console.debug('getInputData > data', JSON.stringify(data, null, 2))
            return data[key]
        }
        const found = api.input.find(f => f.id === key)
        if (found) {
            if (found.variable) {
                const path = this.getDataBinding(found)
                const value = JSONPath.get(data, path)
                return value
            } 
            return found.value
        }
    }

}