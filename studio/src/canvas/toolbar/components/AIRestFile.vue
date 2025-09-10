
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
                    <a v-if="aiModel?.type !== 'flowrabbit'" @click="selectTab('auth')" :class="{ 'MatcToolbarTabActive': tab === 'auth' }">
                        Authorization
                    </a>
                    <a @click="selectTab('advanced')" :class="{ 'MatcToolbarTabActive': tab === 'advanced' }" v-if="aiModel && aiModel.advanced">
                        Advanced
                    </a>
                </div>
            </div>
            <div class="MatcMarginTop">
                <div v-show="tab === 'data'" class="MatcToolbarRestSettingsElementCntr p-2">    
                    <div class="form-group" v-if="brandList && brandList.length > 0">                                              
                        <div class="MatcFlex MatcGapM MatcMarginBottomXS">
                            <div class="MatcSegmentButtonInline MatcFlex50">
                                <label>Brand
                                    <span class="MatcToolbarItemIcon">
                                        <span class="mdi mdi-help-circle-outline"></span>
                                    </span>
                                </label>
                                <DropDownButton class="MatcFlex50" :value="brand" :options="brandList"
                                    @change="onChangeBrand(e, $event)" :formControl="true" placeholder="Select a brand"/>
                            </div>
                            <div class="MatcSegmentButtonInline MatcFlex50" v-if="modelsList && modelsList.length > 0">
                                <label>Model
                                    <span class="MatcToolbarItemIcon">
                                        <span class="mdi mdi-help-circle-outline"></span>
                                    </span>
                                </label>
                                <DropDownButton class="MatcFlex50" :value="aiModel.id" :options="modelsList" :formControl="true" 
                                    @change="onModelChange(e, $event)" placeholder="Select a model">
                                </DropDownButton>
                            </div>
                        </div>
                    </div>
                    <div class="form-group" v-if="aiModel">   
                        <div v-if="template.type === 'image'">
                            <AIRestImage :rest="rest" :imageProps="imageProps" />
                        </div>                                    
                        <div v-if="template.type === 'speechToText'">
                            <AIRestSpeechToText :rest="rest" :onChangeInputVar="onChangeInputVar" :hints="hints"/>
                        </div>                                                          
                        <div v-if="rest.input.type === 'IMAGE'">
                           <Combo :value="rest.input.fileDataBinding" @change="onChangeInputVar" :hints="hints" :fireOnBlur="true"
                                :formControl="true" :isDropDown="true" placeholder="Name of input variable" />
                        </div>
                        <div v-for="e in aiModel.elements" :key="e.id">
                            <div class="form-group">
                                <AIRestSettingItem 
                                    :dependentSelections="dependentSelections" 
                                    :item="e" 
                                    :onChange="onTemplateElementChange" 
                                    :variableAndSecretHints="variableAndSecretHints" 
                                    :rest="rest" 
                                    :aiModel="aiModel" 
                                    :databingValues="databingValues" 
                                    :hash="hash" 
                                    :modelId="model.id"
                                    :hints="hints"
                                />
                                <div :class="['', {'MatcFlex MatcGapXL': e.type === 'flex'}]">
                                    <div class="MatcSegmentButtonInline MatcFlex50" v-for="c in e.content" :key="c.id">
                                        <AIRestSettingItem 
                                            :dependentSelections="dependentSelections" 
                                            :item="c" 
                                            :onChange="onTemplateElementChange" 
                                            :variableAndSecretHints="variableAndSecretHints" 
                                            :rest="rest" 
                                            :aiModel="aiModel" 
                                            :databingValues="databingValues" 
                                            :hash="hash" 
                                            :modelId="model.id"
                                            :hints="hints"
                                        />
                                    </div>
                                </div>
                                <div style="width: 100%">
                                    <AutoCompleteTextarea 
                                        v-if="e.type === 'TextArea'" 
                                        :options="variableAndSecretHintsList" 
                                        :value="e.value" 
                                        :placeholder="e.placeholder" 
                                        :class="e.class || 'MatcAutoCompleteTextareaXXS'"
                                        @change="onTemplateElementChange(e, $event)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>       
                <div v-show="tab === 'auth' && aiModel?.type !== 'flowrabbit'" class="MatcToolbarRestSettingsElementCntr p-2">
                    <div class="form-group">
                        <div class="MatcFlex MatcBetween">
                            <label>API Key 
                                 <span class="MatcToolbarItemIcon" ref="tooltipAuthToken">
                                        <span class="mdi mdi-help-circle-outline"></span>
                                    </span>
                            </label>
                            <a v-if="aiModel.documentationAuthLink" target="_blank" 
                                :href="aiModel.documentationAuthLink" class="MatcFontTiny">How do I get the API key?</a>
                        </div> 
                        <Combo :value="rest.token" @change="setRestToken" :hints="secretHints" :fireOnBlur="true"
                            :formControl="true" :isDropDown="true" placeholder="Use secrets like ${secrets.apiToken}" />
                    </div>
                </div>   
                <div v-show="tab === 'output'">
                    <div class="form-group MatcToolbarResSettingsCntrScroll p-2">
                        <label>Output Variable
                            <span class="MatcToolbarItemIcon" ref="tooltipOutputVarIcon">
                                <span class="mdi mdi-help-circle-outline"></span>
                            </span>
                        </label>
                        <Combo :value="rest.output.databinding" @change="onChangeOutputVar" :hints="hints" :fireOnBlur="true"
                            :formControl="true" :isDropDown="true" placeholder="Name of output variable" />
                        <div class="MatcToolbarRestOutputHeaderType MatcMarginTop" v-if="template.type === 'llms' && aiModel?.output?.hasjsonoutput">
                            <label>Output Type</label>
                            <div class="MatcToolbarRestOutputHeaderTypeFlex">
                                <SegmentButton 
                                    :options="outputTypes" 
                                    v-model="formatType" 
                                    style="width:300px" 
                                    @change="onChangeFormatTypeVar"
                                    :formControl="true"     
                                />                       
                            </div>
                        </div>
                        <div class="MatcMarginTop" v-if="rest.output.formatType === 'Text' || !aiModel?.output?.hasjsonoutput" >
                            <CheckBox
                                v-if="template.type === 'llms'"
                                :value="rest.vars.stream"
                                @change="onChangeStream($event)"
                                label="Stream"
                                :formControl="true"
                            />
                        </div>
                        <div class="MatcMarginTop" v-if="template.type === 'llms' && formatType === 'JSON'" >
                            <label>Output Format</label>
                            <Ace
                                ref="aceEditor"
                                v-model="rest.output.formatJSON"
                                @init="editorInit"
                                lang="json"
                                theme="chrome"
                                width="440"
                                height="220"></Ace>

                            <p class="MatcHint">
                                Use the ${variable} notation to send data from the prototype.
                            </p>
                        </div>
                        <div class="MatcMarginTop">
                            <label>Loading Variable
                                <span class="MatcToolbarItemIcon" ref="tooltipLoadingVarIcon">
                                    <span class="mdi mdi-help-circle-outline"></span>
                                </span>
                            </label>
                            <Combo :value="rest.output.loading" @change="onChangeLoadingVar" :hints="hints" :fireOnBlur="true"
                                :formControl="true" :isDropDown="true" placeholder="Name of the loading variable" />
                        </div>
                        <div class="MatcMarginTop">
                            <label>Error Variable
                                <span class="MatcToolbarItemIcon" ref="tooltipErrorVarIcon">
                                    <span class="mdi mdi-help-circle-outline"></span>
                                </span>
                            </label>
                            <Combo :value="rest.output.error" @change="onChangeErrorVar" :hints="hints" :fireOnBlur="true"
                                :formControl="true" :isDropDown="true" placeholder="Name of the error variable" />
                        </div>
                    </div>
                </div> 
                <div v-show="tab === 'advanced'">
                    <div class="form-group MatcToolbarResSettingsCntrScroll p-2" v-if="modelsList && aiModel.advanced">
                            <div v-for="e in aiModel.advanced" :key="e.id">
                                <div class="form-group ">
                                        <AIRestSettingItem :item="e" :onChange="onTemplateElementChange" :getVars="getAllAppVariables" :rest="rest" :aiModel="aiModel" :databingValues="databingValues" :hash="hash" :modelId="model.id"/>
                                        <div :class="['', {'MatcFlex MatcGapXL': e.type === 'flex'}]">
                                                <div class="MatcSegmentButtonInline MatcFlex50" v-for="c in e.content" :key="c.id">
                                                    <AIRestSettingItem :item="c" :onChange="onTemplateElementChange" :getVars="getAllAppVariables" :rest="rest" :aiModel="aiModel" :databingValues="databingValues" :hash="hash" :modelId="model.id"/>
                                                </div>                                        
                                        </div>
                                        
                                        <AutoCompleteTextarea v-if="e.type === 'TextArea'" :options="variableAndSecretHintsList" 
                                            :value="e.value" :placeholder="e.placeholder" class="MatcAutoCompleteTextareaXXS"
                                            @change="onTemplateElementChange(e, $event)">
                                        </AutoCompleteTextarea>
                                                        
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="hasTest" class="MatcDialogTest">
                <div class="MatcDialogTestHeader">
                    <label class="MatcDialogTestHeaderLabel">Test</label>
                    <a class="MatcDialogTestButton" @click="run" v-if="aiModel?.type !== 'flowrabbit'">Run Test</a>
                </div>
                <div class="MatcToolbarTabs MatcToolbarTabsBig">
                    <div>
                        <a @click="testtab = 'params'" :class="{ 'MatcToolbarTabActive': testtab === 'params' }">Test Parameters</a>
                        <a @click="testtab = 'result'" :class="{ 'MatcToolbarTabActive': testtab === 'result' }" style="margin-left:20px;">Results</a>
                    </div>                
                </div>
                <div v-show="testtab === 'params'">
                    <div class="MatcToolbarResSettingsCntrScroll MatcTestParams MatcMarginTop">
                        <div class="MatcToolbarRestDataBindingRow" v-for="(key) in dataBindingKeys" :key="key">
                            <span class="MatcToolbarRestDataBindingRowLabel">{{ key }}</span>
                            <input v-model="databingValues[key]" class="form-control" ref="dbInputs"
                                v-if="rest.input.type === 'JSON' || rest.input.type === 'FORM' || rest.input.type === 'IMAGE'" />
                            <template>
                                <FileButton v-if="rest.input.type === 'FILE' || rest.input.type === 'IMAGE'" class="MatcToolbarRestDataBindingFile"
                                    @change="onFileChange" label="Select a file" />
                            </template>
                                <template>
                                <div v-if="rest.input.type === 'AUDIO'">
                                    <button @click="toggleRecording" :disabled="error">
                                        <div v-if="isRecording" class="mdi mdi-stop-circle"/>
                                        <div v-else class="mdi mdi-microphone"/>
                                    </button>
                                </div>
                            </template>
                        </div>
                        <div class="MatcToolbarRestDataBindingRowAudio" v-if="audioUrl">
                            <audio :src="audioUrl" controls></audio>
                        </div>                        
                        <div class="ParamsDataBindingContent" v-if="dataBindingKeys.length == 0 && rest.input.type === 'JSON'">
                            You are not using variables. No need to specify any data.
                        </div>
                    </div>                       
                </div>
                <div v-show="testtab === 'result'">
                    <div class="MatcToolbarResSettingsCntrScroll">
                        <div v-show="loadingResult" class="spinner-container">
                            <div class="spinner"></div>
                        </div>
                        <div v-if="testError && testError.length > 0">
                            <div class="MatcAlertBoxXL MatcAlertBoxDanger MatcMarginTop">
                                {{ testError }}
                            </div>  
                            <pre v-if="testResult" :class="['MatcToolbarRestDataBindingCntr MatcMarginBottom', { 'MatcAlertBoxXL MatcAlertBoxDanger MatcMarginTop': testError }]">{{ testResult }}</pre>
                        </div>
                        <div v-else>
                            <div v-if="testResult">
                                <div class="MatcToolbarRestDataBindingCntr" v-if="template.type === 'image'" >
                                    <img :src="testResult">
                                </div>
                                <div class="MatcToolbarRestDataBindingCntr" v-if="template.type === 'textToSpeech'">
                                    <audio controls :src="testResult">
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>      
                                <div class="MatcToolbarRestDataBindingCntr" v-if="template.type === 'speechToText' || (template.type === 'llms' && formatType === 'Text')">
                                    <span v-html="formattedOutput"></span>
                                </div> 
                                
                                <pre v-if="template.type === 'llms' && formatType === 'JSON'"
                                    :class="['MatcToolbarRestDataBindingCntr MatcMarginBottom', {'MatcError': testError}]">
                                    <JSONVisualizer :jsonData='testResult' :init="true"></JSONVisualizer>
                                </pre>
                            </div> 
                        </div>
                    </div>  
                </div>
                <div v-if="aiModel?.type === 'flowrabbit'">                            
                    <div
                        class="MatcAlertBox MatcMarginBottom MatcAlertBoxInfo"
                    >
                        <span class="MatcAlertBoxContent">
                            Info: Flowrabbit credits can only be used in Published Apps.
                        </span>
                        <div class="MatcFlex MatcEnd"><span class="icon coins-icon"/><span class="ml-2 mr-2">{{ getFlowrabbitCredits }}</span></div>
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
import DropDownButton from 'page/DropDownButton'
import Input from 'common/Input'
import JSONPath from '../../../core/JSONPath'
import _Tooltip from "common/_Tooltip";
import AIModelsUtil from '../../../util/aimodels/AIModelsUtil'
import AIRestSettingItem from './AIRestSettingItem.vue'
import AutoCompleteTextarea from 'page/AutoCompleteTextarea'
import RestEngine from 'core/RestEngine'
import FileButton from 'common/FileButton'
import DocEngine from 'core/DocEngine'
import StreamEngine from 'core/StreamEngine'
import CheckBox from 'common/CheckBox'
import SegmentButton from 'page/SegmentButton'
import JSONVisualizer from './JSONVisualizer.vue'
import RestUtil from '../../../core/RestUtil'
import AIRestImage from './AIRestImage.vue'
import AIRestSpeechToText from './AIRestSpeechToText.vue'
import Services from "services/Services";

export default {
    name: 'AIRest',
    mixins: [DojoWidget, Util, _Tooltip],
    props: ["app", "user", "value"],
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
                authType: '',
                input: {
                    type: "JSON",
                    template: ''
                },
                output: {
                    databinding: '',
                    template: '',
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
            aiModel: {},
            aiModels: [],
            imageProps: {style: undefined, type: undefined},
            loadingResult: false,
            mediaRecorder: null,
            audioChunks: [],
            audioUrl: '',
            isRecording: false,
            error: false,
            errorMessage: '',
            brand: undefined,
            modelsList: [],
            formatType: 'Text',
            outputTypes: [
                {
                    label: "Text",
                    value: "Text"
                },
                {
                    label: "JSON",
                    value: "JSON"
                }
            ],
            dependentSelections: {},
            organizations: []
        }
    },
    components: {
        'DropDownButton': DropDownButton,
        'Combo': Input,
        'AIRestSettingItem': AIRestSettingItem,
        'AutoCompleteTextarea': AutoCompleteTextarea,
        'FileButton': FileButton,
        'CheckBox': CheckBox,
        'SegmentButton': SegmentButton,
        'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor'),
        'JSONVisualizer': JSONVisualizer,
        'AIRestImage': AIRestImage,
        'AIRestSpeechToText': AIRestSpeechToText
    },
    computed: {
        formattedOutput() {
            return typeof this.testResult === "string" && this.formatOutput(this.testResult);
        },
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
        secretHints() {
            if (this.secretKeys) {
                const secrets = this.secretKeys.map(e => {
                    const v = "${secrets." + e.key + "}"
                    return {
                        label: e.key,
                        value: v,
                        icon: 'mdi mdi-key'
                    }
                })
                return secrets;
            }
            return []
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
        brandList() {
            const type = this.template.type;
            if (type && AIModelsUtil[type]) {
                const brands = AIModelsUtil[type].brands;
                return brands.map(m => ({ value: m.id, label: m.label, icon: m.logo }));
            }
            return []
        },
        getFlowrabbitCredits() {
            let count = 0;
            this.organizations.forEach((org) => {
                const model = this.aiModel?.model
                if (model && org.apiCalls && org.apiCalls[model]) {
                    count += org.apiCalls[model].maxApiCalls - org.apiCalls[model].currentApiCalls
                }
            });
            return count;
        }
    },
    methods: {
        formatOutput(result) {
            if (!result) return '';

            let formatted = result.replace(/(?:\r\n|\r|\n)/g, '<br>');

            formatted = formatted.replace(/(important)/gi, '<strong>$1</strong>');

            return formatted;
        },
        selectTab(tabname) {
            this.tab = tabname;
        },
        setSecretKeys(s) {
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
        updateTemplateValues(aiModelId) {
            this.logger.log(-4, 'updateTemplateValues', 'enter')
            if (this.template.type) {
                const type = this.template.type;
                const models = AIModelsUtil[type].models;
                this.template.models = models;
                if (aiModelId) {
                    this.aiModel = this.getModelFromValue(aiModelId); 
                    this.rest.modelId = aiModelId;
                    this.setRestVars()
                } else {                    
                    this.aiModel = this.getModelFromValue(models[0].id); 
                    this.setTemplateVars()
                }   
                this.rest.modelType = this.template.type;
                this.brand = this.aiModel.type;
                const list = models.filter(m => m.type === this.brand)
                        .map(m => ({ value: m.id, label: m.name }));
                this.modelsList = list;
                this.updateRestModel()
            }
            this.$nextTick(() => {
                const type = this.template.type;
                const models = AIModelsUtil[type].models;
                models.forEach((e) => {
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
        setRestVars() {
            if (this.aiModel.elements) {
                this.aiModel.elements.forEach(e => {
                    this.setRestVar(e)
                })
            }  
            if (this.aiModel.advanced) {
                this.aiModel.advanced.forEach(e => {
                    this.setRestVar(e)
                })
            }    
            if (this.rest.imageProps) {
                this.imageProps =  this.rest.imageProps
            }
            if (this.rest.vars.json) {
                this.formatType = 'JSON'
            }
        },
        setRestVar(e) {
            if (e.type === "flex") {
                e.content.forEach(c => {
                    c.value = this.rest.vars[c.id];
                })
            } else {
                e.value = this.rest.vars[e.id];
            }
        },
        setTemplateVars() {
            if (this.aiModel.elements) {
                this.aiModel.elements.forEach(e => {
                    this.setTemplateVar(e)
                })
            }   
            if (this.aiModel.advanced) {
                this.aiModel.advanced.forEach(e => {
                    this.setTemplateVar(e)
                })
            }       
            this.rest.url = this.aiModel.url;
            this.rest.headers = this.aiModel.headers;
            this.rest.input.template = JSON.stringify(this.aiModel.template)   
            if (this.aiModel.input && this.aiModel.input.type) {
                this.rest.input.type = this.aiModel.input.type                
            }
            if (this.aiModel.output && this.aiModel.output.path) {
                this.rest.output.path = this.aiModel.output.path
            }
            if (this.aiModel.output && this.aiModel.output.streampath) {
                this.rest.output.streampath = this.aiModel.output.streampath
            }
            this.rest.output.type = this.aiModel.output.type || "JSON"
            this.rest.output.formatType = this.aiModel.output.formatType || "Text"
        },
        setTemplateVar(e) {
            if (e.type === "flex") {
                e.content.forEach(c => {
                    if (c.required) {
                        this.rest.vars[c.id] = c.default;
                    }
                })
            } else {
                if (e.required) {
                    this.rest.vars[e.id] = e.default;
                }
            }
        },
        getModelFromValue(value) {
             const val = this.template.models.find((f) => 
                 f.id === value
             )
             return val;
        },
        async setWidget(w) {
            this.logger.log(-4, 'setWidget', 'enter')
            this.widget = w
            if (w.props && w.props.rest) {
                this.rest = lang.clone(w.props.rest)
                if (!this.rest.vars) {
                    this.rest.vars = {}
                }
                this.template = lang.clone(w.props.template)                
                this.updateTemplateValues(w.props.aiModelId)

                if (!this.rest.output.databinding) {
                    this.logger.log(-1, 'setWidget', 'Set name as output')
                    this.rest.output.databinding = this.widget.name
                }
                if (!this.rest.headers) {
                    this.logger.log(-1, 'setWidget', 'Set headers')
                    this.$set(this.rest, "headers", [])
                }
                const orgs = await Services.getOrgService().findUserOrganizations(this.user.id)
                this.organizations = orgs.map(o => {
                    return {
                        value: o.id ? o.id : o._id,
                        label: o.name,
                        domain: o.domain,
                        apiCalls: o.apiCalls
                    }
                })
            }
        },        
        editorInit  () {
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
                getCompletions (editor, session, pos, prefix, callback) {
                    if (prefix.indexOf('$') === 0) {
                        let result = vars.map(v => {
                            return {name: v, value: '${' + v + '}', score: 1, meta: "databinding"}
                        })
                        callback(null, result)
                    }
                }
            });
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
            if (this.rest.type === "azure") {
                this.rest.url = this.aiModel.url.replace("{{deployment}}", this.rest.vars['deployment'])
                .replace("{{resource}}", this.rest.vars['resource'])
                .replace("{{apiversion}}", this.rest.vars['apiversion'])
            }
            return this.rest
        },
        getAIModelId() {
            return this.aiModel.id
        },   
        onModelChange(item, value) {
            this.logger.log(5, 'onModelChange', 'enter')
            const selectedModel = this.template.models.find((m) => {
                return value === m.id
            })
            this.$set(this, 'aiModel', selectedModel);
            this.$set(this.rest, 'vars', {});         
            this.setTemplateVars();
            this.rest.modelId = value;
            this.updateRestModel()
            this.updateAuthParam()
            this.$forceUpdate();
            this.logger.log(-5, 'onModelChange', 'exit', JSON.stringify(this.rest, null, 2))
        },
        onChangeBrand(item, value) {
            this.aiModel = {}
            this.brand = value;
            const type = this.template.type;
            if (this.brand && type && AIModelsUtil[type]) {
                const models = AIModelsUtil[type].models;
                const list = models.filter(m => m.type === this.brand)
                        .map(m => ({ value: m.id, label: m.name }));
                this.modelsList = list;
            }
        },
        updateAuthParam() {
            if (this.aiModel && this.aiModel.type === "flowrabbit") {
                this.rest['token'] = '${secrets.flowrabbit}'
            } else if (this.rest['token'] === '${secrets.flowrabbit}') {
                this.rest['token'] = ''
            }
        }, 
        updateRestModel() {
            this.rest.method = this.aiModel.method;    
            this.rest.secondjobcall = this.aiModel.secondjobcall;    
            this.rest.type = this.aiModel.type;
            this.rest.authType = this.aiModel.authType;
            this.rest.authHeader = this.aiModel.authHeader;    
            this.rest.output.path = this.aiModel.output.path;   
            const template = this.aiModel.getTemplate(this.rest.vars)
            try {
                this.rest.input.template = JSON.stringify(template)
            } catch (e) {
                this.logger.error('updateRest', 'Could not parse', e)
            }
        },
        onTemplateElementChange(element, event) {
            let value = event;
            if (event && event.target) {
                const target = event.target
                value = target.value 
            }     
            this.rest.vars[element.id] = value
            element.value = value;
            if (element.type === 'FILE') {
                this.onChangeFileDataBinging(value)
            }
            this.onChange()            
        },
        onChangeStream(value) {        
            this.rest.vars['stream'] = value
            this.onChange()
        },
        updateRest() {
            this.logger.log(4, 'updateRest', 'enter')   
                if (this.aiModel) {
                    const template = this.aiModel.getTemplate(this.rest.vars)
                try {
                    this.rest.input.template = JSON.stringify(template)
                } catch (e) {
                    this.logger.error('updateRest', 'Could not parse', e)
                }
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
        onChangeLoadingVar(value) {
            this.rest.output.loading = value
            this.onChange()
        },
        onChangeErrorVar(value) {
            this.rest.output.error = value
            this.onChange()
        },
        onChangeInputVar(value) {
            this.rest.input.fileDataBinding = value
            this.onChange()
        },
        onChangeOutputPath(value) {
            this.rest.output.path = value
            this.onChange()
        },
        onChangeFormatTypeVar(value) {
            this.rest.output.formatType = value
            this.formatType = value
            this.rest.vars['json'] = value === 'JSON'
            if (value !== 'Text') this.rest.vars['stream'] = false
            this.onChange()
        },
        onChange() {
            this.updateRest()
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
                this.testError = `Field required: The output data binding is empty`
                this.tab = 'output'
                return false
            }

            if (!this.aiModel || !this.aiModel.id) {
                this.testError = `Field required: Select one brand and AI model from the list`
                this.tab = 'data'
                return false
            }

            if (this.aiModel && this.aiModel.type !== "flowrabbit" && !this.rest.token) {
                this.testError = `Field required: the authentication token is required`
                this.tab = 'data'
                return false
            }

            // check all required fields from the aiModel are filled in the vars
            if (this.aiModel) {
                const elements = this.aiModel.elements;
                const advanced = this.aiModel.advanced;
                const vars = this.rest.vars;
                let valid = true
                if (elements && elements.length > 0) {
                    elements.forEach((e) => {
                        if (e.required && (!vars || vars[e.id] === undefined || vars[e.id].length === 0)) {
                            this.testError = `Field required: the ${e.label} is required`
                            this.tab = 'data'
                            valid = false;
                            return;
                        }
                    })
                }

                if (advanced && advanced.length > 0) {
                    advanced.forEach((e) => {
                        if (e.required && (!vars || vars[e.id] === undefined || vars[e.id].length === 0)) {
                            this.testError = `Field required: the ${e.label} is required`
                            this.tab = 'data'
                            valid = false;
                            return;
                        }
                    })
                }
                return valid;
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

            if (this.rest.type === "azure") {
                if (!this.rest.vars['deployment'] || !this.rest.vars['resource'] || !this.rest.vars['apiversion'] ) {
                    this.testError = `Please complete all the required fields: deployment, resource and api version.`
                    this.testtab = 'params'
                    return false
                } else {
                    this.rest.url = this.rest.url.replace("{{deployment}}", this.rest.vars['deployment'])
                        .replace("{{resource}}", this.rest.vars['resource'])
                        .replace("{{apiversion}}", this.rest.vars['apiversion'])
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
        visitResult(object, result, prefix) {
            try {
                if (prefix.length > 300) {
                    return
                }
                if (Array.isArray(object)) {
                    let path = prefix + '[0]'
                    result[path] = "Array"
                    object.forEach(o => {
                        this.visitResult(o, result, path)
                    })
                    return
                }
                if (lang.isObject(object)) {
                    for (let key in object) {
                        let o = object[key]
                        let path = prefix + '_' + key
                        result[path] = "Object"
                        this.visitResult(o, result, path)
                    }
                    return
                }
            } catch (e) {
                console.error(e)
                console.error(e.stack)
            }
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
                let rs = this.rest;
                console.log(rs)
                console.log(this.databingValues)
                if (this.template.type === "image") {
                    this.processPromptImage()
                }
                if (this.formatType === "JSON") {
                    this.processPromptJSON()
                }
                if (this.rest.type === "azure") {
                    this.rest.url = this.aiModel.url.replace("{{deployment}}", this.rest.vars['deployment'])
                    .replace("{{resource}}", this.rest.vars['resource'])
                    .replace("{{apiversion}}", this.rest.vars['apiversion'])
                }
                if (this.rest.input.type === 'AUDIO') {
                    const config  = {
                        audio: this.audioUrl,
                        ...this.rest
                    }
                    const result = await DocEngine.transcribeAudio(config, this.databingValues, this.hash, this.model.id);
                    this.testResult = result;
                } else if (this.aiModel.secondjobcall) {    
                    let firstResult = await RestEngine.run(this.rest, this.databingValues, this.hash, this.model.id)                  
                    const req = this.aiModel.secondjobcall;
                    req.token = this.rest.token
                    this.testResult = await RestEngine.runAPILoop(firstResult, req, this.databingValues, this.hash, this.model.id, this.aiModel.type)                                   
                } else if (this.rest.vars.stream) {
                    const stream = await StreamEngine.runAndProcessStream(this.rest, this.databingValues, this.hash, this.model.id, this.aiModel.type)   
                    if (this.aiModel.output.streampath) {
                        this.loadingResult = false
                        await this.processStream(stream, this.aiModel.output.streampath);
                    }
                } else {
                    this.testResult = await RestEngine.run(this.rest, this.databingValues, this.hash, this.model.id)   
                    if (this.aiModel.output.path) {
                        this.testResult = JSONPath.get(this.testResult, this.aiModel.output.path)
                    }
                    if (this.formatType === 'JSON') {
                        try { 
                            this.testResult = JSON.parse(this.testResult)
                         } catch (e) {
                            this.runSuccess = false
                            this.testError = 'The result is not json'
                        }

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
                }
            } catch (e) {
                this.runSuccess = false
                if (e.message.indexOf("Unauthorized") !== -1) {
                    this.testError = `Error: the Authentication Key for the model ${this.aiModel.name} is no valid`
                } else {
                     this.testError = `Error: ${e.message}`
                }
            } finally {
                this.loadingResult = false;
            }
        },
        async processStream(stream) {
            const reader = stream.getReader();
            this.testResult = ""
            for (;;) {  // A common idiom for a loop that reads until done
                const { done, value } = await reader.read();
                if (done) break;

                if (value && typeof value === 'string') {
                    this.testResult += value || "";
                } else {
                    console.error('Unexpected value type:', value);
                    throw new Error('Stream value is not of type ArrayBuffer or ArrayBufferView');
                }
            }
        },
        processPromptImage() {
            let imagePrompt = ""
            if (this.imageProps.type) {
                imagePrompt += `. Image Type: ${this.imageProps.type}. `
            }
            if (this.imageProps.style) {
                imagePrompt += `Image Style: ${this.imageProps.style}.-`
            }
            const prompt = this.rest.vars.prompt += imagePrompt;
            const template = this.aiModel.getTemplate({...this.rest.vars, prompt: prompt})
            try {
                this.rest.input.template = JSON.stringify(template)
            } catch (e) {
                this.logger.error('updateRest', 'Could not parse', e)
            }
        },
        processPromptJSON() {
            let jsonPrompt = ""
            if (this.rest.output.formatJSON) {
                jsonPrompt += `. The JSON formatting must be like this one: ${this.rest.output.formatJSON}. `
            }
            const prompt = this.rest.vars.prompt += jsonPrompt;
            const template = this.aiModel.getTemplate({...this.rest.vars, prompt: prompt})
            try {
                this.rest.input.template = JSON.stringify(template)
            } catch (e) {
                this.logger.error('updateRest', 'Could not parse', e)
            }
        },
        async startRecording() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.handleError('Audio recording is not supported in your browser.');
                return;
            }

            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];
                this.setupRecorderEvents();
                this.mediaRecorder.start();
                this.isRecording = true;
                this.error = false;
                this.errorMessage = '';
                })
                .catch(err => {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    this.handleError('Audio recording permission was denied. Please enable microphone access in your browser settings.');
                } else {
                    this.handleError('Could not start audio recording: ' + err.message);
                }
                });
            },

            stopRecording() {
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
                this.isRecording = false;
            }
            },

            toggleRecording() {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
            },

        setupRecorderEvents() {
            this.mediaRecorder.ondataavailable = e => {
                this.audioChunks.push(e.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.audioUrl = URL.createObjectURL(audioBlob);
                console.log(this.audioUrl)                
                this.databingValues = {}
                this.databingValues[this.rest.input.fileDataBinding] = this.audioUrl
            };
            },

            handleError(message) {
            this.error = true;
            this.errorMessage = message;
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
        if (this.$refs.tooltipLoadingVarIcon) {
            this.addTooltip(this.$refs.tooltipLoadingVarIcon, 'The variable to store a loading variable. Is set to true when the request is in progress. Is set to false when the request finish')
        }
        if (this.$refs.tooltipErrorVarIcon) {
            this.addTooltip(this.$refs.tooltipErrorVarIcon, 'The variable to store the error result in case the request fails')
        }
        if (this.$refs.tooltipOutputPathIcon) {
            this.addTooltip(this.$refs.tooltipOutputPathIcon, 'The path of the result to store in the variable')
        }
        if (this.$refs.tooltipAuthToken) {
            this.addTooltip(this.$refs.tooltipAuthToken, 'To add a new secret token, go to the app options in the top bar menu, click on "Secret Vars" and add a new secret variable. Click on save and then this new variable will be shown here. All secret variables are safely secured, using high security standards.')
        }
    }
}
</script>