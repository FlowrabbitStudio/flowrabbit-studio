<template>
  <div :class="['qux-combo', cssClass, { 'qux-error': hasError }, { 'qux-open': isOpen }]" role="combobox" aria-haspopup="listbox" aria-expanded="isOpen">
    <input
      class="qux-combo-input"
      @keyup="onKeyPress"
      v-model="inputValue"
      :placeholder="placeholder"
      @input="onInputChange"
      @blur="onBlur"
      @focus="onFocus"
      ref="comboInput"
      role="textbox"
      aria-autocomplete="list"
      aria-controls="qux-combo-list"
      :aria-activedescendant="activeDescendant"
    />
    <div class="qux-combo-popup" v-if="isOpen &&( matches.length > 0 || element?.props?.openOnFocus)" role="listbox" id="qux-combo-list">
      <span
        v-for="(o, i) in matches"
        :key="o.value"
        :id="`qux-combo-item-${i}`"
        :class="['qux-combo-item', { 'qux-combo-item-selected': i === selectedIndex }]"
        @mousedown.stop.prevent="select(o)"
        role="option"
        :aria-selected="i === selectedIndex"
      >
        {{ o.label }}
      </span>
    </div>
  </div>
</template>

<style lang="scss">
@import "../scss/qux-combo.scss";
</style>

<script>
import _Base from "./_Base.vue";
import _DND from "./_DND.vue";
import Logger from "../core/Logger";
import debounce from "lodash/debounce";

export default {
  name: "qCombo",
  mixins: [_Base, _DND],
  data: function () {
    return {
      inputValue: "",
      isOpen: false,
      selected: null,
      matches: [],
      selectedIndex: -1,
      debounceSearch: null,
    };
  },
  created() {
    this.debounceSearch = debounce(this.performSearch, 300);
  },
  computed: {
    activeDescendant() {
      return this.selectedIndex >= 0 ? `qux-combo-item-${this.selectedIndex}` : null;
    },
    placeholder() {
      if (this.element && this.element.props && this.element.props.placeholder) {
        return this.element.props.label;
      }
      return "";
    },
    hints() {
      return this.optionsWithValues;
    },
  },
  beforeUnmount() {
    if (this.debounceSearch && this.debounceSearch.cancel) {
      this.debounceSearch.cancel();
    }
  },
  methods: {
    onKeyPress(e) {
      if (this.inputValue.length > 2) {
        this.debounceSearch();
        this.handleArrows(e);
      } else {
        this.close();
      }
    },
    performSearch() {
      const search = this.inputValue.toLowerCase();
      this.matches = this.hints.slice(1).filter((hint) => hint.label.toLowerCase().includes(search));
      if (this.matches.length > 0) {
        this.open();
      } else {
        this.close();
      }
    },
    handleArrows(e) {
      const key = e.key;

      switch (key) {
        case "ArrowDown":
          this.selectedIndex = Math.min(this.matches.length - 1, this.selectedIndex + 1);
          e.preventDefault();
          break;
        case "ArrowUp":
          this.selectedIndex = Math.max(-1, this.selectedIndex - 1);
          e.preventDefault();
          break;
        case "Escape":
          this.onInputChange();
          this.close();
          break;
        case "Enter":
          if (this.selectedIndex >= 0 && this.selectedIndex < this.matches.length) {
            this.select(this.matches[this.selectedIndex]);
          } else {
            this.onInputChange();
          }
          this.close();
          break;
        default:
          this.selectedIndex = -1;
      }
    },
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {
        this.close();
      }
    },
    blur() {
      if (this.$refs.comboInput) {
        this.$refs.comboInput.blur();
      }
    },
    onBlur() {
      this.onInputChange();
      this.close();
    },
    onFocus() {
      if (this.element?.props?.openOnFocus) {
        this.matches = this.hints.slice(1);
        this.open();
      }
    },
    open() {
      this.isOpen = true;
      document.addEventListener("mousedown", this.handleOutsideClick);
    },
    close() {
      this.isOpen = false;
      this.selectedIndex = -1;
      document.removeEventListener("mousedown", this.handleOutsideClick);
    },
    onInputChange() {
      Logger.log(-5, "qCombo.onInputChange()", this.inputValue);
      if (this.element) {
        this.onValueChange(this.inputValue, "default");
      } else {
        this.selected = this.inputValue;
        this.$emit("change", this.selected);
        this.$emit("input", this.selected);
      }
    },
    select(option) {
      Logger.log(-5, "qCombo.select()", option.value);
      if (this.element) {
        this.onValueChange(option.value, "default");
        Logger.log(5, `qCombo.toggle() > ${this.dataBindingInputPath}`, option.value);
      } else {
        this.selected = option.value;
        this.$emit("change", this.selected);
        this.$emit("input", this.selected);
        Logger.log(5, `qCombo.select() > ${this.selected}`);
      }
      this.inputValue = option.label;
      this.close();
    },
  },
  watch: {},
  unmounted() {
    this.close();
  },
  mounted() {
    Logger.log(1, "qCombo.mounted() enter", this.value);
    if (!this.element) {
      this.inputValue = this.value;
    }
    this.fireDefaultValue()
  }
}
</script>
