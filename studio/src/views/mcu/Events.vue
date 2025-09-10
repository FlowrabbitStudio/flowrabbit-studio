<template>
 <div>
  	
    <Panel :transparent="true">
    <div class="MCUTopBar">
            <WeekPicker @change="onChangeWeek" v-model="offset" />
            <SearchBar v-model="searchFilter" />
        </div>
    </Panel>

     <Panel >
        <h1>Events</h1>

       
        <DataTable :data="filteredEvents" :size="100" :columns="[
          {id:'user', key: 'user', label: 'Email', width: '30%'},
          {id:'type', key: 'type', label: 'Type', width: '30%', max:10},
          {id:'value', key: 'value', label: 'Value', width: '30%'},
          {id:'created', key: 'created', label: 'Created', width: '10%', value: (row) => printDate(row.created)},
        ]"/>

    </Panel>

  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import DataTable from './DataTable.vue'
import AdminService from './AdminService'
import Services from 'services/Services'
import SearchBar from './SearchBar.vue'
import WeekPicker from './WeekPicker.vue'

export default {
    props:[''],
    data: function() {
        return {
            day: 1000 * 60 * 60 * 24,
            offset: 0,
            mode: 'view',
            events: [],
            searchFilter: ''
        };
    },
    components: {Panel, DataTable, SearchBar, WeekPicker},
    computed: {
        filteredEvents () {
            if (this.searchFilter.length > 2) {
                let filter = this.searchFilter.toLowerCase()
                return this.events.filter(u => {
                    if (u.user && u.user.toLowerCase().indexOf(filter) >= 0) {
                        return true
                    }
                    if (u.type && u.type.toLowerCase().indexOf(filter) >= 0) {
                        return true
                    }
                    return false
                })
            }
            return this.events
        }
    },
    methods: {
        printDate (ms) {
            var date = new Date(ms);
            return date.toLocaleDateString();
        },
        async onChangeWeek (from, to) {
            this.events = []
            this.events = await this.adminService.getAllAppEvents(from, to, '')
        }
    },
    async mounted () {
        this.adminService = new AdminService()
        this.adminService.setToken(Services.getUserService().getToken())
        let now = new Date().getTime()
        this.events = await this.adminService.getAllAppEvents(now- this.day, now, '')
    }
}
</script>

