import UserService from './UserService'
import ModelService from './ModelService'
import MakeService from './MakeService'
import RestEngine from "../qux/api/RestEngine";

class Services {

    constructor () {
        this.config = {
            'default': true,
            'auth': 'qux',
            'api': "https://api-os.flowrabbit.ai",  
            'user': {
                'allowSignUp': true
            },
            'websocket': '',
            'proxy_URL': 'https://proxy-os.flowrabbit.ai',
            'api_URL': 'https://api-os.flowrabbit.ai',
            'node_URL': 'https://node-os.flowrabbit.ai'
        }
    }

    async initConfig () {
        return new Promise((resolve, reject) => {
            fetch('/config.json', {
                method: 'get',
                credentials: "same-origin"
            }).then((res) => {
                if (res.status === 200) {
                    res.json().then(j => {                        
                        console.debug("Luisa > config: ", j)
                        this.config = j
                        RestEngine.setProxyURL(this.config.proxy_URL)
                        resolve(j)
                    })
                } else {
                    reject(new Error('Could not load config'))
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }

    getConfig() {
        return this.config
    }

    setErrorHandler (handler) {
        this.errorHandler = handler
        ModelService.setErrorHandler(handler)
        UserService.setErrorHandler(handler)
    }

    getUserService () {
     
        UserService.setToken(UserService.getToken())
        return UserService   
        
    }

    getModelService () {
        ModelService.setToken(this.getUserService().getToken())
        return ModelService
    }

    getMakeService (token) {
        MakeService.setToken(token)
        return MakeService
    }

}
export default new Services()