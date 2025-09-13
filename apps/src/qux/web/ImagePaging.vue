<template>
    <div class="ImagePaging">
        <div class="qux-image-paging">
            <div 
                @click="(e) => onSelect(i, e)" 
                :class="['qux-image-paging-element', {'qux-image-paging-element active': isActiveElement(i)}]" 
                v-for="i in elements" :key="i"
            >
                <div class="qux-image-paging-element__background" ></div>
            </div>
        </div>
    </div>
  </template>
<style lang="scss">
    @import '../scss/qux-image-paging.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
    name: 'qImagePaging',
    mixins: [_Base],
    data: function () {
        return {
            selected: 0,
            elements: 0
        }
    },
    computed: {
      selectedValue () {
          if (this.selected) {
            return this.selected
          }
          return this.element.props.value
      },
    },
    methods: {
        onSelect(pos, e) {
            this.onValueChange(pos)
            this.onClick(e);
            this.selected = pos
        },
        isActiveElement(i) {
            return this.selectedValue === i
        }
        
    },
    mounted () {
        this.elements = this.element.props.max
        this.onValueChange(this.element.props.value)
    }
  };

</script>