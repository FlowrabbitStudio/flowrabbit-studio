<template>
  <div class="luisa-studio">
    <h1>Template Test</h1>

      <div v-if="done">
        here we go
          <component :is="c" v-for="c in components()" :key="c"/>
      </div>

  </div>
</template>

<style lang="scss">
  @import "../scss/studio.scss";
</style>
<script>

import Logger from '../util/Logger'
import ComponentFactory from '../services/CompontFactory'
//import Vue from 'vue/dist/vue.js';
import Vue from 'vue'

export default {
  name: "home",
  mixins: [],
 data: function() {
    return {
      done: false
    }
  },
  components: {

  },
  computed: {
    isGuest () {
      return this.user.role === 'guest'
    }
  },
  methods: {
    components () {
      return this.cf.componets
    }
  },
  watch :{
    '$route' () {
    }
  },
  async mounted() {
    Logger.log(-1, "TemnplateTest.mountd()")
    this.done = false
    this.cf = new ComponentFactory()
    this.cf.create(Vue, 'widget1', '<div>Klaus</div>', {name: 'Papa'})
    this.cf.create(Vue, 'widget2', '<div>{{name}}</div>', {name: 'Papa'})
    setTimeout(() => {
      this.done = true
    }, 100)

  }
};
</script>
