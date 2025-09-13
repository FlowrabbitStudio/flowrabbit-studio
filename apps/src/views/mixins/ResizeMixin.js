export default {
  data() {
    return {
      isMobileView: window.innerWidth <= 768,
    };
  },
  methods: {
    handleResize() {
      this.isMobileView = window.innerWidth <= 768;
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
};
