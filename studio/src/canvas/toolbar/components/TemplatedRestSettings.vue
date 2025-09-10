
<template>
    <div class="MatcToolbarRestSettings MatcToolbarTemplateRestSettings MatcDialogContainer">
        <div class="MatcDialogContent">
            <div class="MatcDialogContentHeader">
                <label>{{ title }}</label>
            </div>
            <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <div>
                    <a @click="selectTab('data')" :class="{ 'MatcToolbarTabActive': tab === 'data' }">Input</a>
                    <a @click="selectTab('output')" :class="{ 'MatcToolbarTabActive': tab === 'output' }">Output</a>
                    <a @click="selectTab('auth')" :class="{ 'MatcToolbarTabActive': tab === 'auth' }" v-if="!wizardComponent">
                        Authorization
                    </a>
                    <a @click="selectTab('wizard')" :class="{ 'MatcToolbarTabActive': tab === 'wizard' }" v-if="wizardComponent">
                        Setup
                    </a>
                </div>
            </div>
            <div class="MatcMarginTopXS">
            <div v-show="tab === 'wizard'" class="MatcToolbarRestSettingsElementCntr">
                <component :is="wizardComponent" :rest="rest" :secretKeys="secretKeys" :app="model" @change="setTemplate"/>
            </div>

            <div v-show="tab === 'auth'" class="MatcToolbarRestSettingsElementCntr">
                <div class="form-group">
                    <label>Auth Token</label>
                    <Combo :value="rest.token" @change="setRestToken" :hints="variableAndSecretHints" :fireOnBlur="true"
                        :formControl="true" :isDropDown="true" placeholder="Use secrets like ${secrets.apiToken}" />
                </div>
            </div>


            <div v-show="tab === 'data'" class="MatcToolbarRestSettingsElementCntr">

                <div v-for="e in template.elements" :key="e.id">
                    <div class="form-group">
                        <label>{{ e.label }} 
                            <span class="MatcToolbarItemIcon" :data-id="getDataID(e.id)">
                                <span class="mdi mdi-help-circle"></span>
                            </span>
                        </label>
                        

                        <AutoCompleteTextarea v-if="e.type === 'TextArea'" :options="variableAndSecretHintsList" :value="e.value" :placeholder="e.placeholder" class="MatcAutoCompleteTextareaXS"
                            @change="onTemplateElementChange(e, $event)">
                        </AutoCompleteTextarea>

                        <input v-if="e.type === 'Input'" :value="e.value" :placeholder="e.placeholder" class="MatcIgnoreOnKeyPress form-control"
                            @change="onTemplateElementChange(e, $event)" />

                        <Combo v-if="e.type === 'Combo'" :value="e.value" @change="onTemplateElementChange(e, $event)"
                            :hints="variableAndSecretHints" :fireOnBlur="true" :formControl="true" :isDropDown="true"
                            :placeholder="e.placeholder" />

                        <DropDownButton v-if="e.type === 'DropDown'" :value="e.value" :options="e.options"
                            @change="onTemplateElementChange(e, $event)" :formControl="true" :placeholder="e.placeholder" />

                        <div v-if="e.type === 'SegmentButton'" class="MatcSegmentButtonInline">
                            <SegmentButton :value="e.value" @change="onTemplateElementChange(e, $event)"
                                :options="e.options" />
                        </div>

                        <div v-if="e.type === 'Label'" >
                            {{e.value}}
                        </div>

                    </div>
                </div>
            </div>

            <div v-show="tab === 'output'">

                <div class="form-group">
                    <label>Output Variable
                        <span class="MatcToolbarItemIcon" ref="tooltipOutputVarIcon">
                            <span class="mdi mdi-help-circle"></span>
                        </span>
                    </label>
                    <Combo :value="rest.output.databinding" @change="onChangeOutputVar" :hints="hints" :fireOnBlur="true"
                        :formControl="true" :isDropDown="true" placeholder="Name of output variable" />
                </div>

                <div class="form-group" v-if="hasOutputPath">
                    <label>Output Path
                        <span class="MatcToolbarItemIcon" ref="tooltipOutputPathIcon">
                            <span class="mdi mdi-help-circle"></span>
                        </span>
                    </label>
                    <Combo :value="rest.output.path" :hints="hints" @change="onChangeOutputPath" :fireEmpty="true" :fireOnBlur="true"
                        :formControl="true" :isDropDown="true" placeholder="Specify path to extract" />
                </div>

              
            </div>
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
                    <div class="MatcMarginTop">
                        <div class="MatcToolbarRestDataBindingRow" v-for="(key) in dataBindingKeys" :key="key">
                            <span class="MatcToolbarRestDataBindingRowLabel">{{ key }}</span>
                            <input v-model="databingValues[key]" class="form-control" ref="dbInputs"
                                v-if="rest.input.type === 'JSON' || rest.input.type === 'FORM'" />

                            <template v-if="hasFileUpload">
                                <FileButton v-if="rest.input.type === 'JSON' || rest.input.type === 'FORM'"
                                    class="MatcToolbarRestDataBindingIcon" @change="onDataBingingFileChange(key, $event)"
                                    icon="mdi mdi-cloud-upload" />

                                <FileButton v-if="rest.input.type === 'FILE'" class="MatcToolbarRestDataBindingFile"
                                    @change="onFileChange" label="Select a file" />

                            </template>
                        </div>                        
                        <div class="ParamsDataBindingContent" v-if="dataBindingKeys.length == 0 && rest.input.type === 'JSON'">
                            You are not using variables. No need to specify any data.
                        </div>
                    </div>
                </div>
                <div v-show="testtab === 'result'">
                    <div v-show="testError && testError.length > 0" class="MatcMarginTop MatcError">
                        {{ testError }}
                    </div>
                    <pre v-if="rest.output.type != 'IMAGE'"
                    :class="['MatcToolbarRestDataBindingCntr MatcMarginBottom', { 'MatcError': testError }]">{{ testResult }}</pre>
                    <div class="MatcToolbarRestDataBindingCntr" v-else>
                        <img :src="testResultImage">
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
import RestEngine from 'core/RestEngine'
import Logger from 'common/Logger'
import SegmentButton from 'page/SegmentButton'
import DropDownButton from 'page/DropDownButton'
import Input from 'common/Input'
import AirtableRestWizard from '../wizards/AirtableRestWizard'
import AutoCompleteTextarea from 'page/AutoCompleteTextarea'
//import FileButton from 'common/FileButton'
import JSONPath from '../../../core/JSONPath'
import _Tooltip from "common/_Tooltip";
import RestUtil from '../../../core/RestUtil'

export default {
    name: 'RestSettings',
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
            rest: {
                method: "GET",
                url: "",
                token: "",
                authType: 'Bearer',
                input: {
                    type: "JSON",
                    template: ''
                },
                output: {
                    databinding: '',
                    template: '',
                    type: 'JSON',
                    hints: {}
                },
                headers: []
            },
            databingValues: {},
            testResult: '',
            testError: '',
            runSuccess: false,
            isDirty: false,
            uploadedFile: null,
            title: "Open AI - GPT",
            hasTest: true
        }
    },
    components: {
        'AirtableRestWizard': AirtableRestWizard,
        'SegmentButton': SegmentButton,
        'DropDownButton': DropDownButton,
        'Combo': Input,
        'AutoCompleteTextarea': AutoCompleteTextarea
        //'FileButton': FileButton,
        //'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor')
    },
    computed: {
        buttons() {
            return this.$attrs.buttons;
        },
        dataBindingKeys() {
            let values = RestEngine.getNeededDataBings(this.rest)
            return values
        },
        testResultImage() {
            var base64Flag = 'data:image/jpeg;base64,';
            var imageStr = this.arrayBufferToBase64(this.testResult);
            return base64Flag + imageStr
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
        selectTab(tabname) {
            this.tab = tabname;
        },
        setTemplate (changes) {
            this.logger.log(-1, 'setTemplate', 'enter', changes)

            this.testError = ''

            this.rest.token = changes.token
            this.rest.method = changes.method
            this.template.rest.token = changes.token
            this.template.rest.method = changes.method

            this.rest.input.template = changes.rest.template
            this.rest.url = changes.rest.url

            this.template.rest.url = changes.template.url                 
            this.template.rest.input.template = changes.template.template
            this.template.rest.input.types = changes.types

            this.template.elements = changes.elements
            // we set also teh default values
            this.template.elements.forEach(e => {
                if (e.value !== undefined && e.value !== null) {
                    this.rest.vars[e.id] = e.value
                }
            })
            this.updateRest()
            this.$emit('change', this.getValue(), this.template)
            this.tab = 'data'     
            this.testtab = 'parmas'   
        },
        setSecretKeys(s) {
            this.logger.log(-1, 'setSecretKeys', 'enter', s)
            this.secretKeys = s
        },
        setRestToken(t) {
            this.logger.log(-1, 'setRestToken', 'enter' + t)
            this.rest.token = t          
            this.template.rest.token = t          
            this.$emit('change', this.getValue(), this.template)
        },
       
        onDataBingingFileChange(key, file) {
            this.$set(this.databingValues, key, file)
        },
        onFileChange(file) {
            this.uploadedFile = file
            this.databingValues = {}
            this.databingValues[this.rest.input.fileDataBinding] = file
        },
        arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = [].slice.call(new Uint8Array(buffer));
            bytes.forEach((b) => binary += String.fromCharCode(b));
            return window.btoa(binary);
        },
        updateTemplateValues() {
            this.logger.log(-4, 'updateTemplateValues', 'enter')
            if (this.template.elements) {
                // update the template values with the value from the real
                // rest call!
                this.template.elements.forEach(e => {
                    if (this.rest.vars[e.id]) {
                        e.value = this.rest.vars[e.id]
                    }   
                })
            }
            this.$nextTick(() => {
                this.template.elements.forEach((e) => {
                    const id = this.getDataID(e.id)
                    const selector = `[data-id=${id}]`;
                    const element = this.$el.querySelector(selector);
                    if (element && e.tooltip) {
                        this.addTooltip(element, e.tooltip)   
                    }             
                });
            });
        },
        getDataID(id) {
            return id.replace(/\./g, '_');
        },
        setWidget(w) {
            this.logger.log(-4, 'setWidget', 'enter')
            this.widget = w
            if (w.props && w.props.rest) {
                this.rest = lang.clone(w.props.rest)
                if (!this.rest.vars) {
                    this.rest.vars = {}
                }
                this.template = lang.clone(w.props.template)
                this.updateTemplateValues()
                this.initDataBindingFromtemplate()

                if (!this.rest.output.databinding) {
                    this.logger.log(-1, 'setWidget', 'Set name as output')
                    this.rest.output.databinding = this.widget.name
                }
                if (!this.rest.authType) {
                    this.logger.log(-1, 'setWidget', 'Set auth')
                    this.rest.authType = 'Bearer'
                }

                if (!this.rest.headers) {
                    this.logger.log(-1, 'setWidget', 'Set headers')
                    this.$set(this.rest, "headers", [])
                }
            }
            if (w?.props.wizard) {
                this.wizardComponent = w.props.wizard      
                if (!this.template?.rest?.input?.template) {
                    this.tab = "wizard"
                }
            }
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
            return this.rest
        },
        getTemplate() {
            return this.template
        },

        onTemplateElementChange(element, event) {
            const target = event.target
            if (target) {
                const value = target.value
                this.rest.vars[element.id] = value
                this.onChange()
            } else {
                this.rest.vars[element.id] = event
                this.onChange()
            }
        },

        updateRest() {
            this.logger.log(4, 'updateRest', 'enter')      
            let s = JSON.stringify(this.template.rest)
            for (let key in this.rest.vars) {
                const value = this.rest.vars[key]
                const pattern = "@{" + key + "}"
                s = this.replacePattern(s, pattern, value)
            }
            try {
                const vars = this.rest.vars
                const output = this.rest.output
                this.rest = JSON.parse(s)
                this.rest.vars = vars
                this.rest.output = output
            } catch (e) {
                this.logger.error('updateRest', 'Could not parse' + s, e)
            }
          
        },
        replacePattern(s, pattern, value) {
            let i = 0
            while (s.indexOf(pattern) >= 0 && i < 100) {
                s = s.replace(pattern, value)
                i++
            }
            return s
        },

        onChangeFileDataBinging(value) {
            this.$set(this.rest.input, 'fileDataBinding', value)
            this.onChange()
        },
        onChangeOutputVar(value) {
            this.rest.output.databinding = value
            this.onChange()
        },
        onChangeOutputPath(value) {
            this.rest.output.path = value
            this.onChange()
        },
        onChange() {
            this.updateTemplateValues()
            this.updateRest()
            this.initDataBindingFromtemplate()
            this.$nextTick(() => {
                this.isDirty = true
                this.$emit('change', this.getValue(), this.template)
            })
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
        validate() {
            let url = this.rest.url;
            let template = this.rest.input.template;
            let prefix = this.rest.output.databinding

            if (!prefix) {
                // this.testResult ='The output databinding is empty'
                this.testError = `The output data binding is empty`
                this.tab = 'output'
                return false
            }


            const values = this.getAllAppVariables()
            values.forEach(key => {
                url = this.replaceAll(url, key, '"v:' + key + '"')
                template = this.replaceAll(template, key, '"v:' + key + '"')
            })

            if (this.$refs.dbInputs) {
                let oneIsEmpty = false
                this.$refs.dbInputs.forEach(i => {
                    if (!i.value) {
                        oneIsEmpty = true
                    }
                })
                if (oneIsEmpty) {
                    this.testError = `Please provide some input data`
                    this.testtab = 'params'
                    return false
                }
            }

            if (this.rest.input.type === 'IMAGE') {
                if (!this.rest.input.fileDataBinding) {
                    this.testError = `Please  provide a input data binding`
                    this.tab = 'input'
                    return false
                }
                if (!this.uploadedFile) {
                    this.testError = `Please select a file`
                    this.testtab = 'params'
                    return false
                }
            }

            return true;
        },

        replaceAll(s, key, value) {
            let pattern = "${" + key + "}"
            let i = 0
            while (s.indexOf(pattern) >= 0 && i < 100) {
                s = s.replace(pattern, value)
                i++
            }
            return s
        },

        buildHints(object) {
            let prefix = this.rest.output.databinding
            this.rest.output.hints = RestUtil.buildHints(prefix, object)
            /**
             * FIXME: call here onChange will fuckup the rest.vars...
             */
            this.$emit('change', this.getValue(), this.template)
        },
        initDataBindingFromtemplate () {
            // console.debug(this.rest.vars)
            // for (let key in this.rest.vars){
            //     let value = this.rest.vars[key]
            //     if (!value.indexOf || value.indexOf('${') < 0 ) {
                   
            //         this.databingValues[ key] = value
            //     }
            // }
            // console.debug(this.databingValues)
        },
        async run() {
            this.testResult = ''
            this.testError = ''
            this.testtab = 'result'

            if (!this.validate()) {
                return;
            }
            try {
                this.testResult = await RestEngine.run(this.rest, this.databingValues, this.hash, this.model.id)
                if (this.rest.output.path) {
                    this.testResult = JSONPath.get(this.testResult, this.rest.output.path)
                }

                if (this.rest.output.type === 'JSON') {
                    this.buildHints(this.testResult)
                    try {
                        // make it pretty for the reader
                        this.testResult = JSON.stringify(this.testResult, null, 2)
                    } catch (e) {
                        this.runSuccess = false
                        this.testError = 'The result is not json'
                    }
                }
            } catch (e) {
                this.runSuccess = false
                this.testResult = 'Error: ' + e.message
                this.testError = 'Something went wrong. Is the url ok? Are all databings set? Is the out type correct? '
            }
        },
        editorInit() {
            require(/* webpackChunkName: "ace" */ 'brace/ext/language_tools') //language extension prerequsite...
            require(/* webpackChunkName: "ace" */ 'brace/mode/json')
            require(/* webpackChunkName: "ace" */ 'brace/theme/chrome')

            let editor = this.$refs.aceEditor.editor
            editor.setOptions({
                enableBasicAutocompletion: false,
                enableSnippets: false,
                enableLiveAutocompletion: true
            });

            let vars = this.getAllAppVariables()
            editor.completers.push({
                getCompletions(editor, session, pos, prefix, callback) {
                    if (prefix.indexOf('$') === 0) {
                        let result = vars.map(v => {
                            return { name: v, value: '${' + v + '}', score: 1, meta: "databinding" }
                        })
                        callback(null, result)
                    }
                }
            });
        }
    },
    watch: {
        value(v) {
            this.setWidget(v)
        }
    },
    mounted() {
        this.logger = new Logger("TemplatedRestSettings")
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