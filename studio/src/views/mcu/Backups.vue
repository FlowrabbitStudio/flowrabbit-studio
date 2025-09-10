<template>
 <div>
  	

    <Panel >
        <h1>Backups - Dirty Apps</h1>


        <DataTable :data="dirtyApps" :size="100" :columns="[
          {id:'name', key: 'name', label: 'Name', width: '10%', max:10},
          {id:'created', key: 'created', label: 'Created', width: '10%', value: (row) => printDate(row.created)},
          {id:'lastUpdate', key: 'lastUpdate', label: 'Last Update', width: '10%', value: (row) => printDate(row.lastUpdate)},
          {id:'size', key: 'size', label: 'Size', width: '10%'},
          {id:'isDirty', key: 'isDirty', label: 'Dirty', width: '10%'},
           {id:'lastBackup', key: 'lastBackup', label: 'Last Backup', width: '10%', value: (row) => printDate(row.lastUpdate)},
           //{id:'action-edit', key: 'action', label: '', width: '10%', value: 'Edit', class:'action',  click: (row) => onEditUser(row)},
        ]"/>

    </Panel>


   

  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import DataTable from './DataTable.vue'
import AdminService from './AdminService'
import Services from 'services/Services'

export default {
  props:[''],
  data: function() {
    return {
      mode: 'view',
      events: [],
      searchFilter: '',
      apps: []
    };
  },
  components: {Panel, DataTable},
  computed: {
    dirtyApps () {
      return this.apps.filter(app => app.isDirty)
    }
  },
  methods: {
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
	},
  async mounted () {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
    this.apps = await this.adminService.getAllApps()
  }
}
</script>

