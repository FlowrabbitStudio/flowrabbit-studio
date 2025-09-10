<template>
    <div class="MatcDataBinding MatcDataBindingTree">
        <div class="MatcToolbarTabsFlex">
            <div class="MatcToolbarTabs MatcToolbarTabsBig MatcMarginBottomS">
                <a v-for="key in variableKeys" @click="setVariableType(key.value)" :key="key.value"
                    :class="{ 'MatcToolbarTabActive': selectedVaribaleType === key.value }">
                    {{ key.label }}
                </a>
            </div>
            <div class="MatcToolbarTabs MatcToolbarTabsBig MatcMarginBottomS">
                <a href="https://help.flowrabbit.ai/en/category/data-binding/article/how-data-binding-works"
                    target="_blank">
                    <span class="MatcToolbarItemIcon">
                        <span class="mdi mdi-help-circle-outline" />
                    </span>
                </a>
            </div>
        </div>
        <div class="MatcDataBindingHint MatcHint">
            {{ description }}
        </div>
        <div v-if="model" class="MatcDialogTable">
            <table>
                <tr>
                    <td class="MatcDataBindingCheckCntr">
                        <span class="mdi mdi-database-plus"></span>
                    </td>
                    <td class="MatcDataBindingNameCntr">
                        <Combo :fireOnBlur="true" :top="false" placeholder="Create new variable" :inline="true"
                            :hints="hints" :selectOnEnter="false" ref="combo" @focus="hasNewTypeSelector = true"
                            @change="onNewVariable" :formControl="true" />
                    </td>
                    <td>
                        <a class="MatcButton">Create</a>
                    </td>
                </tr>
            </table>

            <table class="">
                <tbody>
                    <tr class="MatcFormRow" v-for="variable in modelVariables" :key="variable.name">
                        <td class="MatcDataBindingCheckCntr">
                            <CheckBox :value="variable.selected" @change="onSelectVariable($event, variable.name)" />
                        </td>
                        <td>
                            <span class="MatcDataBindingVariableName">
                                {{ variable.name }}
                            </span>
                        </td>


                        <td class="MatcFormRowRemove">

                            <span class="mdi mdi-close" v-if="variable.hasDelete"
                                @click.stop="deleteDefaultVariable(variable)"></span>

                        </td>
                    </tr>
                </tbody>

            </table>
        </div>
    </div>
</template>
<style>
@import url("../../../style/databinding.css");
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
// import DropDownButton from 'page/DropDownButton'
import CheckBox from 'common/CheckBox'
import Input from 'common/Input'
import DataBindingService from 'services/DataBindingService'
import lang from '../../../dojo/_base/lang'
import JSONPath from '../../../core/JSONPath'
//import ModelUtil from '../../../core/ModelUtil'

export default {
    name: 'DataBinding',
    mixins: [DojoWidget, Util],
    props: ["app", "value", "canChangeVars"],
    data: function () {
        return {
            model: null,
            widget: null,
            hasNewTypeSelector: false,
            newType: "default",
            variables: [],
            databinding: {},
            selectedVaribaleType: 'default',
            hasDefaults: true,
            variableKeys: [],
            defaultData: {},
        }
    },
    components: {
        'CheckBox': CheckBox,
        'Combo': Input
        // 'DropDownButton': DropDownButton
    },
    computed: {
        description() {
            const selected = this.variableKeys.find(k => k.value === this.selectedVaribaleType)
            if (selected && selected.hint) {
                return selected.hint
            }
            return 'Define the data the goes in and out.'
        },
        buttonWidth() {
            return this.variableKeys.length * 80 + 'px'
        },
        dataTypes() {
            return ["Number", "String", "Boolean", "Object", "Array"].map(a => {
                return {
                    label: a,
                    value: a
                }
            })
        },
        hints() {
            if (!this.searchQuery) {
                // If no search query, show all variables
                return this.variables.map(variable => ({
                    label: variable,
                    value: variable
                }));
            }
            // Filter variables based on search query (case-insensitive)
            const query = this.searchQuery.toLowerCase();
            return this.variables
                .filter(variable => variable.toLowerCase().includes(query))
                .map(variable => ({
                    label: variable,
                    value: variable
                }));
        },
        modelVariables() {
            const selectedVaribale = this.databinding[this.selectedVaribaleType]
            const temp = {}
            const result = this.variables.map(v => {
                temp[v] = true
                const defaultValue = JSONPath.get(this.defaultData, v, '')
                return {
                    name: v,
                    selected: selectedVaribale === v,
                    defaultValue: defaultValue,
                    dataType: "Object"
                }
            })

            // maybe we should filter by parent???

            Object.keys(this.defaultData).forEach(key => {
                this.addDefaultToList(result, temp, key)
            })

            return result
        }
    },
    methods: {
        addDefaultToList(result, temp, key) {
            if (!temp[key] && key !== '_qux') {
                const defaultValue = JSONPath.get(this.defaultData, key, '')
                if (this.isObject(defaultValue)) {
                    Object.keys(defaultValue).forEach(child => {
                        console.debug(child)
                        this.addDefaultToList(result, temp, key + "." + child)
                    })
                } else if (defaultValue != undefined) {
                    temp[key] = true
                    result.push({
                        name: key,
                        selected: false,
                        defaultValue: defaultValue,
                        dataType: "Object",
                        hasDelete: true
                    })
                }

            }
        },
        isObject(v) {
            return typeof v === 'object' && !Array.isArray(v) && v !== null
        },
        deleteDefaultVariable(v) {
            this.logger.log(-1, 'deleteDefaultVariable', 'enter', v)
            JSONPath.set(this.defaultData, v.name, undefined)
        },
        onChangeDefault(v, e) {
            this.logger.log(-1, 'onChangeDefault', 'enter', e)
            const value = e.target.value
            JSONPath.set(this.defaultData, v.name, value)
        },
        setVariableType(type) {
            this.logger.log(-1, 'setVariableType', 'enter', type)
            this.selectedVaribaleType = type
        },
        onNewVariable(v) {
            this.logger.log(-1, 'onNewVariable', `enter > "${v}"`)
            if (v === "") {
                this.logger.warn('onNewVariable', `Empty > "${v}"`)
                return
            }
            this.$refs.combo.clear()
            if (this.variables.indexOf(v) < 0) {
                this.variables.unshift(v)
            }
            this.onSelectVariable(true, v)
            this.onChange()
        },
        onSelectVariable(selected, variable) {
            this.logger.log(-1, 'onSelectVariable', 'enter > ' + this.selectedVaribaleType + " > " + selected, variable)
            if (selected) {
                this.$set(this.databinding, this.selectedVaribaleType, variable)
            } else {
                this.$delete(this.databinding, this.selectedVaribaleType)
            }
            this.onChange()
        },
        getValue() {
            //console.debug('Tree', JSON.stringify(this.databinding))
            // I believe this value might be sometimes changes
            // when the dialog closes
            return lang.clone(this.databinding)
        },
        getSchema() {
            return this.schema
        },
        getData() {
            return this.defaultData
        },
        onChange() {
            this.emit('change', this.databinding)
        },
        setModel(v) {
            this.model = v
            if (v.data) {
                this.defaultData = lang.clone(v.data)
            }
        },
        setSchema(schema) {
            this.schema = schema
        },
        setVariable(v) {
            if (v.label && v.value) {
                this.logger.log(-1, 'setVariable', 'enter', v.value)
                this.selectedVaribaleType = v.value
            }
        },
        setWidget(v) {
            this.widget = v
            if (this.widget.props && this.widget.props.databinding) {
                this.databinding = lang.clone(this.widget.props.databinding)
            }
            this.variableKeys = DataBindingService.getDefautlBindings(this.widget)
            if (this.variableKeys.length > 0) {
                this.selectedVaribaleType = this.variableKeys[0].value
            }
            this.initVariables()
            this.logger.log(-1, 'setWidget() > exit', this.selectedVaribaleType)
        },
        initVariables() {
            const variables = this.getAllAppVariables();
            if (this.variables.length === 0) {
                variables.sort((a, b) => {
                    return a.toLowerCase().localeCompare(b.toLowerCase())
                })
            }
            this.variables = variables
            if (this.variables.length === 0) {
                setTimeout(() => {
                    if (this.$refs.combo) {
                        this.$refs.combo.focus()
                    }
                }, 200)
            }
        }
    },
    watch: {
        value(v) {
            this.setWidget(v)
        }
    },
    mounted() {
        this.logger = new Logger("DataBindingTree")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>