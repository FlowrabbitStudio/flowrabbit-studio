<template>
  <div class="MatcLight">
    <h1 style="margin-left:20px; margin-bottom:20px;">DataBinding Test</h1>


   <div class="MatcDialog" style="display:inline-block; width:auto; vertical-align: top; margin-left:30px;">
        <DataBindingTree :app="app" @change="onChange" :value="selectedWidget" :canChangeVars="false" :schema="schema" v-if="!waiting"/>
    </div>

     <code style="
          display: inline-block;
          width: 300px;
          height:300px;
          vertical-align: top;
          word-break: break-all;
          white-space: pre;
          word-wrap: break-word;">{{result}}</code>


  </div>
</template>

<style>
  @import url("../style/matc.css");
  @import url("../style/canvas/all.css");
  @import url("../style/toolbar/all.css");
  @import url("../style/widgets/all.css");
  .MatcDataSettings {
      background: white;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      padding:20px;
  }

  .MatcDialog {
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
  }
</style>

<script>

import DataBindingTree from 'canvas/toolbar/components/DataBindingTree2'
import databinging from './data/databinging.json'
import schema from './data/schema.json'

export default {
  name: "DataSettingsTest",
  mixins: [],
  data: function() {
    return {
      waiting: true,
      app: databinging,
      schema: schema.schema,
      result: {},
      settings: {},
      selectedTest: 3,
      selectedWidget:  {
        "id" : "w10007_32115",
        "type" : "Table",
        "name" : "Text Box 5",
        "props" : {
          "label" : "Enter a value",
          "placeholder" : true,
          "databinding" : {
            "default" : "Table_1",
            "output": "seletcedRow",
            "action": "address.action"
          }
        }
      },
    };
  },
  components: {
    DataBindingTree: DataBindingTree
  },
  computed: {
  },
  methods: {
      onChange (d) {
          this.result = JSON.stringify(d, null, 2)
      }
  },
  mounted() {
    this.waiting = false
  }
};
</script>
