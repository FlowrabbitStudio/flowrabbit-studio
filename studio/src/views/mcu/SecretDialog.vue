<template>
  <BaseDialog title="Edit Secret" subtitle="" :labels="labels" ref="dialog" @confirmAction="saveSecret">
    <div class="MatcDialog MatcSurveyDialog MatcPadding">
      <div class="MatcFlex MatcGapXL">


        <div class="form-group MatcFlexGrow">
          <label>Type</label>
          <select class="form-control" v-model="secret.type" @change="onTypeChange">
            <option v-for="type in modelTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div class="form-group MatcFlexGrow">
          <label>Brand</label>
          <select class="form-control" v-model="secret.brand" @change="onBrandChange">
            <option v-for="b in currentBrands" :key="b.id" :value="b.id">{{ b.label }}</option>
          </select>
        </div>

      </div>

      <div class="MatcFlex MatcGapXL">

        <div class="form-group MatcFlexGrow">
          <label>URL</label>
          <input class="form-control" v-model="secret.domain" @onchange="onDomainChange" />
        </div>

        <div class="form-group MatcFlexGrow">
          <label>Model Name</label>
          <select class="form-control" v-model="secret.name" v-if="currentModels.length > 0">
            <option v-for="b in currentModels" :key="b.id" :value="b.id">{{ b.id }}</option>
          </select>

          <input class="form-control" v-model="secret.name" v-else />
        </div>

      </div>

      <div class="form-group">


        <label>Label</label>
        <input class="form-control" v-model="secret.label" />
      </div>


      <div class="form-group">
        <label>Token</label>
        <input class="form-control" v-model="secret.value" />
      </div>


      <div class="MatcFlex MatcGapXL">
        <div class="form-group MatcFlexGrow">
          <label>Pricing Default (€ per million request) </label>
          <input class="form-control" v-model.number="pricingInEuro" />
        </div>

        <div class="form-group MatcFlexGrow">
          <label>Pricing Quantity (€ per million tokens)</label> 
          <input class="form-control" v-model.number="pricingQuantityPerMillionInEuro" />
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

<style lang="css" scoped>
.MatcFlexGrow select.form-control {
  width: 100%;
}

.MatcFlexGrow {
  width: 50%;
}
</style>

<script>
import Logger from "common/Logger";
import Services from "services/Services";
import AdminService from "./AdminService";
import lang from "dojo/_base/lang";

import BaseDialog from "../../components/dialogs/BaseDialog.vue";
import * as SecretUtil from '../../util/SecretUtil'
import * as CreditUtil from '../../util/CreditUtil'

export default {
  name: "SecretDialog",
  props: [""],
  data() {
    return {
      secret: {
        type: 'llm',
        brand: '',
        status: true,
        domain: '' // Set default status to true
      },
      paidUntilDate: "",
      isBlocked: false,
      modelTypes: SecretUtil.getAllTypes(),
      brandsByType: SecretUtil.getAllBrandsByType(),
      modelsByTypeAndBrand: SecretUtil.getAllModelsByTypeAndBrand(),
      domainHints: SecretUtil.getDomains(),
      currentBrands: [],
      currentModels: [],
      pricingInEuro: 0,
      pricingQuantityPerMillionInEuro: 0,
    };
  },
  components: {
    'BaseDialog': BaseDialog
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
    onTypeChange() {
      this.secret.brand = '';
      this.secret.name = '';
      this.secret.domain = '';
      this.setBrandsByType();
      this.$forceUpdate()
    },
    onBrandChange() {
      this.setModelsByBrand();
      this.secret.name = '';
      this.secret.domain = this.domainHints.find(d => {
        return d.brand === this.secret.brand
      })?.value || ''

      this.$forceUpdate()
    },
    onDomainChange() {

    },
    setBrandsByType() {
      this.currentBrands = this.brandsByType[this.secret.type] || [];
    },
    setModelsByBrand() {
      if (this.modelsByTypeAndBrand[this.secret.type] && this.modelsByTypeAndBrand[this.secret.type][this.secret.brand]) {
        this.currentModels = this.modelsByTypeAndBrand[this.secret.type][this.secret.brand]
      } else {
        this.currentModels = []
      }
    },
    async saveSecret() {
      if (this.secret && this.secret.id) {
        await this.updateSecret();
      } else {
        await this.createSecret();
      }
    },
    async updateSecret() {
      this.secret.pricing = CreditUtil.pricePerMillionToPriceMicroCent(this.pricingInEuro);
      this.secret.pricingQuantity = CreditUtil.pricePerMillionToPriceMicroCent(this.pricingQuantityPerMillionInEuro);
      await this.adminService.updateSecret(this.secret);
      if (this.saveCallback) {
        this.saveCallback();
      }
      this.close();
    },
    async createSecret() {
      this.secret.pricing = CreditUtil.pricePerMillionToPriceMicroCent(this.pricingInEuro * 1.0);
      this.secret.pricingQuantity = CreditUtil.pricePerMillionToPriceMicroCent(this.pricingQuantityPerMillionInEuro * 1.0);
      this.secret.status = true; // Ensure status is true by default
      await this.adminService.createSecret(this.secret);
      if (this.saveCallback) {
        this.saveCallback();
      }
      this.close();
    },
    close() {
      this.$refs.dialog.close();
    },
    show(secret, saveCallback) {
      this.$refs.dialog.show();
      this.secret = lang.clone(secret || { type: '', brand: '' });
      if (this.secret.status === undefined) {
        this.secret.status = true; // Set default status if undefined
      }
      this.saveCallback = saveCallback;
      this.pricingInEuro = CreditUtil.pricePerUnitToPricePerMillion(this.secret.pricing || 0);
      this.pricingQuantityPerMillionInEuro = CreditUtil.pricePerUnitToPricePerMillion(this.secret.pricingQuantity || 0);
      this.setModelsByBrand();
      this.setBrandsByType();
      console.log("Editing secret:", this.secret);
    },
  },
  mounted() {
    this.logger = new Logger("SecretDialog");
    this.adminService = new AdminService();
    this.adminService.setToken(Services.getUserService().getToken());
  },
};
</script>
<style lang="scss"></style>
