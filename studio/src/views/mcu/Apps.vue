<template>
 <div>
  <Panel :transparent="true">
            <div class="MCUTopBar ">
              <SearchBar v-model="searchFilter" />
            </div>
  </Panel>
  	
    <Panel >
        <h1>Apps</h1>

  

        <DataTable :data="filteredApps" :size="100" :columns="[
          {id:'name', key: 'name', label: 'Name', width: '10%', max:10},
          {id:'created', key: 'created', label: 'Created', width: '10%', value: (row) => printDate(row.created)},
          {id:'lastUpdate', key: 'lastUpdate', label: 'Last Update', width: '10%', value: (row) => printDate(row.lastUpdate)},
          {id:'size', key: 'size', label: 'Size', width: '10%'},
          {id:'isDirty', key: 'isDirty', label: 'Dirty', width: '10%'},
          {id:'lastBackup', key: 'lastBackup', label: 'Last Backup', width: '10%', value: (row) => printDate(row.lastUpdate)},
          {id:'action-edit', key: 'action', label: 'Actions', width: '10%', value: 'Team', class:'action',  click: (row) => onShowTeam(row)},
          {id:'action-delete', key: 'action', label: 'Actions', width: '10%', value: 'Team', class:'action',  click: (row) => onDeleteApp(row)},
        ]"/>
          
    </Panel>

  

  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import DataTable from './DataTable.vue'
import SearchBar from './SearchBar.vue'
import AdminService from './AdminService'
import Services from 'services/Services'

export default {
  props:[''],
  data: function() {
    return {
      searchFilter: '',
      apps: []
    };
  },
  components: {Panel, DataTable, SearchBar},
  computed: {
    dirtyApps () {
      return this.apps.filter(app => app.isDirty)
    },
    filteredApps () {
      if (this.searchFilter.length > 2) {
        let filter = this.searchFilter.toLowerCase()
        return this.apps.filter(app => {
          if (app.name && app.name.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
          if (app.id && app.id.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
          return false
        })
      }
      return this.apps
    }
  },
  methods: {
    async onDeleteApp(app) {      
      await Services.getModelService().deleteApp(app);
    },
    printDate (ms) {
      var date = new Date(ms);
      return date.toLocaleDateString();
    },
    onBackup () {
      this.mode = 'backup'
    },
    onCancel () {
      this.mode = 'view'
    },
    async onShowTeam(row) {
      const team = await this.adminService.getTeamByAppId(row.id)
      let msg = team.map(t => t.email).join(' ')
      alert(msg)
    }
	},
  async mounted () {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
    this.apps = await this.adminService.getAllApps()
   
  }
}
</script>

