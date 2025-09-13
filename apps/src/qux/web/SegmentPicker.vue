<template>
    <div :class="['qux-segment-picker', cssClass]">
       
        <div class="qux-segment-picker-cntr">
            <div class="qux-segment-inidcator" :style="indicatorStyle">
        </div>
            <div :class="['qux-segment-item', {'qux-segment-item-selected': isChecked(option)}]"
                :style="widthStyle"
                v-for="option in segmentOptions" :key="option.value" @click="(e) => select(option, e)"
                ref="items">
                <span class="qux-segment-item-label">
                    {{ option.label }}
                </span>
            </div>
        </div>
       
    </div>
</template>
<style lang="scss">
@import '../scss/qux-segment-picker.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
//import Vue from 'vue'

export default {
    name: 'qSegmentPicker',
    mixins: [_Base],
    data: function () {
        return {
            selected: null
        }
    },
    computed: {
        widthStyle () {
            const l = this.segmentOptions.length
            const w = 100 / l  
            return `width: ${w}%;`      
        },
        indicatorStyle() {
            const input = this.selectedInput
            const index = this.segmentOptions.findIndex(o => o.value === input)
            if (!input || index < 0) {
                return "opacity:0"
            }

            const l = this.segmentOptions.length
            const w = 100 / l
            return `width: ${w}%; left: ${w  * index}%;`
        },
        segmentOptions() {
            if (this.element) {
                return this.optionsWithValues
            }
            return []
        },
        isMultiSelect() {
            if (this.element) {
                return this.element.props.multi
            }
            return false
        },
        selectedInput () {
            let input = this.dataBindingInput
            if (input === undefined || input === null) {
                if (this.element?.props?.selected) {
                    input = this.element?.props?.selected
                }
            }
            return input
        }
    },
    methods: {
        isChecked(option) {
   
            const input = this.selectedInput
            if (input) {
                if (this.isMultiSelect) {
                    Logger.log(5, 'qSegmentButton.isChecked() > Mutli : ' + option.value, input)
                    return input.indexOf(option.value) >= 0
                } else {
                    Logger.log(5, 'qSegmentButton.isChecked() > Single : ' + option.value, input)
                    return input === option.value
                }
            }
            return false
        },

        select(option, e) {
            console.debug('select', option)
            let value = option.value
            if (this.isMultiSelect) {
                let input = this.dataBindingInput
                if (input) {
                    if (!Array.isArray(input)) {
                        input = [input]
                    }
                    let pos = input.indexOf(value)
                    if (pos < 0) {
                        input.push(value)
                    } else {
                        input = input.filter(item => item !== option)
                        //Vue.delete(input, pos)
                    }

                } else {
                    input = [value]
                }
                this.onValueChange(input, 'default')
                Logger.log(-1, 'qSegmentPicker.select() > Single: ' + this.dataBindingInputPath,)
            } else {
                this.onValueChange(value, 'default')
                Logger.log(-1, 'qSegmentButton.select() > Single: ' + this.dataBindingInputPath, value)
            }
          this.onClick(e)
        }
    },
    mounted() {
    }
}
</script>
  