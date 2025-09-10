<template>
    <div>
         
       <Panel>
           <div class="MCUTopBar">
            <h1>User</h1>
           
           </div>
      
           {{user}}
   
   
             
       </Panel>
   
     
     </div>
   </template>
   
   <script>
   
   import Panel from './Panel.vue'
   import AdminService from './AdminService'
   import Services from 'services/Services'

   
   export default {
     props:[''],
     data: function() {
       return {
         user: {}
       };
     },
     components: {Panel},
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
             if (u._id && u._id.toLowerCase().indexOf(filter) >= 0) {
               return true
             }


             return false
           })
         }
         return this.users
       }
     },
     methods: {
        async load () {
            const id = this.$route.params.id
            this.user  = await this.adminService.getUser(id)         
        }
    },
     async mounted () {
        this.adminService = new AdminService()
        this.adminService.setToken(Services.getUserService().getToken())
        this.load()
     }
   }
   </script>
   
   