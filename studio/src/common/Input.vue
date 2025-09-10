<template>
  <div :class="wrapperClasses" ref="inputWrapper">
    <div class="input-group">
      <span v-if="selectedIcon" :class="iconClasses"></span>
      <input
        ref="input"
        type="text"
        :class="inputClasses"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        autocomplete="off"
        v-model="displayValue"
        @input="handleInput"
        @keydown="handleKeyDown"
        :aria-expanded="showDropdown"
        aria-haspopup="listbox"
        role="combobox"
        aria-autocomplete="list"
        :aria-controls="dropdownId"
      />
      <div v-if="isDropDown" class="VommondInputDropButton" @click.stop="toggleDropdown">
        <span class="mdi mdi-chevron-down"></span>
      </div>
    </div>
    <div v-if="showDropdown" class="dropdown-menu" :id="dropdownId" role="listbox" @click.stop>
      <div class="dropdown-content VommondInputDropDown">
        <a
          v-for="(hint, index) in filteredHints"
          :key="hint.value"
          @click="selectHint(hint)"
          :class="['dropdown-item', size, { VommonInputSelected: hint.value === inputValue, VommonInputHighlight: index === selectedIndex }]"
          role="option"
          ref="dropdownItem"
          :aria-selected="index === selectedIndex"
        >
          <div v-if="hint.icon" class="dropdown-icon">
            <span :class="hint.icon + ' icon-in-input'" />
          </div>
          {{ hint.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import css from "dojo/css";
export default {
  name: "EnhancedInput",
  mixins: [],
  props: {
    value: {
      type: [String, Number],
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    hints: {
      type: Array,
      default: () => [],
    },
    isDropDown: {
      type: Boolean,
      default: false,
    },
    top: {
      type: Boolean,
      default: false,
    },
    inline: {
      type: Boolean,
      default: false,
    },
    formControl: {
      type: Boolean,
      default: false,
    },
    toolbar: {
      type: Boolean,
      default: false,
    },
    cssClass: {
      type: String,
      default: "",
    },
    fireOnBlur: {
      type: Boolean,
      default: false,
    },
    selectOnEnter: {
      type: Boolean,
      default: false,
    },
    fireEmpty: {
      type: Boolean,
      default: false,
    },
    showHintLabel: {
      type: Boolean,
      default: false,
    },
    change: {
      type: Function,
      default: null,
    },
    actions: {
      type: Array,
      default: () => [],
    },
    magicChar: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      inputValue: this.value,
      displayValue: this.getDisplayValue(this.value),
      selectedIcon: this.getIcon(this.value),
      showDropdown: false,
      selectedIndex: -1,
      toggleClickedTS: 0,
      dropdownId: `dropdown-${Math.random().toString(36).substr(2, 9)}`, // Unique ID for ARIA
    };
  },
  computed: {
    wrapperClasses() {
      return {
        VommondInput: true,
        VommondInputOpenTop: this.top,
      };
    },
    iconClasses() {
      return `${this.selectedIcon} VommondInputDisplayIcon`;
    },
    inputClasses() {
      return [
        "MatcIgnoreOnKeyPress",
        { "form-control": this.formControl },
        { vommondInlineEdit: this.inline },
        this.cssClass,
        { "MatcToobarInput MatcToobarInlineEdit": this.toolbar },
        { VommondInputIcon: this.selectedIcon },
      ];
    },
    filteredHints() {
      const query = this.displayValue && this.displayValue.toLowerCase && this.displayValue.toLowerCase();
      let hints = this.hints.filter((hint) => hint.label.toLowerCase().includes(query));
   
      // if (hints.length === 0 || hints.length === 1 && hints[0].value === this.displayValue) {
      //   hints = this.hints
      // }

      if (this.actions.length) {
        hints = [...hints, ...this.actions];
      }

      return hints;
    },
  },
  watch: {
    value(newVal) {
      this.inputValue = newVal;
      this.displayValue = this.getDisplayValue(newVal);
      this.selectedIcon = this.getIcon(newVal);
    },
    displayValue(newVal) {
      if (!this.isHintLabel(newVal)) {
        this.inputValue = newVal;
        this.selectedIcon = "";
      }
    },
  },
  methods: {
    setCss(clazz) {
      if (this.$refs && this.$refs.input) {
        css.add(this.$refs.message, clazz);
      }
    },
    focus() {
      if (this.$refs && this.$refs.input) {
        this.$refs.input.focus();
      }
    },
    hintWithLabel(label) {
      return this.hints.some((hint) => hint.label === label);
    },
    setPlaceholder(plchldr) {
      this.placeholder = plchldr;
    },
    placeAt(selectorOrElement) {
      const parentElement = typeof selectorOrElement === "string" ? document.querySelector(selectorOrElement) : selectorOrElement;
      if (parentElement) {
        this.$mount(document.createElement("div"));
        parentElement.appendChild(this.$el);
      } else {
        console.error("Invalid element or selector provided for placeAt");
      }
    },
    handleFocus() {
      this.$emit("focus", this.inputValue);
      if (this.isDropDown) {
        this.showDropdown = true;
      }
    },
    blur() {
      this.input.blur();
    },
    handleBlur() {
 
      setTimeout(() => {
        // this is to handle the case when the user clicks on the dropdown
        if (this.ignoreBlur) {
          this.ignoreBlur = false;
          return;
        }
        if (this.inputValue !== undefined || this.fireEmpty) {
          this.emitChange();
          const now = Date.now();
          if (now - this.toggleClickedTS > 300) {
            this.hideDropdown();
          }
        }
      }, 200);
    },
    handleInput(event) {
      this.displayValue = event.target.value;
      this.selectedIcon = "";
      if (this.isDropDown) {
        this.showDropdown = true;
      } else {
        this.showDropdown = this.filteredHints.length > 0;
      }
      this.selectedIndex = -1;
    },
    handleKeyDown(event) {
      const key = event.key;

      switch (key) {
        case "Escape":
          this.hideDropdown();
          break;
        case "ArrowDown":
          event.preventDefault();
          this.navigateDropdown(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          this.navigateDropdown(-1);
          break;
        case "Enter":
          this.handleEnter(event);
          break;
        default:
          break;
      }
    },
    navigateDropdown(direction) {
      if (!this.showDropdown) return;
      const maxIndex = this.filteredHints.length - 1;
      let newIndex = this.selectedIndex + direction;
      if (newIndex < 0) newIndex = 0;
      if (newIndex > maxIndex) newIndex = maxIndex;
      this.selectedIndex = newIndex;
      this.scrollToView();
    },
    handleEnter(event) {
      if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredHints.length) {
        event.preventDefault();
        this.selectHint(this.filteredHints[this.selectedIndex]);
        return;
      }
      const exactMatch = this.hints.find((hint) => hint.label.toLowerCase() === this.displayValue.toLowerCase());

      if (exactMatch) {
        event.preventDefault();
        this.selectHint(exactMatch);
        return;
      }
      if (this.filteredHints.length === 1 && this.selectOnEnter && !this.filteredHints[0].action) {
        event.preventDefault();
        this.selectHint(this.filteredHints[0]);
        return;
      }

      if (this.fireOnBlur) {
        this.emitChange();
      }
    },
    emitChange() {
      if (this.change) {
        this.change(this.inputValue);
      } else {
        this.$emit("change", this.inputValue);
      }
    },
    toggleDropdown() {
      this.toggleClickedTS = Date.now();
      if (this.hints.length === 0 && this.actions.length === 0) {
        this.hideDropdown();
        return;
      }
      this.showDropdown = !this.showDropdown;
      if (this.showDropdown) {
        document.addEventListener("click", this.handleOutsideClick);
      } else {
        this.showDropdown = true;
        this.$nextTick(() => {
          const inputWrapperRect = this.$refs.inputWrapper.getBoundingClientRect();
          this.dropdownStyles = {
            position: "absolute",
            top: `${inputWrapperRect.bottom}px`,
            left: `${inputWrapperRect.left}px`,
            width: `${inputWrapperRect.width}px`,
            zIndex: 9999999,
          };
          document.addEventListener("click", this.handleOutsideClick);
          this.scrollToSelected();
        });
      }
    },
    handleOutsideClick(event) {
      if (!this.$refs.inputWrapper.contains(event.target)) {
        this.hideDropdown();
      }
    },
    selectHint(hint) {
      if (hint.action) {
        this.$emit(hint.action, hint);
      } else {
        this.inputValue = hint.value;
        this.displayValue = hint.label;
        this.selectedIcon = hint.icon || "";
        this.emitChange();
        // The blur event will be fired, and as it has the
        // timeout it would fore after the click event. The
        // prevent this we set this flag.
        this.ignoreBlur = true;
      }
      this.hideDropdown();
    },
    hideDropdown() {
      this.showDropdown = false;
      this.selectedIndex = -1;
      document.removeEventListener("click", this.handleOutsideClick);
    },
    scrollToView() {
      this.$nextTick(() => {
        const dropdownItems = this.$el.querySelectorAll(".dropdown-item");
        if (dropdownItems.length > 0 && this.selectedIndex >= 0) {
          const selectedItem = dropdownItems[this.selectedIndex];
          if (selectedItem) {
            selectedItem.scrollIntoView({ block: "nearest" });
          }
        }
      });
    },
    scrollToSelected() {
      if (this.displayValue && this.filteredHints.length > 0) {
        const selectedElement = this.$refs.dropdownItem.find((f) => f?.text.trim() === this.displayValue);
        if (selectedElement) {
          selectedElement.scrollIntoView({ block: "nearest", inline: "start" });
        }
      }
    },
    getDisplayValue(value) {
      const hint = this.hints.find((hint) => hint.value === value);
      return hint ? hint.label : value;
    },
    getIcon(value) {
      const hint = this.hints.find((hint) => hint.value === value);
      return hint ? hint.icon : "";
    },
    isHintLabel(label) {
      return this.hints.some((hint) => {
        let hintlabel = (hint.label && hint.label && hint.label.toLowerCase && hint.label.toLowerCase()) || hint.label;
        return hintlabel === label && label.toLowerCase && label.toLowerCase();
      });
    },
  },
  mounted() {
    if (this.hints.length) {
      this.inputValue = this.value;
      this.displayValue = this.getDisplayValue(this.value);
      this.selectedIcon = this.getIcon(this.value);
    }
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
};
</script>

<style scoped>
.icon-in-input {
  width: 20px;
  height: 20px;
}

.icon-in-dropdown {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
</style>
