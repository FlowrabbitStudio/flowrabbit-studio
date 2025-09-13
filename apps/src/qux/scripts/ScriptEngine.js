import Logger from '../core/Logger'
import * as ExportUtil from '../core/ExportUtil'

export default class ScriptEngine {
    
    constructor() {
        this.worker = new Worker(new URL('./ScriptWorker.js', import.meta.url));
    }

    run (js, model, viewModel, sourceEvent = {type: 'None'}) {
        Logger.log(1, 'ScriptEngine.run()')
        this.isDone = false
        return new Promise((resolve, reject) => {

            try {
                // TDOD: we could compress the model and just remove everything like styles etc...
                const start = new Date().getTime()
                this.worker.onmessage = (m) => this.onMessage(m, resolve, reject, start, js)
                const viewModelClone = structuredClone(viewModel)
                this.worker.postMessage({
                    code: js, 
                    model: ExportUtil.clone(model), 
                    viewModel: viewModelClone,
                    sourceEvent: sourceEvent
                })


                setTimeout(() => {
                    Logger.log(5, 'ScriptEngine.run() > isDone:', this.isDone)
                    if (!this.isDone) {
                        resolve({
                            status: 'error',
                            error: 'Running too long'
                        })
                        Logger.error('ScriptEngine.run() > need to terminate script')
                        this.worker.terminate()
                        this.worker = new Worker(new URL('./ScriptWorker.js', import.meta.url))
                    }
                   
                }, 5000)
            
            } catch (error) {
                Logger.error('ScriptEngine.run() > Error', error)
                resolve({
                    status: 'error',
                    error: error.message
                })
            }
            Logger.log(1, 'ScriptEngine.run() > exit')
        })
    }

    onMessage (message, resolve, reject, start) {
        const end = new Date().getTime()
        Logger.log(2, 'ScriptEngine.onMessage() > took',end - start)
        this.isDone = true
        resolve(message.data)
    }
}