<template>
  <div :key="key" v-if="item">
    <label class="MatcFlex MatcGapM" v-if="item.label">
      <div v-if="
        item.type !== 'Combo' &&
        item.type !== 'TextArea' &&
        item.type !== 'DependentGroup'&&
        item.type !== 'file'
      " class="MatcFlex">
        <Switcher v-model="restCombo" @change="changeComboVar" :switcher-id="item.id"
          tooltipText="Enable to make this property a variable" />
      </div>
      <div>
        {{ item.label }}
        <span class="MatcToolbarItemIcon" :data-id="getDataID(item.id)" v-if="item.helper" ref="helper">
          <span class="mdi mdi-help-circle-outline"></span>
        </span>
      </div>
    </label>
    <div v-if="rest && rest.combos && rest.combos[item.id]">
      <Combo :value="item.value || item.default" @change="onChange(item, $event)" :hints="variableAndSecretHints"
        :fireOnBlur="true" :formControl="true" :isDropDown="true" :placeholder="item.placeholder" />
    </div>
    <div v-else>
      <input v-if="item.type === 'Input'" :value="item.value || item.default" :placeholder="item.placeholder"
        class="MatcIgnoreOnKeyPress form-control" @change="onChange(item, $event)" />
      <input v-if="item.type === 'Number'" :value="item.value || item.default" :placeholder="item.placeholder"
        class="MatcIgnoreOnKeyPress form-control" @change="onNumberChange(item, $event)" type="number" :min="item.min"
        :max="item.max" />
      <Combo v-if="item.type === 'Combo'" :value="item.value || item.default" @change="onChange(item, $event)"
        :hints="variableAndSecretHints" :fireOnBlur="true" :formControl="true" :isDropDown="true"
        :placeholder="item.placeholder" />
      <Slider v-if="item.type === 'range'" :hasLabel="true" :value="item.value || item.default" :max="item.max"
        :min="item.min" :onChange="onSliderChange" :decimals="item.decimals" />
      <DropDownButton v-if="item.type === 'DropDown'" :value="value" :options="item.options"
        @change="onChange(item, $event)" :formControl="true" :placeholder="item.placeholder" />
      <div v-if="item.type === 'SegmentButton'" class="MatcSegmentButtonInline">
        <SegmentButton :value="item.value" @change="onChange(item, $event)" :options="item.options" />
      </div>

      <div v-if="item.type === 'CheckBox'" class="MatcSegmentButtonInline">
        <CheckBox :value="item.value || item.default" @change="onChange(item, $event)" :label="item.label" />
      </div>
      <textarea v-if="item.type === 'InputArea'" v-model="item.value" :placeholder="item.placeholder"
        @change="onChange(item, $event)"
        class="MatcIgnoreOnKeyPress form-control MatcAutoCompleteTextareaXXS"></textarea>
      <div v-if="item.type === 'Label'">
        {{ item.value }}
      </div>
      <Combo v-if="item.type === 'file'" :value="item.value || item.default" @change="onChange(item, $event)"
        :hints="variableAndSecretHints" :fireOnBlur="true" :formControl="true" :isDropDown="true"
        :placeholder="item.placeholder" />
      <component v-if="item.type === 'custom' && item.component" :is="item.component" :item="item" :onChange="onChange"
        :rest="rest" :aiModel="aiModel" :databingValues="databingValues" :hash="hash" :modelId="modelId" />

      <div v-if="item.type === 'DependentGroup'" class="">
        <div v-for="(subItem, index) in item.items" :key="index" :class="{
          'col-xs-6 flex-item': subItem.flex,
          'flex-item-padding': subItem.flex && index % 2 !== 0,
        }">
          <div class="MatcMarginBottom" v-if="shouldShowItem(subItem)">
            <AIRestSettingItem :item="subItem" :onChange="(subItem, value) =>
                handleDependentChange(item.id, subItem, value)
              " :variableAndSecretHints="variableAndSecretHints" :onChangeIsCombo="onChangeIsCombo"
              :isVarCombo="isVarCombo" :rest="rest" :aiModel="aiModel" :databingValues="databingValues" :hash="hash"
              :modelId="modelId" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.flex-item {
  padding: 0 0 8px 0;
  margin: 0;
}

.flex-item-padding {
  padding-left: 8px;
}

.no-gutters {
  margin: 0;
  padding: 0;
}
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import Util from "core/Util";
import Logger from "common/Logger";
import SegmentButton from "page/SegmentButton";
import DropDownButton from "page/DropDownButton";
import Slider from "page/Slider";
import Input from "common/Input";
import CheckBox from "common/CheckBox";
import Switcher from "common/Switcher";
import FileButton from "common/FileButton";
import _Tooltip from "common/_Tooltip";
export default {
  name: "AIRest",
  mixins: [DojoWidget, Util, _Tooltip],
  props: [
    "item",
    "onChange",
    "onChangeIsCombo",
    "isVarCombo",
    "variableAndSecretHints",
    "rest",
    "aiModel",
    "databingValues",
    "modelId",
    "hash",
    "hints",
  ],
  data() {
    return {};
  },
  components: {
    SegmentButton: SegmentButton,
    DropDownButton: DropDownButton,
    Combo: Input,
    Slider: Slider,
    CheckBox: CheckBox,
    FileButton: FileButton,
    AIRestSettingItem: () => import("./AIRestSettingItem.vue"),
    Switcher,
  },
  computed: {
    restCombo() {
      return this.rest &&
        this.rest.combos &&
        this.rest.combos[this.item.id] !== undefined
        ? !this.rest.combos[this.item.id]
        : true;
    },
    computedOptions() {
      if (this.item.getOptions) {
        return this.item.getOptions(this.rest.dependentSelections);
      }
      return this.item.options;
    },
    key() {
      return `${Date.now()}`;
    },
    value() {
      return this.item.value || this.item.default;
    },
  },
  methods: {
    getDataID(id) {
      return id.replace(/\./g, '_');
    },
    changeComboVar(val) {
      if (val) {
        this.item.value = "";
      } else {
        this.item.value = this.item.default;
      }
      this.onChange(this.item, this.item.value);
      this.onChangeIsCombo(this.item, !val);
    },
    onNumberChange(element, event) {
      const target = event.target;
      let value = event;
      if (target) {
        value = target.value;
      }
      if (element.type === "Number") {
        if (
          (element.min && value < element.min) ||
          (element.max && value > element.max)
        ) {
          return;
        }
      }
      this.onChange(element, parseInt(value));
    },
    onSliderChange(event) {
      try {
        const target = event.target;
        let value = event;
        if (target) {
          value = target.value;
        }
        this.onChange(
          this.item,
          this.item.decimals ? parseFloat(value) : parseInt(value)
        );
      } catch (e) {
        console.log("AIRestSettingsItem: Error saving slider value");
      }
    },
    handleDependentChange(groupId, subItem, value) {
      const dependentSelections = this.rest.dependentSelections || {};
      if (!dependentSelections) {
        this.$set(this.rest, 'dependentSelections', {});
      }
      if (!dependentSelections[groupId]) {
        this.$set(this.rest.dependentSelections, groupId, {});
      }
      this.$set(this.rest.dependentSelections[groupId], subItem.id, value);
      // Update dependent options and reset their values
      this.updateDependentOptions(groupId, subItem.id);
      if (this.isGroupComplete(groupId)) {
        const objects = this.rest.dependentSelections[groupId];
        Object.keys(objects).forEach((key) => {
          this.onChange({ id: key }, objects[key]);
        });
      }
      this.$set(this.rest, "dependentSelections", this.rest.dependentSelections);
    },
    updateDependentOptions(groupId, changedItemId) {
      const updateOptions = (items, id, reset) => {
        let foundDependency = reset;
        items.forEach((subItem) => {
          if (foundDependency || subItem.dependentOn === id) {
            foundDependency = true;
            if (subItem.type === "DropDown") {
              const dependentSelections = this.rest.dependentSelections;
              const opts = dependentSelections && dependentSelections[groupId];
              this.$set(subItem, "options", subItem.getOptions(opts));
              // Reset the value of the dependent item
              const defaultValue = subItem.default || null;
              this.$set(opts, subItem.id, defaultValue);
              this.$set(subItem, "value", defaultValue);
              this.$set(subItem, "defaultValue", defaultValue);
            }
            if (subItem.items) {
              updateOptions(subItem.items, subItem.id, foundDependency);
            }
          }
        });
      };
      // Start updating from the top-level items
      updateOptions(this.item.items || this.item.content, changedItemId, false);
    },
    isGroupComplete(groupId) {
      const group = this.item.items;
      const dependentSelections = this.rest.dependentSelections;
      const selections = dependentSelections && dependentSelections[groupId];
      return group.every(
        (item) =>
          selections[item.id] !== undefined && selections[item.id] !== null
      );
    },
    shouldShowItem(item) {
      if (!item.dependentOn) {
        return true;
      }
      const dependentSelections = this.rest.dependentSelections;
      const dependencyValue =
        dependentSelections &&
        dependentSelections[this.item.id]?.[item.dependentOn];
      const shouldShow =
        dependencyValue !== undefined &&
        dependencyValue !== null &&
        dependencyValue !== "";
      return shouldShow;
    },
  },
  mounted() {
    this.logger = new Logger("AIRestSettingItem");
    if (this.item.helper) {
      if (this.$refs.helper) {
        this.addTooltip(this.$refs.helper, this.item.helper);
      }
    }
    if (this.item.type === "DependentGroup") {
      const updateOptions = (items) => {
        items.forEach((subItem) => {
          if (subItem.type === "DropDown" && subItem.getOptions) {
            const dependentSelections = this.rest.dependentSelections;
            const opts = dependentSelections && dependentSelections[this.item.id];
            this.$set(subItem, "options", subItem.getOptions(opts));
          }
        });
      };
      updateOptions(this.item.items || this.item.content);
    }
  },
};
</script>
