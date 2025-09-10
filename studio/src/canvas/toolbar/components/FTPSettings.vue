
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
                </div>
            </div>
            <div class="MatcMarginTopXS">
                <div v-show="tab === 'data'" class="MatcToolbarRestSettingsElementCntr">
                        <div class="form-group">
                            <div class="MatcFlex MatcGapM MatcMarginBottomXS">
                                 <div class="MatcFlex50">
                                    <label>FTP Host</label>
                                    <input type="text" class="MatcIgnoreOnKeyPress form-control" v-model="config.input.ftpHost" placeholder="ftp.example.com" @change="onChangeHost"/>
                                </div>
                                 <div class="MatcFlex50">
                                    <label>FTP Folder</label>
                                    <input type="text" class="MatcIgnoreOnKeyPress form-control" v-model="config.input.ftpFolder" placeholder="home/foldername" @change="onChangeFolder"/>
                                </div>
                            </div>
                            <div class="MatcMarginTop">
                                <label>FTP User</label>
                                <input type="text" class="MatcIgnoreOnKeyPress form-control" v-model="config.input.ftpUser" placeholder="ftpuser" @change="onChangeUsername"/>
                            </div>
                            <div class="MatcMarginTop">
                                <label>FTP Password</label>
                                <Combo :value="config.input.ftpPassword" @change="setFtpPass" :hints="variableAndSecretHints" :fireOnBlur="true"
                                    :formControl="true" :isDropDown="true" placeholder="Use secrets like ${secrets.ftpPassword}" />
                            </div>
                            <div class="MatcMarginTop">
                                <label>File to Upload
                                    <span class="MatcToolbarItemIcon" ref="modelTooltip">
                                        <span class="mdi mdi-help-circle-outline"></span>
                                    </span>
                                </label>
                                <Combo :value="config.input.fileDataBinding" @change="onChangeInputVar" :hints="hints" :fireOnBlur="true"
                                    :formControl="true" :isDropDown="true" placeholder="Name of input variable" />
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
                        <Combo :value="config.output.databinding" @change="onChangeOutputVar" :hints="hints" :fireOnBlur="true"
                            :formControl="true" :isDropDown="true" placeholder="Name of output variable" />
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
                                <template>
                                    <FileButton class="MatcToolbarRestDataBindingFile"
                                        @change="onFileChange" label="Select a file" />
                                </template>
                            </div>                    
                            <div class="ParamsDataBindingContent" v-if="dataBindingKeys.length == 0 && config.input.type === 'JSON'">
                                You are not using variables. No need to specify any data.
                            </div>
                        </div>
                    </div>
                    <div v-show="testtab === 'result'">
                        <div v-show="loadingResult" class="spinner-container">
                            <div class="spinner"></div>
                        </div>
                        <div v-show="testError && testError.length > 0" class="MatcMarginTop MatcError">
                            {{ testError }}
                        </div>  
                        <pre  v-show="testError && testError.length > 0"
                            :class="['MatcToolbarRestDataBindingCntr MatcMarginBottom', { 'MatcError': testError }]">{{ testResult }}</pre>
                        <div v-if="testResult">
                            <div class="MatcToolbarRestDataBindingCntr" >
                                <span>{{testResult}}</span>
                            </div> 
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
import Input from 'common/Input'
import JSONPath from '../../../core/JSONPath'
import _Tooltip from "common/_Tooltip";
import FileButton from 'common/FileButton'
import FTPEngine from 'core/FTPEngine'
import RestUtil from '../../../core/RestUtil'

export default {
    name: 'FTPSettings',
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
            config: {
                host: "",
                user: "",
                password: "",
                input: {
                    fileDataBinding: "",
                    ftpHost: '',
                    ftpUser: '',
                    ftpPassword: ''
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
            hasTest: true,
            loadingResult: false
        }
    },
    components: {
        'Combo': Input,
        'FileButton': FileButton
    },
    computed: {
        formattedOutput() {
            return this.formatOutput(this.testResult);
        },
        buttons() {
            return this.$attrs.buttons;
        },
        dataBindingKeys() {
            let values = {}
            if (this.config.input.fileDataBinding) {
                values[this.config.input.fileDataBinding] = "";
            }
            return values
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
        },
        modelsList() {
            if (this.template.models) {
                const list =  this.template.models.map((m) => {                    
                    return { value: m.id, label: m.name }
                })
                return list; 
            }
            return undefined
        }
    },
    methods: {
        onChangeHost(v) {
            this.config.input.ftpHost = v
        },
        onChangeFolder(v) {
            this.config.input.ftpFolder = v
        },
        onChangeUsername(v) {
            this.config.input.ftpUser = v
        },
        setFtpPass(t) {
            this.logger.log(-1, 'setFtpPass', 'enter' + t)
            this.config.input.ftpPassword = t            
        },
        selectTab(tabname) {
            this.tab = tabname;
        },
        setSecretKeys(s) {
            this.logger.log(-1, 'setSecretKeys', 'enter', s)
            this.secretKeys = s
        },       
        onDataBingingFileChange(key, file) {
            this.$set(this.databingValues, key, file)
        },
        onFileChange(file) {
            this.uploadedFile = file
            this.databingValues = {}
            this.databingValues[this.config.input.fileDataBinding] = file
        },
        arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = [].slice.call(new Uint8Array(buffer));
            bytes.forEach((b) => binary += String.fromCharCode(b));
            return window.btoa(binary);
        },
        setWidget(w) {
            this.logger.log(-4, 'setWidget', 'enter')
            this.widget = w
            if (w.props && w.props.config) {
                this.config = lang.clone(w.props.config)                
                if (!this.config.output.databinding) {
                    this.logger.log(-1, 'setWidget', 'Set name as output')
                    this.config.output.databinding = this.widget.name
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
            return this.config
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
            this.$set(this.config.input, 'fileDataBinding', value)
            this.onChange()
        },
        onChangeOutputVar(value) {
            this.config.output.databinding = value
            this.onChange()
        },
        onChangeInputVar(value) {
            this.config.input.fileDataBinding = value
            this.onChange()
        },
        onChangeOutputPath(value) {
            this.config.output.path = value
            this.onChange()
        },
        onChange() {
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
            let prefix = this.config.output.databinding

            if (!prefix) {
                // this.testResult ='The output databinding is empty'
                this.testError = `The output data binding is empty`
                this.tab = 'output'
                return false
            }
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
            let prefix = this.config.output.databinding
            this.rest.output.hints = RestUtil.buildHints(prefix, object)
            /**
             * FIXME: call here onChange will fuckup the config.vars...
             */
            this.$emit('change', this.getValue(), this.template)
        },
        async run() {
            this.testResult = undefined;
            this.testError = ''
            this.testtab = 'result'
            this.loadingResult = true
            if (!this.validate()) {
                this.loadingResult = false;
                return;
            }
            try {
                this.testResult = await FTPEngine.runUploadFile(this.config, this.databingValues, this.hash, this.model.id)   
                if (this.aiModel.output.path) {
                    this.testResult = JSONPath.get(this.testResult, this.aiModel.output.path)
                    console.log(this.testResult)
                }
                if (this.aiModel.output.type === 'JSON') {
                    try { 
                        this.buildHints(this.testResult)
                        //this.testResult = JSON.stringify(this.testResult, null, 2)  
                        } catch (e) {
                        this.runSuccess = false
                        this.testError = 'The result is not json'
                    }
                }
            } catch (e) {
                this.runSuccess = false
                this.testResult = 'Error: ' + e.message
                this.testError = 'Something went wrong. Is the url ok? Are all databings set? Is the out type correct? '
            } finally {
                this.loadingResult = false;
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
        this.logger = new Logger("FTP")
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