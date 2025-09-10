<template>
    <div class="" v-if="api && databinding">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <div>
                <a @click="tab = 'input'" :class="{ 'MatcToolbarTabActive': tab === 'input' }">Input</a>
                <a @click="tab = 'output'" :class="{ 'MatcToolbarTabActive': tab === 'output' }">Output</a>
                <a @click="tab = 'setup'" :class="{ 'MatcToolbarTabActive': tab === 'setup' }">Setup</a>
            </div>
        </div>

        <template v-if="tab === 'output'">
            <div class="form-group" v-if="this.api.template">
                <label>Output Variable</label>
                <Combo 
                    :value="databinding.output" 
                    @change="setOutput" 
                    :hints="hints" 
                    :fireOnBlur="true"
                    :formControl="true" 
                    :isDropDown="true" 
                    placeholder="The variable where the data will be stored"
                />
            </div>
            <div class="form-group" v-if="this.api.template">
                <label>Loading Variable</label>
                <Combo 
                    :value="databinding.loading" 
                    @change="setLoading" 
                    :hints="hints" 
                    :fireOnBlur="true"
                    :formControl="true" 
                    :isDropDown="true" 
                    placeholder="The variable to contain the loading status"
                />
            </div>
        </template>


        <template v-if="tab === 'input'">

            <div class="form-group">
                <label>Input</label>
                <Combo 
                    :value="databinding.input" 
                    @change="setInput" 
                    :hints="hints" 
                    :fireOnBlur="true"
                    :formControl="true" 
                    :isDropDown="true" 
                    placeholder="The variable conaining the query" 
                />

            </div>

            <div class="form-group">
                <label>Documents ({{ collectionName }})</label>
                <DocumentList 
                    :docs="docs" 
                    :deleting="isDeleting"
                    :status="uploadStatus" 
                    @upload="onUploadDoc" 
                    @delete="onDeleteDoc"
                    :loading="isUploading"
                    v-if="api.collectionID" 
                />
            </div>
        </template>


        <template v-if="tab === 'docs'">

            <div class="form-group">
                <label>Documents</label>


            </div>

        </template>

        <template v-if="tab === 'setup'">

            <div class="form-group">
                <label>API Token</label>

                <TokenInput :appID="app?.id" :value="api.token" @change="setToken" :hints="secretHintsList"
                    :fireOnBlur="true" :formControl="true" :isDropDown="true" placeholder="You API key" />
            </div>


            <div class="form-group" v-if="collections.length">
                <label>Collection </label>

                <Combo :value="api.collectionID" @change="setCollection" :hints="collections" :fireOnBlur="true"
                    :formControl="true" :isDropDown="true" placeholder="Which send to search" />


                <div :class="['VommondTokenInput', { 'VommondTokenInputExpanded': showNewCollection }]">
                    <div class="VommondTokenInputAdd">

                        <p class="MatcHint">
                            Do you want to create a new Collection
                        </p>
                        <div class="MatcFlex MatcGapM">
                            <input :class="['form-control']" v-model="newCollectionName"
                                placeholder="Enter the name of the new collection" />
                            <button :class="['MatcButton MatcButtonPrimary']" @click="createCollection">Create</button>
                        </div>

                    </div>
                </div>

            </div>


            <div class="MatcFlex MatcGapXL">
                <div class="form-group  MatcFlexGrow" v-if="collections.length">
                    <label>Number of results</label>
                    <input :class="['form-control', { 'form-control-error': !isValidK }]" v-model="api.k" @change="setK"
                        placeholder="" />
                </div>

                <div class="form-group MatcFlexGrow" v-if="collections.length">
                    <label>Chunk Size</label>
                    <input :class="['form-control', { 'form-control-error': !isValidChunk }]" v-model="api.chunkSize"
                        @change="setChunkSize" placeholder="" />
                </div>
            </div>


            <div class="form-group" v-if="collections.length">

                <CheckBox v-model="api.returnString" @change="setReturnString" label="Return result is single string" />
            </div>


        </template>
        <div v-if="errorMSG" class="MatcError">
            {{ errorMSG }}
        </div>


    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
import Input from 'common/Input'
import { chunk } from '../../../util/ChunkyFunky'
import ConstantsUtil from "../../../util/ConstantsUtil.js";
import Services from "../../../services/Services.js";
import TokenInput from 'common/TokenInput'
import DocumentList from '../components/DocumentList'
import CheckBox from 'common/CheckBox'
import { Base64 } from 'js-base64';

export default {
    name: 'IONOSRagSettings',
    mixins: [DojoWidget, Util],
    props: ["api", "secretKeys", "app", "hash", "databinding", "hints", "variableHints", "variableAndSecretHints", "secretHints", 'schema'],
    data: function () {
        return {
            tab: 'input',
            errorMSG: "",
            collections: [],
            docs: [],
            hooks: [],
            isValidURL: true,
            isUploading: false,
            isDeleting: false,
            isValidK: true,
            isValidChunk: true,
            showNewCollection: false,
            uploadStatus: null,
            newCollectionName: '',
            supportedFileTypes: ['txt', 'pdf', 'docx']
        }
    },
    components: {
        'Combo': Input,
        //'DropDownButton': DropDownButton,
        'TokenInput': TokenInput,
        'DocumentList': DocumentList,
        'CheckBox': CheckBox
    },
    computed: {
        collectionName() {
            if (this.api.collectionID) {
                const c = this.collections.find(c => c.value === this.api.collectionID)
                if (c) {
                    return c.label
                }
            }
            return '?'
        },
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

        getAuthToken() {
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

        async setCollection(v) {
            const found = this.collections.find(c => c.value === v)
            if (!found) {
                this.showNewCollection = true;
                this.newCollectionName = v
                return

            }
            this.showNewCollection = false
            this.newCollectionName = ""
            this.api.collectionID = v
            this.onChange()
            this.loadDocs()
        },

        async createCollection() {

            const res = await this.fetch(`https://inference.de-txl.ionos.com/collections`, "POST", {
                "type": "collection",
                "properties": {
                    "name": this.newCollectionName,
                    "description": "A flowrabbit collection"
                }
            }, true)

            if (res && res.id) {
                this.collections.push({
                    value: res.id,
                    label: this.newCollectionName
                })
                this.showNewCollection = false
                this.newCollectionName = ''
                this.api.collectionID = res.id
                this.onChange()
                this.loadDocs()
            } else {
                this.errorMSG = "Could not create collection. Please try again."
                return
            }
        },

        setReturnString(v) {
            this.api.returnString = v
            this.onChange()
        },

        setK(e) {
            const v = e.target.value
            if (!this.isInt(v)) {
                this.isValidK = false
                return
            }
            this.isValidK = true
            this.api.k = v * 1
            this.onChange()
        },

        setChunkSize(e) {
            const v = e.target.value
            if (!this.isInt(v)) {
                this.isValidChunk = false
                return
            }
            this.isValidChunk = true
            this.api.chunkSize = v * 1
            this.onChange()
        },

        isInt(value) {
            var er = /^-?[0-9]+$/;
            return er.test(value);
        },

        getDefaultDataBinding() {
            return 'webhook'
        },

        setOutput(v) {
            this.databinding.output = v
            this.onChange()
        },
        setLoading (v) {
            this.databinding.loading = v
            this.onChange()
        },
        setInput(v) {
            this.databinding.input = v
            this.api.input = [
                {
                    "id": v,
                    "label": v,
                    "isVar": false,
                    "type": "Parameter",
                    "value": ''
                }
            ]
            this.onChange()
        },
        setToken(token) {
            this.api.token = token
            this.onChange()
            this.loadCollections()
        },

        onChange() {
            this.$forceUpdate()
            this.$emit("change", this.api, this.databinding)
        },

        async onDeleteDoc(doc) {
            this.isDeleting = true
            if (this.docsById[doc.flwID]) {
                const siblings = this.docsById[doc.flwID]
                this.logger.warn('onDeleteDoc', "Delete " + siblings.length + " for " + doc.flwID)
                for (let key in siblings) {
                    const d = siblings[key]
                    await this.fetch(`https://inference.de-txl.ionos.com/collections/${this.api.collectionID}/documents/${d.id}`, "DELETE", null, false)
                }
            } else {
                await this.fetch(`https://inference.de-txl.ionos.com/collections/${this.api.collectionID}/documents/${doc.id}`, "DELETE", null, false)
            }
            await this.loadDocs()
            this.isDeleting = false
        },

        async onUploadDoc(fileList) {


            fileList = fileList.filter(f => {
                const type = f.name.split('.')[1]
                if (type && this.supportedFileTypes.indexOf(type.toLowerCase()) >= 0) {
                    return true
                } else {
                    this.showError(`".${type}" files are not supported`)
                }
            })

            if (fileList.length === 0){
                return
            }

            this.isUploading = true
            this.uploadCount = fileList.length
            this.uploadTotal = fileList.length
            this.uploadStatus = {
                total: this.uploadTotal,
                done: this.uploadCount
            }
            for (let f of fileList){
                const content = await this.getFileContent(f)
                if (content) {
                    this.uploadDoc(f, content)
                } else {
                    this.onUploadDone()
                }
            }
        },

        getFileContent(f) {
            const type = f.name.split('.')[1]
            return new Promise( async(resolve, reject) => {
                try {
                    if (type && type.toLowerCase() === 'txt') {
                        const reader = new FileReader();
                        reader.onload = () => {
                            resolve(reader.result)
                        }
                        reader.readAsText(f);
                    } else if (type && type.toLowerCase() === 'pdf' || type.toLowerCase() === 'docx') {
                        const txt = await this.parseDocument(f)
                        resolve(txt)
                    } else {
                        this.logger.error("getFileContent", "Wrong file type", type)
                        resolve("")
                    }
                } catch (err) {
                    this.logger.error("getFileContent", "Something went wrong", err)
                    reject("")
                }
            })
            
        },

        async parseDocument(file) {

            return new Promise(async (resolve, reject) => {
                const formData = new FormData();         
                formData.append("doc", file);  
                const headers = {}
                headers['Accept'] = 'application/json'
                headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HASH] = this.hash;
                headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_APP_ID] = this.app.id;
                    
                fetch(`${Services.getConfig().node_URL}` + "/doc-to-text", {
                    method: "POST",
                    mode: "cors",
                    cache: "no-cache",
                    headers: headers,
                    redirect: "follow",
                    referrer: "no-referrer",
                    body: formData,
                })
                .then((response) => {
                    response.json().then((data) => resolve(data.text));
                })
                .catch((e) => {
                    reject(e);
                });
            });
        },


        showError (msg) {
            this.errorMSG = msg
            setTimeout(()=>{
                this.errorMSG =''
            }, 3000)
        },

        async uploadDoc(f, txt) {
            const now = new Date().getTime()

            let chunks = [txt]
            if (this.api.chunkSize > 0) {
                const size = this.api.chunkSize
                chunks = chunk(txt, size)
                this.logger.log(-1, "uploadDoc", " Chunk into ", chunks.length)
            }

            const data = {
                "type": "collection",
                "items": [
                ]
            }

            chunks.forEach((c, i) => {
                const id = `${f.name}_flw_${now}`
                const base64 = Base64.encode(c);
                data.items.push(
                    {
                        "type": "document",
                        "properties": {
                            "name": id,
                            "description": "This is a document about lorem ipsum",
                            "contentType": "text/plain",
                            "content": base64,
                            "labels": {
                                "chunk": i
                            }
                        }
                    }
                )
            })
            const res = await this.fetch(`https://inference.de-txl.ionos.com/collections/${this.api.collectionID}/documents`, "PUT", data)
            if (!res) {
                this.errorMSG = "Upload failed. Please try again"
            }
            this.onUploadDone()
        },

        async onUploadDone(){
            this.uploadCount--
            this.uploadStatus = {
                total: this.uploadTotal,
                done: this.uploadCount
            }
            if (this.uploadCount === 0) {
                await this.loadDocs()
                this.isUploading = false
                this.uploadTotal = 0
                this.uploadStatus = null
            }
        },

        async loadDocs() {
            if (!this.api.token) {
                this.logger.log(-1, "loadDocs", "exit > no ready")
                return
            }
            if (!this.api.collectionID) {
                this.logger.log(-1, "loadDocs", "exit > no ready")
                return
            }
            const items = await this.loadDocsInBatches()
            this.logger.log(-3, "loadDocs", `found > ${items.length} raw documents`)
            const docs = items.map(d => {
                return this.mapDoc(d)
            })

            this.docsById = {}
            docs.forEach(d => {
                if (!this.docsById[d.flwID]) {
                    this.docsById[d.flwID] = []
                }
                this.docsById[d.flwID].push(d)
            })

            this.docs = docs
            this.docs = docs.filter(d => {
                if (d.chunk !== undefined) {
                    return d.chunk === "0"
                }
                return true
            })
            this.docs.forEach(d => {
                if (this.docsById[d.flwID]) {
                    d.numChunks = this.docsById[d.flwID].length
                }
            })


        },

        async loadDocsInBatches(limit = 1000, max = 10000) {
            let items = []
            for (let offset = 0; offset < max; offset += limit) {
                // fixme, we cpould still minibatch this here...
                this.logger.log(-3, "loadDocsInBatches", `laod from offset ${offset}`)
                const res = await this.fetch(`https://inference.de-txl.ionos.com/collections/${this.api.collectionID}/documents?limit=${limit}&offset=${offset}`)
                if (res && res.items) {
                    items = items.concat(res.items)
                    if (res.items.length === 0 || res.items.length < limit) {
                        return items
                    }
                }
            }
            return items
        },

        async loadCollections() {
            if (!this.api.token) {
                this.logger.log(-1, "loadCollections", "exit > no ready")
                return
            }
            const res = await this.fetch('https://inference.de-txl.ionos.com/collections', 'GET')
            if (res && res.items) {
                this.collections = res.items.map(c => {
                    return {
                        value: c.id,
                        label: c?.properties.name,
                    }
                })
            }
            if (!this.api.collectionID && this.collections.length > 0) {
                this.api.collectionID = this.collections[0].id
            }
            this.loadDocs()
        },


        async fetch(url, method, data, returnJson = true) {
            const authToken = this.getAuthToken()

            // why does this not work with proxy???
            const headers = {}
            headers['Authorization'] = `Bearer ${authToken}`
            headers['Content-Type'] = 'application/json'
            headers['Accept'] = 'application/json'
            if (headers) {
                let headerKeys = Object.keys(headers).join(';')
                headers['x-flowrabbit-headers'] = headerKeys
            }
            headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HOST] = url;
            headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_HASH] = this.hash;
            headers[ConstantsUtil.flowrabbitHeaders.HEADER_FLOWRABBIT_APP_ID] = this.app.id;

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

                const response = await fetch(this.proxyURL, request)

                if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
                    this.errorMSG = this.getNLS("wizards.errors.token")
                    return
                }
                if (returnJson) {
                    return await response.json()
                }
            } catch (err) {
                this.logger.error("fetch", "Could not load", err)
                this.errorMSG = this.getNLS("wizards.errors.network")
            }
        },

        mapDoc(d) {
            return {
                id: d.id,
                name: this.mapName(d.properties.name),
                flwID: d.properties.name,
                created: d.metadata.createdDate,
                content: Base64.decode(d.properties.content),
                chunk: d.properties?.labels?.chunk
            }
        },

        mapName(name) {
            if (name.indexOf('_flw_')) {
                return name.split('_flw_')[0]
            }
            return name
        },

        async run(data) {
            const query = data[this.databinding.input]
            if (!query) {
                return {
                    error: "No query passed"
                }
            }
            try {
                const response = await this.fetch(`https://inference.de-txl.ionos.com/collections/${this.api.collectionID}/query`, 'POST', {
                    "limit": this.api.k,
                    "query": query
                })
                if (response && response?.properties?.matches) {
                    const matches = response.properties.matches.map(d => {
                        return this.mapDoc(d.document)
                    })
                    if (this.api.returnString) {
                        const str = matches.map(d => {
                            return d.content
                        }).join('.\n\n ')
                        return {
                            data: str
                        }

                    } else {
                        return {
                            data: matches
                        }
                    }
                }
            } catch (err) {
                return {
                    error: "something went wrong"
                }
            }
        },

        isValidToRun() {
            return this.api.token !== undefined
                && this.api.k !== undefined
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
    async mounted() {
        this.logger = new Logger("IONOSRagSettings")
        const url = await Services.getConfig().proxy_URL
        this.proxyURL = url + `/proxy`;
        if (this.api && !this.api.template) {
            this.api.template = '{}'
        }
        if (this.api && !this.api.k == undefined) {
            this.api.k = 5
        }
        if (this.api && !this.api.chunkSize == undefined) {
            this.api.chunkSize = 2000
        }

        if (this.api && !this.api.input) {
            this.api.input = []
        }
        if (this.api && !this.api.returnString === undefined) {
            this.api.returnString = true
        }


        if (this.api && this.api.token) {
            this.loadCollections()
        }
        if (!this.api.collectionID || !this.api.token) {
            this.tab = 'setup'
            return
        }
        console.debug(Services.getConfig())
    }
}
</script>