<template>
    <div class="MatcLight">
      <h1 >Ionos Docs Test</h1>

  
  
  
  
      <div class="MatcDialog" style="display: inline-block; vertical-align: top; margin-left:30px;">
          <IONOSRagSettings 
            v-if="loaded"
            ref="settings"
            :api="api" 
            :databinding="databinding" 
            :secretKeys="secretKeys" 
            :variableAndSecretHints="variableAndSecretHints"
            :variableHints="variableHints"
            :hints="hints"
            :secretHints="secretHints"
            
            :app="app" 
            :schema="schema"
            :hash="hash"
            @change="setAPIAndDatabinding"/>

      </div>
  
      <code style="
            display: inline-block;
            width: 300px;
            height:300px;
            vertical-align: top;
            word-break: break-all;
            white-space: pre;
            word-wrap: break-word;">{{settings}}</code>
  
    </div>
  </template>
  
  <style>
    @import url("../style/matc.css");
    @import url("../style/toolbar/all.css");
    @import url("../style/qux.css");

    .MatcDialog {
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
      margin: 16px;
      width: 640px;
      height: 600px;
    }
  </style>
  
  <script>
  
  import IONOSRagSettings from '../canvas/toolbar/api/IONOSDocsSettings.vue'
  
  export default {
    name: "ResizeTest",
    mixins: [],
    data: function() {
      return {
        app: {
            id: '674a0ac7ea3f355ca5644829'
        },
        loaded:false,
        hash:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QiLCJhcHBQZXJtaXNzaW9uIjoxLCJhcHBJRCI6IjY3NGEwYWM3ZWEzZjM1NWNhNTY0NDgyOSIsImlzcyI6Ik1BVEMiLCJuYW1lIjoiS2xhdXMiLCJpZCI6IjY0NjY4ZmU4NGNkYzE0NDZiYWMxZDEyYiIsInRva2VuVHlwZSI6InN0dWRpb1Rva2VuIiwiZXhwIjoxNzMzNTI3NDEyLCJlbWFpbCI6ImtsYXVzLnNjaGFlZmVyc0BnbWFpbC5jb20iLCJvcmdJRCI6IjY3MTc3NTBiMDI4ZDc5NTA4N2M0OTNiNiJ9.oihxNDAgap2NSc2qq0Ib1oGDI7ulW6bNpP0WW1pWz58',
        settings: {},
        variableHints:[],
        secretHints:[],
        variableAndSecretHints:[],
        schema: {},
        secretKeys: [
        ],
        hints: [
            {value: 'var1', label: 'var1'}
        ],
        api: {
            "token": "",
            "template": "",
            "url": "",
        },
        databinding: {
            output:'embeddings',
            input: 'query'
        },
        options : [
        ],
        selectedTest: 0
      };
    },
    components: {
      IONOSRagSettings: IONOSRagSettings
    },
    computed: {
    },
    methods: {
        onFileChange (f) {
          console.debug(f)
        },
        setAPIAndDatabinding (api) {
            this.settings = JSON.stringify(api, null, 2)
            localStorage.setItem('IONOSRagSettingsTEST', this.settings)
        }
    },
    mounted() {
        const s = localStorage.getItem('IONOSRagSettingsTEST')
        if (s) {
            this.api = JSON.parse(s)
            this.settings = s
        }
        this.loaded = true
    }
  };
  </script>
  