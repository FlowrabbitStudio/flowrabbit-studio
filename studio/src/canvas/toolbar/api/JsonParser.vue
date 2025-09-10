
<template>
    <div class="" v-if="api && databinding">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <div>
                <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Input & Output</a>
            </div>
        </div>

        <template v-if="tab === 'input'">
          
            <div class="form-group" v-if="this.api">
                    <label>Input Variable</label>
                    <Combo 
                        :value="databinding.input" 
                        @change="setInput" 
                        :hints="hints" 
                        :fireOnBlur="true" 
                        :formControl="true"
                        :isDropDown="true" 
                        placeholder="Where the data will be stored" />
                </div>

            <div class="form-group" v-if="this.api">
                <label>Output Variable</label>
                <Combo 
                    :value="databinding.output" 
                    @change="setOutput" 
                    :hints="hints" 
                    :fireOnBlur="true" 
                    :formControl="true"
                    :isDropDown="true" 
                    placeholder="Where the data will be stored" />
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
        'Combo': Input
    },
    computed: {
        isFilled() {
            return this.api.url
        }
    },
    methods: {
       
        setInput (v) {
            this.databinding.input = v
            this.onChange()
        },
       
        setOutput (v) {
            this.databinding.output = v
            this.onChange()
        },

        onChange() {
            this.$emit("change", this.api, this.databinding);
            this.$forceUpdate()
        },

        async run(data) {     
            const txt = data.testJSON
            try {
                const result = this.parse(txt)
                console.debug('result', result)
                return {
                    data:result
                }      
            } catch (e) {
                console.error('JsonParserEngine.run() > error', e)
                return {
                    "error": e.message
                }
            }

        },

        parse(txt) {
            let jsonStart = txt.indexOf('[');
            let jsonEnd = txt.lastIndexOf(']');
            if (jsonStart === -1 || jsonEnd === -1) {
                jsonStart = txt.indexOf('{');
                jsonEnd = txt.lastIndexOf('}');
            }            
            if (jsonStart === -1 || jsonEnd === -1) {           
                return 
            }            
            const jsonString = txt.substring(jsonStart, jsonEnd + 1);
            const parsed = JSON.parse(jsonString);
            return parsed;
        },

        isValidToRun() {
            return true
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
        this.logger = new Logger("JsonParser")
        if (this.api && (!this.api.input || this.api.input.length === 0)) {
            this.api.input = [
                {    
                        "id": "testJSON",
                        "label": "Text",
                        "isVar": false,
                        "type": "Parameter",
                        "widget": "TextArea",
                        "value": '',
                }
            ]
            this.onChange()
        }
    }
}
</script>