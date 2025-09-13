<template>
  <div id="app" class="MCU">
  	<header>
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
        
          <a
            role="button"
            class="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            @click="showNav = !showNav"
            :class="{ 'is-active': showNav }"
           >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div  class="navbar-menu " :class="{ 'is-active': showNav }" >
          <div class="navbar-start">
            <router-link to="/mcu/users.html" class="navbar-item">Users</router-link>
            <router-link to="/mcu/organizations.html" class="navbar-item">Organization</router-link>
            <router-link to="/mcu/apps.html" class="navbar-item">Apps</router-link>
            <router-link to="/mcu/secrets.html" class="navbar-item">Secrets</router-link>
           
            <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link">Log</a>
                <div class="navbar-dropdown MatcNavDropDown">
                  <router-link to="/mcu/log.html" class="navbar-item">Log</router-link>
                  <router-link to="/mcu/errors.html" class="navbar-item">Errors</router-link>
                  <router-link to="/mcu/events.html" class="navbar-item">Events</router-link>
                </div>
            </div>

            <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link">Analytics</a>
                <div class="navbar-dropdown MatcNavDropDown">
                  <router-link to="/mcu/dash-performance.html" class="navbar-item">System</router-link>
                  <router-link to="/mcu/dash-analytics.html" class="navbar-item">Analytics</router-link>                
                  <router-link to="/mcu/dash-metrics.html" class="navbar-item">Metrics</router-link>
                  <router-link to="/mcu/dash-db.html" class="navbar-item">DB</router-link>
                  <router-link to="/mcu/dash-users.html" class="navbar-item">Users</router-link>
                </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    </header>
    <div class="MatcContainer">
      <router-view ></router-view>
    </div>

  </div>
</template>

<style>

</style>
<style lang="scss">

  @import "../../style/mcu/mcu.scss";
</style>
<style lang="sass">
  @import "../../style/matc.css"
  @import "../../style/bulma.sass"
</style>

<script>
import Services from 'services/Services'
import Logger from 'common/Logger'


export default {
   data: function() {
    return {
      showNav: false
    };
  },
  methods: {
   
	},
  mounted () {
    this.logger = new Logger('MCU')
    this.logger.log(-1, 'mounted')
    let user = Services.getUserService().getUser()
    if (!user || user.role !== 'admin') {
      let e = new Error('No admin tried access to MCu from ' + user.email)
      this.logger.error('mounted', 'NO ADMIN')
      this.logger.sendError(e)
      this.$router.push('/')
    }
  }
}
</script>

