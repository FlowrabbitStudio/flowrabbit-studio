<template>
  <div class="MatcContent MatcSettings">
    <section class="MatcSection">
      <div class="container">
        <div class="MatcCard">
          <div class="MatcCardHeader">
            <p>Analytics</p>
          </div>
          <div class="MatcCardContent">
            <table v-if="analyticsData.length" class="table is-fullwidth">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Model</th>
                  <th>Requests Count</th>
                  <th>Tokens Used</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="data in analyticsData" :key="data._id">
                  <td>{{ data.day }}/{{ data.month }}/{{ data.year }}</td>
                  <td>{{ data.model }}</td>
                  <td>{{ data.count }}</td>
                  <td>{{ data.tokens }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else>Coming soon.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "AnalyticsTab",
  props: {
    analyticsData: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
.table {
  width: 100%;
  margin-bottom: 16px;
  color: #363636;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 8px;
  vertical-align: top;
  border: 1px solid #dbdbdb;
}

.table th {
  background-color: #f5f5f5;
  text-align: left;
}

.table-hover tbody tr:hover {
  background-color: #f9f9f9;
}
</style>
