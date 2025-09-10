import Vue from "vue";
import Vuex from "vuex";
import Services from "services/Services";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      id: -1,
      name: "Guest",
      email: "guest@quant-ux.com",
      role: "guest",
      lastlogin: 0,
      lastNotification: 0,
      tos: false,
      paidUntil: 0,
      plan: "Free",
    },

    selectedOrg: {
      id: "private",
      name: "private",
    },
    selectedFolder: { id: "root", name: "All Apps" },
    allapps: [], // all apps
    apps: [], // apps filtered by folder
    loadingApps: false,
    loadingSidebar: false,
    loadingSummaries: false,
  },
  mutations: {
    SET_SELECTED_ORG(state, org) {
      state.selectedOrg = org;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_APPS(state, apps) {
      state.apps = apps;
    },
    SET_ALL_APPS(state, allapps) {
      state.allapps = allapps;
    },
    SET_LOADING_APPS(state, status) {
      state.loadingApps = status;
    },
    SET_LOADING_SIDEBAR(state, status) {
      state.loadingSidebar = status;
    },
    SET_SELECTED_FOLDER(state, folder) {
      state.selectedFolder = folder;
    },
    SET_LOADING_SUMMARIES(state, status) {
      state.loadingSummaries = status;
    },
  },
  actions: {
    async updateSelectedOrg({ commit }, org) {
      try {
        commit("SET_LOADING_SIDEBAR", true);
        commit("SET_LOADING_APPS", true);
        commit("SET_SELECTED_FOLDER", { id: "root", name: "All Apps" });
        let selectedOrg = {id: "private", name: "Default"};
        if (org.id !== "private") {
          selectedOrg = await Services.getOrgService().findOrganization(
            org.id
          );
        }
        commit("SET_SELECTED_ORG", selectedOrg);
      } catch (e) {
        console.log("Cannot get organization entity", e);
      } finally {
        commit("SET_LOADING_SIDEBAR", false);
        commit("SET_LOADING_APPS", false);
      }
    },
    filterAppsByFolder({ commit, state }, { apps, loading }) {
      const folderId = state.selectedFolder.id;
      let filteredApps;

      if (!folderId || folderId === "root") {
        // Conditionally add loading property during the initial mapping
        filteredApps = apps.map((app) =>
          loading ? { ...app, loading: false } : app
        );
      } else {
        const folder = state.selectedOrg.folders[folderId];
        const folderApps = (folder && folder.apps) || [];

        // Filter and conditionally add loading property in one step
        filteredApps = apps.reduce((result, app) => {
          if (folderApps.includes(app.id)) {
            result.push(loading ? { ...app, loading: false } : app);
          }
          return result;
        }, []);
      }

      commit("SET_APPS", filteredApps);
    },
    async loadSummaries({ commit, state, dispatch }) {
      try {
        commit("SET_LOADING_APPS", true);
        let summaries;
        summaries =
          await Services.getOrgService().findAppsSummaryByOrganization(
            state.selectedOrg.id || "private"
          );
        dispatch("filterAppsByFolder", { apps: summaries, loading: true });
      } catch (e) {
        console.log("Error getting apps", e);
      } finally {
        commit("SET_LOADING_APPS", false);
      }
    },
    async loadApps({ commit, state, dispatch }) {
      try {
        commit("SET_LOADING_SUMMARIES", true);
        let apps = await Services.getOrgService().findAppsByOrganization(
          state.selectedOrg.id || "private"
        );
        commit("SET_ALL_APPS", apps);
        dispatch("filterAppsByFolder", { apps: apps, loading: false });
      } catch (e) {
        console.log("Error getting apps", e);
      } finally {
        commit("SET_LOADING_SUMMARIES", false);
      }
    },
    async updateSelectedFolder({ commit, state, dispatch }, folder) {
      try {
        commit("SET_LOADING_APPS", true);
        commit("SET_SELECTED_FOLDER", folder);
        dispatch("filterAppsByFolder", { apps: state.allapps });
      } catch (e) {
        console.log("Cannot update folder", e);
      } finally {
        commit("SET_LOADING_APPS", false);
      }
    },
    async reloadOrganization({ commit }, organization) {
      try {
        let org = {id: "private", name: "Default"};
        if (organization.id !== "private") {
          org = await Services.getOrgService().findOrganization(
            organization.id
          );
        }
        commit("SET_SELECTED_ORG", org);
      } catch (e) {
        console.log("Cannot reload organization", e);
      }
    },
    onCleanFolder({ commit }) {
      commit("SET_SELECTED_FOLDER", {});
    },
  },
  getters: {
    selectedOrg: (state) => state.selectedOrg,
  },
});
