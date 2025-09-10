<template>
  <div class="MatcAppTypeSelector">
    <div
      v-for="(type, id) in types"
      :key="id"
      :class="['MatcScreenSizeItem', { MatcScreenSizeItemSelected: isSelected(id) }]"
      @click="onTypePress(id)"
    >
      <span>{{ id }}</span>
      <div class="MatcHint" v-if="!type.hint">{{ type.screenSize.w }} x {{ type.screenSize.h }}</div>
      <div class="MatcHint" v-else>{{type.hint}}</div>
      <label class="VommondCheckBoxWrapper">
        <input type="checkbox" v-model="selectedTypes[id]" class="VommondCheckBox">
        <span class="checkmark"></span>
      </label>
    </div>
  </div>
</template>

<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
export default {
  name: "ScreenSizeSelector",
  mixins: [DojoWidget],
  data() {
    return {
      value: null,
      types: {
        Smartphone: {
          type: "smartphone",
          screenSize: { w: 376, h: 808 },
          factor: 2
        },
        Desktop: {
          type: "desktop",
          screenSize: { w: 1280, h: 720 }
        },
        Responsive: {
          type: "responsive",
          screenSize: { w: 376, h: 808 },
          hint: "Mobile and Desktop"
        }
      },
      selectedTypes: {},
      isCustom: false
    };
  },
  methods: {
    postCreate() {
      this.logger = new Logger("ScreenSizeSelector");
      this.logger.log(2, "postCreate", "enter >" + this.mode);

      // Initialize selectedTypes
      for (let id in this.types) {
        this.$set(this.selectedTypes, id, false);
      }

      this.onTypePress("Smartphone");
    },

    onCustomSelected() {
      this.cleanup();
      this.$set(this.selectedTypes, "custom", true);
      this.value = {
        type: this.inputW > 1000 ? "desktop" : "smartphone",
        screenSize: {
          w: this.inputW * 1,
          h: this.inputH * 1
        }
      };
      this.isCustom = true;
      this.$emit("change", this.getValue());
    },

    onTypePress(type) {
      this.cleanup();
      this.$set(this.selectedTypes, type, true);
      this.value = this.types[type];
      this.isCustom = false;
      this.$emit("change", this.getValue());
    },

    setValue(m) {
      let selected = null;
      for (let id in this.types) {
        let type = this.types[id];
        if (
          m.type == type.type &&
          m.screenSize.w == type.screenSize.w &&
          m.screenSize.h == type.screenSize.h &&
          selected == null
        ) {
          selected = id;
        }
      }

      if (selected) {
        this.onTypePress(selected);
      } else {
        this.logger.error("setValue", "error > Unknown type", m);
      }
    },

    getValue() {
      if (this.isCustom) {
        this.value = {
          type: this.inputW > 1000 ? "desktop" : "smartphone",
          screenSize: {
            w: this.inputW * 1,
            h: this.inputH * 1
          }
        };
      }
      return this.value;
    },

    cleanup() {
      for (let t in this.selectedTypes) {
        this.$set(this.selectedTypes, t, false);
      }
    },

    isSelected(id) {
      return this.selectedTypes[id];
    }
  },
  mounted() {
    this.postCreate();
  }
};
</script>