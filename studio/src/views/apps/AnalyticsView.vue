<template>
    <section class="MatcCard analytics-card" aria-label="Monthly Credits Usage">
      <header class="MatcCardHeader">
        <h2>Monthly Credits Usage</h2>
      </header>
      <div class="MatcCardContent">
        <div v-if="hasAnalytics" class="analytics-chart-container">
          <div class="analytics-chart" role="list">
            <div
              v-for="data in analyticsData"
              :key="data.key"
              class="analytics-bar-item"
              role="listitem"
              :aria-label="`${data.value} credits used in ${data.label}`"
            >
              <div class="bar-wrapper">
                <div
                  class="bar"
                  :style="{ height: barHeight(data.value) + '%' }"
                  :title="`${(data.value / 10000).toLocaleString()} credits in ${data.label}`"
                  role="progressbar"
                  :aria-valuenow="data.value"
                  aria-valuemin="0"
                  :aria-valuemax="maxAnalyticsValue"
                ></div>
              </div>
              <div class="bar-label">{{ data.label }}</div>
            </div>
          </div>
        </div>
        <p v-else>No analytics available.</p>
      </div>
    </section>
  </template>
  
  <script>
  import dayjs from "dayjs";
  
  export default {
    name: "AnalyticsView",
    props: {
      selectedOrg: {
        type: Object,
        required: true,
      },
    },
    computed: {
      hasAnalytics() {
        const a = this.selectedOrg.analytics;
        return a && Object.keys(a).length > 0;
      },
      analyticsData() {
        if (!this.hasAnalytics) return [];
        const entries = Object.entries(this.selectedOrg.analytics).map(
          ([key, value]) => {
            // key = "11-2024", "12-2024", etc.
            const [month, year] = key.split("-").map((n) => parseInt(n, 10));
            const dateObj = dayjs(`${year}-${month}-01`);
            const label = dateObj.isValid() ? dateObj.format("MMM YYYY") : key;
            return { key, value, label };
          }
        );
        // Sort by year-month ascending
        return entries.sort((a, b) => {
          const [am, ay] = a.key.split("-").map((n) => parseInt(n, 10));
          const [bm, by] = b.key.split("-").map((n) => parseInt(n, 10));
          if (ay !== by) return ay - by;
          return am - bm;
        });
      },
      maxAnalyticsValue() {
        if (!this.hasAnalytics) return 1;
        const values = this.analyticsData.map((d) => d.value);
        return Math.max(...values, 1);
      },
    },
    methods: {
      barHeight(value) {
        return (value / this.maxAnalyticsValue) * 100;
      },
    },
  };
  </script>
  
  <style scoped>
  .analytics-card {
    margin-top: 1rem;
  }
  .analytics-chart-container {
    margin-top: 1rem;
    overflow-x: auto;
  }
  .analytics-chart {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    height: 200px;
    padding-bottom: 1rem;
  }
  .analytics-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .bar-wrapper {
    background: #f0f0f0;
    width: 30px;
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    height: 200px;
    transition: background 0.3s ease;
  }
  .bar-wrapper:hover {
    background: #e0e0e0;
  }
  .bar {
    background: #2196f3;
    width: 100%;
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease, background 0.3s ease;
  }
  .bar:hover {
    background: #1976d2;
  }
  .bar-label {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    text-align: center;
    white-space: nowrap;
    color: #555;
  }
  </style>
  