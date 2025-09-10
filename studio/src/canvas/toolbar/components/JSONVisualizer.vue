<template>
  <div class="json-visualizer">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="typeof jsonData === 'object'">
        <div class="jsonMessage" v-if="init && jsonData.length > 0">Showing the first 10 elements</div>
        <div v-for="(value, key) in jsonData" :key="key">
          <div @click="toggleCollapse(key)" class="json-key">
            <span v-if="isObject(value)" class="toggle-icon">
              <i :class="['mdi', collapsedKeys.includes(key) ? 'mdi-plus-box-outline' : 'mdi-minus-box-outline']"></i>
            </span>
            <span class="key-name">{{ key }}:</span>
            <template v-if="!isObject(value)">
              <span v-if="typeof value === 'string'" class="string-value json-value">"{{ value }}"</span>
              <span v-else class="json-value">{{ value }}</span>
            </template>
            <span v-if="collapsedKeys.includes(key) && Array.isArray(value)">
                [{{value.length}}]
            </span>
          </div>
          <div v-if="!collapsedKeys.includes(key) && isObject(value)" class="value-container">
            <div v-if="Array.isArray(value)">
              <div v-for="(item, index) in value" :key="index" class="array-item">
                <div class="array-item-key">
            
                  <span v-if="isObject(item)" class="toggle-icon">
                    <i :class="['mdi', collapsedKeys.includes(key + '.' + index) ? 'mdi-plus-box-outline' : 'mdi-minus-box-outline']" @click="toggleCollapse(key + '.' + index)"></i>
                  </span>
                  <span class="index">{{ index }}:</span>
                  <span class="json-value"  v-if="!isObject(item)">
                    {{item}}
                  </span>    
                </div>
                <template v-if="!collapsedKeys.includes(key + '.' + index)">                 
                    <template v-if="isObject(item)">
                      <div class="value-container">
                        <JSONVisualizer :jsonData="item" :collapsedKeys="collapsedKeys" />
                      </div>
                    </template>           
                </template>
              </div>
            </div>
            <div v-else-if="isObject(value)">
              <!-- Render the recursive component -->
              <JSONVisualizer :jsonData="value" :collapsedKeys="collapsedKeys" />
            </div>
            <div v-else>
              <!-- Render object properties -->
              <div class="object-item" v-for="(itemValue, itemKey) in value" :key="itemKey">
                <span class="object-key">{{ itemKey }}:</span>
                <span class="object-value json-value">{{ itemValue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <span class="value">{{ jsonData }}</span>
      </div>

    </div>
  </div>
</template>
<style scoped>
@import url('../../../style/jsonvisualizer.css');
</style>
<script>
export default {
  name: "JSONVisualizer",
  props: {
    collapsedKeys: {
      type: Array,
      default: () => []
    },
    init: {
      type: Boolean
    }
  },
  data() {
    return {
      error: null
    };
  },
  methods: {
    toggleCollapse(key) {
      const index = this.collapsedKeys.indexOf(key);
      if (index === -1) {
        this.collapsedKeys.push(key);
      } else {
        this.collapsedKeys.splice(index, 1);
      }
    },
    isObject(value) {
      return typeof value === 'object' && value !== null;
    }
  },
  computed: {
    jsonData() {
      const data = this.$attrs.jsonData;
      if (!data) return {};
      return data;
    }
  }
};
</script>