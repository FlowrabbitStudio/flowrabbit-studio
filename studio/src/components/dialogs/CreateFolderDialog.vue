<template>
  <BaseDialog
    :title="dialogHeader"
    subtitle=""
    :labels="labels"
    ref="dialog"
    @confirmAction="handleAddUser"
  >


          <input
            v-model="folderName"
            placeholder="Enter the folder name"
            class="input"
          />
  
      <div class="MatcErrorLabel" v-if="errorMessage">
        {{ errorMessage }}
      </div>
  
  </BaseDialog>
</template>

<style lang="scss">
@import "../../style/scss/dialog.scss";
</style>

<script>
import BaseDialog from "./BaseDialog.vue";
import Services from "@/services/Services";
import { mapState, mapActions } from "vuex";

export default {
  name: "CreateFolderDialog",
  data() {
    return {
      folderName: "",
      errorMessage: "",
      isSaving: false,
      dialogHeader: "Create Folder",
      labels: {
        confirm: "Create Folder",
        cancel: "Cancel",
        type: "primary",
      },
    };
  },
  components: {
    BaseDialog,
  },
  computed: {
    ...mapState(["selectedOrg"]),
  },
  methods: {
    ...mapActions(["reloadOrganization"]),
    handleClose() {
      this.$refs.dialog.close();
    },
    async handleAddUser() {
      if (this.isSaving) return;

      const folderName = this.folderName.trim();
      if (folderName === "") {
        this.errorMessage = "The folder name cannot be empty";
        return;
      }

      this.isSaving = true;
      if (this.selectedOrg) {
        const organization = await Services.getOrgService().findOrganization(
          this.selectedOrg.id
        );
        let folders = organization.folders || {};
        const uniqueId = `id-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        folders[uniqueId] = { id: uniqueId, name: this.folderName, apps: [] };
        organization.folders = folders;
        await Services.getOrgService().updateFolders(
          organization.id,
          folders
        );
        await this.reloadOrganization(organization);
        this.isSaving = false;
      }
      this.handleClose();
    },
    handleAddUserError(errorCode) {
      if (errorCode === "apps.team.member.add.error.email") {
        this.errorMessage = "No user is registered with the email!";
      } else if (errorCode === "apps.team.member.add.error.read") {
        this.errorMessage = "You can only read the app!";
      }
    },
    show() {
      this.$refs.dialog.show();
      if (this.$refs && this.$refs.input) {
        this.$refs.input.focus();
      }
    }
  },
  mounted() {
  },
};
</script>
