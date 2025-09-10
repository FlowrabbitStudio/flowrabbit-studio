<template>
    <div class="">
        <div class="MatcHintBox MatcMarginTop MatcMarginBottom" v-if="hasInputVaribale">
            Create a table based on the input variable. Select the columns you want to show to the users.
        </div>

        <div class="MatcErrorBox MatcMarginTop MatcMarginBottom" v-else>
           No input variable. Bind this table to a variable and generate the columns based on the connected view model.
        </div>

        <div class="MatcDialogTable MatcDialogTableSmall MatcDialogTableScrollable" v-if="hasInputVaribale">
        <table class="MatcToolbarTableSettingsTable form-group" style="table-layout: fixed;">
            <thead>
                <tr class="MatcFormRow">
                    <th style="width:160px;">Name</th>
                    <th style="width:160px;">Data Binding</th>
                    <th style="width:60px;">Width</th>
                    <th style="width:24px;"></th>
                </tr>
            </thead>
            <tbody>

                <tr v-for="(c, i) in cols" :key="c.id" >
                    <!-- <td style="width:24px;">
                        <CheckBox v-model="c.selected" label="" />
                    </td> -->
                    <td>
                        <input class="form-control" v-model="c.label"/>      
                    </td>
                    <td>
                        <input class="form-control" v-model="c.databinding"/>     
                    </td>
                    <td>
                        <input class="form-control" v-model="c.width"/>     
                    </td>
                    <td class="MatcFormRowRemove">                               
                        <span class="mdi mdi-close"  @click="removeElement(i)"/>                               
                    </td>
                </tr>


                <tr>
                    <td colspan="4">
                        <span class="MatcButton MatcButtonActive" @click="importColumns">Import Columns</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
       

    </div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
import * as SchemaUtil from '../../../core/SchemaUtil'
// import CheckBox from 'common/CheckBox'
// import Input from 'common/Input'
// import DropDownButton from 'page/DropDownButton'
// import * as Airtable from './Airtable'

export default {
    name: 'TableWizard',
    mixins: [DojoWidget, Util],
    props: ["schema", "app", "widget"],
    data: function () {
        return {
            cols: []
        }
    },
    components: {
        //'CheckBox': CheckBox
    },
    computed: {
        hasInputVaribale () {
            let input = '';
            if (this.widget.props.databinding && this.widget.props.databinding.default) {
                input = this.widget.props.databinding.default
            }    
            return input !== '' && input !== undefined  && input !== null
        },
    },
    methods: {
        importColumns() {
            const cols = this.cols
            this.$emit("import", cols)
        },
        removeElement (i) {
            this.$delete(this.cols, i)
        },
        init() {
            if (this.schema && this.widget?.props?.databinding?.default) {
                const inputVariable = this.widget?.props?.databinding.default
                const childPaths = SchemaUtil.getChildPaths(this.schema, inputVariable)
                this.cols = childPaths.map(c => {
                    return {
                        id: c,
                        label: this.camelCaseToWords(c),
                        width: 120,
                        databinding: c,
                        selected: true
                    }
                })
            }
        },
        camelCaseToWords(s) {
            const result = s.replace(/([A-Z])/g, ' $1').replace(/_/g, " ").replace(/\./g, " ").replace(/-/g, "")
            return result.charAt(0).toUpperCase() + result.slice(1);
        }
    },
    watch: {
    },
    mounted() {
        this.logger = new Logger("TableWizard")
        this.init()
    }
}
</script>