import UserService from './UserService'
import ModelService from './ModelService'
import OrgService from './OrgService'
import PublicModelService from './PublicModelService'
import CommentService from './CommentService'
import SymbolService from './SymbolService'
import HelpService from './HelpService'
import ImageService from './ImageService'
import PreviewService from './PreviewService'
import WebSocketService from './WebSocketService'
import CommandService from './CommandService'
import AIService from './AIService'

class Services {

    constructor () {
        this.config = {
            'default': true,
            'auth': 'qux',
            'user': {
                'allowSignUp': true
            },
            'websocket': '',
            'proxy_URL': 'http://localhost:8084',
            'app_URL': 'http://localhost:8081'
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
                        this.config = j                
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
        PublicModelService.setErrorHandler(handler)
        UserService.setErrorHandler(handler)
        ImageService.setErrorHandler(handler)
    }

    getImageService () {
        ImageService.setToken(this.getUserService().getToken())
        return ImageService
    }

    getPreviewService () {
        PreviewService.setToken(this.getUserService().getToken())
        return PreviewService
    }

    getWebSocketService (modelId, token, user) {
        if (this.config.ws_URL) {
            let ws = new WebSocketService(this.config.ws_URL, modelId, token, user)
            return ws
        }
        return null
    }

    getAIService () {
        const aiService = new AIService()
        aiService.setToken(UserService.getToken())
        return aiService   
    }

    getUserService () {
        UserService.setToken(UserService.getToken())
        return UserService   
    }

    getSymbolService () {
        return SymbolService
    }

    getHelpService () {
        return HelpService
    }

    getOrgService() {
        OrgService.setToken(this.getUserService().getToken())
        return OrgService
    }

    getCommandService () {
        CommandService.setToken(this.getUserService().getToken())
        return CommandService
    }

    getModelService (route) {
        // if (!route) {
        //     console.error('getModelService() without route')
        //     console.trace()
        // }
        if (route && route.meta && route.meta.isPublic) {
            PublicModelService.setToken(this.getUserService().getToken())
            return PublicModelService
        }
        ModelService.setToken(this.getUserService().getToken())
        return ModelService
    }

    getPublicModelService () {
        PublicModelService.setToken(this.getUserService().getToken())
        return PublicModelService
    }

    getCommentService () {
        CommentService.setToken(this.getUserService().getToken())
        return CommentService
    }


}
export default new Services()