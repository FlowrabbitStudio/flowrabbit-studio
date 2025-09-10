<template>
    <div>

        <Panel :transparent="true">
            <div class="MCUTopBar ">
                <SearchBar v-model="searchFilter" />       
            </div>
        </Panel>


        <Panel>
            <div class="MCUTopBar">
                <h1>Publication Settings</h1>

            </div>

  


            <DataTable :data="filteredPubs" :size="100" :columns="[
            { id: 'appID', key: 'appID', label: 'APP', width: '10%'},
            { id: 'url', key: 'url', label: 'URL', width: '10%' },
            { id: 'mode', key: 'mode', label: 'Mode', width: '10%' },
            // { id: 'action-open', key: 'action', label: '', width: '10%', value: 'Open', class: 'action', click: (row, e) => onOpenPub(row, e) },
            // { id: 'action-edit', key: 'action', label: '', width: '10%', value: 'Edit', class: 'action', click: (row, e) => onEditPub(row, e) },
        ]" />



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
// import Dialog from 'common/Dialog'
// import DomBuilder from 'common/DomBuilder'
// import CheckBox from 'common/CheckBox'
// import on from 'dojo/on'
// import * as DojoUtil from 'dojo/DojoUtil';

export default {
    props: [''],
    data: function () {
        return {
            now: new Date().getTime(),
            searchFilter: '',
            pubs: [
            ]
        };
    },
    components: { Panel, DataTable, SearchBar, UserDialog },
    computed: {
        filteredPubs() {
            if (this.searchFilter.length > 2) {
                let filter = this.searchFilter.toLowerCase()
                return this.pubs.filter(u => {
                    if (u.url && u.url.toLowerCase().indexOf(filter) >= 0) {
                        return true
                    }                   
                    return false
                })
            }
            return this.pubs
        }
    },
    methods: {
        onOpenPub (pub) {
            console.debug(pub)
        },
        onEditPub() {
            // this.$refs.userDialog.show(user, e, () => {
            //     this.loadUsers()
            // })
        },
        printDate(ms) {
            var date = new Date(ms);
            return date.toLocaleDateString();
        },
        async loadPublications() {
            const pubs = await this.adminService.getAllPublications()
            const orgs = await this.adminService.getAllOrgs()
            const lookups = {}
            orgs.forEach(o => {
                lookups[o._id] = o
            })
            pubs.forEach(p => {
                if (lookups[p.orgID]) {
                    p.orgName = lookups[p.orgID].name
                } else {
                    p.orgName = p.orgID
                }
                p.url = `${p.orgName}/${p.name}`
            })
            this.pubs = pubs
        }
    },
    async mounted() {
        this.adminService = new AdminService()
        this.adminService.setToken(Services.getUserService().getToken())
        this.loadPublications()

    }
}
</script>