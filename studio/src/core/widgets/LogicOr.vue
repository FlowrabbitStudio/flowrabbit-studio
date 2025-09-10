
<template>
  <div class="MatcWidgetTypeLogicOr">
      <div class="MatcWidgetTypeLogicOrLabel MatcWidgetTypeRestLogo or-logic"  data-dojo-attach-point="label"></div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "LogicOr",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      topic: "MatcWidgetRadioBoxChange"
    };
  },
  components: {},
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    /**
     * Get the node for inline editing
     */
    getLabelNode () {
      return this.label;
    },

    resize (box) {
      var h = Math.min(box.h, box.w);
      this.label.style.fontSize = h + "px";
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.resize(model)
    },

    getValue: function() {},

    setValue: function() {},

    getState: function() {
      return {};
    },

    setState: function() {}
  },
  mounted() {}
};
</script>