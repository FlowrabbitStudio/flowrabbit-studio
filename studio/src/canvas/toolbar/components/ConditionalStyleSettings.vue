<template>

    <div class="MatcDialogContainer MatcDialogFlexContainer MatcDialogLL" style="height: 480px;">
        <div class="MatcDialogContent">
            <div class="MatcDialogContentHeader MatcDialogContentHeaderBorder">
                Visibility
            </div>


            <div class="MatcConditionalStyleSettings MatcDialogContentGrow" style="overflow: visible;">

                <div class="form-group">
                    <label>Condition</label>
                    <DropDownButton :options="stateOptions" :value="value.state" @change="setState" />
                </div>

                <template v-if="value.state === 'show' || value.state === 'hide'">
                    <div class="form-group" v-if="value.state">
                        <label>Variable</label>
                        <DropDownButton :value="value.databinding" @change="setDataBinding($event)" :options="databindingHints" placeholder="" />
                    </div>


                    <div class="form-group" v-if="value.state && value.databinding">
                        <label>Operation</label>
                        {{value.operation}}
                        <DropDownButton :options="operationOptions" :value="value.operation" @change="setOperation" />
                    </div>

                    <div class="form-group"
                        v-if="value && value.operation !== 'empty' && value.operation !== 'notEmpty' && value.operation && value.state">
                        <label>Value</label>
                        <input class="form-control" :value="value.value" @change="setDataValue">
                    </div>


                </template>
            </div>

            <div class="MatcButtonBarDialog">
                <a @click="onCancel" class="MatcLinkButtonDialog">Cancel</a>
                <a :class="['MatcButtonDialog']" @click="onSave">Save</a>
            </div>
        </div>
    </div>



</template>
<style lang="scss">
@import '../../../style/scss/toolbar_conditional_style.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import DropDownButton from 'page/DropDownButton'
//import Input from 'common/Input'
import DataBindingService from 'services/DataBindingService'

export default {
    name: 'ConditionalStyleSettings',
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            value: {},
            stateOptions: [
                { value: null, label: 'Allways visible' },
                { value: 'showWhenLoading', label: 'Show while app is loading' },
                { value: 'hideWhenLoading', label: 'Hide while app is loading' },
                { value: 'show', label: 'Show when a data condition is true' },
                { value: 'hide', label: 'Hide when a data condition is true' }
            ],
            operationOptions: [
                { value: "empty", label: "Empty" },
                // {value: "notEmpty", label:"Not Empty"},
                { value: "==", label: "Equals (==)" },
                { value: "!=", label: "Not Equals (!=)" },
                { value: ">", label: "Bigger (>)" },
                { value: "<", label: "Smaller (<)" },
                { value: ">=", label: "Bigger Equals (>=)" },
                { value: "<=", label: "Smaller Equals(<=)" }
            ],
            databindingHints: []
        }
    },
    components: {
        'DropDownButton': DropDownButton,
        //'Combo': Input
    },
    computed: {
        // databindingHints() {
        //     const hints = DataBindingService.getAllBindingPaths(this.model, 'Value')
        //     const options = hints.map(h => {
        //         return {
        //             label: h,
        //             value: h
        //         }
        //     })
        //     console.log('databindingHints', hints, this.model)
        //     //options.unshift({label: 'App is loading data *', value: '$flowrabbit.loading'})
        //     return options
        // }
    },
    methods: {

        onCancel() {
            this.emit('cancel')
        },

        onSave() {
            this.emit('save')
        },

        setDataValue(e) {
            this.value.value = e.target.value
            this.$forceUpdate()
        },

        setOperation(value) {
            this.value.operation = value
            this.$forceUpdate()
        },

        setDataBinding(value) {
            this.value.databinding = value
            this.$forceUpdate()
        },

        setState(s) {
            this.value.state = s
            this.$forceUpdate()
        },

        setModel(m) {
            this.model = m
            const hints = DataBindingService.getAllBindingPaths(this.model, 'Value')
            this.databindingHints = hints.map(h => {
                return {
                    label: h,
                    value: h
                }
            })
        },
        setSchema(schema) {
            this.schema = schema
        },

        setValue(value) {
            this.value = structuredClone(value)
        },

        getValue() {
            if (this.value.state) {
                return this.value
            }
            return null
        }

    },
    mounted() {
    }
}
</script>