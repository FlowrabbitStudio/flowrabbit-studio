<template>
    <div class="MatcWidget MatchWidgetTypeAudioRecording">
        
        <div ref="icon" :class="'mdi ' + icon"/>
       
    </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "AudioRecording",
  mixins: [UIWidget, DojoWidget],
  data: function() {
    return {
      value: "",
      model: null,
      isRecording:false
    };
  },
  components: {},
  computed: {
    icon () {
      if (this.model) {
        return this.model.style.icon
      }
      return ''
    }
  },
  methods: {
    postCreate () {
      this._borderNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
    },

    wireEvents () {
      this.wired = true;
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover()
    },

    resize (box) {
      if (this.$refs.icon) {
        const icon = this.$refs.icon
        const h = Math.min(box.h, box.w) * 0.6;
        icon.style.fontSize = h + "px";
      }
    },

    render (model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      this.resize(model);
      this.setStyle(style, model);
      if (model.props && model.props.value !== null && model.props.value !== undefined) {
        this.setValue(model.props.value);
      }
    },

    updateScale (model, style, scaleX, scaleY) {
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
    },
    
    getValue() {
      return this.value;
    },

    setValue(value) {
      this.value = value;
    },

    _setDataBindingValue (v) {
      this.setValue(v);
    },

    onClick(e) {
      this.stopEvent(e);
      this.emitClick(e);
    },
  },
  mounted() {}
};
</script>