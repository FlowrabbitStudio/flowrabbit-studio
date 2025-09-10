<template>
  <div
    :class="[
      'MatcAppListItem MatcContentBox MatcShadowBox MatcAppListBox',
      { MatcListItemAnimated: loadingSummaries },
      { MatcAppListStack: hasStackView },
    ]"
  >
    <a :href="appLink">
      <div
        :class="[
          'MatcPreviewWrapper MatcPreviewWrapperLoadable',
          { 'gradient-background': loadingSummaries },
        ]"
      >
        <div v-if="!loadingSummaries">
          <Preview
            v-if="!error"
            :app="app"
            :screen="screen && screen.id"
            :isPublic="app.isPublic"
            :token="jwtToken"
            :pub="pub"
            :isFillBackground="isFillBackground"
            :invitation="hash"
            @loaded="onLoaded"
            @error="onError"
          />
        </div>
        <div v-if="error" class="error-indicator">Failed to load preview</div>
      </div>
      <div class="MatcListItemFooter">
        <div class="MatcListItemDescription">
          <span>{{ screen ? screen.name : app.name }}</span>
          <span @mouseover="showTooltip($event)" @mouseleave="hideTooltip">
            <QIcon v-if="app.publicType" :icon="publishIcon" size="14" />
          </span>
        </div>
        <div class="MatcListItemEdited MatcFlex MatBetween">
          <div>
            <span v-if="app.lastUpdate">{{ lastEdited }}</span>
          </div>
          <div v-if="!screen">
            <AppItemDropdown
              @rename="handleRename"
              @duplicate="handleDuplicate"
              @move="handleMove"
              @delete="handleDelete"
              :app="app"
              :selectedOrg="selectedOrg"
            />
          </div>
        </div>
      </div>
    </a>
    <div v-if="tooltipVisible" :style="tooltipStyles" class="tooltip">
      {{ tooltipIcon }}
    </div>
  </div>
</template>

<script>
import Preview from "./Preview.vue";
import AppItemDropdown from "../components/AppItemDropdown.vue";
import QIcon from "./QIcon.vue";

export default {
  name: "AppItem",
  components: {
    Preview,
    AppItemDropdown,
    QIcon,
  },
  props: {
    app: {
      type: Object,
      required: true,
    },
    screen: {
      type: Object,
    },
    jwtToken: {
      type: String,
      required: true,
    },
    pub: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      required: true,
    },
    isFillBackground: {
      type: Boolean,
      default: false,
    },
    hash: {
      type: String,
    },
    appLink: {
      type: String,
    },
    hasStackView: {
      type: Boolean,
      default: false,
    },
    onRenameApp: {
      type: Function,
    },
    onDuplicateApp: {
      type: Function,
    },
    onMoveApp: {
      type: Function,
    },
    onRemoveApp: {
      type: Function,
    },
    selectedOrg: {
      type: Object,
    },
    loadingSummaries: {
      type: Boolean,
    },
  },
  data() {
    return {
      loading: true,
      error: false,
      animate: false,
      hidden: true,
      tooltipVisible: false,
      tooltipStyles: {
        position: "fixed",
        top: "0",
        left: "0",
        backgroundColor: "#333",
        color: "#fff",
        padding: "4px",
        borderRadius: "4px",
        fontSize: "12px",
        zIndex: 1000,
        transform: "translate(-50%, -100%)",
      },
    };
  },
  computed: {
    publishIcon() {
      switch (this.app.publicType) {
        case "public":
          return "Public";
        case "team":
          return "Team";
        case "appstore":
          return "AppStore";
        default:
          return "NotReachable";
      }
    },
    tooltipIcon() {
      switch (this.app.publicType) {
        case "public":
          return "Public Access";
        case "team":
          return "Team Access";
        case "appstore":
          return "App Store";
        default:
          return "Not Published";
      }
    },
    lastEdited() {
      const diff = Date.now() - this.app.lastUpdate;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365.25);

      if (years > 0) return `Edited ${years} year(s) ago`;
      if (months > 0) return `Edited ${months} month(s) ago`;
      if (days > 0) return `Edited ${days} day(s) ago`;
      if (hours > 0) return `Edited ${hours} hour(s) ago`;
      if (minutes > 0) return `Edited ${minutes} minute(s) ago`;
      return `Edited ${seconds} second(s) ago`;
    },
  },
  methods: {
    showTooltip(event) {
      this.tooltipVisible = true;
      this.updateTooltipPosition(event);
    },
    hideTooltip() {
      this.tooltipVisible = false;
    },
    updateTooltipPosition(event) {
      const { pageX, pageY } = event;
      this.tooltipStyles = {
        ...this.tooltipStyles,
        top: `${pageY}px`,
        left: `${pageX}px`,
      };
    },
    setAnimate(value) {
      this.animate = value;
    },
    setHidden(value) {
      this.hidden = value;
    },
    onLoaded() {
      setTimeout(() => {
        this.loading = false;
      }, 100 + Math.min(this.index, 10) * 50);
      this.$emit("loaded"); // Emit the loaded event to be handled in the parent component
    },
    onError() {
      this.loading = false;
      this.error = true;
    },
    onTransitionEnd() {
      this.$emit("transitionend");
    },
    handleRename() {
      this.$emit("rename", this.app);
    },
    handleDuplicate() {
      this.$emit("duplicate", this.app);
    },
    handleMove() {
      this.$emit("move", this.app);
    },
    handleDelete() {
      this.$emit("remove", this.app);
    },
  },
  mounted() {
    if (this.app && this.app.loading) {
      this.hidden = false;
    }
  },
};
</script>

<style scoped>
  @import "style/scss/appitem.scss";
</style>
