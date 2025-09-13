<template>
  <div class="dialog-backdrop" @click="closeDialog">
    <div class="dialog" @click.stop>
      <div class="dialog-header">
        <h3>URL Preview</h3>
        <button class="close-button" @click="closeDialog">X</button>
      </div>
      <div class="dialog-content">
        <iframe
          v-if="!iframeError"
          :src="url"
          class="dialog-iframe"
          @error="handleIframeError"
        ></iframe>
        <div v-else class="error-message">
          <p>The URL cannot be displayed in an iframe. Please open it directly:</p>
          <a :href="url" target="_blank">{{ url }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DialogComponent",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      iframeError: false,
    };
  },
  methods: {
    closeDialog() {
      this.$emit("close");
    },
    handleIframeError() {
      this.iframeError = true;
    },
  },
};
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  width: 80%;
  max-width: 600px;
  max-height: 80%;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 10px;
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.dialog-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.dialog-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex-grow: 1;
}

.error-message {
  padding: 20px;
  text-align: center;
}

.error-message p {
  margin-bottom: 10px;
}
</style>
