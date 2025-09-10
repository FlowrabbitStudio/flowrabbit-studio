<template>
  <div class="MatcAccordion">
    <div class="MatcAccordionHeader" @click="handleClick">
      <div class="MatcAccordionTitle">
        {{ header }}
      </div>
      <div :class="['MatcAccordionHeaderIcon', { open: isOpen }]">
        <span class="mdi mdi-chevron-double-down" alt="chevron-icon"></span>
      </div>
    </div>
    <div :class="['MatcAccordionContent', { open: isOpen }]">
      <slot></slot>
    </div>
  </div>
</template>
  
<script>
export default {
  name: "Accordion",
  props: ["header"],
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    handleClick() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>