<template>
    <div class="MatcToolbarRestSettings MatcToolbarTemplateRestSettings MatcDialogContainer">
        <div class="MatcDialogContent">
            <div class="MatcDialogContentHeader">
                <label>Document To Text</label>
            </div>
            <div class="MatcMarginTopXS">
                <label>Document File Variable
                    <span class="MatcHelpIcon" ref="tooltipPromptIcon">
                        <span class="mdi mdi-help-circle" />
                    </span>
                </label>
                <div class="form-group">
                    <Combo :value="rest.input.fileDataBinding" @change="onChangeInputVar" :hints="hints" :fireOnBlur="true"
                                    :formControl="true" :isDropDown="true" placeholder="Name of input variable" />
                </div>
                <div class="form-group">
                    <label>Output Variable
                        <span class="MatcHelpIcon" ref="tooltipOutputVarIcon">
                            <span class="mdi mdi-help-circle" />
                        </span>
                    </label>
                    <Combo v-if="rest.output" :value="rest.output.databinding" @change="onChangeOutputVar" :hints="hints" :fireOnBlur="true"
                        :formControl="true" :isDropDown="true" placeholder="Name of output variable" />
                </div>
            </div>
        </div>
        <div class="MatcDialogTest">
                <div class="MatcDialogTestHeader">
                    <label class="MatcDialogTestHeaderLabel">Test</label>
                    <a class="MatcDialogTestButton" @click="run">Run Test</a>
                </div>
                <div class="MatcToolbarTabs MatcToolbarTabsBig">
                    <a @click="testtab = 'params'" :class="{ 'MatcToolbarTabActive': testtab === 'params' }">Test Parameters</a>
                    <a @click="testtab = 'result'" :class="{ 'MatcToolbarTabActive': testtab === 'result' }">Results</a>
                </div>
                <div v-show="testtab === 'params'" class="MatcMarginTop">
                    <div class="MatcToolbarRestDataBindingRow" v-for="(key) in dataBindingKeys" :key="key">
                        <FileButton :types="fileTypes" class="MatcToolbarRestDataBindingFile"
                                    @change="onFileChange" label="Select a file" />
                    </div>
                    <div class="ParamsDataBindingContent" v-if="dataBindingKeys.length == 0">
                        You are not using data bindings. No need to specify any data.
                    </div>
                </div>
                <div v-show="testtab === 'result'">
                    <div v-show="loadingResult" class="spinner-container">
                        <div class="spinner"></div>
                    </div>
                    <div v-show="testError && testError.length > 0" class="MatcMarginTop MatcError">
                        {{ testError }}
                    </div>
                    <pre v-show="testResult" :class="['MatcToolbarRestDataBindingCntr', { 'MatcError': testError }]">{{ testResult }}</pre>
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
import _Tooltip from "common/_Tooltip";
import DocEngine from 'core/DocEngine'
import FileButton from 'common/FileButton'
import RestUtil from '../../../core/RestUtil'

export default {
    name: 'DocToText',
    mixins: [DojoWidget, Util, _Tooltip],
    props: ["app", "value"],
    data: function () {
        return {
            wizardComponent: '',
            testtab: "params",
            hasOutputPath: true,
            secretKeys: [],
            checkBoxChecked: false,
            model: {
                widgets: {}
            },
            template: {},
            widget: null,            
            rest: {
                method: "POST",
                input: {
					"fileDataBinding": '',
					"type": "file",
					"fileType": "PDF"
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
            hasTest: true,
            loadingResult: false,
            file: {},
            fileTypes: '.pdf,.csv,.xlsx,.docx'
        }
    },
    components: {
        'Combo': Input,
        'FileButton': FileButton
    },
    computed: {
        buttons() {
            return this.$attrs.buttons;
        },
        dataBindingKeys() {
            let values = {}
            if (this.rest.input.fileDataBinding) {
                values[this.rest.input.fileDataBinding] = "";
            }
            return values
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
    },
    methods: {
        onFileChange (file) {
            this.uploadedFile = file
            this.databingValues = {}
            this.databingValues[this.rest.input.fileDataBinding] = file
        },
        setWidget(w) {
            this.logger.log(-4, 'setWidget', 'enter')
            this.widget = w
            if (w.props && w.props.rest) {
                this.rest = lang.clone(w.props.rest)
                if (!this.rest.output.databinding) {
                    this.logger.log(-1, 'setWidget', 'Set name as output')
                    this.rest.output.databinding = this.widget.name
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
        onChangeOutputVar(value) {
            this.rest.output.databinding = value
            this.onChange()
        },
        onChangeInputVar(value) {
            this.rest.input.fileDataBinding = value
            this.onChange()
        },
        onChange() {
            this.$nextTick(() => {
                this.isDirty = true
                this.$emit('change', this.getValue(), this.rest)
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
            let prefix = this.rest.output.databinding
            if (!prefix) {
                // this.testResult ='The output databinding is empty'
                this.testError = `The output data binding is empty`
                this.tab = 'params'
                return false
            }
            if (this.uploadedFile && this.uploadedFile.name) {
                let fileExtension = this.uploadedFile.name.split('.').pop().toLowerCase();
                // Check if the file has a .pdf extension
                if (this.fileTypes.indexOf(fileExtension) === -1) {
                    this.testError = `The selected file ${fileExtension} is not a valid doc type. Please select one of this file types: ${this.fileTypes}`;
                    this.tab = 'params';
                    return false;
                }
            } else {
                this.testError = `Set an input file variable and upload a pdf file to start testing`;
                this.tab = 'params';
                return false;
            }

            return true;
        },
        buildHints(object) {
            let prefix = this.rest.output.databinding
            this.rest.output.hints = RestUtil.buildHints(prefix, object)
            /**
             * FIXME: call here onChange will fuckup the rest.vars...
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
                const result = await DocEngine.runParser(this.rest, this.databingValues, this.hash, this.model.id);
                this.testResult = result
                this.loadingResult = false;
            } catch (e) {
                this.runSuccess = false
                this.testResult = 'Error: ' + e.message
                this.testError = 'Something went wrong. '
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
        this.logger = new Logger("AIRest")
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