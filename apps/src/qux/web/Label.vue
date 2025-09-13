<template>
  <router-link
    :class="['qux-label', cssClass]"
    @click="onClick"
    v-if="hasLink"
    :to="link"
  >
    <span class="qux-richtext" v-if="isRichText" v-html="richText"> </span>
    <div class="qux-richtext" v-else-if="isJson">
       <vue-json-pretty :data="dataBindingLabel"></vue-json-pretty>
    </div>
    <span
      class="qux-common-label"
      v-else-if="dataBindingLabel !== null && dataBindingLabel !== undefined"
    >
      {{ dataBindingLabel }}
    </span>
  </router-link>
  <label :class="['qux-label', cssClass, cssError]" @click="onClick" v-else>
    <span class="qux-richtext" v-if="isRichText" v-html="richText"> </span>
    <div class="qux-richtext" v-else-if="isJson">
       <vue-json-pretty :data="dataBindingLabel"></vue-json-pretty>
    </div>
    <span class="qux-common-label" v-else-if="dataBindingLabel">
      {{ animatedLabel }}
    </span>
  </label>
</template>
<style lang="scss">
@import '../scss/qux-label.scss';
</style>
<script>
import _Base from './_Base.vue';
import { cleanInnerHTML } from './WebUtil.js';
import MarkdownUtil from './MarkdownUtil.js';
import DOMPurify from 'dompurify';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

export default {
  name: 'qLabel',
  mixins: [_Base],
  data: function () {
    return {
      amimatedTempLabel: false,
    };
  },
  components: {
    VueJsonPretty
  },
  computed: {
    animatedLabel() {
      if (this.amimatedTempLabel !== false) {
        return this.amimatedTempLabel
      }
      return this.dataBindingLabel
    },
    cssError() {
      if (this.element?.props.errorLabelSource) {
        const sourceId = this.element?.props.errorLabelSource
        if (this.validationErrors[sourceId]) {
          return 'qux-error-label-visible'
        }
        return 'qux-error-label-hidden'
      }
      return ''
    },
    richText() {
      try {        
        if (this.element.props.format === "markup" || this.element.props.markup) {
          if (this.amimatedTempLabel !== false) {
            return this.getMarkupDown(this.amimatedTempLabel);
          }
          return this.getMarkupDown(this.dataBindingLabel);
        }
        return cleanInnerHTML(this.dataBindingLabel.value);
      } catch (e) {
        console.log("Error converting to markdown 2");
      }
      return this.dataBindingLabel;
    },
    isRichText() {
      let label = this.dataBindingLabel;
      if (label && label.type === 'richtext') {
        return true;
      }
      if (this.element.props.format === 'json' ) {
        return false;
      } else if (this.element.props.format === 'markup' || this.element.props.markup) {
        return true;
      }
      return false;
    },
    isJson() {
      if (this.element.props.format === 'json' ) {
        return true;
      }
      return false
    },
    isAnimated() {
      return this.element?.props?.animated
    },
    isChatAnimation() {
      return this.element?.props?.animation === 'chat'
    },
     animDuration() {
      if (this.element?.props?.duration) {
        return this.element?.props?.duration * 1
      }
      return 0
    }
  },
  methods: {
    getMarkupDown(txt) {
      if(!txt) {
        return ""
      }
      let htmlContent = '';
      try {
        htmlContent = MarkdownUtil.makeHtml(txt);
      } catch (e) {
        htmlContent =  DOMPurify.sanitize(txt); 
      }
      if (!htmlContent.trim()) {
        htmlContent = '<p></p>';
      }

      return htmlContent;
    },
    getJSONValue(txt) {
      try {
        const jsonObject = JSON.parse(txt);
        return JSON.stringify(jsonObject, null, 2);
      } catch (e) {
        console.error('Invalid JSON:', e);
        return txt;
      }
    },
    startChatAnimation(txt, animDuration) {
      let durationPerChar = 1 / (animDuration * 3);
      const length = txt.length
      const frames = Math.round(durationPerChar * length * 30)
      const framesPerChar = frames / length
      this.animSteps = []
      for (let i = 0; i < frames; i++) {
        const end = Math.floor(i / framesPerChar)
        this.animSteps.push(txt.slice(0, end))
      }
      this.animSteps.push(txt)
      this.animIsRunning = true
      this.amimatedTempLabel = ''
      this.runLabelAnimation("", txt)
    },

    startNumberAnimation (to) {
      const label = this.getLabelValue()
      const diff = to - this.animCurrent
      const frames = (this.animDuration * 30)
      const step = diff / frames
      this.animSteps = []
 
      let x = this.animCurrent
      for (let i = 0; i < frames; i++) {
        this.animSteps.push(Math.round(x))
        x += step
      } 
      this.animSteps.push(to)
      this.animIsRunning = true
      this.animatedLabel = this.animSteps[0]
      this.runLabelAnimation(label, to)

    },

    runLabelAnimation(label, to, callback) {
      if (!this.animIsRunning) {
        this.amimatedTempLabel = false
        return
      }
      if (this.animSteps.length > 0) {
        let value = this.animSteps.shift()
        value = this.replaceVaribale(label, value)
        this.amimatedTempLabel = value
        requestAnimationFrame(() => {
          this.runLabelAnimation(label, to, callback)
        })
      } else {
        this.amimatedTempLabel = false
        if (callback) {
          callback()
        }
      }
    },

    afterDataBindingChange(lbl) {
      if (this.isAnimated) {
        if (this.isChatAnimation) {
          this.startChatAnimation(lbl, this.animDuration)
        } else {
          //this.startNumberAnimation(lbl, this.animDuration)
        }
      }
    },

    replaceVaribale(label, value) {
      if (label.indexOf("{0}") >= 0) {
        return label.replace("{0}", value);
      }
      if (label.indexOf("{value}") >= 0) {
        return label.replace("{value}", value);
      }
      return value
    },
  },
  mounted() {
  }
}
</script>
