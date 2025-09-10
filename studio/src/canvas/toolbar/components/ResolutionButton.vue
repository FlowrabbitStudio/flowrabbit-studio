<template>
  <div :class="['MatcToolbarEditMode', { 'MatcToolbarEditModeAnimated': animated }]">

    <div class="MatcToolbarEditModeCntr" ref="cntr">
      <div class="MatcToolbarEditModeHighlight" :style="{ 'width': highlightWidth + 'px', 'left': highlightX + 'px' }">

      </div>
      <a @click="setMobile"
        :class="['MatcToolbarEditModeItem', { 'MatcToolbarEditModeActive': selected === 'm' }]" ref="btnMobile">
        <QIcon icon="DeviceMobile" v-if="hasIcon"/> Mobile
      </a>
      <a @click="setDesktop"
        :class="['MatcToolbarEditModeItem', { 'MatcToolbarEditModeActive': selected === 'd' }]"
        ref="btnDesktop">
        <QIcon icon="DeviceDesktop" v-if="hasIcon"/> Desktop
      </a>
    </div>

  </div>
</template>
<script>

import Logger from "common/Logger";
import _Tooltip from 'common/_Tooltip'
import NLS from 'common/NLS'
import domGeom from 'dojo/domGeom'
import QIcon from 'page/QIcon'

export default {
  name: "ResolutionButton",
  mixins: [_Tooltip, NLS],
  props: ['value'],
  data: function () {
    return {
      animated: false,
      highlightWidth: 0,
      highlightX: 0,
      canvasViewMode: 'design',
      selected: 'm',
      hasIcon: false
    };
  },
  computed: {

  },
  components: { QIcon },
  methods: {
    setMobile() {
      this.log.log(1, 'setDesign', 'enter')
      this.selected = 'm'
      this.$emit('change', this.selected)
      this.setSelected(this.$refs.btnMobile)
    },
    setDesktop() {
      this.log.log(1, 'setCode', 'enter')
      this.selected = 'd'
      this.$emit('change', this.selected)
      this.setSelected(this.$refs.btnDesktop)
    },
    setSelected(node) {
      const pos = domGeom.position(node)
      const cPos = domGeom.position(this.$refs.cntr)
      this.highlightWidth = pos.w
      this.highlightX = pos.x - cPos.x - 1
    },
    nextView() {
      if (this.canvasViewMode === 'design') {
        this.setPrototype()
        return
      }
      if (this.canvasViewMode === 'prototype') {
        this.setDesign()
        return
      }
    }
  },
  watch: {
    value(v) {
      this.log.log(2, 'watch(value)', 'enter', v)
      this.value = v
    }
  },
  async mounted() {
    this.log = new Logger("ResolutionButton")
    this.addTooltip(this.$el, "Change the resolution")
    setTimeout(() => {
      this.setSelected(this.$refs.btnMobile)
    }, 30)

    setTimeout(() => this.animated = true, 500)
  }
};
</script>