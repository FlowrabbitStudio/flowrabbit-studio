<template>
  <div v-if="aiModel && aiModel.id" class="MatcToolbarRestSettingsElementCntr p-2">
    <div v-show="!rest.isFlowrabbitSecret" class="form-group">
      <div class="MatcFlex MatcBetween">
        <label>
          API Key
          <span class="MatcToolbarItemIcon" ref="tooltipAuthToken">
            <span class="mdi mdi-help-circle-outline"></span>
          </span>
        </label>
        <a v-if="aiModel.documentationAuthLink" target="_blank" :href="aiModel.documentationAuthLink" class="MatcFontTiny"> How do I get the API key? </a>
      </div>
      <div class="MatcMarginBottom">
        <TokenInput
          :appID="model?.id"
          :value="rest.token"
          @change="setRestToken"
          :hints="secretHints"
          :fireOnBlur="true"
          :formControl="true"
          :isDropDown="true"
          placeholder="Use secrets like ${secrets.apiToken}"
        />
      </div>
    </div>
    <div v-if="canUseFlowrabbit" class="">
      <template v-if="showFlowrabbitToken">
        <CheckBox :value="isFlowrabbitSecret" @change="onChange($event)" label="Use Flowrabbit authentication key" />
      </template>
      <div v-else>Flowrabit authentication keys not supported in this Organization.</div>
    </div>
    <div v-else>Flowrabit authentication keys not supported in this Model.</div>
  </div>
</template>

<script>
import CheckBox from "common/CheckBox";
import { mapState } from "vuex";
import debounce from "lodash/debounce";
import TokenInput from "../../../common/TokenInput.vue";

export default {
  components: {
    TokenInput,
    CheckBox,
  },
  props: ["rest", "aiModel", "secretHints", "disableFlowrabbit", "org", "model"],
  computed: {
    ...mapState(["selectedOrg"]),
    showFlowrabbitToken() {
      return this.org && (this.org.id !== "private");
    },
    canUseFlowrabbit() {
      return !this.disableFlowrabbit && this.showFlowrabbitToken;
    },
    isFlowrabbitSecret() {
      return this.rest.isFlowrabbitSecret;
    }
  },
  watch: {
    disableFlowrabbit(newVal) {
      if (newVal) {
        this.$emit("setIsFlowrabbitSecret", undefined);
      }
    }
  },
  methods: {
    setRestToken: debounce(function (token) {
      this.$emit("setRestToken", token);
    }, 300),
    onChange(value) {
      this.$emit("setIsFlowrabbitSecret", value);
    },
  },
  mounted() {
    if (this.disableFlowrabbit && this.rest.isFlowrabbitSecret) {
      this.$emit("setIsFlowrabbitSecret", undefined);
    }
  },
};
</script>
