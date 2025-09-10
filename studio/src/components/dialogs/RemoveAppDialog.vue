<template>
  <BaseDialog
    :title="dialogHeader"
    :subtitle="app && app.name"
    @confirmAction="confirm"
    :labels="labels"
    ref="dialog"
  >
    <div>
      <p>
        Are you sure you want to remove <strong>{{ app && app.name }}</strong
        >?
      </p>
    </div>
  </BaseDialog>
</template>

<style lang="scss">
@import "style/scss/theme_dialog.scss";
@import "style/components/dialog.scss";
</style>

<script>
import BaseDialog from "./BaseDialog.vue";
import Services from "services/Services";
export default {
  name: "ConfirmRemoveDialog",
  props: [],
  components: {
    BaseDialog
  },
  data() {
    return {
      app: {},
      dialogHeader: "",
      labels: {
        confirm: "Remove",
        cancel: "Cancel",
        type: "danger"
      },
    };
  },
  methods: {
    close() {
      this.$refs.dialog.close();
    },
    async confirm() { 
      // FIXME: this needs some app edit roken
      const res = await Services.getModelService(this.$route).deleteApp(this.app);
      if (res.status === "ok") {
        this.$emit("showSuccess", "Name was saved...");
      } else {
        this.$emit("showError", "Ops! Could not change the name. Try again!");
      }
      await this.$emit("loadApps");
      this.$refs.dialog.close();
    },
    show(app) {
      this.app = app;
      this.dialogHeader = `Confirm Removal: `;
      this.$refs.dialog.show();
    },
  },
};
</script>
