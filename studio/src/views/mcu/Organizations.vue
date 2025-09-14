<template>
  <div>
    <Panel :transparent="true">
      <div class="MCUTopBar ">
            <SearchBar v-model="searchFilter" @change="onFilter" />
         
            <button class="ml-4 MatcButton MatcButtonPrimary" @click="onCreateOrg">
              Create Organization
            </button>
      </div>
        
    </Panel>
    <Panel>

      <div class="MatcCardContent">
        <h1>Organizations</h1>

        <DataTable :data="data" :size="100" :columns="[
          { id: 'name', key: 'name', label: 'Name', width: '15%', max: 20 },
          { id: 'displayName', key: 'displayName', label: 'Display Name', width: '15%', max: 10 },
          { 
            id: 'status', 
            key: 'status', 
            label: 'Status', 
            width: '10%',
            class: (row) => row.status == 'blocked' ? 'red': 'green'
          },
          { 
            id: 'creditsInMicroCent', 
            key: 'creditsInMicroCent', 
            label: 'Credits ( Euro / Dollar )', 
            width: '20%',
            value: (row) => (printCurrency(row.creditsInMicroCent) + ' '),
            class: (row) => row.creditsInMicroCent == undefined ? 'red': ''
          },          
          {
            id: 'created',
            key: 'created',
            label: 'Created',
            width: '10%',
            value: (row) => printDate(row.created),
          },
          {
            id: 'action-delete',
            key: 'action',
            label: 'Action',
            width: '10%',
            value: 'Delete',
            class: 'action',
            click: (row) => onDeleteOrg(row),
          },
          {
            id: 'action-edit',
            key: 'action',
            label: '',
            width: '10%',
            value: 'Edit',
            class: 'action',
            click: (row, e) => onEditOrg(row, e),
          }
        ]" @load="onLoadPage" @sortyBy="onSortBy" />
      </div>
    </Panel>

    <OrganizationDialog ref="orgDialog"> </OrganizationDialog>
  </div>
</template>

<script>
import Panel from "./Panel.vue";
import DataTable from "./PaginatedDataTable.vue";
import SearchBar from "./SearchBar.vue";
import AdminService from "./AdminService";
import OrganizationDialog from "./OrganizationDialog";
import Services from "services/Services";
import { microCentoToEuro } from "src/util/CreditUtil.js";

export default {
  props: [""],
  data: function () {
    return {
      now: new Date().getTime(),
      searchFilter: "",
      offset: 0,
      limit: 100,
      sortBy:'',
      order:1,
      data: {
          count: 0,
          limit: 30,
          items: []
      }
    };
  },
  components: { Panel, DataTable, SearchBar, OrganizationDialog },
  computed: {
    filteredOrgs() {
      if (this.searchFilter.length > 2) {
        let filter = this.searchFilter.toLowerCase();
        return this.orgs.filter((o) => {
          if (o.name && o.name.toLowerCase().indexOf(filter) >= 0) {
            return true;
          }
          return false;
        });
      }
      return this.orgs;
    },
  },
  methods: {
    onCreateOrg(e) {
      this.$refs.orgDialog.show({}, e, () => {
        this.loadAll();
      });
    },
    onEditOrg(org) {
      this.$router.push(`/mcu/organizations/${org.id}.html`);
    },
    async onDeleteOrg(org) {
      if (org.id === "private") {
        alert("You cannot delete the private org");
        return;
      }
      let isOk = confirm(
        "Do you want to delete user " + org.name + " [" + org.id + "]"
      );
      if (isOk) {
        await this.adminService.deleteOrg(org.id);
        this.loadAll();
      }
    },
    printDomain(row) {
      if (row.domains) {
        return row.domains[0];
      }
      return "-";
    },
    printCurrency (microCent) {
      if (microCent == undefined) {
        return '0.00'
      }
      return (microCentoToEuro(microCent)).toFixed(2)
    },
    printDate(ms) {
      var date = new Date(ms);
      return date.toLocaleDateString();
    },

    onFilter (v) {
        if (v.length > 3) {
            this.searchFilter = v
        } else {
            this.searchFilter = ''
        }
        this.loadAll()
    },
 
    async onLoadPage(page) {
          this.offset = (page - 1) * this.limit 
          this.loadAll()
    },

    async onSortBy(sortBy, order) {
      this.sortBy = sortBy
      this.order = order == 'asc' ? 1 : -1
      this.loadAll()
    },
    
    async loadAll() {
      this.data = await this.adminService.findOrgs(this.offset, this.limit, this.sortBy, this.order, 'name', this.searchFilter);
      this.$root.$emit("Success", "Loaded " +  Math.min(this.limit, this.data.count) + " / " + this.data.count + " orgs");
    },
  },
  async mounted() {
    this.adminService = new AdminService();
    this.adminService.setToken(Services.getUserService().getToken());
    this.loadAll();
  },
};
</script>