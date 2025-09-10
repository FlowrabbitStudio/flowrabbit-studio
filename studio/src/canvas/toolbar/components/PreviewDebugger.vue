
<template>
    <div class="MatcPreviewDebugger">
        <div class="MatcPreviewDebuggerIcon" @click="onOpen" v-if="!isOpen">
            <span class="mdi mdi-database-search-outline"></span>
        </div>

        <div class="MatcPreviewDebuggerContent" v-if="isOpen">
            <div class="MatcPreviewDebuggerContentHeader">
                <span>Variables</span>
                <div @click="onClose" class="mdi mdi-close"></div>
            </div>
            <div class="MatcPreviewDebuggerContentBody">
                <JSONVisualizer :jsonData='viewModel' :init="false"></JSONVisualizer>
            </div>

        </div>
   </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DataBindingService from '../../../services/DataBindingService'
import JSONPath from '../../../core/JSONPath'
import JSONVisualizer from './JSONVisualizer.vue'

export default {
   name: 'PreviewDebugger',
   mixins:[DojoWidget],
   data: function () {
       return {
            isOpen: false,
            paths: [],
            data: {}
       }
   },
   components: {
    'JSONVisualizer': JSONVisualizer
   },
   computed: {
        viewModel () {
            console.debug(this.data)
            const result = {}
            this.paths.forEach(p => {
                let value = JSONPath.get(this.data, p)
                JSONPath.set(result, p, value)
            });

            return result
        }
   },
   methods: {
        setData (str) {
            try {
                if (str.indexOf) {
                    this.data = JSON.parse(str)
                }

            } catch (err) {
                console.error(str)
                console.error(err)
            }
        },
        setModel (m) {
            this.model = m
            this.paths = DataBindingService.getAllBindingPaths(m, 'none')
            this.paths.sort((a,b) => {
                return a.localeCompare(b)
            })
        },
        onOpen() {
            this.isOpen = true
            localStorage.setItem('previewDebugger', 'true')
            this.emit('open')
        },
        onClose() {
            this.isOpen = false
            localStorage.setItem('previewDebugger', 'false')
            this.emit('close')
        }
   },
   mounted () {
        this.isOpen = localStorage.getItem('previewDebugger') === 'true'
   }
}
</script>