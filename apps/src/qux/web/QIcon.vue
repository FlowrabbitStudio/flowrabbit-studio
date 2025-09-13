<template>
  <div class="MatcQIcon" v-if="icons[icon]">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :class="'MatcQIconSVG ' + icon"
      :width="iconSize"
      :height="iconSize"
      viewBox="0 0 24 24"
      stroke-width="1.25"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      v-html="icons[icon]"
    ></svg>
    <span v-if="bubble" class="MatcQIconBubble"></span>
  </div>
  <span v-else :class="'MatcQIcon ' + icon"></span>
</template>
<script>
import { icons } from "./QIconsSVG";
export default {
  name: "QIcon",
  props: ["icon", "tooltip", "bubble", "size"],
  mixins: [],
  data: function () {
    return {
      icons: icons,
    };
  },
  computed: {
    iconSize() {
      return this.size || "18";
    },
  },
  components: {},
  methods: {},
  mounted() {},
};
</script>

<style lang="scss">
.MatcQIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;

  .MatcQIconSVG {
    stroke-width: 1.5;
  }

  &.MatcToolbarPopUpIcon {
    .MatcQIconSVG {
      width: 18px;
      height: 18px;
    }
  }

  svg {
    path {
      transform: translate(0.5, 0.5);
    }
  }
}

.MatcToolbar .MatcQIcon {
  height: 24px;
  width: 24px;
}

.MatcToolbar .MatcToolbarIconButton .MatcQIcon,
.MatcToolbar .MatcQIcon.MatcQIconInButton {
  justify-content: flex-start;
  width: 18px;
}

.MatcToolbar .MatcToolbarToggleButton .MatcQIcon {
  justify-content: center;
}
</style>