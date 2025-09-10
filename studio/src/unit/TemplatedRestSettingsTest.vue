<template>
  <div class="MatcLight">
    <h1 style="display:inline-block;margin-left:20px; margin-bottom:20px;">REST Test</h1>

    <div>
    <div class="MatcDialog" style="display: inline-block; width:auto; vertical-align: top; margin-left:30px;">
        <RestSettings :app="app" @change="onChange" :value="selectedWidget"/>
    </div>
  </div>

    <code style="
          display: inline-block;
          position: fixed;
          background: #cbe5f3;
          font-size: 10px;
          top:0px;
          right: 0px;
          width: 600px;
          height:45%;
          vertical-align: top;
          overflow: auto;
          word-break: break-all;
          white-space: pre;
          word-wrap: break-word;">{{settings}}</code>


    <code style="
          display: inline-block;
          position: fixed;
          background: #d8f3cb;
          font-size: 10px;
          bottom:0px;
          right: 0px;
          width: 600px;
          height:45%;
          vertical-align: top;
          overflow: auto;
          word-break: break-all;
          white-space: pre;
          word-wrap: break-word;">{{template}}</code>

  </div>
</template>

<style>
  @import url("../style/matc.css");
  @import url("../style/toolbar/all.css");
</style>

<style lang="sass">
  @import "../style/bulma.sass"
</style>

<script>

import RestSettings from 'canvas/toolbar/components/TemplatedRestSettings'
import rest from './data/rest.json'
//import SegmentButton from 'page/SegmentButton'

export default {
  name: "ResizeTest",
  mixins: [],
  data: function() {
    return {
      app: rest,
      settings: {},
      template: "",
      tests: [
          {
            "method": "POST",
            "url": "https://api.openai.com/v1/chat/completions",
            "token": "",
            "authType": "Bearer",
            "vars": {        
            },
            "input": {
                "type": "JSON",
                "template": ""
            },
            "output": {
                "databinding": "abc",
                "template": "",
                "type": "JSON",
                "hints": []
            },
            headers: [
            ]
        }
      ],
      options : [
        {label: "JSON Get", value: 0},
        {label: "JSON Post", value: 1},
        {label: "Image Get", value: 2},
        {label: "Image Post", value: 3},
        {label: "Goolge Vision", value: 4},
        {label: "FORM Post", value: 5},
      ],
      selectedTest: 0
    };
  },
  components: {
    RestSettings: RestSettings,
    //SegmentButton: SegmentButton
  },
  computed: {
    selectedWidget () {
      return  {
            "id" : "Rest",
            "name" : "Rest",
            "type":"Rest",
            "x": 0,
            "y": 0,
            "w": 80,
            "h": 80,
            "props" : {
                "label" : "Rest",
                "wizard": "AirtableRestWizard",
                "template": {
                  title: "OpenAI - GPT",
                  rest: {
                      "method": "POST",
                      "url": "https://api.openai.com/v1/chat/completions",
                      "token": "@{token}",
                      "authType": "Bearer",
                      "vars": {        
                      },
                      "input": {
                          "type": "JSON",
                          "template": ""
                      },
                      "output": {
                          "databinding": "abc",
                          "template": "",
                          "type": "JSON",
                          "hints": []
                      },
                      headers: [
                      ]
                  },
                  elements:[]
                },
                "rest": this.tests[this.selectedTest]
            }
      }
    }
  },
  methods: {
      onFileChange (f) {
        console.debug(f)
      },
      onChange (rest, template) {
          this.settings = JSON.stringify(rest, null, 2)
          this.template = JSON.stringify(template, null, 2)
      }
  },
  mounted() {
    this.onChange()
  }
};
</script>
