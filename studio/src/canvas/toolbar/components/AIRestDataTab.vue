<template>
  <div class="MatcToolbarRestSettingsElementCntr p-2">
    <div class="form-group" v-if="brandList && brandList.length > 0">
      <div class="MatcFlex MatcGapM MatcMarginBottomXS">
        <div class="MatcSegmentButtonInline MatcFlex50">
          <label>
            Brand
            <span class="MatcToolbarItemIcon" ref="brandtooltip">
              <span class="mdi mdi-help-circle-outline"></span>
            </span>
          </label>
          <DropDownButton
            class="MatcFlex50"
            :value="brand"
            :options="brandList"
            @change="onChangeBrand"
            :formControl="true"
            placeholder="Select a brand"
          />
        </div>
        <div
          class="MatcSegmentButtonInline MatcFlex50"
          v-if="modelsList && modelsList.length > 0"
        >
          <label>
            Model
            <span class="MatcToolbarItemIcon" ref="modeltooltip">
              <span class="mdi mdi-help-circle-outline"></span>
            </span>
          </label>
          <DropDownButton
            class="MatcFlex50"
            :value="aiModelData.id"
            :options="modelsList"
            :formControl="true"
            @change="onModelChange"
            placeholder="Select a model"
          />
        </div>
      </div>
    </div>
    <div class="form-group" v-if="aiModelData && aiModelData.id">
      <div v-if="template.type === 'speechToText'" class="MatcMarginBottom">
        <AIRestSpeechToText
          :rest="rest"
          :onChangeInputVar="onChangeInputVar"
          :hints="hints"
        />
      </div>
      <div
        v-for="e in aiModelData.elements"
        :key="`${e && e.id}-${aiModelData && aiModelData.id}`"
      >
        <div v-if="e && e.id" class="form-group">
          <AIRestSettingItem
            :item="e"
            :onChange="onTemplateElementChange"
            :onChangeIsCombo="onChangeIsCombo"
            :isVarCombo="isVarCombo"
            :variableAndSecretHints="variableAndSecretHints"
            :rest="rest"
            :aiModel="aiModelData"
            :databingValues="databidingValues"
            :hash="hash"
            :modelId="model.id"
          />
          <div :class="['', { 'MatcFlex MatcGapXL': e.type === 'flex' }]">
            <div
              class="MatcSegmentButtonInline MatcFlex50"
              v-for="c in e.content"
              :key="c.id"
            >
              <AIRestSettingItem
                :item="c"
                :onChange="onTemplateElementChange"
                :onChangeIsCombo="onChangeIsCombo"
                :isVarCombo="isVarCombo"
                :variableAndSecretHints="variableAndSecretHints"
                :rest="rest"
                :aiModel="aiModelData"
                :databingValues="databidingValues"
                :hash="hash"
                :modelId="model.id"
              />
            </div>
          </div>
          <div style="width: 100%">
            <AutoCompleteTextarea
              :key="`prompt-textarea-${aiModelData && aiModelData.id}`"
              v-if="e.type === 'TextArea'"
              :options="variableAndSecretHintsList"
              :value="e.value"
              :placeholder="e.placeholder"
              :class="e.class || 'MatcAutoCompleteTextareaXXS'"
              @change="onTemplateElementChange(e, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DropDownButton from "page/DropDownButton";
import AIRestSpeechToText from "./AIRestSpeechToText.vue";
import AIRestSettingItem from "./AIRestSettingItem.vue";
import AutoCompleteTextarea from "page/AutoCompleteTextarea";
import AIModelsUtil from "../../../util/aimodels/AIModelsUtil";
import _Tooltip from "common/_Tooltip";

export default {
  components: {
    DropDownButton,
    AIRestSpeechToText,
    AIRestSettingItem,
    AutoCompleteTextarea,
  },
  mixins: [_Tooltip],
  props: [
    "aiModel",
    "template",
    "rest",
    "databingValues",
    "variableAndSecretHints",
    "hints",
    "hash",
    "variableAndSecretHintsList",
    "model",
  ],
  data() {
    return {
      brand: undefined,
      databidingValues: {},
      aiModelData: {},
      prompt: ""
    };
  },
  watch: {
    template() {
      this.updateModelsList();
    },
    brand() {
      this.updateModelsList();
    },
    aiModel: {
      handler() {
        this.aiModelData = this.aiModel;
        this.updateModelsList();
      },
      deep: true,
    },
  },
  computed: {
    brandList() {
      const type = this.template.type;
      if (type && AIModelsUtil[type]) {
        return AIModelsUtil[type].brands.map((m) => ({
          value: m.id,
          label: m.label,
          icon: m.logo,
        }));
      }
      return [];
    },
    modelsList() {
      const type = this.template.type;
      if (this.brand && type && AIModelsUtil[type]) {
        return AIModelsUtil[type].models
          .filter((m) => m.type === this.brand)
          .map((m) => ({ value: m.id, label: m.name }));
      }
      return [];
    },
  },
  methods: {
    onChangeBrand(value) {
      this.prompt = this.rest.vars.prompt;
      this.brand = value;
      this.updateModelsList();
      this.$emit("changeBrand", value);
      this.$emit("elementChange", {id: "prompt"}, this.prompt);
    },
    onModelChange(value) {
      this.prompt = this.rest.vars.prompt;
      this.$emit("modelChange", value);
      this.$emit("elementChange", {id: "prompt"}, this.prompt);
    },
    updateModelsList() {
      this.brand = this.brand || (this.aiModelData && this.aiModelData.type);
    },
    onTemplateElementChange(element, event) {
      this.$emit("elementChange", element, event);
    },
    onChangeInputVar(value) {
      this.$emit("onChangeInputVar", value);
    },
    onChangeIsCombo(item, value) {
      this.$emit("onChangeIsCombo", item, value);
    },
    isVarCombo(item) {
      this.$emit("isVarCombo", item);
    },
  },
  mounted() {
    this.aiModelData = this.aiModel;
    this.databidingValues = this.databingValues;
    this.updateModelsList();

    this.$nextTick(() => {
      if (this.$refs.brandtooltip) {
        this.addTooltip(
          this.$refs.brandtooltip,
          "Select the AI provider or platform. Different brands offer unique AI models with varied capabilities, such as OpenAI, Perplexity, etc."
        );
      }

      if (this.$refs.modeltooltip) {
        this.addTooltip(
          this.$refs.modeltooltip,
          "Choose a specific AI model from the selected brand. Models vary in performance and features, such as GPT Mini, GPT-3.5, and others."
        );
      }
    });
  },
};
</script>
