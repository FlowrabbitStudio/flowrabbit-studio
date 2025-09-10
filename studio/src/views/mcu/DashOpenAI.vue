<template>
    <div>
   

        <Panel :transparent="true">
            <div class="MCUTopBar MatcMarginBottom">
                <WeekPicker @change="onChangeWeek" v-model="offset" />
                <SearchBar v-model="searchFilter"></SearchBar>
            </div>
        </Panel>
       
        <Panel>
   
           <div class="MCUTopBar">
             <h1>OpenAI</h1>
           </div>
           <div ref="signupChart" />

       </Panel>


       <Panel>
            <h1>Users</h1>
            <DataTable :data="filteredUsers" :size="100" :columns="[
                { id: 'user', key: 'user', label: 'User', width: '20%' },
                { id: 'count', key: 'count', label: 'Count', width: '30%'}
            ]" />
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
   import DataTable from './DataTable.vue'
   import SearchBar from './SearchBar.vue'

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
         chartFill: 0
       };
     },
     components: {Panel, WeekPicker, DataTable, SearchBar},
     computed: {
       filteredUsers () {
         if (this.searchFilter.length > 2) {
           let filter = this.searchFilter.toLowerCase()
           return this.users.filter(u => {            
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
         const users = {}
         this.events.forEach(e => {
           let d = Util.printDate(e.created)
           if (!this.countsByTypeByDay[e.type]) {
             this.countsByTypeByDay[e.type] = {}
           }
           if (!this.countsByTypeByDay[e.type][d]) {
             this.countsByTypeByDay[e.type][d] = 0
           }
           this.countsByTypeByDay[e.type][d] += 1
           if (!users[e.user]){
                users[e.user] = 0
           }
           users[e.user]++
         })

         this.users = Object.keys(users).map(email => {
            return {
                user: email,
                count: users[email]
            }
         })
         console.debug(this.users)

         this.renderCalls()
       },
    
       renderCalls () {
         let signups = this.countsByTypeByDay['TYPE_OPEN_AI']
   
         const data = {
               labels: Object.keys(signups),
               datasets: [
                   {
                       name: "Calls", type: "line",
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
       loadEvents () {
         let now = new Date().getTime()
         let w = (this.day * 7 * this.week)
         let from = now - w  - this.offset * w
         let to = now - this.offset * w
         this.adminService.getAllAppEvents(from, to, 'TYPE_OPEN_AI').then(e => this.setEvents(e))
       }
       },
     async mounted () {
       this.adminService = new AdminService()
       this.adminService.setToken(Services.getUserService().getToken())
       this.loadEvents()
     
     }
   }
   </script>
   
   