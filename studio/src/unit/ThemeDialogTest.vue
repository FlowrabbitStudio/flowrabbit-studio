<template>
    <div class="MatcLight">
      <h1>TabelConf Test</h1>
  
      <div class="dialog MatcThemeDialog">
        <ThemeDialog :app="app" />
      </div>
  
  
    </div>
  </template>
  
  <style>
    @import url("../style/matc.css");
    @import url("../style/qux.css");
    .dialog {
      background: #fff;
      padding: 20px;
      display: inline-block;
      margin: 10px;
      margin-left: 300px;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2)
    }
  </style>
  
  <style lang="sass">
    @import "../style/bulma.sass"
    @import "../style/toolbar/all.css"
  </style>
  
  <script>
  

  import app from './data/theme.json'  
  import ThemeDialog from '../../src/canvas/toolbar/dialogs/ThemeDialog.vue'
  
  export default {
    name: "TaskCreatDialogTest",
    mixins: [],
    data: function() {
      return {
          app: app
      };
    },
    components: {
      'ThemeDialog': ThemeDialog
    },
    computed: {
    },
    methods: {
    },
    mounted() {
    }
  };
  </script>
  