<template>
  <div class="switcher-wrapper" ref="helper">
    <div class="switcher">
      <input type="checkbox" :id="switcherId" v-model="isChecked" />
      <label :for="switcherId" class="switch-label">
        <span class="switch-button"></span>
      </label>
    </div>
  </div>
</template>

<script>
import _Tooltip from "common/_Tooltip";
export default {
  name: "Switcher",
  mixins: [_Tooltip],
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    switcherId: {
      type: String,
      default: "switcher",
    },
    tooltipText: {
      type: String,
      default: "Toggle this switch",
    },
  },
  data() {
    return {
      isTooltipVisible: false,
    };
  },
  methods: {
  },
  computed: {
    isChecked: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
        this.$emit("change", val);
      },
    },
  },
  mounted() {    
    if (this.$refs.helper) {
        this.addTooltip(this.$refs.helper, this.tooltipText);
      }
  }
};
</script>

<style scoped>
.switcher-wrapper {
  position: relative; 
}

.switcher {
  position: relative;
  width: 28px;
  height: 14px;
  cursor: pointer;
}

.switch-label {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  background-color: #ccc;
  border-radius: 14px;
  transition: background-color 0.3s ease;
}

.switch-button {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

input[type="checkbox"]:checked + .switch-label .switch-button {
  transform: translateX(14px);
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]:checked + .switch-label {
  background-color: #66bb6a;
}
</style>
