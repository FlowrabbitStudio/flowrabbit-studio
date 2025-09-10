<template>
  <BaseDialog
    :title="dialogHeader"
    :subtitle="folder && folder.name"
    :labels="labels"
    ref="dialog"
    @confirmAction="confirmRename"
  >
      <div class="form-group">
        <label>New Folder Name</label>
        <input
          type="text"
          class="form-control"
          v-model="name"
          ref="inputName"
          placeholder="Folder name"
        />
        <div data-binding-error="name"></div>
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
  name: "RenameFolderDialog",
  components: {
    BaseDialog
  },
  data() {
    return {
      folder: {},
      dialogHeader: "Rename Folder",
      name: "",
      labels: {
        confirm: "Rename",
        cancel: "Cancel",
        type: "primary"
      },
    };
  },
  computed: {
    ...mapState(["selectedOrg"]),
  },
  methods: {
    ...mapActions([
      "reloadOrganization"
    ]),
    close() {
      this.$refs.dialog.close();
    },
    async confirmRename() {
      if (this.selectedOrg && this.selectedOrg.id !== "private") {
        const organization = await Services.getOrgService().findOrganization(
          this.selectedOrg.id
        );
        let folders = organization.folders || {};
        const currentFolder = folders[this.folder.id]
        folders[this.folder.id] = { ...currentFolder, name: this.name };
        organization.folders = folders;
        await Services.getOrgService().updateFolders(
          organization.id,
          folders
        );
        await this.reloadOrganization(organization);
      }
      this.close();
    },
    show(folder) {
      this.folder = folder;
      this.name = folder.name;
      this.dialogHeader = `Rename folder: `;
      this.$refs.dialog.show();
    },
  },
};
</script>

<style lang="scss">
@import "../../style/scss/dialog.scss";
</style>
