<template>
    <div :class="['qux-geo-location', cssClass, { 'qux-geo-location-has-data': hasData }]" @click="getLocation">
        <span class="qux-geo-location-label" v-if="!location">{{ label }}</span>
        <div v-if="location && location.latitude" class="qux-geo-location-cntr">
            <span class="qux-geo-location-label">{{location.latitude}}</span> 
            - 
            <span class="qux-geo-location-label">{{location.longitude}}</span>
        </div>
    </div>
</template>
<style lang="scss">
@import '../scss/qux-geo-location.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
    name: 'qGeoLocation',
    mixins: [_Base],
    data: function () {
        return {
            location: false
        }
    },
    computed: {
        hasData() {
            return true
            // if (this.element) {
            //     let input = this.dataBindingInput
            //     return input
            // }
            // return this.checked
        },
        label () {
            if (!navigator.geolocation) {
                return "Not supported"
            }
            // if (this.location) {
            //     return `Lat: ${this.location.latitude} - Long:${this.location.longitude}`
            // }
            if (this.element && this.element.props && this.element.props.label) {
                return this.element.props.label
            }
            return ''
        },
    },
    methods: {
        getLocation () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    this.location = pos.coords
                    this.onValueChange(this.location, 'default')
                })
            } else {
                Logger.log(1, "GeoLocation.getLocation() > not possible")
            }
        },
        // toggle() {
        //     if (this.element) {
        //         let value = !this.isSelected
        //         this.onValueChange(value, 'default')
        //         Logger.log(1, 'qIconToggle.toggle() >' + this.dataBindingInputPath, value)
        //     } else {
        //         this.checked = !this.checked
        //         this.$emit('change', this.checked)
        //         this.$emit('update:modelValue', this.checked)
        //         Logger.log(5, 'qIconToggle.toggle() >' + this.checked)
        //     }
        // }
    },
    mounted() {
        if (this.element?.props?.autoLoad) {
            this.getLocation()
        }
    }
}
</script>
