
<template>
    <div :class="['MatcToolbarAPISettings MatcDialogContainer MatcDialogFlexContainer', {'MatcDialogWithTest': hasTest}]">
        <div class="MatcDialogContent">
            <div class="MatcDialogContentHeader">
                <label>{{ title }} </label>
            </div>



            <div class="MatcDialogContentMain">
                <component 
                    ref="settings"
                    :is="wizardComponent" 
                    :api="api" 
                    :databinding="databinding" 
                    :secretKeys="secretKeys" 
                    :variableAndSecretHints="variableAndSecretHints"
                    :variableHints="variableHints"
                    :hints="hints"
                    :secretHints="secretHints"
                    :app="model" 
                    :schema="schema"
                    :hash="hash"
                    @success="showSuccessMessage"
                    @change="setAPIAndDatabinding"/>
            </div>


            <div class="MatcButtonBarDialog">
                <div class="MatcButtonBarDialogMessage">
                    <div class="MatcSuccess" v-if="successMessage">
                        {{successMessage}}
                    </div>
                </div>
                <div class="MatcLinkButtonDialog" @click="onCancel">Cancel</div>
                <div class="MatcButtonDialog" @click="onSave">Save</div>

            
            </div>

        </div>
        <div v-if="hasTest" class="MatcDialogTest">
            <div class="MatcDialogTestHeader">
                <label class="MatcDialogTestHeaderLabel">Test</label>
                <a class="MatcDialogTestButton" @click="run">Run Test</a>
            </div>
            <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <div>
                    <a @click="testtab = 'params'" :class="{ 'MatcToolbarTabActive': testtab === 'params' }">Test Parameters</a>
                    <a @click="testtab = 'result'" :class="{ 'MatcToolbarTabActive': testtab === 'result' }" style="margin-left:20px;">Results</a>
                </div>                
            </div>
            <div v-show="testtab === 'params'">
                    <template v-if="api && api.input">
                        <div class="MatcMarginTop">
                            <div class="MatcToolbarRestDataBindingRow" v-for="(input) in api.input" :key="input.id">                              
                          
                                <span class="MatcToolbarRestDataBindingRowLabel">{{ input.label }}</span>
                                <input :value="getTestData(input)" class="form-control" @keyup="setTestData(input, $event)" v-if="input.type === 'number'" type="number"/>
                                <div v-if="input.widget === 'TextArea'">
                                    <TextArea 
                                        class="form-control"
                                        style="height: 128px; width: 220px;"
                                        :value="getTestData(input)"                                
                                        @change="setTestData(input, $event)" 
                                      >
                                    </TextArea>
                                </div>
                                <input v-else :value="getTestData(input)" class="form-control" @keyup="setTestData(input, $event)" />
                            </div>                        
                            
                        </div>
                    </template>
                </div>
                <div v-show="testtab === 'result'" class="MatcDialogTestResults">
                   <div v-show="testError && testError.length > 0" class="MatcMarginTop MatcError">
                        {{ testError }}
                    </div>
                    <div v-if="isTestRunning">
                        <span class="MatcHint">{{getNLS('common.loading')}}</span>
                    </div>
                    <div v-if="testResult">
                        <JSONVisualizer :jsonData='testResult' :init="true"></JSONVisualizer>
                    </div>
                 
                </div>
        </div>


    </div>
</template>
<style lang="scss">
  @import "../../../style/components/dialog.scss";
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import lang from 'dojo/_base/lang'
import Logger from 'common/Logger'
import SegmentButton from 'page/SegmentButton'
import DropDownButton from 'page/DropDownButton'
import Input from 'common/Input'
import RestUtil from '../../../core/RestUtil'
import AutoCompleteTextarea from 'page/AutoCompleteTextarea'
import _Tooltip from "common/_Tooltip";
import JSONVisualizer from '../components/JSONVisualizer'
import * as SchemaUtil from '../../../core/SchemaUtil'

import AirtableSettings from './AirtableSettings'
import RowsSettings from './RowsSettings'
import WebhookSettings from './WebhookSettings'
import MakeSettings from './MakeSettings'
import XanoSettings from './XanoSettings.vue'
import IONOSDocsSettings from  './IONOSDocsSettings.vue'
import MakeBridgeSettings from  './MakeBridgeSettings.vue'
import JsonParser from './JsonParser.vue'

export default {
    name: 'APISettings',
    mixins: [DojoWidget, Util, _Tooltip],
    props: ["app", "value"],
    data: function () {
        return {
            wizardComponent: '',
            tab: "data",
            testtab: "params",
            hasOutputPath: true,
            secretKeys: [],
            hasFileUpload: false,
            checkBoxChecked: false,
            model: {
                widgets: {}
            },
            template: {},
            widget: null,
            databingValues: {},
            testResult: '',
            testError: '',
            runSuccess: false,
            isDirty: false,
            uploadedFile: null,
            hasTest: true,
            api: {},
            databinding: {},
            testdata: {},
            hash: '',
            schema: null,
            isTestRunning: false,
            successMessage: '',
            titles:{
                'ionosDocs': 'Ionos Documents',
                'make-bridge': "Make Bridge"
            }
        }
    },
    components: {
        'airtable': AirtableSettings,
        'rows': RowsSettings,
        'webhook': WebhookSettings,
        'make': MakeSettings,
        'make-bridge': MakeBridgeSettings,
        'xano': XanoSettings,
        'SegmentButton': SegmentButton,
        'DropDownButton': DropDownButton,
        'Combo': Input,
        'AutoCompleteTextarea': AutoCompleteTextarea,
        'JSONVisualizer':JSONVisualizer,
        'ionosDocs': IONOSDocsSettings,
        'json': JsonParser
        //'FileButton': FileButton,
        //'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor')
    },
    computed: {
        title () {
            if (this.widget) {
                let lbl = this.widget.props.type
                if (this.titles[lbl]) {
                    return this.titles[lbl]
                }
                return lbl.charAt(0).toUpperCase() + lbl.slice(1);
            }
            return 'Config'
        },
        buttons() {
            return this.$attrs.buttons;
        },
        dataBindingKeys() {
            return []
        },
        variableAndSecretHintsList () {
            return this.variableAndSecretHints.map(i => i.value)
        },
        variableAndSecretHints() {
            const hints = this.getAllAppVariables()
            const result = hints.map(h => {
                const v = "${" + h + "}"
                return {
                    label: v,
                    value: v
                }
            })
            if (this.secretKeys){
                this.secretKeys.forEach(e => {
                    const v = "${secrets." + e.key + "}"
                    result.push({
                        label: v,
                        value: v
                    })
                })
            }
            return result
        },
        secretHints() {
            const result = []
            if (this.secretKeys) {
                this.secretKeys.forEach(e => {
                    const v = "${secrets." + e.key + "}"
                    result.push({
                        label: e.key,
                        value: v,
                        icon: 'mdi mdi-key'
                    })
                })
            }
            return result
        },
        variableHints() {
            const hints = this.getAllAppVariables()
            return hints.map(h => {
                const v = "${" + h + "}"
                return {
                    label: v,
                    value: v
                }
            })
        },
        hints() {
            let hints = this.getAllAppVariables()
            return hints.map(h => {
                return {
                    label: h,
                    value: h
                }
            })
        }
    },
    methods: {
        showSuccessMessage (m) {
            this.successMessage = m
            setTimeout(() => {
                this.successMessage = ''
            }, 4000)
        },
        onCancel () {
            this.emit('cancel')
        },
        onSave() {
            if (this.$refs.settings.isInputValid ) {
                const errors = this.$refs.settings.isInputValid()
                if (errors.length) {
                    return
                }
            }
            this.emit('save')
        },
        selectTab(tabname) {
            this.tab = tabname;
        },
        setAPIAndDatabinding (api, databinding) {
            this.logger.log(2, 'setAPI', 'enter', api, databinding)
            this.api = api
            this.databinding = databinding
            this.initTestData()
        },
        setSecretKeys(s) {
            this.secretKeys = s
        },       
        onDataBingingFileChange(key, file) {
            this.$set(this.databingValues, key, file)
        },

        setWidget(w) {
            this.logger.log(3, 'setWidget', 'enter')
            if (w.props && w.props.api) {
                this.api = lang.clone(w.props.api)
                this.initTestData()
            }
            if (w.props && w.props.databinding) {
                this.databinding = lang.clone(w.props.databinding)
            }
            this.widget = w
            this.wizardComponent = w.props.type
        },

        setModel(m) {
            this.model = m;
        },
        setSchema (schema) {
            this.schema = schema
        },
        setHash(h) {
            this.hash = h
        },
        getValue() {
            return this.api
        },
        getDataBinding() {
            return this.databinding
        },
 
        hasRun() {
            if (this.isDirty) {
                if (!this.runSuccess) {
                    this.testError = 'Please test before saving!'
                }
                return this.runSuccess
            }
            return true
        },  
        initTestData() {
            if (this.api.input) {
                this.api.input.forEach(i => {
                    if (i.value) {
                        this.testdata[i.id] = i.value
                    }
                })
            }
        },
        getTestData (input) {
            if (input.value) {
                return input.value
            }
            return ""
        },
        setTestData (input, event) {
            let value = event
            if (event.target) {
                value = event.target.value
            }
            value = SchemaUtil.convertDefaultValue(value)
            this.testdata[input.id] = value      
        },
        stripTemplateNotation() {

        },
        async run() {
            this.testResult = ''
            this.testError = ''
            this.testtab = 'result'
            if (this.$refs.settings.isValidToRun && !this.$refs.settings.isValidToRun(this.testdata)) {
                this.testError = "Please configure the service correct"
                return
            }
            // delegate to settings
            this.isTestRunning = true
            const result = await this.$refs.settings.run(this.testdata)
            this.isTestRunning = false

            if (!result || !result.data) {
                this.testError = 'Something went wrong'
                return
            }
            if (result.error) {
                this.testError = result.error
                return
            }

            if (result.data) {
                this.buildHints(result.data)
            }
              
            this.testResult = result.data
        },

        buildHints (object) {
            if (!this.api.output) {
                this.api.output = {}
            }
            let prefix = this.databinding.default
            this.api.output.hints =  RestUtil.buildHints(prefix, object)
        }
    },
    watch: {
        value(v) {
            this.setWidget(v)
        }
    },
    mounted() {
        this.logger = new Logger("APISettings")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
        if (this.$refs.tooltipOutputVarIcon) {
            this.addTooltip(this.$refs.tooltipOutputVarIcon, 'The variable to store the result')
        }
        if (this.$refs.tooltipOutputPathIcon) {
            this.addTooltip(this.$refs.tooltipOutputPathIcon, 'The path of the result to store in the variable')
        }
    }
}
</script>