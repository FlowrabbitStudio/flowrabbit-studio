<template>  
  <div class="MatcWidget separatorWidget" :style="separatorStyle"></div>
</template>

<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "Separator",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      model: null,
      style: {},
      scaleX: 1,
      scaleY: 1,
    };
  },
  computed: {
    separatorStyle() {
      return {
        borderTopWidth: this.style.borderTopWidth + "px",
        borderTopColor: this.style.borderTopColor,        
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderStyle: "solid",
        height: "0px",
        width: "100%"
      };
    },
  },
  methods: {
    postCreate() {
      this._borderNodes = [];
      this._backgroundNodes = [];
      this._shadowNodes = [];
    },

    wireEvents() {
      this.own(
        this.addClickListener(this.domNode, (e) => {
          this.emitClick(e);
        })
      );
      this.wireHover();
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.setStyle(style, model);
    },

    getValue() {},

    setValue() {},

    getState() {
      return {};
    },

    setState() {},
  },
  mounted() {
    this.postCreate();
    this.wireEvents();
  },
};
</script>
