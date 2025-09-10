
<template>
    <div class="MatcWidgetTypeRadioBox">
      <div data-dojo-attach-point="back">
        <span class="MatcWidgetTypeRadioBoxCircle" data-dojo-attach-point="hook"></span>
      </div>
    </div>
  </template>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import css from "dojo/css";
  import lang from "dojo/_base/lang";
  import topic from "dojo/topic";
  import UIWidget from "core/widgets/UIWidget";
  
  export default {
    name: "RadioBox",
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
        this._borderNodes = [this.domNode];
        this._backgroundNodes = [this.domNode];
        this._shadowNodes = [this.domNode];
      },
  
      wireEvents () {
        this.own(this.addClickListener(this.domNode, lang.hitch(this, "onChange")));
        this.own(topic.subscribe(this.topic, lang.hitch(this, "onOtherChecked")));
        this.wireHover()
      },
  
      onOtherChecked (event) {
        if (event && this.model && event.id != this.model.id) {
          this.setValue(false);
        }
      },
  
      render (model, style, scaleX, scaleY) {
        this.model = model;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this.setStyle(style, model);
  
        /**
         * Legacy
         */
        if (model.props.colorButton) {
          this.hook.style.background = model.props.colorButton;
        }
  
        if (model.style.colorButton) {
          this.hook.style.background = model.style.colorButton;
        }
  
        this.setValue(model.props.checked);
      },
  
 
    },
    mounted() {}
  };
  </script>