<template>
 <div>

    <Panel :transparent="true">
            <div class="MCUTopBar ">
              <div></div>
                <a class="MatcButton MatcButtonRed" @click="createIndexes">Create Indexes</a>
            </div>
    </Panel>

  	
    <Panel>
      <h1>
        Analytics - DB
      </h1>
      
      <DataTable :data="table" :isSelectable="false" :size="100" :columns="[
          {id:'name', key: 'name', label: 'Collection', width: '20%', max:20},
          {id:'indexes', key: 'indexes', label: 'indexes', width: '70%', type:'array'},
          {id:'count', key: 'count', label: 'Count', width: '10%', max:10, class: (row) => row.name === 'user' ? 'green': ''}
        ]"/>
          
    </Panel>
  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import AdminService from './AdminService'
import Services from 'services/Services'
import DataTable from './DataTable.vue'

export default {
  props:[''],
  data: function() {
    return {
      searchFilter: '',
      overview: [],
      table: []
    };
  },
  components: {Panel, DataTable},
  computed: {
  },
  methods: {
    async createIndexes() {
      const answer = confirm('Are you sure. This might slow down the server')
      if (answer) {
        const res = await this.adminService.updateIndexes()
        console.debug(res)
        this.load()
      }
      
    },
    async load() {
      const overview = await this.adminService.getOverview()
      const indexes = await this.adminService.getIndexes()
      this.table = []
      overview.forEach(collection => {
        const c = collection.name
        if (indexes[c]) {
          let names = indexes[c].indexes
          console.debug(names.map(n => n.replace(n , '')))
          names = names.filter(n =>  n != '_id_').map(n => n.replace(c +'_', ''))
          collection.indexes = names;
        } else {
          collection.indexes = '?'
        }
        this.table.push(collection)
      })
    }
  },
  async mounted () {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
    this.load()
  }
}
</script>

