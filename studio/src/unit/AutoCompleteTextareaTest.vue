<template>
    <div class="MatcPadding MatcDialog" id="" style="padding: 100px;">
      
        <AutoCompleteTextarea v-model="text" :options="options" @change="onChange"></AutoCompleteTextarea>
     

        <div style="margin-top: 40px;">
            {{text}}
        </div>
  
    </div>
  </template>
    
  <style lang="scss">
    @import url("../style/matc.css");
  </style>
    
  <script>

  import AutoCompleteTextarea from 'page/AutoCompleteTextarea'

  export default {
    name: "home",
    mixins: [],
    data: function () {
      return {
        text: 'Klaus was here',
        options: ['${aaa}', '${aaabbb}', '${ccc}']
      };
    },
    components: {
        AutoCompleteTextarea
    },
    methods: {
        onChange (t) {
            console.debug(t)
        }
    },
    mounted() {
    }
  };
  </script>
    