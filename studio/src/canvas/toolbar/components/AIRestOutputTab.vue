<template>
  <div class="form-group MatcToolbarResSettingsCntrScroll p-2">
    <label
      >Output Variable
      <span class="MatcToolbarItemIcon" ref="tooltipOutputVarIcon">
        <span class="mdi mdi-help-circle-outline"></span>
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

    <div class="MatcToolbarRestOutputHeaderType MatcMarginTop" v-if="template.type === 'llms' && aiModel?.output?.hasjsonoutput">
      <label>Output Type</label>
      <div class="MatcToolbarRestOutputHeaderTypeFlex">
        <SegmentButton :options="outputTypes" :value="formatType" style="width: 300px" @change="onChangeFormatTypeVar" />
      </div>
    </div>

    <div class="MatcMarginTop" v-if="rest.output.formatType === 'Text' || !aiModel?.output?.hasjsonoutput">
      <CheckBox v-if="hasStreaming" :value="rest.vars.stream" @change="onChangeStream($event)" label="Stream" :formControl="true" />
    </div>

    <div class="MatcMarginTop" v-if="template.type === 'llms' && formatType === 'JSON'">
      <label>Output Format</label>
      <Ace ref="aceEditor" v-model="rest.output.formatJSON" @init="editorInit" lang="json" theme="chrome" width="440" height="220"></Ace>
      <p class="MatcHint">Use the ${variable} notation to send data from the prototype.</p>
    </div>

    <div class="MatcMarginTop">
      <label
        >Loading Variable
        <span class="MatcToolbarItemIcon" ref="tooltipLoadingVarIcon">
          <span class="mdi mdi-help-circle-outline"></span>
        </span>
      </label>
      <Combo
        :value="rest.output.loading"
        @change="onChangeLoadingVar"
        :hints="hints"
        :fireOnBlur="true"
        :formControl="true"
        :isDropDown="true"
        placeholder="Name of the loading variable"
      />
    </div>

    <div class="MatcMarginTop">
      <label
        >Error Variable
        <span class="MatcToolbarItemIcon" ref="tooltipErrorVarIcon">
          <span class="mdi mdi-help-circle-outline"></span>
        </span>
      </label>
      <Combo
        :value="rest.output.error"
        @change="onChangeErrorVar"
        :hints="hints"
        :fireOnBlur="true"
        :formControl="true"
        :isDropDown="true"
        placeholder="Name of the error variable"
      />
    </div>
  </div>
</template>

<script>
import Combo from "common/Input";
import SegmentButton from "page/SegmentButton";
import CheckBox from "common/CheckBox";
import Ace from "vue2-ace-editor";
import _Tooltip from "common/_Tooltip";

export default {
  components: {
    Combo,
    SegmentButton,
    CheckBox,
    Ace,
  },
  mixins: [_Tooltip],
  props: ["rest", "template", "aiModel", "formatType", "hints"],
  data: function () {
    return {
      outputTypes: [
        {
          label: "Text",
          value: "Text",
        },
        {
          label: "JSON",
          value: "JSON",
        },
      ],
    };
  },
  computed: {
    hasStreaming() {
      const isllm = this.template.type === "llms" || (this.template.type === "ionos" && this.aiModel.type === "llm");
      return isllm;
    },
  },
  methods: {
    onChangeOutputVar(value) {
      this.$emit("changeOutputVar", value);
    },
    onChangeFormatTypeVar(value) {
      this.$emit("changeFormatType", value);
    },
    onChangeStream(value) {
      this.$emit("changeStream", value);
    },
    onChangeLoadingVar(value) {
      this.$emit("changeLoadingVar", value);
    },
    onChangeErrorVar(value) {
      this.$emit("changeErrorVar", value);
    },
    editorInit() {
      require("brace/ext/language_tools"); // language extension prerequisite
      require("brace/mode/json");
      require("brace/theme/chrome");

      const editor = this.$refs.aceEditor.editor;
      editor.setOptions({
        enableBasicAutocompletion: false,
        enableSnippets: false,
        enableLiveAutocompletion: true,
      });

      const hints = this.hints.map((hint) => ({ name: hint.label, value: hint.value, score: 1, meta: "databinding" }));
      editor.completers.push({
        getCompletions(editor, session, pos, prefix, callback) {
          if (prefix[0] === "$") {
            callback(null, hints);
          }
        },
      });
    },
  },
  mounted() {
    if (this.$refs.tooltipOutputVarIcon) {
      this.addTooltip(this.$refs.tooltipOutputVarIcon, "The variable to store the result");
    }
    if (this.$refs.tooltipLoadingVarIcon) {
      this.addTooltip(
        this.$refs.tooltipLoadingVarIcon,
        "The variable to store a loading variable. Is set to true when the request is in progress. Is set to false when the request finishes."
      );
    }
    if (this.$refs.tooltipErrorVarIcon) {
      this.addTooltip(this.$refs.tooltipErrorVarIcon, "The variable to store the error result in case the request fails.");
    }
  },
};
</script>
