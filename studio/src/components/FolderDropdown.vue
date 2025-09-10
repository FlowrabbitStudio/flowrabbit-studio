<template>
  <div class="dropdown" @click.stop>
    <button @click="toggleMenu" class="menu-button">
      <i class="mdi mdi-dots-vertical"></i>
    </button>
    <transition name="fade">
      <div v-if="isOpen" class="menu-options">
        <button @click="emitRename">Rename</button>
        <div class="divider" />
        <button class="danger" @click="emitDelete">Remove</button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
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
    },
    closeMenu() {
      this.isOpen = false;
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.closeMenu();
      }
    },
    emitRename(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$emit("rename");
      this.closeMenu();
    },
    emitDelete(e) {
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
@import "style/variables.scss";
.dropdown {
  position: relative;
  font-size: 14px;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.menu-options {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 95px;
  text-align: center;
  font-size: 14px;
  margin-top: 16px;
  left: 110px;
}

.menu-options .danger {
  color: var(--danger-color-dark);
}

.menu-options .divider {
  margin: 4px 0;
  border-bottom: 1px solid var(--form-border);
}

.menu-options button {
  display: block;
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--form-color);
}

.menu-options button:hover {
  background: #f9f9f9;
}
</style>
