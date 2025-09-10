<template>
  <div class="MatcWidgetTypeRest">
    <div class="MatcWidgetTypeRestLogo and-logic"></div>
    <span class="MatcWidgetTypeRestLabel" data-dojo-attach-point="labelNode">{{ label }}</span>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "LogicAnd",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: false,
      topic: "MatcWidgetRadioBoxChange",
    };
  },
  components: {},
  computed: {
    label() {
      if (this.model) {
        return this.model.name;
      }
      return "Router";
    },
  },
  methods: {
    postCreate() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._paddingNodes = [];
    },

    /**
     * Get the node for inline editing
     */
    getLabelNode() {
      return this.labelNode;
    },

    resize (box) {
      const h = Math.min(box.h, box.w)
      this.labelNode.style.fontSize = (h * 0.2) + "px";
      if (this.icon) {
        const f = this.model.style.iconSize ? this.model.style.iconSize : 0.8
        this.icon.style.fontSize = (h * f) + "px";
      }
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.resize(model);
    },

    getValue: function () {},

    setValue: function () {},

    getState: function () {
      return {};
    },

    setState: function () {},
  },
  mounted() {},
};
</script>
