<template>
    <div>

        <Panel :transparent="true">
            <div class="MCUTopBar ">
                <div></div>
                <div class="MatcButton" @click="onCreateAiModel">Create</div>
            </div>
        </Panel>


        <Panel>
            <div class="MCUTopBar">
                <h1>AI Models</h1>
            </div>

            <DataTable :data="aiModels" :size="100" :columns="[
                {id:'id', key: 'id', label: 'ID', width: '20%'},
                {id:'name', key: 'name', label: 'Name', width: '20%'},
                {id:'type', key: 'type', label: 'Type', width: '20%'},
                {id:'url', key: 'url', label: 'URL', width: '20%', max:50},
                {id:'action-edit', key: 'action', label: 'Action', width: '10%', value: 'Edit', class:'action', click: (row) => onEdit(row)},
                {id:'action-delete', key: 'action', label: '', width: '10%', value: 'Delete', class:'action', click: (row) => onDelete(row)}
            ]"/>

        </Panel>

        <AiModelDialog ref="dialog"></AiModelDialog>


    </div>
</template>

<script>

import Panel from './Panel.vue'
import AdminService from './AdminService'
import DataTable from './DataTable.vue'
import AiModelDialog from './AiModelDialog.vue'
import Services from 'services/Services'


export default {
    props: [''],
    data: function () {
        return {
            now: new Date().getTime(),
            searchFilter: '',
            offset: 0,
            limit: 64,
            sortBy:'',
            order:1,
            aiModels: []
        };
    },
    components: { Panel, DataTable, AiModelDialog },
    computed: {
    },
    methods: {
        onCreateAiModel() {
            const newCode = {
            }
            this.$refs.dialog.show(newCode, () => {
                this.loadAll()
            })
        },

        async onDelete (plan) {
            if (confirm("Delete AI model:  " + plan.name + "?")) {
                await this.adminService.deleteAiModel(plan.id)
                this.$root.$emit("Success", "Deleted " +  plan.name);
                this.loadAll()
            }
        },

        onEdit(promo) {
            this.$refs.dialog.show(promo, () => {
                this.loadAll()
            })
        },

        printDate(ms) {
            const date = new Date(ms);
            return date.toLocaleDateString();
        },

        async loadAll() {
            this.aiModels = await this.adminService.findAllAiModels()
            this.$root.$emit("Success", "Loaded " + this.aiModels.length + " models");
        }
    },
    async mounted() {
        this.adminService = new AdminService()
        this.adminService.setToken(Services.getUserService().getToken())
        this.loadAll()
    }
}
</script>