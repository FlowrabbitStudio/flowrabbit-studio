<template>
  <div class="image-carousel" :class="{ vertical: vertical }">
    <div class="carousel-button" @click="prevImage" :style="buttonStyle" ref="prevButton">
      <span :class="prevArrow"></span>
    </div>
    <div class="carousel-images" ref="carousel" :style="carouselStyle">
      <div
        v-for="index in numCovers"
        :key="index"
        class="carousel-image"
        :style="getImageStyle(index - 1)"
      >
        <i v-if="!images[index - 1]" class="mdi mdi-image-outline" ref="placeholderIcon"></i>
      </div>
    </div>
    <div class="carousel-button" @click="nextImage" :style="buttonStyle" ref="nextButton">
      <span :class="nextArrow"></span>
    </div>
  </div>
</template>

<script>
import UIWidget from "core/widgets/UIWidget";

export default {
  name: "ImageCarousel",
  mixins: [UIWidget],
  data() {
    return {
      currentIndex: 0,
      images: [],
      vertical: false,
      buttonType: "default",
      buttonBackground: undefined,
      buttonColor: undefined,
      numCovers: 1,
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
        backgroundColor: this.buttonBackground || "#f4f4f5",
        color: this.buttonColor || "#18181b",
        width: "auto",
        height: "auto",        
      };
      switch (this.buttonType) {
        case "rounded":
          style.borderRadius = "50%";
          style.border = '1px solid #e4e4e7';
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
      return {
        transform: this.vertical
          ? `translateY(-${this.currentIndex * 100}%)`
          : `translateX(-${this.currentIndex * 100}%)`,
      };
    },
    prevArrow() {
      return this.vertical ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-left';
    },
    nextArrow() {
      return this.vertical ? 'mdi mdi-chevron-down' : 'mdi mdi-chevron-right';
    },
  },
  methods: {
    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      this.images = model.props.images || [];
      this.vertical = this.model.props.vertical;
      this.buttonType = this.model.props.buttonType || "default";
      this.buttonBackground = this.model.props.buttonBackground;
      this.buttonColor = this.model.props.buttonColor;
      this.numCovers = this.model.props.numCovers || 1;
      this.setStyle(style);
      this.resize(this.model);
    },
    resize(box) {
      const carousel = this.$refs.carousel;
      if (carousel) {
        if (this.vertical) {
          carousel.style.height = box.h + "px";
          carousel.style.width = box.w + "px";
        } else {
          carousel.style.height = box.h + "px";
          carousel.style.width = box.w + "px";
        }
      }
      const placeholderIcon = this.$refs.placeholderIcon;
      if (placeholderIcon) {
        placeholderIcon[0].style.fontSize = `${Math.min(box.w, box.h) / 5}px`;
      }
      const prevButton = this.$refs.prevButton;
      
      if (prevButton) {
        // add 2px 7px padding and 0.5rem margin unless the size of the carousel is less than 100px
        prevButton.style.margin = `${Math.max(100, box.h) / 20}px 0`;
        prevButton.style.padding = "2px 7px";
      }
      const nextButton = this.$refs.nextButton;
      if (nextButton) {
        nextButton.style.margin = `${Math.max(100, box.h) / 20}px 0`;
        nextButton.style.padding = "2px 7px";
      }
      
      /*
      if (prevButton) {
        // add 2px 7px padding and 0.5rem margin unless the size of the carousel is less than 100px
        prevButton.style.padding = `2px 7px`;
        prevButton.style.margin = this.vertical ? "0.5rem 0" : "0 0.5rem";
      }
      const nextButton = this.$refs.nextButton;
      if (nextButton) {
        nextButton.style.padding = `2px 7px`;
        nextButton.style.margin = this.vertical ? "0.5rem 0" : "0 0.5rem";
      }*/
    },
    getImageStyle(index) {
      let url = "";
      if (index >= 0 && this.images.length > index) {
        const image = this.images[index];
        if (this.hash) {
          url = `/rest/images/${this.hash}/${image}`;
        } else if (this.jwtToken) {
          url = `/rest/images/${image}?token=${this.jwtToken}`;
        } else {
          url = `/rest/images/${image}`;
        }
      }
      return {
        backgroundImage: index >= 0 && this.images.length > index ? `url(${url})` : "none",
        width: this.vertical ? "100%" : `calc(${100 / this.numCovers}% - 10px)`,
        height: this.vertical ? `calc(${100 / this.numCovers}% - 10px)` : "100%",
        margin: this.vertical ? "5px 0" : "0 5px",
        borderTop: `${this.style?.borderTopWidth || 0}px ${this.style?.borderTopStyle || 'solid'} ${this.style?.borderTopColor || '#000'}`,
        borderBottom: `${this.style?.borderBottomWidth || 0}px ${this.style?.borderBottomStyle || 'solid'} ${this.style?.borderBottomColor || '#000'}`,
        borderLeft: `${this.style?.borderLeftWidth || 0}px ${this.style?.borderLeftStyle || 'solid'} ${this.style?.borderLeftColor || '#000'}`,
        borderRight: `${this.style?.borderRightWidth || 0}px ${this.style?.borderRightStyle || 'solid'} ${this.style?.borderRightColor || '#000'}`,
        borderTopLeftRadius: `${this.style?.borderTopLeftRadius || 0}px`,
        borderTopRightRadius: `${this.style?.borderTopRightRadius || 0}px`,
        borderBottomLeftRadius: `${this.style?.borderBottomLeftRadius || 0}px`,
        borderBottomRightRadius: `${this.style?.borderBottomRightRadius || 0}px`,
        backgroundColor: index >= 0 ? "transparent" : "#f0f0f0",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };
    },
    prevImage() {
      this.currentIndex =
        (this.currentIndex - 1 + this.images.length) % this.images.length;
    },
    nextImage() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
  },
};
</script>

<style scoped>
.image-carousel {
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.image-carousel.vertical {
  flex-direction: column;
}

.carousel-button {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.image-carousel.vertical .carousel-button {
  margin: 0.5rem 0;
  width: 100%;
}

.carousel-images {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
  height: 100%;
}

.image-carousel.vertical .carousel-images {
  flex-direction: column;
}

.carousel-image {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
}

.carousel-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  background-color: #f0f0f0;
}
</style>