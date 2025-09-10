<template>
  <div class="MatcWidgetTypeSegmentButton"></div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "SegmentButton",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: false,
    };
  },
  components: {},
  computed: {
    isMulti() {
      if (this.model && this.model.props && this.model.props.multi) {
        return true;
      }
      return false;
    },
  },
  methods: {
    postCreate() {
      this._labelNodes = [];
      this._borderNodes = [this.domNode];
      this._shadowNodes = [this.domNode];
      this._backgroundNodes = [this.domNode];
      this._paddingNodes = [this.domNode];
    },

    wireEvents() {
      this.wired = true;
      for (var i = 0; i < this.btns.length; i++) {
        var option = this.btns[i].o;
        var btn = this.btns[i].b;
        this.own(this.addClickListener(btn, lang.hitch(this, "onSelect", option)));
      }
      this.wireHover();
    },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;

      var db = new DomBuilder();

      this.removeAllChildren(this.domNode);
      var options = this.model.props.options;

      var width = 100 / options.length;
      this.btns = [];
      if (this.model.props?.buttonsGap) {
        this.domNode.style.display = "flex";
        this.domNode.style.gap = this.model.props?.buttonsGap + "px";
      }
      const selectedBtns = this.model.props.selected || [];
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        var btn = db.div("MatcWidgetTypeSegmentButtonChild").build(this.domNode);

        btn.style.width = width + "%";

        let label = db.span("", option).build(btn);
        this._labelNodes.push(label);

        this.setDomStyle(btn, style, i);
        this.btns.push({ o: option, b: btn });
        if (style.buttonBorderRadius) btn.style.borderRadius = `${style.buttonBorderRadius}px`;
        let match = false;
        if (typeof selectedBtns === "string") {
          match = selectedBtns === option;
        } else {
          match = selectedBtns?.filter && selectedBtns?.filter((b) => option === b).length > 0;
        }
        if (match) {
          const active = this.model.active;
          btn.style.background = active.background;
          btn.style.color = active.color;
          if (active?.boxShadow) {
            let shadow = active.boxShadow;
            btn.style.boxShadow = shadow.h + "px " + shadow.v + "px " + shadow.b + "px " + shadow.s + "px " + shadow.c;
          }
          if (active.borderTopWidth) {
            btn.style.borderWidth = this.getZoomed(active.borderTopWidth, this._scaleX) + "px";
          }
          if (active.borderBottomColor) {
            btn.style.borderColor = active.borderBottomColor;
          }
          if (active.fontSize) {
            btn.style.fontSize = active.fontSize + "px";
          }
          if (active.fontStyle) {
            btn.style.fontStyle = active.fontStyle;
          }
          if (active.paddingBottom) {
            btn.style.padding = `${active.paddingTop}px ${active.paddingRight}px ${active.paddingBottom}px ${active.paddingLeft}px` ;
          }
        } else {
          if (style.buttonBorderWidth) btn.style.border = `${style.buttonBorderWidth}px ${style.buttonBorderStyle} ${style.buttonBorderColor}`;
        }
      }

      this.setStyle(style, model);
      if (this.model.props.selected) {
        /**
         * Since 2.2.6 we can have optionally multi select. In this
         * case we must pass and array to setValue
         */
        if (this.isMulti) {
          this.setValue([this.model.props.selected], true);
        } else {
          this.setValue(this.model.props.selected, true);
        }
      }
    },

    setDomStyle: function (btn, style) {
      btn.style.background = style.background;
      btn.style.color = style.color;
    },
    onSelect: function (option, e) {
      this.stopEvent(e);

      /**
       * Since 2.2.6 we can have optionally multi select
       */
      let value = option;
      if (this.isMulti) {
        let pos = this.value.indexOf(value);
        if (pos < 0) {
          value = [option].concat(this.value);
        } else {
          this.value.splice(pos, 1);
          value = this.value;
        }
      }

      this.value = value;
      this.emitDataBinding(value);
      this.setValue(value);
      this.emitStateChange("select", value, e);
    },

    getValue: function () {
      return this.value;
    },

    setValue: function (value) {
      var active = this.model.active;
      var style = this.style;

      if (this.isMulti) {
        /**
         * Since 2.2.6 we can have optionally multi select. We expect an array here
         */
        for (let i = 0; i < this.btns.length; i++) {
          let option = this.btns[i].o;
          let btn = this.btns[i].b;
          if (value.indexOf(option) >= 0 && active) {
            this.setDomStyle(btn, active, 0);
            btn.style.zIndex = 9;
          } else {
            this.setDomStyle(btn, style, i);
          }
        }
      } else {
        for (let i = 0; i < this.btns.length; i++) {
          var option = this.btns[i].o;
          var btn = this.btns[i].b;
          if (option == value && active) {
            this.setDomStyle(btn, active, 0);
            btn.style.zIndex = 9;
          } else {
            this.setDomStyle(btn, style, i);
          }
        }
      }
      this.value = value;
    },

    getState: function () {
      return {
        type: "select",
        value: this.value,
      };
    },

    setState: function (state) {
      if (state) {
        if (state.type == "select") {
          this.setValue(state.value);
        }
      }
    },

    beforeDestroy: function () {},
  },
  mounted() {},
};
</script>
