<template>
    <div :class="['VommondTokenInput', {'VommondTokenInputExpanded': hasNew}]">
        
        <Combo 
            :value="value" 
            @change="onChange" 
            :hints="hintValues" 
            :fireOnBlur="true" 
            :formControl="true"
            :isDropDown="true" 
            :placeholder="placeholder" />

        <div class="VommondTokenInputAdd">

            <p class="MatcHint">
                Storing API tokens in plaintext is dangerous. Better create a secret to store the token.
            </p>
            <div class="MatcFlex MatcGapM">
                 <input :class="['form-control', {'form-control-error': hasNewSecretNameError}]" v-model="newSecretName" placeholder="Enter the name of the new secret"/>
                 <button :class="['MatcButton MatcButtonPrimary']" :disabled="!isSecretNameUnique" @click="createSecret">Create</button>
            </div>

        </div>
    </div>
  </template>
  
  <script>
  import Input from './Input.vue'
  import Services from "services/Services";
  import Logger from 'core/Logger'

  export default {
    name: "TokenInput",
    props: [
      "fireOnBlur",
      "top",
      "placeholder",
      "inline",
      "formControl",
      "hints",
      "value",
      "isDropDown",
      "toolbar",
      "actions",
      "magicChar",
      "selectOnEnter",
      "fireEmpty",
      "cssClass",
      "showHintLabel",
      "url",
      "change",
      "appID",
      "domain"
    ],
    data: function() {
      return {
        hasNew: false,
        inputValue:'',
        newSecretName:'',
        hasNewSecretNameError: false,
        data:{secrets:[]},
        errorMSG: '',
        hintValues: this.hints
      };
    },
    components:{
        'Combo': Input
    },
    watch: {
      
    },
    computed: {
        isSecretNameUnique() {
            return this.newSecretName != ''
        }
    },
    methods: {
        async createSecret () {
            this.errorMSG = ''
            this.hasNewSecretNameError = false
            if (this.newSecretName === '') {
                this.hasNewSecretNameError = true
                return
            }
            const found = this.data?.secrets?.find(x => x.key === this.newSecretName)
            if (found) {
                Logger.error('TokenInput.createSecret() > secret exists', found)
                this.hasNewSecretNameError = true
                this.errorMSG = 'A secret with the name exists'
                return
            }

            const domain = this.domain ? this.domain: ''
            this.data?.secrets?.push({
                key: this.newSecretName, 
                value:this.inputValue, 
                domain: domain,
                created: new Date().getTime(),
                lastUpdate: new Date().getTime(),
            })

            const res = await this.modelService.updateSecrets(this.appID, this.data)
            if (res.errors) {
                this.hasNewSecretNameError = true
                this.errorMSG = "Could not save secrets"
            } else {
                this.inputValue = "${secrets." + this.newSecretName + "}"
                this.hintValues.push({
                    label: this.newSecretName,
                    value: this.inputValue,
                    icon: 'mdi mdi-key'
                })
                this.$forceUpdate()
                this.$emit("change", this.inputValue);
                this.hasNew = false
                this.newSecretName = ''
                this.modelService.publishChange('secrets', {})
            }           
        },
        onChange(v) {
            this.inputValue = v
            if (v && v.indexOf('${') !== 0) {
                this.hasNew = true
            } else {
                this.hasNew = false
            }
            this.$emit("change", this.inputValue);
        },
        async loadSecrets () {
            const data = await this.modelService.findSecrets(this.appID)
            if (!data.secrets) {
                data.secrets = []
            }
            this.data = data
        }
    },
    mounted () {
        if (this.appID) {
            Logger.log(-2, 'TokenInput.mounted() > appID:', this.appID)
            this.modelService = Services.getModelService(this.$route)
            this.loadSecrets()
        } else {
            Logger.error('TokenInput.mounted() > no appID')
        }
    }
  };
  </script>

  