<template>
 <div>
   
    <Panel :transparent="true">   
        <div class="MCUTopBar">
            <h1></h1>
            <div class="MatcListSearchWarpper"> 
                <Combo v-model="selectedOrgID" @change="onChangeOrg" :formControl="true" :hints="orgs" />
            </div>
       

            <div class="MatcButton" @click="deleteAll">
               Delete All
            </div>
        </div>
    </Panel>



    <template v-if="selectedOrgID">

        <Panel>
            <div class="MCUTopBar">
            <h1>Analytics</h1>
            <WeekPicker @change="onChangeWeek" v-model="offset" /> 
            </div>
            <div ref="appsChart" />
        </Panel>


    </template>

    <Panel v-else>
        Search for the org
    </Panel>
        
    
  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import AdminService from './AdminService'
import Services from 'services/Services'
import WeekPicker from './WeekPicker.vue'
import * as Util from './MCUUtil'
import { Chart } from "frappe-charts/dist/frappe-charts.min.esm"
import Input from 'common/Input'

export default {
  props:[''],
  data: function() {
    return {
      day: 1000 * 24 * 60 * 60,
      hasDomains: false,
      week: 1,
      offset: 0,
      chartHeight: 250,
      chartColors: ['#3787f2', '#92c500', '#7cd6fd', '#f9472e', '#743ee2'],
      chartFill: 0,
      events: [],
      selectedOrgID: null,
      countByDomain: {},
      orgs: [],
      limit: 500,
      sortBy:'',
      order:1,
      searchFilter: '',
      data: {
          count: 0,
          limit: 30,
          items: []
      }
    };
  },
  components: {'Panel': Panel, 'WeekPicker': WeekPicker, 'Combo': Input},
  computed: {
  },
  methods: {
    onChangeWeek (from, to, offset) {
      this.offset = offset
      this.adminService.getAnalyticEventSummary(from, to).then(e => this.setEvents(e))
    },

    onChangeOrg(orgID){
        this.selectedOrgID = orgID
        this.loadEvents()
    },


    getValues (key) {
        let v = this.countsByTypeByDay[key] 
        if (!v) {
            v = {}
        }
        return v
    },

    showAll () {
        let apps = this.getValues('Apps') 
        let design = this.getValues('Design') 
        let orgUsers = this.getValues('OrganizationUsers')

        const data = {
            labels: Object.keys(apps),
            datasets: [
                {
                    name: "Design", type: "line",
                    values: Object.values(design)
                },
                {
                    name: "Apps", type: "line",
                    values: Object.values(apps)
                },
                {
                    name: "Org Users", type: "line",
                    values: Object.values(orgUsers)
                }
            ]
        }

        new Chart(this.$refs.appsChart, { 
            data: data,
            type: 'line',
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
    
   
    async loadEvents () {
        let now = new Date().getTime()
        let w = (this.day * 7 * this.week)
        let from = now - w  - this.offset * w
        let to = now - this.offset * w
        const events = await this.adminService.getAnalyticEventSummary(from, to, this.selectedOrgID)
        this.setEvents(events)
    },

    getKey (event) {
        if (event.widget) {
            return event.widget + '@' + event.screen
        }
        if (event.type !== 'view') {
            return event.type + '@' + event.screen
        }
        return event.screen
    },
    setEvents (events) {
        events.sort((a,b) => {
            return a.created - b.created;
        });
        this.events = events
        this.countsByTypeByDay = {}
        this.wwwCountsByTypeByDay = {}
        this.countByOrg = {}
        this.domains = []
        this.events.forEach(e => {
            const d = Util.printDate(e.created)
            const key = this.getKey(e)
            const domain = e.domain ? e.domain : 'quant-ux.com'
            if (!this.countByDomain[domain]) {
                this.countByDomain[domain] = {}
            }
            if (!this.countByDomain[domain][d]) {
                this.countByDomain[domain][d] = 0
            }
            this.countByDomain[domain][d] += e.count

          
            if (!this.countsByTypeByDay[key]) {
                this.countsByTypeByDay[key] = {}
            }
            if (!this.countsByTypeByDay[key][d]) {
                this.countsByTypeByDay[key][d] = 0
            }
            this.countsByTypeByDay[key][d] += e.count
        })
        
        console.debug('countsByTypeByDay', this.countsByTypeByDay)
        this.showAll()

    },

    
    async loadOrgs() {
        const data = await this.adminService
            .findOrgs(this.offset, this.limit, this.sortBy, this.order, 'name', this.searchFilter)
        
        this.orgs = data.items.map(o => {
            return {
                value: o.id,
                label: o.displayName + ' (' + o.name + ')'
            }
        })
    },

    deleteAll () {
        if (confirm('You want to delete all events?')) {
            this.adminService.deleteAnalyticEvents()
        }
    }
  },
  async mounted () {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
    await this.loadOrgs()
    //this.loadEvents()
  }
}
</script>

