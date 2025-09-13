<template>  
  <div :class="cssClass">
    <audio class="qux-audioplayer" controls :src="src">
        Your browser does not support the audio element.
    </audio>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-audioplayer.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qAudioPlayer',
  mixins: [_Base],
  computed: {
     src () {
      let audiofile = this.dataBindingInput
      if (audiofile) {
        return audiofile
      }
      return ""
    }
  },
  data: function () {
      return {
      }
  },
  mounted () {
  }
}
</script>
