<template>
    <div class="MatcToolbarDataBindingLinks">
        <div class="MatcToolbarItem MatcToolbarIconButton" v-for="link in links" :key="link.id" @click="onSelectLink(link, $event)">
                <span class="MatcToolbarItemIcon ">
                    <span :class="link.icon" />
                </span>
                <span class="MatcToolbarItemLabel">{{ link.label }}</span>
                <span class="MatcToobarRemoveBtn" v-if="link.line">
                    <span class="mdi mdi-close-circle" @click.stop="onRemoveLink(link)"></span>
                </span>
        </div>
    </div>

</template>
<script>

import DojoWidget from 'dojo/DojoWidget'
export default {
    name: 'DataBindingLinks',
    mixins: [DojoWidget],
    data: function () {
        return {
          label: 'xxx',
          widget: null,
          fromLinks: {}
        }
    },
    components: {
    },
    computed: {
        links () {
            const result = []
            if (this.widget?.type === 'Table') {
                result.push({
                    id: 'filter', 
                    label: this.getLineLabel('filter', 'Select Search'), 
                    icon: 'mdi mdi-magnify', 
                    line:this.fromLinks['filter']
                })
                result.push({
                    id: 'pagination', 
                    label: this.getLineLabel('pagination', 'Select Pagination'), 
                    icon: 'mdi mdi-table-arrow-right', 
                    line:this.fromLinks['pagination']
                })
                result.push({
                    id: 'rest', 
                    label: this.getLineLabel('rest', 'Select Rest'), 
                    icon: 'mdi mdi-progress-download', 
                    action: "TableLoad", 
                    line:this.fromLinks['rest']
                })
                // result.push({
                //     id: 'loaded', 
                //     label: this.getLineLabel('pagination', 'Run on load'), 
                //     icon: 'mdi mdi mdi-progress-downloadt', 
                //     line:this.fromLinks['loaded']
                // })
            }
            if (this.widget?.type === 'Chat') {
                result.push({
                    id: 'llm', 
                    label: this.getLineLabel('llm', 'Select LLM Model'), 
                    icon: 'mdi mdi-magnify', 
                    line:this.fromLinks['llm']
                })
                result.push({
                    id: 'transcription', 
                    label: this.getLineLabel('transcription', 'Select Transcription Model'), 
                    icon: 'mdi mdi-microphone', 
                    line:this.fromLinks['transcription']
                })
            }
            return result
        }
    },
    methods: {

        getLineLabel (id, defaultLabel) {
            if (this.fromLinks[id]) {
                const line = this.fromLinks[id]
                const to = this.model.widgets[line.to]
                if (to) {
                    return to.name
                } else {
                    console.error('DataBindingLinks.getLineLabel() > No to', line.to)
                }
            }
            return defaultLabel
        },

        onRemoveLink (link) {
            this.emit('removeLineById', link.line.id )
        },

        onSelectLink (link, e) {
            if (link.line) {
                this.emit('removeLineById', link.line.id )
            } 
            setTimeout(() => {
                this.emit('newDataBindingLink', this.widget, {variable: link.id}, link.action, e )
            }, 200)

        },

        setModel (m) {
            this.model = m
        },

        setValue(v) {
            this.widget = v
            this.fromLinks = {}
            Object.values(this.model.lines).forEach(line => {
                if (line.from === v.id && line.databinding) {
                    this.fromLinks[line.databinding.variable] = line
                }
            })
            console.debug('DataBindingLinks.setValue() > fromLinks:', this.fromLinks)
        }
    },
    mounted() {
    }
}
</script>