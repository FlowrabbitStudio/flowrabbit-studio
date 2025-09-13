<template>
  <div class="luisa-studio">
    <h1>Hero Test</h1>
    <div style="width:800px; margin:auto; border:1px solid red; height:500px">
    <Hero label="papa was here" />
    </div>

  </div>
</template>

<style lang="scss">
  @import "../scss/studio.scss";
</style>
<script>


import Hero from '../views/Hero'


export default {
  name: "home",
  mixins: [],
 data: function() {
    return {
      done: false
    }
  },
  components: {
    'Hero': Hero
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

  }
};
</script>
