<template>
  <ZoomDialog ref="dialog">
    <div class="dialog-container">
      <h2>Secret Details</h2>
      <div class="details">
        <div><strong>Label:</strong> {{ secret.label }}</div>
        <div><strong>Name:</strong> {{ secret.name }}</div>
        <div><strong>Token:</strong> <span class="token">{{ secret.value }}</span></div>
        <div><strong>Domain:</strong> {{ secret.domain }}</div>
        <div><strong>Brand:</strong> {{ secret.brand }}</div>
      </div>
      <div class="button-bar">
        <button class="button" @click="close">Close</button>
      </div>
    </div>
  </ZoomDialog>
</template>

<script>
import ZoomDialog from 'common/ZoomDialog';

export default {
  name: 'SecretDetails',
  components: {
    ZoomDialog
  },
  data() {
    return {
      secret: {}
    };
  },
  methods: {
    show(secret) {
      this.secret = { ...secret };
      this.$refs.dialog.show();
    },
    showDeleteConfirmation(secret, deleteCallback) {
      this.secret = { ...secret };
      this.deleteCallback = deleteCallback;
      this.$refs.dialog.show();
    },
    close() {
      this.$refs.dialog.close();
    }
  }
};
</script>

<style scoped>
.dialog-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.details {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.token {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.button-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  font-size: 14px;
}

.button:hover {
  background-color: #0056b3;
}
</style>
