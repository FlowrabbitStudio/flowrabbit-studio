<template>
  <span :class="['qux-copy-clipboard', cssClass, icon]" :style="{fontSize: fontSize}" @click="onCopy">
  </span>
</template>
<style lang="scss">
    @import '../scss/qux-copy-clipboard.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qCopyClipboard',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  computed: {
      icon () {
          return `mdi mdi-content-copy`
      },
      fontSize() {
          const fontSize = Math.round(this.element?.w * 0.8) + 'px'
          return fontSize
      }
  },
  methods:{
    onCopy () {
      let input = this.dataBindingInput
      if (typeof input !== "string") {
        input = input ? input.toString() : ""
      }
      const textarea = document.createElement('textarea');
      textarea.value = input;
      document.body.appendChild(textarea);

      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }

      document.body.removeChild(textarea);
      this.onClick()
    }
  },
  mounted () {
  }
}
</script>
