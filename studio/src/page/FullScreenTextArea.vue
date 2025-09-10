<template>
    <div :class="['MatcAutoCompleteTextarea', {'MatcAutoCompleteTextareaFullScreen': isFullScreen}]">
      <div class="MatcAutoCompleteTextareaFullScreenBackdrop" v-if="isFullScreen" @click.stop="isFullScreen = false"></div>
      <div class="MatcAutoCompleteTextareaCntr" ref="cntr">
        <QIcon :icon="icon" @click.stop="showFullScreen" v-if="disabled !== true"></QIcon>
        <textarea
          class="MatcIgnoreOnKeyPress form-control textarea-wrapper"
          @keyup="onChange"
          ref="textarea"
          :disabled="disabled"
          @blur="onChange"
          @input="onChange"
          :placeholder="placeholder"
          v-model="text"
        ></textarea>
      </div>
    </div>
  </template>
  
  <style lang="scss">
  @import url("../style/scss/autocomplete.scss");
  </style>
  
  <script>
  import QIcon from './QIcon.vue'
  
  export default {
    name: "FullScreenTextArea",
    props: ["value", "placeholder", "disabled"],
    data() {
      return {
        isFullScreen: false,
        text: ''
      };
    },
    components: {
      'QIcon':QIcon
    },
    computed: {
      icon() {
        return this.isFullScreen ? 'Minimize' : 'Maximize'
      }
    },
    methods: {
      showFullScreen () {
        this.isFullScreen = !this.isFullScreen
      },
     
      onChange() {
        this.$emit("change", this.text);
        this.$emit("input", this.text);
      }
    },
    watch: {
      value(v) {
        this.text = v;
      },
    },
   
    mounted() {
        if (this.value) {
          this.text = this.value;
        }
    },
  };
  </script>
  