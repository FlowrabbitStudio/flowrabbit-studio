<template>
    <div class="MatcLight">
      <h1 >Make Test</h1>

  
  
  
  
      <div class="MatcDialog" style="display: inline-block; width:auto; vertical-align: top; margin-left:30px;">
          <MakeSettings 
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
  </style>
  
  <script>
  
  import MakeSettings from '../../src/canvas/toolbar/api/MakeSettings.vue'
  
  export default {
    name: "ResizeTest",
    mixins: [],
    data: function() {
      return {
        app: {
            id: '67391053028d795087c5b95d'
        },
        loaded:false,
        hash:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QiLCJhcHBQZXJtaXNzaW9uIjoxLCJhcHBJRCI6IjY3MzkxMDUzMDI4ZDc5NTA4N2M1Yjk1ZCIsImlzcyI6Ik1BVEMiLCJuYW1lIjoiS2xhdXMiLCJpZCI6IjY0NjY4ZmU4NGNkYzE0NDZiYWMxZDEyYiIsInRva2VuVHlwZSI6ImFwcFRva2VuIiwiZXhwIjoxNzMyNDc0NDY5LCJlbWFpbCI6ImtsYXVzLnNjaGFlZmVyc0BnbWFpbC5jb20iLCJvcmdJRCI6InByaXZhdGUifQ.LyHNa_mSp-V0fCkeN0LVk83-CyLp8OX-OPcKQWY9XR8',
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
            "baseURL": "eu2.make.com",
            "token": "",
            "template": "{}",
            "url": "https://eu2.make.com/organization/1657888/dashboard",
            "orgID": "1657888"
        },
        databinding: {
            default:''
        },
        options : [
        ],
        selectedTest: 0
      };
    },
    components: {
        MakeSettings: MakeSettings
    },
    computed: {
    },
    methods: {
        onFileChange (f) {
          console.debug(f)
        },
        setAPIAndDatabinding (api) {
            this.settings = JSON.stringify(api, null, 2)
            localStorage.setItem('MakeSettingsTest', this.settings)
        }
    },
    mounted() {
        const s = localStorage.getItem('MakeSettingsTest')
        if (s) {
            this.api = JSON.parse(s)
            this.settings = s
        }
        this.loaded = true
    }
  };
  </script>
  