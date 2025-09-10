<template>
  <ZoomDialog ref="dialog" :dialogheader="dialogHeader">
    <div key="MatcRenameDialog" class="MatcDialog">
      <div class="form-group">
        <label>New App Name</label>
        <input
          type="text"
          class="form-control"
          v-model="name"
          ref="inputName"
          placeholder="App name"
        />
        <div data-binding-error="name"></div>
      </div>
    </div>
    <div class="MatcButtonBarDialog  ">
      <a @click="close" class="MatcLinkButtonDialog">Cancel</a>
      <a id="createNewApp" class="MatcButtonDialog" @click="confirmRename"
        >Rename</a
      >
    </div>
  </ZoomDialog>
</template>

<style lang="scss">
@import "style/scss/theme_dialog.scss";
@import "style/components/dialog.scss";
</style>

<script>
import ZoomDialog from "common/ZoomDialog";
import Services from "services/Services";
export default {
  name: "RenameAppDialog",
  props: [],
  components: {
    ZoomDialog: ZoomDialog,
  },
  data() {
    return {
      app: {},
      dialogHeader: "Rename App",
      name: this.app && this.app.name,
    };
  },
  methods: {
    close() {
      this.$refs.dialog.close();
    },
    async confirmRename() {
      let res = await Services.getModelService().updateAppProps(this.app.id, {
        id: this.app.id,
        name: this.name,
      });
      if (res.status === "ok") {
        this.$emit("showSuccess", "Name was saved...")
      } else {
        this.$emit("showError", "Ops! Could not change the name. Try again!")
      }
      await this.$emit("loadApps");
      this.close();
    },
    show(app) {
      this.app = app;
      this.name = app.name;
      this.dialogHeader = `Rename app: ${app.name}`;
      this.$refs.dialog.show();
    },
  },
};
</script>

<style  lang="scss">
@import "../../style/scss/dialog.scss";
</style>
