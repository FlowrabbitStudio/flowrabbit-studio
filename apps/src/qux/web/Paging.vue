<template>
  <div :class="['qux-paging qux-common-no-select', cssClass]">
 
       <span :class="'qux-paging-item ' + valign" v-if="hasBack" @click="onBack">
          <span :class="'qux-common-label'">
              <span :class="backIcon" />
          </span>
      </span>

 
      <span :class="['qux-paging-item', {'qux-paging-item-active': page.isSelected}, valign]" v-for="page in pages" :key="page.value" @click="(e) => onSelect(page, e)">
          <span :class="'qux-common-label '">
                {{page.label}}
          </span>
      </span>

       <span :class="'qux-paging-item ' + valign"  v-if="hasNext" @click="onNext">
          <span :class="'qux-common-label  '">
                <span :class="nextIcon" />
          </span>
      </span>

   </div>
</template>
<style lang="scss">
    @import '../scss/qux-paging.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'
//import Vue from 'vue'

export default {
  name: 'qStepper',
  mixins: [_Base],
  data: function () {
      return {
          selected: 0,
          offset: 0,
      }
  },
  computed: {
      maxValue () {
        let dataBindig = this.dataBinding
        if (dataBindig && dataBindig.input) {
            const max = JSONPath.get(this.viewModel, dataBindig.input)
            if (max !== undefined) {
                return max
            }
        }
        if (this.element) {
            return this.element.props.max
        }
        return 0
      },
      hasBack () {
          return this.offset > 0
      },
      backIcon () {
          if (this.element) {
              return this.element.props.iconBack
          }
          return ''
      },
      nextIcon () {
          if (this.element) {
              return this.element.props.iconNext
          }
          return ''
      },
      hasNext () {
          return this.numberofVisibleElements + this.offset < this.maxValue
      },
      numberofVisibleElements () {
          if (this.element) {
              return this.getNumberOfVisibleElements(this.element, this.element.style, this.element.w)
          }
          return 0
      },
      valign () {
        if (this.element.style && this.element.style.verticalAlign) {
            return `qux-valign-${this.element.style.verticalAlign} `
        }
        return ''
      },
      pages () {
        const pages = []
        let selected = this.selected;
        if (this.element) {
            let dataBindig = this.dataBinding
            if (dataBindig && dataBindig.output) {
                const dbValue = JSONPath.get(this.viewModel, dataBindig.output)
                if (dbValue !== null && dbValue !== undefined) {
                    selected = dbValue
                }
            }
        }
        for (let i = 0; i < this.numberofVisibleElements; i++) {
           pages.push({
               value: this.offset + i,
               label:  this.offset + i + 1,
               isSelected: selected === i
           })
        }
        return pages
      }
  },
  methods: {
      onBack () {
        Logger.log(0, 'QPaging', 'onBack')
        this.offset -= this.numberofVisibleElements
        if (this.offset < 2) {
            this.offset = 0
        }
      },
      onNext () {
        Logger.log(0, 'QPaging', 'onNext')
        this.offset += this.numberofVisibleElements
        if (this.offset > this.maxValue - this.numberofVisibleElements) {
            this.offset = this.maxValue - this.numberofVisibleElements
        }
      },
      onSelect (page, e) {   
        this.onValueChange(page.value, 'output')
        this.selected = page.value
        this.onClick(e)
        Logger.log(-11, 'QPaging', 'onSelect', this.selected)
        this.$forceUpdate()
      },
      getNumberOfVisibleElements (model, style, width) {
        // keep in szyn
        let elementWidth = style.fontSize * 2
        let numberofVisibleElements = Math.round((width * 0.9) / elementWidth) - 1
        numberofVisibleElements = Math.min(numberofVisibleElements, this.maxValue);
        if (model.props.maxVisisble > 1) {
            numberofVisibleElements = Math.min(numberofVisibleElements, model.props.maxVisisble);
        }
        if (this.offset > 0 ) {
            numberofVisibleElements--
        }
        return numberofVisibleElements
    }
  },
  mounted () {
    Logger.log(3, 'QPaging', 'mounted')
  }
}
</script>
