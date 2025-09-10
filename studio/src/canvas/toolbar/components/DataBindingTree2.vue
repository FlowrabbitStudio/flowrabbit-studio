<template>
    <div class="MatcDataBinding MatcDataBindingTree">
        <div class="MatcToolbarTabsFlex">
            <div class="MatcToolbarTabs MatcToolbarTabsBig MatcMarginBottomS">
                <a v-for="key in variableKeys" @click="setVariableType(key)" :key="key.value"
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
        <div class="MatcFlex MatcGapM MatcPaddingTop">
            <input class="form-control" placeholder="Create a new variable" v-model="newVariable" @keyup.enter="createNewVariable">
            <a class="MatcButton MatcFormButton" @click="createNewVariable">Create</a>
        </div>
        <div class="MatcDataBindingHint MatcHint">
            {{ description }}
        </div>
        <div></div>
        <div v-if="model && schema" class="MatcDialogTable">
            <SchemaTree 
                ref="tree"
                :ignoreEdit="true"
                :ignoreChildSelection="true"
                :schema="schema" 
                @select="onSelect">
            </SchemaTree>
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
import SchemaTree from '../components/SchemaTree.vue'
import * as SchemaUtil from '../../../core/SchemaUtil'
import DataBindingService from '../../../services/DataBindingService'
import lang from '../../../dojo/_base/lang'


export default {
    name: 'DataBinding',
    mixins: [DojoWidget, Util],
    props: ["app", "value", "canChangeVars", "schema"],
    data: function () {
        return {
            model: null,
            widget: null,
            hasNewTypeSelector: false,
            newType: "default",
            variables: [],
            databinding: {},
            newVariable: '',
            selectedVaribaleType: 'default',
            hasDefaults: true,
            variableKeys: [],
            defaultData: {},
        }
    },
    components: {
        'SchemaTree': SchemaTree
    },
    computed: {
        description() {
            const selected = this.variableKeys.find(k => k.value === this.selectedVaribaleType)
            if (selected && selected.hint) {
                return selected.hint
            }
            return 'Define the data the goes in and out.'
        }
    },
    methods: {
        createNewVariable () {
            this.logger.log(-1, 'createNewVariable', 'enter', this.newVariable, this.selectedVaribaleDataType)
            // schema type is ignored
            SchemaUtil.updateSchemaPath(this.schema, this.newVariable, null, this.selectedVaribaleDataType)
            this.$refs.tree.render(this.schema)
            this.onSelect([this.newVariable])
            this.newVariable = ''
        },
        onSelect(s) {
            const newValue = s[0]
            const currentValue = this.databinding[this.selectedVaribaleType]
            if (currentValue != newValue) {
                this.logger.log(-1, 'onSelect', 'set', this.selectedVaribaleType, newValue)
                this.$set(this.databinding, this.selectedVaribaleType, newValue)
            } else {
                this.logger.log(-1, 'onSelect', 'delete', this.selectedVaribaleType)
                this.$delete(this.databinding, this.selectedVaribaleType)
            }
            this.showSelected()
            this.onChange()
        },
        setVariableType(variable) {
            this.logger.log(-1, 'setVariableType', 'enter', variable)
            this.selectedVaribaleType = variable.value
            this.selectedVaribaleDataType = variable.type
            this.showSelected()
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
        },
        setSchema(schema) {
            this.schema = lang.clone(schema)
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
                this.selectedVaribaleDataType = this.variableKeys[0].type
            }
            setTimeout(() => {
                this.showSelected()
            }, 100)
            this.isArrayWidget = DataBindingService.isArrayDataBindingWidget(v)
            this.logger.log(1, 'setWidget() > exit ', this.isArrayWidget, this.selectedVaribaleType)
        },
        showSelected () {
            if (this.$refs.tree) {
                const variable = this.databinding[this.selectedVaribaleType]
                this.logger.log(1, 'showSelected() > ', this.selectedVaribaleType, this.variable)
                if (variable) {
                    this.$refs.tree.selectNode([variable])
                } else {
                    this.$refs.tree.selectNode([])
                }
  
            } else {
                console.warn('No tree')
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