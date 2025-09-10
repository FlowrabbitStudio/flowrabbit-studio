<template>
  <div class="MatcToolbarDropDownButton MatcToolbarArrowDropDown MatcToolbarItem" @mousedown.stop="showPopup" @mouseup.stop="">
    <QIcon icon="AISparkles" class=""></QIcon>

    <div
      class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup MatcToolbarPopUpOpen MatcToolbarPopUp--top"
      role="menu"
      v-if="hasPopup"
      @mouseup.stop=""
      @mousedown.stop=""
    >
      <div class="MatcToolbarPopUpWrapper">
        <ul class role="menu" data-dojo-attach-point="ul">
          <div>
            <li>
              <div class="MatcToolbarPopUpContentWrapper" @click="onText2UI">
                <QIcon icon="AISparkles" class="MatcToolbarPopUpIcon"></QIcon>
                <label class="MatcToolbarPopUpLabel">Text to UI</label>
              </div>
            </li>
            <li>
              <div class="MatcToolbarPopUpContentWrapper" @click="onText2JS">
                <QIcon icon="AIJS" class="MatcToolbarPopUpIcon"></QIcon>
                <label class="MatcToolbarPopUpLabel">Text to Script</label>
              </div>
            </li>
            <li>
              <div class="MatcToolbarPopUpContentWrapper" @click="onFormWizard">
                <QIcon icon="AIForm" class="MatcToolbarPopUpIcon"></QIcon>
                <label class="MatcToolbarPopUpLabel">Form Assistant</label>
              </div>
            </li>
          </div>
        </ul>
      </div>
      <!-- end MatcToolbarPopUpWrapper-->

      <div class="MatcToolbarPopUpArrowCntr MatcToolbarPopUpArrowCntr--top">
        <div class="MatcToolbarPopUpArrow MatcToolbarPopUpArrow--top"></div>
      </div>
    </div>
  </div>
</template>
<script>
import lang from "dojo/_base/lang";
import on from "dojo/on";
import topic from "dojo/topic";
import Logger from "common/Logger";
import win from "dojo/win";
import QIcon from "page/QIcon";

export default {
  name: "ViewConfig",
  mixins: [],
  props: ["value", "analytic"],
  data: function () {
    return {
      hasPopup: false,
      hasIcon: false,
    };
  },
  computed: {},
  components: {
    QIcon: QIcon,
  },
  methods: {
    onText2UI(e) {
      this.hidePopup();
      this.$emit("text2ui", e);
    },

    onText2JS (e) {
      this.hidePopup();
      this.$emit("text2js", e);
    },

    onFormWizard(e) {
      this.hidePopup();
      this.$emit("formWizard", e);
    },

    showPopup() {
      this.hasPopup = true;
      /**
       * this will force all other popups to close
       */
      topic.publish("matc/canvas/click", "", "");
      /**
       * the canvas can register to this to flush stuff
       */
      topic.publish("matc/toolbar/click", "");

      this._mouseDownListener = on(win.body(), "mousedown", lang.hitch(this, "hidePopup"));
      this._topicListener = topic.subscribe("matc/canvas/click", lang.hitch(this, "onCanvasClick"));
      this._escListener = topic.subscribe("matc/canvas/esc", lang.hitch(this, "hidePopup"));
      this._dialogListner = topic.subscribe("vommond/dialog/open", lang.hitch(this, "hidePopup"));

      this.ignoreHide = false;
    },

    onCanvasClick() {
      /**
       * A lot if the changes we trigger a rerender, which will as a result also
       * trigger a 'matc/canvas/click'. We want to be able to ignore this once!
       */
      if (this.ignoreHide) {
        this.ignoreHide = false;
        return;
      }
      this.hidePopup();
    },

    hideMaybe() {
      // this.ignoreHide = true
      this.hidePopup();
    },

    hidePopup() {
      this.hasPopup = false;
      if (this._mouseDownListener) {
        this._mouseDownListener.remove();
        delete this._mouseDownListener;
      }
      if (this._topicListener) {
        this._topicListener.remove();
        delete this._topicListener;
      }
      if (this._escListener) {
        this._escListener.remove();
        delete this._escListener;
      }
      if (this._dialogListner) {
        this._dialogListner.remove();
        delete this._dialogListner;
      }
    },
  },
  watch: {},
  mounted() {
    this.log = new Logger("AIMenu");
  },
};
</script>
