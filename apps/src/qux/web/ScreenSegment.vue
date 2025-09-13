<template>
    <div :class="['qux-screen-segment', cssClass]">
        <qContainer v-if="segmentScreen" class="qux-screen qux-segement-screen-cntr" :element="segmentScreen" :model="model"
            @qActionLine="forwardActionLine"
            @qCallback="forwardCallback" 
            @qClick="forwardClick" 
            @qChange="forwardChange" 
            @qKeyPress="forwardKeyPress" 
            @qFocus="forwardFocus"
            @qBlur="forwardBlur" 
            @qMouseOver="forwardMouseOver" 
            @qMouseOut="forwardMouseOut" 
            @qViewModelChange="forwardViewModel">
        </qContainer>
    </div>
</template>
<style lang="scss">
@import '../scss/qux-screen-segment.scss';
</style>
<script>

import _Base from './_Base.vue'
//import Logger from '../core/Logger'
//import Vue from 'vue'

export default {
    name: 'qScreenSegment',
    inject: ['viewModel', 'validationErrors', 'segementScreens'],
    mixins: [_Base],
    data: function () {
        return {
            selected: null
        }
    },
    computed: {
        segmentScreen() {
            let screenID = this.dataBindingInput
            if (!screenID) {
                screenID = this.element.props.screenID
            }
            if (this.segementScreens[screenID]) {
                const srcn = this.segementScreens[screenID]
                return srcn
            }
            return null
        }
    },
    methods: {
        forwardActionLine (element, e, value) {
            this.$emit('qActionLine', element, e, value);
        },
        forwardClick(element, e, value) {
            this.$emit('qClick', element, e, value);
        },
        forwardChange(element, e, value) {
            this.$emit('qChange', element, e, value);
        },
        forwardFocus(element, e, value) {
            this.$emit('qFocus', element, e, value);
        },
        forwardBlur(element, e, value) {
            this.$emit('qBlur', element, e, value);
        },
        forwardMouseOver(element, e, value) {
            this.$emit('qMouseOver', element, e, value);
        },
        forwardMouseOut(element, e, value) {
            this.$emit('qMouseOut', element, e, value);
        },
        forwardKeyPress(element, e, value) {
            this.$emit('qKeyPress', element, e, value)
        },
        forwardCallback(element, e, value) {
            this.$emit('qCallback', element, e, value)
        },
        forwardViewModel(element, path, value) {
            this.$emit('qViewModelChange', element, path, value)
        }
    },
    mounted() {
    }
}
</script>