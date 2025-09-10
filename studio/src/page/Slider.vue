<template>
  <div class="slider-container">
    <input 
      type="range" 
      :min="min" 
      :max="max" 
      :step="step" 
      v-model="sliderValue" 
      @input="handleChange" 
      class="slider"
      ref="slider"
    />
    <span class="value-display">{{ displayValue }}</span>
  </div>
</template>

<script>
export default {
  name: 'Slider',
  props: {
    decimals: {
      type: Boolean,
      default: false,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    onChange: {
      type: Function,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      sliderValue: this.value,
    };
  },
  watch: {
    value(newValue) {
      this.sliderValue = newValue;
    },
  },
  computed: {
    step() {
      return this.decimals ? 0.1 : 1;
    },
    displayValue() {
      return this.decimals ? parseFloat(this.sliderValue).toFixed(1) : parseInt(this.sliderValue, 10);
    }
  },
  methods: {
    handleChange() {
      const value = this.decimals ? parseFloat(this.sliderValue).toFixed(1) : parseInt(this.sliderValue, 10);
      this.$emit('input', value);
      this.onChange(value);
      this.updateSliderBackground();
    },
    updateSliderBackground() {
      const percentage = ((this.sliderValue - this.min) / (this.max - this.min)) * 100;
      this.$refs.slider.style.background = `linear-gradient(to right, rgb(93, 135, 255) ${percentage}%, rgb(234, 239, 244) ${percentage}%)`;
    }
  },
  mounted() {
    this.updateSliderBackground();
  }
};
</script>

<style scoped>
  @import url("../style/slider.css");
</style>
