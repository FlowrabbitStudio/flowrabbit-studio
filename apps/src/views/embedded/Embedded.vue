<template>
  <div class="luisa-landing luisa-low-code-wrapper" v-if="hash">
    <Luisa 
      :design="hash"  
      :token="hash" 
      :config="config" 
      v-model="viewModel" 
      resizeParent="iframe"
      @qScreenLoad="onScreenLoaded" 
      @qViewModelChange="onViewModelChange"
      :startScreenId="startScreenId" />
  </div>
</template>
<style lang="scss">

</style>
<script>

import Logger from '../../util/Logger'

export default {
  name: 'Home',
  data: function () {
    return {
      startScreenId: null,
      design: '',
      responsive: null,
      hash: '',
      isQUX: true,
      actions: null,
      viewModel: {    
      },
      config: {
        debug: {
          logLevel: -1
        },
        loadFonts: true,
        loadFontsWarning: false,
        responsive: [
        ],
        css: {
          attachLabels: false,
          huggedCanResize: true
        },
        figma: {
          downloadVectors: true,
        },
        router: {
          key: 'screenName',
          prefix: 'embedded'
        }
      }
    }
  },
  components: {
  },
  methods: {
    onViewModelChange (viewModel) {
      window.top.postMessage(JSON.stringify(viewModel), '*');
    },
    onScreenLoaded (e) {
      Logger.log(2, 'Embedded.onScreenLoaded() > enter', e.h)
      window.parent.postMessage({
        type:'resize',
        size: {
          w: e.screen.w,
          h: e.screen.h
        }
      }, '*')
      Logger.log(2, 'Embedded.onScreenLoaded() > exit', e)
    },
  },
  async mounted () {
    Logger.log(1, 'Embedded.mounted()', this.$route.params, this.$route.meta)
    this.hash = this.$route.params.id
    this.config.router.prefix = `embedded/${this.hash}`
    if (this.$route.query.start) {
      this.startScreenId = this.$route.query.start
      Logger.log(1, 'Embedded.mounted() > start', this.startScreenId)
    }
    Logger.log(1, 'Embedded.mounted()', this.hash)
  }
}
</script>
