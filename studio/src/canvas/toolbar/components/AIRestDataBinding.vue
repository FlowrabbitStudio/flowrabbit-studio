<template>
  <div>
    <div
      v-for="item in items"
      :key="item.id"
      class="MatcToolbarRestDataBindingRow"
    >
      <div v-for="match in extractDatabindingValues(item.value)" :key="match">
        <span class="MatcToolbarRestDataBindingRowLabel"
          >{{ item.label || item.id }} ({{ match }})</span
        >
        <FileButton
          v-if="item.type === 'file'"
          class="MatcToolbarRestDataBindingFile"
          :value="databingValues[match]"
          @change="onChangeDataBinding($event, match)"
          :label="`Select a file for ${item.label || item.id}`"
        />
        <input
          v-else
          v-model="databingValues[match]"
          @change="onChangeDataBinding($event, match)"
          class="form-control"
        />
      </div>
    </div>
  </div>
</template>
<script>
import FileButton from "common/FileButton";
import RestUtil from 'src/util/RestUtil';

export default {
  name: "AIRestDataBinding",
  props: {
    items: {
      type: Array,
      required: true,
    },
    rest: {
      type: Object,
      required: true,
    },
    databingValues: {
      type: Object,
      required: true,
    },
  },
  components: {
    FileButton,
  },
  methods: {
    extractDatabindingValues(value) {
      let matches = [];
      RestUtil.parseString(value, matches);
      return matches;
    },
    onChangeDataBinding(event, key) {
      this.$emit('update:databingValues', { ...this.databingValues, [key]: event.target ? event.target.value : event });
    },
  },
};
</script>