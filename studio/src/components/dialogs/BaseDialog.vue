<template>
  <div v-if="showModal" :class="['modal-overlay', customClass, 'base-dialog']">
    <div class="modal-container">
      <div class="matc-dialog-header">
        <span class="matc-dialog-header-title">
          {{ title }} <strong>{{ subtitle }}</strong>
        </span>
      </div>
      <div class="matc-dialog">
        <div class="matc-dialog-content">
          <slot></slot>
          <div v-if="!hideDefaultActions" class="MatcButtonBarDialog MatcMarginTop">
            <a @click="close" class="MatcLinkButtonDialog" v-if="!showLoading">{{ cancelLabel }}</a>
            <a
              id="confirm"
              :class="['MatcButtonDialog', { MatcButtonRed: labelType === 'danger', loading: showLoading }]"
              @click="confirm"
              :disabled="showLoading"
            >
              <span v-if="showLoading" class="spinner-button mr-2"></span>
              <span>{{ confirmLabel }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../../style/scss/dialog.scss";
</style>

<script>
export default {
  name: "BaseDialog",
  props: {
    title: String,
    subtitle: String,
    minwidth: String,
    labels: Object,
    customClass: String,
    hideDefaultActions: Boolean,
  },
  data() {
    return {
      showModal: false,
      confirmLabel: (this.labels && this.labels.confirm) || "Save",
      cancelLabel: (this.labels && this.labels.cancel) || "Cancel",
      labelType: this.labels && this.labels.type,
      isLoading: false,
    };
  },
  computed: {
    showLoading() {
      return this.isLoading;
    },
  },
  methods: {
    close() {
      this.showModal = false;
    },
    show() {
      this.showModal = true;
    },
    async confirm() {
      this.setLoading(true);
      await this.$emit("confirmAction");
    },
    setLoading(loading) {
      this.isLoading = loading;
    },
  },
};
</script>
