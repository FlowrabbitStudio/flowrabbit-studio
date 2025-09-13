import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'

export default class RowsEngine {

    constructor(conf) {
        if (conf.proxy) {
            this.proxyURL = conf.proxy
        }
        this.abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
        Logger.log(-12, 'RowsEngine.constructor() ', this.proxyURL)
    }


    async run(appID, hash, widget, data) {
        Logger.log(-12, 'AirtabelEngine.run() ', data)
        const api = widget.props.api
        const token =  api.token
        const url = `https://api.rows.com/v1/spreadsheets/${api.spreadsheetId}/tables/${api.tableId}/values/${api.range}`
        let response = await this.fetch(appID, hash, token, url, "GET")
        if (!response) {
            return
        }

        const abc = this.abc

        const parts = api.range.split(':')
        const startChar = parts[0].replace(/[0-9]/g, "")
        const startOffset = abc.indexOf(startChar)

        const result = response.items.map(row => {
            const item = {}
            row.forEach((value, index) => {
                const i = index + startOffset
                item[abc[i]] = value
            }) 
            return item
        })

        this.setDataBinding(data,result, widget.props.databinding)
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

}