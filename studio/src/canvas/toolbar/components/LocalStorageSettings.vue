<template>
  <div
    class="MatcToolbarRestSettings MatcToolbarTemplateRestSettings MatcDialogContainer"
  >
    <div class="MatcDialogContent">
      <div class="MatcDialogContentHeader">
        <label>Local Storage</label>
      </div>
      <div class="MatcMarginTop">
        <div class="form-group">
          <label
            >Action
            <span class="MatcToolbarItemIcon">
              <span class="mdi mdi-help-circle-outline"></span>
            </span>
          </label>
          <DropDownButton
            :value="rest.action"
            :options="actions"
            @change="onChangeAction"
            placeholder="Store or retrieve data"
          />
        </div>
        <div v-if="rest.action === 'SET'">
          <label
            >Input Variable
            <span class="MatcHelpIcon" ref="tooltipPromptIcon">
              <span class="mdi mdi-help-circle" />
            </span>
          </label>
          <div class="form-group">
            <Combo
              :value="rest.input.databinding"
              @change="onChangeInputVar"
              :hints="hints"
              :fireOnBlur="true"
              :formControl="true"
              :isDropDown="true"
              placeholder="Name of input variable"
            />
          </div>
        </div>
        <div v-if="rest.action === 'GET'">
          <div class="form-group">
            <label
              >Output Variable
              <span class="MatcHelpIcon" ref="tooltipOutputVarIcon">
                <span class="mdi mdi-help-circle" />
              </span>
            </label>
            <Combo
              :value="rest.output.databinding"
              @change="onChangeOutputVar"
              :hints="hints"
              :fireOnBlur="true"
              :formControl="true"
              :isDropDown="true"
              placeholder="Name of output variable"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="MatcDialogTest">
      <div class="MatcDialogTestHeader">
        <label class="MatcDialogTestHeaderLabel">Test</label>
        <a class="MatcDialogTestButton" @click="run">Run Test</a>
      </div>
      <div class="MatcToolbarTabs MatcToolbarTabsBig">
        <a
          @click="testtab = 'params'"
          :class="{ MatcToolbarTabActive: testtab === 'params' }"
          >Test Parameters</a
        >
        <a
          @click="testtab = 'result'"
          :class="{ MatcToolbarTabActive: testtab === 'result' }"
          >Results</a
        >
      </div>
      <div v-show="testtab === 'params'" class="MatcMarginTop">
        <div
          class="MatcToolbarRestDataBindingRow"
          v-for="key in dataBindingKeys"
          :key="key"
        >
          <textarea
            value="valuestr"
            placeholder="Insert the content of the file"
            @change="onValueChange({}, $event)"
            class="MatcIgnoreOnKeyPress form-control MatcAutoCompleteTextareaXXS"
          ></textarea>
        </div>
        <div
          class="ParamsDataBindingContent"
          v-if="dataBindingKeys.length == 0"
        >
          You are not using data bindings. No need to specify any data.
        </div>
      </div>
      <div v-show="testtab === 'result'">
        <div v-show="loadingResult" class="spinner-container">
          <div class="spinner"></div>
        </div>
        <div
          v-show="testError && testError.length > 0"
          class="MatcMarginTop MatcError"
        >
          {{ testError }}
        </div>
        <pre
          v-show="testResult"
          :class="[
            'MatcToolbarJSONRestDataBindingCntr MatcMarginBottom',
            { MatcError: testError },
          ]"
        >
            <JSONVisualizer :jsonData="testResult" :init="true"></JSONVisualizer>
        </pre>
      </div>
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
import Input from "common/Input";
import _Tooltip from "common/_Tooltip";
import DropDownButton from "page/DropDownButton";
import RestUtil from "../../../core/RestUtil";
import JSONVisualizer from "./JSONVisualizer.vue";

export default {
  name: "LocalStorage",
  mixins: [DojoWidget, Util, _Tooltip],
  props: ["app", "value"],
  data: function () {
    return {
      wizardComponent: "",
      testtab: "params",
      hasOutputPath: true,
      secretKeys: [],
      checkBoxChecked: false,
      model: {
        widgets: {},
      },
      template: {},
      widget: null,
      databingValues: {},
      testResult: "",
      testError: "",
      runSuccess: false,
      isDirty: false,
      hasTest: true,
      loadingResult: false,
      valuestr: "",
      rest: {
        input: {
          databinding: "",
        },
        output: {
          databinding: "",
        },
        action: "GET",
      },
      actions: [
        {
          value: "GET",
          label: "GET",
        },
        {
          value: "SET",
          label: "SET",
        },
      ],
    };
  },
  components: {
    DropDownButton: DropDownButton,
    Combo: Input,
    JSONVisualizer: JSONVisualizer
  },
  computed: {
    buttons() {
      return this.$attrs.buttons;
    },
    dataBindingKeys() {
      let values = {};
      if (this.rest.input.databinding) {
        values[this.rest.input.databinding] = "";
      }
      return values;
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
    onChangeAction(value) {
      this.rest.action = value;
      if (value === 'GET') {
        this.rest.input.databinding = undefined
      }
      if (value === 'SET') {
        this.rest.output.databinding = undefined
      }
    },
    onValueChange(item, value) {
      if (typeof value === "string") {
        this.valuestr = value;
      } else {
        this.valuestr = value.target.value;
      }
      this.databingValues = {};
      this.databingValues[this.rest.input.databinding] = this.valuestr;
    },
    setWidget(w) {
      this.logger.log(-4, "setWidget", "enter");
      this.widget = w;
      if (w.props && w.props.rest) {
        this.rest = lang.clone(w.props.rest);
        if (!this.rest.output.databinding) {
          this.logger.log(-1, "setWidget", "Set name as output");
          this.rest.output.databinding = this.widget.name;
        }
      }
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
    getValue() {
      return this.rest;
    },
    onChangeOutputVar(value) {
      this.rest.output.databinding = value;
      this.onChange();
    },
    onChangeInputVar(value) {
      this.rest.input.databinding = value;
      this.onChange();
    },
    onChange() {
      this.$nextTick(() => {
        this.isDirty = true;
        this.$emit("change", this.getValue(), this.rest);
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
      return true;
    },
    buildHints(object) {
      let prefix = this.rest.output.databinding;
      this.rest.hints = RestUtil.buildHints(prefix, object);
      this.$emit("change", this.getValue(), this.template);
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
        let result = "";
        const storageKey = `${this.model.id}`;

        if (this.rest.action === "GET") {
          result = localStorage.getItem(storageKey) || "No data found";
        } else if (this.rest.action === "SET") {
          localStorage.setItem(storageKey, this.valuestr);
          result = "Data saved successfully";
        }

        this.testResult = result;
        this.runSuccess = true;
        this.loadingResult = false;
      } catch (e) {
        this.runSuccess = false;
        this.testResult = "Error: " + e.message;
        this.testError = "Something went wrong.";
      } finally {
        this.loadingResult = false;
      }
    },
  },
  watch: {
    value(v) {
      this.setWidget(v);
    },
  },
  mounted() {
    this.logger = new Logger("LocalStorage");
    if (this.app) {
      this.setModel(this.app);
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
    if (this.$refs.tooltipOutputPathIcon) {
      this.addTooltip(
        this.$refs.tooltipOutputPathIcon,
        "The path of the result to store in the variable"
      );
    }
  },
};
</script>
