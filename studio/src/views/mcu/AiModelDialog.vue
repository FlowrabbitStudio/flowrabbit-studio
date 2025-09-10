<template>
    <BaseDialog
      title="Edit AiModel"
      subtitle=""
      :labels="labels"
      ref="dialog"
      @confirmAction="saveModel"
    >
      <div class="MatcDialog MatcSurveyDialog">
        <div class="form-group">
          <label>Name</label>
          <textarea class="form-control" v-model="modelTXT" ></textarea>
          <span class="MatcHint">* Make sure all keys are escaped with ""</span>
        </div>
       
      </div>
    </BaseDialog>
  </template>
  <style lang="scss" scoped>

  .MatcDialog {
    padding: 0;
  }

  textarea {
    width: 100%;
    height: 200px;
  }
  </style>
  <script>
  import Logger from "common/Logger";
  import Services from "services/Services";
  import AdminService from "./AdminService";
  import BaseDialog from "../../components/dialogs/BaseDialog.vue";
  
  export default {
    name: "AiModelDialog",
    mixins: [],
    props: [""],
    data: function () {
      return {
        modelTXT: "",
        paidUntilDate: "",
        isBlocked: false,
      };
    },
    components: {
      BaseDialog,
    },
    computed: {
      labels() {
        return {
          labels: {
            confirm: this.secret && this.secret.id ? "Update" : "Create",
            cancel: "Cancel",
            type: "primary",
          },
        };
      },
    },
    methods: {
      async saveModel() {
        let model
        try {
          model = JSON.parse(this.modelTXT);
        } catch (e) {
          this.logger.error("Error saving model", e);
          this.$root.$emit("Error", "Error saving model > " + e);
          return
        }

        if (model && model.id) {
          await this.updateModel(model);
        } else {
          await this.createModel(model);
        }
      },
      async updateModel(model) { 
        await this.adminService.updateAiModel(model);
        if (this.saveCallback) {
          this.saveCallback();
        }
        this.close();
      },
      async createModel(model) {
        await this.adminService.createAiModel(model);
        if (this.saveCallback) {
          this.saveCallback();
        }
        this.close();
      },
      close() {
        this.$refs.dialog.close();
      },
      show(model, saveCallback) {
        this.$refs.dialog.show();
        this.modelTXT = JSON.stringify(model, null, 2);
        this.saveCallback = saveCallback;
      },
    },
    mounted() {
      this.logger = new Logger("AiModelDialog");
      this.adminService = new AdminService();
      this.adminService.setToken(Services.getUserService().getToken());
    },
  };
  </script>