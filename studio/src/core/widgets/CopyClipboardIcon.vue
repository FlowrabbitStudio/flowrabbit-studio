<template>
  <div class="MatchWidgetTypeIconButton">
    <span :style="{'margin-right' : margin, color: iconColor, fontSize: fontSize}" class="MatchWidgetTypeIconButtonIcon mdi mdi-content-copy" />
  </div>
</template>

<style>
</style>

<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "CopyClipboardIcon",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: "",
      model: null,
      scale: 1,
      fontSize: '20px',
      icon: {}
    };
  },
  components: {},
  computed: {
    margin () {
        if (this.model && this.model.style && this.model.style.iconMargin) {
            return  Math.round(this.scale * this.model.style.iconMargin) + 'px'
        }
        return '0px'
    },
    iconColor () {
      if (this.model && this.model.style && this.model.style.iconColor && this.model.style.iconColor !== 'transparent') {
          return this.model.style.iconColor
      }
      return ''
    }
  },
  methods: {
    getName () {
      return 'Clipboard';
    }, 
    postCreate() {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
      this._labelNodes = [this.$refs.labelCntr];
    },

    wireEvents() {
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
    },    
    resize (box) {
      var h = Math.min(box.h, box.w);
      this.height = h
      this.fontSize = Math.round(this.height * 0.8 * this._scaleX) + 'px'
      this.style.fontSize = this.fontSize;
    },
    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.scale = scaleX
      this.setStyle(style, model);
      this.resize(model);
    },
    getValue() {
      return this.value;
    },

    setValue() {
    
    },

    getState() {
    },

    setState() {
    },

    onClick(e) {
      this.stopEvent(e);
      this.emitClick(e);
    }
  }
};
</script>
