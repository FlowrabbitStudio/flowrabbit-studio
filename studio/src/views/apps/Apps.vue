<template>
  <div>
    <div class="MatcWorkspace">
      <div class="MatcWorkspaceCntr">
        <div v-if="tab == 'apps'">
          <section class="MatcSection">
            <div class="container">
              <div class="MatcAppListContFlex">
                <div
                  v-if="isOrganizationVisible"
                  class="sidebar-container"
                >
                  <OrganizationSidebar />
                </div>
                <div v-if="!loadingApps" class="content-container">
                  <router-view></router-view>
                </div>
              </div>
            </div>
          </section>
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
import OrganizationSidebar from "./OrganizationSidebar.vue";
import { mapState } from "vuex";
import AnalyticsService from "src/services/AnalyticsService.js";

export default {
  name: "Apps",
  mixins: [DojoWidget],
  props: [],
  data: function () {
    return {
      tab: "apps",
      view: "apps",
    };
  },
  components: {
    OrganizationSidebar,
  },
  computed: {
    ...mapState(["user", "selectedOrg", "loadingApps", "loadingSidebar"]),
    isOrganizationVisible() {
      let visible = false;
      if (
        this.selectedOrg &&
        this.selectedOrg.id &&
        this.selectedOrg.id !== "private"
      ) {
        visible = true;
      }
      return visible;
    },
  },
  methods: {
    scrollTop() {
      window.scrollTo(0, 0);
    }
  },
  watch: {
  },
  async mounted() {
    this.logger = new Logger("Apps");
    this.logger.info("mounted", "exit > ", this.user);

    const orgID = this.$route.params.orgId || "private";
    AnalyticsService.log("AppList", orgID, 'view')
  },
};
</script>

