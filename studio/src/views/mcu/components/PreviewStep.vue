<template>
  <div class="preview-step">
    <h3>Preview Imported Secrets</h3>
    <div class="scroll-container-horizontal">
      <table>
        <thead>
          <tr>
            <th v-for="field in fields" :key="field">{{ field }}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(secret, index) in secrets" :key="index">
            <td v-for="field in fields" :key="field">
              <input
                v-model="secret[field]"
                @input="onUpdate(secret)"
                class="input-field"
              />
            </td>
            <td>
              <button
                @click="$emit('remove-secret', index)"
                class="delete-row-button"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination-controls">
      <div class="pagination-size">
        <label for="items-per-page">Items per page:</label>
        <select
          id="items-per-page"
          v-model="localItemsPerPage"
          @change="onSetItemsPerPage"
          class="select-input"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
      <div class="pagination-buttons">
        <button
          @click="$emit('previous-page')"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          @click="$emit('next-page')"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    secrets: Array,
    fields: Array,
    currentPage: Number,
    totalPages: Number,
    itemsPerPage: Number,
  },
  data() {
    return {
      localItemsPerPage: this.itemsPerPage,
    };
  },
  watch: {
    itemsPerPage(newVal) {
      this.localItemsPerPage = newVal;
    },
  },
  methods: {
    onUpdate(secret) {
      this.$emit("update-secret", secret);
    },
    onSetItemsPerPage() {
      this.$emit("set-items-per-page", parseInt(this.localItemsPerPage));
    },
  },
};
</script>
