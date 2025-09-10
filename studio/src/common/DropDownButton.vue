
<template>
  <div class="VommondDropDownButton">
    <div type="button" data-dojo-attach-point="button">
      <span data-dojo-attach-point="label"></span>
      <span class="mdi mdi-chevron-down"></span>
    </div>
    <div class="VommondDropDownPopUp" role="menu" data-dojo-attach-point="popup">
      <ul class role="menu" data-dojo-attach-point="ul"></ul>
    </div>
  </div>
</template>
<script>
import DojoWidget from "../dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import win from "dojo/_base/win";
import Logger from "common/Logger";
import topic from 'dojo/topic'
import domGeom from 'dojo/domGeom'

var _openVommondDropDownButton = null;

export default {
  name: "DropDownButton",
  mixins: [DojoWidget],
  props: ["l", "options", "value", "isDialog", 'disabled', 'defaultOption'],
  data: function () {
    return {
      selected: false,
      hasObjects: false,
      updateLabel: true,
      maxLabelLength: -1,
      openCSS: "VommondDropDownButtonOpen",
      iconCSS: "VommondDropDownIcon",
      labelCSS: "VommondDropDownLabel",
      selectedCSS: "VommondDropDownButtonSelected",
      backdropCSS: "VommondDropDownButtonBackdrop"
    };
  },
  components: {},
  methods: {
    postCreate() {
      this.own(on(this.domNode, touch.press, lang.hitch(this, "showDropDown")));
      if (this.l) {
        this.setLabel(this.l);
      }
      if (this.options) {
        this.setOptions(this.options);
      }
      if (this.value) {
        this.setValue(this.value);
      }
    },

    showDropDown(e) {
 
      this.stopEvent(e);
      topic.publish("matc/toolbar/click", "");
      if (this.disabled) {
        console.debug('showDropDown() > Disabled')
        return
      }

      if (this._dropDownOpen) {
        this.hideDropDown();
        this._dropDownOpen = false;
      } else {
        if (_openVommondDropDownButton) {
          if (_openVommondDropDownButton.hideDropDown) {
            _openVommondDropDownButton.hideDropDown();
          } else {
            console.debug("showDropDown() Strange Open", _openVommondDropDownButton);
          }
        }

        if (this.isDialog) {
          this.teleportToBody()
          css.add(this.popup, "");
        } else {
          css.add(this.domNode, this.openCSS);
        }


        this._mouseDownListener = on(win.body(), "mousedown", lang.hitch(this, "hideDropDown"));
        _openVommondDropDownButton = this;
        this._dropDownOpen = true;
      }
    },

    teleportToBody () {
      this._popupAtBody = true;
			this.domNode.removeChild(this.popup);

      this.backdrop = document.createElement("div")
      this.backdrop.ariaHidden = false
      css.add(this.backdrop, this.backdropCSS)
      this.backdrop.appendChild(this.popup)
    
      // FIXME: CAN WE PREVENT SCROLLING ON backdrop

			win.body().appendChild(this.backdrop);

      let pos = domGeom.position(this.domNode)
      this.popup.style.top = (pos.y + pos.h) + 'px'
      this.popup.style.left =(pos.x) + 'px'
      this.popup.style.width =(pos.w) + 'px'
     
    },

    teleportToDom() {
      if (this.backdrop) {
        this.backdrop.removeChild(this.popup)
        this.domNode.appendChild(this.popup)
        if (this.backdrop.parentNode) {
          this.backdrop.parentNode.removeChild(this.backdrop)
        }
      }
    
    },

    hideDropDown() {
      try {
        if (this.domNode) {
          css.remove(this.domNode, this.openCSS);
        }
        if (this._mouseDownListener) {
          this._mouseDownListener.remove();
        }
        this.teleportToDom()
        _openVommondDropDownButton = null;
        this._dropDownOpen = false;
      } catch (e) {
        console.error("hideDropDown", e);
      }
    },

    setOptions(list) {
      this._lis = {};
      this._options = list;
      this.renderOptions(list);
    },

    renderOptions(list) {
      this.ul.innerHTML = "";
      let selectedValue = null;
      for (let i = 0; i < list.length; i++) {
        const o = list[i];
        const li = document.createElement("li");

        if (o.label || o.icon) {
          this.hasObjects = true;
          if (o.icon) {
            var icon = document.createElement("span");
            css.add(icon, this.iconCSS);
            css.add(icon, o.icon);
            li.appendChild(icon);
          }
          if (o.label) {
            var lbl = document.createElement("label");
            css.add(lbl, this.labelCSS);
            lbl.innerHTML = o.label;
            li.appendChild(lbl);
          }
          if (o.selected) {
            selectedValue = o.value;
          }
          if (o.css) {
            css.add(li, o.css);
          }
          this.own(on(li, touch.press, lang.hitch(this, "onChange", o.value)));
          this._lis[o.value] = li;
        } else {
          li.innerHTML = o;
          this._lis[o] = li;
          this.own(on(li, touch.press, lang.hitch(this, "onChange", list[i])));
        }
        this.ul.appendChild(li);
      }
      if (selectedValue) {
        this.setValue(selectedValue);
      }
    },

    setLabel(value) {
      this.label.innerHTML = "";

      if (this.lastCSS) {
        css.remove(this.domNode, this.lastCSS);
      }

      if (this.hasObjects && this.updateLabel) {
        for (let i = 0; i < this._options.length; i++) {
          const o = this._options[i];
          if (value == o.value) {
            this._updateLabel(o);
            // return here to avoid default!
            return
          }
        }

        // add the possibility of showing a default option
        if (this.defaultOption) {
          this._updateLabel(this.defaultOption);
        }

      } else if (value) {
        this.label.innerHTML = value;
      }
    },

    _updateLabel(o) {
      if (o.icon) {
        const icon = document.createElement("span");
        css.add(icon, this.iconCSS);
        css.add(icon, o.icon);
        this.label.appendChild(icon);
      }

      if (o.label) {
        const lbl = document.createElement("span");
        css.add(lbl, this.labelCSS);

        let l = o.label;
        if (this.maxLabelLength > 0) {
          if (l.length > this.maxLabelLength) {
            l = l.substring(0, this.maxLabelLength) + "...";
          }
        }

        lbl.innerHTML = l;
        this.label.appendChild(lbl);
      }

      if (o.css) {
        css.add(this.domNode, o.css);
        this.lastCSS = o.css;
      }
    },

    setValue(value) {
      if (this._selectedLi) {
        css.remove(this._selectedLi, this.selectedCSS);
      }

      if (this._lis && this._lis[value]) {
        css.add(this._lis[value], this.selectedCSS);
        this._selectedLi = this._lis[value];
      }

      if (this.updateLabel) {
        this.setLabel(value);
      }
      this.selected = value;
    },

    onChange(value, e) {
      this.stopEvent(e);
      this.hideDropDown();
      if (this.updateLabel) {
        this.setLabel(value);
      }
      this.setValue(value);
      this.emit("change", value, e);
      this.emit("input", this.selected);
    }
  },
  watch: {
    value(v) {
      this.setValue(v);
    },
    options(newOptions) {
        this.setOptions(newOptions);
    }
  },
  mounted() {
    this.logger = new Logger("DropDownButton");
    this.logger.log(10, "mounted", "enter");
  },
  beforeDestroy() {
    // Cleanup listeners or any other bound resources
    if (this._mouseDownListener) {
        this._mouseDownListener.remove();
    }
    this.teleportToDom();  // Return any teleported elements back to their original place
  }
};
</script>