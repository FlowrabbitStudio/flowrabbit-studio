<template>
  <div v-tooltip="tooltipText" :class="['qux-icon', cssClass]">
    <span :class="[icon]" @click="onClick"> </span>
  </div>
</template>
<style lang="scss">
@import "../scss/qux-icon.scss";
</style>
<script>
import _Base from "./_Base.vue";

export default {
  name: "qIcon",
  mixins: [_Base],
  data: function () {
    return {};
  },
  computed: {
    icon() {
      return this.element.style.icon;
    },
  },
  mounted() {},
};
</script>
