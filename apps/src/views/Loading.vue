<template>
  <div class="luisa-loading">
    <div class="spinner"></div>
  </div>
</template>

<style lang="scss">
@import "../scss/login.scss";
@import "../scss/loading.scss";

.luisa-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; // This ensures the div takes up the full viewport height
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3498db; // You can change this color
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script>
export default {
  name: "LoadingSpinner",
  mixins: [],
  props: [],
  data: function () {
    return {};
  },
  computed: {},
  watch: {},
  components: {},
  methods: {},
  async mounted() {},
};
</script>
