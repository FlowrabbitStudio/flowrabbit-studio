<template>
  <div class="MatcOrgContainer">
    <router-view></router-view>
  </div>
</template>
<style lang="scss">
@import "../../style/scss/workspace.scss";
</style>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";

export default {
  name: "OrganizationContainer",
  mixins: [DojoWidget],
  props: ["selectedOrg", "folderSelected", "view"],
  data: function () {
    return {
    };
  },
  components: {
  },
  methods: {
    showCreate(e) {
      this.logger.log(-1, "showCreate", "enter");
      this.$refs.createDialog.show(e.target);
    },
  },
  async mounted() {
    this.logger = new Logger("OrganizatioContainer");
  },
};
</script>

