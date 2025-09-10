<template>
    <div class="MatcLight">
      <h1 style="display:inline-block;margin-left:20px; margin-bottom:20px;">Token Input</h1>
  
      <div>
      <div class="MatcDialog" style="display: inline-block; width:auto; vertical-align: top; margin-left:30px;">
            <TokenInput 
                :appID="app"
                :value="api.token" 
                @change="setToken" 
                :hints="secretHintsList" 
                :fireOnBlur="true" 
                :formControl="true"
                :isDropDown="true" 
                domain="http://my.api.com"
                placeholder="You API key"/>
      </div>
    </div>
  
  
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
    import Services from "services/Services";
  import TokenInput from '../common/TokenInput.vue'
  export default {
    name: "TokenInputTest",
    mixins: [],
    data: function() {
      return {
        app: '67326475028d795087c57f95',
        api: {
            token: 'XXX'
        },
        secretHintsList: [
            { "label": "1", "value": "${secrets.token1}", "icon": "mdi mdi-key" },
            { "label": "2", "value": "${secrets.token2}", "icon": "mdi mdi-key" }
        ]
      };
    },
    components: {
        TokenInput: TokenInput
    },
    computed: {
    
    },
    methods: {
        setToken (v) {
            console.debug('setToken', v)
            this.api.token = v
        }
    },
    mounted() {
        this.modelService = Services.getModelService(this.$route)
        this.modelService.addChangeListener('secrets', () => {
           console.debug("change")
        })
    }
  };
  </script>
  