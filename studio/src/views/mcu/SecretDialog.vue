<template>
  <BaseDialog
    title="Edit Secret"
    subtitle=""
    :labels="labels"
    ref="dialog"
    @confirmAction="saveSecret"
  >
    <div class="MatcDialog MatcSurveyDialog MatcPadding">
      <div class="MatcFlex MatcGapXL">


        <div class="form-group MatcFlexGrow">
          <label>Type</label>
          <select class="form-control" v-model="secret.type">
            <option value="llm">llm</option>
            <option value="image">image</option>
            <option value="video">video</option>
            <option value="speechToText">speechToText</option>
            <option value="textToSpeech">textToSpeech</option>
          </select>
        </div>
        <div class="form-group MatcFlexGrow">
          <label>Brand</label>
          <input class="form-control" v-model="secret.brand" />
        </div>

      </div>

      <div class="MatcFlex MatcGapXL">

        <div class="form-group MatcFlexGrow">
          <label>Label</label>
          <input class="form-control" v-model="secret.label" />
        </div>

        <div class="form-group MatcFlexGrow">
          <label>Name</label>
          <input class="form-control" v-model="secret.name" />
        </div>

      </div>

      <div class="form-group">
        <label>Token</label>
        <input class="form-control" v-model="secret.value" />
      </div>

      <div class="form-group">
        <label>URL ({{secret.domain}})</label>

        <Combo 
            :value="secret.domain" 
            @change="setDomain" 
            :hints="domainHints" 
            :fireOnBlur="true"
            :showHintLabel="true" 
            cssClass="form-control" 
            :isDropDown="true" 
            ref="newDomainCombo" 
            placeholder="Service" 
        />
      </div>

      <div class="MatcFlex MatcGapXL">
        <div class="form-group MatcFlexGrow">
          <label>Pricing Default (1€ = 10,000)</label>
          <input class="form-control" v-model.number="secret.pricing" />
        </div>

        <div class="form-group MatcFlexGrow">
          <label>Pricing Quantity (1€ = 10,000)</label>
          <input class="form-control" v-model.number="secret.pricingQuantity" />
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

<script>
import Logger from "common/Logger";
import Services from "services/Services";
import AdminService from "./AdminService";
import lang from "dojo/_base/lang";
import Input from 'common/Input'
import BaseDialog from "../../components/dialogs/BaseDialog.vue";
import * as SecretUtil from '../../util/SecretUtil'

export default {
  name: "SecretDialog",
  props: ["availableBrands"],
  data() {
    return {
      secret: {
        status: true,
        domain:'' // Set default status to true
      },
      paidUntilDate: "",
      isBlocked: false,
      domainHints: SecretUtil.getDomains(),
    };
  },
  components: {
    'BaseDialog': BaseDialog,
    'Combo': Input
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
    setDomain (d) {
      console.log('setDomain', d);
      this.secret.domain = d;
      this.$forceUpdate()
    },
    async saveSecret() {
      if (this.secret && this.secret.id) {
        await this.updateSecret();
      } else {
        await this.createSecret();
      }
    },
    async updateSecret() {
      await this.adminService.updateSecret(this.secret);
      if (this.saveCallback) {
        this.saveCallback();
      }
      this.close();
    },
    async createSecret() {
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
      this.secret = lang.clone(secret || {});
      if (this.secret.status === undefined) {
        this.secret.status = true; // Set default status if undefined
      }
      this.saveCallback = saveCallback;
    },
  },
  mounted() {
    this.logger = new Logger("UserDialog");
    this.adminService = new AdminService();
    this.adminService.setToken(Services.getUserService().getToken());
  },
};
</script>
<style lang="scss"></style>
