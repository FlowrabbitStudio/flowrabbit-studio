<template>
    <div class="qux">
    </div>
</template>
<script>
import Logger from '../core/Logger'
import AirtabelEngine from '../api/AirtabelEngine'
import RowsEngine from '../api/RowsEngine'
import WebHookEngine from '../api/WebHookEngine'
import XanoEngine from '../api/XanoEngine'
import MakeWebHookEngine from '../api/MakeWebHookEngine'
import IonosDocsEngine from '../api/IonosDocsEngine'
import MakeBridgeEngine from '../api/MakeBridgeEngine'
import JsonParserEngine from '../api/JsonParserEngine'

const apiEngines = {
    'airtable': AirtabelEngine,
    'rows': RowsEngine,
    'webhook': WebHookEngine,
    'xano': XanoEngine,
    'make': MakeWebHookEngine,
    'ionosDocs': IonosDocsEngine,
    'make-bridge': MakeBridgeEngine,
    'json': JsonParserEngine
}

export default {
    name: 'Logic',
    methods: {

        async initLoadAPI() {
            Logger.log(2, "Logic.initLoadAPI()", "enter");

            if (this.doNotExecuteScripts) {
                Logger.log(2, "Logic.initLoadAPI()", "do not run");
                return
            }
            const widgets = this.getLoadAPIs()
            for (let i = 0; i < widgets.length; i++) {
                const widget = widgets[i]
                this.executeAPI(widget)
            }
            Logger.log(2, "Logic.initLoadRest() > exit", this.dataBindingValues);
        },

        getLoadAPIs() {
            return Object
                .values(this.model.widgets)
                .filter(w => w.type === 'API' && w.props.trigger === 'load')
        },

        async initRepeatAPI() {
            Logger.log(2, "Logic.initRepeatAPI", "enter");

            if (this.doNotExecuteScripts) {
                Logger.log(2, "Logic.initRepeatAPI", "exit > Do not run");
                return
            }
            this._repeatRestIntervals = []
            const widgets = this.getRepeatAPIs()
            for (let i = 0; i < widgets.length; i++) {
                const widget = widgets[i]
                const id = setInterval(() => {
                    this.executeAPI(widget)
                }, widget.props.delay * 1000)
                this._repeatRestIntervals.push(id)
            }
            Logger.log(2, "Logic.initRepeatAPI", "exit", this.dataBindingValues);

        },


        getRepeatAPIs() {
            return Object
                .values(this.model.widgets)
                .filter(w => w.type === 'API' && w.props.trigger === 'repeat')
        },


        async executeAPI(widget, line) {
            Logger.log(1, 'Luisa(API).executeAPI() > enter', widget, line)
            try {
                const type = widget.props.type
                if (apiEngines[type]) {
                    const engine = new apiEngines[type](this.mergedConfig)
                    const result = await engine.run(
                        this.model.id,
                        this.hash,
                        widget,
                        this.modelValue,
                        this
                    )

                    this.$emit('qViewModelChange', this.modelValue)
                    Logger.log(-11, 'Luisa(API).executeAPI() > exit', result)
                    this.executeOutGoingLines(widget, true)

                    return true
                } else {
                    Logger.error('Luisa(API).executeAPI() > No api of type: ' + type)
                }
            } catch (e) {
                console.error(e)
                Logger.error("Luisa(API).executeAPI", "error", e);
            }
            return false
        }

    }



}
</script>