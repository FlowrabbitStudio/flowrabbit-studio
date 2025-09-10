<template>
  <div class="MatcListSearchWarpper"> 
    <div :class="['MatcListSearchCntr', {'MatcListSearchVisible': hasSearchBar}]">
        <div class="MatcSearchForm">
            <input id="MatcAppListSearchField" placeholder="Search" ref="input" v-model="value" @change="onChange" @keyup="onChange" @blur="onBlur"/>
            <span class="mdi mdi-magnify MatcCreateSearchBtn" aria-hidden="true" @click="onShow"/>
        </div>
    </div>
  </div>
</template>

<script>

export default {
  data: function() {
    return {
      value: '',
      hasSearchBar: false,
    };
  },
  methods: {
      onBlur () {
          this.hasSearchBar = this.value.length > 0
      },
      onChange () {
        this.$emit('input', this.value)
        this.$emit('change', this.value)
      },
      onShow () {
          this.hasSearchBar = true
          this.$refs.input.focus()
      }
  },
  mounted () {
  }
}
</script>

