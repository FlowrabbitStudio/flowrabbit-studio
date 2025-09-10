
<template>
    <div class="MatcSecret">
        
        
        <div v-if="data" class="MatcSecretList">
            <div  v-for="(s,i) in data.secrets" :key="i" class="MatcSecretListRow">
                <input
                    type="text"
                    class="form-control" 
                    v-model="s.key"
                    @change="isDirty = true"         
                    placeholder="Name"
                />

                <input
                    type="password"
                    class="form-control" 
                    v-model="s.value"
                    @change="isDirty = true"
                    placeholder="Value"
                />

                <Combo 
                    :value="s.domain" 
                    @change="setDomain(s, $event)" 
                    :hints="domainHints" 
                    :fireOnBlur="true" 
                    cssClass="form-control"
                    :isDropDown="true" 
                    :showHintLabel="true"
                    placeholder="Service" />


                <span class="remove mdi mdi-close-circle" @click="remove(s, i)"></span>
            </div>     
            
            <div class="MatcSecretListRow">
                <input
                    type="text"
                    class="form-control" 
                    v-model="newKey"    
                    @change="add"     
                    placeholder="Name of the screcet"
                />

                <input
                    type="text"
                    class="form-control" 
                    v-model="newValue"
                    @change="add"        
                    placeholder="The password or token"
                />

                <Combo 
                    :value="newDomain" 
                    @change="setNewDomain" 
                    :hints="domainHints" 
                    :fireOnBlur="true" 
                    cssClass="form-control"
                    :isDropDown="true" 
                    ref="newDomainCombo"
                    :showHintLabel="true"
                    placeholder="Service" />

                <span class="mdi"></span>
            </div>
        </div>

        <div>
            <span class="MatcError" v-show="errorMSG && errorMSG.length > 0" >
                    {{errorMSG}}
            </span>
        </div>

        <div class="MatcButtonBar MatcMarginTop">
            <a  @click="loadSecrets" class="MatcLinkButton">Cancel</a>
            <a :class="['MatcButton MatcButtonPrimary']" @click="save" :disabled="!isDirty">Save</a>
        </div>

    </div>
  </template>
  <style lang="scss">
  @import '../style/scss/secrets.scss';
</style>
  <script>
    import DojoWidget from "dojo/DojoWidget";
    import Services from "services/Services";
    import Input from 'common/Input'
    import * as SecretUtil from '../util/SecretUtil'

  
  export default {
    name: "SecretsList",
    mixins: [DojoWidget],
    props:['app', 'pub'],
    data: function() {
      return {
        errorMSG: '',
        newKey: '',
        newValue:'',
        newDomain:'',
        isDirty: false,
        data: null,
        domainHints: SecretUtil.getDomains(),
      };
    },
    components: {
        Combo: Input
    },
    methods: {
        setNewDomain (v) {
            this.newDomain = v
            this.isDirty = true
            this.add()
        },
        setDomain (s, value) {
            s.domain = value
            this.isDirty = true
        },
        async save () {
            const res = await this.modelService.updateSecrets(this.app.id, this.data)
            if (res.errors) {
                this.errorMSG = "Could not save secrets"
            } else {
                this.showSuccess("Changes Saved");
            }

        },
        remove (secret) {
            this.data.secrets = this.data.secrets.filter(s => s.key !== secret.key)
            this.isDirty = true
        },
        add () {  
            if (!this.newDomain) {
                this.errorMSG = "Please select a service"
                return
            }
            if (this.newKey && this.newValue && this.newDomain) {
                this.data.secrets.push({key: this.newKey, value:this.newValue, domain: this.newDomain})
                this.newKey = ''
                this.newValue = ''
                this.newDomain = ''
                this.$refs.newDomainCombo.setValue('')
                this.isDirty = true
            }
        },
        async loadSecrets () {
            const data = await this.modelService.findSecrets(this.app.id)
            if (!data.secrets) {
                data.secrets = []
            }
            this.data = data
        }
    },
    mounted() {
        // FIXME: we need to get here somehow the app edit token
        this.modelService = Services.getModelService(this.$route)
        this.loadSecrets()
    }
  };
  </script>