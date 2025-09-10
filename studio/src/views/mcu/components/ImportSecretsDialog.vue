<template>
  <div>
    <BaseDialog
      title="Import Secrets"
      @confirmAction="confirmAction"
      :labels="dialogLabels"
      @cancelAction="currentStep > 0 ? previousStep : closeDialog"
      ref="dialog"
    >
      <!-- Step Indicators -->
      <div class="step-indicators">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            'step-indicator',
            { active: currentStep === index, clickable: index <= currentStep },
          ]"
          @click="goToStep(index)"
        >
          {{ index + 1 }}
        </div>
      </div>

      <div class="dialog-header">
        <h2>{{ steps[currentStep].label }}</h2>
        <p>{{ steps[currentStep].description }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <!-- Step 1: File Upload -->
      <transition name="fade">
        <div v-if="currentStep === 0" class="file-upload-step">
          <FileUploadStep
            @file-uploaded="handleFileUpload"
            :loading="loading"
            :errorMessage="errorMessage"
            @set-loading="setLoading"
            @error="handleError"
          />
        </div>
      </transition>

      <!-- Step 2: Column Mapping -->
      <transition name="fade">
        <div v-if="currentStep === 1">
          <ColumnMappingStep
            :headers="excelHeaders"
            :mappedHeaders="mappedHeaders"
            :availableFields="availableFields"
            @add-column="addCustomColumn"
            @update-mapped-headers="updateMappedHeaders"
          />
        </div>
      </transition>

      <!-- Step 3: Preview and Confirm -->
      <transition name="fade">
        <div v-if="currentStep === 2" class="preview-step">
          <PreviewStep
            :secrets="paginatedSecrets"
            :fields="allFields"
            :currentPage="currentPage"
            :totalPages="totalPages"
            @update-secret="updateSecret"
            @remove-secret="removeSecret"
            @next-page="nextPage"
            @previous-page="previousPage"
            :itemsPerPage="itemsPerPage"
            @set-items-per-page="setItemsPerPage"
          />
        </div>
      </transition>
    </BaseDialog>
  </div>
</template>

<script>
import BaseDialog from "../../../components/dialogs/BaseDialog.vue";
import ColumnMappingStep from "./ColumnMappingStep.vue";
import FileUploadStep from "./FileUploadStep.vue";
import PreviewStep from "./PreviewStep.vue";

export default {
  data() {
    return {
      importedSecrets: [],
      loading: false,
      lastRemovedSecret: null,
      currentStep: 0,
      errorMessage: "",
      steps: [
        {
          label: "Upload File",
          description: "Upload an Excel file to start the import process.",
        },
        {
          label: "Map Columns",
          description:
            "Map the columns from your Excel file to the expected fields.",
        },
        {
          label: "Review & Confirm",
          description:
            "Review, edit, and confirm the secrets before importing.",
        },
      ],
      excelHeaders: [],
      mappedHeaders: [],
      expectedFields: [
        "name",
        "label",
        "token",
        "brand",
        "pricing",
        "status",
        "url",
      ],
      customFields: [],
      currentPage: 1,
      itemsPerPage: 5,
      sheetData: null, // Added to store raw sheet data
      existingSecrets: [],
      adminService: null
    };
  },
  computed: {
    confirmAction() {
      return this.currentStep === this.steps.length - 1
        ? this.confirmImport
        : this.nextStep;
    },
    dialogLabels() {
      return {
        confirm: this.currentStep === this.steps.length - 1 ? "Import" : "Next",
        cancel: this.currentStep > 0 ? "Back" : "Cancel",
      };
    },
    allFields() {
      const fields = new Set([...this.expectedFields, ...this.customFields]);
      this.importedSecrets.forEach((secret) => {
        Object.keys(secret).forEach((key) => fields.add(key));
      });
      return Array.from(fields);
    },
    availableFields() {
      return [...this.expectedFields, ...this.customFields];
    },
    paginatedSecrets() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.importedSecrets.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.importedSecrets.length / this.itemsPerPage);
    },
  },
  components: {
    BaseDialog,
    FileUploadStep,
    ColumnMappingStep,
    PreviewStep,
  },
  methods: {
    setLoading(value) {
      this.loading = value;
    },
    handleError(message) {
      this.errorMessage = message;
    },
    show(data) {
      this.existingSecrets = data.secrets;
      this.adminService = data.adminService;
      this.$refs.dialog.show();
    },
    closeDialog() {
      this.resetDialog();
      this.$refs.dialog.close();
    },
    resetDialog() {
      this.importedSecrets = [];
      this.lastRemovedSecret = null;
      this.currentStep = 0;
      this.excelHeaders = [];
      this.mappedHeaders = [];
      this.errorMessage = "";
      this.customFields = [];
      this.currentPage = 1;
      this.sheetData = null;
    },
    updateMappedHeaders(newMappedHeaders) {
      this.mappedHeaders = newMappedHeaders;
      if (this.sheetData) {
        this.importedSecrets = this.mapSecrets(this.sheetData.data);
      }
    },
    async handleFileUpload(sheetData) {
      if (sheetData) {
        try {
          this.excelHeaders = sheetData.headers;
          this.mappedHeaders = this.excelHeaders.map((header) =>
            this.mapHeader(header)
          );
          this.sheetData = sheetData; // Store raw data for re-mapping
          this.importedSecrets = this.mapSecrets(sheetData.data);

          if (this.importedSecrets.length > 0) {
            this.nextStep();
          } else {
            this.errorMessage = "No data was loaded from the Excel file.";
          }
        } catch (error) {
          this.errorMessage =
            "Error processing the file. Please ensure it is a valid Excel file.";
        } finally {
          this.loading = false;
        }
      }
    },
    validateFile(file) {
      const validExtensions = ["xlsx", "xls"];
      const fileExtension = file.name.split(".").pop().toLowerCase();
      return validExtensions.includes(fileExtension);
    },
    mapHeader(header) {
      const lowerHeader = header.toLowerCase();
      return (
        this.expectedFields.find((field) => lowerHeader.includes(field)) || ""
      );
    },
    mapSecrets(sheetData) {
      const headers = this.mappedHeaders;
      return sheetData.map((row, rowIndex) => {
        const secret = { id: rowIndex };
        row.forEach((value, index) => {
          const header = headers[index];
          if (header) {
            this.$set(secret, header, value);
          }
        });
        this.validateSecret(secret);
        return secret;
      });
    },
    addCustomColumn(newColumnName) {
      if (newColumnName && !this.customFields.includes(newColumnName)) {
        this.customFields.push(newColumnName);
        this.availableFields.push(newColumnName); // Update available fields
      } else {
        this.errorMessage = "Please enter a unique column name.";
      }
    },
    validateSecret(secret) {
      if (!secret.errors) this.$set(secret, "errors", {});
      secret.errors = {};
      if (!secret.name) secret.errors.name = "Name is required";
    },
    hasErrors(secret) {
      return secret.errors && Object.keys(secret.errors).length > 0;
    },
    confirmImport() {
      if (!this.importedSecrets || this.importedSecrets.length === 0) {
        this.errorMessage = "No secrets to import.";
        return;
      }

      const invalidSecrets = this.importedSecrets.filter((secret) =>
        this.hasErrors(secret)
      );
      if (invalidSecrets.length > 0) {
        this.errorMessage = "Please fix the errors before importing.";
        return;
      }

      this.importedSecrets.forEach(async (importedSecret) => {
        const existingIndex = this.existingSecrets.findIndex(
          (secret) => secret.name === importedSecret.name
        );
        if (existingIndex !== -1) {
          this.$set(this.existingSecrets, existingIndex, importedSecret);
          await this.adminService.updateSecret(importedSecret);
        } else {
          this.existingSecrets.push(importedSecret);
          await this.adminService.createSecret(importedSecret);
        }
      });

      this.closeDialog();
    },
    removeSecret(index) {
      const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
      this.lastRemovedSecret = this.importedSecrets.splice(globalIndex, 1)[0];
    },
    updateSecret(updatedSecret) {
      const index = this.importedSecrets.findIndex(
        (secret) => secret.id === updatedSecret.id
      );
      if (index !== -1) {
        this.$set(this.importedSecrets, index, updatedSecret);
        this.validateSecret(updatedSecret);
      }
    },
    setItemsPerPage(newItemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.currentPage = 1; // Reset to first page
    },
    undoLastRemoval() {
      if (this.lastRemovedSecret) {
        this.importedSecrets.push(this.lastRemovedSecret);
        this.lastRemovedSecret = null;
      }
    },
    clearImport() {
      this.importedSecrets = [];
      this.lastRemovedSecret = null;
    },
    nextStep() {
      if (
        this.currentStep === 1 &&
        (!this.importedSecrets || this.importedSecrets.length === 0)
      ) {
        this.errorMessage =
          "Please map the columns and load the data before proceeding.";
        return;
      }

      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      } else {
        this.confirmImport();
      }
    },
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    goToStep(step) {
      if (step <= this.currentStep) {
        this.currentStep = step;
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
  },
};
</script>

<style scoped>
@import "../../../style/mcu/import-secrets.scss";
</style>
