
<template>
    <div class="" v-if="api && databinding">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <div>
                    <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Input</a>
                    <a @click="tab='output'" :class="{'MatcToolbarTabActive': tab === 'output'}">Output</a>
                    <a @click="tab='setup'" :class="{'MatcToolbarTabActive': tab === 'setup'}">Setup</a>    
                </div>
        </div>


        <template v-if="tab === 'output'">
            <div class="form-group" v-if="this.api.template">
                    <label>Output Variable</label>
                    <Combo 
                        :value="databinding.default" 
                        @change="setOutput" 
                        :hints="hints" 
                        :fireOnBlur="true" 
                        :formControl="true"
                        :isDropDown="true" 
                        placeholder="Where the data will be stored" />
                </div>
        </template>



        <template v-if="tab === 'input'">
          
            <div class="form-group">
                    <label>Data</label>
        
                    <Ace
                        ref="aceEditor"
                        @change="setTemplate"
                        v-model="api.template"
                        @init="editorInit"
                        lang="json"
                        theme="chrome"
                        width="550"
                        height="220"></Ace>

                        <p class="MatcHint">
                            Use the ${variable} notation to send data from the prototype.
                        </p>
                </div>

        </template>

        <template v-if="tab === 'setup'">

                <div class="form-group">
                    <label>URL *</label>
                    <input :class="['form-control', {'form-control-error': !isValidURL}]" v-model="api.url" @change="setURL" placeholder="https://server.com/"/>
                </div>

                <div class="form-group">
                    <label>API Token</label>
                    <TokenInput
                        :appID="app?.id" 
                        :value="api.token" 
                        @change="setToken" 
                        :hints="secretHintsList" 
                        :fireOnBlur="true" 
                        :formControl="true"
                        :isDropDown="true" 
                        placeholder="You API key"
                        />
                </div>

                <div class="form-group">
                    <CheckBox :value="api.isProxyEnabled" @change="setProxy" label="Use Proxy server"/>
                </div>

        </template>


        <div v-if="errorMSG" class="MatcError">
            {{errorMSG}}
        </div>

    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
import Input from 'common/Input'
import TokenInput from 'common/TokenInput'
import RestUtil from '../../../core/RestUtil'
import RestEngine from '../../../core/RestEngine'
import CheckBox from 'common/CheckBox'
// import DropDownButton from 'page/DropDownButton'
// import APIInputs from './APIInputs.vue'

export default {
    name: 'WebhookSettings',
    mixins: [DojoWidget, Util],
    props: ["api", "secretKeys", "app", "hash", "databinding", "hints",  "variableHints", "variableAndSecretHints", "secretHints", 'schema'],
    data: function () {
        return {
            tab: 'input',
            output: '',
            operation: "readTable",
            errorMSG: "",
            bases: null,
            folders: null,
            spreadsheets: null,
            tables: null,
            pages: null,
            isValidURL: true
        }
    },
    components: {
        'Combo': Input,
        'TokenInput': TokenInput,
        'CheckBox': CheckBox,
        //'DropDownButton': DropDownButton,
        //'APIInputs': APIInputs,
        'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor'),
    },
    computed: {
        isFilled() {
            return this.api.url
        },
        secretHintsList() {
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
        }
    },
    methods: {
       
       
        getDefaultDataBinding () {
            return 'webhook'
        },

        setURL () {
            this.$emit('success', 'Setup complete, you can now edit the input')
            this.onChange()
            setTimeout(() => {
                this.tab = 'input'
            }, 500)
        },

        setTemplate () {
            const variables = RestUtil.getVariablesFromString(this.api.template)
            this.api.input = variables.map(v => {
                return   {    
                    "id": v,
                    "label": v,
                    "isVar": false,
                    "type": "Parameter",
                    "value": ''
                }
            })
            this.onChange()
        },
        setOutput (v) {
            this.databinding.default = v
            this.onChange()
        },
        setProxy (v) {
            this.api.isProxyEnabled = v
            this.onChange()
        },
        setToken(token) {
            this.api.token = token
            this.onChange()
        },
        onChange () {
            this.$forceUpdate()
            this.$emit("change", this.api, this.databinding)
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

            editor.getSession().on('change', () => {
                this.setTemplate()
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
  

        async run(data) {     
            try {
                const request = {
                    method: 'POST',
                    authType: 'Bearer',
                    headers: [],
                    output: {
                        databinding: "API", 
                        template: "", 
                        type: "TEXT", 
                        rawAsFallBack: true,
                        hints: {}
                    },
                    input: {
                        type: "JSON", 
                        fileDataBinding: "", 
                        template: this.api.template
                    },
                    token: this.api.token,
                    isProxyEnabled: this.api.isProxyEnabled,
                    url: this.api.url
                }
                // some webhook return "Accepted" or so as text.
         
                let response = await RestEngine.run(request, data , this.hash, this.app.id, false);           
                try {
                    response = JSON.parse(response)
                } catch(err) {
                    this.logger.error('run() could not handle response', response)
                }
                return {
                    data: response
                }
            } catch (e) {
                console.debug(e)
                return {
                    error: "Something wrong with the data"
                }
            }


        },
        isValidToRun() {
            return this.api.url !== undefined 
                && this.api.template !== undefined
        },
  
        getInputData(data, key) {
            if (data[key]) {
                return data[key]
            }            
        }
    },
    watch: {
        // a(v) {
        //     this.rest = v
        // }
    },
    mounted() {
        this.logger = new Logger("WebHookSettings")
        if (this.api && !this.api.template) {
            this.api.template = '{}'
        } 
        if (this.api && this.api.isProxyEnabled === undefined) {
            this.api.isProxyEnabled = true
        }
        if (this.api && this.api.url === undefined) {
            this.tab = 'setup'
        }
    }
}
</script>