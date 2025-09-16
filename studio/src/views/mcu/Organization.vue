<template>
  <div class="MatcMCUPanel">
    <Panel>
      <h2>Overview</h2>
      <div class="MCUForm">
        <div class="MatcFlex MatcGapM">
          <div class="form-group MatcFlexGrow50">
            <label>Name</label>
            <div>
              <input class="form-control" v-model="organization.name" />
            </div>
          </div>

          <div class="form-group MatcFlexGrow50">
            <label>Display Name</label>
            <div>
              <input class="form-control" v-model="organization.displayName" />
            </div>
          </div>

        </div>
        <div class="MatcFlex MatcGapM">
          <div class="form-group MatcFlexGrow50">
            <label>Status</label>
            <div>
              <select v-model="status" class="form-control">
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div class="form-group MatcFlexGrow50">
            <label>Credits (Euro / Dollar)</label>
            <div>
              <input class="form-control" v-model="creditsInMicroCent" type="number" />
            </div>
          </div>

        </div>



      </div>


      <div class="MatcButtonBar MatcMarginTopXXL">
        <div class="MatcButton" @click="updateOrg">Save</div>
      </div>
    </Panel>

    <Panel>
      <div v-if="team" class="form-group">
        <h2>Members</h2>

        <DataTable :data="team" :size="100" :columns="[
          {
            id: 'email',
            key: 'email',
            label: 'Email',
            width: '20%',
            max: 20,
          },
          {
            id: 'name',
            key: 'name',
            label: 'Name',
            width: '10%',
            value: (row) => printName(row),
          },
          {
            id: 'permission',
            key: 'permission',
            label: 'Permission',
            width: '10%',
            value: (row) => getPermissionLabel(row.permission),
          },
          {
            id: 'action-edit',
            key: 'action',
            label: '',
            width: '10%',
            value: 'Edit',
            class: 'action',
            click: (row, e) => editPermission(row, e),
          },
        ]" />
      </div>
      <div class="form-group">
        <label>New Member</label>
        <div class="form-control-btn">
          <input class="form-control" v-model="newTeamEmail" placeholder="Enter email of new member" />
          <select v-model="newPermission" class="form-control" style="width: 150px;">
            <option value="5">Owner</option>
            <option value="3">Writer</option>
            <option value="2">Reader</option>
            <option value="1">User</option>
          </select>
          <a class="MatcButton" @click="addTeamMember">Add</a>
        </div>
      </div>
    </Panel>

    <ZoomDialog ref="editPermissionDialog">
      <div class="MatcDialog">
        <div class="MatcButtonBar">
          <div class="MatcButton MatcButtonRed" @click="removeTeamMember">Delete</div>
        </div>

        <div class="MatcHint">{{ selectedMember?.email }} has the following permission:</div>

        <RadioBoxList :qOptions="permissionOptions" :qValue="selectedMember?.permission" @change="changePermission">
        </RadioBoxList>

        <div class="MatcButtonBar">
          <div class="MatcButton" @click="savePermission">Save</div>
          <div class="MatcButton" @click="cancelPermission">Cancel</div>
        </div>
      </div>
    </ZoomDialog>
  </div>
</template>
<style>
.new-secret-form {
  background-color: #fdfdfd;
  padding: 20px;
  margin-top: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.new-secret-form h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.new-secret-form .form-group {
  margin-bottom: 15px;
}

.new-secret-form .form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.new-secret-form .form-control {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}

.new-secret-form .form-control:focus {
  border-color: #66afe9;
  outline: none;
}

@media (max-width: 600px) {
  .new-secret-form {
    padding: 15px;
  }

  .new-secret-form h3 {
    font-size: 1.3em;
  }

  .MatcButton {
    width: 100%;
    text-align: center;
  }

  .MatcButtonBar {
    text-align: center;
  }
}
</style>

<script>
import Logger from "common/Logger";
import Services from "services/Services";
import AdminService from "./AdminService";
import Panel from "./Panel.vue";
import DataTable from "./DataTable.vue";
import ZoomDialog from "common/ZoomDialog";
import RadioBoxList from "common/RadioBoxList";
import { getRolesWithLabels } from "src/util/Util.js";
import { microCentoToEuro, euroToMicroCent } from "src/util/CreditUtil.js";

export default {
  name: "Organization",
  data() {
    return {
      permissionOptions: getRolesWithLabels(),
      organization: {},
      secrets: [],
      isBlocked: false,
      team: [],
      newTeamEmail: "",
      domain: "",
      newPermission: 1,
      selectedMember: null,
      creditsInMicroCent: 0,
      newSecretName: "",
      newCurrentApiCalls: 0,
      status: "",
      newMaxApiCalls: 1000,
    };
  },
  components: {
    Panel,
    DataTable,
    ZoomDialog,
    RadioBoxList,
  },
  computed: {
    availableSecrets() {
      const usedSecretNames = Object.keys(this.organization.apiCalls || {});
      return this.secrets.filter((secret) => !usedSecretNames.includes(secret.name));
    },
  },
  methods: {
    printDate(ms) {
      const date = new Date(ms);
      return date.toLocaleDateString();
    },
    printName(user) {
      return user.name + " " + user.lastname;
    },
    getSecretName(secretId) {
      const secret = this.secrets.find((s) => s.id === secretId);
      return secret ? secret.name : secretId;
    },

    async updateOrg() {
      if (!this.organization.name) {
        this.$refs.dialog.shake();
        return;
      }
      this.organization.name = this.organization.name.toLowerCase();
      this.organization.status = this.status;
      this.organization.creditsInMicroCent = euroToMicroCent(this.creditsInMicroCent * 1);
      this.organization.additionalcreditsInMicroCent = 0
      const res = await this.adminService.updateOrg(this.organization);
      if (res.error || res.errors) {
        this.$root.$emit("Error", "Error");
      } else {
        this.$root.$emit("Success", "Organization updated");
      }
    },
    async removeTeamMember() {
      let result = await this.adminService.removeOrgTeamMember(this.organization.id, this.selectedMember.id);
      if (result.status !== "ok") {
        this.$root.$emit("Error", "Error");
        return;
      }

      this.$refs.editPermissionDialog.close();
      this.selectedMember = null;
      this.team = await this.adminService.getOrgTeam(this.organization.id);
    },
    async addTeamMember() {
      if (!this.newTeamEmail) {
        this.$root.$emit("Error", "Enter an email");
        return;
      }

      let permission = this.newPermission * 1;
      let result = await this.adminService.addOrgTeamMember(this.organization.id, this.newTeamEmail, permission);
      if (result.status !== "ok") {
        this.$root.$emit("Error", "Could not add user. Does the email exist?");
      } else {
        if (result.details === "organization.team.add.invite") {
          this.$root.$emit("Success", "The user was not in the system. Send an email to her.");
        } else {
          this.$root.$emit("Success", "User added");
        }
      }

      this.newTeamEmail = "";
      this.team = await this.adminService.getOrgTeam(this.organization.id);
    },
    editPermission(member) {
      this.selectedMember = member;
      this.$refs.editPermissionDialog.show();
    },
    changePermission(p) {
      this.selectedMember.permission = p;
    },
    cancelPermission() {
      this.selectedMember = null;
      this.$refs.editPermissionDialog.close();
    },
    async savePermission() {
      const res = await this.adminService.updateOrgTeamMember(this.organization.id, this.selectedMember.id, this.selectedMember.permission * 1);
      if (res.error || res.errors) {
        this.$root.$emit("Error", "Error updating permission");
      } else {
        this.$root.$emit("Success", "Permission updated");
        this.selectedMember = null;
        this.$refs.editPermissionDialog.close();
      }
    },
    cancelEdit() { },
    getPermissionLabel(permission) {
      permission = permission * 1;
      switch (permission) {
        case 5:
          return "Owner";
        case 4:
          return "Client";
        case 3:
          return "Writer";
        case 2:
          return "Reader";
        case 1:
          return "User";
        default:
          return "Unknown";
      }
    },
    async loadOrg() {
      const orgID = this.$route.params.id;
      const organization = await this.adminService.getOrg(orgID);

      if (!organization.apiCalls) {
        this.$root.$emit("Hint", "Updated API Calls");
        organization.apiCalls = {};
      }

      this.organization = organization;
      this.team = await this.adminService.getOrgTeam(this.organization.id);
      if (!this.organization.name) {
        this.organization.name = "";
      }
      this.status = this.organization.status;
      this.creditsInMicroCent = microCentoToEuro(this.organization.creditsInMicroCent) || 0;
    },

    async loadSecrets() {
      this.secrets = await this.adminService.getAllSecrets();
    },
    async removeApiCall(name) {
      this.$delete(this.organization.apiCalls, name);
      const res = await this.adminService.updateOrg(this.organization);
      if (res.error || res.errors) {
        this.$root.$emit("Error", "Error deleting API call");
      } else {
        this.$root.$emit("Success", "API call deleted");
      }
    },
  },
  async mounted() {
    this.logger = new Logger("Organization");
    this.adminService = new AdminService();
    this.adminService.setToken(Services.getUserService().getToken());
    await this.loadSecrets();
    await this.loadOrg();
  },
};
</script>
