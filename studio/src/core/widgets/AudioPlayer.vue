<template>
  <div :class="['MatcWidget MatcAudioPlayer']">
    <audio ref="audioctrl" controls>Your browser does not support the audio element.</audio>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "AudioPlayer",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: "https://example.com/audio.wav",
      model: null,
    };
  },
  components: {},
  computed: {},
  methods: {
    postCreate() {
      this._borderNodes = [this.audioctrl];
      this._backgroundNodes = [this.audioctrl];
      this._shadowNodes = [this.audioctrl];
      this._paddingNodes = [this.domNode];
    },

    wireEvents() {
      this.wired = true;
      this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
      this.wireHover();
    },

    render(model, style, scaleX, scaleY) {
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
    resize(model) {
      if (this.$refs && this.$refs.audioctrl) {
        this.$refs.audioctrl.style.width = model.w + "px";
      }
    },

    updateScale(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.setStyle(style, model);
    },

    getValue() {
      return this.value;
    },

    setValue: function (value) {
      this.value = value;
    },

    _setDataBindingValue(v) {
      this.setValue(v);
    },
    onClick(e) {
      this.stopEvent(e);
      this.emitClick(e);
    },
  },
  mounted() {},
};
</script>
