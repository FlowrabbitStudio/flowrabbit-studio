<template>
  <div class="Matc">
    <LoginPage v-if="isGuest" @login="onLogin" />
    <div class="MatcContainer" v-else>
      <Header @login="onLogin" @logout="onLogout" />
      <router-view :user="user"></router-view>
    </div>
  </div>
</template>

<style>
@import url("../style/matc.css");
@import url("../style/qux.css");
@import url("../style/fonts.css");
</style>
<style lang="sass">
@import "../style/bulma.sass"
</style>
<script>
import LoginPage from "views/LoginPage";
import Header from "views/Header";
import Services from "services/Services";
import Logger from "common/Logger";
import win from "dojo/win";
import css from "dojo/css";

import { mapState, mapActions } from "vuex";

export default {
  name: "home",
  components: {
    Header,
    LoginPage,
  },
  computed: {
    ...mapState(["user", "selectedOrg"]),
    isGuest() {
      return this.user.role === "guest";
    },
  },
  methods: {
    ...mapActions(["updateSelectedOrg", "loadApps", "loadSummaries"]),
    onLogin(user) {
      this.$store.commit("SET_USER", user);
      this.setOrgByRoute()
      this.logger.info("onLogin", "exit >> " + this.user.email);
    },
    onLogout(guest) {
      this.$store.commit("SET_USER", guest);
      this.logger.info("onLogout", "exit >> " + this.user.email);
    },
    scrollTop() {
      window.scrollTo(0, 0);
    },
    async setOrgByRoute () {
      const orgID = this.$route.params.orgId

      if (this.user.role === "guest") {
        this.logger.log(-1, "setOrgByRoute", "Guest user, skipping org selection")
        return
      }

      let selectedOrg = null
      if (orgID) {
        this.orgID = orgID
        selectedOrg = await Services.getOrgService().findOrganization(orgID)
      } else if (orgID === 'private') {
        selectedOrg = { id: "private", name: "Default" }
      } else {
        const organizations = await Services.getOrgService().findUserOrganizations(this.user.id)
        if (organizations.length > 0) {
          // sort by name to make it predicatable
          organizations.sort((a, b) => a.name.localeCompare(b.name))
          selectedOrg = organizations[0]
        } else {
          this.logger.error("setOrgByRoute", "No organizations found for user: " + this.user.email)
          selectedOrg = { id: "private", name: "Default" }
        }
      }

      this.logger.log(-1, "setOrgByRoute", "orgID: " + orgID, selectedOrg)
      await this.updateSelectedOrg(selectedOrg);
      await this.loadSummaries();
      await this.loadApps();
    }
  },
  watch: {
    async $route() {
      try {
        css.remove(win.body(), "MatcPublic");
        css.remove(win.body(), "MatcVisualEditor");
        css.remove(win.body(), "MatcLight");
        this.scrollTop();
        if (this.$route.meta.isDarkHeader) {
          css.add(win.body(), "MatcDarkHeaderPage");
        } else {
          css.remove(win.body(), "MatcDarkHeaderPage");
        }
           
      } catch (e) {
        console.log(e);
      }
    },
  },
  async mounted() {
    this.logger = new Logger("QUX");
    const user = Services.getUserService().load();

    this.$store.commit("SET_USER", user);
    this.logger.log(-1, "mounted", "locale: " + navigator.language);
    this.setOrgByRoute()
    this.$root.$on("MatcLogout", (user) => {
      this.onLogout(user);
    });
    setTimeout(() => {
      Services.getSymbolService().getCore();
    }, 2000);
  },
};
</script>
