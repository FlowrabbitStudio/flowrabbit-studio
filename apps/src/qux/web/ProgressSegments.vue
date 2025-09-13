
<template>
    <div class="ProgressSteps">
        <div class="qux-progress-segments">
           <div 
                @click="(e) => onSelect(i, e)" 
                :class="['qux-progress-element', { 'qux-progress-element active': isActiveElement(i) }]" 
                v-for="i in elements" :key="i"
            >
                <div class="qux-progress-element__background"></div>
            </div>
        </div>
    </div>
  </template>
<style lang="scss">
  @import '../scss/qux-progress-segments.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
    name: 'qProgressSegments',
    mixins: [_Base],
    data: function () {
        return {
            selected: 0
        }
    },
    computed: {
      selectedValue () {
          if (this.selected) {
            return this.selected
          }
          return this.element.props.value
      },
      elements () {
        if (this.element) {
            const max = this.element.props.max
            if (typeof max === "string") {
              try {
                return parseInt(max)
              } catch (e) {
                console.log(e)
              }
            }
            return max
        }
        return 0
      }
    },
    methods: {
        onSelect(pos, e) {
            this.onValueChange(pos)
            this.onClick(e);
            this.selected = pos
        },
        isActiveElement(i) {
            return this.selectedValue >= i
        }
        
    },
    mounted () {
        this.selected = this.element.props.value;
        this.onValueChange(this.element.props.value);
    }
  };
  </script>