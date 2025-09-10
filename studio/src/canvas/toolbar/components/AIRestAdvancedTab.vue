<template>
  <div
    class="form-group MatcToolbarResSettingsCntrScroll p-2"
    v-if="aiModel.advanced"
  >
    <div v-for="e in aiModel.advanced" :key="e.id" class="form-group">
      <AIRestSettingItem
        :item="e"
        :onChange="onTemplateElementChange"
        :onChangeIsCombo="onChangeIsCombo"
        :isVarCombo="isVarCombo"
        :getVars="getAllAppVariables"
        :variableAndSecretHints="variableAndSecretHints"
        :rest="rest"
        :aiModel="aiModel"
        :databingValues="databingValues"
        :hash="hash"
        :modelId="aiModel.id"
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
            :getVars="getAllAppVariables"
            :variableAndSecretHints="variableAndSecretHints"
            :rest="rest"
            :aiModel="aiModel"
            :databingValues="databingValues"
            :hash="hash"
            :modelId="aiModel.id"
          />
        </div>
      </div>
      <AutoCompleteTextarea
        v-if="e.type === 'TextArea'"
        :options="variableAndSecretHintsList"
        :value="e.value"
        :placeholder="e.placeholder"
        class="MatcAutoCompleteTextareaXXS"
        @change="onTemplateElementChange(e, $event)"
      >
      </AutoCompleteTextarea>
    </div>
  </div>
</template>

<script>
import AIRestSettingItem from "./AIRestSettingItem.vue";
import AutoCompleteTextarea from "page/AutoCompleteTextarea";

export default {
  components: {
    AIRestSettingItem,
    AutoCompleteTextarea,
  },
  props: [
    "aiModel",
    "rest",
    "databingValues",
    "variableAndSecretHintsList",
    "variableAndSecretHints",
    "hash",
  ],
  methods: {
    onTemplateElementChange(element, event) {
      this.$emit("elementChange", element, event);
    },
    getAllAppVariables() {
      return this.$parent.getAllAppVariables();
    },
    onChangeIsCombo(item, value) {
      this.$emit("onChangeIsCombo", item, value);
    },
    isVarCombo(item) {
      this.$emit("isVarCombo", item);
    },
  },
};
</script>
