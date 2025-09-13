import axios from 'axios';

export default class SecretService {

    constructor(apiServer, apiKey) {
        this.apiServer = apiServer
        this.apiKey = apiKey
    }

    async getSecrets (headers, target) {
        console.info("getSecrets() >>> " + target + " >> "  + this.hasMagicToken(headers))
   
        const hash = headers['x-flowrabbit-hash']
        const secrets = {}
        
        // gloabl secret
        if (this.hasMagicToken(headers)) {
            const secretName = this.hasMagicToken(headers);
            const isAppStoreApp = this.isAppStoreApp(headers);
           
            const url = `${this.apiServer}/rest/public/secrets/${hash}/secret/${secretName}.json${isAppStoreApp ? '?meter=false' : ''}`
            const resSecret = await axios.get(url, {headers: {
                'flowrabbit-api-key': this.apiKey,
                'flowrabbit-target-url': target
            }})
            if (resSecret.status !== 200) {
                console.error('findSecretByName() > Could not get secret name token')
            }
            if (resSecret.data) {
                secrets["flowrabbit"] = resSecret.data
                return secrets;
            }
        }
           
        // app specific secrets
        const appID = headers['x-flowrabbit-appid']
        if (!hash || !appID) {
            return {}
        }

        const res = await axios.get(this.apiServer + '/rest/public/secrets/app/'+ appID + '/' + hash + '/secrets.json', {headers: {
            'flowrabbit-api-key': this.apiKey,
            'flowrabbit-target-url': target
        }})
        if (res.status !== 200) {
            console.error('getAppSecrets() > Could not get secrets')
        }
        if (res.data && res.data.secrets) {
            res.data.secrets.forEach(s => {
                secrets[s.key] = s
            })
            return secrets
        } else {
            console.error('getAppSecrets() > Data is wrong')
        }
    }

    hasMagicToken(headers) {
        const flowrabbitSecretName = headers['x-flowrabbit-secret-name']
        if (flowrabbitSecretName) {
            return flowrabbitSecretName;
        }
        return false
    }

    isAppStoreApp(headers) {
        const isappstore = headers['x-flowrabbit-appstore']
        return isappstore
    }
}
