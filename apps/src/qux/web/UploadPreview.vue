<template>
  <div
    :class="['qux-upload-preview', cssClass, { 'mdi mdi-image': !hasValidImage }]"
    @click="onClick"
    :style="hasValidImage ? { backgroundImage: src } : {}"
  >
  </div>
</template>

<style lang="scss">
@import '../scss/qux-upload-preview.scss';
</style>

<script>
import _Base from "./_Base.vue";
import Logger from "../core/Logger";

export default {
  name: "qUploadPreview",
  mixins: [_Base],
  data: function () {
    return {
      dataURL: "",
      placeholder: "",
    };
  },
  computed: {
    hasValidImage() {
      let file = this.dataBindingInput;
      return (
        (file && file.name && file.size) ||
        (file && file.url) ||
        (file && file.indexOf && file.indexOf("http") === 0)
      );
    },
    src() {
      let file = this.dataBindingInput;
      if (file && file.name && file.size) {
        this.setFile();
        return this.dataURL;
      }
      if (file && file.url) {
        return 'url(' + file.url + ')';
      }
      if (file && file.indexOf && file.indexOf("http") === 0) {
        return 'url(' + file + ')';
      }
      return ""; // No background image if no valid file
    },
  },
  methods: {
    setFile() {
      Logger.log(1, "qUploadPreview.setFile()");
      let file = this.dataBindingInput;
      if (file && file.name && file.size) {
        let reader = new FileReader();
        if (reader.readAsDataURL) {
          reader.onload = () => {
            this.dataURL = "url(" + reader.result + ")";
          };
          reader.readAsDataURL(file);
        }
      }
    },
  },
  watch: {
    value(v) {
      this.setFile(v);
    },
  },
  mounted() {
    Logger.log(4, "qUploadPreview.mounted()");
    this.setFile();
  },
};
</script>