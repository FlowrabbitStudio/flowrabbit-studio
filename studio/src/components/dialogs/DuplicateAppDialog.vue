<template>
  <BaseDialog
    :title="dialogHeader"
    :subtitle="app && app.name"
    :labels="labels"
    ref="dialog"
    @confirmAction="confirm"
  >
    <div class="form-group">
      <label>Duplicated App Name</label>
      <input type="text" class="form-control" v-model="name" ref="inputName" />
      <div data-binding-error="name"></div>
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
  name: "RenameAppDialog",
  props: ["selectedOrg"],
  data: function () {
    return {
      app: {},
      name: "",
      dialogHeader: "",
      labels: {
        confirm: "Duplicate",
        cancel: "Cancel",
        type: "primary",
      },
    };
  },
  components: {
    BaseDialog,
  },
  methods: {
    close() {
      this.$refs.dialog.close();
    },
    async confirm() {
      const res = await Services.getModelService(this.$route).copyApp(
        this.app,
        this.name,
        this.selectedOrg.id
      );
      if (res.status === "ok") {
        this.$emit("showSuccess", "App was duplicated successfully.");
      } else {
        this.$emit("showError", "Ops! Could not duplicate the app. Try again!");
      }
      await this.$emit("loadApps");
      this.close();
    },
    show(app) {
      this.app = app;
      this.name = `${this.app && this.app.name} Copy`;
      this.dialogHeader = `Duplicate app: `;
      this.$refs.dialog.show();
    },
  },
};
</script>
