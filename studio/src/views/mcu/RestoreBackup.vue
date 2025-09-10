<template>
  <div>


    <Panel>
      <h1>Backups - Restore Backups</h1>

      <div class="form-group">
        <label>APP ID to restore</label>
        <input type="text" class="form-control" v-model="appID">
      </div>



      <div class="MatcButtonBar">
        <a class="MatcButton" @click="restore">Restore</a>
        <a class="MatcLinkButton" href="#/mcu">Cancel</a>

        {{ result }}
      </div>


    </Panel>





  </div>
</template>
   
<script>

import Panel from './Panel.vue'

import AdminService from './AdminService'
import Services from 'services/Services'

export default {
  props: [''],
  data: function () {
    return {
      appID: '',
      result: {}
    };
  },
  components: { Panel },
  computed: {

  },
  methods: {
    printDate(ms) {
      var date = new Date(ms);
      return date.toLocaleDateString();
    },
    async restore() {
      if (this.appID) {
        this.result = ''
        this.result = await this.adminService.restoreBackup(this.appID)
      }
    }
  },
  async mounted() {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
  }
}
</script>
   
   