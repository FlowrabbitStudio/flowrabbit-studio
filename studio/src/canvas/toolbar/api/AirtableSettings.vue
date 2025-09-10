
<template>
    <div class="" v-if="api && databinding">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <div>
                    <a @click="tab='setup'" :class="{'MatcToolbarTabActive': tab === 'setup'}">Setup</a>
                    <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Parameters</a>
                </div>
        </div>


        <template v-if="tab === 'setup'">

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
                        domain="api.airtable.com"
                        placeholder="You API key" 
                    />
                </div>

                <div class="form-group" v-if="bases">
            
                    <div class="form-group">
                        <label>Data bases</label>
     
                        <div class="MatcSegmentButtonInline">                            
                            <DropDownButton 
                                :value="api.tableIdOrName" 
                                @change="setBase" 
                                :options="bases" />
                        </div>                
                    </div>

                </div>

                <div v-if="isLoading">
                    <span class="MatcHint">{{getNLS('common.loading')}}</span>
                </div>
                <template v-if="api.baseId && !isLoading">
                    <div class="form-group">
                        <label>Operation</label>
                        <div class="MatcSegmentButtonInline">                            
                            <DropDownButton 
                                :value="api.operation" 
                                @change="setOperation" 
                                :options="operations" />
                        </div>                
                    </div>


                    <div class="form-group">
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

                <div v-if="errorMSG" class="MatcError">
                    {{errorMSG}}
                </div>
           

           
        </template>

        <template v-if="tab === 'input'">
            <APIInputs 
                    :api="api" 
                    :databinding="databinding" 
                    :secretKeys="secretKeys" 
                    :variableAndSecretHints="variableAndSecretHints"
                    :variableHints="variableHints"
                    :hints="hints"
                    :app="app" 
                    @change="setElementValue"
                    />
            <div v-if="errorMSG" class="MatcError">
                {{errorMSG}}
            </div>
        </template>
    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
import Input from 'common/Input'
import TokenInput from 'common/TokenInput'
import DropDownButton from 'page/DropDownButton'
import APIInputs from './APIInputs.vue'
import RestEngine from 'core/RestEngine'

export default {
    name: 'RestSettings',
    mixins: [DojoWidget, Util],
    props: ["api", "secretKeys", "app", "databinding", "hints",  "variableHints", "variableAndSecretHints", "secretHints", "hash"],
    data: function () {
        return {
            tab: 'setup',
            output: '',
            operations: [
                {value: "readTable", label: "Read Table"},
                {value: "createRow", label: "Create Row"},
                {value: "readRow", label: "Read Row"},
                {value: "updateRow", label: "Update Row"},
                {value: "deleteRow", label: "Delete Row"},
            ],
            operation: "readTable",
            errorMSG: "",
            bases: null,
            isLoading: false
        }
    },
    components: {
        'Combo': Input,
        'TokenInput': TokenInput,
        'DropDownButton': DropDownButton,
        'APIInputs': APIInputs
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
        isInputValid () {
            const errors = []
            this.errorMSG = ''

            // should never happen
            if (!this.api.input) {
                errors.push("Define variables for the inputs")
                this.errorMSG = 'Define variables for the inputs'
                this.tab = 'input'
            }

            const noDataBinding = this.api.input.filter(i => {
                return i.type !== "Parameter" && !i.variable
            })
        
            if (noDataBinding.length > 0) {
                errors.push("Define variables for the inputs")
                this.errorMSG = 'Define variables for the inputs'
                this.tab = 'input'
            }

            return errors
        },
        setElementValue (element, value) {
            const found = this.api.input.find(e => e.id === element.id)
            if (found) {
                if (found.type === 'Parameter') {
                    found.value = value
                } else {
                    found.variable = value
                }

                //this.databinding[element.id] = value
            }

            this.onChange()
        },
        setBase(v) {
            const found = this.bases.find(b => b.value === v)
            if (found) {
                this.api.baseId = found.meta.baseId
                this.api.tableIdOrName = found.meta.tableIdOrName
                this.api.tableLabel = found.label

                if (this.databinding && !this.databinding.default) {
                    this.databinding.default = this.getDefaultDataBinding(found)
                }

                this.onChange()
            }
        },
        getDefaultDataBinding (found) {
            if (found && found?.meta?.table) {
                const name = found.meta.table.name
                return name.replace(/\s+/g, '_')
            }
            return 'airtable'
        },
        setOutput (v) {
            this.databinding.default = v
            this.onChange()
        },
        setOperation (m) {
            this.api.operation = m
            this.updateFields()
            this.onChange()
        },
        setToken(token) {
            this.api.token = token
            this.getBases()
            this.onChange()
        },
        onChange () {
            this.$forceUpdate()
            this.$emit("change", this.api, this.databinding)
        },

        async updateFields () {
            if (!this.api.baseId || !this.api.tableIdOrName || !this.bases) {
                return
            }
            this.isLoading = true
            const found = this.bases.find(b => b.value === this.api.tableIdOrName)
            if (found && found?.meta?.table) {
                const table = found.meta.table
                const fields = table.fields
                const inputs = this.getInputs(this.api.operation, fields, false)
                this.api.input = inputs
            }
            this.isLoading = false
        },

        getInputs (operation, fields) {
            if (operation === "readTable") {
                return [ 
                    {    
                        "id": "pageSize",
                        "label": "Page Size",
                        "isVar": false,
                        "type": "Parameter",
                        "value": 100
                    }
                ]
            }
            if (operation === "readRow" || operation === "deleteRow") {
                return [{    
                    "id": "recordId",
                    "label": "Record ID",
                    "isVar": true
                }]
            }

            const elements = fields.map(field => {
                return {    
                    "id": field.name,
                    "label": field.name,
                    "type": this.guessType(field.type),
                    "isVar": true
                }
            })

            if (operation === "updateRow") {
                elements.push({
                    "id": "recordId",
                    "label": "Record ID",
                    "isVar": true
                })
            }

            return elements
        },

        guessType (fieldType) {
            if (fieldType === 'checkbox') {
                return 'bool'
            }
            if (fieldType === 'number') {
                return 'number'
            }
            return fieldType
        },

        async getBases () {
            this.logger.log(-1, 'getBases')
            this.errorMSG = ''
            this.isLoading = true
            const baseResponse = await this.fetch("https://api.airtable.com/v0/meta/bases", 'GET')
            this.bases = null
            if (baseResponse && baseResponse.bases) {
                let bases = [] 
                for (let b of baseResponse.bases) {
                    const tables = await this.getTables(b)
                    if (tables) {
                        bases = bases.concat(tables)
                    }
                }
                this.bases = bases
            }        
            this.isLoading = false
        },

        async getTables(b) {
            const bases = [] 
            const tableResponse = await this.fetch(`https://api.airtable.com/v0/meta/bases/${b.id}/tables`, 'GET')
                if (tableResponse && tableResponse.tables) {
                    tableResponse.tables.forEach(t => {
                        bases.push({
                            value: t.id,
                            meta: {
                                baseId: b.id,
                                tableIdOrName: t.id,
                                table: t
                            },
                            label: `${b.name} - ${t.name}`
                        })
                      
                    })
            }
            return bases
        },

        async fetch(url, method, data) {
            const authToken = this.getAuthToken()

            const headers = {}
            headers['Authorization'] = `Bearer ${authToken}`
            headers['Content-Type'] = 'application/json'
            headers['Accept'] = 'application/json'

            const request = {
                url: url,
                method: method,
                authType: 'Bearer',
                token: this.api.token,
                headers: [
                    { key: "Content-Type", value: "application/json" }
                ],
                input: {
                    type: "JSON"
                },
                output: {
                    type: "JSON"
                }
            }

            try {
                if (data) {
                    request.body = JSON.stringify(data)
                }
                let response = await RestEngine.run(request, {}, this.hash, this.app.id, true);
                /*if (response.status !== 200) {
                    this.errorMSG = this.getNLS("wizards.errors.token")
                    return
                }*/
                return response;
            } catch (err) {
                this.logger.error("get", "Could not load" + err)
                this.errorMSG = this.getNLS("wizards.errors.network")
            }
        },

      
        getAuthToken(){
            let authToken = this.api.token
            if (authToken.indexOf("${secrets") > -1) {
                const secretKey = authToken.slice(10, -1)   
                const foundSecret = this.secretKeys.find(s => s.key === secretKey)
                if (foundSecret) {
                    this.logger.log(-1, 'get', "user secret", secretKey)
                    authToken = foundSecret.value
                }          
            }
            return authToken
        },

        async run(data) {
            if (this['_run_'+ this.api.operation]) {
                const result = this['_run_'+ this.api.operation](data)
                return result
            }
            this.logger.error('run() not supported operation')
        },
        isValidToRun() {
            //onsole.debug(this.api.baseId !== undefined , this.api.tableIdOrName !== undefined, this.api.token !== undefined, this.api.operation !== undefined)
            return this.api.baseId !== undefined 
                && this.api.tableIdOrName !== undefined
                && this.api.token !== undefined
                && this.api.operation !== undefined
        },
        async _run_readTable(data){
            let pageSize = this.getInputData(data, 'pageSize')
            const url = `https://api.airtable.com/v0/${this.api.baseId}/${this.api.tableIdOrName}/?pageSize=${pageSize}`
            try {
                const data = await this.fetch(url, "GET")
                if (data) {
                    // we remove the records here
                    // because the confuse the auto wiring
                    return {
                        data:data.records
                    }      
                }
            } catch (err) {
                this.logger.error("_run_readTable", "Could not load")       
            }
            return {
                error: this.getNLS("wizards.errors.network")
            }

        },
        async _run_createRow(testData){
            const url = `https://api.airtable.com/v0/${this.api.baseId}/${this.api.tableIdOrName}`
            try {
                const create = this.buildRequest(testData)
                const data = await this.fetch(url, "POST", create)
                if (data) {
                    return {
                        data:data
                    }      
                }
            } catch (err) {
                this.logger.error("_run_createRow", "Could not load")
            }

            return {
                error: this.getNLS("wizards.errors.network")
            }
        },
        async _run_readRow(testData){
            let recordID = this.getInputData(testData, 'recordId')
            const url = `https://api.airtable.com/v0/${this.api.baseId}/${this.api.tableIdOrName}/${recordID}`   
            try {
                const data = await this.fetch(url, "GET")
                if (data) {
                    return {
                        data:data
                    }      
                }
            } catch (err) {
                this.logger.error("_run_deleteRow", "Could not load")
            }

            return {
                error: this.getNLS("wizards.errors.network")
            }
        },
        async _run_updateRow(testData){
            let recordID = this.getInputData(testData, 'recordId')
            const url = `https://api.airtable.com/v0/${this.api.baseId}/${this.api.tableIdOrName}/${recordID}`   
            try {
                const update = this.buildRequest(testData, 'recordId')
                const data = await this.fetch(url, "PATCH", update)
                if (data) {
                    return {
                        data:data
                    }      
                }
            } catch (err) {
                this.logger.error("_run_updateRow", "Could not load")
            }

            return {
                error: this.getNLS("wizards.errors.network")
            }
        },      
        async _run_deleteRow(testData){
            let recordID = this.getInputData(testData, 'recordId')
            const url = `https://api.airtable.com/v0/${this.api.baseId}/${this.api.tableIdOrName}/${recordID}`   
            try {
                const data = await this.fetch(url, "DELETE")
                if (data) {
                    return {
                        data:data
                    }      
                }
            } catch (err) {
                this.logger.error("_run_deleteRow", "Could not load")
            }

            return {
                error: this.getNLS("wizards.errors.network")
            }
        },
        buildRequest (testData, exclude) {
            const request = {
                fields: {
                }                 
            }
            this.api.input.forEach(i => {
                if (i.id !== exclude) {
                    if (testData[i.id] !== undefined) {
                        request.fields[i.id] = this.convertType(testData[i.id], i)
                    } else {
                        console.debug("_run_createRow() > no " + i.id)
                    }
                }              
            })
            return request
        },
        convertType (value, i) {
            if (i.type === 'checkbox') {
                return value === 'true'
            }
            if (i.type === 'bool') {
                return value === 'true'
            }
            if (i.type === 'number') {
                return value * 1
            }
            return value
        },
        getInputData(data, key) {
            if (data[key]) {
                return data[key]
            }            
        }
    },
    watch: {
        a(v) {
            this.rest = v
        }
    },
    mounted() {
        this.logger = new Logger("AirtableSettings")
        if (this.api && !this.api.token) {
            if (this.secretKeys) {
                const found = this.secretKeys.find(s => s.domain === 'api.airtable.com')
                if (found) {
                    this.api.token = '${secrets.' + found.key + '}'
                }
            }
        }
        if (this.api && !this.api.input) {
            this.api.input = []
        }
        if (this.api && this.api.token) {
            this.getBases()
        }
        if (this.api && !this.api.operation) {
            this.api.operation = 'readTable'
        }
    }
}
</script>