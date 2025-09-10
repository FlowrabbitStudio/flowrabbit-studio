<template>
 <div>

    <Panel :transparent="true">
            <div class="MCUTopBar ">
              <SearchBar v-model="searchFilter" />
                <a class="MatcButton MatcButtonRed" @click="backupUsers">Backup</a>
            </div>
        </Panel>


    <Panel>
        <div class="MCUTopBar">
         <h1>Users</h1>
   
        </div>

      
     

        <DataTable :data="filteredUsers" :size="100" :columns="[
          {id:'email', key: 'email', label: 'Email', width: '20%', max:20},
          {id:'paidUntil', key: 'paidUntil', label: 'Paid Until', width: '10%', value: (row) => printDate(row.paidUntil), class: (row) => row.paidUntil < now ? 'orange': '' },
          {id:'created', key: 'created', label: 'Created', width: '10%', value: (row) => printDate(row.created)},
          {id:'lastlogin', key: 'lastlogin', label: 'Last Login', width: '10%', value: (row) => printDate(row.lastlogin)},
          {id:'loginCount', key: 'loginCount', label: 'Count', width: '10%'},
          {id:'role', key: 'role', label: 'Role', width: '10%', class: (row) => row.role === 'admin' ? 'red': ''},
          {id:'status', key: 'status', label: 'Status', width: '10%', class: (row) => row.status === 'blocked' ? 'red': ''},
          {id:'action-delete', key: 'action', label: 'Action', width: '10%', value: 'Delete', class:'action', click: (row) => onDeleteUser(row)},
          {id:'action-edit', key: 'action', label: '', width: '10%', value: 'Edit', class:'action',  click: (row,e) => onEditUser(row, e)},
        ]"/>


          
    </Panel>

    <UserDialog ref="userDialog">
    </UserDialog>
  
  </div>
</template>

<script>

import Panel from './Panel.vue'
import DataTable from './DataTable.vue'
import SearchBar from './SearchBar.vue'
import AdminService from './AdminService'
import UserDialog from './UserDialog'
import Services from 'services/Services'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
// import CheckBox from 'common/CheckBox'
// import on from 'dojo/on'
// import * as DojoUtil from 'dojo/DojoUtil';

export default {
  props:[''],
  data: function() {
    return {
      now: new Date().getTime(),
      searchFilter: '',
      users: [
      ]
    };
  },
  components: {Panel, DataTable, SearchBar, UserDialog},
  computed: {
    filteredUsers () {
      if (this.searchFilter.length > 2) {
        let filter = this.searchFilter.toLowerCase()
        return this.users.filter(u => {
          if (u.name && u.name.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
          if (u.lastname && u.lastname.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
           if (u.email && u.email.toLowerCase().indexOf(filter) >= 0) {
            return true
          }
          return false
        })
      }
      return this.users
    }
  },
  methods: {
    onEditUser (user, e) {
      this.$refs.userDialog.show(user, e, () => {
        this.loadUsers()
      })
    },
    async backupUsers(){
			var d = new Dialog();
			var db = new DomBuilder();
			var div = db.div("MatcDialog ").build();
			db.h1("", "Users Backup...").build(div);
			var label = db.div("", "Backup users...").build(div);
			d.on("close", function(){
				console.debug("close");
				d.isDone = true;
			})
			d.popup(div);
    
      let result = await this.adminService.backupUsers()
      if (result.status == "ok"){
        label.innerHTML = "Done...(" + Math.round(result.size /1024) / 1000 + "kb )";
      } else {
        label.innerHTML = "Error!";
      }
			
		},
    printDate (ms) {
      var date = new Date(ms);
      return date.toLocaleDateString();
    },
    async onDeleteUser (user) {
      let deleteUser = confirm('Do you want to delete user ' + user.email + ' [' + user.id + ']')
      if (deleteUser) {
        await this.adminService.deleteUser(user.id)
        this.loadUsers()
      }
    },
    async loadUsers () {
      this.users = await this.adminService.getAllUsers()
      this.users.forEach(u => {
        if (!u.lastlogin) {
          u.lastlogin = 0
        }
        if (!u.paidUntil) {
          u.paidUntil = '?'
        }
        if (!u.loginCount) {
          u.loginCount = 0
        }
        if (!u.status) {
          u.status = 'Active'
        }
      })
    }
	},
  async mounted () {
    this.adminService = new AdminService()
    this.adminService.setToken(Services.getUserService().getToken())
    this.loadUsers()
    
  }
}
</script>

