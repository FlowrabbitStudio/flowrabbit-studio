<template>
  <BaseDialog
    title="Import JavaScript Secrets"
    :labels="dialogLabels"
    @confirmAction="confirmAction"
    @cancelAction="closeDialog"
    ref="dialog"
  >
    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <!-- Upload File Section -->
    <div class="upload-file-section">
      <button @click="triggerFileUpload" class="upload-button">Choose JS File</button>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        accept=".js"
        class="hidden-file-input"
      />
      <div v-if="loading" class="loading-indicator">Processing file...</div>
    </div>

    <!-- Display File Name -->
    <div v-if="fileName" class="file-details">
      <h3>File: {{ fileName }}</h3>
    </div>

    <!-- Extracted Data Section -->
    <div v-if="models.length" class="extracted-data">
      <h4>Extracted Models</h4>

      <div class="table-container">
        <table class="extracted-table">
          <thead>
            <tr>
              <th>Model ID</th>
              <th>Label</th>
              <th>Brand</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="model in paginatedModels" :key="model.id">
              <td>{{ model.id }}</td>
              <td>{{ model.label }}</td>
              <td>{{ model.brand }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination-controls">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <!-- No Models Found -->
    <div v-else-if="fileName && !loading && !errorMessage" class="no-models-found">
      <p>No models found in the provided file.</p>
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from "../../../components/dialogs/BaseDialog.vue";

export default {
  components: {
    BaseDialog,
  },
  data() {
    return {
      fileName: "",
      fileContents: "",
      loading: false,
      errorMessage: "",
      models: [],
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    dialogLabels() {
      return {
        confirm: "Import",
        cancel: "Cancel",
      };
    },
    totalPages() {
      return Math.ceil(this.models.length / this.itemsPerPage);
    },
    paginatedModels() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.models.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    show() {
      this.resetDialog();
      this.$refs.dialog.show();
    },
    closeDialog() {
      this.resetDialog();
      this.$refs.dialog.close();
    },
    resetDialog() {
      this.fileName = "";
      this.fileContents = "";
      this.models = [];
      this.errorMessage = "";
      this.loading = false;
      this.currentPage = 1;
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (!this.validateFile(file)) {
          this.errorMessage = "Please upload a valid JavaScript (.js) file.";
          return;
        }

        this.errorMessage = "";
        this.fileName = file.name;
        this.loading = true;

        const reader = new FileReader();
        reader.onload = (e) => {
          this.fileContents = e.target.result;
          try {
            this.extractDataFromJSFile();
          } catch (err) {
            console.error("Error processing the JS file:", err);
            this.errorMessage = "Error parsing the JS file. Please ensure it's in the correct format.";
          } finally {
            this.loading = false;
          }
        };
        reader.onerror = () => {
          this.errorMessage = "Failed to read the file. Please try again.";
          this.loading = false;
        };
        reader.readAsText(file);
      }
    },
    validateFile(file) {
      const validExtension = "js";
      const fileExtension = file.name.split(".").pop().toLowerCase();
      return fileExtension === validExtension;
    },
    extractExportedVariableName(code) {
      // Match `export default variableName;`
      const exportRegex = /export\s+default\s+(\w+)\s*;?/;
      const match = code.match(exportRegex);
      if (match && match[1]) return match[1];
      return null;
    },
    createExecutableFunction(variableName, code) {
      // Remove 'export default variableName;' to isolate variable definition
      const exportRegex = /export\s+default\s+\w+\s*;?/;
      const sanitizedContent = code.replace(exportRegex, "");

      // Create a new function scope that returns the variable
      return new Function(`${sanitizedContent}; return ${variableName};`);
    },
    extractDataFromJSFile() {
      const variableName = this.extractExportedVariableName(this.fileContents);
      if (!variableName) {
        this.errorMessage = "Unable to find 'export default' statement.";
        return;
      }

      let exportedObject;
      try {
        const func = this.createExecutableFunction(variableName, this.fileContents);
        exportedObject = func();
      } catch (error) {
        console.error("Error evaluating JS file:", error);
        this.errorMessage = "Could not evaluate the JS file. Check if the variable is correctly defined.";
        return;
      }

      if (!exportedObject || typeof exportedObject !== "object") {
        this.errorMessage = "The exported data is not an object.";
        return;
      }

      const { models, brands } = exportedObject;
      if (!Array.isArray(models) || !Array.isArray(brands)) {
        this.errorMessage = "No valid model or brand data found in the file.";
        return;
      }

      // Use first brand if available, otherwise fallback
      const firstBrand = brands.length > 0 ? brands[0] : { label: "Unknown" };

      // Map extracted models into desired format
      this.models = models.map((model) => {
        return {
          id: model.id,
          label: model.name || model.label || "Unnamed Model",
          brand: firstBrand.label || "Unknown",
        };
      });

      if (this.models.length === 0) {
        this.errorMessage = ""; // Clear any previous errors if the format is correct but empty
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    confirmAction() {
      if (this.models.length === 0) {
        this.errorMessage = "No models to import.";
        return;
      }

      // Emit the extracted models for processing in the parent component
      this.$emit("importJSSecrets", this.models);
      this.closeDialog();
    },
  },
};
</script>

<style scoped>
.upload-file-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.upload-button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-button:hover {
  background-color: #0056b3;
}

.hidden-file-input {
  display: none;
}

.file-details {
  margin-top: 20px;
}

.loading-indicator {
  margin: 20px 0;
  font-weight: bold;
  color: #007bff;
  text-align: center;
}

.extracted-data {
  margin-top: 20px;
}

.table-container {
  max-height: 300px;
  overflow-y: auto;
}

.extracted-table {
  width: 100%;
  border-collapse: collapse;
}

.extracted-table th,
.extracted-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.pagination-controls button {
  margin: 0 5px;
}

.error-message {
  margin-top: 10px;
  color: red;
  text-align: center;
}

.no-models-found {
  margin-top: 20px;
  text-align: center;
  font-style: italic;
}
</style>
