
<template>
  <div :class="['MatcButton MatcDropDownButton MatcDropDownButtonWidth', {'MatcDropDownButtonDisabled': disabled === true}]">
    <div type="button" class="MatcDropDownButtonButton" data-dojo-attach-point="button">
      <label data-dojo-attach-point="label" class="MatcDropDownLabel"></label>
      <span class="mdi mdi-chevron-down" v-if="disabled !== true"></span>
    </div>
    <div class="MatcDropDownPopUp MatcDropDownButtonWidth" role="menu" data-dojo-attach-point="popup" >
      <ul class role="menu" data-dojo-attach-point="ul"></ul>
    </div>
  </div>
</template>
<script>
import DropDownButton from "common/DropDownButton";

export default {
  name: "DropDownButton",
  mixins: [DropDownButton],
  data: function() {
    return {
      openCSS: "MatcDropDownButtonOpen",
      iconCSS: "MatcDropDownIcon",
      labelCSS: "MatcDropDownLabel",
      selectedCSS: "MatcDropDownButtonSelected",
      backdropCSS: "MatcDropDownButtonBackdrop"
    };
  }
};
</script>