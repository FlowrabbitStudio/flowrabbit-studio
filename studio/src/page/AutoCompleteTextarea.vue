<template>
  <div :class="['MatcAutoCompleteTextarea', {'MatcAutoCompleteTextareaFullScreen': isFullScreen}]">
    <div class="MatcAutoCompleteTextareaFullScreenBackdrop" v-if="isFullScreen" @click.stop="isFullScreen = false"></div>
    <div class="MatcAutoCompleteTextareaCntr" ref="cntr">
      <QIcon :icon="icon" @click.stop="showFullScreen"></QIcon>
      <div
        class="MatcIgnoreOnKeyPress form-control textarea-wrapper"
        @keydown="onKeyDown"
        ref="textarea"
        contenteditable="true"
        @blur="onChange"
        @input="onChange"
        @mousedown="handleClickInside"
        @mouseup="handleClickInside"
        @click="addSpanEventListeners"
        :class="{ 'has-placeholder': isContentEmpty }"
        :data-placeholder="placeholder"
        v-html="text"
      ></div>
      <div
        v-show="isOpen && filteredMatches.length"
        :class="['MatcAutoCompleteTextareaPopup', 'MatcDropDownButtonOpen', 'MatcDropDownPopUp']"
        :style="{ top: `${caretPosition.top + 24}px`, left: `${caretPosition.left}px` }"
      >
        <input
          v-if="showSearch"
          type="text"
          class="dropdown-search"
          ref="dropdownSearch"
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="Search variables..."
          @mousedown.stop
          @keydown="onSearchKeyDown"
        />
        <ul role="menu dropdown-content">
          <li
            v-for="(o, index) in filteredMatches"
            :key="index"
            ref="li"
            :class="['MatcAutoCompleteTextareaPopupItem dropdown-item', { MatcDropDownButtonSelected: o === selected.value }]"
            @mousedown.stop.prevent="select(o)"
          >
            {{ getValueVar(o) }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import url("../style/scss/autocomplete.scss");
</style>

<script>
import domGeom from "dojo/domGeom";
import QIcon from './QIcon.vue'

export default {
  name: "AutoCompleteTextarea",
  props: ["value", "options", "placeholder"],
  data() {
    return {
      originalText: "",
      text: "",
      currentWord: "",
      hasFocus: false,
      isOpen: false,
      caretPosition: { top: 0, left: 0 },
      selected: {
        value: false,
      },
      isContentEmpty: false,
      searchQuery: "", // Search query for dropdown
      showSearch: true, // Show search input in dropdown
      lastRange: null, // To store the last selection range
      isFullScreen: false,
    };
  },
  components: {
    'QIcon':QIcon
  },
  computed: {
    icon() {
      return this.isFullScreen ? 'Minimize' : 'Maximize'
    },
    matches() {
      return this.options.filter((o) => o.toLowerCase().startsWith(this.currentWord.toLowerCase()) && !o.includes("secrets."));
    },
    filteredMatches() {
      if (!this.searchQuery.trim()) {
        return this.matches;
      }
      const q = this.searchQuery.toLowerCase();
      return this.matches.filter((m) => m.toLowerCase().includes(q));
    },
  },
  methods: {
    showFullScreen () {
      this.isFullScreen = !this.isFullScreen
    },
    getTextFormat(text) {
      const zeroWidthSpace = "\u200B";
      const regularSpace = " ";
      const textFormatted =
        text &&
        text.replace(/\$\{([^}]+)\}/g, (match, p1, offset, string) => {
          const charBefore = offset > 0 ? string[offset - 1] : "";
          const hasSpaceBefore = charBefore === regularSpace || charBefore === zeroWidthSpace;
          const afterOffset = offset + match.length;
          const charAfter = afterOffset < string.length ? string[afterOffset] : "";
          const hasSpaceAfter = charAfter === regularSpace || charAfter === zeroWidthSpace;
          const spaceBefore = hasSpaceBefore ? "" : regularSpace;
          const spaceAfter = hasSpaceAfter ? "" : regularSpace;
          return `${spaceBefore}<span class="variable-span" style="
                  color: black; 
                  background-color: #b5dafb; 
                  font-size: 11px; 
                  padding: 4px; 
                  border-radius: 6px;
                  ">${match}</span>${spaceAfter}`;
        });

      return textFormatted;
    },
    getValueVar(value) {
      return value.replace(/\$|\{|\}/g, "");
    },
    handleInput() {
      const innerText = this.$refs.textarea.innerText.trim();
      this.isContentEmpty = !innerText || innerText.length === 0;
    },
    onChange() {
      const inner = this.$refs.textarea.innerText.trim();
      this.$emit("change", inner);
      this.$emit("input", inner);
    },
    onKeyDown(e) {
      const key = e.key;

      if (key === "$") {
        e.preventDefault();
        this.currentWord = "";
        this.searchQuery = "";
        this.open();
        return;
      }

      if (key === "Shift") {
        return;
      }

      if (key === "Backspace") {
        this.handleBackspace(e);
      }

      if (this.isOpen && !this.$refs.dropdownSearch?.matches(":focus")) {
        // Handle navigation and selection only if dropdown is open and search input is not focused
        if ("Backspace" === key) {
          this.currentWord = this.currentWord.substring(0, this.currentWord.length - 1);
          this.searchQuery = this.currentWord;
          return;
        }

        if ("ArrowDown" === key) {
          e.preventDefault();
          this.navigateSelection(1);
          return;
        }

        if ("ArrowUp" === key) {
          e.preventDefault();
          this.navigateSelection(-1);
          return;
        }

        if ("Enter" === key) {
          e.preventDefault();
          this.confirmSelection();
          return;
        }

        // Other keys append to current search term
        this.currentWord += e.key;
        this.searchQuery = this.currentWord;
      }
    },
    onSearchKeyDown(e) {
      const key = e.key;

      if (this.isOpen) {
        if ("ArrowDown" === key) {
          e.preventDefault();
          this.navigateSelection(1);
          return;
        }

        if ("ArrowUp" === key) {
          e.preventDefault();
          this.navigateSelection(-1);
          return;
        }

        if ("Enter" === key) {
          e.preventDefault();
          this.confirmSelection();
          return;
        }
      }
    },
    navigateSelection(direction) {
      let index = this.filteredMatches.findIndex((o) => o === this.selected.value);
      if (index === -1) {
        this.selected.value = this.filteredMatches[0];
        this.scrollTo(0)
      } else {
        let newIndex = index + direction;
        if (newIndex >= this.filteredMatches.length) newIndex = 0;
        if (newIndex < 0) newIndex = this.filteredMatches.length - 1;
        this.selected.value = this.filteredMatches[newIndex];
        this.scrollTo(newIndex)
      }
    },
    scrollTo(index) {
      const li = this.$refs.li[index]
      if (li) {
        li.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
      }
    },
    confirmSelection() {
      if (this.filteredMatches.length === 1) {
        this.select(this.filteredMatches[0]);
        return;
      }
      if (this.selected.value) {
        this.select(this.selected.value);
        return;
      }
      this.close();
    },
    replaceCurrentSpan(html) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          const parentNode = node.parentNode;
          if (parentNode && parentNode.tagName === "SPAN") {
            parentNode.outerHTML = html;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SPAN") {
          node.outerHTML = html;
        }
        this.setCursorToEnd();
      }
    },
    restoreSelection() {
      const sel = window.getSelection();
      sel.removeAllRanges();
      if (this.lastRange) {
        sel.addRange(this.lastRange);
      }
    },
    select(text) {
      this.restoreSelection(); // Restore the saved selection
      this.removeCurrentWord();
      const value = text.substring(this.currentWord.length);
      const isReplacing = this.isCursorInsideSpan();
      if (value) {
        const zeroWidthSpace = "\u200B";
        const html = `${zeroWidthSpace}<span class="variable-span" style="color: black;background-color: #b5dafb;font-size: 11px;padding: 4px;border-radius: 6px;margin:2px">${value}</span>${zeroWidthSpace}`;
        if (isReplacing) {
          this.replaceCurrentSpan(html);
        } else {
          this.insertAtCursor(html);
        }
      }
      this.close();
    },
    addSpanEventListeners() {
      const isCursor = this.isCursorInsideSpan();
      if (isCursor) {
        // Reopen dropdown to replace variable
        this.open();
      }
    },
    insertAtCursor(html) {
      if (this.$refs.textarea) {
        const editor = this.$refs.textarea;
        const doc = editor.ownerDocument.defaultView;
        const sel = doc.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();

          const el = document.createElement("div");
          el.innerHTML = html;
          let frag = document.createDocumentFragment(),
            node,
            lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);

          if (lastNode) {
            range.setStartAfter(lastNode);
            range.setEndAfter(lastNode);
            sel.removeAllRanges();
            sel.addRange(range);
          }
          this.handleInput();
        } else {
          editor.innerHTML += html;
          this.setCursorToEnd();
          this.handleInput();
        }
      }
    },
    clearFormatting() {
      if (this.$refs.textarea) {
        this.$refs.textarea.innerHTML = "";
        this.text = "";
        this.currentWord = "";
        this.isContentEmpty = true;
      }
    },
    removeCurrentWord() {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const startOffset = range.startOffset;
        const endOffset = range.endOffset;

        if (startOffset !== endOffset) {
          range.deleteContents();
        } else {
          const newStartOffset = Math.max(0, startOffset - this.currentWord.length - 1);
          range.setStart(range.startContainer, newStartOffset);
          range.deleteContents();
        }
      }
    },
    open() {
      this.caretPosition = this.getInnerCaret(this.$refs.textarea);
      this.isOpen = true;
      this.currentWord = "";
      this.selected.value = false;
      this.searchQuery = "";

      // Save the current selection range
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        this.lastRange = sel.getRangeAt(0).cloneRange();
      }

      this.$nextTick(() => {
        if (this.showSearch && this.$refs.dropdownSearch) {
          this.$refs.dropdownSearch.focus();
        }
      });
    },
    close() {
      this.isOpen = false;
      this.currentWord = "";
      this.selected.value = false;
      this.searchQuery = "";
      this.lastRange = null; // Clear the saved range
    },
    onSearchInput() {
      if (this.filteredMatches.length > 0) {
        this.selected.value = this.filteredMatches[0];
      } else {
        this.selected.value = false;
      }
    },
    getInnerCaret() {
      const pos = this.getCaretTopPoint();
      const domPos = domGeom.position(this.$refs.cntr);     
      return {
        left: pos.left - domPos.x,
        top: pos.top - domPos.y,
      }
    },
    getCaretTopPoint() {
      const sel = document.getSelection();
      if (sel.rangeCount === 0) return { left: 0, top: 0 };
      const r = sel.getRangeAt(0);
      let rect;
      let r2;
      const node = r.startContainer;
      const offset = r.startOffset;
      if (offset > 0) {
        r2 = document.createRange();
        r2.setStart(node, offset - 1);
        r2.setEnd(node, offset);
        rect = r2.getBoundingClientRect();
        return { left: rect.right, top: rect.top };
      } else if (offset < node.length) {
        r2 = document.createRange();
        r2.setStart(node, offset);
        r2.setEnd(node, offset + 1);
        rect = r2.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
      } else {
        rect = node.getBoundingClientRect();
        const styles = getComputedStyle(node);
        const lineHeight = parseInt(styles.lineHeight);
        const fontSize = parseInt(styles.fontSize);
        const delta = (lineHeight - fontSize) / 2;
        return { left: rect.left, top: rect.top + delta };
      }
    },
    handleClickInside(event) {
      event.stopPropagation();
      // Only call preventCursorInsideSpan if clicked inside the textarea
      if (this.$refs.textarea.contains(event.target)) {
        this.preventCursorInsideSpan();
      }
    },
    handleClickOutside(event) {
      // Close only if click is outside the entire component
      if (!this.$el.contains(event.target)) {
        this.close();
      }
    },
    preventCursorInsideSpan() {
      const isCursor = this.isCursorInsideSpan();
      if (!isCursor) {
        this.close();
      }
    },
    isCursorInsideSpan() {
      const sel = window.getSelection();
      if (sel.rangeCount === 0) return false;
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        const parentNode = node.parentNode;
        return parentNode && parentNode.classList.contains("variable-span");
      }
      return node.classList && node.classList.contains("variable-span");
    },
    handleBackspace(event) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;

        if (node.tagName === "DIV") {
          const childNodes = Array.from(node.childNodes);
          if (offset > 0) {
            const currentNode = childNodes[offset - 1];
            if (currentNode && currentNode.nodeType === Node.ELEMENT_NODE && currentNode.tagName === "SPAN") {
              currentNode.remove();
              this.close();
            } else {
              /*const previousNode = currentNode.previousElementSibling;
              if (previousNode && previousNode.nodeType === Node.ELEMENT_NODE && previousNode.tagName === "SPAN") {
                currentNode.remove();
                previousNode.remove();
                this.close();
                event.preventDefault();
              }*/
            }
          }
        } else if (node && node.parentNode && node.parentNode.tagName === "SPAN") {
          const parentNode = node.parentNode;
          parentNode.remove();
          this.close();
          event.preventDefault();
        }
      }
    },
    setCursorToEnd() {
      const input = this.$refs.textarea;
      if (input) {
        input.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(input);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    },
  },
  watch: {
    value(v) {
      if (!this.text) {
        this.text = this.getTextFormat(v);
        this.isContentEmpty = !v || v.length === 0;
        this.$nextTick(() => {
          this.setCursorToEnd();
        });
      }
    },
  },
  beforeDestroy() {
    if (this.$refs.textarea) {
      this.$refs.textarea.removeEventListener("input", this.handleInput);
    }
    document.removeEventListener("click", this.handleClickOutside);
  },
  mounted() {
    this.$refs.textarea.addEventListener("input", this.handleInput);
    if (this.value) {
      this.text = this.getTextFormat(this.value);
    }
    this.isContentEmpty = !this.text || this.text.length === 0;
    document.addEventListener("click", this.handleClickOutside);
  },
};
</script>
