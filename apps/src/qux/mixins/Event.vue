<template>
  <div class="qux">
  </div>
</template>
<script>
import Logger from '../core/Logger'
import * as Util from '../core/ExportUtil'
import JSONPath from '../core/JSONPath'
import MetaWriter from '../core/MetaWriter'
import MakeBridgeDialog from '../../qux/web/MakeBridgeDialog.vue'
import { createApp } from "vue";


export default {
  name: 'Event',
  methods: {

    onViewModelChange (element, path, value) {
        Logger.log(2, 'Event.onViewModelChange() > ' + path, value)
        this.executeDataScripts()
        this.$emit('qViewModelChange', this.modelValue)
    },

    onDesignLoaded () {
        Logger.log(2, 'Event.onScreenLoaded() > ', screen)
        
        this.initLoadRest()
        this.initRepeatRest()

        this.initLoadScripts()
        this.initRepeatScripts()

        this.initLoadAPI()
        this.initRepeatAPI()
    },

    beforeScreenLoaded () {
        Logger.log(-1, 'Event.beforeScreenLoaded() > ')
        if (this.$route && this.$route.query) {
            const query = this.$route.query
            for (let key in query) {
                Logger.log(-5, `Event.beforeScreenLoaded() > set "$query.${key}" = `, query[key])
                JSONPath.set(this.modelValue, `@query.${key}`, query[key])
            }
        }
    },

    onScreenLoaded (screen) {
        Logger.log(2, 'Event.onScreenLoaded() > ', screen)
        this.onLoadingEnd()
        this.setSystemVariable('screen', screen.name)
        this.purgeValidationErrors()
        this.$emit('qScreenLoad', {
            value: this.modelValue,
            element: screen,
            screen: screen,
            viewModel: this.modelValue,
            luisa: this
        })      
        this.dispatchCallback(screen, null, 'load', null)
        this.dispatchScreenAnimation(screen)
        MetaWriter.write(screen)
    },

    onOverlayLoaded(scrn) {
        Logger.log(2, 'Event.onOverlayLoaded() > ', scrn)
        this.onLoadingEnd()
        this.setSystemVariable('screen', screen.name)
        this.purgeValidationErrors()
    },

    async onActionLine(element, e) {
        Logger.log(-11, 'Event.onActionLine() > ' + element.name, e.action)
        if (element.lines) {
            const line = element.lines.find(l => l.action === e.action)
            if (line) {
                const value = e.value
                this.executeLine(line, value, element)
            } else {
                Logger.log(-11, 'Event.onActionLine() > NO Line ' + element.name, e.action)
            }
        }
    },
    
    /**
     * This event come from now from the table. The event 'e'
     * contains the callback and the data of the row as 'params'.
     */
    async onCallback (element, e) {
        Logger.log(1, 'Event.onCallback() > ' + element.name, e.callback)
        const executor = this.getMethodExcutor()
        if (executor) {
            if (executor[e.callback]) {
                const func = executor[e.callback]
                if (func instanceof Function) {
                    const result = await func({
                        value: null,
                        element: element,
                        viewModel: this.modelValue,
                        luisa: this,
                        params: e.params,
                        event: e
                    })

                    /**
                     * Since 0.4 we check if we can dispatch the result to a screen.
                     */
                   this.handleCallbackResult(result, e.callback)
                    return;
                } else {
                    console.warn('Event.onCallback() > Callback is not method ', e.callback)
                }
            } else {
                console.warn('Event.onCallback() > no method in executor with name ', e.callback)
            }
        }
    },

    onEnter (element, e, value) {
        Logger.log(4, 'Event.onEnter() > enter', element)

        if (element.lines) {
            const line = Util.getLineByType(element, 'KeyboardEnter')
            if (line) {
                this.executeLine(line, value, element)
                this.stopEvent(e)
            }
        }
    },

    onClick (element, e, value) {
        Logger.log(4, 'Event.onClick() > enter', element, value)

        if (Logger.logLevel > 10) {
            Logger.log(10, 'Event.onClick()', e.target)
        }
        if (element.lines) {
            const line = Util.getClickLine(element)
            /*
            TO-REVIEW: Klaus
            if (line.action && line.databinding) {
                Logger.log(-4, 'Event.onClick() > exit because databinding line')
                this.stopEvent(e)
                return
            }*/
            if (line) {
                this.executeLine(line, value, element)
                this.stopEvent(e)
            }
        }

        if (element.action) {
            if (element.action.type === 'back') {
                Logger.log(1, 'Event.onClick() > Go back')
                this.stopEvent(e)
                if (this.overlayScreenIds.length > 0) {
                    this.removeLastOverlay()
                } else {
                    this.$router.go(-1)
                }
                return
            }
        }
        this.dispatchCallback(element, e, 'click', value)
        this.$emit('qClick', this.getBaseEvent(element, e))
    },
    onStream (element, e, value) {
        Logger.log(-44, 'Event.onStream() > enter', element, value)
        if (Logger.logLevel > 10) {
            Logger.log(10, 'Event.onStream()', e.media)
        }
        if (element.lines) {
            const line = Util.getClickLine(element)
    
            if (line) {
                this.executeLine(line, e.media, element)
                this.stopEvent(e.event)
            }
        }
    },
    stopEvent (e) {
        if (e) {
            e.stopPropagation()
        }
    },

    executeLine(line, value, element) {
        Logger.log(4, 'Event.executeLine() > enter', line, value)

        if (line) {
            this.onLoadingStart()
            if (line && line.validation) {
                this.validateAllWidgets()
                if (Object.values(this.validationErrors).length > 0) {
                    Logger.log(-1, 'Event.executeLine() > exit because of validation errors', line, value)
                    return
                }                
            }
            const box = Util.getBoxById(line.to, this.model)
            if (box.type === 'Screen') {
                this.navigateToScreen(box, line, value, element)
                return
            } else if (box.type === 'Rest') {
                this.executeRest(box, line)
                return
            } else if (box.type === 'AIRest') {
                this.executeAIRest(box, line, value)
                return
            } else if (box.type === 'FTP') {
                this.executeFTP(box, line)
                return
            } else if (box.type === 'LogicOr') {
                this.executeLogic(box, line, "or")
                return
            } else if (box.type === 'LogicAnd') {
                this.executeLogic(box, line, "and")
                return
            } else if (box.type === 'Script') {
                this.executeScript(box, line)
                return
            }  else if (box.type === 'PromptBuilder') {
                this.executePromptBuilder(box, line)
                return
            } else if (box.type === 'OpenAIAssistant') {
                this.executeOpenAIAssistant(box, line)
                return
            }  else if (box.type === 'API') {
                this.executeAPI(box, line)
                return
            } else if (box.type === 'DocToText') {
                this.executeDocParser(box, line)
                return
            } else if (box.type === 'TextToDoc') {
                this.executeDocParser(box, line)
                return
            } else if (box.type === 'LocalStorage') {
                this.executeLocalStorage(box, line)
                return
            } else if (box.type === 'Download') {
                this.executeDownload(box, line)
                return
            } else if (box.type === 'CopyClipboard') {
                this.executeCopyClipboard(box, line)
                return
            } else {
                if (!line.isComponentLine) {
                    Logger.warn('Event.executeLine() > Not supported line target', box)
                }
                this.onLoadingEnd()
            }
        } else {
            Logger.error('Event.executeLine() > ERROR. Null passed', line)
        }
    },

    dispatchScreenAnimation (scrn) {
     
        // sometimes this is not the tree model!!
        if (!scrn.lines) {
            const found = this.treeModel.screens.find(s => s.id === scrn.id)
            if (found) {
                scrn = found
            }     
        }

        if (scrn.lines) {  
            const line = Util.getLineByType(scrn, 'timer')
            if (line) {
                Logger.log(-1, 'Event.dispatchScreenAnimation() > move to > ', line)
                setTimeout(() => {
                    this.executeLine(line)
                }, line.timer * 1000)
            }
            const loadedLine = Util.getLineByType(scrn, 'loaded')
            if (loadedLine) {
                Logger.log(-1, 'Event.dispatchScreenAnimation() > Loaded line > ', loadedLine)            
                this.executeLine(loadedLine)             
            }
        } 
    },

    async dispatchCallback (element, e, type, value) {
        Logger.log(4, 'Event.dispatchCallback() > enter > ' + type, element,)
        if (element.props && element.props.callbacks) {
            const callback = element.props.callbacks[type]
            if (callback) {
                Logger.log(2, 'Event.dispatchCallback() > callback > ' + type, callback)

                if (this.actionEngine && this.actionEngine.hasAction(callback)) {
                    Logger.log(-1, 'Event.dispatchCallback() > action engine: ', callback)
                    let result = await this.actionEngine.executeAction(this.app, callback, this.modelValue)
                    this.handleCallbackResult(result, callback)
                    return
                }

                let executor = this.getMethodExcutor()
                if (executor) {
                    if (executor[callback]) {
                        let func = executor[callback]
                        if (func instanceof Function) {
                            this.stopEvent(e)
                            /**
                             * This is crucial. we need to keep this signature the same.
                             */
                            let result = await func({
                                value: value,
                                element: element,
                                viewModel: this.modelValue,
                                luisa: this,
                                event: e
                            })

                            this.handleCallbackResult(result, callback)
                            return;
                        } else {
                            console.warn('Event.dispatchCallback() > Callback is not method ', callback)
                        }
                    } else {
                        console.warn('Event.dispatchCallback() > no method in $parent with name ', callback)
                    }
                }
            }
        }
    },

    handleCallbackResult (result, callback) {
         /**
         * Since 0.4 we check if we can dispatch the result to a screen.
         */
        if (result) {
            Logger.log(-1, 'Event.handleCallbackResult() > callback > ' + callback, result)
            let nextScreen = Object.values(this.model.screens).find(s => s.name === result)
            if (nextScreen) {
                this.setScreen(result)
                this.scrollToTop()
            } else {
                Logger.warn('Event.handleCallbackResult() > no screen with name > ' + result)
            }
        }
    },

    navigateToScreen (screen, line, value, element) {
        if (screen.style && screen.style.overlay === true) {
            Logger.log(1, 'Event.navigateToScreen() > Overlay', screen.name)
            this.overlayScreenIds.push(screen.id)
            this.onOverlayLoaded(screen)
        } else {
            Logger.log(1, 'Event.navigateToScreen() > Link', screen.name)
            this.overlayScreenIds = []
            this.setScreen(screen.name, this.getValueQuery(value, element))
            if (!line || line.scroll !== true) {
                this.scrollToTop()
            } else {
                Logger.log(1, 'Event.navigateToScreen() > Do not scroll')
                this.ignoreNextScroll = true
            }
        }
    },

    showMakeBridgeDialog(url) {
        const currentScreen = document.querySelector(this.currentScreen.cssSelector);

        if (!currentScreen) {
            console.error("Current screen not found!");
            return;
        }

        const dialogElement = document.createElement("div");
        currentScreen.appendChild(dialogElement);

        // Create and mount the app instance
        const dialogApp = createApp(MakeBridgeDialog, {
            url,
            onClose() {
            // Unmount and remove the dialog when the close event is emitted
            dialogApp.unmount();
            dialogElement.remove();
            },
        });

        dialogApp.mount(dialogElement);
    },


    getValueQuery (value, element) {
        /**
         * We have here the magic *id* property that can come from a repeater!,
         * but we might not have a repeater element in here, so we must go up...
         */
        if (!value) {
            return
        }
        let i = 0
        while (i < 10 &&  element.parent && !element?.props?.databinding?.id) {
            i++
            if (element.parent) {
                element = element.parent
            }

        }
        let idAttribute = 'id'
        if (element && element?.props?.databinding?.id) {
            idAttribute = element?.props?.databinding?.id
        }
        Logger.log(-4, `Event.getValueQuery() > use "${idAttribute}""`, value)
        const idValue = JSONPath.get(value, idAttribute)
        if (idValue) {
            return `id=${idValue}`
        }
    },

    scrollToTop () {
        Logger.log(2, 'Event.scrollToTop()', this.mergedConfig.scrollToTopAfterNavigation)
        if (this.ignoreNextScroll) {
            Logger.log(-1, 'Event.scrollToTop() > ignore')
            delete this.ignoreNextScroll
            return
        }
        if (this.mergedConfig.scrollToTopAfterNavigation) {
            window.scrollTo(0, 0)
        }
        this.$emit('qScrollTop', {
            screen: this.currentScreen
        })
    },

    popOverlay (e) {
        /**
         * Only pop of the screen background was hit.
         */
        if (this.$refs.overlayCntr && e && e.target === this.$refs.overlayCntr.$el) {
            Logger.log(4, 'Event).popOverlay()')
            this.removeLastOverlay()
        }
    },

    removeLastOverlay () {
        Logger.log(4, 'Event).removeLastOverlay()')
        if (this.overlayScreenIds.length > 0) {
            this.overlayScreenIds.pop()
        }
    },

    closeAllOverlays () {
        Logger.log(4, 'Event).closeAllOverlays()')
        this.overlayScreenIds = []
    },

    onChange (element, e, value) {
        Logger.log(2, 'Event.onChange() > ', value)
        this.$emit('qChange', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'change', value)
        if (element.lines) {
            let line = Util.getLineByType(element, 'InputChange')
            if (line) {
                this.executeLine(line, value)
                this.stopEvent(e)
            }
        }
    },

    onKeyPress (element, e, value) {
        Logger.log(2, 'Event).onKeyPress() > ', e.keyCode, value)
        this.$emit('qKeyPress', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'change', value)
        if (e.keyCode === 13) {
            this.onEnter(element, e, value)
        }
    },

    onFocus (element, e, value) {
        this.$emit('qFocus', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'focus', value)
    },

    onBlur (element, e, value) {
        this.$emit('qBlur', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'blur', value)
    },

    onMouseOver (element, e) {
        this.$emit('qMouseOver', this.getBaseEvent(element, e))
    },

    onMouseOut (element, e) {
        this.$emit('qMouseOut', this.getBaseEvent(element, e))
    },

    setSystemVariable (key, value) {
        JSONPath.set(this.modelValue, '_qux.' + key, value)
    },

    getBaseEvent (element, e) {
        return {
            element: element,
            event:e,
            screen: this.currentScreen,
            viewModel: this.modelValue,
            luisa: this
        }
    }
  }
}
</script>
