<template>
 <div>
  	
      <Panel>
            {{metrics}}
      </Panel>
  
  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import AdminService from './AdminService'
import Services from 'services/Services'

import { Chart } from "frappe-charts/dist/frappe-charts.min.esm"

export default {
  props:[''],
  data: function() {
    return {
      searchFilter: '',
      chartHeight: 250,
      chartColors: ['#3787f2', '#92c500', '#7cd6fd', '#743ee2'],
      chartFill: 0,
      metrics: {}
    };
  },
  components: {Panel},
  computed: {
  },
  methods: {
    renderCharts () {
        //let series = this.getAggregatedSeries(this.performance)
        //this.renderCPU(series)
        //this.renderRAM(series)
    },

    renderCPU (series) {

        const data = {
            labels: series.map(e => e.hour),
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
            labels: series.map(e => e.hour),
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

    getAggregatedSeries (events){
			events.sort((a,b) => {
				return a.created - b.created;
			});
			
			let series = [];
			let lastTimestamp = "";
			let entry=null;
			for(let i=0; i < events.length; i++){
				let event = events[i];
				let d = new Date(event.created);
				d.setMinutes(0);
				d.setMilliseconds(0);
				let timestamp = d.getFullYear() + "." +d.getMonth() + "." + d.getDate() +":"+d.getHours();
				if(timestamp!= lastTimestamp || entry==null){
					entry = {
                        hour: d.getHours(),
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
    this.metrics = await this.adminService.getMetrics()
    this.renderCharts()
  }
}
</script>

