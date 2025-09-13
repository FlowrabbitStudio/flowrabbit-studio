<template>
  <div class="MatcSettings">
    <section class="MatcSection" aria-label="Published Apps">
          <div class="MatcContent MatcCard ">
              <div class="MatcCardHeader">
                <span>Published Apps</span>
              </div>
              <div class="MatcCardContent ">
                <DataTable :selectable="false" :data="apps" :size="100" :columns="[
                    {id:'name', key: 'name', label: 'Name', width: '30%'},
                    {id:'type', key: 'type', label: 'Type', width: '10%', max:10},
                    {id:'pName', key: 'pName', label: 'Public Name', width: '30%'},
                    {id:'pMode', key: 'pMode', label: 'Mode', width: '10%'},
                    {id:'createdBy', key: 'createdBy', label: 'Creator', width: '30%'},
                    {id:'created', key: 'created', label: 'Created', width: '10%', value: (row) => printDate(row.created)},
                  ]"/>
              </div>
            </div>
    </section>
</div>
</template>

<script>
import { mapState } from "vuex";
import Services from "services/Services";
import DataTable from '../mcu/DataTable.vue'
import AnalyticsService from "services/AnalyticsService";

export default {
  name: "OrganizationApps",
  components: {
    DataTable
  },
  props: {
  },
  data() {
    return {
      apps: []
    };
  },
  computed: {    
    ...mapState(["selectedOrg", "user"]),
  },
  methods: {
    printDate (ms) {
        var date = new Date(ms);
        return date.toLocaleDateString();
    },
  },
  async mounted() {
    const users = await Services.getOrgService().findTeamUsersByOrganization(this.selectedOrg.id)
    const userIDs = {}
    users.forEach(u => {
      userIDs[u.id] = u
    })
    const apps = await Services.getOrgService().findPublishedAppsInOrg(this.selectedOrg.id)
    this.apps = apps.map(a => {
      a.pName = a.pubSettings.name;
      a.pMode = a.pubSettings.mode;
      if (a.createdBy && userIDs[a.createdBy]) {
        a.createdBy = userIDs[a.createdBy].email
      } else {
        a.createdBy = "?"
      }
      return a
    })
    const orgID = this.$route.params.orgId || "private";
    AnalyticsService.log("OrganizationApps", orgID, 'view')
  }
};
</script>