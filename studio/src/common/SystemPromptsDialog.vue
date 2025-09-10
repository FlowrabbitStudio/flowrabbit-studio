<template>
  <div>
    <div
      v-for="(group, groupIndex) in localSystemPrompts"
      :key="'group-' + groupIndex"
      class="accordion-item"
    >
      <div class="accordion-header">
        <span
          class="mdi mdi-chevron-down toggle"
          @click="toggleAccordion(groupIndex)"
        ></span>
        <div class="icon-selector-container" @click.stop>
          <div class="selected-icon" @click="toggleIconDropdown(groupIndex)">
            <span
              :class="[
                'mdi',
                group.icon ? group.icon : 'mdi-cancel no-icon-placeholder',
              ]"
            ></span>
          </div>
          <div class="icon-dropdown" v-if="group.showIconDropdown" @click.stop>
            <input
              type="text"
              class="icon-search"
              placeholder="Search icons..."
              v-model="group.iconSearch"
            />
            <div class="icon-list">
              <div
                v-for="icon in filteredIcons(group.iconSearch)"
                :key="icon"
                class="icon-item"
                @click="selectIcon(groupIndex, icon)"
              >
                <span :class="['mdi', `mdi-${icon}`]"></span>
              </div>
            </div>
            <div
              class="icon-item remove-icon-option"
              @click="removeGroupIcon(groupIndex)"
            >
              <span class="mdi mdi-close-circle-outline"></span>
              <span>Remove Icon</span>
            </div>
          </div>
        </div>
        <input
          class="form-control accordion-label"
          v-model="group.label"
          placeholder="Group Label"
          @click.stop
        />
        <span
          class="mdi mdi-close remove-group"
          @click.stop="removeGroup(groupIndex)"
        ></span>
      </div>
      <div class="accordion-content" v-show="group.isOpen">
        <OptionsList :ref="'options-' + groupIndex" />
      </div>
    </div>
    <div class="add-new-group">
      <div class="icon-selector-container">
        <div class="selected-icon" @click="toggleNewGroupIconDropdown">
          <span
            :class="[
              'mdi',
              newGroupIcon ? newGroupIcon : 'mdi-cancel no-icon-placeholder',
            ]"
          ></span>
        </div>
        <div class="icon-dropdown" v-if="showNewGroupIconDropdown" @click.stop>
          <input
            type="text"
            class="icon-search"
            placeholder="Search icons..."
            v-model="newGroupIconSearch"
          />
          <div class="icon-list">
            <div
              v-for="icon in filteredIcons(newGroupIconSearch)"
              :key="icon"
              class="icon-item"
              @click="selectNewGroupIcon(icon)"
            >
              <span :class="['mdi', `mdi-${icon}`]"></span>
            </div>
          </div>
          <div class="icon-item remove-icon-option" @click="removeNewGroupIcon">
            <span class="mdi mdi-close-circle-outline"></span>
            <span>Remove Icon</span>
          </div>
        </div>
      </div>
      <input
        v-model="newGroupLabel"
        class="form-control"
        placeholder="Add new System Prompt"
        @blur="addGroupIfValid"
        @keyup.enter="addGroupIfValid"
      />
    </div>
  </div>
</template>

<script>
import DojoWidget from "dojo/DojoWidget";
import OptionsList from "./OptionsList.vue";

export default {
  name: "SystemPromptsDialog",
  mixins: [DojoWidget],
  components: {
    OptionsList,
  },
  props: ["title"],
  data() {
    return {
      localSystemPrompts: [],
      newGroupLabel: "",
      newGroupIcon: "",
      newGroupIconSearch: "",
      showNewGroupIconDropdown: false,
      iconOptions: [
        { value: "mdi-microphone", label: "Microphone" },
        { value: "mdi-translate", label: "Translate" },
      ],
      icons: [],
    };
  },
  methods: {
    removeGroupIcon(groupIndex) {
      this.localSystemPrompts[groupIndex].icon = ""; 
      this.localSystemPrompts[groupIndex].showIconDropdown = false; 
    },
    removeNewGroupIcon() {
      this.newGroupIcon = ""; 
      this.showNewGroupIconDropdown = false; 
    },
    addGroupIfValid() {
      if (this.newGroupLabel.trim()) {
        this.localSystemPrompts.push({
          label: this.newGroupLabel.trim(),
          icon: this.newGroupIcon || "",
          options: [],
          isOpen: true,
          showIconDropdown: false,
          iconSearch: "",
        });
        this.newGroupLabel = ""; 
        this.newGroupIcon = "";
      }
    },
    toggleNewGroupIconDropdown() {
      this.showNewGroupIconDropdown = !this.showNewGroupIconDropdown;
    },
    selectNewGroupIcon(icon) {
      this.newGroupIcon = `mdi-${icon}`;
      this.showNewGroupIconDropdown = false;
    },
    setWidget(w, icons) {
      this.widget = w;
      if (w.props && w.props.systemprompts) {
        const prompts = w.props.systemprompts;
        this.localSystemPrompts = prompts || [];
        this.localSystemPrompts.forEach((group, index) => {
          this.$set(this.localSystemPrompts[index], "isOpen", false);
          this.$set(this.localSystemPrompts[index], "showIconDropdown", false);
          this.$set(this.localSystemPrompts[index], "iconSearch", "");
          this.$nextTick(() => {
            const groupRef = this.$refs[`options-${index}`];
            if (groupRef && groupRef[0]) {
              groupRef[0].setOptions(group.options.map((opt) => opt.label));
              groupRef[0].setOptionValues(
                group.options.map((opt) => opt.value)
              );
            }
          });
        });
      }
      if (icons) this.icons = icons;
    },
    getSystemPrompts() {
      this.localSystemPrompts.forEach((group, index) => {
        const groupRef = this.$refs[`options-${index}`];
        if (groupRef && groupRef[0]) {
          const options = groupRef[0].getOptions();
          const optionValues = groupRef[0].getOptionsValues();
          group.options = options.map((label, idx) => ({
            label,
            value: optionValues[idx],
          }));
        }
      });
      return this.localSystemPrompts;
    },
    toggleAccordion(groupIndex) {
      this.localSystemPrompts[groupIndex].isOpen =
        !this.localSystemPrompts[groupIndex].isOpen;
    },
    removeGroup(groupIndex) {
      this.localSystemPrompts.splice(groupIndex, 1);
    },
    onNewGroup() {
      if (this.newGroupLabel) {
        const newGroup = {
          label: this.newGroupLabel,
          icon: this.newGroupIcon || "",
          options: [],
          isOpen: true,
          showIconDropdown: false,
          iconSearch: "",
        };
        this.localSystemPrompts.push(newGroup);
        this.newGroupLabel = "";
        this.newGroupIcon = "";
      }
    },
    toggleIconDropdown(groupIndex) {
      this.localSystemPrompts.forEach((group, idx) => {
        if (idx !== groupIndex) {
          group.showIconDropdown = false;
        }
      });
      this.localSystemPrompts[groupIndex].showIconDropdown =
        !this.localSystemPrompts[groupIndex].showIconDropdown;
    },
    selectIcon(groupIndex, icon) {
      this.localSystemPrompts[groupIndex].icon = `mdi-${icon}`;
      this.localSystemPrompts[groupIndex].showIconDropdown = false;
    },
    filteredIcons(searchTerm) {
      if (!searchTerm) {
        return this.icons;
      }
      const lowerSearchTerm = searchTerm.toLowerCase();
      return this.icons.filter((icon) =>
        icon.toLowerCase().includes(lowerSearchTerm)
      );
    },
    onCancel() {
      this.$emit("cancel");
    },
  },
};
</script>

<style lang="scss">
@import "style/components/dialog.scss";
.MatcDialogTable tr {
  border-bottom: 1px solid #f1f1f1;
}

.accordion-item {
  border-bottom: 1px solid #ccc;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f7f7f7;
}

.accordion-header:hover {
  background-color: #eaeaea;
}

.accordion-label {
  flex: 1;
  margin-right: 10px;
}

.icon-selector-container {
  position: relative;
  margin-right: 10px;
}

.selected-icon {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.selected-icon .mdi {
  font-size: 22px;
  margin-right: 5px;
  padding: 0 5px;
}

.icon-search {
  width: calc(100% - 20px);
  margin: 10px;
  padding: 5px;
  border: 1px solid #ccc;
}
.icon-dropdown {
  position: fixed;
  z-index: 999;
  padding-bottom: 50px;
  background: #fff;
  border: 1px solid #ccc;
  width: 300px;
  max-height: 350px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.icon-search {
  width: calc(100% - 20px);
  margin: 10px;
  padding: 5px;
  border: 1px solid #ccc;
}

.icon-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 10px;
  max-height: 250px;
  overflow-y: auto;
}

.icon-item {
  width: 40px;
  height: 40px;
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
}

.icon-item:hover {
  background-color: #f0f0f0;
  border-color: #ccc;
}

.icon-item .mdi {
  font-size: 24px;
  color: #333;
}

.icon-name {
  font-size: 14px;
}

.toggle {
  cursor: pointer;
  font-size: 24px;
  color: #888;
  margin-right: 4px;
}

.toggle:hover {
  color: rgb(77, 77, 77);
}

.remove-group {
  cursor: pointer;
  font-size: 18px;
  color: #888;
}

.remove-group:hover {
  color: var(--warning-color-dark);
}

.accordion-content {
  background-color: #fff;
}

.add-new-group {
  margin-top: 20px;
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.add-new-group input {
  flex: 1;
  margin-right: 10px;
}

.add-new-group button {
  padding: 8px 16px;
  cursor: pointer;
}

.MatcButtonBar {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.MatcButton {
  padding: 8px 16px;
  cursor: pointer;
}

.MatcButtonPrimary {
  background-color: #007bff;
  color: #fff;
}

.MatcLinkButton {
  margin-left: 10px;
  color: #007bff;
  cursor: pointer;
}

/* Add dashed border for "no icon" placeholder */
.no-icon-placeholder {
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 5px;
  background-color: #f8f8f8;
  font-size: 18px;
  color: #999;
}

.remove-icon-option {
  position: absolute;
  bottom: 0;
  left: 0;
  width: -webkit-fill-available;
  text-align: center;
  padding: 0px;
  border-top: 1px solid #ddd;
  cursor: pointer;
  color: #d9534f;
  font-weight: bold;
}

.remove-icon-option .mdi{
  margin-right: 6px;
}

.remove-icon-option:hover {
  background-color: #f0f0f0;
  color: #c9302c;
}

.add-new-group {
  display: flex;
  align-items: center;
}

.add-new-group .icon-selector-container {
  margin-right: 10px;
}

</style>
