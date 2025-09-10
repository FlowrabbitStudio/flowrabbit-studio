<template>
    <div>
        <div class="MatcSecret MatcDialogFlexContainer MatcDialogLL MatcSplitDialog">
            <div class="MatcSplitDialogNav">
                <ul v-if="data">
                    <li v-for="(s, i) in data.secrets" 
                        :key="i" 
                        :class="['MatcSplitDialogNavItem', {'MatcSplitDialogNavItemSelected': currentSecret?.key === s.key}]" 
                        @click="selectSecret(s)"
                    >
                        <label>
                            {{s.key}}
                        </label>      
               
                        <span class="MatcFormRemoveIcon mdi mdi-close-circle" @click.stop="remove(s, i)"></span>
                    </li>
                </ul>
                <div style="padding: 16px;">
                    <button class="MatcButton  MatcButtonFullWidth MatcButtonPrimary" @click="showNew">New</button>
                </div>
            </div>
            <div class="MatcDialogContainer MatcGapM">
    
                <div class="MatcDialogContent" style="padding-top: 24px;">
                    <div class="MatcDialogContentGrow " v-if="!currentSecret">
                        <h1>Secrets</h1>
                        <p class="">
                            Select a secret to edit, or click on new to create a new secret
                        </p>
                    </div>
               
                    <div class="MatcDialogContentGrow " v-if="currentSecret">

                        <div class="form-group">
                            <label>Name</label>

                            <input type="text" 
                                class="form-control"  
                                @change="setDirty()"
                                v-model="currentSecret.key"
                                placeholder="Name of the secret" />
                        </div>

                        <div class="form-group">
                            <label>Secret Token</label>                  

                            <input 
                                type="password" 
                                class="form-control" 
                                @change="setDirty()"
                                v-model="currentSecret.value" 
                                placeholder="The password or token" />
                        </div>


                        <div class="form-group">
                            <label>Domain</label>                  

                            <Combo 
                                :value="currentSecret.domain" 
                                @change="setDomain" 
                                :hints="domainHints" 
                                :fireOnBlur="true"
                                :showHintLabel="true" 
                                cssClass="form-control" 
                                :isDropDown="true" 
                                ref="newDomainCombo" 
                                placeholder="Service (optional)" 
                            />
                        </div>
                        
                        <button class="MatcButton MatcButtonPrimary" @click="add" v-if="isNew">Create new Secret</button>
           
                    </div>


                    <span class="MatcError" v-show="errorMSG && errorMSG.length > 0">
                        {{ errorMSG }}
                    </span>
                    <div class="MatcButtonBarDialog">    
                        <a @click="close" class="MatcLinkButtonDialog">Cancel</a>
                        <a :class="['MatcButtonDialog']" @click="save" :disabled="!isDirty">Save</a>
                    </div>
                </div>
            </div>
        </div>


    </div>
</template>
<style lang="scss">
    @import 'style/scss/secrets.scss';
    @import '../../../style/components/dialog.scss';
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import Input from 'common/Input'
import * as SecretUtil from '../../../util/SecretUtil'

export default {
    name: "SecretsList",
    mixins: [DojoWidget],
    props: ['app', 'pub'],
    data: function () {
        return {
            errorMSG: '',
            newKey: '',
            newValue: '',
            newDomain: '',
            isDirty: false,
            data: null,
            domainHints: SecretUtil.getDomains(),
            currentSecret: null,
            isNew: false
        };
    },
    components: {
        Combo: Input
    },
    methods: {
        formatDate (t, justDate = true) {
            const date = new Date(t);
            if (justDate) {
                return date.toLocaleDateString();
            }
            return date.toLocaleString();
        },
        showNew () {
            this.currentSecret = {}
            this.isNew = true
        },
        selectSecret (s) {
            if (this.isValid() || this.isNew) {
                this.currentSecret = s
                this.isNew = false
                this.errorMSG = ''
            }
        },
        setDirty() {
            this.isDirty = true
            this.currentSecret.lastUpdate = new Date().getTime()
        },
        setDomain(d) {
            this.currentSecret.domain = d
            this.setDirty()
        },
        async save() {
            const res = await this.modelService.updateSecrets(this.app.id, this.data)
            // call back
            if (this.setSecrets){
                this.setSecrets(res.secrets);
            }

            this.close();
            if (res.errors) {
                this.errorMSG = "Could not save secrets"
            } else {
                this.showSuccess("Changes Saved");
            }
        },
        remove(secret) {
            this.data.secrets = this.data.secrets.filter(s => s.key !== secret.key)
            this.isDirty = true
        },
        add() {
            if (this.isValid()) {
                this.data.secrets.push({ 
                    key: this.currentSecret.key, 
                    value: this.currentSecret.value, 
                    domain: this.currentSecret.domain,
                    created: new Date().getTime()
                })          
                this.isNew = false
                this.currentSecret = null
                this.isDirty = true
            }
        },
        isValid () {
            if (!this.currentSecret) {
                return true
            }
            if (!this.currentSecret.key) {
                this.errorMSG = "Please add a name"
                return
            }
            if (!this.currentSecret.value) {
                this.errorMSG = "Please add the secret token"
                return
            }
            if (!this.currentSecret.domain) {
                this.errorMSG = "Please add the the Domain"
                return
            }
            return true
        },
        async loadSecrets() {
            const data = await this.modelService.findSecrets(this.app.id)
            if (!data.secrets) {
                data.secrets = []
            }
            this.data = data
            //this.currentSecret = this.data.secrets[0]
            console.debug(this.currentSecret)
        }
    },
    mounted() {
        this.modelService = Services.getModelService()
        this.loadSecrets()
    }
};
</script>