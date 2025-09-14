<template>
  <div class="MatcMCUPanel">
    <Panel>
      <div class="secrets-container">
        <!-- Heading and Actions -->
        <div class="MatcCardHeader align-items-center">
          <h1 class="heading">Secrets</h1>

          <div class="MatcFlex MatcEnd search-bar-container MatcFelxGapM">
            <SearchBar v-model="searchFilter" />
            <button class="MatcButton MatcButtonPrimary" @click="createSecret" :disabled="isLoading">Create
              Secret</button>
          </div>

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
            <DataTable :data="filteredSecrets" :size="10" :isSelectable="false" :columns="columns" />
          </div>
        </div>


        <!-- Dialogs -->
        <SecretDialog ref="secretDialog" :brands="availableBrands" />
        <SecretDetails ref="secretDetailsDialog" />
        <BaseDialog title="Delete Secret" ref="deleteSecretConfirm" @confirmAction="() => deleteSecret(secretToDelete)">
          Are you sure you want to delete this secret?
        </BaseDialog>
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
    'BaseDialog': BaseDialog
  },
  methods: {


    formatDate(value) {
      try {
        const date = new Date(value);
        return date.toLocaleString();
      } catch (e) {
        console.error("Error formatting date:", e);
        return value;
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
      formatTokenForDisplay(token) {
      if (!token) return "";
      const maxLength = 10;
      return token.length > maxLength ? token.slice(0, maxLength) + "..." : token;
    },
    async onDeleteSecret(secret, event) {
      if (event) event.preventDefault();
      this.secretToDelete = secret;
      this.$refs.deleteSecretConfirm.show();
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
      if (this.isLoading) return;
      this.$refs.secretDialog.show(secret, () => this.loadSecrets());
      
    },
    async createSecret() {
      if (this.isLoading) return;
      this.$refs.secretDialog.show({}, () => this.loadSecrets());
    },
    async loadSecrets() {
      this.isLoading = true;
      try {
        const dbSecrets = await this.fetchSecretsFromServer();
        this.secrets = dbSecrets; 
        this.isLoading = false;
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
        console.debug("Fetched secrets:", dbsecrets);
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
    }
   
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
