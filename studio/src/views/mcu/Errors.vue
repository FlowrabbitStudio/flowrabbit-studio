<template>
    <div>

        <Panel :transparent="true">
            <div class="MCUTopBar MatcMarginBottom">
                <WeekPicker @change="onChangeWeek" v-model="offset" />
                <SearchBar v-model="searchFilter"></SearchBar>
                <a class="MatcButton MatcButtonRed" @click="deleteLogs">Delete</a>
            </div>
        </Panel>



        <Panel>
            <h1>Errors</h1>
            <div ref="errorChart" />

        </Panel>

        <Panel>
            <h1>By Source</h1>
            <div ref="errorChartDetails" />

        </Panel>



        <Panel>
            <h1>Log Details</h1>

            <DataTable :data="filteredEvents" :size="100" :columns="[
                { id: 'user', key: 'user', label: 'User', width: '20%' },
                { id: 'cls', key: 'cls', label: 'Source', width: '30%', value: (row) => `${row.cls}.${row.method}()` },
                { id: 'message', key: 'message', label: 'Message', width: '30%', max: 30 },
                { id: 'created', key: 'created', label: 'Created', width: '10%', value: (row) => printDate(row.created) },
            ]" />

        </Panel>


    </div>
</template>
   
<script>

import Panel from './Panel.vue'
import DataTable from './DataTable.vue'
import AdminService from './AdminService'
import Services from 'services/Services'
import WeekPicker from './WeekPicker.vue'
import SearchBar from './SearchBar.vue'

import { Chart } from "frappe-charts/dist/frappe-charts.min.esm"

export default {
    props: [''],
    data: function () {
        return {
            day: 1000 * 60 * 60 * 24,
            offset: 0,
            mode: 'view',
            events: [],
            chartHeight: 250,
            chartColors: ['#b90505', '#3787f2', '#92c500', '#7cd6fd', '#f9472e', '#743ee2'],
            searchFilter: ''
        };
    },
    components: { Panel, DataTable, WeekPicker, SearchBar},
    computed: {
        filteredEvents() {
            if (this.searchFilter.length > 2) {
                let filter = this.searchFilter.toLowerCase()
                return this.events.filter(u => {
                    if (u.user && u.user.toLowerCase().indexOf(filter) >= 0) {
                        return true
                    }
                    if (u.message && u.message.toLowerCase().indexOf(filter) >= 0) {
                        return true
                    }
                    return false
                })
            }
            return this.events
        }
    },
    methods: {
        printDate(ms) {
            var date = new Date(ms);
            return date.toLocaleDateString();
        },
        setChart() {
            let [series, types] = this.getAggregatedSeries(this.events)
  

            const data = {
                labels: series.map(e => e.label),
                datasets: [
                    {
                        name: "Errors", 
                        type: "line",
                        values: series.map(e => e.count)
                    }
                ]
            }

            console.debug(types)

            new Chart(this.$refs.errorChart, { 
                data: data,
                type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
                height: this.chartHeight,
                colors: this.chartColors,
                lineOptions: {
                    regionFill: this.chartFill
                },
                tooltipOptions: {
                    formatTooltipY: d => d,
                }
            })
      

            console.debug(series.map(e => e.label))
            const data2 = {
                labels: series.map(e => e.label),
                datasets: types.map(t => {
                    console.debug(t, series)
                    return {
                        name: t,
                        type: 'Line',
                        values: series.map(e => e.data[t] ? e.data[t].count : 0)
                    }
                })
            }
            console.debug(data2)

            new Chart(this.$refs.errorChartDetails, { 
                data: data2,
                type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
                height: this.chartHeight,
                colors: this.chartColors,
                lineOptions: {
                    regionFill: this.chartFill
                },
                tooltipOptions: {
                    formatTooltipY: d => d,
                }
            })
            

        },
        getAggregatedSeries(events) {


            const series = [];
            const types = new Set()

            let lastTimestamp = "";
            let entry = null;
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                const d = new Date(event.created);
                const timestamp = this.toTimeStampKey(d)
                if (timestamp != lastTimestamp || entry == null) {
                    entry = {
                        label: timestamp,
                        time: d.getTime(),
                        data: {},
                        users: {},
                        count: 0
                    };
                    series.push(entry);
                }
                entry.count++
                lastTimestamp = timestamp;             
                const key = event.cls +'.' + event.method + '()'            
                if (!entry.data[key]) {
                    entry.data[key] = {
                        count: 0
                    };
                }            
                const summary = entry.data[key];               
                summary.count++;
                types.add(key)
                
            }

            return [series, [...types]];
        },
        toTimeStampKey (d, isHour) {
            if (isHour) {
                return d.getFullYear() + "." +d.getMonth() + "." + d.getDate() +"/"+d.getHours() +":"+d.getMinutes();
            } else {
                return d.getFullYear() + "." +d.getMonth() + "." + d.getDate() +"/"+d.getHours();
            }
        },
        async onChangeWeek(from, to) {
            this.events = []
            this.events = await this.adminService.getAllErrorLogs(from, to, '')
            this.setChart()
        },
        async deleteLogs () {
            if (confirm('Do you want to delete the logs?')) {
                await this.adminService.deleteErrorLogs()
                let now = new Date().getTime()
                this.events = await this.adminService.getAllErrorLogs(now - this.day, now, '')
                this.setChart()
            }
        }
    },
    async mounted() {
        this.adminService = new AdminService()
        this.adminService.setToken(Services.getUserService().getToken())
        let now = new Date().getTime()
        this.events = await this.adminService.getAllErrorLogs(now - this.day, now, '')
        this.setChart()
    }
}
</script>
   
   