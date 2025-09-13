<template>
    <ZoomDialog ref="dialog">
        <div class=" MatcDialog MatcSurveyDialog MatcPadding">
            
       
                <div class="form-group">
                    <label>Email</label>
                    <div>
                        {{user.email}}
                    </div>      
                </div>

                <div class="form-group">
                    <label>Name</label>
                    <div>
                        {{user.name ? user.name : '?????'}} {{user.lastname ? user.lastname : '???????'}}
                    </div>      
                </div>
           
                <div class="form-group">
                    <label>Passwort reset link</label>
                    <div>
                        <a :href="`#/login.html?id=${user.passwordRestKey}`" target="_blank">{{`#/login.html?id=${user.passwordRestKey}`}}</a>
                    </div>               
                </div>

                <div class="form-group">
                    <label>Blocked</label>
                    <div>
                        <CheckBox :value="isBlocked" @change="isBlocked = !isBlocked" label="Blocked" /> 
                    </div>               
                </div>


                <div class="MatcButtonBar MatcMarginTopXXL">
                    <div class="MatcButton" @click="updateUser">Save</div>
                    <div class="MatcLinkButton" @click="close">Close</div>
                </div>
 
        </div>
          
 
     
    </ZoomDialog>
</template>
<style lang="scss">
 
</style>
<script>
import Logger from 'common/Logger'
import ZoomDialog from 'common/ZoomDialog'
import Services from "services/Services"
import AdminService from './AdminService'
import lang from 'dojo/_base/lang'
import CheckBox from 'common/CheckBox'
export default {
    name: 'UserDialog',
    mixins:[],
    props: [''],
    data: function () {
        return {
            user: {},
            isBlocked: false
        }
    },
    components: {
      'ZoomDialog': ZoomDialog,
      'CheckBox': CheckBox
    },
    computed: {
    },
    methods: {
        async updateUser () {
            await this.adminService.updateUser(this.user.id, {
                status: this.isBlocked ? 'blocked' : 'active'
            })
            if (this.saveCallback) {
                this.saveCallback()
            }
            this.close()
        },
       
        close () {
            this.$refs.dialog.close()
        },
        show (user, e, saveCallback) {
            this.$refs.dialog.show(e.target)
            this.user = lang.clone(user)
            this.isBlocked = this.user.status === 'blocked'
            this.saveCallback = saveCallback
        }
    },
    mounted () {
      this.logger = new Logger('UserDialog')
      this.adminService = new AdminService()
      this.adminService.setToken(Services.getUserService().getToken())
    }
}
</script>