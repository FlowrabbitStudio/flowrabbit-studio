<template>
  <div :class="['qux-toggle', cssClass, {'qux-active': isActive || isLoading}, {'qux-toggle-loading': isLoading}]" @click="toggle">
        <span class="qux-common-label" v-if="!isLoading">
            {{label}}
        </span>
        <span class="qux-common-label" v-if="isLoading">
            {{loadingMessage}} 
            <span class="qux-toggle-dots" v-if="isLoading">
              {{dots}}
            </span>
        </span>
       
	</div>
</template>
<style lang="scss">
    @import '../scss/qux-toggle.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qToggle',
  mixins: [_Base],
  data: function () {
      return {
          active: false,
          isLoadingClicked: false,
          loadingAnimationStep: 0
      }
  },
  computed: {
      isLoading () {
        if (this.element) {
          const input = this.dataBindingInput
          if (input != undefined && input !== null) {
            return input === true
          }
        }
        return this.isLoadingClicked
      },
      loadingIcon () {
        return ''
      },
      dots () {
        const to = this.loadingAnimationStep % this.loadingMessage.length
        return "...".substring(0, to)
      },
      loadingMessage () {
        let message = 'Loading'
        if (this.element?.props?.loadingMessage) {
            message = this.element?.props?.loadingMessage
        }
        return message

      },
      isActive () {
          if (this.element) {
            const input = this.dataBindingInput
            return input === true
          }
          return this.active
      }
  },
  methods: {
      toggle (e) {
  
        if (this.element?.props?.isLoadingButton) {
          this.isLoadingClicked = true
          this.loadingAnimationStep = 0
          this.onClick(e)
          if (this.loadingIntervalId) {
            clearInterval(this.loadingIntervalId)
          }
          this.loadingIntervalId = setInterval(() => {
            this.loadingAnimationStep += 1
          }, 200)
        } else {
          if (this.element) {
            let value = !this.isActive
            this.onValueChange(value, 'default')
            Logger.log(5, 'qToggle.toggle() >' + this.dataBindingInputPath, value)
          } else {
            this.active = !this.active
            this.$emit('change', this.active)
            this.$emit('update:modelValue', this.active)
            Logger.log(5, 'qToggle.toggle() >' + this.active)
          }
        }

      }
  },
  watch: {
    value (v) {
      Logger.log(5, 'qToggle.watch(value) > enter', v)
      if (v === false || v === true) {
        this.active = v
      }
      this.value = v
    }
  },
  mounted () {
    Logger.log(5, 'qToggle.mounted() enter')
    if (this.value === true || this.value === true) {
      this.active = this.value
    }
  },
  beforeUnmount () {
    if (this.loadingIntervalId) {
      clearInterval(this.loadingIntervalId)
    }
  }
}
</script>
