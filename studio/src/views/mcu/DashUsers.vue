<template>
 <div>

    
     <Panel>

        <div class="MCUTopBar">
          <h1>Sign Ups</h1>
          <WeekPicker @change="onChangeWeek" v-model="offset"/>
        </div>
        <div ref="signupChart" />

         <div class="MCUDomainCntr">
           <a v-for="domain in signUpDomains" :key="domain.domain" :href="'https://' + domain.domain" target="_blank">
             <span class="domain">{{domain.domain}}</span> <span class="value">{{domain.value}} </span>
           </a>
         </div>
    </Panel>



    <Panel>
        <div class="MCUTopBar">
          <h1>Logins</h1>
          <WeekPicker @change="onChangeWeek" v-model="offset" /> 
        </div>
      <div ref="loginChart" />

       <div class="MCUDomainCntr">
           <a v-for="domain in loginDomains" :key="domain.domain" :href="'https://' + domain.domain" target="_blank">
             <span class="domain">{{domain.domain}}</span> <span class="value">{{domain.value}} </span>
           </a>
         </div>
    </Panel>

    <Panel>
        <div class="MCUTopBar">
          <h1>User Domains</h1>
        </div>
   
       <div class="MCUDomainCntr">
           <a v-for="domain in userDomains" :key="domain.domain" :href="'https://' + domain.domain" target="_blank">
             <span class="domain">{{domain.domain}}</span> <span class="value">{{domain.value}} </span>
           </a>
         </div>
    </Panel>
  
  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import WeekPicker from './WeekPicker.vue'
import AdminService from './AdminService'
import Services from 'services/Services'
import { Chart } from "frappe-charts/dist/frappe-charts.min.esm"
import * as Util from './MCUUtil'

export default {
  props:[''],
  data: function() {
    return {
      day: 1000 * 24 * 60 * 60,
      week: 1,
      offset: 0,
      searchFilter: '',
      events: [],
      users: [],
      countsByTypeByDay: {},
      chartHeight: 250,
      chartColors: ['#3787f2', '#92c500', '#7cd6fd', '#743ee2'],
      chartFill: 0,
      signUpDomains: [],
      loginDomains: [],
      userDomains: []
    };
  },
  components: {Panel, WeekPicker},
  computed: {
    filteredUsers () {
      if (this.searchFilter.length > 2) {
        let filter = this.searchFilter.toLowerCase()
        return this.users.filter(u => {
          if (u.name && u.name.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
          if (u.lastname && u.lastname.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
           if (u.email && u.email.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
          return false
        })
      }
      return this.users
    }
  },
  methods: {
    onChangeWeek (from, to, offset) {
      this.offset = offset
      this.adminService.getAllAppEvents(from, to, '').then(e => this.setEvents(e))
    },
    setEvents (events) {
      this.events = events
      this.countsByTypeByDay = {}
      this.domains = []
      this.events.forEach(e => {
        let d = Util.printDate(e.created)
        if (!this.countsByTypeByDay[e.type]) {
          this.countsByTypeByDay[e.type] = {}
        }
        if (!this.countsByTypeByDay[e.type][d]) {
          this.countsByTypeByDay[e.type][d] = 0
        }
        this.countsByTypeByDay[e.type][d] += 1

      })
      this.renderSignUps()
      this.renderSignUpDomains()
      this.renderLogins()
      this.renderLoginDomains()
    },
    renderSignUpDomains () {
      let signups = this.events.filter(e => e.type === 'USER_SIGNUP')
      this.signUpDomains = Util.getEmailCounts(signups.map(e => e.user))
    },
    renderLoginDomains () {
      let signups = this.events.filter(e => e.type === 'USER_LOGIN')
      this.loginDomains = Util.getEmailCounts(signups.map(e => e.user))
    },
    renderSignUps () {
      let signups = this.countsByTypeByDay['USER_SIGNUP']

      const data = {
            labels: Object.keys(signups),
            datasets: [
                {
                    name: "SignUps", type: "line",
                    values: Object.values(signups)
                }
            ]
        }

        new Chart(this.$refs.signupChart, { 
            data: data,
            type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
            height: this.chartHeight,
            colors: this.chartColors,
            lineOptions: {
                regionFill: this.chartFill
            },
            //tooltipOptions: {
            //    formatTooltipX: d => (d + '').toUpperCase()
            //}
        })
    },
    renderLogins () {
    

       let logins = this.countsByTypeByDay['USER_LOGIN']
   
       const data = {
            labels: Object.keys(logins),
            datasets: [
                {
                    name: "Logins", type: "line",
                    values: Object.values(logins)
                }
            ]
        }

        this.loginChart = new Chart(this.$refs.loginChart, { 
            data: data,
            type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
            height: this.chartHeight,
            colors: this.chartColors,
            lineOptions: {
                regionFill: this.chartFill
            }
        })
    },
    loadEvents () {
      let now = new Date().getTime()
      let w = (this.day * 7 * this.week)
      let from = now - w  - this.offset * w
      let to = now - this.offset * w
      this.adminService.getAllAppEvents(from, to, '').then(e => this.setEvents(e))
    },
    async loadUsers () {
      let users = await this.adminService.getAllUsers().then(u => this.users = u)
      this.userDomains = Util.getEmailCounts(users.map(e => e.email), ['gmail.com', 'hotmail.com', 'outlook.com', 'live.com', 'yahoo.com', 'yahoo.com.br'])
    }
	},
  async mounted () {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
    this.loadEvents()
    this.loadUsers()
  
  }
}
</script>

