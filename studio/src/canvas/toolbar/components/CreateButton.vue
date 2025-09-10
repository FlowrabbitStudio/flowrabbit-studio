<template>
  <div
    class="MatcCreateBtn MatcToolbarItem MatcMultiIcon MatcToolbarDropDownButton"
  >
    <div type="button" data-dojo-attach-point="button" @click="setLayer">
      <label data-dojo-attach-point="label" class="">
        <span id="componentsItem" class="mdi mdi-view-grid-plus-outline"></span>
      </label>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import Util from "core/Util";

export default {
  name: "CreateButton2",
  mixins: [Util, DojoWidget],
  data: function () {
    return {
      screenWidth: 300,
      screenHeight: 600,
      selectedCategory: "WireFrame",
      showSubCatgeoryLabels: false,
      icons: [],
      categoryNames: {
        WireFrame: "Basic",
        Advanced: "Advanced",
      },
      previewSizes: {
        default: {
          w: 120,
          h: 70,
        },
        Screen: {
          w: 160,
          h: 200,
        },
      },
      tab: "widgets",
      importableApps: [],
    };
  },
  components: {},
  methods: {
	
  },
  mounted() {},
};
</script>
