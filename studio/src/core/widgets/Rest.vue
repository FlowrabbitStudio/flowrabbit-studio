
<template>
  <div class="MatcWidgetTypeRest">
    <div :class="'MatcWidgetTypeRestLogo ' +logo" v-if="hasLogo"></div>
    <span :class="'MatcWidgetTypeIconToggleIcon ' + symbol + ' ' + iconStyle" data-dojo-attach-point="icon" v-else></span>
    <span class="MatcWidgetTypeRestLabel" data-dojo-attach-point="labelNode">{{label}}</span>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Rest",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: false,
      model: null,
      style: null,
    };
  },
  components: {},
  computed: {
    logo () {
      if (this.style?.logo) {
        return this.style?.logo
      }
      return ''
    },
    hasLogo () {
      if (this.style?.logo) {
        return true
      }
      return false
    },
    label () {
      if (this.model) {
        return this.model.name
      }
      return 'Rest'
    },
    iconStyle () {
      if (this.style && this.style?.iconStyle) {
        return this.style.iconStyle
      }
      return ''
    },
    symbol () {
      if (this.style && this.style?.icon) {
        return this.style.icon
      }
      return 'mdi mdi-cloud-braces'
    }
  },
  methods: {
    postCreate () {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
      this._paddingNodes = [];
    },

    getLabelNode () {
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

    render (model, style, scaleX, scaleY) {
      // in case of templates, the 
      // the style comes form the merged template, where as 
      // the model does not have most styles
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.domNode.style.color = style.color;
      this.setValue(model.props.active, true);
      this.resize(model);
    },

    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue (v) {
      if (v !== true && v !== false && v >= 1) {
        v = true;
      }
      this.setValue(v);
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