
<template>
    <div class="MatcWidget MatchWidgetTypeColumnContainer MatcEventedWidget MatcSimulatorClickable">
        cols
    </div>
  </template>
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import lang from "dojo/_base/lang";
  import css from "dojo/css";
  import UIWidget from "core/widgets/UIWidget";
  import DomBuilder from "common/DomBuilder";
  
  export default {
    name: "ColumnContainer",
    mixins: [UIWidget, DojoWidget],
    data: function() {
      return {
        value: "",
        model: null
      };
    },
    components: {},
    computed: {
        label () {
          if (this.model && this.model.props && this.model.props.label) {
              return this.model.props.label
          }
          return ''
        }
    },
    methods: {
      postCreate() {
        this._borderNodes = [];
        this._backgroundNodes = [];
        this._shadowNodes = [];
        this._paddingNodes = [this.domNode];
        this._labelNodes = [this.labelNode];
      },
  
      wireEvents() {
        this.own(this.addClickListener(this.domNode, lang.hitch(this, "onClick")));
        this.wireHover()
      },
  
      getLabelNode() {
        return this.labelNode;
      },

      resize (box) {
        const gap =  this._getBorderWidth(this.style.gap)
        const cols = this.style.cols
        const totalGap =  (cols - 1) * gap
        let width = (box.w - totalGap) / cols

       
        const app = this.factory.model
        if (app && app.grid && app.grid.enabled) {
            const gridW = app.grid.w
            width = width - (width % gridW)
        }

        const rest = box.w - ((width * cols) + totalGap)
         
        this.snappLinesX = []
        for (let i=0; i< cols; i++ ) {
            const left = Math.round((i * (width + gap)))
            const colNode = this._colNodes[i]
            if (i == cols - 1) {
              colNode.style.width = (width + rest) + 'px'
            } else {
              colNode.style.width = width + 'px'
            }   
            colNode.style.left= left + 'px'
            this.snappLinesX.push(left)
            this.snappLinesX.push(left + width)
        }
    },
  
      render(model, style, scaleX, scaleY) {
        this.model = model;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this._colNodes = []
        this.domNode.innerText = ""
        this._backgroundNodes = []
        this._borderNodes = []
        this._shadowNodes = []

        if (style.cols > 0) {
            for (let i=0; i< style.cols; i++ ) {
                const col = this.db.div("MatchWidgetTypeColumnContainerColumn").build(this.domNode)
                this._colNodes.push(col)
                this._backgroundNodes.push(col)
                this._borderNodes.push(col)
                this._shadowNodes.push(col)
            }
        }

        if (style.cols > 1) { 
          css.add(this.domNode, "MatchWidgetTypeColumnContainerMulti")
        } else {
          css.remove(this.domNode, "MatchWidgetTypeColumnContainerMulti")
        }
        
        this.setStyle(style, model);
        this.resize(model)
      },
  
      updateScale (model, style, scaleX, scaleY) {
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this.setStyle(style, model);
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
    },
    mounted() {
        this.db = new DomBuilder()
    }
  };
  </script>