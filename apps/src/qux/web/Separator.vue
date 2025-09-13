<template>
  <div :class="['qux-separator', cssClass]"></div>
</template>

<style lang="scss">
@import '../scss/qux-separator.scss';
</style>

<script>
import _Base from './_Base.vue';

export default {
  name: 'qSeparator',
  mixins: [_Base],
  data: function () {
    return {};
  },
  methods: {
    onClick(e) {
      this.$emit('click', e);
    }
  },
  mounted() {
  }
};
</script>
