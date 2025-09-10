
<template>
  <div class="MatcList">
    <div class="MatcListContainer" data-dojo-attach-point="container">Loading...</div>
  </div>
</template>
<style>
@import url("../style/list.css");
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import Logger from "common/Logger";
import DomBuilder from "common/DomBuilder";

export default {
  name: "List",
  mixins: [DojoWidget],
  data: function () {
    return {
      columns: 3,
      spacing: 20,
      minSpacing: 10,
      maxElementsToRender: 1000,
      maxElementsToRenderStep: 200,
      colWidth: 220,
      grid: false,
      add: false,
      table: false,
      animate: true,
      isMobile: false
    };
  },
  components: {},
  methods: {
    constructor() {
      this.log = new Logger("List");
    },

    setValue(value) {
      this.render(value, this.animate);
    },

    setColumns(value) {
      this.columns = value;
    },

    setSpacing(value) {
      this.spacing = value;
    },

    setItemFct(fct) {
      this.itemRenderFct = fct;
    },

    render(list, animate) {
      this.log.log(0, "render", "enter > " + list.length);

      // if (this.colWidth > 0) {
      //   let w = domGeom.position(this.container).w;
      //   this.columns = Math.floor(w / (this.colWidth + this.minSpacing));
      //   this.log.log(3, "render", "Set columns to " + this.columns);
      // }

      // var width = this.getColWidth();
      // var spacing = this.getSpacing();

      this.container.innerHTML = "";

      const parent = document.createElement("div");
      css.add(parent, 'MatcFlexList')

      if (this.canAdd && !this.isMobile) {
        let item = document.createElement("div");
        css.add(item, "MatcListItem");
        this.onRenderAdd(item);
        parent.appendChild(item);
      }

      var end = this.getElementsToRender(list);
      for (let j = 0; j < end; j++) {
        const element = list[j];
        let item = document.createElement("div");
        css.add(item, "MatcListItem");
        this.renderItem(item, element, j);
        parent.appendChild(item);

        if (animate) {
          css.add(item, "MatcListItemHidden MatcListItemAnimated");
          this.showItem(item, j);
        }
      }

      /**
       * Finalize rendering and attach to dom
       */
      this.container.appendChild(parent);

      this._list = list;

      this.onRenderDone(list);

      this.renderMore(list, parent);

      this.log.log(0, "render", "exit > ");
    },

    renderMore(list, parent) {
      this.log.log(2, "renderMore", "enter " + this.maxElementsToRender + " < " + list.length);
      if (this.maxElementsToRender < list.length) {
        const db = new DomBuilder();
        const more = db
          .div("MatcCenter MatcMarginBottom")
          .a("MatcButton", "Show More...")
          .build(parent);
        this.tempOwn(on(more, "click", lang.hitch(this, "showMore", list)));
      }
    },

    showMore(list) {
      this.maxElementsToRender = Math.min(
        list.length,
        this.maxElementsToRenderStep + this.maxElementsToRender
      );
      this.log.log(2, "showMore", "exit " + this.maxElementsToRender + " > " + list.length);
      this.onResize();
    },

    getElementsToRender(list) {
      this.log.log( 2,"getElementsToRender", "enter " + Math.min(list.length, this.maxElementsToRender));
      return Math.min(list.length, this.maxElementsToRender);
    },

    showItem (item, i) {
      setTimeout(function () {
        css.remove(item, "MatcListItemHidden");
      }, 100 + Math.min(i, 10) * 50);
    },

    /**
     * Template methods for child classes to overwrite
     */
    onRenderDone() { },

    /**
     * Template methods for child classes to overwrite
     */
    onRenderAdd () { },

    /**
     * Template methods for child classes to overwrite
     */
    renderItem (node, element, i) {
      if (this.itemRenderFct) {
        this.itemRenderFct(node, element, i);
      }
    },

    onBeforeResize () { },

    

    cleanUp () {
      this._colsCreated = false;
      this.cols = true;
    },

    onResize  () {
      this.log.log(0, "onResize", "enter");

      this.cleanUp();

      this.onBeforeResize();

      if (this._list) {
        this.render(this._list);
      }
    }
  },
  mounted() { }
};
</script>