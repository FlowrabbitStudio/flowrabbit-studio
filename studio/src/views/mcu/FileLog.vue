<template>
    <div>

        <Panel :transparent="true">
            <div class="MCUTopBar">
                <SearchBar v-model="searchFilter" />
                <QIcon :icon="'mdi mdi-update'" @click="loadLogs" class="MCUAction"/>
            </div>
        </Panel>

        <Panel>
            <h1>Log</h1>

            <div class="MCULogs">
                <div v-for="(line, i) in filteredLog" :key="i" v-html="line">

                </div>
            </div>



        </Panel>


    </div>
</template>

<script>

import Panel from './Panel.vue'
import AdminService from './AdminService'
import Services from 'services/Services'
import SearchBar from './SearchBar.vue'
import QIcon from 'page/QIcon'
export default {
    props: [''],
    data: function () {
        return {
            lines: 1000,
            logs: [],
            searchFilter: ''
        };
    },
    components: { Panel, SearchBar, QIcon },
    computed: {
        filteredLog() {

            if (this.searchFilter.length > 2) {
                let filter = this.searchFilter.toLowerCase()
                return this.logs.filter(l => {
                    if (l.toLowerCase().indexOf(filter) >= 0) {
                        return true
                    }
                    return false
                }).map(l => {
                    return l.replace(new RegExp(filter, 'gi'), '<span class="MCULogsMatch">$&</span>')
                })
            }
            return this.logs.slice()
        },
      
    },
    methods: {
        async loadLogs() {
            const logs = await this.adminService.getLog(this.lines)
            this.logs = logs.filter(l => l != undefined && l != null).map(l => {
                const parts = l.split(' ')
                return parts.slice(0, 4).join(' ') + ' ' + parts.slice(5).join(' ')
            })
        }
    },
    async mounted() {
        this.adminService = new AdminService()
        this.adminService.setToken(Services.getUserService().getToken())
        this.loadLogs()
    }
}
</script>