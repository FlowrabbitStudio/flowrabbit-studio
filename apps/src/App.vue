<template>
  <div id="app" class="luisa">
    <router-view/>
  </div>
</template>

<style lang="scss">
  @import "./scss/app.scss";
  @import './scss/common.scss';

</style>

<script>

import Logger from './util/Logger'
import '@mdi/font/css/materialdesignicons.css'



export default {
  name: 'App',
  data: function () {
    return {
    }
  },
  components: {
  },
  methods: {
  },
  async mounted () {
    Logger.log(-1, 'App.mounted() > UI: 1.0.0     > Server :')
  }
}
</script>
