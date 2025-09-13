<template>
  <div :class="['qux-slider', cssClass]" @click="onSliderClick">
      <div class="qux-slider-track">
          <div class="qux-slider-progress" :style="{'width': progress + '%'}">
          </div>
      </div>
      <div class="qux-slider-handle-cntr">
        <div class="qux-slider-handle" :style="{'left': left, 'color': color, 'background': handleColor}" @mousedown="onHandleDown">
          <span v-if="hasLabel">{{ formattedSliderValue }}</span>
        </div>
      </div>
  </div>
</template>

<style lang="scss">
  @import '../scss/qux-slider.scss';
</style>

<script>
import _Base from './_Base.vue';
import _DND from './_DND.vue';
import Logger from '../core/Logger';

export default {
name: 'qSlider',
mixins: [_Base, _DND],
data() {
  return {
    count: 0,
    hndlWidth: 5,
  };
},
computed: {
  domPos() {
    return this.position(this.$el);
  },
  handleWidth() {
    if (this.element) {
      return this.element.style.handleWidth;
    }
    return 40;
  },
  minValue() {
    if (this.element && this.element.props) {
      return this.element.props.min;
    }
    return 0;
  },
  maxValue() {
    if (this.element && this.element.props) {
      return this.element.props.max;
    }
    return 100;
  },
  left() {
    let offSet = this.handleWidth / 2;
    let relativePosition = (this.sliderValue - this.minValue) / (this.maxValue - this.minValue);
    relativePosition = Math.min(1, Math.max(0, relativePosition)); // Clamp between 0 and 1
    return `calc(${relativePosition * 100}% - ${offSet}px)`;
  },
  color() {
    if (this.element && this.element.style) {
      return this.element.style.color;
    }
    return '#fff';
  },
  handleColor() {
    if (this.element && this.element.style) {
      return this.element.style.handleColor;
    }
    return '#fff';
  },
  hasLabel() {
    if (this.element && this.element.props) {
      return this.element.props.hasLabel;
    }
    return false;
  },
  progress() {
    let relativePosition = (this.sliderValue - this.minValue) / (this.maxValue - this.minValue);
    relativePosition = Math.min(1, Math.max(0, relativePosition)); // Clamp between 0 and 1
    return relativePosition * 100; // Convert to percentage
  },
  sliderValue() {
    if (this.element) {
      let count = this.dataBindingInput;
      if (!isNaN(count)) {
        return count;
      }
      return this.element.props.value;
    }
    return this.count;
  },
  formattedSliderValue() {
    if (this.element && this.element.props && this.element.props.hasDecimals) {
      return parseFloat(this.sliderValue).toFixed(1); // Display with one decimal place
    } else {
      return Math.round(this.sliderValue).toString();
    }
  },
},
methods: {
  onSliderClick(e) {
    e.stopPropagation();
    this.setByMouse(e);
    this.onClick(e);
  },
  onHandleDown(e) {
    this.startDND(e, (move, e) => this.setByMouse(e));
  },
  setByMouse(e) {
    let pos = this.domPos;
    let mouse = this.mouse(e);
    let left = (mouse.x - pos.x) / pos.w;
    left = Math.min(1, Math.max(0, left));
    let value = this.minValue + (this.maxValue - this.minValue) * left;
    this.onChange(value);
  },
  onChange(value) {
    if (this.element && this.element.props && this.element.props.hasDecimals) {
      this.count = value;
    } else {
      this.count = Math.round(value);
    }
    if (this.element) {
      this.onValueChange(this.count, 'default');
      this.$emit('qChange', this.element, null, this.count);
    } else {
      this.$emit('change', this.count);
      this.$emit('update:modelValue', this.count);
    }
    Logger.log(5, 'qSlider.onChange() exit > ', this.count);
  },
},
mounted() {
  if (this.element) {
    if (this.element.props && this.element.props.value != null) {
      this.count = this.element.props.value;
    }
  }
},
};
</script>
