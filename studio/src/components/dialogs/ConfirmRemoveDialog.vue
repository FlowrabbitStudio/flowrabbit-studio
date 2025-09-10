<template>
  <BaseDialog
    :title="dialogTitle"
    subtitle=""
    :labels="labels"
    ref="dialog"
    @confirmAction="handleConfirm"
  >
    <div class="matc-dialog-content">
      <p>
        Are you sure you want to remove <strong>{{ item }}</strong>?
      </p>
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from "./BaseDialog.vue";

export default {
  name: "ConfirmRemoveDialog",
  props: [],
  data() {
    return {
      item: {},
      dialogTitle: "Confirm Removal",
      labels: {
        confirm: "Yes",
        cancel: "Cancel",
        type: "danger"
      },
      isLoading: false
    };
  },
  components: {
    BaseDialog
  },
  methods: {
    async handleConfirm() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.$refs.dialog.setLoading(true); 

      await this.$emit('confirm');

      this.isLoading = false;
      this.$refs.dialog.setLoading(false);

      this.handleClose();
    },
    handleClose() {
      this.$refs.dialog.close();
      this.$emit('cancel');
    },
    show(item) {
      this.item = item;
      this.$refs.dialog.show();
    }
  }
};
</script>

<style lang="scss">
@import "../../style/scss/dialog.scss";
</style>
