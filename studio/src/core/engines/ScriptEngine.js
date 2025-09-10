import Logger from '../Logger'
import lang from '../../dojo/_base/lang'
let worker = new Worker(new URL('./ScriptWorker.js', import.meta.url))

export default class ScriptEngine {
    

    run (js, model, viewModel, sourceEvent = {type: 'None'}) {
        Logger.log(1, 'ScriptEngine.run()')
        this.isDone = false
        return new Promise((resolve, reject) => {

            try {
                const start = new Date().getTime()
                const viewModelClone = structuredClone(viewModel)
                worker.onmessage = (m) => this.onMessage(m, resolve, reject, start, js)
                worker.postMessage({
                    code: js, 
                    model: lang.clone(model), 
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
                        worker.terminate()
                        worker = new Worker(new URL('./ScriptWorker.js', import.meta.url))
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