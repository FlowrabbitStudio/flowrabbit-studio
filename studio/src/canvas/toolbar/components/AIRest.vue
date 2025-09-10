<template>
  <div
    class="MatcToolbarRestSettings MatcToolbarTemplateRestSettings MatcDialogContainer"
  >
    <div class="MatcDialogContent">
      <div class="MatcDialogContentHeader">
        <label>{{ title }}</label>
      </div>
      <div class="MatcToolbarTabs MatcToolbarTabsBig">
        <div>
          <a
            @click="selectTab('data')"
            :class="{ MatcToolbarTabActive: tab === 'data' }"
            >Input</a
          >
          <a
            @click="selectTab('output')"
            :class="{ MatcToolbarTabActive: tab === 'output' }"
            >Output</a
          >
          <a
            v-if="aiModel?.type !== 'flowrabbit'"
            @click="selectTab('auth')"
            :class="{ MatcToolbarTabActive: tab === 'auth' }"
          >
            Authorization
          </a>
          <a
            @click="selectTab('advanced')"
            :class="{ MatcToolbarTabActive: tab === 'advanced' }"
            v-if="aiModel && aiModel.advanced"
          >
            Advanced
          </a>
        </div>
      </div>
      <div class="MatcMarginTop">
        <div
          v-show="tab === 'data'"
          class="MatcToolbarRestSettingsElementCntr p-2"
        >
          <AIRestDataTab
            :key="`data-tab-${key}`"
            :aiModel="aiModel"
            :databingValues="databingValues"
            :hash="hash"
            :hints="hints"
            :model="model"
            :rest="rest"
            :template="template"
            :variableAndSecretHints="variableAndSecretHints"
            :variableAndSecretHintsList="variableAndSecretHintsList"
            @onChangeDataBindingValues="onChangeDataBindingValues"
            @modelChange="onModelChange"
            @changeBrand="onChangeBrand"
            @elementChange="onTemplateElementChange"
            @onChangeInputVar="onChangeInputVar"
            @isVarCombo="isVarCombo"
            @onChangeIsCombo="onChangeIsCombo"
          />
        </div>
        <div
          v-show="tab === 'auth' && aiModel?.type !== 'flowrabbit'"
          class="MatcToolbarRestSettingsElementCntr p-2"
        >
          <AIRestAuthTab
            @setRestToken="setRestToken"
            @setIsFlowrabbitSecret="setIsFlowrabbitSecret"
            :rest="rest"
            :org="selectedOrg"
            :aiModel="aiModel"
            :secretHints="secretHints"
            :disableFlowrabbit="aiModel.disableFlowrabbit"
            :model="model"
          />
        </div>
        <div v-show="tab === 'output'">
          <AIRestOutputTab
            :aiModel="aiModel"
            :formatType="formatType"
            :hints="hints"
            :rest="rest"
            :template="template"
            @changeOutputVar="onChangeOutputVar"
            @changeFormatType="onChangeFormatTypeVar"
            @changeStream="onChangeStream"
            @changeLoadingVar="onChangeLoadingVar"
            @changeErrorVar="onChangeErrorVar"
          />
        </div>
        <div v-show="tab === 'advanced'">
          <AIRestAdvancedTab
            :key="`advanced-tab-${key}`"
            :aiModel="aiModel"
            :databingValues="databingValues"
            :hash="hash"
            :rest="rest"
            :variableAndSecretHintsList="variableAndSecretHintsList"
            :variableAndSecretHints="variableAndSecretHints"
            @elementChange="onTemplateElementChange"
            @isVarCombo="isVarCombo"
            @onChangeIsCombo="onChangeIsCombo"
          />
        </div>
      </div>
    </div>
    <div v-if="hasTest">
      <AIRestTestSection
        :aiModel="aiModel"
        :audioUrl="audioUrl"
        :dataBindingKeys="dataBindingKeys"
        :databingValues="databingValues"
        :formatType="formatType"
        :loadingResult="loadingResult"
        :template="template"
        :testError="testError"
        :testResult="testResult"
        :testtab="testtab"
        :organizations="organizations"
        :rest="rest"
        :hash="hash"
        :model="model"
        @fileChange="onFileChange"
        @onDataBingingFileChange="onDataBingingFileChange"
        @handleError="handleError"
        @run="run"
        @onChangeDataBindingValues="onChangeDataBindingValues"
        @onChangeAudioUrl="onChangeAudioUrl"
      />
    </div>
  </div>
</template>
<style lang="scss">
@import "../../../style/components/dialog.scss";
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import Util from "core/Util";
import lang from "dojo/_base/lang";
import Logger from "common/Logger";
import JSONPath from "../../../core/JSONPath";
import _Tooltip from "common/_Tooltip";
import AIModelsUtil from "../../../util/aimodels/AIModelsUtil";
import RestEngine from "core/RestEngine";
import StreamEngine from "core/StreamEngine";
import Services from "services/Services";
import RestUtil from "src/util/RestUtil";
import AIRestDataTab from "./AIRestDataTab.vue";
import AIRestAuthTab from "./AIRestAuthTab.vue";
import AIRestOutputTab from "./AIRestOutputTab.vue";
import AIRestAdvancedTab from "./AIRestAdvancedTab.vue";
import AIRestTestSection from "./AIRestTestSection.vue";
import AudioEngine from "../../../core/AudioEngine";
import VideoEngine from "../../../core/VideoEngine";

export default {
  name: "AIRest",
  mixins: [DojoWidget, Util, _Tooltip],
  props: ["app", "user", "value"],
  data: function () {
    return {
      wizardComponent: "",
      tab: "data",
      testtab: "params",
      hasOutputPath: true,
      secretKeys: [],
      hasFileUpload: false,
      checkBoxChecked: false,
      model: {
        widgets: {},
      },
      template: {},
      widget: null,
      hash: "",
      rest: {
        method: "GET",
        url: "",
        token: "",
        authType: "",
        input: {
          type: "JSON",
          template: "",
        },
        output: {
          databinding: "",
          template: "",
          hints: {},
        },
        headers: [],
        isFlowrabbitSecret: true,
        combos: {},
        dependentSelections: {},
      },
      databingValues: {},
      testResult: "",
      testError: "",
      runSuccess: false,
      isDirty: false,
      uploadedFile: null,
      hasTest: true,
      aiModel: {},
      aiModels: [],
      loadingResult: false,
      audioUrl: "",
      error: false,
      errorMessage: "",
      formatType: "Text",
      organizations: [],
      enableAnalytics: false,
      key: 0,
      selectedOrg:{}
    };
  },
  components: {
    AIRestDataTab,
    AIRestAuthTab,
    AIRestOutputTab,
    AIRestAdvancedTab,
    AIRestTestSection,
  },
  computed: {
    title() {
      const type = AIModelsUtil.aiTypesOptions[this.template.type];
      if (type && type.label) return type.label;
      return "AI Rest";
    },
    extractDatabindingValues() {
      return RestUtil.extractDatabindingValues(
        this.rest && this.rest.input.template
      );
    },
    allModelItems() {
      if (!this.aiModel) return [];
      return [
        ...(this.aiModel.elements || []),
        ...(this.aiModel.advanced || []),
      ];
    },
    buttons() {
      return this.$attrs.buttons;
    },
    dataBindingKeys() {
      let values = RestEngine.getNeededDataBingsAI(this.rest, this.aiModel);
      return values;
    },
    testResultImage() {
      var base64Flag = "data:image/jpeg;base64,";
      var imageStr = this.arrayBufferToBase64(this.testResult);
      return base64Flag + imageStr;
    },
    variableAndSecretHintsList() {
      return this.variableAndSecretHints.map((i) => i.value);
    },
    secretHints() {
      if (this.secretKeys) {
        const secrets = this.secretKeys.map((e) => {
          const v = "${secrets." + e.key + "}";
          return {
            label: e.key,
            value: v,
            icon: "mdi mdi-key",
          };
        });
        return secrets;
      }
      return [];
    },
    variableAndSecretHints() {
      const hints = this.getAllAppVariables();
      const result = hints.map((h) => {
        const v = "${" + h + "}";
        return {
          label: v,
          value: v,
        };
      });
      if (this.secretKeys) {
        this.secretKeys.forEach((e) => {
          const v = "${secrets." + e.key + "}";
          result.push({
            label: v,
            value: v,
          });
        });
      }
      return result;
    },
    variableHints() {
      const hints = this.getAllAppVariables();
      return hints.map((h) => {
        const v = "${" + h + "}";
        return {
          label: v,
          value: v,
        };
      });
    },
    hints() {
      let hints = this.getAllAppVariables();
      return hints.map((h) => {
        return {
          label: h,
          value: h,
        };
      });
    },
  },
  methods: {
    onChangeAudioUrl(audioUrl) {
      this.audioUrl = audioUrl;
    },
    setIsFlowrabbitSecret(event) {
      this.$set(this.rest, "isFlowrabbitSecret", event);
    },
    onChangeDataBindingValues({ key, value }) {
      this.$set(this.databingValues, key, value);
    },
    onChangeDataBinding(event, item) {
      let result = [];
      RestUtil.parseString(item.value, result);
      this.$set(this.databingValues, result[0], event);
    },
    selectTab(tabname) {
      this.tab = tabname;
    },
    setSecretKeys(s) {
      this.secretKeys = s;
    },
    setRestToken(t) {
      this.logger.log(-1, "setRestToken", "enter" + t);
      this.rest.token = t;
      this.template.rest.token = t;
      this.$emit("change", this.getValue(), this.template);
    },

    onDataBingingFileChange({ key, file }) {
      this.$set(this.databingValues, key, file);
    },
    onFileChange(file) {
      this.uploadedFile = file;
      this.databingValues = {};
      this.databingValues[this.rest.input.fileDataBinding] = file;
    },
    arrayBufferToBase64(buffer) {
      let binary = "";
      const bytes = [].slice.call(new Uint8Array(buffer));
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      return window.btoa(binary);
    },
    updateTemplateValues(aiModelId) {
      this.logger.log(-4, "updateTemplateValues", "enter");
      if (this.template.type) {
        const type = this.template.type;
        const models = AIModelsUtil[type].models;
        this.template.models = models;
        if (aiModelId) {
          this.aiModel = this.getModelFromValue(aiModelId);
          this.rest.modelId = aiModelId;
          this.setRestVars();
        } else {
          this.aiModel = this.getModelFromValue(models[0].id);
          this.setTemplateVars();
        }
        this.rest.modelType = this.template.type;
        this.updateRestModel();
      }
      this.$nextTick(() => {
        const type = this.template.type;
        const models = AIModelsUtil[type].models;
        models.forEach((e) => {
          const id = this.getDataID(e.id)
          const selector = `[data-id=${id}]`;
          const element = this.$el.querySelector(selector);
          if (element && e.tooltip) {
            this.addTooltip(element, e.tooltip);
          }
        });
      });
    },
    getDataID(id) {
      return id.replace(/\./g, '_');
    },
    setRestVars() {
      if (this.aiModel.elements) {
        this.aiModel.elements.forEach((e) => {
          this.setRestVar(e);
        });
      }
      if (this.aiModel.advanced) {
        this.aiModel.advanced.forEach((e) => {
          this.setRestVar(e);
        });
      }
      if (this.rest.vars.json) {
        this.formatType = "JSON";
      }
      if (this.rest.output.formatType) {
        this.formatType = this.rest.output.formatType;
      }
    },
    setRestVar(e) {
      if (e.type === "flex") {
        e.content.forEach((c) => {
          c.value = this.rest.vars[c.id];
        });
      } else if (e.type === "DependentGroup") {
        e.items.forEach((c) => {
          c.value = this.rest.vars[c.id];
        });
      } else {
        e.value = this.rest.vars[e.id];
      }
    },
    setTemplateVars() {
      if (this.aiModel.elements) {
        this.aiModel.elements.forEach((e) => {
          this.setTemplateVar(e);
        });
      }
      if (this.aiModel.advanced) {
        this.aiModel.advanced.forEach((e) => {
          this.setTemplateVar(e);
        });
      }
      this.rest.url = this.aiModel.url;
      this.rest.headers = this.aiModel.headers;
      this.rest.input.template = JSON.stringify(this.aiModel.template);
      if (this.aiModel.input && this.aiModel.input.type) {
        this.rest.input.type = this.aiModel.input.type;
      }
      if (this.aiModel.output && this.aiModel.output.path) {
        this.rest.output.path = this.aiModel.output.path;
      }
      if (this.aiModel.output && this.aiModel.output.streampath) {
        this.rest.output.streampath = this.aiModel.output.streampath;
      }
      if (this.aiModel.output && this.aiModel.output.metricspath) {
        this.rest.output.metricspath = this.aiModel.output.metricspath;
      }
      this.rest.output.type = this.aiModel.output.type || "JSON";
      this.rest.output.formatType = this.aiModel.output.formatType || "Text";
    },
    setTemplateVar(e) {
      if (e.type === "flex") {
        e.content.forEach((c) => {
          if (c.required) {
            this.rest.vars[c.id] = c.default;
          }
        });
      } else {
        if (e.required) {
          this.rest.vars[e.id] = e.default;
        }
      }
    },
    getModelFromValue(value) {
      const val = this.template.models.find((f) => f.id === value);
      return val;
    },
    async setWidget(w) {
      this.logger.log(-4, "setWidget", "enter");
      this.widget = w;
      if (w.props && w.props.rest) {
        this.rest = lang.clone(w.props.rest);
        if (!this.rest.vars) {
          this.rest.vars = {};
        }
        this.template = lang.clone(w.props.template);
        this.updateTemplateValues(w.props.aiModelId);

        if (!this.rest.output.databinding) {
          this.logger.log(-1, "setWidget", "Set name as output");
          this.rest.output.databinding = this.widget.name;
        }
        if (!this.rest.headers) {
          this.logger.log(-1, "setWidget", "Set headers");
          this.$set(this.rest, "headers", []);
        }
        const orgs = await Services.getOrgService().findUserOrganizations(
          this.user.id
        );
        if (!this.rest.dependentSelections) {
          this.rest.dependentSelections = {};
        }
        this.organizations = orgs.map((o) => {
          return {
            value: o.id ? o.id : o._id,
            label: o.name,
            domain: o.domain,
            apiCalls: o.apiCalls,
          };
        });
      }
    },
    editorInit() {
      require(/* webpackChunkName: "ace" */ "brace/ext/language_tools"); //language extension prerequsite...
      require(/* webpackChunkName: "ace" */ "brace/mode/json");
      require(/* webpackChunkName: "ace" */ "brace/theme/chrome");

      let editor = this.$refs.aceEditor.editor;
      editor.setOptions({
        enableBasicAutocompletion: false,
        enableSnippets: false,
        enableLiveAutocompletion: true,
      });

      let vars = this.getAllAppVariables();
      editor.completers.push({
        getCompletions(editor, session, pos, prefix, callback) {
          if (prefix.indexOf("$") === 0) {
            let result = vars.map((v) => {
              return {
                name: v,
                value: "${" + v + "}",
                score: 1,
                meta: "databinding",
              };
            });
            callback(null, result);
          }
        },
      });
    },
    setModel(m) {
      this.model = m;
    },
    setSchema(schema) {
      this.schema = schema;
    },
    setHash(h) {
      this.hash = h;
    },
    saveIntegrations() {
      if (this.model && this.model.id) {
        Services.getModelService()
          .findApp(this.model.id)
          .then((app) => {
            let integrations = this.model.integrations
              ? JSON.parse(this.model.integrations)
              : [];

            const existingIntegration = integrations.find(
              (integration) => integration.id === this.aiModel.id
            );

            if (!existingIntegration) {
              integrations.push({
                id: this.aiModel.id,
                name: this.aiModel.name,
              });
            }

            Services.getModelService()
              .updateAppProps(app.id, {
                integrations: JSON.stringify(integrations),
              })
              .then((result) => console.og(result));
          });
      }
    },
    getValue() {
      if (this.rest.type === "azure") {
        this.rest.url = this.aiModel.url
          .replace("{{deployment}}", this.rest.vars["deployment"])
          .replace("{{resource}}", this.rest.vars["resource"])
          .replace("{{apiversion}}", this.rest.vars["apiversion"]);
      }
      return this.rest;
    },
    getAIModelId() {
      return this.aiModel.id;
    },
    onModelChange(value) {
      this.logger.log(5, "onModelChange", "enter");
      this.key++;
      const selectedModel = this.template.models.find((m) => value === m.id);
      this.$set(this, "aiModel", selectedModel);
      this.$set(this.rest, "vars", {});
      this.setTemplateVars();
      this.rest.modelId = value;
      this.updateRestModel();
      this.$nextTick(() => {
        this.$forceUpdate();
      });
      this.logger.log(
        -5,
        "onModelChange",
        "exit",
        JSON.stringify(this.rest, null, 2)
      );
    },
    onChangeBrand() {
      this.$set(this, "aiModel", {});
    },
    updateAuthParam() {
      if (this.aiModel && this.aiModel.type === "flowrabbit") {
        this.rest["token"] = "${secrets.flowrabbit}";
      } else if (this.rest["token"] === "${secrets.flowrabbit}") {
        this.rest["token"] = "";
      }
    },
    updateRestModel() {
      this.rest.aiModelId = this.aiModel.id;
      this.rest.method = this.aiModel.method;
      this.rest.secondjobcall = this.aiModel.secondjobcall;
      this.rest.type = this.aiModel.type;
      this.rest.authType = this.aiModel.authType;
      this.rest.authHeader = this.aiModel.authHeader;
      this.rest.output.path = this.aiModel.output.path;
      if (this.rest.isFlowrabbitSecret === undefined && !this.aiModel.disableFlowrabbit) {
        this.rest.isFlowrabbitSecret = true;
      }
      const template = this.aiModel.getTemplate(
        this.rest.vars,
        this.rest.input.fileDataBinding
      );
      this.rest.output.maxTokens =
        this.aiModel.getMaxTokens && this.aiModel.getMaxTokens(this.rest.vars);
      try {
        this.rest.input.template = JSON.stringify(template);
      } catch (e) {
        this.logger.error("updateRest", "Could not parse", e);
      }
    },
    onTemplateElementChange(element, event) {
      let value = event;
      if (event && event.target) {
        const target = event.target;
        value = target.value;
      }
      this.rest.vars[element.id] = value;
      element.value = value;
      this.onChange();
    },
    onChangeIsCombo(item, value) {
      if (!this.rest.combos) {
        this.$set(this.rest, "combos", {}); // Ensure reactivity for new object
      }
      this.$set(this.rest.combos, item.id, value); // Reactive update
      this.onChange();
    },
    isVarCombo(element) {
      return this.rest.combos && this.rest.combos[element.id] !== undefined
        ? this.rest.combos[element.id]
        : false;
    },
    onChangeStream(value) {
      this.rest.vars["stream"] = value;
      this.onChange();
    },
    updateRest() {
      this.logger.log(4, "updateRest", "enter");
      if (this.aiModel) {
        const template = this.aiModel.getTemplate(
          this.rest.vars,
          this.rest.input.fileDataBinding
        );
        try {
          this.rest.input.template = JSON.stringify(template);
        } catch (e) {
          this.logger.error("updateRest", "Could not parse", e);
        }
      }
    },
    replacePattern(s, pattern, value) {
      let i = 0;
      while (s.indexOf(pattern) >= 0 && i < 100) {
        s = s.replace(pattern, value);
        i++;
      }
      return s;
    },

    onChangeFileDataBinging(value) {
      this.$set(this.rest.input, "fileDataBinding", value);
      this.onChange();
    },
    onChangeOutputVar(value) {
      this.rest.output.databinding = value;
      this.onChange();
    },
    onChangeLoadingVar(value) {
      this.rest.output.loading = value;
      this.onChange();
    },
    onChangeErrorVar(value) {
      this.rest.output.error = value;
      this.onChange();
    },
    onChangeInputVar(value) {
      this.rest.input.fileDataBinding = value;
      this.onChange();
    },
    onChangeOutputPath(value) {
      this.rest.output.path = value;
      this.onChange();
    },
    onChangeFormatTypeVar(value) {
      this.rest.output.formatType = value;
      this.formatType = value;
      this.rest.vars["json"] = value === "JSON";
      if (value !== "Text") this.rest.vars["stream"] = false;
      this.onChange();
    },
    onChange() {
      this.updateRest();
      this.$nextTick(() => {
        this.isDirty = true;
        this.$emit("change", this.getValue(), this.template);
      });
    },
    hasRun() {
      if (this.isDirty) {
        if (!this.runSuccess) {
          this.testError = "Please test before saving!";
        }
        return this.runSuccess;
      }
      return true;
    },
    validate() {
      let url = this.rest.url;
      let template = this.rest.input.template;
      let prefix = this.rest.output.databinding;

      if (!prefix) {
        this.testError = `Field required: The output data binding is empty`;
        this.tab = "output";
        return false;
      }

      if (!this.aiModel || !this.aiModel.id) {
        this.testError = `Field required: Select one brand and AI model from the list`;
        this.tab = "data";
        return false;
      }

      if (
        this.aiModel &&
        this.aiModel.type !== "flowrabbit" &&
        !this.rest.token &&
        !this.rest.isFlowrabbitSecret
      ) {
        this.testError = `Field required: the authentication token is required`;
        this.tab = "data";
        return false;
      }

      // check all required fields from the aiModel are filled in the vars
      if (this.aiModel) {
        const elements = this.aiModel.elements;
        const advanced = this.aiModel.advanced;
        const vars = this.rest.vars;
        let valid = true;
        if (elements && elements.length > 0) {
          elements.forEach((e) => {
            if (
              e.required &&
              (!vars || vars[e.id] === undefined || vars[e.id].length === 0)
            ) {
              this.testError = `Field required: the ${e.label} is required`;
              this.tab = "data";
              valid = false;
              return;
            }
          });
        }

        if (advanced && advanced.length > 0) {
          advanced.forEach((e) => {
            if (
              e.required &&
              (!vars || vars[e.id] === undefined || vars[e.id].length === 0)
            ) {
              this.testError = `Field required: the ${e.label} is required`;
              this.tab = "data";
              valid = false;
              return;
            }
          });
        }
        return valid;
      }

      const values = this.getAllAppVariables();
      values.forEach((key) => {
        url = this.replaceAll(url, key, '"v:' + key + '"');
        template = this.replaceAll(template, key, '"v:' + key + '"');
      });

      if (this.$refs.dbInputs) {
        let oneIsEmpty = false;
        this.$refs.dbInputs.forEach((i) => {
          if (!i.value) {
            oneIsEmpty = true;
          }
        });
        if (oneIsEmpty) {
          this.testError = `Please provide some input data`;
          this.testtab = "params";
          return false;
        }
      }

      if (this.rest.input.type === "IMAGE") {
        if (!this.rest.input.fileDataBinding) {
          this.testError = `Please  provide a input data binding`;
          this.tab = "input";
          return false;
        }
        if (!this.uploadedFile) {
          this.testError = `Please select a file`;
          this.testtab = "params";
          return false;
        }
      }

      if (this.rest.type === "azure") {
        if (
          !this.rest.vars["deployment"] ||
          !this.rest.vars["resource"] ||
          !this.rest.vars["apiversion"]
        ) {
          this.testError = `Please complete all the required fields: deployment, resource and api version.`;
          this.testtab = "params";
          return false;
        } else {
          this.rest.url = this.rest.url
            .replace("{{deployment}}", this.rest.vars["deployment"])
            .replace("{{resource}}", this.rest.vars["resource"])
            .replace("{{apiversion}}", this.rest.vars["apiversion"]);
        }
      }

      return true;
    },
    replaceAll(s, key, value) {
      let pattern = "${" + key + "}";
      let i = 0;
      while (s.indexOf(pattern) >= 0 && i < 100) {
        s = s.replace(pattern, value);
        i++;
      }
      return s;
    },
    buildHints(object) {
      let prefix = this.rest.output.databinding;
      this.rest.output.hints = RestUtil.buildHints(prefix, object);
      /**
       * FIXME: call here onChange will fuckup the rest.vars...
       */
      this.$emit("change", this.getValue(), this.template);
    },

    onImgFileChange(file) {
      this.uploadedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedFileURL = e.target.result;

        this.databingValues[this.rest.input.fileDataBinding] =
          this.uploadedFileURL;
      };
      reader.readAsDataURL(file);
    },
    async run() {
      this.testResult = undefined;
      this.testError = "";
      this.testtab = "result";
      this.loadingResult = true;
      if (!this.validate()) {
        this.loadingResult = false;
        return;
      }
      try {
        let rs = this.rest;
        const userToken = Services.getUserService().getToken();
        this.rest.userToken = userToken;
        if (this.formatType === "JSON") {
          this.processPromptJSON();
        }
        if (this.rest.type === "azure") {
          this.rest.url = this.aiModel.url
            .replace("{{deployment}}", this.rest.vars["deployment"])
            .replace("{{resource}}", this.rest.vars["resource"])
            .replace("{{apiversion}}", this.rest.vars["apiversion"]);
        }
        if (this.template.type === "video") {
          this.rest.aimodel = this.aiModel.modelId;
          this.testResult = await VideoEngine.processVideoRequest(
            this.rest,
            this.databingValues,
            this.hash,
            this.model.id
          );

          if (this.aiModel.output.path) {
            this.testResult = JSONPath.get(
              this.testResult,
              this.aiModel.output.path
            );
          }
        } else if (this.rest.input.type === "IMAGE") {
          this.rest.quantity =
            this.aiModel.getQuantity &&
            this.aiModel.getQuantity(this.rest.vars);
          const formData = new FormData();
          formData.append(this.rest.input.fileDataBinding, this.uploadedFile);
          Object.keys(this.databingValues).forEach((key) => {
            if (key !== this.rest.input.fileDataBinding) {
              formData.append(key, this.databingValues[key]);
            }
          });

          this.testResult = await RestEngine.run(
            rs,
            formData,
            this.hash,
            this.model.id,
            true,
            this.enableAnalytics
          );
        } else if (this.rest.input.type === "AUDIO") {
          const config = {
            audio: this.audioUrl,
            ...this.rest,
          };
          const result = await AudioEngine.transcribeAudio(
            config,
            this.databingValues,
            this.hash,
            this.model.id,
            true,
            this.enableAnalytics
          );
          this.testResult = result;
        } else if (this.aiModel.secondjobcall) {
          let firstResult = await RestEngine.run(
            this.rest,
            this.databingValues,
            this.hash,
            this.model.id,
            true,
            true
          );
          const req = this.aiModel.secondjobcall;
          req.token = this.rest.token;
          req.isFlowrabbitSecret = this.rest.isFlowrabbitSecret;
          req.aiModelId = this.rest.aiModelId;
          req.modelType = this.rest.modelType;
          req.disableCredits = true;
          this.testResult = await RestEngine.runAPILoop(
            firstResult,
            req,
            this.databingValues,
            this.hash,
            this.model.id,
            this.aiModel.type,
            true,
            this.enableAnalytics
          );
        } else if (this.rest.vars.stream) {
          const stream = await StreamEngine.runAndProcessStream(
            this.rest,
            this.databingValues,
            this.hash,
            this.model.id,
            this.aiModel.type,
            true,
            this.enableAnalytics
          );
          if (this.aiModel.output.streampath) {
            this.loadingResult = false;
            await this.processStream(stream, this.aiModel.output.streampath);
          }
        } else {
          this.testResult = await RestEngine.run(
            this.rest,
            this.databingValues,
            this.hash,
            this.model.id,
            true,
            this.enableAnalytics
          );
          if (this.aiModel.output.path) {
            this.testResult = JSONPath.get(
              this.testResult,
              this.aiModel.output.path
            );
          }
          if (this.formatType === "JSON") {
            try {
              this.testResult = JSON.parse(this.testResult);
            } catch (e) {
              this.runSuccess = false;
              this.testError = "The result is not json";
            }
          }
          if (this.aiModel.output.type === "JSON") {
            try {
              this.buildHints(this.testResult);
              //this.testResult = JSON.stringify(this.testResult, null, 2)
            } catch (e) {
              this.runSuccess = false;
              this.testError = "The result is not json";
            }
          }
        }
      } catch (e) {
        this.runSuccess = false;
        if (e.message.indexOf("Unauthorized") !== -1) {
          this.testError = `Error: the Authentication Key for the model ${this.aiModel.name} is no valid`;
        } else {
          this.testError = `Error: ${e.message}`;
        }
      } finally {
        this.loadingResult = false;
      }
    },
    async processStream(stream) {
      const reader = stream.getReader();
      this.testResult = "";
      for (;;) {
        // A common idiom for a loop that reads until done
        const { done, value } = await reader.read();
        if (done) break;

        if (value && typeof value === "string") {
          this.testResult += value || "";
        } else {
          console.error("Unexpected value type:", value);
          throw new Error(
            "Stream value is not of type ArrayBuffer or ArrayBufferView"
          );
        }
      }
    },
    processPromptJSON() {
      let jsonPrompt = "";
      if (this.rest.output.formatJSON) {
        jsonPrompt += `. The JSON formatting must be like this one: ${this.rest.output.formatJSON}. `;
      }
      const prompt = this.rest.vars.prompt + jsonPrompt;
      const template = this.aiModel.getTemplate(
        {
          ...this.rest.vars,
          prompt: prompt,
        },
        this.rest.input.fileDataBinding
      );
      try {
        this.rest.input.template = JSON.stringify(template);
      } catch (e) {
        this.logger.error("updateRest", "Could not parse", e);
      }
    },

    handleError(message) {
      this.error = true;
      this.errorMessage = message;
    },
    resetAllVariables() {
      this.key = 0;
      this.wizardComponent = "";
      this.tab = "data";
      this.testtab = "params";
      this.hasOutputPath = true;
      this.secretKeys = [];
      this.hasFileUpload = false;
      this.checkBoxChecked = false;
      this.model = { widgets: {} };
      this.template = {};
      this.widget = null;
      this.hash = "";
      this.rest = {
        method: "GET",
        url: "",
        token: "",
        authType: "",
        input: {
          type: "JSON",
          template: "",
        },
        output: {
          databinding: "",
          template: "",
          hints: {},
        },
        headers: [],
      };
      this.databingValues = {};
      this.testResult = "";
      this.testError = "";
      this.runSuccess = false;
      this.isDirty = false;
      this.uploadedFile = null;
      this.hasTest = true;
      this.aiModel = {};
      this.aiModels = [];
      this.loadingResult = false;
      this.audioUrl = "";
      this.error = false;
      this.errorMessage = "";
      this.formatType = "Text";
      this.organizations = [];
      this.enableAnalytics = false;
    },
  },
  watch: {
    value(v) {
      this.setWidget(v);
    },
    aiModel: {
      handler(newModel, oldModel) {
        if (newModel && newModel.id && newModel.id !== oldModel.id) {
          this.updateTemplateValues(newModel.id);
        }
      },
      deep: true,
    },
    tab: {
      handler(newTab) {
        if (newTab === "data") {
          this.$nextTick(() => this.$refs.dataTabComponent?.update());
        }
      },
    },
    databingValues: {
      handler(newValue) {
        // Emit only when values actually change
        if (
          JSON.stringify(newValue) !==
          JSON.stringify(this.previousDatabingValues)
        ) {
          this.$emit("onChangeDataBindingValues", newValue);
          this.previousDatabingValues = { ...newValue };
        }
      },
      deep: true,
    },
  },
  destroyed() {
    this.resetAllVariables();
  },
  mounted() {
    this.logger = new Logger("AIRest");

    if (this.app) {
      this.setModel(this.app);
    }
    if (this.org) {
      this.selectedOrg = this.org
    }
    if (this.value) {
      this.setWidget(this.value);
    }
    if (this.$refs.tooltipOutputVarIcon) {
      this.addTooltip(
        this.$refs.tooltipOutputVarIcon,
        "The variable to store the result"
      );
    }
    if (this.$refs.tooltipLoadingVarIcon) {
      this.addTooltip(
        this.$refs.tooltipLoadingVarIcon,
        "The variable to store a loading variable. Is set to true when the request is in progress. Is set to false when the request finish"
      );
    }
    if (this.$refs.tooltipErrorVarIcon) {
      this.addTooltip(
        this.$refs.tooltipErrorVarIcon,
        "The variable to store the error result in case the request fails"
      );
    }
    if (this.$refs.tooltipOutputPathIcon) {
      this.addTooltip(
        this.$refs.tooltipOutputPathIcon,
        "The path of the result to store in the variable"
      );
    }
    if (this.$refs.tooltipAuthToken) {
      this.addTooltip(
        this.$refs.tooltipAuthToken,
        'To add a new secret token, go to the app options in the top bar menu, click on "Secret Vars" and add a new secret variable. Click on save and then this new variable will be shown here. All secret variables are safely secured, using high security standards.'
      );
    }
  },
};
</script>
