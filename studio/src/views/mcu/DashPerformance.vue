<template>
 <div>
    <Panel :transparent="true">   
        <div class="MCUTopBar">
             <h1></h1>
            <div class="MCUHourSliderCntr">
                <span>{{selectedHourLabel}} </span>
                <input type="range" min="-1" max="24" value="-1" class="MCUHourSlider" v-model="selectedHour" @change="onHourChange">
            </div>
        </div>
    </Panel>
  
    <Panel>   
         <div class="MCUTopBar">
            <h1>CPU</h1>
             <CheckBox  label="Show max" @change="onMaxChange()"/>
        </div>
        <div ref="cpuChart" />
    </Panel>

     <Panel>
        <div class="MCUTopBar">
          <h1>Requests Count</h1>
         
        </div>
        <div ref="requestChartCount" />
    </Panel>

    <Panel>
       <div class="MCUTopBar">
          <h1>Requests Time</h1>
        </div>
        <div ref="requestChartTime" />
    </Panel>

    <Panel>
        <h1>RAM</h1>
        <div ref="ramChart" />
    </Panel>

    <Panel>
        <h1>DISK</h1>
        <div ref="diskChart" />
    </Panel>
  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import AdminService from './AdminService'
import Services from 'services/Services'
import CheckBox from 'common/CheckBox'


import { Chart } from "frappe-charts/dist/frappe-charts.min.esm"

export default {
  props:[''],
  data: function() {
    return {
      searchFilter: '',
      selectedHour: -1,
      chartHeight: 250,
      chartColors: ['#3787f2', '#92c500', '#7cd6fd', '#f9472e', '#743ee2'],
      chartFill: 0,
      includeMax: false,
      performance: {},
      requests: []
    };
  },
  components: {Panel, CheckBox},
  computed: {
    selectedHourLabel () {
        if (this.selectedHour == -1) {
            return '1 Day'
        } 
        return this.selectedHour +'h'
    }
  },
  methods: {
    onHourChange () {
        console.debug('onHourChange', this.selectedHour)
        this.renderCharts()
    },
    onMaxChange () {
        this.includeMax = !this.includeMax
        this.renderCharts()
    },
    renderCharts () {
        let series = this.getAggregatedSeries(this.performance, this.selectedHour * 1)
        let requests = this.getAggregatedRequests(this.requests, this.selectedHour * 1)
        this.renderCPU(series)
        this.renderRAM(series)
        this.renderDISK(series)
        this.renderRequestsCount(requests)
        this.renderRequestsTime(requests)
    },

    renderRequestsTime (series) {
        
        const data = {
            labels: series.map(e => e.label),
            datasets: [
                {
                    name: "Mean", type: "line",
                    values: series.map(e => Math.round(e.data.mean))
                },
                {
                    name: "Max", type: "line",
                    values: series.map(e => e.data.max)
                },
                {
                    name: "Min", type: "line",
                    values: series.map(e => e.data.min)
                } 
            ]
        }

        new Chart(this.$refs.requestChartTime, { 
            data: data,
            type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
            height: this.chartHeight,
            colors: this.chartColors,
            lineOptions: {
                regionFill: this.chartFill
            },
            tooltipOptions: {
                formatTooltipY: d => d + ' ms',
            }
        })
    },

    renderRequestsCount (series) {
  

        const data = {
            labels: series.map(e => e.label),
            datasets: [
                {
                    name: "Count Mean", type: "line",
                    values: series.map(e => Math.round(e.data.count  / e.data.total))
                },
                {
                    name: "Count Max", type: "line",
                    values: series.map(e => e.data.countMax)
                },
                {
                    name: "Count Min", type: "line",
                    values: series.map(e => e.data.countMin)
                }   
            ]
        }

        new Chart(this.$refs.requestChartCount, { 
            data: data,
            type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
            height: this.chartHeight,
            colors: this.chartColors,
            lineOptions: {
                regionFill: this.chartFill
            },
            tooltipOptions: {
               formatTooltipY: d => d + ' r/m',
            }
        })
    },

    renderDISK (series) {

        const data = {
            labels: series.map(e => e.label),
            datasets: [
                {
                    name: "DiskTotal", type: "line",
                    values: series.map(e => this.toGB(e.data.DiskTotal.mean))
                },
                {
                    name: "DiskUsable", type: "line",
                    values: series.map(e => this.toGB(e.data.DiskUsable.mean))
                },
                {
                    name: "DiskUnallocated", type: "line",
                    values: series.map(e => this.toGB(e.data.DiskUnallocated.mean))
                }   
            ]
        }

        new Chart(this.$refs.diskChart, { 
            data: data,
            type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
            height: this.chartHeight,
            colors: this.chartColors,
            lineOptions: {
                regionFill: this.chartFill
            },
            tooltipOptions: {
                formatTooltipY: d => d + ' GB',
            }
        })
    },

   

    renderCPU (series) {
    
        const data = {
            labels: series.map(e => e.label),
            datasets: [
                {
                    name: "ProcessCpuLoad", type: "line",
                    values: series.map(e => e.data.ProcessCpuLoad.mean * 100)
                },
                {
                    name: "SystemCpuLoad", type: "line",
                    values: series.map(e => e.data.SystemCpuLoad.mean * 100)
                },
                {
                    name: "SystemLoadAverage", type: "line",
                    values: series.map(e => e.data.SystemLoadAverage.mean * 100)
                }
            ]
        }

        if (this.includeMax) {
            data.datasets.push({
                name: "SystemLoadAverageMax", type: "line",
                values: series.map(e => e.data.SystemLoadAverage.max * 100)
            })
        }

        new Chart(this.$refs.cpuChart, { 
            data: data,
            type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
            height: this.chartHeight,
            colors: this.chartColors,
            lineOptions: {
                regionFill: this.chartFill
            },
            tooltipOptions: {
                formatTooltipY: d => Math.round(d * 100) / 100 + ' %',
            }
        })
    },

    renderRAM (series) {

        const data = {
            labels: series.map(e => e.label),
            datasets: [
                {
                    name: "Physical Memory", type: "line",
                    values: series.map(e => this.toMB(e.data.TotalPhysicalMemorySize.mean) )
                },
                {
                    name: "Used Memory", type: "line",
                    values: series.map(e => this.toMB(e.data.totalMemory.mean - e.data.freeMemory.mean))
                },
                {
                    name: "Max JVM Memory", type: "line",
                    values: series.map(e => this.toMB(e.data.maxMemory.mean))
                }
            ]
        }

        new Chart(this.$refs.ramChart, { 
            data: data,
            type: 'line', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
            height: this.chartHeight,
            colors: this.chartColors,
            lineOptions: {
                regionFill: this.chartFill
            },
             tooltipOptions: {
                formatTooltipY: d => d + ' MB',
            }
        })
    },

    toMB (bites) {
        let mb = bites / (1024 * 1024)
        return Math.round(mb)
    },

    toGB (bites) {
        let mb = bites / (1024 * 1024 * 1024)
        return Math.round(mb)
    },

    toTimeStampKey (d, isHour) {
        if (isHour) {
            return d.getFullYear() + "." +d.getMonth() + "." + d.getDate() +"/"+d.getHours() +":"+d.getMinutes();
        } else {
            return d.getFullYear() + "." +d.getMonth() + "." + d.getDate() +"/"+d.getHours();
        }
    },

    toEventList (events, selectedHour) {
        events.sort((a,b) => {
            return a.created - b.created;
        });
        
        if (selectedHour >= 0) {
            events = events.filter(e => {
                const d = new Date(e.created);
                return d.getHours() === selectedHour
            })
        }
        return events
    },

    getAggregatedRequests (events, selectedHour) {
        const isHours = selectedHour >= 0
        events = this.toEventList(events, selectedHour)

        // events.forEach(e=> {
        //     const d = new Date(e.created);
        //     console.debug(d.getHours(), d.getMinutes(), e.count)
        // })
      
        const series = [];
        let lastTimestamp = "";
        let entry=null;
        for(let i=0; i < events.length; i++){
            const event = events[i];
            const d = new Date(event.created);
            const timestamp = this.toTimeStampKey(d, isHours)
            if(timestamp != lastTimestamp || entry == null){
                entry = {
                    label: isHours ? d.getMinutes() : d.getHours(),
                    time: d.getTime(),
                    data: {
                        max:0,
                        countMax: 0,
                        countMin: 1000000000,
                        min : 1000000000,
                        count : 0,
                        total: 0,
                        mean:0
                    }
                };
                series.push(entry);
            }
            lastTimestamp = timestamp;
            
            entry.data.total++;
            entry.data.count += event.count;
            entry.data.countMax = Math.max(entry.data.countMax, event.count);
            entry.data.countMin = Math.min(entry.data.countMin, event.count);
            entry.data.max = Math.max(entry.data.max, event.max);
            entry.data.min = Math.min(entry.data.min, event.min);
            entry.data.mean += event.mean;
                
                    
        }

        
        return series;
    },

    getAggregatedSeries (events, selectedHour = -1){
        const isHours = selectedHour >= 0
        events = this.toEventList(events, selectedHour)
    

        
        let series = [];
        let lastTimestamp = "";
        let entry=null;
        for(let i=0; i < events.length; i++){
            let event = events[i];
            let d = new Date(event.created);
            let timestamp = this.toTimeStampKey(d, isHours)
            if(timestamp != lastTimestamp || entry == null){
                entry = {
                    label: isHours ? d.getMinutes() : d.getHours(),
                    time: d.getTime(),
                    data: {}
                };
                series.push(entry);
            }
            lastTimestamp = timestamp;
            
            /**
             * Now add all the measure measurements and aggregate them
             */
            for (let key in event){
                if (key !== "created" && key!=="_id"){
                    if(!entry.data[key]){
                        entry.data[key] = {
                            max:0,
                            min : 1000000000,
                            count : 0,
                            sum:0
                        };
                    }
                    var summary = entry.data[key];
                    var value = event[key];
                    summary.count++;
                    summary.sum += value;
                    summary.max = Math.max(summary.max, value);
                    summary.min = Math.min(summary.min, value);
                    summary.mean = summary.sum / summary.count;
                }
            }				
        }
        
        return series;
	}
  },
  async mounted () {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
    this.performance = await this.adminService.getPerformance()
    this.requests = await this.adminService.getRequests()
    this.renderCharts()
  }
}
</script>

