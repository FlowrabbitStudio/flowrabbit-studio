<template>
    <section class="MatcCard" aria-label="API Usage">
      <header class="MatcCardHeader">
        <h2>API Usage</h2>
      </header>
      <div class="MatcCardContent">
        <p v-if="!hasApiCalls">
          No API usage data available.
        </p>
        <table v-else class="api-usage-table">
          <thead>
            <tr>
              <th>API Name</th>
              <th>Usage</th>
              <th>Max</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(apiData, apiName) in selectedOrg.apiCalls"
              :key="apiName"
            >
              <td>{{ apiName }}</td>
              <td>{{ apiData.currentApiCalls }}</td>
              <td>
                <span v-if="apiData.maxApiCalls !== undefined">
                  {{ apiData.maxApiCalls }}
                </span>
                <span v-else>—</span>
              </td>
              <td>
                <div
                  v-if="apiData.maxApiCalls !== undefined"
                  class="progress-bar-container"
                >
                  <div
                    class="progress-bar"
                    :style="{ width: computeWidth(apiData) + '%' }"
                  ></div>
                </div>
                <div v-else>N/A</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: "ApiUsage",
    props: {
      selectedOrg: {
        type: Object,
        required: true,
      },
    },
    computed: {
      hasApiCalls() {
        const calls = this.selectedOrg.apiCalls;
        return calls && Object.keys(calls).length > 0;
      },
    },
    methods: {
      computeWidth(apiData) {
        const { currentApiCalls, maxApiCalls } = apiData;
        if (!maxApiCalls) return 0;
        // Prevent division by zero
        const usage = (currentApiCalls / maxApiCalls) * 100;
        return usage > 100 ? 100 : usage;
      },
    },
  };
  </script>
  
  <style scoped>
  .api-usage-table {
    width: 100%;
    border-collapse: collapse;
  }
  .api-usage-table th,
  .api-usage-table td {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #ddd;
    text-align: left;
  }
  .progress-bar-container {
    background: #f0f0f0;
    width: 100%;
    height: 10px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  .progress-bar {
    background: #2196f3;
    height: 100%;
    transition: width 0.3s;
  }
  </style>
  