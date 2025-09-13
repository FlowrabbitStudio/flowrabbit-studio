<template>
  <div>
    <div :class="['organization-sidebar', { 'sidebar--collapsed': !isSidebarOpen }]">
      <div class="organization-sidebar__content">
        <div class="sidebar__header">
          <div v-if="isSidebarOpen" class="sidebar__header-title">
            {{ orgName }}
          </div>
          <a class="sidebar__toggle-btn" @click="toggleSidebar">
            <i :class="isSidebarOpen ? 'mdi mdi-chevron-left' : 'mdi mdi-chevron-right'"></i>
          </a>
        </div>
        <template v-if="!loadingSidebar">
          <div class="sidebar__list">
            <ul class="sidebar__list-items">
              <li
                :class="[
                  'sidebar__list-item root',
                  {
                    'sidebar__list-item--selected': selectedFolder && 'root' === selectedFolder.id,
                  },
                ]"
                @click="onSelectFolder('root')"
              >
                <QIcon icon="Apps" size="20" />
                <span v-if="isSidebarOpen">All Apps</span>
              </li>

              <li
                v-for="folderId in foldersIds"
                :key="folderId"
                :class="['sidebar__list-item',{'sidebar__list-item--selected': selectedFolder && folderId === selectedFolder.id},
                ]"
                @click="onSelectFolder(folderId)"
                @mouseenter="showMenu(folderId)"
                @mouseleave="hideMenu"
              >
                <QIcon icon="FolderOpen" size="20" v-if="selectedFolder && folderId === selectedFolder.id"/>
                <QIcon icon="Folder" size="20" v-else/> 
                <span v-if="isSidebarOpen">{{ folders[folderId].name }}</span>
                <folder-dropdown
                  v-if="isMenuVisible && hoveredFolderId === folderId"
                  @rename="renameFolder(folders[folderId])"
                  @delete="deleteFolder(folders[folderId])"
                />
              </li>
              <li @click="showAddFolderDialog" :class="['sidebar__list-item sidebar__list-item_add']">
                <QIcon icon="NewFolder" size="20" />
                <span v-if="isSidebarOpen">Create Folder</span>
              </li>
            </ul>
          </div>
        </template>
        <div class="loading-container" v-else>
          <div class="spinner"></div>
        </div>
        <div class="sidebar__footer">
    
          <div @click="navigate(`/org/${selectedOrg.id}/team`)" :class="['sidebar__footer-item', {'sidebar__footer-item--selected': isActive(`/org/${selectedOrg.id}/team`)}]">
            <QIcon size="20" icon="Team2"></QIcon>
            <span v-if="isSidebarOpen">Members</span>
          </div>
          <div v-if="role.role === 'OWNER'" :class="['sidebar__footer-item',{'sidebar__footer-item--selected': isActive(`/org/${selectedOrg.id}/settings`)}]" @click="navigate(`/org/${selectedOrg.id}/settings`)" >
            <QIcon size="20" icon="SettingsCog"></QIcon>
            <span v-if="isSidebarOpen">Settings</span>
          </div>
        </div>
      </div>
    </div>

    <CreateFolderDialog ref="createFolderDialog" />
    <RenameFolderDialog ref="renameFolderDialog" :currentFolder="selectedFolder" :selectedOrg="selectedOrg"></RenameFolderDialog>
    <RemoveFolderDialog ref="removeFolderDialog" :currentFolder="selectedFolder" :selectedOrg="selectedOrg"></RemoveFolderDialog>
  </div>
</template>

<style lang="scss">
@import "../../style/scss/organizationSidebar.scss";
</style>

<script>
import ConstantsUtil from "../../util/ConstantsUtil.js";
import { mapActions, mapState } from "vuex";
import Services from "services/Services";
import ResizeMixin from "../../components/mixins/ResizeMixin.js";
import FolderDropdown from "../../components/FolderDropdown.vue";
import CreateFolderDialog from "../../components/dialogs/CreateFolderDialog.vue";
import RenameFolderDialog from "../../components/dialogs/RenameFolderDialog.vue";
import RemoveFolderDialog from "../../components/dialogs/RemoveFolderDialog.vue";
import QIcon from "page/QIcon";

export default {
  name: "OrganizationSidebar",
  props: [],
  mixins: [ResizeMixin], // Use the mixin
  data() {
    return {
      isSidebarCollapsed: false,
      newFolderName: "",
      errorMessage: "",
      isMenuVisible: false,
      hoveredFolderId: null,
      role: {role: "GUEST"},
    };
  },
  components: {
    CreateFolderDialog,
    FolderDropdown,
    RenameFolderDialog,
    RemoveFolderDialog,
    QIcon,
  },
  computed: {
    ...mapState(["selectedFolder", "loadingSidebar", "selectedOrg"]),
    orgName() {
      if (this.selectedOrg && this.selectedOrg.name) {
        if (this.selectedOrg.id === ConstantsUtil.DEFAULT_ORG_ID) {
          return ConstantsUtil.DEFAULT_ORG_LABEL;
        }
        if (this.selectedOrg.displayName) {
          return this.selectedOrg.displayName
        }
        return this.selectedOrg.name;
      }
      return "";
    },
    folders() {
      const foldersObject = this.selectedOrg.folders || {};
      return foldersObject;
    },
    foldersIds() {
      const foldersObject = this.selectedOrg.folders || {};
      return Object.keys(foldersObject);
    },
    isSidebarOpen() {
      return !this.isSidebarCollapsed && !this.isMobileView;
    },
  },
  methods: {
    ...mapActions(["updateSelectedFolder", "onCleanFolder"]),
    navigate(view) {
      this.onCleanFolder();
      if (this.$route.path !== view) {
        this.$router.push({ path: view }).catch((err) => {
          console.log(err);
        });
      }
    },
    async onSelectFolder(folderId) {
      let folder = { id: "root", name: "All Apps" };
      if (folderId !== "root") {
        folder = this.folders[folderId];
      }
      this.$router.push({ path: `/apps/${this.selectedOrg.id}.html` }).catch((err) => {
        if (err.name !== "NavigationDuplicated") {
          throw err;
        }
      });
      await this.updateSelectedFolder(folder);
    },
    isActive(view) {
      return this.$route.path === view;
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    showAddFolderDialog() {
      this.errorMessage = "";
      this.newFolderName = "";
      this.$refs.createFolderDialog.show();
    },
    async handleAddFolder() {
      const folderName = this.newFolderName.trim();
      if (folderName === "") {
        this.errorMessage = "The folder name cannot be empty";
        return;
      }

      const uniqueId = `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.newFolderName = "";
      if (this.selectedOrg) {
        const organization = await Services.getOrgService().findOrganization(this.selectedOrg.id);
        let folders = organization.folders || [];
        folders.push({ id: uniqueId, name: folderName });
        const data = {
          folders: folders,
        };
        await Services.getOrgService().createNewFolder(this.selectedOrg.id, data);
        this.showAddFolderDialog = false;
      }
    },
    showMenu(folderId) {
      if (this.isSidebarOpen) {
        this.isMenuVisible = true;
        this.hoveredFolderId = folderId;
      }
    },
    hideMenu() {
      this.isMenuVisible = false;
      this.hoveredFolderId = null;
    },
    renameFolder(folder) {
      this.$refs.renameFolderDialog.show(folder);
    },
    deleteFolder(folder) {
      this.$refs.removeFolderDialog.show(folder);
    },
  },
  async mounted() {
    this.role = await Services.getOrgService().whoami(this.selectedOrg.id);
  },
};
</script>
