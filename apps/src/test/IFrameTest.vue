<template>
  <div class="home ">
    <h1>Iframe Test </h1>
    <iframe src="/iframe.html" title="description" class="wrapper"></iframe>
  </div>
</template>

<style lang="scss">

.wrapper {
    border: 1px solid red;
    width: 100%;
    height: 2000px;
}

</style>
<script>


export default {
  name: "home",
  mixins: [],
  data: function() {
    return {
     }
  },
  components: {
   
  },
  computed: {
 
  },
  methods: {
   
  },
  watch :{
  },
  async mounted() {
   }
};
</script>
