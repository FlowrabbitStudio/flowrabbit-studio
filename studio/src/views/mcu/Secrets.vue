<template>
  <div class="MatcMCUPanel">
    <Panel>
      <div class="secrets-container">
        <!-- Heading and Actions -->
        <div class="MatcCardHeader align-items-center">
          <h1 class="heading">Secrets</h1>

          <div class="MatcFlex MatcEnd search-bar-container">
            <SearchBar v-model="searchFilter" />
          </div>
          

          <div class="MatcFlex MatcBetween actions MatcMarginTop">
            <div class="MatcFlex filters">
              <div class="filter-dropdown">
                <select id="brandFilter" v-model="selectedBrand">
                  <option value="">All Brands</option>
                  <option v-for="brand in availableBrands" :key="brand.value" :value="brand.value">
                    {{ brand.label }}
                  </option>
                </select>
              </div>
              <div class="filter-dropdown">
                <select id="typeFilter" v-model="selectedType">
                  <option value="">All Types</option>
                  <option v-for="type in availableTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="MatcFlex buttons actions">
              <button class="MatcButton MatcButtonPrimary" @click="createSecret" :disabled="isLoading">Create Secret</button>
              <button class="MatcButton MatcButtonSecondary" @click="exportToExcel" :disabled="isLoading">Export to Excel</button>
              <button class="MatcButton MatcButtonSecondary" @click="showImportJSDialog" :disabled="isLoading">Import JS Secrets</button>
            </div>
          </div>
        </div>

        <!-- Brand-level Token Update Controls -->
        <div class="brand-token-update" v-if="selectedBrand">
          <label for="brandTokenInput">Set token for all models in {{ selectedBrand }}:</label>
          <input
            id="brandTokenInput"
            v-model="brandToken"
            placeholder="Enter new token"
            :disabled="isLoading"
          />
          <button
            class="MatcButton MatcButtonSecondary"
            @click="updateAllTokensForBrand"
            :disabled="!canUpdateBrandTokens || isLoading"
          >
            Update Brand Tokens
          </button>
        </div>

        <!-- Bulk Actions for Selected Secrets -->
        <div v-if="selectedSecrets.length > 0" class="bulk-actions">
          <button
            class="MatcButton MatcButtonDanger"
            @click="deleteSelected"
            :disabled="isLoading"
          >
            Delete Selected
          </button>
          <input
            v-model="selectedSecretsToken"
            placeholder="Token for selected secrets"
            :disabled="isLoading"
          />
          <button
            class="MatcButton MatcButtonSecondary"
            @click="updateTokenForSelected"
            :disabled="!canUpdateSelectedTokens || isLoading"
          >
            Update Token
          </button>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="loading-indicator">
          <p>Loading, please wait...</p>
        </div>

        <!-- Data Table -->
        <div class="MatcCardContent" v-else>
          <div v-if="filteredSecrets.length === 0">
            <p>No secrets found with the current filters.</p>
          </div>
          <div v-else>
            <DataTable
              :data="filteredSecrets"
              :size="10"
              :isSelectable="true"
              :columns="columns"
              @update:selectedRows="updateSelectedSecrets"
            />
          </div>
        </div>

        {{selectedSecret}}

        <!-- Secret Details Form -->
        <div class="secret-details-form" v-if="selectedSecret">
          <h2>Edit Secret</h2>
          <div v-for="(val, key) in selectedSecret" :key="key" class="form-group">
            <label :for="`secret-${key}`">{{ formatLabel(key) }}:</label>
            <!-- System fields read-only -->
            <template v-if="isSystemField(key)">
              <span>{{ formatSystemField(key, val) }}</span>
            </template>
          

            <!-- For pricingQuantity, ensure integer -->
            <template v-else-if="key === 'pricingQuantity'">
              <input
                :id="`secret-${key}`"
                v-model.number="selectedSecret[key]"
                :disabled="isLoading"
                type="number"
                placeholder="Enter pricing quantity (integer)"
              />
            </template>

            <!-- Status field -->
            <template v-else-if="key === 'status'">
              <select :id="`secret-${key}`" v-model="selectedSecret[key]" :disabled="isLoading">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </template>

            <!-- Domain field -->
            <template v-else-if="key === 'domain'">
              <!-- <input v-model="selectedSecret[key]" :disabled="isLoading" /> -->
              <Combo 
                  :value="selectedSecret[key]" 
                  @change="setDomain" 
                  :options="domainHints" 
                  :fireOnBlur="true"
                  :showHintLabel="true" 
                  cssClass="form-control MatcDropDownButtonWidth" 
                  :isDropDown="true" 
                  ref="newDomainCombo" 
                  placeholder="Service" 
              />
            </template>

            <!-- Value (token) field -->
            <template v-else-if="key === 'value'">
              <div class="token-edit-field">
                <input
                  :id="`secret-${key}`"
                  :type="showFullToken ? 'text' : 'password'"
                  v-model="selectedSecret[key]"
                  placeholder="Token"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="MatcButton MatcButtonSecondary show-hide-token"
                  @click="toggleShowFullToken"
                >
                  {{ showFullToken ? 'Hide' : 'Show' }}
                </button>
                <span class="token-length">{{ selectedSecret.value.length }} chars</span>
              </div>
            </template>

            <!-- Name field shown read-only if needed -->
            <template v-else-if="key === 'name'">
              <span>{{ selectedSecret[key] }}</span>
            </template>

            <!-- Other editable non-system fields -->
            <template v-else>
              <input
                :id="`secret-${key}`"
                v-model="selectedSecret[key]"
                :disabled="isLoading"
              />
            </template>
          </div>
          <!-- Save Button -->
          <button class="MatcButton MatcButtonPrimary" @click="updateSecret" :disabled="isLoading">
            Save Changes
          </button>
        </div>

        <!-- Dialogs -->
        <SecretDialog ref="secretDialog" :brands="availableBrands" />
        <SecretDetails ref="secretDetailsDialog" />
        <BaseDialog title="Delete Secret" ref="deleteSecretConfirm" @confirmAction="() => deleteSecret(secretToDelete)">
          Are you sure you want to delete this secret?
        </BaseDialog>
        <ImportJSDialog
          ref="importJSDialog"
          @importJSSecrets="handleImportJSSecrets"
        />
      </div>
    </Panel>
  </div>
</template>

<script>
import SecretDialog from "./SecretDialog.vue";
import SecretDetails from "./SecretDetails.vue";
import AdminService from "./AdminService";
import Services from "services/Services";
import Panel from "./Panel.vue";
import DataTable from "./DataTable.vue";
import SearchBar from "./SearchBar.vue";
import BaseDialog from "../../components/dialogs/BaseDialog.vue";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import ImportJSDialog from "./components/ImportSecretsJSDialog.vue";
import Input from 'page/DropDownButton'
import * as SecretUtil from '../../util/SecretUtil'

export default {
  data() {
    return {
      secrets: [],
      searchFilter: "",
      availableBrands: [],
      secretToDelete: {},
      groupedBrands: [],
      selectedBrand: "",
      selectedType: "",
      availableTypes: [],
      selectedSecret: null,
      selectedSecrets: [],
      selectedSecretsToken: "",
      brandToken: "",
      showFullToken: false,
      isLoading: false,
      domainHints: SecretUtil.getDomains(),
      columns: [
        {
          id: "label",
          key: "label",
          label: "Label",
          width: "15%",
        },
        {
          id: "brand",
          key: "brand",
          label: "Brand",
          width: "15%",
        },
        {
          id: "value",
          key: "value",
          label: "Token",
          width: "25%",
          value: (row) => this.formatTokenForDisplay(row.value),
          renderCell: (h, { row }) => {
            const shortToken = this.formatTokenForDisplay(row.value);
            const fullToken = row.value || "";
            return h("div", { class: "token-cell" }, [
              h("span", {
                class: "token-truncated",
                attrs: { title: fullToken },
              }, shortToken),
              h("button", {
                class: "copy-token-button",
                attrs: { title: "Copy full token" },
                on: {
                  click: (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(fullToken);
                  },
                },
              }, "Copy")
            ]);
          },
        },
        {
          id: "pricingQuantity",
          key: "pricingQuantity",
          label: "Pricing (Quantity)",
          value: (row) => this.getPricingQuantity(row),
          width: "20%",
        },
        {
          id: "status",
          key: "status",
          label: "Status",
          value: (row) => (row.status ? row.status : "Active"),
          width: "10%",
          class: (row) =>
            row.status === "Active" || !row.status
              ? "status-active"
              : row.status === "new"
              ? "status-new"
              : "status-inactive",
        },
        {
          id: "domain",
          key: "domain",
          label: "Domain",
          width: "15%",
        },
        {
          id: "action-delete",
          key: "action",
          label: "",
          width: "5%",
          value: () => "Delete",
          class: "action",
          click: (row, e) => this.onDeleteSecret(row, e),
        },
        {
          id: "action-edit",
          key: "action",
          label: "",
          width: "5%",
          value: () => "Edit",
          class: "action",
          click: (row, e) => this.onEditSecret(row, e),
        }
      ],
    };
  },
  computed: {
    filteredSecrets() {
      const filter = this.searchFilter.toLowerCase();
      return this.secrets.filter((secret) => {
        const matchesSearch =
          (secret.name?.toLowerCase().includes(filter) ||
           secret.label?.toLowerCase().includes(filter) ||
           secret.brand?.toLowerCase().includes(filter) ||
           secret.type?.toLowerCase().includes(filter) ||
           secret.value?.toLowerCase().includes(filter));
        const matchesBrand = !this.selectedBrand || secret.brand === this.selectedBrand;
        const matchesType = !this.selectedType || secret.type === this.selectedType;
        return matchesSearch && matchesBrand && matchesType;
      });
    },
    canUpdateBrandTokens() {
      return this.selectedBrand && this.brandToken && this.brandToken.trim().length > 0;
    },
    canUpdateSelectedTokens() {
      return this.selectedSecrets.length > 0 && this.selectedSecretsToken.trim().length > 0;
    },
  },
  components: {
    'SecretDialog': SecretDialog,
    'SecretDetails': SecretDetails,
    'Panel': Panel,
    'DataTable': DataTable,
    'SearchBar': SearchBar,
    'BaseDialog': BaseDialog,
    'ImportJSDialog': ImportJSDialog,
    'Combo': Input
  },
  methods: {

    setDomain (d) {
      if (this.selectedSecret) {
        this.selectedSecret.domain = d;
        this.$forceUpdate()
      }
    },
    
    async exportToExcel() {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Secrets");

        worksheet.columns = [
          { header: "Model ID", key: "id", width: 30 },
          { header: "Label", key: "label", width: 30 },
          { header: "Brand", key: "brand", width: 20 },
          { header: "Pricing", key: "pricing", width: 15 },
          { header: "PricingInCents", key: "pricingQuantity", width: 15 },
          { header: "URL", key: "url", width: 30 },
          { header: "Status", key: "status", width: 15 },
          { header: "Token", key: "value", width: 30 },
          { header: "Created At", key: "createdAt", width: 25 },
          { header: "Updated At", key: "updatedAt", width: 25 },
        ];

        this.secrets.forEach((secret) => {
          worksheet.addRow({
            id: secret.name,
            label: secret.label,
            brand: secret.brand,
            pricing: secret.pricing,
            pricingQuantity: secret.pricingQuantity,
            url: secret.url,
            status: secret.status,
            value: secret.value,
            createdAt: secret.createdAt ? this.formatDate(secret.createdAt) : "",
            updatedAt: secret.updatedAt ? this.formatDate(secret.updatedAt) : "",
          });
        });

        worksheet.eachRow({ includeEmpty: false }, (row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "secrets.xlsx");
        this.$root.$emit("Success", "Exported to Excel successfully.");
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        this.$root.$emit("Error", "Failed to export to Excel.");
      } finally {
        this.isLoading = false;
      }
    },
    formatTokenForDisplay(token) {
      if (!token) return "";
      const maxLength = 10;
      return token.length > maxLength ? token.slice(0, maxLength) + "..." : token;
    },
    copyToClipboard(text) {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        this.$root.$emit("Success", "Token copied to clipboard!");
      }).catch((err) => {
        console.error("Could not copy token:", err);
        this.$root.$emit("Error", "Failed to copy token.");
      });
    },
    toggleShowFullToken() {
      this.showFullToken = !this.showFullToken;
    },
    isSystemField(key) {
      // System fields that should be read-only (just show them)
      const systemFields = ["_id", "id", "createdAt", "updatedAt", "created", "updated"];
      return systemFields.includes(key);
    },
    formatSystemField(key, val) {
      if ((key === "createdAt" || key === "updatedAt" || key === "created" || key === "updated") && val) {
        return this.formatDate(val);
      }
      return val;
    },
    formatDate(value) {
      try {
        const date = new Date(value);
        return date.toLocaleString();
      } catch (e) {
        console.error("Error formatting date:", e);
        return value;
      }
    },
    updateSelectedSecrets(selected) {
      this.selectedSecrets = selected;
    },
    async deleteSelected() {
      if (this.selectedSecrets.length === 0) return;
      this.isLoading = true;
      try {
        await Promise.all(this.selectedSecrets.map((secret) => this.deleteSecretInternal(secret)));
        this.selectedSecrets = [];
        this.$root.$emit("Success", "Selected secrets deleted.");
        await this.loadSecrets();
      } catch (error) {
        console.error("Error deleting selected secrets:", error);
        this.$root.$emit("Error", "Some secrets could not be deleted.");
      } finally {
        this.isLoading = false;
      }
    },
    async deleteSecretInternal(secret) {
      if (!secret.id) return;
      await this.adminService.deleteSecret(secret.id);
    },
    async updateTokenForSelected() {
      if (!this.canUpdateSelectedTokens) return;
      this.isLoading = true;
      try {
        await Promise.all(this.selectedSecrets.map(async (secret) => {
          secret.value = this.selectedSecretsToken;
          await this.adminService.updateSecret(this.prepareSecretForSave(secret));
        }));
        this.$root.$emit("Success", `Tokens updated for ${this.selectedSecrets.length} secret(s).`);
        this.selectedSecrets = [];
        this.selectedSecretsToken = "";
        await this.loadSecrets();
      } catch (error) {
        console.error("Error updating tokens for selected secrets:", error);
        this.$root.$emit("Error", "Failed to update tokens for selected secrets.");
      } finally {
        this.isLoading = false;
      }
    },
    async updateAllTokensForBrand() {
      if (!this.canUpdateBrandTokens) return;
      this.isLoading = true;
      try {
        const secretsToUpdate = this.secrets.filter((secret) => secret.brand === this.selectedBrand);
        for (const secret of secretsToUpdate) {
          secret.value = this.brandToken;
          await this.adminService.updateSecret(this.prepareSecretForSave(secret));
        }
        this.brandToken = "";
        this.$root.$emit("Success", `All secrets for ${this.selectedBrand} updated successfully.`);
        await this.loadSecrets();
      } catch (error) {
        console.error("Error updating brand tokens:", error);
        this.$root.$emit("Error", "Failed to update tokens for the selected brand.");
      } finally {
        this.isLoading = false;
      }
    },
    getPricingQuantity(row) {
      const price = row.pricingQuantity != null ? `${row.pricingQuantity}¢` : "-";
      const type = row.type;
      switch (type) {
        case "llms": return `${price} / 1M tokens`;
        case "image": return `${price} / image`;
        case "speechToText": return `${price} / 1 min`;
        case "textToSpeech": return `${price} / ?`;
        case "video": return `${price} / video`;
        default: return price;
      }
    },
    formatLabel(key) {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    },
    async onDeleteSecret(secret, event) {
      if (event) event.preventDefault();
      this.secretToDelete = secret;
      this.$refs.deleteSecretConfirm.show();
    },
    onRowClick(row) {
      this.selectedSecret = { ...row };
    },
    async deleteSecret(secret) {
      if (!secret.id) return;
      this.isLoading = true;
      try {
        await this.adminService.deleteSecret(secret.id);
        await this.loadSecrets();
        this.secretToDelete = {};
        this.$refs.deleteSecretConfirm.close();
        this.$root.$emit("Success", "Secret deleted successfully.");
      } catch (error) {
        console.error("Error deleting secret:", error);
        this.$root.$emit("Error", "Failed to delete secret.");
      } finally {
        this.isLoading = false;
      }
    },
    async onEditSecret(secret) {
      this.selectedSecret = { ...secret };
      if (!this.selectedSecret.domain) {
        this.selectedSecret.domain = "";
      }
      if (this.selectedSecret.token) {
        delete this.selectedSecret.token
      }
      if (this.selectedSecret.errors) {
        delete this.selectedSecret.errors
      }
    },
    async createSecret() {
      if (this.isLoading) return;
      this.$refs.secretDialog.show({}, () => this.loadSecrets());
    },
    async loadSecrets() {
      this.isLoading = true;
      try {
        const dbSecrets = await this.fetchSecretsFromServer();
        this.secrets = dbSecrets; // Just show what the server returns, no merging
        this.extractAvailableFilters();
        this.groupSecretsByBrand();
      } catch (error) {
        console.error("Error loading secrets:", error);
        this.$root.$emit("Error", "Failed to load secrets.");
      } finally {
        this.isLoading = false;
      }
    },
    async fetchSecretsFromServer() {
      try {
        const dbsecrets = await this.adminService.getAllSecrets();
        dbsecrets.forEach((s) => {
          if (s.pricingQuantity && typeof s.pricingQuantity !== "number") {
            const parsed = parseInt(s.pricingQuantity, 10);
            s.pricingQuantity = isNaN(parsed) ? null : parsed;
          }
          if (s.pricing && typeof s.pricing !== "number") {
            const parsed = parseInt(s.pricing, 10);
            s.pricing = isNaN(parsed) ? null : parsed;
          }
        });
        return dbsecrets;
      } catch (error) {
        console.error("Error fetching secrets:", error);
        this.$root.$emit("Error", "Failed to fetch secrets from the server.");
        return [];
      }
    },
    extractAvailableFilters() {
      const brands = [...new Set(this.secrets.map((secret) => secret.brand).filter(Boolean))];
      this.availableBrands = brands.map((b) => ({ value: b, label: b }));

      const types = [...new Set(this.secrets.map((secret) => secret.type).filter(Boolean))];
      this.availableTypes = types.map((t) => ({ value: t, label: t }));
    },
    groupSecretsByBrand() {
      const brands = {};
      this.secrets.forEach((secret) => {
        if (!brands[secret.brand]) {
          brands[secret.brand] = [];
        }
        let valueGroup = brands[secret.brand].find((group) => group.value === secret.value);
        if (!valueGroup) {
          valueGroup = { value: secret.value, secrets: [] };
          brands[secret.brand].push(valueGroup);
        }
        valueGroup.secrets.push(secret);
      });

      this.groupedBrands = Object.keys(brands).map((brand) => ({
        name: brand,
        values: brands[brand].map((group) => ({
          value: group.value,
          secrets: group.secrets,
          newValue: "",
        })),
      }));
    },
    prepareSecretForSave(secret) {
      // Ensure pricingQuantity is integer before saving
      if (secret.pricingQuantity != null) {
        const parsed = parseInt(secret.pricingQuantity, 10);
        secret.pricingQuantity = isNaN(parsed) ? 0 : parsed;
      }
      return secret;
    },
    async updateSecret() {
      if (this.isLoading) return;
      if (!this.selectedSecret.name && !this.selectedSecret.id) {
        this.$root.$emit("Error", "Secret must have a name before saving.");
        return;
      }

      this.isLoading = true;
      try {
        const secretToSave = this.prepareSecretForSave({ ...this.selectedSecret });

        if (!secretToSave.id) {
          await this.adminService.createSecret(secretToSave);
          this.$root.$emit("Success", "Secret created successfully.");
        } else {
          await this.adminService.updateSecret(secretToSave);
          this.$root.$emit("Success", "Secret updated successfully.");
        }

        if (!secretToSave.value) {
          this.$root.$emit("Info", "Warning: Token (value) is empty.");
        }

        await this.loadSecrets();
        this.selectedSecret = null;
        this.showFullToken = false;
      } catch (error) {
        console.error("Error updating secret:", error);
        this.$root.$emit("Error", "Failed to update secret.");
      } finally {
        this.isLoading = false;
      }
    },
    showImportJSDialog() {
      if (this.isLoading) return;
      this.$refs.importJSDialog.show();
    },
    async handleImportJSSecrets(importedSecrets) {
      await this.importSecrets(importedSecrets);
    },
    async importSecrets(importedSecrets) {
      if (!Array.isArray(importedSecrets)) {
        this.$root.$emit("Error", "Imported data is not an array of secrets.");
        return;
      }

      const existingSecretNames = new Set(this.secrets.map((s) => s.name));
      const newSecrets = importedSecrets.filter((secret) => secret.name && !existingSecretNames.has(secret.name));

      if (newSecrets.length === 0) {
        this.$root.$emit("Info", "No new secrets to import.");
        return;
      }

      this.isLoading = true;
      try {
        for (const secret of newSecrets) {
          // Ensure pricingQuantity is integer
          if (secret.pricingQuantity) {
            const parsed = parseInt(secret.pricingQuantity, 10);
            secret.pricingQuantity = isNaN(parsed) ? 0 : parsed;
          }
          await this.adminService.createSecret(secret);
        }
        this.$root.$emit("Success", `${newSecrets.length} new secret(s) imported successfully.`);
        await this.loadSecrets();
      } catch (error) {
        console.error("Error importing secrets:", error);
        this.$root.$emit("Error", "Failed to import some secrets.");
      } finally {
        this.isLoading = false;
      }
    },
  },
  async mounted() {
    this.adminService = new AdminService();
    const token = Services.getUserService().getToken();
    if (!token) {
      console.warn("No user token found, some actions may fail.");
    }
    this.adminService.setToken(token);
    await this.loadSecrets();
  },
};
</script>

<style scoped>

.MatcDropDownButtonWidth {
  min-width: auto;
}
.status-active {
  color: green !important;
}
.status-inactive {
  color: red !important;
}
.status-new {
  color: blue !important;
}

/* Container Styles */
.secrets-container {
  padding: 20px;
}

/* Heading and Actions */
.heading {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
}

.filters {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.search-bar-container {
  min-width: 250px;
  margin-right: 20px;
}

.filter-dropdown {
  margin-right: 20px;
}

.filter-dropdown label {
  margin-right: 5px;
  font-weight: bold;
}

.filter-dropdown select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.buttons .MatcButton {
  margin-right: 20px;
}

/* Brand/Bulk Actions */
.brand-token-update {
  display: flex;
  align-items: center;
  margin: 20px 0;
  gap: 10px;
}

.brand-token-update label {
  font-weight: bold;
}

.bulk-actions {
  display: flex;
  gap: 10px;
  margin-left: 20px;
  margin-top: 20px;
}

/* Loading Indicator */
.loading-indicator {
  margin-top: 20px;
  text-align: center;
  font-style: italic;
  color: #555;
}

/* Secret Details Form */
.secret-details-form {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

.secret-details-form h2 {
  margin-bottom: 20px;
}

.secret-details-form .form-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.secret-details-form .form-group label {
  flex: 0 0 150px;
  font-weight: bold;
  margin-right: 10px;
}

.secret-details-form .form-group input,
.secret-details-form .form-group select {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.token-edit-field {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.show-hide-token {
  padding: 5px 10px;
  font-size: 12px;
}

.token-length {
  font-size: 12px;
  color: #888;
}

/* Table Token Cell */
.token-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.copy-token-button {
  background-color: #eeeeee;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.copy-token-button:hover {
  background-color: #cccccc;
}

.token-truncated {
  display: inline-block;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* DataTable Styles */
.MatcCardContent {
  margin-top: 20px;
}
</style>
