<template>
  <div class="column-mapping-step">
    <table>
      <thead>
        <tr>
          <th>Excel Column</th>
          <th>Mapped to</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(header, index) in headers" :key="index">
          <td>{{ header }}</td>
          <td>
            <select
              :value="localMappedHeaders[index]"
              @change="(event) => onChangeInput(index, event)"
              class="select-input"
            >
              <option value="">Ignore</option>
              <option v-for="field in availableFields" :key="field" :value="field">
                {{ field }}
              </option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="add-column-section">
      <input
        type="text"
        v-model="newColumnName"
        placeholder="New column name"
        class="input-field"
      />
      <button @click="onAddColumn" class="add-column-button">
        Add Custom Column
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    headers: Array,
    mappedHeaders: Array,
    availableFields: Array,
  },
  data() {
    return {
      newColumnName: "",
      localMappedHeaders: [...this.mappedHeaders],
    };
  },
  watch: {
    mappedHeaders(newVal) {
      this.localMappedHeaders = [...newVal];
    },
  },
  methods: {
    onChangeInput(index, event) {
      this.$set(this.localMappedHeaders, index, event.target.value);
      this.$emit("update-mapped-headers", this.localMappedHeaders);
    },
    onAddColumn() {
      if (
        this.newColumnName &&
        !this.availableFields.includes(this.newColumnName)
      ) {
        this.$emit("add-column", this.newColumnName);
        this.newColumnName = "";
      } else {
        alert("Please enter a unique column name.");
      }
    },
  },
};
</script>
