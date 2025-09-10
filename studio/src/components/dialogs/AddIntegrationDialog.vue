<template>
  <BaseDialog
    :title="dialogHeader"
    subtitle=""
    :labels="labels"
    ref="dialog"
    @confirmAction="confirmSelection"
    @close="cancel"
  >
    <div class="form-group">
      <label for="modelType">Type of Model</label>
      <Combo
        :value="selectedType"
        :hints="modelTypes"
        placeholder="Select a type"
        :formControl="true"
        ref="input"
        cssClass="input"
        :fireEmpty="true"
        @change="updateBrands"
        isDropDown="true"
      />
    </div>

    <div class="form-group" v-if="brands.length > 0">
      <label for="brand">Brand</label>
      <Combo
        :value="selectedBrand"
        :hints="brands"
        placeholder="Select a brand"
        :formControl="true"
        ref="input"
        cssClass="input"
        :fireEmpty="true"
        @change="updateModels"
        isDropDown="true"
      />
    </div>

    <div class="form-group" v-if="models.length > 0">
      <label for="model">Model</label>
      <Combo
        :value="selectedModel"
        :hints="models"
        placeholder="Select a model"
        :formControl="true"
        ref="input"
        cssClass="input"
        :fireEmpty="true"
        isDropDown="true"
        @change="selectedModel = $event"
      />
    </div>

    <div class="MatcErrorLabel" v-if="errorMessage">
      {{ errorMessage }}
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from "./BaseDialog.vue";
import AIModelsUtil from "../../util/aimodels/AIModelsUtil.js";
import Combo from "common/Input.vue";

export default {
  name: "AddIntegrationDialog",
  components: {
    BaseDialog,
    Combo,
  },
  data() {
    return {
      dialogHeader: "Add Integration",
      labels: {
        confirm: "Add Integration",
        cancel: "Cancel",
        type: "primary",
      },
      selectedType: null,
      selectedBrand: null,
      selectedModel: null,
      modelTypes: [],
      brands: [],
      models: [],
      errorMessage: "",
    };
  },
  methods: {
    updateBrands(type) {
      if (type) {
        this.selectedType = type;
        const typeUtil = AIModelsUtil[this.selectedType];
        this.brands = (typeUtil?.brands || []).map((b) => {
          return {
            label: b.label,
            value: b.id,
          };
        });
        this.selectedBrand = null;
        this.models = [];
        this.selectedModel = null;
      }
    },
    updateModels(brandId) {
      if (brandId && this.selectedType) {
        this.selectedBrand = brandId;
        const typeUtil = AIModelsUtil[this.selectedType];
        const selectedBrand = this.brands.find((b) => b.value === brandId);
        if (selectedBrand) {
          this.models = (typeUtil.models || [])
            .filter((model) => model.type === brandId)
            .map((m) => {
              return { label: m.name, value: m.id };
            });
        } else {
          this.models = [];
        }
        this.selectedModel = null;
      }
    },
    confirmSelection() {
      if (!this.selectedModel) {
        this.errorMessage = "Please select a model.";
        return;
      }

      const selectedModelObj = this.models.find(
        (model) => model.value === this.selectedModel
      );

      if (selectedModelObj) {
        this.$emit("addIntegration", {
          brand: this.selectedBrand,
          id: selectedModelObj.value,
          name: selectedModelObj.label,
        });

        this.handleClose();
      } else {
        this.errorMessage = "Selected model not found.";
      }
    },
    cancel() {
      this.handleClose();
    },
    handleClose() {
      this.$refs.dialog.close();
      this.resetDialog();
    },
    resetDialog() {
      this.selectedType = null;
      this.selectedBrand = null;
      this.selectedModel = null;
      this.brands = [];
      this.models = [];
      this.errorMessage = "";
    },
    show() {
      this.modelTypes = Object.values(AIModelsUtil.aiTypesOptions).map(
        (model) => {
          return {
            label: model.label,
            value: model.id,
          };
        }
      );
      this.$refs.dialog.show();
    },
  },
};
</script>

<style scoped>



.input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.input:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.MatcErrorLabel {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
  font-weight: 400;
}

/* Additional styles for better overall appearance */
:deep(.BaseDialog) {
  max-width: 500px;
  margin: 0 auto;
}

:deep(.BaseDialog .dialog-header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 15px 20px;
}

:deep(.BaseDialog .dialog-body) {
  padding: 20px;
}

:deep(.BaseDialog .dialog-footer) {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 15px 20px;
}

:deep(.BaseDialog .btn) {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
}

:deep(.BaseDialog .btn-primary) {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

:deep(.BaseDialog .btn-primary:hover) {
  background-color: #0056b3;
  border-color: #0056b3;
}

:deep(.BaseDialog .btn-secondary) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

:deep(.BaseDialog .btn-secondary:hover) {
  background-color: #5a6268;
  border-color: #545b62;
}
</style>
