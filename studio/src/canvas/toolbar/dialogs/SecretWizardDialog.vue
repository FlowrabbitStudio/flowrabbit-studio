<template>
  <div>
    <div class="MatcSecret MatcDialogContainer MatcDialogFlexContainer MatcDialogLL">
      <div class="MatcDialogContent">
        <div class="MatcDialogContentHeader MatcDialogContentHeaderBorder" v-if="!currentSecret">API Secrets</div>
        <div class="MatcDialogContentHeader MatcDialogContentHeaderBorder" v-if="currentSecret">
          <span v-if="currentSecret" class="backIcon" @click="back">
            <i class="mdi mdi-chevron-left"></i>
          </span>
          <template v-if="isNew"> Create Secret </template>
          <template v-else> Edit Secret </template>
        </div>

        <div class="MatcDialogContentGrow" v-if="!currentSecret">
          <div v-if="data" class="MatcSecretBoxCntr MatcMarginTop">
            <div class="MatcSecretBox MatcSecretBoxNew" @click="showNew">Create New</div>
            <div
              v-for="(s, i) in data.secrets"
              :key="i"
              :class="['MatcSecretBox', { MatcSplitDialogNavItemSelected: currentSecret?.key === s.key }]"
              @click="showEdit(s)"
            >
              <div>
                <div class="MatcFlex">
                  <h4>
                    <span :class="secretIcon(s)"> </span>
                    {{ s.key }}
                  </h4>
                </div>
                <span v-if="s.lastUpdate">
                  {{ formatDate(s.lastUpdate) }} <span class="time-since">({{ timeSince(s.lastUpdate || s.created) }})</span></span
                >
                <span v-else>
                  {{ formatDate(s.created) }} <span class="time-since">({{ timeSince(s.lastUpdate || s.created) }})</span></span
                >
              </div>
              <span class="MatcFormRemoveIcon mdi mdi-close-circle" @click.stop="remove(s, i)"></span>
            </div>
          </div>
        </div>

        <div class="MatcDialogContentGrow" v-if="currentSecret">
          <form autocomplete="new-password">
            <div class="form-group">
              <label>Name</label>
              <input type="text" autocomplete="off" class="form-control" @change="setDirty()" v-model="currentSecret.key" placeholder="Name of the secret" />
            </div>

            <div class="form-group">
              <label>API Secret Token</label>

              <input
                type="password"
                autocomplete="new-password"
                class="form-control"
                @change="setDirty()"
                v-model="currentSecret.value"
                placeholder="The password or token"
              />
            </div>

            <div class="form-group" v-if="true">
              <label>Domain</label>

              <DropDownButton
                :value="currentSecret.domain"
                :options="domainHints"
                @change="setDomain"
                :defaultOption="defaultOption"
                :formControl="true"
                ref="newDomainCombo"
                class="secret-dropdown"
                placeholder="Service (optional)"
              />
            </div>
            <div v-if="isCustomDomain()" class="form-group">
              <label>Custom Domain</label>
              <input
                type="text"
                autocomplete="off"
                class="form-control"
                @change="setCustomDomain"
                v-model="currentSecret.domain"
                placeholder="Name of the custom domain"
              />
            </div>
          </form>
          <!-- <hr />
          <div class="secretsDates" v-if="currentSecret.created">
            <div class="MatcFlex secretsDate">
              <span class="mr-2">Created:</span>
              <span>{{ formatDate(currentSecret.created,) }}</span>
            </div>
            <span>({{ timeSince(currentSecret.created) }})</span>
          </div>
          <div class="secretsDates" v-if="currentSecret.lastUpdate">
            <div class="MatcFlex secretsDate">
              <span class="mr-2">Last Updated:</span>
              <span>{{ formatDate(currentSecret.lastUpdate) }}</span>
            </div>
            <span>({{ timeSince(currentSecret.lastUpdate) }})</span>
          </div> -->
        </div>

        <span class="MatcError" v-show="errorMSG && errorMSG.length > 0">
          {{ errorMSG }}
        </span>
        <div class="MatcButtonBarDialog" v-if="currentSecret">
          <a @click="back" class="MatcLinkButtonDialog">Back</a>
          <a :class="['MatcButtonDialog']" @click="update" :disabled="!isDirty" v-if="!isNew">Update</a>
          <a :class="['MatcButtonDialog']" @click="add" :disabled="!isDirty" v-if="isNew">Create new</a>
        </div>
        <div v-if="!currentSecret" class="MatcButtonBarDialog">
          <a @click="close" class="MatcLinkButtonDialog">Cancel</a>
          <a :class="['MatcButtonDialog']" @click="save" :disabled="!isDirty">Save Changes</a>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import "../../../style/scss/secrets.scss";
@import "../../../style/components/dialog.scss";
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import * as SecretUtil from "../../../util/SecretUtil";
import DropDownButton from "page/DropDownButton";

export default {
  name: "SecretsList",
  mixins: [DojoWidget],
  props: ["app", "pub"],
  data: function () {
    return {
      errorMSG: "",
      newKey: "",
      newValue: "",
      newDomain: "",
      isDirty: false,
      data: null,
      domainHints: [],
      currentSecret: null,
      defaultOption: { value: "https://api.example.com", label: "Other", icon: "ai-custom" },
      isNew: false,
    };
  },
  components: {
    DropDownButton: DropDownButton,
  },
  methods: {
    isCustomDomain() {
      const domain = this.currentSecret.domain;
      if (!domain) {
        return false;
      }
      return this.fixedDomains.indexOf(domain) === -1;
    },
    secretIcon(secret) {
      const icon = this.domainHints.find((d) => d.value === secret?.domain)?.icon;
      return `MatcDropDownIcon  ${icon || "ai-custom"}`;
    },
    formatDate(t, justDate = true) {
      const date = new Date(t);
      if (justDate) {
        return date.toLocaleDateString();
      }
      return date.toLocaleString();
    },

    // New method to calculate time since
    timeSince(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);

      let interval = seconds / 31536000;

      if (interval > 1) {
        const count = Math.floor(interval);
        return count + " year" + (count !== 1 ? "s" : "") + " ago";
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        const count = Math.floor(interval);
        return count + " month" + (count !== 1 ? "s" : "") + " ago";
      }
      interval = seconds / 86400;
      if (interval > 1) {
        const count = Math.floor(interval);
        return count + " day" + (count !== 1 ? "s" : "") + " ago";
      }
      interval = seconds / 3600;
      if (interval > 1) {
        const count = Math.floor(interval);
        return count + " hour" + (count !== 1 ? "s" : "") + " ago";
      }
      interval = seconds / 60;
      if (interval > 1) {
        const count = Math.floor(interval);
        return count + " minute" + (count !== 1 ? "s" : "") + " ago";
      }
      return Math.floor(seconds) + " second" + (seconds !== 1 ? "s" : "") + " ago";
    },

    showNew() {
      this.currentSecret = {
        key: "",
        value: "",
        domain: "",
      };
      this.isNew = true;
      this.errorMSG = "";
    },
    showEdit(s) {
      this.currentSecret = {
        key: s.key,
        value: s.value,
        domain: s.domain,
        created: s.created,
        lastUpdate: s.lastUpdate,
      };
      this.selectedSecret = s;
      this.isNew = false;
      this.errorMSG = "";
    },
    setDirty() {
      this.isDirty = true;
      this.currentSecret.lastUpdate = new Date().getTime();
    },
    setCustomDomain() {
      try {
        const url = new URL(this.currentSecret.domain);
        if (url && url.hostname) {
          this.setDomain(url.hostname);
          this.errorMSG = "";
        } else {
          this.errorMSG = "Enter a valid URL";
        }
      } catch (err) {
        this.errorMSG = "Enter a valid URL";
      }
    },
    setDomain(d) {
      this.currentSecret.domain = d;
      this.setDirty();
    },
    back() {
      this.currentSecret = null;
      this.isNew = false;
      this.errorMSG = "";
    },
    update() {
      if (this.isValid()) {
        this.selectedSecret.key = this.currentSecret.key;
        this.selectedSecret.value = this.currentSecret.value;
        this.selectedSecret.domain = this.currentSecret.domain;
        this.selectedSecret.created = this.currentSecret.created;
        this.selectedSecret.lastUpdate = new Date().getTime();

        this.selectedSecret = null;
        this.currentSecret = null;
        this.isNew = false;
        this.isDirty = true;
      }
    },
    async save() {
      const res = await this.modelService.updateSecrets(this.app.id, this.data);
      // call back
      if (this.setSecrets) {
        this.setSecrets(res.secrets);
      }

      this.close();
      if (res.errors) {
        this.errorMSG = "Could not save secrets";
      } else {
        this.showSuccess("Changes Saved");
      }
    },
    remove(secret) {
      this.data.secrets = this.data.secrets.filter((s) => s.key !== secret.key);
      this.isDirty = true;
    },
    add() {
      if (this.isValid()) {
        this.data.secrets.push({
          key: this.currentSecret.key,
          value: this.currentSecret.value,
          domain: this.currentSecret.domain,
          created: new Date().getTime(),
        });
        this.isNew = false;
        this.currentSecret = null;
        this.isDirty = true;
      }
    },
    isValid() {
      if (!this.currentSecret) {
        return true;
      }
      if (!this.currentSecret.key) {
        this.errorMSG = "Please add a name";
        return false;
      }
      if (!this.currentSecret.value) {
        this.errorMSG = "Please add the secret token";
        return false;
      }
      if (!this.currentSecret.domain) {
        this.errorMSG = "Please add the Domain";
        return false;
      }
      return true;
    },

    async loadSecrets() {
      const data = await this.modelService.findSecrets(this.app.id);
      if (!data.secrets) {
        data.secrets = [];
      }
      this.data = data;
    },
  },
  mounted() {
    this.modelService = Services.getModelService();
    this.domainHints = [this.defaultOption, ...SecretUtil.getDomains()];
    this.fixedDomains = SecretUtil.getDomains().map((v) => v.value);
    this.loadSecrets();
  },
};
</script>
