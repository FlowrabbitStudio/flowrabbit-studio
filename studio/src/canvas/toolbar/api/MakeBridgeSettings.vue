<template>
  <div class="make-bridge-settings" v-if="api && databinding">
    <!-- Loading Overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="spinner"></div>
    </div>

    <!-- Toolbar Tabs -->
    <div class="MatcToolbarTabs MatcToolbarTabsBig">
      <div>
        <a @click="tab = 'input'" :class="{ MatcToolbarTabActive: tab === 'input' }"> Select Scenario </a>
        <a @click="tab = 'output'" :class="{ MatcToolbarTabActive: tab === 'output' }"> Scenario Output </a>
        <a @click="tab = 'auth'" :class="{ MatcToolbarTabActive: tab === 'auth' }"> Setup </a>
        <a @click="tab = 'setup'" :class="{ MatcToolbarTabActive: tab === 'setup' }"> Advanced </a>
      </div>
    </div>

    <!-- Input Tab -->
    <div v-if="tab === 'input'">
      <!-- Show templates if available -->
      <div v-if="hasTemplates" class="form-group">
        <label>Select a Template</label>
        <DropDownButton :value="api.templateID" @change="selectTemplate" :options="templates" />

        <!-- Template Parameters Section -->
        <div class="MatcMarginTop" v-if="api.templateID">
          <div class="template-parameters-section">
            <h4>Scenario Input Parameters</h4>
            <div v-if="webhookParameters.length > 0" class="table">
              <div class="MatcMarginTop params" v-for="param in webhookParameters" :key="param.name">
                <AIRestSettingItem
                  :item="param"
                  :onChange="onParamChange"
                  :rest="api"
                  :aiModel="{}"
                  :databindingValues="databindingValues"
                  :hash="hash"
                  :hints="variableHints"
                  :variableAndSecretHints="variableAndSecretHints"
                />
              </div>
            </div>
            <p v-if="webhookParameters.length === 0">No input parameters found.</p>
          </div>
        </div>
      </div>
      <!-- Show message if no templates available -->
      <div v-else class="form-group">
        <p class="no-templates-message">This organization and team doesn't have template bridges associated.</p>
      </div>
    </div>

    <!-- Auth Tab -->
    <div v-if="tab === 'auth'">
      <div class="MatcMarginBottom form-group">
        <label> Base URL </label>
        <input class="form-control" v-model="api.baseURL" @change="onChangeBaseURL" placeholder="The Organization URL in your Make Account" />
      </div>
      <div class="MatcMarginBottom" v-if="api.baseURL">
        <div class="MatcFlex MatcBetween form-group">
          <label>
            API Key
            <span class="MatcToolbarItemIcon" ref="tooltipAuthToken">
              <span class="mdi mdi-help-circle-outline"></span>
            </span>
          </label>
          <a target="_blank" :href="documentationAuthLink" class="MatcFontTiny"> How do I get the API key? </a>
        </div>
        <TokenInput
          :appID="app?.id"
          :value="api.token"
          @change="setRestToken"
          :hints="secretHints"
          domain="*.make.com"
          :fireOnBlur="true"
          :formControl="true"
          :isDropDown="true"
          placeholder="Your Make API Key"
        />
      </div>
      <div class="form-group" v-if="orgs.length">
        <label>Organization</label>
        <DropDownButton :value="api.makeOrgId" @change="setOrg" :options="orgs" />
      </div>
      <div class="form-group" v-if="teams.length">
        <label>Teams</label>
        <DropDownButton :value="api.teamID" @change="setTeam" :options="teams" />
      </div>
    </div>

    <!-- Output Tab -->
    <div v-if="tab === 'output'">
      <div class="form-group" v-if="api.template">
        <label>Output Variable</label>
        <Combo
          :value="databinding.default"
          @change="setOutput"
          :hints="hints"
          :fireOnBlur="true"
          :formControl="true"
          :isDropDown="true"
          placeholder="Where the data will be stored"
        />
      </div>
    </div>

    <!-- Setup Tab (Placeholder for future content) -->
    <div v-if="tab === 'setup'">
      <div class="form-group">
        <label>Actions</label>
        <SegmentButton v-model="api.makeAction" @change="changeMakeAction" :options="makeActions" />
        <!-- Helper -->
        <div class="MatcInfoBox MatcMarginTopXS">
          <p>{{ makeActionsHelper }}</p>
        </div>
      </div>

      <div class="form-group">
        <div class="form-group" v-if="teams.length">
          <label>Team where the scenario is created</label>
          <DropDownButton v-model="api.scenarioTeamID" :options="[{ value: 'new', label: 'Create new team' }, ...teams]" />
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMSG" class="MatcError">
      {{ errorMSG }}
    </div>
  </div>
</template>

<script>
import DojoWidget from "dojo/DojoWidget";
import Util from "core/Util";
import Logger from "common/Logger";
import Input from "common/Input";
import DropDownButton from "page/DropDownButton";
import MakeBridgeEngine from "../../../core/MakeBridgeEngine.js";
import AIRestSettingItem from "../components/AIRestSettingItem.vue";
import TokenInput from "common/TokenInput.vue";
import _Tooltip from "common/_Tooltip";
import SegmentButton from "page/SegmentButton";

export default {
  name: "MakeBridgeSettings",
  mixins: [DojoWidget, Util, _Tooltip],
  props: ["api", "secretKeys", "app", "hash", "databinding", "hints", "variableHints", "variableAndSecretHints", "secretHints", "schema"],
  data() {
    return {
      tab: "input",
      errorMSG: "",
      templates: [],
      webhookParameters: [],
      params: {},
      databindingValues: {},
      documentationAuthLink: "https://developers.make.com/api-documentation/authentication",
      orgs: [],
      teams: [],
      isValidURL: true,
      loadingCount: 0,
      makeActions: [
        {
          value: "init",
          label: "Init & Execute Workflow",
          helper: "Starts a new flow and create new scenario using the Make Bridge Template selected if one doesn't already exist for the current user. If it does, the existing scenario will be executed."
        },
        {
          value: "delete",
          label: "Reset & Delete",
          helper: "For the user using this template, checks if a scenario and webhook were created via the Make Bridge template. If found, removes them from your Make account."
        },
      ],
      makeActionsHelper: ''
    };
  },
  components: {
    Combo: Input,
    DropDownButton,
    AIRestSettingItem,
    TokenInput,
    SegmentButton
  },
  computed: {
    // Computed property to determine if there are any templates available.
    hasTemplates() {
      return this.templates && this.templates.length > 0;
    },
    // Returns true if any async request is in progress.
    isLoading() {
      return this.loadingCount > 0;
    },
  },
  methods: {
    changeMakeAction(value) {
      this.makeActionsHelper = this.makeActions.find((a) => a.value === value)?.helper || '';
      this.api.makeAction = value;
      this.onChange();
    },
    setRestToken(t) {
      this.api.token = t;
      this.onChange();
      this.loadOrgs();
    },
    setTeam(v) {
      this.api.teamID = v;
      this.onChange();
      this.loadTemplates();
    },
    setOrg(v) {
      this.api.makeOrgId = v;
      this.onChange();
      this.loadTeam();
    },
    /**
     * Sets the output variable in databinding.
     * @param {String} value - The selected output variable.
     */
    setOutput(value) {
      this.databinding.default = value;
      this.onChange();
    },
    /**
     * Handles changes to individual parameters.
     */
    onParamChange(element, event) {
      const value = event && event.target ? event.target.value : event;
      this.$set(this.params, element.name, value);
      this.$set(element, "value", value);
      this.api.params = { ...this.params }; // Ensure reactivity
      this.onChange();
    },
    /**
     * Handles template selection and initializes webhook parameters.
     */
    selectTemplate(templateId) {
      this.api.templateID = templateId;
      this.webhookParameters = [];

      const template = this.templates.find((t) => t.template?.id === templateId);
      if (template) {
        this.api.instanceableId = template.template?.instanceableId;
        if (template.template?.blueprint?.flow) {
          template.template.blueprint.flow.forEach((step) => {
            if (step.metadata?.interface) {
              step.metadata.interface.forEach((param) => {
                if (param.name) {
                  // Use saved parameter value if available from this.params
                  this.webhookParameters.push({
                    label: `${param.label || param.name} (${param.type})`,
                    name: param.name,
                    type: "Combo",
                    required: param.required || false,
                    value: this.params[param.name] || "",
                  });
                }
              });
            }
          });
        }
      }
      this.onChange();
    },
    /**
     * Emits change events to the parent component.
     */
    onChange() {
      this.$forceUpdate();
      this.$emit("change", this.api, this.databinding);
    },
    async listTeams() {
      this.loadingCount++;
      try {
        const teams = await MakeBridgeEngine.listTeams(this.api.makeOrgId, this.api.baseURL, this.api.token, this.hash, this.app.id);
        this.teams = teams;
      } catch (error) {
        this.logger.error("Failed to get teams:", error);
        this.errorMSG = "Failed to get the teams";
      } finally {
        this.loadingCount--;
      }
    },
    async loadOrgs() {
      if (!this.api.token || !this.api.baseURL) {
        return;
      }
      this.loadingCount++;
      try {
        const orgs = await MakeBridgeEngine.listOrgs(this.api.baseURL, this.api.token, this.hash, this.app.id);
        if (!this.api.makeOrgId && orgs.length > 0) {
          this.api.makeOrgId = orgs[0].id;
        }
        this.orgs = orgs.map((o) => ({
          value: o.id,
          label: o.name,
        }));
        await this.loadTeam();
      } catch (error) {
        this.logger.error("Failed to get organizations:", error);
        this.errorMSG = "Failed to get the organizations";
      } finally {
        this.loadingCount--;
      }
    },
    async loadTemplates() {
      if (!this.api.teamID || !this.api.token || !this.api.baseURL) {
        this.logger.log(-1, "loadTemplates", "exit > not ready");
        return;
      }
      this.loadingCount++;
      try {
        const templates = await MakeBridgeEngine.listTemplates(this.api.baseURL, this.api.teamID, this.api.token, this.hash, this.app.id);
        this.templates =
          templates?.map((t) => ({
            value: t.id,
            label: t.name["en"],
            template: t,
          })) || [];

        // If a template is already selected, reinitialize webhook parameters.
        if (this.api?.templateID) {
          this.selectTemplate(this.api.templateID);
        }
        this.tab = "input";
      } catch (error) {
        this.logger.error("Failed to load templates:", error);
        this.errorMSG = "Failed to load templates.";
      } finally {
        this.loadingCount--;
      }
    },
    async loadTeam() {
      if (!this.api.makeOrgId || !this.api.token || !this.api.baseURL) {
        this.logger.log(-1, "loadTeam", "exit > not ready");
        return;
      }
      this.loadingCount++;
      try {
        const teams = await MakeBridgeEngine.listTeams(this.api.makeOrgId, this.api.baseURL, this.api.token, this.hash, this.app.id);
        this.teams = teams.map((o) => ({
          value: o.id,
          label: o.name,
        }));
        if (!this.api.teamID && this.teams.length > 0) {
          this.api.teamID = this.teams[0].id;
        }
        await this.loadTemplates();
      } catch (error) {
        this.logger.error("Failed to load teams:", error);
        this.errorMSG = "Failed to load teams.";
      } finally {
        this.loadingCount--;
      }
    },
    onChangeBaseURL() {
      // Validate and parse the base URL.
      let url = this.api.baseURL;
      if (!url.startsWith("https://")) {
        url = "https://" + url;
      }
      const stripped = url.replace("https://", "");
      const parts = stripped.split("/");
      if (parts.length < 3 || parts[1] !== "organization") {
        this.isValidURL = false;
        this.errorMSG = "Not a valid MAKE URL";
        return;
      }
      this.isValidURL = true;
      this.api.baseURL = parts[0]; // e.g., eu2.make.com
      this.api.orgID = Number(parts[2]);
      this.onChange();
    },
  },
  async mounted() {
    this.logger = new Logger("MakeSettings");

    // Ensure api.template is an object and prefill params if any were saved
    if (this.api) {
      this.api.template = this.api.template || {};
      this.api.input = this.api.input || [];
      this.api.makeAction = this.api.makeAction || "init";      
      this.makeActionsHelper = this.makeActions.find((a) => a.value === this.api.makeAction)?.helper || '';
      this.api.scenarioTeamID = this.api.scenarioTeamID || "new";
      this.params = this.api.params ? { ...this.api.params } : {};
    }

    try {
      if (this.api.baseURL && this.api.token) {
        await this.loadOrgs();
      }
    } catch (error) {
      this.logger.error("Failed to load templates:", error);
      this.errorMSG = "Failed to load templates.";
    }

    if (this.$refs.tooltipAuthToken) {
      this.addTooltip(
        this.$refs.tooltipAuthToken,
        'To add a new secret token, go to the app options in the top bar menu, click on "Secret Vars" and add a new secret variable. Click on save and then this new variable will be shown here. All secret variables are safely secured, using high security standards.'
      );
    }
    // Show the auth tab if no token exists.
    this.tab = this.api.token ? "input" : "auth";
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.param-label {
  margin-top: 10px;
}
.param-label label {
  font-weight: bold;
  display: block;
}

/* Styling for the no-templates message */
.no-templates-message {
  color: #666;
  font-style: italic;
  padding: 10px;
}

/* Loading overlay styles */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Template parameters section styling */
.template-parameters-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 4px;
}
.template-parameters-section div {
  background-color: #f9f9f9;
}
.template-parameters-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
}
</style>
