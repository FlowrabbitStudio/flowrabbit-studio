<template>
    <div class="MatcFormWizard">

        <div class="MatcDialogTable MatcDialogTableScrollable" >
            <table class="MatcToolbarTableSettingsTable form-group" style="table-layout: fixed;">
                <thead>
                    <tr class="MatcFormRow">
                        <th style="width:160px;">Label</th>
                        <th style="width:160px">Type</th>
                        <th style="width:160px;">Data Binding</th>
                        <th style="width:20px;"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(s, i) in elements" :key="i">
                        <td>
                            <input type="text" class="form-control" v-model="s.name" @change="isDirty = true"
                                placeholder="Name" ref="inputs" />
                        </td>
                        <td>
                            <DropDownButton v-model="s.type" @change="setType(s, $event)" :options="typeOptions" />
                        </td>
                        <td>
                            <Combo :value="s.databinding" @change="setDatabinding(s, $event)" :hints="hints"
                                :fireOnBlur="true" :showHintLabel="true" cssClass="form-control" :isDropDown="true"
                                placeholder="Data Binding" />
                        </td>          
                        <td class="MatcFormRowRemove ">                               
                            <span class="mdi mdi-close"  @click="removeElement(i)"/>                               
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <span class="MatcButton MatcButtonActive" @click="addElement">Add Element</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
<style lang="scss">
@import '../../../style/scss/form-wizard.scss';
</style>

<script>

import Input from 'common/Input'
import Logger from 'common/Logger'
//import SegmentButton from 'page/SegmentButton'
import DropDownButton from 'page/DropDownButton'
import * as SchemaUtil from '../../../core/SchemaUtil'

export default {
    name: 'FormWizard',
    mixins: [],
    props: ['model', 'schema', 'selectedVariables'],
    data: function () {
        return {
            isDirty: false,
            elements: [
                { name: 'Element 1', type: 'TextBox', databinding: '' },
                // {name: 'TextBox 1', type: 'TextArea', databinding:'a'},
                // // {name: 'TextArea 1', type: 'TextArea', databinding:'b'},
                // // {name: 'Password 1', type: 'Password', databinding:'c'},
                // // {name: 'CheckBoxGroup 1', type: 'CheckBoxGroup', databinding:'d'},
                // // {name: 'RadioGroup 1', type: 'RadioGroup', databinding:'e'},
                // {name: 'DropDown 1', type: 'DropDown', databinding:'f'},         
                // {name: 'DateDropDown 1', type: 'DateDropDown', databinding:'h'}
            ],
            typeOptions: [
                { label: 'Text Input', value: 'TextBox' },
                { label: 'Text Area', value: 'TextArea' },
                { label: 'Password', value: 'Password' },
                { label: 'CheckBox List', value: 'CheckBoxGroup' },
                { label: 'Radio List', value: 'RadioGroup' },
                { label: 'DropDown', value: 'DropDown' },
                // {label: 'Segment Button', value:'SegmentPicker'},
                { label: 'Date Picker', value: 'DateDropDown' },

            ]
        }
    },
    components: {
        'Combo': Input,
        'DropDownButton': DropDownButton
    },
    computed: {
        hints() {
            let hints = []
            if (this.schema) {
                hints = SchemaUtil.getAllPaths(this.schema)
            }
            return hints.map(h => {
                return { label: h, value: h }
            })
        },
    },
    methods: {
        addElement() {
            this.elements.push({
                name: 'Element ' + (this.elements.length + 1),
                type: 'TextBox',
                databinding: ''
            })
            setTimeout(() => {
                const input = this.$refs.inputs[this.$refs.inputs.length - 1]
                if (input) {
                    input.focus()
                    input.select()
                }
            }, 100)
        },
        removeElement (i) {
            this.$delete(this.elements, i)
        },

        remove(i) {
            this.elements.splice(i, 1);
        },

        setType(s, v) {
            s.type = v
        },

        setDatabinding(s, v) {
            s.databinding = v
        },

        getElements() {
            return this.elements
        },
        camelCaseToWords(s) {
            const result = s.replace(/([A-Z])/g, ' $1').replace(/_/g, " ").replace(/-/g, "")
            return result.charAt(0).toUpperCase() + result.slice(1);
        },
        initForm () {
            if (this.selectedVariables && this.selectedVariables.length && this.schema) {
                const paths = new Set()
                // not sure if this makes much sense
                const includeArray = true
                this.selectedVariables.forEach(v => { 
                    const temp = SchemaUtil.getLeafNodes(this.schema, v, includeArray)
                    temp.forEach(path => {
                        paths.add(path)            
                    })
                })
                const elements = []
                paths.forEach(p => {
                    // eslint-disable-next-line 
                    const [name, parent] = SchemaUtil.splitPath(p)
                    elements.push({
                        name: this.camelCaseToWords(name),
                        type: 'TextBox',
                        databinding: p
                    })
                })
                this.elements = elements
            }
        }
    },

    mounted() {
        this.logger = new Logger("FormWizardSettings");
        this.initForm()
    }
}
</script>