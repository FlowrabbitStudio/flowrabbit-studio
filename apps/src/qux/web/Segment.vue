<template>
  <div :class="['qux-segment', cssClass]">
    <div class="qux-segment-picker-cntr" ref="ctrl">
      <div class="qux-segment-indicator" :style="indicatorStyles"></div>
      <div
        v-for="option in segmentOptions"
        :key="option.value"
        :class="['qux-segment-item', { 'qux-segment-item-selected': isChecked(option) }]"
        :style="widthStyle"
        @click="(e) => select(option, e)"
      >
        <span class="qux-segment-item-label">{{ option.label }}</span>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import "../scss/qux-segment.scss";
</style>
<script>
import _Base from "./_Base.vue";
import Logger from "../core/Logger";
//import Vue from 'vue'

export default {
  name: "qSegmentButton",
  mixins: [_Base],
  data: function () {
    return {
      selected: null,
      indicatorStyles: "opacity:0",
    };
  },
  computed: {
    widthStyle() {
      const l = this.segmentOptions.length;
      const w = 100 / l;
      return `width: ${w}%;`;
    },
    segmentOptions() {
      if (this.element) {
        return this.optionsWithValues;
      }
      return [];
    },
    isMultiSelect() {
      if (this.element) {
        return this.element.props.multi;
      }
      return false;
    },
    selectedInput() {
      let input = this.dataBindingInput;
      if (input === undefined || input === null) {
        if (this.element?.props?.selected) {
          if (!this.isMultiSelect && Array.isArray(this.element?.props?.selected)) {
            input = this.element?.props?.selected[0];
          } else {
            input = this.element?.props?.selected;
          }
        }
      }
      return input;
    },
  },
  methods: {
    updateIndicatorStyle() {
      this.$nextTick(() => {
        const input = this.selectedInput;
        const index = this.segmentOptions.findIndex((o) => o.value === input);

        if (!input || index < 0 || !this.$refs?.ctrl) {
          this.indicatorStyles = "opacity:0";
          return;
        }

        const l = this.segmentOptions.length;
        const ctrl = this.$refs.ctrl;
        const buttonsGap = this.element?.props?.buttonsGap;
        const gap = (buttonsGap || 0) * (l - 1);
        const w = (ctrl.offsetWidth - gap) / l;
        const h = ctrl.offsetHeight;
        const paddingLeft = this.element?.style?._paddingLeft || 0;
        const containerWidth = w - paddingLeft;
        const containerHeight =
          h -
          ((this.element?.style?._paddingTop || 0) +
            (this.element?.style?._paddingBottom || 0) +
            (this.element?.style?._borderTopWidth || 0) +
            (this.element?.style?._borderBottomWidth || 0));
        const leftGap = buttonsGap ? (index > 0 ? buttonsGap * index : 0) : 0;
        this.indicatorStyles = `
          width: ${containerWidth}px;
          height: ${containerHeight}px;
          left: ${containerWidth * index + (paddingLeft + leftGap)}px;
          top: ${this.element?.style?._paddingTop || 0}px;
          opacity: 1;
          transition: all 0.3s ease;
        `;
      });
    },
    isChecked(option) {
      const input = this.selectedInput;
      if (input) {
        if (this.isMultiSelect) {
          Logger.log(5, "qSegmentButton.isChecked() > Mutli : " + option.value, input);
          return input.indexOf(option.value) >= 0;
        } else {
          Logger.log(5, "qSegmentButton.isChecked() > Single : " + option.value, input);
          return input === option.value;
        }
      }
      return false;
    },

    select(option, e) {
      let value = option.value;
      if (this.isMultiSelect) {
        let input = this.dataBindingInput;
        if (input) {
          if (!Array.isArray(input)) {
            input = [input];
          }
          let pos = input.indexOf(value);
          if (pos < 0) {
            input.push(value);
          } else {
            input = input.filter((item) => item !== value);
          }
        } else {
          input = [value];
        }
        this.onValueChange(input, "default");
        Logger.log(5, "qSegmentButton.select() > Single: " + this.dataBindingInputPath);
      } else {
        this.onValueChange(value, "default");
        Logger.log(5, "qSegmentButton.select() > Single: " + this.dataBindingInputPath, value);
      }
      this.onClick(e);
      this.updateIndicatorStyle();
    },
  },
  mounted() {
    this.updateIndicatorStyle();
  },
};
</script>
