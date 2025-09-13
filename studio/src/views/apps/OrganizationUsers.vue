<template>
  <div class="MatcSettings">
    <section class="MatcSection" aria-label="Workspace Details">
      <div class="container MatcCardContainer">
        <div class="MatcCard MatcMarginTopS">
          <div class="MatcCardHeader MatcFlex MatcBetween">
            <p>Team</p>
          </div>
          <div class="MatcCardContent">
            <div class="team-container">
              <div v-if="isLoading" class="loading-indicator">Loading...</div>
              <div v-else>
                <div class="MatcFlex MatcBetween MatcMarginBottomXXL">
                
                  <div class="search-container MatcGapM">
                    <input class="input" v-model="search" placeholder="Search users..." aria-label="Search users" />
                    <button class="MatcButton MatcButtonPrimary"
                      @click="showCreateUserModal">Invite User</button>
                  </div>
                </div>
                <DataTable :selectable="false" :data="filteredTeam" :size="100" v-if="filteredTeam.length" :columns="[
                  { id: 'name', key: 'name', label: 'Name', width: '30%' },
                  { id: 'lastname', key: 'lastname', label: 'Lastname', width: '30%' },
                  { id: 'email', key: 'email', label: 'Email', width: '30%' },
                  { id: 'permission', key: 'permission', label: 'Role', width: '30%', type:'dropdown', options:roles, callback:onChangePermission },
                  {
                    id: 'action-delete',
                    key: 'action',
                    label: 'Action',
                    width: '10%',
                    value: 'Delete',
                    class: 'action',
                    click: (row) => confirmRemoveUser(row),
                  },
                ]" />
                <div v-else class="empty-state">No users available.</div>

    
              </div>
            </div>

            <div>
            </div>
            <ConfirmRemoveDialog @confirm="removeUser" ref="removeUserDialog" />
            <AddUserOrgDialog @confirm="onUserAdded" ref="addUserDialog" />
          </div>
        </div>
      </div>
    </section>
  </div>

</template>

<script>
import AddUserOrgDialog from "../../components/dialogs/AddUserOrgDialog.vue";
import ConfirmRemoveDialog from "../../components/dialogs/ConfirmRemoveDialog.vue";
import Services from "services/Services";
import { mapState } from "vuex";
import { getRoles } from "src/util/Util.js";
import DataTable from "../mcu/DataTable.vue";
import AnalyticsService from "src/services/AnalyticsService.js";

export default {
  name: "OrganizationUsers",
  components: {
    AddUserOrgDialog,
    ConfirmRemoveDialog,
    DataTable,
  },
  data() {
    return {
      search: "",
      team: [],
      showDetails: false,
      selectedUser: {},
      isLoading: true,
      dropdownOpen: null,
      isSidebarLoading: false,

      roles: [
        {value: 1, label: "User"},
        {value: 2, label: "Viewer"},
        {value: 3, label: "Writer"},
        {value: 5, label: "Admin"},
      ]
    };
  },
  computed: {
    ...mapState(["user", "selectedOrg"]),
    filteredTeam() {
      return this.team.filter((user) => {
        const fullName = `${user.name} ${user.lastname}`.toLowerCase();
        return fullName.includes(this.search.toLowerCase()) || user.email.toLowerCase().includes(this.search.toLowerCase());
      });
    }
  },
  methods: {
    async onChangePermission (user, key, value) {
      user.permission = value * 1;
      try {
        await Services.getOrgService().updateOrganizationUser(
          this.selectedOrg.id,
          user.id, { permission: value * 1}
        );
        this.$root.$emit("Success", "Role changed")
        this.fetchData()
      } catch (e) {
        this.$root.$emit("Error", "Role not changed. Try again")
        console.log(e);
      }

    },
    toggleDropdown(id) {
      this.dropdownOpen = this.dropdownOpen === id ? null : id;
    },
    validateEditableUser(currentUser) {
      return this.user?.id && currentUser?.id && this.user.id !== currentUser.id;
    },
    resendInvitation() {
      // Implement resend invitation logic here
    },
    showCreateUserModal() {
      this.$refs.addUserDialog.show(this.team);      
    },
    async onUserAdded() {
      console.debug("onUserAdded")
      await this.fetchData()
    },
    getRole(permission) {
      const roles = getRoles();
      return roles[permission] || "Unknown";
    },
    async viewUserDetails(user) {
      this.isSidebarLoading = true;
      try {
        this.selectedUser = user;
        this.showDetails = true;
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        this.isSidebarLoading = false;
      }
    },
    closeModal() {
      this.selectedUser = {};
      this.showDetails = false;
    },
    confirmRemoveUser(user) {
      this.$refs.removeUserDialog.show(`${user.name} ${user.surname}`);
      this.userToRemove = user
    },
    async removeUser() {
      if (!this.userToRemove) {
        return
      }
      try {
        await Services.getOrgService().deleteOrganizationUser(this.selectedOrg.id, this.userToRemove.id);
        this.$root.$emit("Success", "User removed")
        this.fetchData()
      } catch (err) {
        this.$root.$emit("Error", "Could not remove user")
      }
      this.userToRemove = false
    },
    async loadTeam() {
      this.team = await Services.getOrgService().findTeamUsersByOrganization(this.selectedOrg.id);
      this.team.forEach((u) => {
        u.role = this.getRole(u.permission);
      });
    },
    async fetchData() {
      try {
        this.loadTeam()
      } catch (err) {
        console.log(err);
      } finally {
        this.isLoading = false;
      }
    },
  },
  async mounted() {
    await this.fetchData();

    const orgID = this.$route.params.orgId || "private";
    AnalyticsService.log("OrganizationUsers", orgID, 'view')
  },
};
</script>

<style lang="scss">
  @import "../../style/scss/organizationsTeam.scss";
</style>
