<template>
  <div :class="['qux-image', cssClass]" @click="onClick">
    <span class="qux-image-icon mdi mdi-image"></span>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-image.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qImage',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  mounted () {
     Logger.log(4, 'qImage.mounted()')
  }
}
</script>
