<template>
  <BaseDialog
    title="Move App:"
    :subtitle="app && app.name"
    @confirmAction="confirmMove"
    :labels="labels"
    ref="dialog"
  >
    <div>
      <div class="form-group">
        <label>Organization</label>
        <DropDownButton
          ref="orgDropdown"
          :value="selectedOrganization"
          @change="onOrganizationChange"
          :options="organizationOptions"
          class="dropdown-container"
        />
      </div>
      <div v-if="showFolders" class="form-group">
        <label>Folder</label>
        <DropDownButton
          ref="folderDropdown"
          :value="newFolder"
          @change="onFolderChange"
          :options="folderOptions"
          class="dropdown-container"
        />
      </div>
    </div>
  </BaseDialog>
</template>

<style lang="scss"></style>

<script>
import DropDownButton from "page/DropDownButton";
import Services from "services/Services";
import ConstantsUtil from "../../util/ConstantsUtil.js";
import BaseDialog from "./BaseDialog.vue";
import { mapState, mapActions } from "vuex";

export default {
  name: "RenameAppDialog",
  props: ["user", "selectedOrg"],
  components: {
    DropDownButton,
    BaseDialog,
  },
  data() {
    return {
      app: {},
      dialogHeader: "",
      name: "",
      selectedOrganization: null,
      newFolder: null,
      organizations: [],
      organizationOptions: [],
      folderOptions: [],
      showFolders: false,
      labels: {
        confirm: "Move",
      },
    };
  },
  computed: {
    ...mapState(["selectedFolder"]),
  },
  methods: {
    ...mapActions([
      "updateSelectedOrg",
      "reloadOrganization",
      "updateSelectedFolder",
      "loadSummaries",
      "loadApps"
    ]),
    close() {
      this.showModal = false;
    },
    async confirmMove() {
      const orgService = Services.getOrgService();
      const currentFolder = this.selectedFolder;
      const targetFolderId = this.newFolder;
      const currentOrg = this.selectedOrg;
      const targetOrgId = this.selectedOrganization;

      if (!targetFolderId) {
        return;
      }

      // removing the app from the current folder
      if (currentFolder && currentFolder.id !== "root") {
        const appIndex = currentFolder.apps
          ? currentFolder.apps.indexOf(this.app.id)
          : -1;
        if (appIndex > -1) {
          currentFolder.apps.splice(appIndex, 1);
        }
        currentOrg.folders[currentFolder.id] = currentFolder;
        await orgService.updateFolders(currentOrg.id, currentOrg.folders);
      }
      // if its a diff org, move the app to the new org
      if (targetOrgId !== currentOrg.id) {
        await Services.getModelService().updatePubSettings(this.app.id, {
          orgID: targetOrgId,
        });
      }
      // if the target org is different than the default one, and also the folder one,
      // we add the app to the new folder and update the organization
      let targetOrg = { id: "private", name: "Default" }
      let targetFolder = { id: "root", name: "All apps" }
      if (targetOrgId !== "private") {
        targetOrg = await orgService.findOrganization(targetOrgId);
        if (targetFolderId !== "root") {
          targetFolder = targetOrg.folders[targetFolderId];
          if (targetFolder) {
            if (!targetFolder.apps) {
              targetFolder.apps = [];
            }
            if (!targetFolder.apps.includes(this.app.id)) {
              targetFolder.apps.push(this.app.id);
            }
          } else {
            targetOrg.folders[targetFolderId] = { apps: [this.app.id] };
          }
          await orgService.updateFolders(targetOrg.id, targetOrg.folders);
        }        
      }
      if (targetOrgId !== currentOrg.id) {
        await this.updateSelectedOrg(targetOrg);
        await this.loadSummaries()
        await this.loadApps()
      } else {
        await this.reloadOrganization(targetOrg);
      }
      const newSelectedFolder =
          targetFolderId === "root"
            ? { id: "root", name: "All Apps" }
            : targetOrg.folders[targetFolderId];
      await this.updateSelectedFolder(newSelectedFolder);
      if (this.$refs && this.$refs.dialog) this.$refs.dialog.close();
    },
    async show(app) {
      this.app = app;
      this.name = app.name;

      // FIXME: do we need the modelService?
      const organizations =
        await Services.getOrgService().findUserOrganizations(this.user.id);
      this.organizations = organizations;
      this.organizationOptions = organizations.map((org) => ({
        label:
          org.id === ConstantsUtil.DEFAULT_ORG_ID
            ? ConstantsUtil.DEFAULT_ORG_LABEL
            : org.name,
        value: org.id,
      }));
      this.selectedOrganization = this.selectedOrg.id;
      this.newFolder = this.selectedFolder && this.selectedFolder.id;
      this.updateFolderOptions();
      this.dialogHeader = `Move: ${app.name}`;
      this.$refs.dialog.show();
    },
    onOrganizationChange(orgId) {
      this.selectedOrganization = orgId;
      this.updateFolderOptions();
    },
    updateFolderOptions() {
      const selectedOrg = this.organizations.find(
        (org) => org.id === this.selectedOrganization
      );
      if (selectedOrg) {
        if (selectedOrg.id !== "private") {
          const options = [
            { value: "root", label: "All Apps" },
            ...Object.keys(selectedOrg.folders || {}).map((folderKey) => ({
              label: selectedOrg.folders[folderKey].name,
              value: selectedOrg.folders[folderKey].id,
            })),
          ];
          this.folderOptions = options;
          this.showFolders = true;
        } else {
          this.showFolders = false;
        }
      }
    },
    onFolderChange(folderId) {
      this.newFolder = folderId;
    },
  },
};
</script>
