
<template>
    <div class="">
        <div class="form-group">
            <label>API Token</label>
            <Combo :value="token" @change="setToken" :hints="secretHints" :fireOnBlur="true" :formControl="true"
                :isDropDown="true" placeholder="You API key" />
        </div>

        <div class="form-group">
            <label>Airtable URL</label>
            <input v-model="url" class="MatcIgnoreOnKeyPress form-control" placeholder="Copy the url from the browser, e.g: https://airtable.com/.../..../...?blocks=hide" />
        </div>

        <div class="form-group">
            <label>Operation</label>
            <div class="MatcSegmentButtonInline">
                
                <SegmentButton :value="operation" @change="setOperation" :options="operations" />
            </div>
      
        </div>

        <div class="MatcButtonBar">
            <div class="MatcButton" :disabled="!isFilled" @click="importSchema">Import</div>
            <span v-show="errorMSG && errorMSG.length > 0" class="MatcError">{{ errorMSG }}</span>
        </div>


    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
import Input from 'common/Input'
import DropDownButton from 'page/DropDownButton'
import * as Airtable from './Airtable'

export default {
    name: 'RestSettings',
    mixins: [DojoWidget, Util],
    props: ["rest", "secretKeys", "app"],
    data: function () {
        return {
            operations: [
                {value: "readTable", label: "Read Table"},
                {value: "createRow", label: "Create Row"},
                {value: "readRow", label: "Read Row"},
                {value: "updateRow", label: "Update Row"},
                {value: "deleteRow", label: "Delete Row"},
            ],
            operation: "readTable",
            errorMSG: "",
            token: "",
            url: ""
        }
    },
    components: {
        'Combo': Input,
        'SegmentButton': DropDownButton
    },
    computed: {
        isFilled() {
            return this.token.length > 0 && this.url.length > 0
        },
        secretHints() {
            const result = []
            if (this.secretKeys) {
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
    },
    methods: {
        setOperation (m) {
            this.operation = m
        },
        setToken(token) {
            this.token = token
        },
        async importSchema() {
            if (!this.isFilled) {
                this.errorMSG = this.getNLS("wizards.errors.fill-all")
                return
            }
            const parts = this.url.split('/')
            if (parts.length < 5) {
                this.errorMSG = this.getNLS("wizards.errors.url")
                return
            }

            const baseId = parts[3]
            const tableIdOrName = parts[4]
            const record = await this.get(baseId, tableIdOrName)
            if (record && record.fields) {
                const fields = record.fields
                const result = Airtable.build(this.token, baseId, tableIdOrName, this.operation, fields)
                this.$emit("change", result)
            }
        },

        async get(baseId, tableIdOrName) {
            this.logger.log(-1, 'get', baseId, tableIdOrName)

            let authToken = this.token
            if (this.token.indexOf("${secrets") > -1) {
                const secretKey = this.token.slice(10, -1)   
                const foundSecret = this.secretKeys.find(s => s.key === secretKey)
                if (foundSecret) {
                    this.logger.log(-1, 'get', "user secret", secretKey)
                    authToken = foundSecret.value
                }
          
            }
        

            const url = `https://api.airtable.com/v0/${baseId}/${tableIdOrName}/?maxRecords=1`
            const headers = {}
            headers['Authorization'] = `Bearer ${authToken}`
            headers['Content-Type'] = 'application/json'
            headers['Accept'] = 'application/json'

            try {
                const response = await fetch(url, {
                    method: "GET",
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: headers,
                    redirect: 'follow',
                    referrer: 'no-referrer'
                })

                if (response.status !== 200) {
                    this.errorMSG = this.getNLS("wizards.errors.token")
                    return
                }

                const data = await response.json()
                if (!data.records || data.records.length == 0) {
                    this.errorMSG = this.getNLS("wizards.errors.no-row-in-table")
                    return
                }
                return data.records[0]

            } catch (err) {
                this.logger.error("get", "Could not load")
                this.errorMSG = this.getNLS("wizards.errors.network")
            }
        }
    },
    watch: {
        rest(v) {
            this.rest = v
        }
    },
    mounted() {
        this.logger = new Logger("AirtableRestWizard")
        this.token = this.rest.token
        this.url = this.rest.url
    }
}
</script>