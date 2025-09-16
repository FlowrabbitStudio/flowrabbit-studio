<template>
  <div class="MatcMCUPanel">

    <Panel :transparent="true">
        <div class="MCUTopBar ">
          <SearchBar v-model="searchFilter" />

            <!-- <button class="MatcButton MatcButtonPrimary" @click="createSecret" :disabled="isLoading">
              Create Secret
            </button> -->

            <button class="MatcButton MatcButtonPrimary" @click="createDefaultSecrets" :disabled="isLoading">
              Setup Secrets
            </button>


            <button class="MatcButton MatcButtonPrimary" @click="onTokenByBrand" :disabled="isLoading">
              Set Token By Brand
            </button>


            <button class="MatcButton MatcButtonRed" @click="onDeleteAllSecrets" :disabled="isLoading">
              Delete All
            </button>
        </div>
    </Panel>



    <Panel>
      <div class="secrets-container">
        <!-- Heading and Actions -->
        <div class="MatcCardHeader align-items-center">
          <h1 class="heading">Secrets</h1>
        </div>
     

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="loading-indicator">
          <p>Loading, please wait...</p>
        </div>

        <!-- Data Table -->
        <div class="MatcPaddingTop" v-else>
          <div v-if="filteredSecrets.length === 0">
            <p>No secrets found with the current filters.</p>
          </div>
          <div v-else>
            <DataTable :data="filteredSecrets" :size="50" :isSelectable="false" :columns="columns" />
          </div>
        </div>


        <!-- Dialogs -->
        <SecretDialog ref="secretDialog" />

        <BaseDialog title="Delete Secret" ref="deleteSecretConfirm" @confirmAction="() => deleteSecret(secretToDelete)">
          Are you sure you want to delete this secret?
        </BaseDialog>

        <BaseDialog title="Delete ALL Secrets" ref="deleteAllSecretsConfirm" @confirmAction="() => deleteAllSecrets">
          Are you sure you want to delete ALL secrets?
        </BaseDialog>


        <BaseDialog title="Set Token By Brand" ref="setTokenByBrandConfirm" @confirmAction="() => updateSecretByBrand()">
          <div class="MatcFlex MatcGapXL">
            <div class="form-group MatcFlexGrow">
              <label>Brand</label>XX {{brandToUpdate}}
              <select class="form-control" v-model="brandToUpdate">
                <option v-for="b in availableBrands" :key="b.id" :value="b.id">{{ b.label }}</option>
              </select>
            </div>
            <div class="form-group MatcFlexGrow">
              <label>Token</label>
              <input type="text" class="form-control" v-model="tokenToUpdate" />
            </div>
          </div>
        </BaseDialog>
      </div>
      </Panel>
  </div>
</template>

<script>
import SecretDialog from "./SecretDialog.vue";
import AdminService from "./AdminService";
import Services from "services/Services";
import Panel from "./Panel.vue";
import DataTable from "./DataTable.vue";
import SearchBar from "./SearchBar.vue";
import BaseDialog from "../../components/dialogs/BaseDialog.vue";

import * as SecretUtil from '../../util/SecretUtil'
import * as CreditUtil from '../../util/CreditUtil'

export default {
  data() {
    return {
      secrets: [],
      searchFilter: "",
      availableBrands: SecretUtil.getAllBrands(),
      showFullToken: false,
      isLoading: false,
      brandToUpdate: "",
      tokenToUpdate: "",
      columns: [
        {
          id: "label",
          key: "label",
          label: "Label",
          width: "25%",
        },
        {
          id: "brand",
          key: "brand",
          label: "Brand",
          width: "15%",
        },
    
        {
          id: "pricingQuantity",
          key: "pricingQuantity",
          label: "Pricing",
          value: (row) => this.getPricingPerMillion(row),
          width: "10%",
        },
        {
          id: "token",
          key: "value",
          label: "Token",
          value: (row) => (row.value ? "✓" : ""),
          width: "10%",
          class: (row) => (row.value ? "green" : "status-inactive"),
        },
        {
          id: "status",
          key: "status",
          label: "Status",
          value: (row) => (row.status ? row.status : "Active"),
          width: "10%",
          class: (row) =>
            row.status === "Active" || !row.status
              ? "green"
              : row.status === "new"
                ? "red"
                : "red",
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
        return matchesSearch;
      });
    }
  },
  components: {
    'SecretDialog': SecretDialog,
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
   
    getPricingPerMillion (row) {
      const pricePerMillion = CreditUtil.pricePerUnitToPricePerMillion(row.pricing || 0);
      const pricePerMillionQuantity = CreditUtil.pricePerUnitToPricePerMillion(row.pricingQuantity || 0);

      return `${pricePerMillion.toFixed(2)}€ / ${pricePerMillionQuantity.toFixed(2)}€`;
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


    async onTokenByBrand(event) {
      console.log("Setting token by brand...");
      if (event) event.preventDefault();
      this.brandToUpdate = "";
      this.tokenToUpdate = "";
      this.$refs.setTokenByBrandConfirm.show();
    },
    async updateSecretByBrand() {
      if (!this.brandToUpdate || !this.tokenToUpdate) return;
      console.log("Updating secrets for brand:", this.brandToUpdate, this.tokenToUpdate);
      this.isLoading = true;
      try {
        const secretsToUpdate = this.secrets.filter(s => s.brand === this.brandToUpdate);
        for (const secret of secretsToUpdate) {
          secret.value = this.tokenToUpdate;
          await this.adminService.updateSecret(secret);
        }
        await this.loadSecrets();
        this.$root.$emit("Success", `Updated ${secretsToUpdate.length} secrets for brand ${this.brandToUpdate}.`);
      } catch (error) {
        console.error("Error updating secrets by brand:", error);
        this.$root.$emit("Error", "Failed to update secrets by brand.");
      } finally {
        this.isLoading = false;
      }
      this.brandToUpdate = "";
      this.tokenToUpdate = "";

      this.$refs.setTokenByBrandConfirm.close();
    },
    async onDeleteSecret(secret, event) {
      if (event) event.preventDefault();
      this.secretToDelete = secret;
      this.$refs.deleteSecretConfirm.show();
    },
    async onDeleteAllSecrets(event) {
      if (event) event.preventDefault();
      this.$refs.deleteAllSecretsConfirm.show();
    },
    async deleteAllSecrets() {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        for (const secret of this.secrets) {
          await this.adminService.deleteSecret(secret.id);
        }
        await this.loadSecrets();
        this.$root.$emit("Success", "All secrets deleted successfully.");
      } catch (error) {
        console.error("Error deleting all secrets:", error);
        this.$root.$emit("Error", "Failed to delete all secrets.");
      } finally {
        this.isLoading = false;
      }
    },
     copyToClipboard(text) {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        this.$root.$emit("Success", "Token copied to clipboard.");
      }).catch(err => {
        console.error('Could not copy text: ', err);
        this.$root.$emit("Error", "Failed to copy token to clipboard.");
      });
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
      this.$refs.secretDialog.show(null, () => this.loadSecrets());
    },
    async createDefaultSecrets() {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        const defaultSecrets = SecretUtil.getDefaultSecrets();
        let counted = 0;
        for (const secret of defaultSecrets) {
          const existing = this.secrets.find(s => s.name === secret.name && s.brand === secret.brand);
          if (!existing) {
            await this.adminService.createSecret(secret);
            counted++;
          }
        }
        await this.loadSecrets();
        this.$root.$emit("Success", `${counted} default secrets created successfully.`);
      } catch (error) {
        console.error("Error creating default secrets:", error);
        this.$root.$emit("Error", "Failed to create default secrets.");
      } finally {
        this.isLoading = false;
      }
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
    console.debug("Available secrets:", SecretUtil.getAllBrands());
  },
};
</script>
