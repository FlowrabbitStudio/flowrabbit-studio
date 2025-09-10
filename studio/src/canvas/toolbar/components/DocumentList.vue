<template>
    <div :class="[{ 'MatcDocListDND': isDragOver }, 'MatcDocList']" @dragstart="onDragStart" @dragover="onDragOver"
        @dragleave="onDragLeave" @drop.stop="onDrop">
        

        <div v-if="deleting" class="MatcDocListHint">
            Deleting...
        </div>
        
        <div v-if="loading" class="MatcDocListHint">
            Uploading... {{uploadStatus}}
        </div>
        <template v-if="!deleting && !loading">
        

            <div v-if="!docs || docs.length == 0" class="MatcDocListHint">
                Drag and Drop files to upload

                <input type="file" class="MatcUploadTrans" accept="text/plain, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document" @change="onUploadFile" multiple/>

            </div>
            <div v-else>

                <table>
                    <thead>
                        <tr>
                            <th>
                                Name
                            </th>
                            <th>
                                Created
                            </th>
                            <th>
                                Chunks
                            </th>
                            
                            <th>
                        
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in docs" :key="d.id">
                            <td>
                                {{d.name}}
                            </td>
                            <td>
                                {{formatDate(d.created)}}
                            </td>
                            <td>
                                {{d.numChunks}}
                            </td>
                            <td class="MatcRemoveIcon">
                                <span class="mdi mdi-close"  @click="removeDoc(d)" ></span>   
                            </td>
                        </tr>
                        <tr>
                            <td colspan="4" class="MatcDocListUploadRow">
                                Drag and Drop files to upload
                                <input type="file" class="MatcUploadTrans" accept="text/plain, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document" @change="onUploadFile" multiple /> 
                            </td>
                        </tr>
                    </tbody>
                    <!-- -->
                </table>
            </div>

        </template>

        
    </div>
</template>
<style lang="scss">
@import '../../../style/scss/doc_list.scss';
</style>
<script>
import Logger from 'common/Logger'


export default {
    name: 'DocumentList',
    mixins: [],
    props: ["docs", "loading", "deleting", "status"],
    data: function () {
        return {
            isDragOver: false
        }
    },
    components: {

    },
    computed: {
        uploadStatus() {
            if (this.status) {
                const left = this.status.total - this.status.done
                const p = (Math.round((left / this.status.total) *100)) + '%'
                return p
            }
            return ""
        }
    },
    methods: {
        formatDate (t, justDate) {
            const date = new Date(t);
            if (justDate) {
                return date.toLocaleDateString();
            }
            return date.toLocaleString();
        },
        onUploadFile (e) {
            const target = e.target
            const files = target.files
            const result = []
			for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if (file.size < 50000000) {
                    result.push(file)
                }
            }
            this.$emit("upload", result)
        },
        onDragStart(e) {
            e.preventDefault()
            e.stopPropagation();
        },
        onDragOver(e) {
            e.preventDefault()
            e.stopPropagation();
            this.isDragOver = true
        },
        onDragLeave(e) {
            e.preventDefault()
            e.stopPropagation();
            this.isDragOver = false
        },
        onDrop(e) {

            e.preventDefault()
            e.stopPropagation();
            this.isDragOver = false
            const dt = e.dataTransfer;
            if (!dt.files) {
                return
            }
            const files = dt.files
            const result = []
			for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if (file.size < 50000000) {
                    result.push(file)
                }
            }
            this.$emit("upload", result)
        },
        removeDoc (d) {
            this.$emit("delete", d)
        }

    },
    watch: {
        docs(v) {
            this.docs = v
        }
    },
    async mounted() {
        this.logger = new Logger("DocumentList")

    }
}
</script>