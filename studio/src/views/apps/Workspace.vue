<template>
  <div>
    <div class="MatcWorkspace">
      <div class="MatcWorkspaceCntr">
        <section class="MatcSection">
          <div class="MatcWorkspaceHeaderBlock">
            <div class="MatcWorkspaceHeaderContent">
              <div class="MatcWorkspaceHeader">
                <span class="MatcFlex MatcWorkspaceTitle">
                  <a @click="onBack()" class="MatcFolderName">
                    {{ selectedFolder.name }}
                  </a>
                  <span class="mdi mdi-chevron-right"></span>
                  <p class="MatcAppName">{{ app.name }}</p>
                </span>
              </div>
              <div class="MatcWorkspaceButtons">
                <div class="MatcButton MatcWorkspaceButton" @click="goToCanvas()">
                  Edit
                </div>
                <div class="MatcButton MatcButtonPrimary" v-if="isPublicApp" @click="redirectToPublicUrl()">
                  Preview
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Create three tabs-->
        <div class="MatcWorkspaceTabs">
          <div class="MatcWorkspaceTab" @click="tab = 'settings'" :class="{ active: tab == 'settings' }">
            <QIcon size="20" icon="Settings"></QIcon>Settings
          </div>    
          <div class="MatcWorkspaceTab" @click="tab = 'design'" :class="{ active: tab == 'design' }">
            <QIcon size="20" icon="Screens" ></QIcon>Screens
          </div>

        </div>

        <div v-if="tab == 'design'">
          <ScreenList :app="app" v-if="appLoaded" :pub="isPublic" :hash="hash" />
        </div>

        <div v-if="tab == 'settings'">
          <SettingsTab :loading="loading" :app="app" :user="user" :invitations="invitations" v-if="restLoaded"/>
        </div>
        <div v-if="tab == 'analytics'">
          <AnalyticsTab :loading="loading" :analyticsData="analyticsData" v-if="analyticsLoaded" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../../style/scss/workspace.scss";
</style>

<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import hash from "dojo/hash";
import ScreenList from "page/ScreenList";
import SettingsTab from "./SettingsTab";
import AnalyticsTab from "./AnalyticsTab.vue";  // Import the new component
import Services from "services/Services";
import { mapState, mapActions } from "vuex";
import QIcon from "page/QIcon";
import AnalyticsService from "../../services/AnalyticsService";

export default {
  name: "Overview",
  mixins: [DojoWidget],
  data: function () {
    return {
      hasTeam: false,
      loading: true,
      tab: "settings",
      appID: "",
      app: {
        name: "loading...",
      },
      analyticsData: [],  // New data property for analytics data
      analyticsLoaded: false,  // New data property to indicate if analytics data is loaded
      testSettings: {},
      events: [],
      sessionAnnotations: [],
      invitations: [],
      hash: "",
      appLoaded: false,
      restLoaded: false,
      user: {},
      publicationSettings: {},
      organizations: [],
      modelService: Services.getModelService(),
    };
  },
  components: {
    ScreenList: ScreenList,
    SettingsTab: SettingsTab,
    AnalyticsTab: AnalyticsTab,
    QIcon: QIcon
  },
  computed: {
    ...mapState(["selectedFolder", "selectedOrg"]),
    onBack() {
      return () => {
        hash("#/apps/" + this.selectedOrg.id + ".html");
      };
    },
    redirectToPublicUrl() {
      return () => {
        window.open(this.publicURL, "_blank");
      };
    },
    onSettings() {
      return () => {
        hash(`#/${this.urlPrefix}/${this.appID}/settings.html`);
      };
    },
    publicURL() {
      const org = this.organizations.find((o) => o.id === this.publicationSettings.orgID);
      const orgName = org ? org.name : "private";
      return `${Services.getConfig().app_URL}/${orgName}/${this.publicationSettings.name}.html`;
    },
    goToCanvas() {
      return () => {
        if (this.app.screens && Object.keys(this.app.screens)) {
          const firstScreen = Object.keys(this.app.screens)[0];
          hash(`#/apps/${this.selectedOrg.id}/${this.appID}/design/${firstScreen}.html`);
        } else {
          hash(`#/apps/${this.selectedOrg.id}/${this.appID}/settings.html`);
        }
      };
    },
    isPublicApp() {
      return this.app.publicType === "public" || this.app.publicType === "team";
    },
    isPublic() {
      return this.$route.meta && this.$route.meta.isPublic;
    },
    urlPrefix() {
      if (this.isPublic) {
        return "examples";
      }
      return "apps";
    },
  },
  methods: {
    ...mapActions(["updateSelectedOrg"]),
    scrollTop() {
      window.scrollTo(0, 0);
    },
    async loadApp() {
      let id = this.$route.params.id;
      if (id) {
        this.app = await this.modelService.findApp(id);
        this.appLoaded = true;
        this.loadRest();
        this.loadEvents();
        this.loadAnalytics();  // Load analytics data
      } else {
        this.logger.error("loadApp", "No id ");
        this.logger.sendError(new Error());
      }
    },
    async loadAnalytics() {
      try {
        const analytics = await this.modelService.getAnalytics(this.appID);
        this.analyticsData = analytics;
        this.analyticsLoaded = true;
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    },
    loadEvents() {},
    loadRest() {
      let id = this.$route.params.id;
      Promise.all([
        this.modelService.findInvitation(id),
        this.modelService.findPubSettings(id),
        Services.getOrgService().findUserOrganizations(this.user.id),
      ])
        .then((values) => {
          this.restLoaded = true;
          this.invitations = values[0];
          this.publicationSettings = values[1];
          this.organizations = values[2];
          const orgID = this.$route.params.orgId;
          if (this.publicationSettings && this.publicationSettings.orgID) {
            if (orgID !== this.publicationSettings.orgID) {
              this.$router.push({ path: "/" }).catch((err) => {
                console.log(err);
              });
            }
            if (this.selectedOrg.id !== this.publicationSettings.orgID) {
              const org = { id: this.publicationSettings.orgID };
              this.updateSelectedOrg(org);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    initRoute() {
      if (this.$route.params.tab) {
        this.tab = this.$route.params.tab;
      } else if (this.$route.params.session) {
        this.tab = "video";
      }
      this.scrollTop();
    },
    onWindowFocus() {
      this.loadEvents();
    },
    initFocusListener() {
      this._focusListner = () => {
        this.onWindowFocus();
      };
      window.addEventListener("focus", this._focusListner);
    },
  },
  watch: {
    $route() {
      this.initRoute();
    },
  },
  async mounted() {
    this.logger = new Logger("Overview");
    this.appID = this.$route.params.id;
    this.user = await Services.getUserService().load();
    this.modelService = Services.getModelService(this.$route);
    this.loadApp();
    this.initRoute();
    this.initFocusListener();

    const orgID = this.$route.params.orgId || "private";
    AnalyticsService.log("Workspace", orgID, 'view')
  },
  beforeDestroy() {
    window.removeEventListener("focus", this._focusListner);
    delete this._focusListner;
  },
};
</script>
