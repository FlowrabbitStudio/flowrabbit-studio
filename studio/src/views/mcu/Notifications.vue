<template>
  <div>
  	
	<Panel v-if="mode === 'view'" >
          <h1>Notifications</h1>

            <div class="MatcButtonBar MatcMarginBottom MatcButtonBarRight" >
                <div class="MatcButton" @click="onNew()">New</div>
            </div>

            <DataTable :data="notifications" :size="100" :columns="[
                {id:'title', key: 'title', label: 'Title', width: '20%', max:20},
                {id:'message', key: 'message', label: 'Message', width: '50%', max:50},
                {id:'lastUpdate', key: 'lastUpdate', label: 'Last Update', width: '10%', value: (row) => printDate(row.created)},
                {id:'action-edit', key: 'action', label: 'Action', width: '10%', value: 'Edit', class:'action', click: (row) => onEdit(row)},
                {id:'action-delete', key: 'action', label: '', width: '10%', value: 'Delete', class:'action', click: (row) => onDelete(row)}
            ]"/>
    </Panel>


	<Panel v-if="mode === 'edit'">
          <h1>New Notifications</h1>

       
            <div>
                <div class="form-group">
                    <label>Title *</label>
                    <input class="form-control  input-lg" v-model="currentNotification.title" >
                </div>
                
        
                <div class="form-group">
                    <label>More </label>
                    <textarea class="form-control  input-lg" v-model="currentNotification.more"></textarea>
                </div>
                                
                <div class="form-group">
                    <label>Video</label>
                    <input class="form-control  input-lg" v-model="currentNotification.video">
                </div>
            </div>		  
			


            <div class="MatcButtonBar MatcMarginTop" >
                <div class="MatcButton" @click="onSave()">Save</div>
                <div class="MatcLinkButton" @click="onCancel()">Cancel</div>
            </div>

    </Panel>

  

  </div>
</template>

<script>

import Panel from './Panel.vue'
import DataTable from './DataTable.vue'
import AdminService from './AdminService'
import Services from 'services/Services'

export default {
    components: {Panel, DataTable},
    data: function() {
        return {
            mode: 'view',
            currentNotification: {

            },
            notifications: []
        };
    },
    methods: {
        printDate (ms) {
            var date = new Date(ms);
            return date.toLocaleDateString();
        },
        onEdit (notification) {
            this.currentNotification = notification
            this.mode = 'edit'
        },
        onCancel () {
            this.mode = 'view'
        },
        async onDelete (notification) {
            await this.adminService.deleteNotifications(notification)
            this.notifications = await this.adminService.getNotifications()
            this.mode = 'view'
        },
        onNew () {
            this.currentNotification = {
                isPublic: true,
                title: '',
                message: '',
                section: '',
                more: '',
                link: '',
                event: '',
                domain: 'Quant-UX.com'
            }
            this.mode = 'edit'
        },
        async onSave () {
            this.currentNotification.isPublic = true;
			this.currentNotification.lastUpdate = new Date().getTime();
            if (!this.currentNotification.id) {
                this.currentNotification.created = new Date().getTime();
                await this.adminService.createNotifications(this.currentNotification)
            } else {
                await this.adminService.updateNotifications(this.currentNotification)
            }
           
            this.notifications = await this.adminService.getNotifications()
            this.mode = 'view'
        }
    },
    async mounted () {
        this.adminService = new AdminService()
        this.adminService.setToken(Services.getUserService().getToken())
        this.notifications = await this.adminService.getNotifications()
    }
}
</script>

