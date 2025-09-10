<template>
  <BaseDialog
    :title="dialogHeader"
    :subtitle="folder && folder.name"
    :labels="labels"
    ref="dialog"
    @confirmAction="confirm"
  >
    <div>
      <p>
        Are you sure you want to remove the
        <strong>{{ folder && folder.name }}</strong> folder?
      </p>
    </div>
  </BaseDialog>
</template>

<style lang="scss">
@import "style/scss/theme_dialog.scss";
@import "style/components/dialog.scss";
</style>

<script>
import BaseDialog from "./BaseDialog.vue";
import Services from "services/Services";
import { mapState, mapActions } from "vuex";

export default {
  name: "ConfirmRemoveDialog",
  components: {
    BaseDialog,
  },
  data() {
    return {
      folder: {},
      dialogHeader: "",
      labels: {
        confirm: "Remove",
        cancel: "Cancel",
        type: "danger",
      },
    };
  },
  computed: {
    ...mapState(["selectedOrg"]),
  },
  methods: {
    ...mapActions(["reloadOrganization", "updateSelectedFolder"]),
    close() {
      this.$refs.dialog.close();
    },
    async confirm() {
      if (this.selectedOrg && this.selectedOrg.id !== "private") {
        const organization = await Services.getModelService(this.$route).findOrganization(
          this.selectedOrg.id
        );
        let folders = organization.folders || {};
        delete folders[this.folder.id];
        organization.folders = folders;
        await Services.getModelService().updateFolders(
          organization.id,
          folders
        );
        await this.reloadOrganization(organization);
        await this.updateSelectedFolder({id: "root"})
      }
      this.close();
    },
    show(folder) {
      this.folder = folder;
      this.dialogHeader = `Confirm Removal: `;
      this.$refs.dialog.show();
    },
  },
};
</script>
