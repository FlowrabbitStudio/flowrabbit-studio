
<template>
    <div class="" v-if="api && databinding">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <div>
                    <a @click="tab='setup'" :class="{'MatcToolbarTabActive': tab === 'setup'}">Setup</a>
                    <!-- <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Parameters</a> -->
                </div>
        </div>


        <template v-if="tab === 'setup'">

                <div class="form-group">
                    <label>API Token</label>
                    <Combo :value="api.token" @change="setToken" :hints="secretHintsList" :fireOnBlur="true" :formControl="true"
                        :isDropDown="true" placeholder="You API key" />
                </div>

                <div class="form-group" v-if="folders">
            
                    <div class="form-group">
                        <label>Folder</label>
     
                        <div class="MatcSegmentButtonInline">                            
                            <DropDownButton 
                                :value="api.folderId" 
                                @change="setFolder" 
                                :options="folders" />
                        </div>                
                    </div>

                </div>

                <div v-if="isLoading">
                    <span class="MatcHint">{{getNLS('common.loading')}}</span>
                </div>

                

                <template v-if="spreadsheets && !isLoading && spreadsheets">
                    <div class="form-group">
                        <label>Spreadsheet</label>
                        <div class="MatcSegmentButtonInline">                            
                            <DropDownButton 
                                :value="api.spreadsheetId" 
                                @change="setSpreadsheet" 
                                :options="spreadsheets" />
                        </div>                
                    </div>
                </template>


                <template v-if="api.spreadsheetId && !isLoading && pages">
                    <div class="form-group">
                        <label>Page</label>
                        <DropDownButton 
                                :value="api.pageId" 
                                @change="setPage" 
                                :options="pages" />
                    </div>
                </template>

                <template v-if="api.spreadsheetId && !isLoading && tables">
                    <div class="form-group">
                        <label>Table</label>
                        <DropDownButton 
                                :value="api.tableId" 
                                @change="setTable" 
                                :options="tables" />
                    </div>
                </template>


                <template v-if="api.tableId && !isLoading">
                    <div class="form-group">
                        <label>Range</label>
                        <input class="form-control" :value="api.range" @change="setRange"/>
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
        </template>
       


    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
import Input from 'common/Input'
import DropDownButton from 'page/DropDownButton'
import APIInputs from './APIInputs.vue'

export default {
    name: 'RowsSettings',
    mixins: [DojoWidget, Util],
    props: ["api", "secretKeys", "app", "databinding", "hints",  "variableHints", "variableAndSecretHints", "secretHints"],
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
            folders: null,
            spreadsheets: null,
            tables: null,
            pages: null,
            isLoading: false,
            abc: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
        }
    },
    components: {
        'Combo': Input,
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
        setRange (e) {
            const value = e.target.value
            if (value.split(':').length != 2) {
                this.errorMSG = 'Not a valid range. Example A1:B4'
                return
            } 

            const parts = value.split(':')
            const startChar = parts[0].replace(/[0-9]/g, "")
            const endChar = parts[1].replace(/[0-9]/g, "")
            const startOffset = this.abc.indexOf(startChar)
            const endOffset = this.abc.indexOf(endChar)
            if (startOffset < 0 || endOffset < 0) {
                this.errorMSG = 'Not a valid range. Example A1:B4'
                return
            }
            this.errorMSG = ''

            this.api.range = value.toUpperCase()
            this.onChange()
        },
        async setPage (v) {
            this.api.pageId = v
            await this.getTables()
            this.onChange()
        },
        setTable (v) {
            this.api.tableId = v
            this.onChange()
        },
        async setSpreadsheet (v) {
            this.api.spreadsheetId = v
            await this.getPages();
            this.onChange()
        },
        async setFolder (v) {
            this.api.folderId = v
            await this.getSpreadsheets()
            this.onChange()
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
        setToken(token) {
            this.api.token = token
            this.getWorkspaces()
            this.onChange()
        },
        onChange () {
            this.$forceUpdate()
            this.$emit("change", this.api, this.databinding)
        },

        async getWorkspaces () {
            this.logger.log(-1, 'getWorkspaces')
            this.errorMSG = ''
            this.isLoading = true
      
            let response = await this.fetch( "https://api.rows.com/v1/workspaces")
       
            if (!response) {
                this.errorMSG = "Can't load workspace. Please check the token."
                this.isLoading = false
                return
            }
            this.api.workspaceId = response.id

            response = await this.fetch("https://api.rows.com/v1/folders?offset=0&limit=100")
            if (!response) {
                this.errorMSG = "Can't load folder. Please check the token."
                this.isLoading = false
                return
            }
            this.folders = response.items.map(i => {
                return {value: i.id, label: i.name}
            })
            if (!this.api.folderId) {
                this.api.folderId = this.folders[0].value
            }

            await this.getSpreadsheets()


            this.isLoading = false
        },

        async getSpreadsheets () {
            if (!this.api.folderId) {
                return
            }
            let response = await this.fetch(`https://api.rows.com/v1/spreadsheets?folder_id=${this.api.folderId}&offset=0&limit=100`)
            this.spreadsheets = null
            if (!response) {
                this.errorMSG = "Can't load spreadsheets. Please check the token."
                this.isLoading = false
                return
            }

            this.spreadsheets = response.items.map(i => {
                return {value: i.id, label: i.name}
            })

            if (!this.api.spreadsheetId && this.spreadsheets.length > 0) {
                this.api.spreadsheetId = this.spreadsheets[0].value
            }

            await this.getPages()
        },

        async getPages() {
            if (!this.api.spreadsheetId) {
                return
            }

            this.pages = null
            const response = await this.fetch(`https://api.rows.com/v1/spreadsheets/${this.api.spreadsheetId}`)

            if (!response) {
                this.errorMSG = "Can't load pages. Please check the token."
                this.isLoading = false
                return
            }

            this.pages = response.pages.map(p => {
                return {value: p.id, label: p.name}
            })

            if (!this.api.pageId && this.pages.length > 0) {
                this.api.pageId = this.pages[0].value
            }
         
            this.getTables()
        },

        async getTables() {
            if (!this.api.pageId || !this.api.spreadsheetId) {
                return
            }
      
            this.tables = null
            const response = await this.fetch(`https://api.rows.com/v1/spreadsheets/${this.api.spreadsheetId}`)
            if (!response) {
                this.errorMSG = "Can't load tables. Please check the token."
                this.isLoading = false
                return
            }
            const page = response.pages.find(p => p.id === this.api.pageId)
            if (page && page.tables) {
                this.tables = page.tables.map(t => {
                    return {value: t.id, label: t.name}
                })
            }

            if (!this.api.tableId && this.tables.length > 0) {
                this.api.tableId = this.tables[0].value
            }

        },

      
        async fetch(url, method, data) {
            const authToken = this.getAuthToken()

            const headers = {}
            headers['Authorization'] = `Bearer ${authToken}`
            headers['Content-Type'] = 'application/json'
            headers['Accept'] = 'application/json'

            try {
                const request = {
                    method: method,
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: headers,                    
                    redirect: 'follow',
                    referrer: 'no-referrer'
                }
                if (data) {
                    request.body = JSON.stringify(data)
                }
                const response = await fetch(url, request)
                if (response.status !== 200) {
                    this.errorMSG = this.getNLS("wizards.errors.token")
                    return
                }

                return await response.json()
            } catch (err) {
                this.logger.error("get", "Could not load")
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

        async run() {
            const response = await this.fetch(`https://api.rows.com/v1/spreadsheets/${this.api.spreadsheetId}/tables/${this.api.tableId}/values/${this.api.range}`)
            if (!response) {
                return
            }

            const abc = this.abc

            const parts = this.api.range.split(':')
            const startChar = parts[0].replace(/[0-9]/g, "")
            const startOffset = abc.indexOf(startChar)
 
            const result = response.items.map(row => {
                const item = {}
                row.forEach((value, index) => {
                    const i = index + startOffset
                    item[abc[i]] = value
                }) 
                return item
            })

            return {
                data: result
            }
        },
        isValidToRun() {
            return this.api.spreadsheetId !== undefined 
                && this.api.tableId !== undefined
                && this.api.token !== undefined
                && this.api.range !== undefined
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
        this.logger = new Logger("RowsSettings")
        if (this.api && !this.api.token) {
            if (this.secretKeys) {
                const found = this.secretKeys.find(s => s.domain === 'https://api.rows.com')
                if (found) {
                    this.api.token = '${secrets.' + found.key + '}'
                }
            }
        }
        if (this.api && this.api.token) {
            this.getWorkspaces()
        }
    }
}
</script>