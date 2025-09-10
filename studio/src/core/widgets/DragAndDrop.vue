<template>
    <div
      class="MatcWidgetTypeDragAndDropUpload"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ 'is-dragover': isDragOver }"
    >
      <div class="MatcWidgetTypeUploadLabel" ref="labelNode" v-if="!icon">
        {{ label }}
      </div>
      <span
        v-else
        :class="[icon, 'MatcWidgetTypeUploadIcon']"
        :style="{ 'font-size': size }"
      />
      <input
        type="file"
        class="MatcWidgetTypeUploadFile"
        ref="input"
        :accept="accept"
        capture="user"
        @change="onFileChange"
        v-if="isWired"
      />
    </div>
  </template>
  
  <style>
  .MatcWidgetTypeDragAndDropUpload {
    /* Add your styles here */
  }
  .MatcWidgetTypeDragAndDropUpload.is-dragover {
    /* Styles when files are dragged over */
    border: 2px dashed #aaa;
  }
  </style>
  
  <script>
  import DojoWidget from "dojo/DojoWidget";
  import UIWidget from "core/widgets/UIWidget";
  
  export default {
    name: "DragAndDropUpload",
    mixins: [UIWidget, DojoWidget],
    data: function () {
      return {
        value: "",
        style: {},
        model: {},
        bbox: { w: 20, h: 20 },
        isWired: false,
        isDragOver: false
      };
    },
    computed: {
      label() {
        if (this.value && !this.icon && this.value.name) {
          return this.value.name;
        }
        if (this.model && this.model.props) {
          return this.model.props.label;
        }
        return "";
      },
      maxFiles() {
        if (
          this.model &&
          this.model.props &&
          this.model.props.maxFiles !== undefined
        ) {
          return this.model.props.maxFiles;
        }
        return 1;
      },
      icon() {
        if (this.model && this.model.style && this.model.style.icon) {
          return "mdi " + this.model.style.icon;
        }
        return "";
      },
      size() {
        if (this.bbox) {
          return Math.round(Math.min(this.bbox.h, this.bbox.w) * 0.6) + "px";
        }
        return "20px";
      },
      accept() {
        if (this.model && this.model.props && this.model.props.fileTypes) {
          return this.model.props.fileTypes.join(",");
        }
        return "*/*";
      },
      maxFileSize() {
        if (
          this.model &&
          this.model.props &&
          this.model.props.maxFileSize !== undefined
        ) {
          return this.model.props.maxFileSize;
        }
        return Infinity;
      }
    },
    methods: {
      onDragOver() {
        this.isDragOver = true;
      },
      onDragLeave() {
        this.isDragOver = false;
      },
      onDrop(event) {
        this.isDragOver = false;
        let files = event.dataTransfer.files;
        if (files.length > 0) {
          this.handleFiles(files);
        }
      },
      onFileChange() {
        if (this.$refs.input) {
          let files = this.$refs.input.files;
          if (files.length > 0) {
            this.handleFiles(files);
          }
        }
      },
      handleFiles(files) {
        // Convert FileList to Array and filter by maxFiles and maxFileSize
        let fileArray = Array.from(files)
          .slice(0, this.maxFiles)
          .filter(file => file.size <= this.maxFileSize);
  
        this.value = fileArray;
        this.emitDataBinding(this.value);
        this.emitClick();
      },
      postCreate() {
        this._borderNodes = [this.domNode];
        this._backgroundNodes = [this.domNode];
        this._shadowNodes = [this.domNode];
        this._paddingNodes = [this.domNode];
        this._labelNodes = [this.$refs.labelNode];
      },
      wireEvents() {
        this.isWired = true;
        this.wireHover();
      },
      getLabelNode() {
        if (!this.icon) {
          return this.$refs.labelNode;
        }
      },
      render(model, style, scaleX, scaleY) {
        this.model = model;
        this.bbox.w = model.w;
        this.bbox.h = model.h;
        this.style = style;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
  
        this.setStyle(style, model);
        if (model.props && model.props.label) {
          this.setValue(model.props.label);
        }
      },
      getValue() {
        return this.value;
      },
      setValue(value) {
        this.value = value;
      },
      getState() {
        return {
          type: "value",
          value: ""
        };
      },
      setState(state) {
        if (this.hackValueLabel) {
          return;
        }
        if (state && state.type == "value") {
          this.setValue(state.value);
        }
      },
      resize(pos) {
        this.bbox.w = pos.w;
        this.bbox.h = pos.h;
      },
      onClick(e) {
        this.stopEvent(e);
        this.emitClick(e);
      }
    }
  };
  </script>
  