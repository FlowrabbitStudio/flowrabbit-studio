<template>
  <div class="MatcAppList">
    <div class="MatcWorkspaceHeaderBlock">
      <div class="MatcWorkspaceHeaderContent">
        <div class="MatcWorkspaceHeader MatcWorkspaceTitle h4">
          {{ selectedFolder ? selectedFolder.name : "All Apps" }}
        </div>
        <div class="MatcWorkspaceHeader">
          <div class="MatcWorkspaceButtons">
            <div class="MatcSearchForm">
              <div
                :class="[
                  'MatcListSearchCntr',
                  { MatcListSearchVisible: showSearchInput },
                  { hidden: !hasSearch },
                ]"
              >
                <input
                  id="MatcAppListSearchField"
                  placeholder="Search"
                  v-model="searchQuery"
                  @keypress="stopPropagation"
                  @keydown="stopPropagation"
                  @keyup="onSearch"
                  ref="searchInput"
                />
                <span
                  class="mdi mdi-magnify MatcCreateSearchBtn"
                  @click="showSearch"
                ></span>
              </div>
            </div>
          
        
            <div>
              <a
                id="createAppButton"
                class="MatcButton MatcButtonPrimary MatcButtonL"
                @click="onCreate"
              >
                <span style="color: white" class="mdi mdi-plus mr-2"></span>
                {{ $t("app.overview.create") }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="MatcList">
      <div v-if="loadingApps || loadingToken" class="MatcLoading">
        Loading...
      </div>
      <div v-else class="MatcAppListContainer">
        <div class="MatcFlexList">
          <AppItem
            v-for="(app, index) in renderedApps"
            :ref="app.id"
            :key="app.id"
            :app="app"
            :jwtToken="jwtToken"
            :pub="pub"
            :index="index"
            :appLink="appLink(app)"
            :selectedOrg="selectedOrg"
            :loadingSummaries="loadingSummaries"
            @duplicate="onDuplicateApp"
            @rename="onRenameApp"
            @move="onMoveApp"
            @remove="onRemoveApp"
          />
        </div>
        <div v-if="moreToLoad" class="MatcCenter MatcMarginBottom">
          <a class="MatcButton" @click="loadMore">Show More...</a>
        </div>
      </div>
    </div>
    <CreateDialog :selectedOrg="selectedOrg" ref="createDialog" />
    <RenameAppDialog ref="renameAppDialog" @loadApps="loadApps" />
    <DuplicateAppDialog ref="duplicateAppDialog" :selectedOrg="selectedOrg" @loadApps="loadApps"/>
    <RemoveAppDialog ref="removeAppDialog" @loadApps="loadApps" :currentFolder="selectedFolder" />
    <MoveAppDialog ref="moveAppDialog" :selectedOrg="selectedOrg" @loadApps="loadApps" :user="user"/>
  </div>
</template>

<style>
@import url("../style/list.css");

.hidden {
  display: none;
}
</style>

<script>

import CreateDialog from "../components/dialogs/CreateDialog.vue";
import RenameAppDialog from "../components/dialogs/RenameAppDialog.vue";
import DuplicateAppDialog from "../components/dialogs/DuplicateAppDialog.vue";
import RemoveAppDialog from "../components/dialogs/RemoveAppDialog.vue";
import MoveAppDialog from "../components/dialogs/MoveAppDialog.vue";
import AppItem from "./AppItem.vue";
import { mapActions, mapState } from "vuex";
import Logger from "common/Logger";
import Services from "services/Services";

export default {
  name: "AppList",
  components: {
  
    CreateDialog,
    AppItem,
    RenameAppDialog,
    DuplicateAppDialog,
    RemoveAppDialog,
    MoveAppDialog,
  },
  props: ["small", "big", "pub", "canAdd", "size"],
  data() {
    return {
      searchQuery: "",
      typeSelected: "All",
      publishOptions: [
        { value: "all", label: "All status" },
        { value: "forbidden", label: "Private" },
        { value: "public", label: "Published (Public)" },
        { value: "team", label: "Published (Team)" },
        { value: "appstore", label: "Published (App Store)" },
      ],
      published: "all",
      maxElementsToRender: 50,
      maxElementsToRenderStep: 50,
      moreToLoad: false,
      jwtToken: "",
      loadingToken: true,
      resizePreview: true,
      colWidth: 220,
      animate: true,
      sortedFilteredApps: [],
      hasSearch: true,
      showSearchInput: false,
    };
  },
  computed: {
    ...mapState([
      "apps",
      "selectedFolder",
      "loadingApps",
      "loadingSummaries",
      "selectedOrg",
      "user",
    ]),
    filteredApps() {
      return this.apps
        .filter((app) => this.applyFilters(app))
        .sort((a, b) => b.lastUpdate - a.lastUpdate);
    },
    renderedApps() {
      return this.filteredApps.slice(0, this.maxElementsToRender);
    },
  },
  methods: {
    ...mapActions(["loadApps", "loadSummaries", "filterAppsByFolder"]),
    appLink(app) {
      if (!this.pub) {
        if (app.screens && Object.keys(app.screens)) {
          const firstScreen = Object.keys(app.screens)[0];
          return `#/apps/${this.selectedOrg.id}/${app.id}/design/${firstScreen}.html`;
        } else {
          return `#/apps/${this.selectedOrg.id}/${app.id}/settings.html`;
        }
      }
      return "";
    },
    applyFilters(app) {
      const matchesSearch = app.name
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());
      const matchesType =
        this.typeSelected === "All" ||
        (this.typeSelected === "Shared" &&
          app.teamMembers &&
          app.teamMembers > 1);
      const matchesPublish =
        this.published === "all" || this.published === app.publicType;

      return matchesSearch && matchesType && matchesPublish;
    },
    onSelectType(type) {
      this.typeSelected = type;
    },
    onCreate() {
      this.$refs.createDialog.show();
    },
    onRenameApp(app) {
      this.$refs.renameAppDialog.show(app);
    },
    onDuplicateApp(app) {
      this.$refs.duplicateAppDialog.show(app);
    },
    onRemoveApp(app) {
      this.$refs.removeAppDialog.show(app);
    },
    async onMoveApp(app) {
      await this.$refs.moveAppDialog.show(app);
    },
    loadMore() {
      this.maxElementsToRender = Math.min(
        this.filteredApps.length,
        this.maxElementsToRender + this.maxElementsToRenderStep
      );
      this.moreToLoad = this.maxElementsToRender < this.filteredApps.length;
    },
    async fetchJwtToken() {
      this.jwtToken = await Services.getUserService().getToken();
      this.loadingToken = false;
    },
    updateFilteredApps() {
      this.maxElementsToRender = 50;
      this.moreToLoad = this.maxElementsToRender < this.filteredApps.length;
    },
    stopPropagation(e) {
      e.stopPropagation();
    },
    showSearch() {
      this.$nextTick(() => {
        this.showSearchInput = !this.showSearchInput;
        this.$refs.searchInput.focus();
      });
    },
    onSearch(e) {
      e.stopPropagation();

      if (this.searchQuery.length >= 2) {
        this.updateFilteredApps();
      } else {
        this.updateFilteredApps();
      }
    },
    async load() {
      await this.loadSummaries();
      let item;
      this.apps.sort((a, b) => b.lastUpdate - a.lastUpdate).forEach((app, i) => {
        if (this.$refs && this.$refs[app.id]) {
          item = this.$refs[app.id][0];
          if (item) {
            if (item && typeof item.setHidden === "function") this.showItem(item, i);
            if (item && typeof item.setAnimate === "function") item.setAnimate(true);
          }
        }
      });

      await this.loadApps();

      this.apps.forEach((app) => {
        if (this.$refs && this.$refs[app.id]) {
          item = this.$refs[app.id][0];
          if (item && typeof item.setAnimate === "function") {
            item.setAnimate(false);
          }
        }
      });
    },
    showItem(item, i) {
      setTimeout(function () {
        item.setHidden(false);
      }, 100 + Math.min(i, 10));
    },
  },
  watch: {
    searchQuery: "updateFilteredApps",
    typeSelected: "updateFilteredApps",
    published: "updateFilteredApps",
    apps: {
      handler() {
        this.updateFilteredApps();
      },
      immediate: true,
    },
  },
  async mounted() {
    this.log = new Logger("AppList");
    this.log.log(2, "mounted", "enter");
    await this.fetchJwtToken();
    //await this.load();
  },
};
</script>
