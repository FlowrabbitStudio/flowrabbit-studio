<template>
  <div class="app-item-menu dropdown" @click.stop>
    <button @click="toggleMenu" class="menu-button">
      <i class="mdi mdi-dots-vertical"></i>
    </button>
    <transition name="fade">
      <div v-if="isOpen" class="menu-options">
        <button v-if="published" @click="goPreview">Preview</button>
        <div v-if="published" class="divider" />
        <button @click="rename">Rename</button>
        <button @click="duplicate">Duplicate</button>
        <button @click="move">Move</button>
        <div class="divider" />
        <button @click="goSettings">Settings</button>
        <div class="divider" />
        <button class="danger" @click="deleteItem">Delete</button>
      </div>
    </transition>
  </div>
</template>

<script>
import hash from "dojo/hash";
export default {
  props: ["app", "selectedOrg", "published"],
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggleMenu(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isOpen = !this.isOpen;
      this.$nextTick(() => {
        if (this.isOpen) {
          const { pageX, pageY } = e;
          const dropdownMenu = this.$el.querySelector(".menu-options");
          dropdownMenu.style.top = `${pageY}px`;
          dropdownMenu.style.left = `${pageX}px`;
        }
      });
    },
    closeMenu() {
      this.isOpen = false;
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.closeMenu();
      }
    },
    goPreview(e) {
      e.stopPropagation();
      e.preventDefault();
      if (this.selectedOrg && this.app) {
        if (this.app.screens && Object.keys(this.app.screens)) {
          const firstScreen = Object.keys(this.app.screens)[0];
          hash(
            `#/apps/${this.selectedOrg.id}/${this.app.id}/design/${firstScreen}.html`
          );
        } else {
          hash(`#/apps/${this.selectedOrg.id}/${this.app.id}/settings.html`);
        }
      }
    },
    goSettings(e) {
      e.stopPropagation();
      e.preventDefault();
      if (this.selectedOrg && this.app) {
        hash(`#/apps/${this.selectedOrg.id}/${this.app.id}/settings.html`);
      }
    },
    rename(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$emit("rename");
      this.closeMenu();
    },
    duplicate(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$emit("duplicate");
      this.closeMenu();
    },
    move(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$emit("move");
      this.closeMenu();
    },
    deleteItem(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$emit("delete");
      this.closeMenu();
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
@import "style/scss/appitem.scss";
@import "style/variables.scss";
</style>
