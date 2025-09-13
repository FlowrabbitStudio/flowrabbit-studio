<template>
  <div :class="['qux-image-carousel', { vertical: vertical }, cssClass]">
    <div class="carousel-button" @click="prevImage" :style="buttonStyle">
      <span :class="prevArrow"></span>
    </div>

    <div class="carousel-wrapper">
      <div class="carousel-images" :class="{ vertical: vertical }" :style="carouselStyle">
        <div class="carousel-image" v-for="(img, idx) in images" :key="idx" :style="imageStyle(idx)">
          <i v-if="!images[idx]" class="mdi mdi-image-outline"></i>
        </div>
      </div>
    </div>

    <div class="carousel-button" @click="nextImage" :style="buttonStyle">
      <span :class="nextArrow"></span>
    </div>
  </div>
</template>

<style lang="scss">
@import "../scss/qux-image-carousel.scss";
</style>

<script>
import _Base from "./_Base.vue";
import Services from "../../services/Services";

export default {
  name: "qImageCarousel",
  mixins: [_Base],

  data() {
    return {
      autoPlay: false,
      autoPlayInterval: 3000,
      currentIndex: 0,
      images: [],
      vertical: false,
      buttonType: "default",
      buttonBackground: undefined,
      buttonColor: undefined,
      numCovers: 1,
      style: {}, // Additional style if needed
    };
  },

  computed: {
    buttonStyle() {
      let style = {
        cursor: "pointer",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        transition: "background-color 0.3s, transform 0.3s",
        margin: this.vertical ? "0.5rem 0" : "0 0.5rem",
        backgroundColor: this.buttonBackground || "#f4f4f5",
        color: this.buttonColor || "#18181b",
        width: "auto",
        height: "auto",
      };
      switch (this.buttonType) {
        case "rounded":
          style.borderRadius = "50%";
          style.border = "1px solid #e4e4e7";
          break;
        case "square":
          style.borderRadius = "0";
          break;
        case "outline":
          style.borderRadius = "5px";
          style.backgroundColor = "transparent";
          style.border = `2px solid ${this.buttonColor || "#000"}`;
          break;
        default:
          style.borderRadius = "5px";
          break;
      }
      return style;
    },

    carouselStyle() {
      const step = 100 / this.numCovers;
      return {
        transform: this.vertical ? `translateY(-${this.currentIndex * step}%)` : `translateX(-${this.currentIndex * step}%)`,
        transition: "transform 0.5s ease",
      };
    },
    prevArrow() {
      return this.vertical ? "mdi mdi-chevron-up" : "mdi mdi-chevron-left";
    },
    nextArrow() {
      return this.vertical ? "mdi mdi-chevron-down" : "mdi mdi-chevron-right";
    },

    imagePrefix() {
      if (this.hash) {
        const server = Services.getConfig().api_URL;
        return `${server}/rest/images/${this.hash}/`;
      }
      return this.config.imageFolder;
    },
  },

  methods: {
    getImageURL(url) {
      if (url && url.startsWith("http")) {
        return `url(${url})`;
      }
      return `url(${this.imagePrefix}/${url})`;
    },

    imageStyle(index) {
      const imageUrl = this.images[index];
      if (!imageUrl) {
        return {};
      }
      return {
        backgroundImage: this.getImageURL(imageUrl),
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      };
    },

    getImageIndex(i) {
      return (this.currentIndex + i - 1) % this.images.length;
    },

    nextImage() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },

    /**
     * Go backward by 1 each time.
     */
    prevImage() {
      if (this.images.length > 0) {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      }
    },

    /**
     * Simply returns images[index] to check if there's a valid image
     */
    getImage(index) {
      return this.images[index];
    },
  },

  mounted() {
    // Load everything from your widget's props (if using the standard QUX approach)
    this.images = this.element.props.images || [];
    this.vertical = this.element.props.vertical;
    this.buttonType = this.element.props.buttonType || "default";
    this.buttonBackground = this.element.props.buttonBackground;
    this.buttonColor = this.element.props.buttonColor;
    this.numCovers = this.element.props.numCovers || 1;
  },
};
</script>
