
<template>
  <div class="MatcAppList">
    <div class="MatcAppListContainer">
      <div class="MatcFlexList">
        <AppItem
          v-for="(screen, index) in screens"
          :key="screen.id"
          :app="app"
          :screen="screen"
          :jwtToken="jwtToken"
          :pub="pub"
          :index="index"
          :hash="hash"
          :appLink="appLink(screen)"
          :isFillBackground="true"
        />
      </div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import Util from "core/Util";
import AppItem from "./AppItem.vue";
import Services from "services/Services";
import { mapState } from "vuex";

export default {
  name: "AppScreenList",
  mixins: [Util, DojoWidget],
  props: ["app", "small", "big", "pub", "canAdd", "size", "hash"],
  data: function () {
    return {
      add: false,
      hasSearch: false,
      popoverButtonLabel: "Design",
      maxElementsToRender: 20,
      resizePreview: false,
      isPublic: false,
      hasStackView: false,
      screens: [],
    };
  },
  components: {
    AppItem,
  },
  computed: {
    ...mapState(["selectedOrg"]),
  },
  methods: {
    setPage (page) {
      this.logger.log(-3,"setPage", "entry", page);
      this.currentPage = page
    },
    appLink(screen) {
      if (this.pub) {
        return "#/examples/" + this.selectedOrg.id + "/" + this.app.id + "/design/" + screen.id + ".html";
      }
      return "#/apps/" + this.selectedOrg.id + "/" + this.app.id + "/design/" + screen.id + ".html";
    },
    async load() {
      this.jwtToken = await Services.getUserService().getToken();
      if (this.app) {
        this.setValue(this.app);
      } else {
        console.warn("ScreenList.load() > No app");
      }
    },
    setValue(value) {
      this.model = value;
      this.screens = this.getScreens();
      if (this.screens.length == 0) {
        this.add = true;
      }
    },
    onTest(id, e) {
      this.stopEvent(e);
      this.emit("test", id);
    },
  },
  async mounted() {
    await this.load();
  },
};
</script>