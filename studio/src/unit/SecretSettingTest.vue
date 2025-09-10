<template>
    <div class="MatcLight">
      <h1>Resize Test</h1>
      <div class="MatcToolbarRestSettings" 
        ref="dialog"
        style="display: inline-block; width:auto; vertical-align: top; margin-left:30px; "
        >
         
      </div>
  
  
    </div>
  </template>
  
  <style>
    @import url("../style/matc.css");
    .MatcToolbarRestSettings {
        background: white;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        display: inline-block;

    }

    .MatcDialogContainer .MatcDialogContent{
        border: 1px solid red;
    }
  </style>
  
  <script>
  
  import SecretsDialog from '../canvas/toolbar/dialogs/SecretWizardDialog.vue'
  import * as DojoUtil from '../dojo/DojoUtil'
  
  export default {
    name: "SecretTest",
    mixins: [],
    data: function() {
      return {
        model: {
            id: '67326475028d795087c57f95'
        }
      };
    },
    components: {
    },
    methods: {
        onChange (d) {
            this.settings = d
        }
    },
    mounted() {
        const secrets = DojoUtil.$new(SecretsDialog, {
            app: this.model, 
            close:() =>{},
            setSecrets: this.onChange
        });
        secrets.placeAt(this.$refs.dialog)
    }
  };
  </script>
  