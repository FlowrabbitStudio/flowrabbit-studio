<template>
  <div :class="['qux-iframe', cssClass]">
    <iframe
      width="100%"
      height="100%"
      v-if="src"
      :src="src"
      title=""
      class="qux-iframe-cover"
      allow="microphone; camera"
      sandbox="allow-scripts allow-same-origin allow-forms"
    ></iframe>
  </div>
</template>
<style lang="scss">
@import "../scss/qux-iframe.scss";
</style>

<script>
import _Base from "./_Base.vue";

export default {
  name: "qIFrameWidget",
  mixins: [_Base],
  data: function () {
    return {};
  },
  computed: {
    src() {
      if (this.dataBindingInput) {
        return this.dataBindingInput;
      }
      return this.element ? this.element.props.url : "";
    },
  },
  methods: {},
  mounted() {},
};
</script>
