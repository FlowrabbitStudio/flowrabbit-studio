<template>
    <ZoomDialog ref="dialog">
        <div class=" MatcDialog MatcMCUDialog MatcSurveyDialog MatcPadding">
            
       
               
                <div class="form-group">
                    <label>Name</label>
                    <div>
                        <input class="form-control" v-model="organization.name">
                    </div>      
                </div>

                <div class="form-group">
                    <label>Paid Until</label>
                    <div>
                        <input class="form-control" type="date" v-model="paidUntilDate" />
                    </div>               
                </div>

                <div v-if="team" class="form-group MatcMCUDialogTeam">
                    <label>Members</label>
                    <div>
                        <table>
                            <tr>
                                <td class="MatcMCUTableMax">
                                    <input class="form-control" v-model="newTeamEmail" placeholder="Enter email of registered user" />
                                </td>
                                <td class="MatcMCUTableAction">
                                    <a class="MatcButton" @click="addTeamMember">+</a>
                                </td>
                            </tr>
                            <tr v-for="user in team" :key="user.id">
                                <td class="MatcMCUTableMax">
                                    <span class="form-control">
                                        {{user.email}}
                                    </span>
                             
                                </td>
                                <td class="MatcMCUTableAction">
                                    <a class="MatcButton MatcButtonRed" @click="removeTeamMember(user)">X</a>
                                </td>
                            </tr>
                        </table>
           
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
// import CheckBox from 'common/CheckBox'
export default {
    name: 'UserDialog',
    mixins:[],
    props: [''],
    data: function () {
        return {
            organization: {},
            paidUntilDate: '',
            isBlocked: false,
            team: false,
            newTeamEmail: ''
        }
    },
    components: {
      'ZoomDialog': ZoomDialog
    },
    computed: {
    },
    methods: {
        async updateUser () {
            if (!this.organization.name) {
                this.$refs.dialog.shake()
                return
            }
            const paidUntil =  Date.parse(this.paidUntilDate);
            this.organization.name = this.organization.name.toLowerCase()
            if (this.organization.id) {
                await this.adminService.updateOrg(this.organization)
            } else {
                this.organization.paidUntil = paidUntil
                await this.adminService.createOrg(this.organization)
            }

            if (this.saveCallback) {
                this.saveCallback()
            }
            this.close()
        },
        async removeTeamMember (u) {
            console.debug('removeTeamMember', u)
            let result = await this.adminService.removeOrgTeamMember(this.organization.id, u.id)    
            if (result.status !== 'ok') {
                this.$refs.dialog.shake()
                return
            }
            this.team = await this.adminService.getOrgTeam(this.organization.id)
        },
        async addTeamMember () {
            if (!this.newTeamEmail) {
                this.$refs.dialog.shake()
                return
            }
            let result = await this.adminService.addOrgTeamMember(this.organization.id, this.newTeamEmail)    
            if (result.status !== 'ok') {
                this.$refs.dialog.shake()
                return
            }

            this.newTeamEmail = ''
            this.team = await this.adminService.getOrgTeam(this.organization.id)
        },
       
        close () {
            this.$refs.dialog.close()
        },
        async show (organization, e, saveCallback) {
            this.newTeamEmail = ''
            this.organization = lang.clone(organization)
            if (!this.organization.name) {
                this.organization.name = ''
            }
            if (!this.organization.paidUntil) {
                this.organization.paidUntil = new Date().getTime()
            }
            const date = new Date(this.organization.paidUntil)
            const year = date.getFullYear()
            const month = `0${date.getMonth() + 1}`.slice(-2)
            const day = `0${date.getDate()}`.slice(-2)
            this.paidUntilDate = `${year}-${month}-${day}`;
            this.saveCallback = saveCallback

            if (this.organization.id) {
                this.team = await this.adminService.getOrgTeam(this.organization.id)
            }
            this.$refs.dialog.show(e.target)
        }
    },
    mounted () {
      this.logger = new Logger('UserDialog')
      this.adminService = new AdminService()
      this.adminService.setToken(Services.getUserService().getToken())
    }
}
</script>