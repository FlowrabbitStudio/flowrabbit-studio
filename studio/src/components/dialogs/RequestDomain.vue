<template>
  <BaseDialog
    title="Custom Domain Request"
    subtitle=""
    :labels="labels"
    ref="dialog"
    @confirmAction="handleRequest"
  >
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <input
            v-model="domain.name"
            placeholder="Enter the domain URL"
            class="input"
          />
          <input
            v-model="domain.reason"
            placeholder="Enter the reason"
            class="input"
          />
        </div>
      </div>
      <div class="MatcErrorLabel" v-if="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from "./BaseDialog.vue";

export default {
  name: "RequestDomain",
  components: {
    BaseDialog
  },
  props: ["onRequestDomain", "onClose"],
  data() {
    return {
      domain: {},
      errorMessage: "",
      isSaving: false,
      labels: {
        confirm: "Request",
        cancel: "Cancel",
        type: "primary"
      },
    };
  },
  methods: {
    handleClose() {
      this.$refs.dialog.close();
      this.onClose();
    },
    handleRequest() {
      if (this.isSaving) return;

      const domainStr = this.domain.name.trim();
      if (domainStr === "") {
        this.errorMessage = "The domain URL cannot be empty!";
        return;
      }

      const reasonStr = this.domain.reason.trim();
      if (reasonStr === "") {
        this.errorMessage = "The reason cannot be empty!";
        return;
      }

      this.isSaving = false;
      this.onRequestDomain(this.domain);
      this.handleClose();
    },
    show() {
      this.$refs.dialog.show();
    }
  },
  mounted() {
    if (this.$refs && this.$refs.input) {
      this.$refs.input.focus();
    }
  },
};
</script>

<style lang="scss">
@import "../../style/scss/dialog.scss";
</style>
