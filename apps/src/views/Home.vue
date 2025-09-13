<template>
  <div class="luisa-landing luisa-low-code-wrapper">
    <Loading v-if="currentView === 'loading'" />
    <Luisa 
      :isAppStore="isAppStore" 
      :design="app" 
      :config="config" 
      v-model="viewModel" 
      :token="token" 
      v-if="currentView === 'luisa'" 
    />
    <NotFound v-if="currentView === '404'" />
    <Login v-if="currentView === 'login'" @login="onUserLogin" />
    <APPPassword v-if="currentView === 'password'" @login="onAppPassword" ref="appPassword"></APPPassword>
    
    
  </div>
</template>
<style lang="scss">

</style>
<script>

import Services from '../services/Services'
import Logger from '../util/Logger'

import Login from './Login.vue'
import NotFound from './404.vue'
import Loading from './Loading'
import APPPassword from './APPPassword'
import { mapState } from "vuex";

export default {
  name: 'Home',
  data: function () {
    return {
      loadingBalance: false,
      isProcessing: false,
      creditOptions: [
        { value: 10, label: "$10" },
        { value: 20, label: "$20" },
        { value: 50, label: "$50" },
        { value: "custom", label: "Custom" },
      ],
      currentView: 'loading',
      design: '',
      app: false,
      token: '',
      responsive: null,
      defaultApp: '',
      debug: false,
      isQUX: true,
      actions: null,
      viewModel: {
          contact: {
            status: '',
            email: '',
            message: ''
          }          
      },
      config: {
        debug: {
          logLevel: 0
        },
        loadFonts: true,
        loadFontsWarning: false,
        responsive: [
          { page: "Desktop", types: ["desktop", ""] },
          { page: "Mobile", types: ["mobile"] },
        ],
        css: {
          attachLabels: false,
          huggedCanResize: true
        },
        figma: {
          downloadVectors: true,
        },
        router: {
          key: 'screenName',
          prefix: 'embedded'
        }
      },
      domains: {
      },
      appURL: Services.getConfig().app_URL || "apps-os.flowrabbit.ai",
      isAppStore: false
    }
  },
  components: {
    Login, NotFound, Loading, APPPassword
  },
  computed: {
    ...mapState(["user"])
  },
  methods: {
  
  
    onUserLogin () {
      this.loadApp()
    },
    onAppPassword (p) {
      this.appPassword = p
      this.loadApp()
    },
    removeWWWAndProtocol(origin) {
      let url = new URL(origin);
      let hostnameParts = url.hostname.split('.');

      if (hostnameParts[0] === 'www') {
          hostnameParts.shift();
      }
      let hostnameWithoutWWW = hostnameParts.join('.');
      return hostnameWithoutWWW;
    },
    async loadApp () {
      const modelService = Services.getModelService()

      let appName = this.$route.params.appName
      let orgName = this.$route.params.orgName
      let domain = false;
      let hasCustomDomain = false

      if (this.$route?.meta.domain) {
        domain = this.$route?.meta.domain
        hasCustomDomain = true
      }
    
      Logger.log(1, 'Home.loadApp() org: ', orgName + ' > app: ' + appName + " > domain:" + domain)

      if (!appName) {
        Logger.warn('Home.loadApp() > No app or org')
        return
      }

      setTimeout( async () => {
        const pubsettings = await modelService.getPubSettings(orgName, appName, domain, this.appPassword)
        Logger.log(1, 'Home.loadData()' , 'settings', pubsettings)
        if (pubsettings.token) {
          this.currentView = 'luisa'
          this.app = pubsettings.token
          // add here version as well
          this.token = pubsettings.token
          this.config.router.prefix = hasCustomDomain ? `${appName}` : `${orgName}/${appName}`;
          this.config.hasCustomDomain = hasCustomDomain;

        } else if (pubsettings.error === 405) {
          this.currentView = 'login'
        } else if (pubsettings.error === 406) {
          this.currentView = 'password'
          if (this.$refs.appPassword) {
            this.$refs.appPassword.setError()
          }
        } else {
          this.currentView = '404'
        }  
      }, 200)
    }
  },
  watch: {
    // $route() {
    //   this.logger.info("watch", "route");
    //   this.loadApp();
    // }
  },
  async mounted () {
    Logger.log(-1, 'Home.mounted()', location.hostname)
    if (this.$route.query.p) {
      Logger.log(-1, 'Home.mounted() > use query password')
      this.appPassword = this.$route.query.p
    }
    this.loadApp()
  }
}
</script>
