
<template>
    <div class="MatcToolbarRestSettings MatcToolbarTemplateRestSettings MatcDialogContainer">
        <div class="MatcDialogContent">
            <div class="MatcDialogContentHeader">
                <label>Open AI - Settings</label>
                <a class="VommondDialogHelper ml-2" :href="helper" target="_blank">
                    <span class="mdi mdi-help-circle-outline" />
                </a>
            </div>       
            <div class="MatcMarginTop">                
                <div class="MatcToolbarRestSettingsElementCntr">
                    <div class="form-group">
                        <label>Auth Token</label>
                        <Combo :value="config.token" @change="onChangeToken" :hints="variableAndSecretHints" :fireOnBlur="true"
                            :formControl="true" :isDropDown="true" placeholder="Use secrets like ${secrets.apiToken}" />
                    </div>
            
                    <div v-if="assistants.length > 0">
                        <div class="form-group">
                            <label>Assistant</label>
                            <DropDownButton :value="config.assistant" :options="assistants"
                                    @change="onChangeAssistant" :formControl="true" placeholder="" />
                        </div>

                         <div class="form-group">
                            <label>Model</label>
                            <DropDownButton :value="config.version" :options="versions"
                                    @change="onChangeVersion" :formControl="true" placeholder="" />
                        </div>

                        <div class="form-group">
                            <label>Input Variable</label>
                            <Combo :value="config.input.databinding" @change="onChangeInputVar" :hints="hints" :fireOnBlur="true"
                                :formControl="true" :isDropDown="true" placeholder="Name of input variable" />
                        </div>
        
                        <div class="form-group">
                            <label>Output Variable</label>
                            <Combo :value="config.output.databinding" @change="onChangeOutputVar" :hints="hints" :fireOnBlur="true"
                                :formControl="true" :isDropDown="true" placeholder="Name of output variable" />
                        </div>

                        <div class="form-group" v-if="hasOutputPath">
                            <label>Output Path</label>
                            <Combo :value="config.output.path" :hints="hints" @change="onChangeOutputPath" :fireEmpty="true" :fireOnBlur="true"
                                :formControl="true" :isDropDown="true" placeholder="Specify path to extract" />
                        </div>
                         <div class="form-group">
                            <CheckBox
                                :value="config.output.stream"
                                @change="onChangeStream($event)"
                                label="Stream"
                                class="MatcMarginTop"
                            />
                        </div>
                        
                    </div> 
                    <div v-else class="MatcHint">
                        No OpenAI Assistants defined
                    </div>

                    
                </div>
            </div>            
            <div class="MatcError" v-show="testError && testError.length > 0" style="width: 230px;">
                {{ testError }}
            </div>
        </div>
       
        <div class="MatcDialogTest">
            <div class="MatcDialogTestHeader">
                <label class="MatcDialogTestHeaderLabel">Test</label>
                <a class="MatcDialogTestButton" @click="run">Run Test</a>
            </div>
            <div class="MatcMarginTop">   
                <div class="form-group">
                    <label>Test Message</label>
                    <textarea v-model="testMessage" placeholder="Enter the message" class="MatcIgnoreOnKeyPress form-control" ></textarea>                
                </div>
            </div>
            <label>Response</label>            
            <div v-if="loading" class="spinner-container">
                <div class="spinner"></div>
            </div>
            <div v-else class="MatcToolbarRestAssistantResult">
                <span v-html="formattedOutput"></span>
            </div> 
        </div>

    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import lang from 'dojo/_base/lang'
import RestEngine from 'core/RestEngine'
import OpenAIEngine from 'core/OpenAIEngine'
import Logger from 'common/Logger'
import DropDownButton from 'page/DropDownButton'
import Input from 'common/Input'
import HelperUtil from '../../../util/HelperUtil'
import CheckBox from 'common/CheckBox'

export default {
    name: 'RestSettings',
    mixins: [DojoWidget, Util],
    props: ["app", "value"],
    data: function () {
        return {
            tab: "data",
            hasOutputPath: false,
            secretKeys: [],        
            model: {
                widgets: {}
            },
            widget: null,
            config: {             
                token: "",
                assistant: '',
                input: {
                    databinding: '',
                    prompt: "",
                },
                output: {
                    databinding: '',
                    path:'choices[0].message.content',
                    stream: false
                }
            },
            assistants: [],
            versions: ['v1', 'v2'],
            testMessage: '',
            testResult: '',
            testError: '',
            runSuccess: false,
            isDirty: false,
            uploadedFile: null,
            helper: HelperUtil.CHAT,
            loading: false
        }
    },
    components: {
        // 'SegmentButton': SegmentButton,
        'DropDownButton': DropDownButton,
        'Combo': Input,
        'CheckBox': CheckBox
    },
    computed: {
        formattedOutput() {
            return this.formatOutput(this.testResult);
        },
        dataBindingKeys() {
            let values = RestEngine.getNeededDataBings(this.rest)
            return values
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
        onChangeStream(value) {
            this.config.output.stream = value
            this.stream = value
        },
        formatOutput(result) {
            if (!result) return '';

            let formatted = result.replace(/(?:\r\n|\r|\n)/g, '<br>');

            formatted = formatted.replace(/(important)/gi, '<strong>$1</strong>');

            return formatted;
        },
        setSecretKeys(s) {
            this.logger.log(-1, 'setSecretKeys', 'enter', s)
            this.secretKeys = s
        },

        async setWidget(w) {
            this.logger.log(-4, 'setWidget', 'enter')
            this.widget = lang.clone(w)

            if (w.props && w.props.rest) {
                this.config = lang.clone(w.props.rest)
            }   
            this.loadAssistans()
      
        },

        async loadAssistans () {
            if (this.config.token) {
                let response = await OpenAIEngine.findAssistants(this.model.id, this.hash, this.config.token)
                this.assistants = response.data.map(item =>{
                    return {
                        label: item.name,
                        value: item.id
                    }
                })
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
        onChangeAssistant (id) {
            this.logger.log(-1, 'onChangeAssistant', 'enter > ' + id)
            this.config.assistant = id       
        },
        onChangeVersion (version) {
            this.logger.log(-1, 'onChangeVersion', 'enter > ' + version)
            this.config.version = version       
        },
        onChangeToken(t) {
            this.logger.log(-1, 'onChangeToken', 'enter > ' + t)
            this.config.token = t
            this.loadAssistans()      
        },
        onChangeOutputVar(value) {
            this.config.output.databinding = value
        },
        onChangeOutputPath(value) {
            this.config.output.path = value
        },
        onChangeInputVar (value) {
            this.config.input.databinding = value
        },

        hasRun() {
            if (this.isDirty) {
                if (!this.runSuccess) {
                    this.testError = 'Please test before saving'
                }
                return this.runSuccess
            }
            return true
        },
        validate() {          
            if (!this.testMessage) {
                this.tab = 'params'
                this.testError = `Please, fill the Test Message field`
                return false
            }
            if (!this.config.assistant) {
                this.tab = 'data'
                this.testError = `Please select an assistant`
                return false
            }
            return true
        },

        async run() {
            this.testResult = ''
            this.testError = ''
            this.tab = 'params'
            if (!this.validate()) {
                return;
            }
            localStorage.setItem("flowrabbitOpenAITestMessage", this.testMessage)
            try {
                this.loading = true;
                const result = await OpenAIEngine.query(
                    this.model.id, 
                    this.hash, 
                    this.config.token, 
                    this.config.assistant,
                    this.testMessage,
                    this.config.version,
                    this.stream
                )
                if (!this.stream) {
                    this.testResult = result
                } else {
                    this.loading = false;
                    await this.processStream(result);
                }
                this.tab = 'preview'
            } catch (e) {
                this.runSuccess = false
                this.testResult = 'Error: ' + e.message
                this.testError = 'Something went wrong. ' + e.message
            } finally {
                this.loading = false
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
        }
    },
    watch: {
        value(v) {
            this.setWidget(v)
        }
    },
    mounted() {
        this.logger = new Logger("OpenAIAssistantSettings")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>