<template>
  <BaseDialog
    :title="dialogTitle"
    subtitle=""
    :labels="labels"
    ref="dialog"
    @confirmAction="handleAddUser"
  >
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <input v-model="email" placeholder="Enter the email" class="input" />
        </div>
      </div>
      <div class="row MatcMarginTopL">
        <div class="col-md-12">
        <RadioBoxList 
            class="" 
            :qOptions="roles" 
            @change="selectRole" 
            qCols="2"></RadioBoxList>
          </div>
      </div>
      <div class="MatcErrorLabel" v-if="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from "./BaseDialog.vue";
import Services from "@/services/Services";
import { mapState } from "vuex";
import { getRolesWithLabels } from "src/util/Util.js";
import RadioBoxList from 'common/RadioBoxList';


export default {
  name: "AddUserOrgDialog",
  props: [],
  data() {
    return {
      email: "",
      role: "",
      errorMessage: "",
      isSaving: false,
      dialogTitle: "Add User to the Organization",
      labels: {
        confirm: "Invite User",
        cancel: "Cancel",
        type: "primary",
      },
      roles: getRolesWithLabels(),
    };
  },
  computed: {
    ...mapState(["user", "selectedOrg"]),
  },
  components: {
    BaseDialog,RadioBoxList
  },
  methods: {
    handleClose() {
      this.$refs.dialog.close();
    },
    onChangeEmail(value) {
      this.email = value;
    },
    selectRole(role) {
      console.log('selectRole', role);
      this.role = role;
    },
    async handleAddUser() {
      if (this.isSaving) return;

      const emailStr = this.email.trim();
      if (emailStr === "") {
        this.errorMessage = "Email cannot be empty!";
        return;
      }

      if (this.role === "") {
        this.errorMessage = "Role must be selected!";
        return;
      }

      let found = this.team.find((t) => t.email === this.email);
      if (found) {
        this.errorMessage = "User already in team";
        return;
      }

      this.isSaving = true;
      this.$refs.dialog.setLoading(true); // Start loading
      const userToInvite = { email: this.email, permission: this.role };
      const result = await Services.getOrgService().inviteUserToOrganization(
        this.selectedOrg.id,
        userToInvite
      );

      this.isSaving = false;
      this.$refs.dialog.setLoading(false); // End loading
      if (result.type === "error") {
        this.handleAddUserError(result.errors[0]);
      } else {
        this.$emit("confirm");
        this.handleClose();
      }
    },
    handleAddUserError(errorCode) {
      if (errorCode === "apps.team.member.add.error.email") {
        this.errorMessage = "No user is registered with the email!";
      } else if (errorCode === "apps.team.member.add.error.read") {
        this.errorMessage = "You can only read the app!";
      }
    },
    show(team) {
      this.team = team;
      this.$refs.dialog.show();
      if (this.$refs && this.$refs.input) {
        this.$refs.input.focus();
      }
    },
  },
};
</script>

<style lang="scss">
@import "style/scss/dialog.scss";
@import "style/variables.scss";

.role-selection {
  display: flex;
  justify-content: space-between;
}

.role-button {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  cursor: pointer;
  flex: 1;
  margin: 0 5px;
  transition: background-color 0.3s ease;
}

.role-button.active {
  background-color: var(--primary-color-dark);
  color: #fff;
  border: none;
}

.role-button:not(.active):hover {
  background-color: #e9ecef;
}
</style>
