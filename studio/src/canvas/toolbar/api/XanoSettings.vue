<template>
  <div v-if="api && databinding">
    <div class="MatcToolbarTabs MatcToolbarTabsBig">
      <div>
        <a @click="tab = 'input'" :class="{ MatcToolbarTabActive: tab === 'input' }">Input</a>
        <a @click="tab = 'output'" :class="{ MatcToolbarTabActive: tab === 'output' }">Output</a>
        <a @click="tab = 'setup'" :class="{ MatcToolbarTabActive: tab === 'setup' }">Setup</a>
      </div>
    </div>

    <!-- Input Tab -->
    <div v-if="tab === 'input'">
      <div class="form-group">
        <label>Data</label>
        <Ace ref="aceEditor" @change="setTemplate" v-model="api.template" @init="editorInit" lang="json" theme="chrome" width="550" height="220"></Ace>
        <p class="MatcHint">Use the \${variable} notation to send data from the prototype.</p>
      </div>
    </div>

    <!-- Output Tab -->
    <div v-if="tab === 'output'">
      <div class="form-group">
        <label>Output Variable</label>
        <Combo
          :value="api.output?.databinding"
          @change="setOutput"
          :hints="hints"
          :fireOnBlur="true"
          :formControl="true"
          :isDropDown="true"
          placeholder="Where the data will be stored"
        />
      </div>
    </div>

    <!-- Setup Tab -->
    <div v-if="tab === 'setup'">
      <div class="form-group">
        <label>API Token</label>
        <Combo
          :value="api.token"
          @change="setToken"
          :hints="secretHintsList"
          :fireOnBlur="true"
          :formControl="true"
          :isDropDown="true"
          placeholder="Your API key"
        />
      </div>
      <div class="form-group">
        <label>Xano Endpoint</label>
        <input class="form-control" v-model="api.baseUrl" @change="setbaseUrl(api.baseUrl)" placeholder="https://your-xano-instance.xano.io" />
      </div>

      <div v-if="api.token && api.baseUrl">
        <div class="form-group">
          <label>Workspaces</label>
          <DropDownButton :value="api.workspaceId" @change="onWorkspaceSelect" :options="workspaces" placeholder="Select a workspace" />
        </div>

        <div v-if="api.workspaceId" class="form-group">
          <label>API Groups</label>
          <DropDownButton :value="api.apiGroupId" @change="onApiGroupSelect" :options="apiGroups" placeholder="Select an API group" />
        </div>

        <div v-if="api.apiGroupId" class="form-group">
          <label>APIs</label>
          <DropDownButton :value="api.apiId" @change="onApiSelect" :options="apis" placeholder="Select an API" />
        </div>
      </div>
    </div>

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
import RestUtil from "../../../core/RestUtil";
import DropDownButton from "page/DropDownButton";
import RestEngine from "../../../core/RestEngine";

export default {
  name: "XanoSettings",
  mixins: [DojoWidget, Util],
  props: ["api", "secretKeys", "app", "hash", "databinding", "hints", "variableHints", "variableAndSecretHints", "secretHints", "schema"],
  data() {
    return {
      tab: "setup",
      errorMSG: "",
      workspaces: [],
      apiGroups: [],
      apis: [],
    };
  },
  components: {
    Combo: Input,
    Ace: () => import(/* webpackChunkName: "ace" */ "vue2-ace-editor"),
    DropDownButton: DropDownButton,
  },
  computed: {
    secretHintsList() {
      if (this.secretKeys) {
        return this.secretKeys.map((e) => {
          const v = "${secrets." + e.key + "}";
          return {
            label: e.key,
            value: v,
            icon: "mdi mdi-key",
          };
        });
      }
      return [];
    },
  },
  methods: {
    setToken(token) {
      this.api.token = token;
      this.onChange();
      if (this.api.token && this.api.baseUrl) {
        this.fetchWorkspaces();
      }
    },
    setbaseUrl(baseUrl) {
      this.api.baseUrl = baseUrl;
      this.onChange();
      if (this.api.token && this.api.baseUrl) {
        this.fetchWorkspaces();
      }
    },
    async fetchWorkspaces() {
      this.errorMSG = "";
      try {
        const response = await this.request("GET", "/api:meta/workspace");
        if (Array.isArray(response)) {
          this.workspaces = response.map((workspace) => ({
            label: workspace.name,
            value: workspace.id,
          }));
          // Check if saved workspaceId is in the list
          if (this.api.workspaceId) {
            const selectedWorkspace = this.workspaces.find((ws) => ws.value === this.api.workspaceId);
            if (selectedWorkspace) {
              this.api.workspaceName = selectedWorkspace.label;
            } else {
              this.api.workspaceId = null;
              this.api.workspaceName = null;
            }
          }
        } else {
          this.errorMSG = "Failed to fetch workspaces.";
        }
      } catch (error) {
        console.log(error);
        this.errorMSG = "Invalid API key or error fetching workspaces.";
      }
    },
    onWorkspaceSelect(workspaceId) {
      this.api.workspaceId = workspaceId;
      const selectedWorkspace = this.workspaces.find((ws) => ws.value === workspaceId);
      if (selectedWorkspace) {
        this.api.workspaceName = selectedWorkspace.label;
      }
      this.apiGroups = [];
      this.apis = [];
      this.onChange();
      this.fetchApiGroups(workspaceId).then(() => {
        if (this.api.apiGroupId) {
          this.onApiGroupSelect(this.api.apiGroupId);
        }
      });
    },
    async fetchApiGroups(workspaceId) {
      this.errorMSG = "";
      try {
        const response = await this.request("GET", `/api:meta/workspace/${workspaceId}/apigroup`);
        if (response && response.items) {
          this.apiGroups = response.items.map((apiGroup) => ({
            label: apiGroup.name,
            value: apiGroup.id,
            canonical: apiGroup.canonical,
          }));
          // Check if saved apiGroupId is in the list
          if (this.api.apiGroupId) {
            const selectedGroup = this.apiGroups.find((group) => group.value === this.api.apiGroupId);
            if (selectedGroup) {
              this.api.apiGroupName = selectedGroup.label;
            } else {
              this.api.apiGroupId = null;
              this.api.apiGroupName = null;
            }
          }
        } else {
          this.errorMSG = "Failed to fetch API groups.";
        }
      } catch (error) {
        console.log(error);
        this.errorMSG = "Error fetching API groups for the selected workspace.";
      }
    },
    onApiGroupSelect(apiGroupId) {
      const selectedGroup = this.apiGroups.find((group) => group.value === apiGroupId);
      if (selectedGroup) {
        this.api.apiGroupId = apiGroupId;
        this.api.apiGroupName = selectedGroup.label;
        this.api.canonical = selectedGroup.canonical;
        this.apis = [];
        this.onChange();
        this.fetchApis(this.api.workspaceId, apiGroupId).then(() => {
          if (this.api.apiId) {
            this.onApiSelect(this.api.apiId);
          }
        });
      }
    },
    async fetchApis(workspaceId, apiGroupId) {
      this.errorMSG = "";
      try {
        const response = await this.request("GET", `/api:meta/workspace/${workspaceId}/apigroup/${apiGroupId}/api`);
        if (response && Array.isArray(response.items)) {
          this.apis = response.items.map((api) => ({
            label: api.name,
            value: api.id,
            name: api.name,
          }));
          // Check if saved apiId is in the list
          if (this.api.apiId) {
            const selectedApi = this.apis.find((api) => api.value === this.api.apiId);
            if (selectedApi) {
              this.api.apiName = selectedApi.name;
            } else {
              this.api.apiId = null;
              this.api.apiName = null;
            }
          }
        } else {
          this.errorMSG = "Failed to fetch APIs.";
        }
      } catch (error) {
        console.log(error);
        this.errorMSG = "Error fetching APIs for the selected API group.";
      }
    },
    onApiSelect(apiId) {
      const selectedApi = this.apis.find((api) => api.value === apiId);
      if (selectedApi) {
        this.api.apiId = apiId;
        this.api.apiName = selectedApi.name;
        this.onChange();
        this.generateEndpointUrl();
        this.tab = "input";
      }
    },
    generateEndpointUrl() {
      if (this.api.baseUrl && this.api.canonical && this.api.apiName) {
        this.api.url = `${this.api.baseUrl}/api:${this.api.canonical}/${this.api.apiName}`;
        this.onChange();
      }
    },
    setTemplate() {
      const variables = RestUtil.getVariablesFromString(this.api.template);
      this.api.input = variables.map((v) => ({
        id: v,
        label: v,
        isVar: false,
        type: "Parameter",
        value: "",
      }));
      this.onChange();
    },
    setOutput(v) {
      if (!this.api.output) {
        this.api.output = {};
      }
      this.api.output.databinding = v;
      this.onChange();
    },
    onChange() {
      this.$forceUpdate();
      this.$emit("change", this.api, this.databinding);
    },
    editorInit() {
      require("brace/ext/language_tools");
      require("brace/mode/json");
      require("brace/theme/chrome");
      const editor = this.$refs.aceEditor.editor;
      editor.setOptions({
        enableBasicAutocompletion: false,
        enableSnippets: false,
        enableLiveAutocompletion: true,
      });
      editor.getSession().on("change", () => {
        this.setTemplate();
      });
      const vars = this.getAllAppVariables();
      editor.completers.push({
        getCompletions(editor, session, pos, prefix, callback) {
          if (prefix.indexOf("$") === 0) {
            const result = vars.map((v) => ({
              name: v,
              value: "${" + v + "}",
              score: 1,
              meta: "databinding",
            }));
            callback(null, result);
          }
        },
      });
    },
    async request(method, endpoint, data = {}) {
      if (this.api.baseUrl && endpoint) {
        const request = {
          method,
          url: `${this.api.baseUrl}${endpoint}`,
          headers: [
            {
              key: "Authorization",
              value: `Bearer ${this.api.token}`,
            },
          ],
          isProxyEnabled: true,
          input: {
            type: "JSON",
            template: JSON.stringify(data),
          },
          output: {
            type: "JSON",
            databinding: "",
            template: "",
            hints: {},
          },
        };
        return RestEngine.run(request, {}, this.hash, this.app.id);
      }
    },
    async run() {
      try {
        if (this.api.url) {
          console.log("HELLO");
          const request = {
            token: this.api.token,
            method: "POST",
            authType: "Bearer",
            url: this.api.url,
            isProxyEnabled: true,
            input: {
              type: "JSON",
              template: this.api.template,
            },
            output: {
              type: "JSON",
              databinding: "",
              template: "",
              hints: {},
            },
          };
          const response = await RestEngine.run(request, this.dataBindingValues, this.hash, this.app.id, true);
          const result = {
            data: response,
          };
          return result;
        }
      } catch (e) {
        console.log(e);
        return {
          error: "Something wrong with the data",
        };
      }
    },
    isValidToRun() {
      return this.api.url !== undefined && this.api.template !== undefined;
    },
    getInputData(data, key) {
      if (data[key]) {
        return data[key];
      }
    },

    initializeSetup() {
      if (this.dataFetched) return;

      this.errorMSG = "";
      if (this.api.token && this.api.baseUrl) {
        this.fetchWorkspaces().then(() => {
          if (this.api.workspaceId) {
            this.onWorkspaceSelect(this.api.workspaceId);
          }
        });
      } else {
        this.errorMSG = "Please provide API Token and Xano Endpoint.";
      }
      this.dataFetched = true; // Set the flag to true after fetching
    },
  },
  watch: {
    tab: {
      handler(newValue) {
        if (newValue === "setup") {
          this.initializeSetup();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.logger = new Logger("XanoSettings");
    if (this.api && !this.api.template) {
      this.api.template = "{}";
    }
    if (this.api.url) {
      this.tab = "input";
    } else {
      this.tab = "setup";
    }
  },
};
</script>

<style scoped>
/* Add any necessary styles here */
</style>
