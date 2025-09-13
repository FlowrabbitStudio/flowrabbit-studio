<template>
  <router-link 
    :class="['qux-button', cssClass, { 'qux-loading': isLoading }, { 'qux-disabled': disableButton }]"
    v-if="hasLink" 
    :to="link" 
    @click="handleClick"
    v-tooltip="tooltipText"
    >
    <div class="qux-button-content">
      <span v-if="showLoading" class="qux-loading-spinner"></span>
      <span class="qux-common-label" v-if="buttonLabel && !(showLoading && loadingAnimation === 'loadingIcon')">
        {{ buttonLabel }}
      </span>
      <!-- <span class="qux-common-label" v-if="hasSlot && !(showLoading && loadingAnimation === 'loadingIcon')">
        <slot></slot>
      </span> -->
    </div>
  </router-link>
  <!-- no link -->
  <div 
    :class="['qux-button', cssClass, { 'qux-loading': isLoading }, { 'qux-disabled': disableButton }]" 
    v-else
    @click="handleClick" 
    v-tooltip="tooltipText"
  >
    <div class="qux-button-content">
      <span v-if="showLoading" class="qux-loading-spinner"></span>
      <span class="qux-common-label" v-if="buttonLabel && !(showLoading && loadingAnimation === 'loadingIcon')">
        {{ buttonLabel }}
      </span>
      <!-- <span class="qux-common-label" v-if="hasSlot && !(showLoading && loadingAnimation === 'loadingIcon')">
        <slot></slot>
      </span> -->
    </div>
  </div>
</template>

<style lang="scss">
@import "../scss/qux.scss";
@import "../scss/qux-button.scss";
</style>

<script>
import _Base from "./_Base.vue";

export default {
  name: "qButton",
  mixins: [_Base],
  data() {
    return {
      loading: false
    }
  },
  inject: ['viewModel', 'luisaAppState'],
  computed: {
    buttonLabel() {
      const loadingLabel = this.element?.props?.loadingText;
      if (this.showLoading && loadingLabel && loadingLabel.length > 0) {
        return loadingLabel;
      }
      return this.label;
    },
    loadingAnimation() {
      return this.element?.props?.loadingAnimation;
    },
    showLoading() {
      return this.isLoading && (this.loadingAnimation === "loading" || this.loadingAnimation === "loadingIcon");
    },
    disableButton() {
      return this.showLoading; // this.element?.props?.disableLoading && 
    },
    isLoading() {
      const isLuisaLoading = this.luisaAppState?.loading
      if (isLuisaLoading === false) {
        this.checkLuisaLoading()
      }
      return this.loading && isLuisaLoading;
    },
  },
  watch: {
  },
  methods: {
    checkLuisaLoading () {
      setTimeout(() => {
        if (this.luisaAppState?.loading === false) {
          this.loading = false
        }
      }, 200)
    },
    async handleClick(event) {
      if (this.element?.props?.loadingAnimation) {
        this.loading = !this.isLoading
      }
      this.onClick(event)
    },
  },
};
</script>
