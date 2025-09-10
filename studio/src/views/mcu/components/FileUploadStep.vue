<template>
  <div class="file-upload-step">
    <input
      type="file"
      @change="handleFileUpload"
      :disabled="loading"
      accept=".xlsx, .xls"
      class="file-input"
    />
    <div v-if="loading" class="loading-indicator">Processing file...</div>
  </div>
</template>

<script>
import ExcelJS from "exceljs";

export default {
  props: {
    loading: Boolean,
    errorMessage: String,
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.$emit("set-loading", true);
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(file);
          const worksheet = workbook.getWorksheet(1); // Get the first sheet
          const sheetData = [];
          worksheet.eachRow((row) => {
            sheetData.push(row.values.slice(1)); // Remove null first index
          });
          const headers = sheetData[0];
          const data = sheetData.slice(1);
          this.$emit("file-uploaded", { headers, data });
        } catch (error) {
          this.$emit("error", "Error processing the file.");
        } finally {
          this.$emit("set-loading", false);
        }
      }
    },
  },
};
</script>
