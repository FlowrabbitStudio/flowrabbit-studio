<template>
    <div class="MatcLight">
      <h1>NavidationEditor Test</h1>
      <div class="MatcTReeCntr">
          <NavidationEditor :value="items" @select="onSelect" ref="editor"/>
      </div>
      {{selection}}
  
  
    </div>
  </template>
  
  <style lang="css">

    @import "../style/matc.css";
    @import "../style/toolbar/all.css";   


    .MatcTReeCntr {
        background: #fff;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        display: inline-block;
        padding: 5px;
        width: 800px;
        height: 500px;
        overflow: scroll;
        margin-left: 30px;
        font-size: 14px;
    }
  </style>
<style lang="sass">
  @import "../style/bulma.sass"
</style>
  <script>
  import NavidationEditor from '../../src/canvas/toolbar/components/NavidationTable.vue'
  
  export default {
    name: "TreeEditorTest",
    mixins: [],
    data: function() {
      return {
        selection: [],
        screens: [
            {label: 'Screen 1', value: 's1'},
            {label: 'Screen2', value: 's2'},
            {label: 'Screen3', value: 's3'},
            {label: 'Screen4', value: 's4'},
            {label: 'None', value: '', css:'passive'},
        ],
        items: [
          {id: '1', label: '#1 Box 1XXX', icon: '', to: "s1"},
          {id: '2', label: '#2 Box 2', icon: '', to: "s2"},
          {id: '3', label: '#1 Box 1', icon: '', to: "s3"},
          {id: '4', label: '#2 Box 2', icon: '', to: "s4"},
        ]
      };
    },
    components: {
      'NavidationEditor': NavidationEditor
    },
    methods: {
        onSelect (d) {
            this.selection = d
        }
    },
    mounted() {
      this.$refs.editor.setScreens(this.screens)
    }
  };
  </script>
  