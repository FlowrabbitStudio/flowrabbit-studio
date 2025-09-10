<template>
  <div class="" v-if="api && databinding">
    <div class="MatcToolbarTabs MatcToolbarTabsBig">
      <div>
        <a @click="tab = 'input'" :class="{ MatcToolbarTabActive: tab === 'input' }">Input</a>
        <a @click="tab = 'output'" :class="{ MatcToolbarTabActive: tab === 'output' }">Output</a>
        <a @click="tab = 'setup'" :class="{ MatcToolbarTabActive: tab === 'setup' }">Setup</a>
      </div>
    </div>

    <!-- OUTPUT TAB -->
    <template v-if="tab === 'output'">
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
    </template>

    <!-- INPUT TAB -->
    <template v-if="tab === 'input'">
      <SegmentButton
        v-model="inputView"
        :options="inputViews"
        @change="changeInputView"
        class="MatcMarginBottom"
      />
      <div v-if="inputView === 'json'" class="form-group">
        <Ace ref="aceEditor" @change="setTemplate" v-model="api.template" @init="editorInit" lang="json" theme="chrome" width="550" height="220"></Ace>
        <p class="MatcHint">Use the ${variable} notation to select the variable and inject it's value</p>
      </div>
      <div v-if="inputView === 'form'" class="form-group">
        <div v-for="i in inputForm" :key="i.name" class="form-group">
          <label>{{ i.name }} ({{ i.type }})</label>
          <Combo
            :value="i.value"
            @change="onChangeTemplate(i.name, $event)"
            :hints="variableAndSecretHints"
            :fireOnBlur="true"
            :formControl="true"
            :isDropDown="true"
            placeholder="Value"
          />
        </div>
      </div>
    </template>

    <!-- SETUP TAB -->
    <template v-if="tab === 'setup'">
      <div class="form-group">
        <label>Your Make Zone *</label>
        <input
          :class="['form-control', { 'form-control-error': !isValidURL }]"
          v-model="api.dashboardURL"
          @change="onChangeBaseURL"
          placeholder="eu1.make.com"
        />
      </div>

      <div class="form-group" v-if="api.baseURL">
        <label>API Token</label>
        <TokenInput
          :appID="app?.id"
          :value="api.token"
          @change="setToken"
          domain="*.make.com"
          :hints="secretHintsList"
          :fireOnBlur="true"
          :formControl="true"
          :isDropDown="true"
          placeholder="Your API key"
        />
      </div>

      <div class="form-group" v-if="orgs.length">
        <label>Organization</label>
        <DropDownButton :value="api.orgID" @change="setOrg" :options="orgs" />
      </div>

      <div class="form-group" v-if="teams.length">
        <label>Teams</label>
        <DropDownButton :value="api.teamID" @change="setTeam" :options="teams" />
      </div>

      <div class="form-group" v-if="hooks.length">
        <label>Data Sctructure (optional)</label>
        <DropDownButton :value="api.dataStructureId" @change="setDataStructure" :options="datastructures" />
      </div>

      <div class="form-group" v-if="hooks.length">
        <label>Web Hooks</label>
        <DropDownButton :value="api.hookID" @change="setHook" :options="hooks" />
      </div>
    </template>

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
import Services from "../../../services/Services";
import DropDownButton from "page/DropDownButton";
import TokenInput from "common/TokenInput";
import MakeEngine from "../../../core/MakeEngine.js"; // <--- IMPORT HERE
import SegmentButton from "page/SegmentButton";

export default {
  name: "MakeSettings",
  mixins: [DojoWidget, Util],
  props: ["api", "secretKeys", "app", "hash", "databinding", "hints", "variableHints", "variableAndSecretHints", "secretHints", "schema"],
  data() {
    return {
      tab: "input",
      errorMSG: "",
      orgs: [],
      teams: [],
      hooks: [],
      datastructures: [],
      isValidURL: true,
      baseURLs: [],
      inputForm: [],
      inputView: "json",
      inputViews: [
        {
          value: "json",
          label: "JSON"
        },
        {
          value: "form",
          label: "Form"
        },
      ],
    };
  },
  components: {
    Combo: Input,
    DropDownButton,
    TokenInput,
    Ace: () => import(/* webpackChunkName: "ace" */ "vue2-ace-editor"),
    SegmentButton,
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
    changeInputView(v) {
      this.inputView = v;
      if (v === "form") {
        this.generateInputForm();
      } else {
        this.setTemplate();
      }
      this.onChange();
    },
    onChangeBaseURL() {
      this.isValidURL = true;
      let url = this.api.dashboardURL;
      url = url.replace("https://", "");
      const parts = url.split("/");
      this.api.baseURL = parts[0];
      this.api.orgID = Number(parts[2]);
      this.onChange();
      this.loadOrgs();
    },

    setToken(token) {
      this.api.token = token;
      this.onChange();
      this.loadOrgs();
    },
    setTeam(v) {
      this.api.teamID = v;
      this.unsetHook();
      this.onChange();
      this.loadHooks();
      this.loadDataStructures();
      if (this.api.dataStructureId) {
        this.setDataStructure(this.api.dataStructureId);
        this.generateTemplate();
      }
    },
    setOrg(v) {
      this.api.orgID = v;
      this.unsetHook();
      this.onChange();
      this.loadTeam();
    },
    async setDataStructure(v) {
      this.api.dataStructureId = v;
      this.onChange();
      await this.loadDataStructureById(v);
    },
    setHook(v) {
      this.api.hookID = v;
      this.onChange();
      this.loadSelectedHook();
    },
    unsetHook() {
      this.api.hookURL = "";
      this.api.hookID = "";
    },
    onChange() {
      this.$forceUpdate();
      this.$emit("change", this.api, this.databinding);
    },
    setOutput(v) {
      this.databinding.default = v;
      this.onChange();
    },
    setTemplate() {
      // parse variables from the string
      const variables = RestUtil.getVariablesFromString(this.api.template);
      this.api.input = variables.map((v) => {
        return {
          id: v,
          label: v,
          isVar: false,
          type: "Parameter",
          value: "",
        };
      });
      this.onChange();
    },

    onChangeTemplate(id, value) {
      try {
        let tmp = this.api.template;
        if (typeof tmp === "string") {
          tmp = JSON.parse(tmp);
        }
        tmp[id] = value;
        this.api.template = JSON.stringify(tmp, null, 2);
        this.onChange();
        this.setTemplate();
      } catch (e) {
        this.errorMSG = "Invalid JSON format";
        console.error("JSON parse error in onChangeTemplate:", e);
      }
    },

    generateInputForm() {
      let template = JSON.parse(this.api.template);
      this.inputForm = this.inputForm.map((k) => {
        if (template[k.name]) {
          let value = template[k.name];
          k.value = value;
        }
        return {
          ...k,
        };
      });
    },

    // ------- CALLS TO THE NEW ENGINE ------------------

    async loadOrgs() {
      if (!this.api.token || !this.api.baseURL) {
        return;
      }
      try {
        const res = await MakeEngine.getOrganizations(
          this.api.baseURL,
          this.getAuthToken(), // getAuthToken() handles secrets
          this.hash,
          this.app.id
        );
        this.orgs = res.map((o) => ({ value: o.id, label: o.name }));
        // if none is set, pick the first
        if (!this.api.orgID && this.orgs.length > 0) {
          this.api.orgID = this.orgs[0].value;
        }
        this.loadTeam();
      } catch (err) {
        this.logger.error("loadOrgs", err);
        this.errorMSG = "Could not load organizations";
      }
    },

    async loadTeam() {
      if (!this.api.orgID || !this.api.token || !this.api.baseURL) {
        this.logger.log(-1, "loadTeam", "exit > not ready");
        return;
      }
      try {
        const res = await MakeEngine.getTeams(this.api.baseURL, this.api.orgID, this.getAuthToken(), this.hash, this.app.id);
        this.teams = res.map((o) => ({ value: o.id, label: o.name }));
        if (!this.api.teamID && this.teams.length > 0) {
          this.api.teamID = this.teams[0].value;
        }
        this.loadHooks();
        this.loadDataStructures();
      } catch (err) {
        this.logger.error("loadTeam", err);
        this.errorMSG = "Could not load teams";
      }
    },

    async loadHooks() {
      if (!this.api.orgID || !this.api.teamID) {
        return;
      }
      try {
        const res = await MakeEngine.getHooks(this.api.baseURL, this.api.orgID, this.api.teamID, this.getAuthToken(), this.hash, this.app.id);
        this.hooks = res.map((o) => ({ value: o.id, label: o.name }));
      } catch (err) {
        this.logger.error("loadHooks", err);
        this.errorMSG = "Could not load hooks";
      }
    },

    async loadDataStructures() {
      if (!this.api.orgID || !this.api.teamID) {
        return;
      }
      try {
        const res = await MakeEngine.getDataStructures(this.api.baseURL, this.api.teamID, this.getAuthToken(), this.hash, this.app.id);
        this.datastructures = res.map((o) => ({ value: o.id, label: o.name }));
      } catch (err) {
        this.logger.error("loadDataStructures", err);
        this.errorMSG = "Could not load datastructures";
      }
    },

    async loadDataStructureById(id) {
      if (!this.api.orgID || !this.api.teamID) {
        return;
      }
      try {
        const res = await MakeEngine.getDataStructureById(this.api.baseURL, id, this.getAuthToken(), this.hash, this.app.id);
        this.inputForm = res;
        this.onChange();
        this.$emit("success", "Setup complete, you can now edit the input");

        setTimeout(() => {
          this.tab = "input";
        }, 500);
      } catch (err) {
        this.logger.error("loadDataStructureById", err);
        this.errorMSG = "Could not load this data structure";
      }
    },

    async loadSelectedHook() {
      if (!this.api.token || !this.api.hookID) {
        this.logger.log(-1, "loadSelectedHook", "exit > not ready");
        return;
      }
      try {
        const h = await MakeEngine.getHookById(this.api.baseURL, this.api.hookID, this.getAuthToken(), this.hash, this.app.id);
        this.api.hookURL = h.url;
        this.api.scenarioID = h.scenarioId;
        this.onChange();
        this.$emit("success", "Setup complete, you can now edit the input");

        setTimeout(() => {
          this.tab = "input";
        }, 500);
      } catch (err) {
        this.logger.error("loadSelectedHook", err);
        this.errorMSG = "Could not load this hook";
      }
    },

    generateTemplate() {
      let template = {};
      this.inputForm.forEach((i) => {
        template[i.name] = "";
      });
      this.api.template = JSON.stringify(template, null, 2);
    },

    async loadHookScenario() {
      if (!this.api.token || !this.api.scenarioID) {
        this.logger.log(-1, "loadHookScenario", "exit > no ready");
        return;
      }
      try {
        const ds = await MakeEngine.getDataStructures(this.api.baseURL, this.api.teamID, this.getAuthToken(), this.hash, this.app.id);
        // Do something with ds
        console.debug("Data Structures: ", ds);
      } catch (err) {
        this.logger.error("loadHookScenario", err);
        this.errorMSG = "Could not load data structures";
      }
    },

    /**
     * Called on form submission or similar,
     * hits the MakeEngine.runHook() method.
     */
    async run(data) {
      try {
        let response = await MakeEngine.runHook(
          this.api.hookURL, // hookURL
          data, // payload
          this.api.isProxyEnabled, // isProxyEnabled
          this.api.template, // template
          this.getAuthToken(), // token
          this.hash,
          this.app.id
        );
        return response;
      } catch (e) {
        this.logger.error("run()", e);
        return { error: "Something wrong with the data" };
      }
    },

    /**
     * Example of how you might retrieve secrets if the token uses ${secrets...} syntax.
     * Otherwise you can remove or tweak as needed.
     */
    getAuthToken() {
      let authToken = this.api.token;
      if (authToken.indexOf("${secrets") > -1) {
        const secretKey = authToken.slice(10, -1);
        const foundSecret = this.secretKeys.find((s) => s.key === secretKey);
        if (foundSecret) {
          this.logger.log(-1, "getAuthToken", "using user secret", secretKey);
          authToken = foundSecret.value;
        }
      }
      return authToken;
    },

    editorInit() {
      require(/* webpackChunkName: "ace" */ "brace/ext/language_tools");
      require(/* webpackChunkName: "ace" */ "brace/mode/json");
      require(/* webpackChunkName: "ace" */ "brace/theme/chrome");

      let editor = this.$refs.aceEditor.editor;
      editor.setOptions({
        enableBasicAutocompletion: false,
        enableSnippets: false,
        enableLiveAutocompletion: true,
      });

      editor.getSession().on("change", () => {
        this.setTemplate();
      });

      const hints = this.variableHints.map((hint) => ({ name: hint.label, value: hint.value, score: 1, meta: "databinding" }));
      editor.completers.push({
        getCompletions(editor, session, pos, prefix, callback) {
          if (prefix[0] === "$") {
            callback(null, hints);
          }
        },
      });
    },

    getAllAppVariables() {
      // Adjust how you gather variable hints as needed
      return this.variableHints || [];
    },
  },
  async mounted() {
    this.logger = new Logger("MakeSettings");
    const url = await Services.getConfig().proxy_URL;
    this.proxyURL = url + `/proxy`;

    if (this.api && !this.api.template) {
      this.api.template = "{}";
    }
    if (this.api && !this.api.input) {
      this.api.input = [];
    }
    if (this.api.baseURL && this.api.token) {
      await this.loadOrgs();
    }
    if (this.api?.dataStructureId) {
      this.inputView = "form";
      await this.setDataStructure(this.api.dataStructureId);
    }
    if (this.api && this.api.template) {
      this.setTemplate();
      this.generateInputForm();
    }

    // If we don't yet have a hookURL, show the setup tab, else show input
    if (!this.api.hookURL) {
      this.tab = "setup";
    } else {
      this.tab = "input";
    }
  },
};
</script>
