<template>
  <div class="MatcWidget MatchWidgetTypeChat" ref="container" :style="containerStyle">
    <div class="MatchWidgetTypeChatWrapper" ref="wrapper"></div>

    <!-- Prompts Container -->
    <div class="MatchWidgetTypeChatPrompts" ref="promptsContainer" v-if="prompts && prompts.length">
      <div v-for="(prompt, index) in visiblePrompts" :key="index" class="MatchWidgetTypeChatPrompt"
        :style="promptStyle">
        {{ prompt }}
      </div>
      <div v-if="hasOverflow" class="MatchWidgetTypeChatPrompt overflow-indicator" :style="promptStyle">
        <QIcon icon="DotsVertical" />
      </div>
    </div>

    <!-- Input Container -->
    <div class="MatchWidgetTypeChatInput" ref="inputCntr" @mouseover="onHover" :style="chatInputStyling">
      <!-- Textarea and Send Icon Container -->
      <div class="textarea-container">
        <textarea class="MatchWidgetTypeChatInputTextArea" ref="textarea" @focus="onFocus" @blur="onBlur"
          @keypress.enter.stop="onSubmit" v-model="newMessage" :style="textAreaStyling"></textarea>
        <QIcon icon="Send" size="16" class="MatchWidgetTypeChatInputIcon" @click="onSubmit" />
      </div>

      <!-- System Prompts Dropdowns -->
      <div v-if="systemprompts && systemprompts.length" class="system-prompts">
        <div v-for="(prompt, index) in systemprompts" :key="'systemprompt-' + index" class="system-prompt">
          <div class="custom-select">
            <div class="select-icon-container" v-if="prompt.icon">
              <span :class="[
                'mdi',
                prompt.icon
              ]"></span>
            </div>
            <select :class="['prompt-select', prompt.icon && 'prompt-select-icon']" :style="systempromptsStyling">
              <option value="" disabled selected>
                {{ prompt.label }}
              </option>
              <option v-for="(option, idx) in prompt.options" :key="'option-' + idx" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <span class="custom-arrow mdi mdi-menu-down"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import UIWidget from "core/widgets/UIWidget";
import DomBuilder from "common/DomBuilder";
import showdown from "showdown";
import QIcon from "page/QIcon";

export default {
  name: "Button",
  mixins: [UIWidget, DojoWidget],
  data: function () {
    return {
      value: [],
      newMessage: "",
      style: {},
      model: null,
      prompts: [],
      visiblePrompts: [],
      hasOverflow: false,
      systemprompts: [],
    };
  },
  components: {
    QIcon,
  },
  computed: {
    containerStyle() {
      let styling = "";
      if (this.style?.borderColor) {
        styling += `border-color: ${this.style.borderTopColor} ${this.style.borderRightColor} ${this.style.borderBottomColor} ${this.style.borderLeftColor}; `;
      }
      styling += `border-style: solid; `;
      return styling;
    },
    chatInputStyling() {
      let styling = "";
      if (this.style?.textareaBackground) {
        const background = this.style.textareaBackground;
        styling += `background: ${background}; `;
      }
      if (this.style?.textareaColor) {
        const color = this.style.textareaColor;
        styling += `color: ${color}; `;
      }
      if (this.style?.textareaRadius) {
        const textareaRadius = this._getBorderWidth(this.style.textareaRadius);
        styling += `border-radius: ${textareaRadius}px; `;
      }
      if (this.style?.textareaBorderWidth) {
        const textareaBorderWidth = this._getBorderWidth(this.style.textareaBorderWidth);
        styling += `border-width: ${textareaBorderWidth}px; `;
        if (textareaBorderWidth > 0) styling += `border-style: solid; `;
      }
      if (this.style?.textareaBorderColor) {
        const textareaBorderColor = this.style.textareaBorderColor;
        styling += `border-color: ${textareaBorderColor}; `;
      }
      return styling;
    },
    textAreaStyling() {
      let styling = "";
      if (this.style?.inputHeight) {
        const h = this._getBorderWidth(this.style?.inputHeight)        
        styling += `height: ${h}px; `;
      }
      return styling;
    },
    promptStyle() {
      const radius = this._getBorderWidth(this.style.promptBorderRadius) + "px";
      const width = this._getBorderWidth(this.style.promptBorderWidth) + "px";
      const promptFontSize = this._getBorderWidth(this.style.promptFontSize) + "px";
      const paddingH = this._getBorderWidth(6)
      const paddingV = this._getBorderWidth(12)
      return {
        borderRadius: radius,
        borderWidth: width,
        background: this.style.promptBackground || "#f0f0f0",
        color: this.style.promptColor || "#333",
        borderColor: this.style.promptBorderColor || "#ccc",
        borderStyle: "solid",
        padding: `${paddingH}px ${paddingV}px`,
        cursor: "pointer",
        transition: "background-color 0.2s",
        fontSize: promptFontSize || "12px",
      };
    },
    systempromptsStyling() {
      const radius =
        this._getBorderWidth(this.style.systempromptBorderRadius) + "px";
      const width =
        this._getBorderWidth(this.style.systempromptBorderWidth) + "px";
      const systempromptFontSize =
        this._getBorderWidth(this.style.systempromptFontSize) + "px";
      return {
        borderRadius: radius,
        borderWidth: width,
        background: this.style.systempromptBackground || "#f0f0f0",
        color: this.style.systempromptColor || "#333",
        borderColor: this.style.systempromptBorderColor || "#ccc",
        borderStyle: "solid",
        cursor: "pointer",
        transition: "background-color 0.2s",
        fontSize: systempromptFontSize || "12px",
        fontFamily: this.style.fontFamily,
      };
    },
    bubbleIconStyle() {
      const size = this._getBorderWidth(this.style.bubbleIconSize) + "px" || "16px";
      const color = this.style.bubbleIconColor || "#666";
      return {
        fontSize: size,
        color: color,
        cursor: "pointer",
      };
    },
  },
  methods: {
    reset() {
      this.$refs.wrapper.innerText = "";
      this._borderNodes = [this.$refs.container];
      this._backgroundNodes = [this.$refs.container];
      this._shadowNodes = [];
      this._paddingNodes = [this.$refs.container];
      this._labelNodes = [this.domNode, this.$refs.textarea];
      this._rowNodes = [];
    },

    wireEvents() {
      this.isWired = true;
    },

    scrolldown() {
      if (this._rowNodes && this.isWired) {
        const node = this._rowNodes[this._rowNodes.length - 1];
        if (node) {
          node.row.scrollIntoView({
            block: "end",
            inline: "nearest",
            behavior: "smooth",
          });
        }
      }
    },

    onFocus(e) {
      this.hasFocus = true;
      this.stopPropagation(e);
      this.emitAnimation(this.model.id, 200, this.model.focus);
    },

    onHover(e) {
      this.stopPropagation(e);
      if (!this.hasFocus) {
        this.emitAnimation(this.model.id, 200, this.model.hover);
      }
    },

    onBlur(e) {
      this.hasFocus = false;
      this.stopPropagation(e);
      this.emitAnimation(this.model.id, 200, this.model.style);
    },

    onSubmit(e) {
      this.stopPropagation(e);
      this.value = this.value.filter((m) => !m.isWaiting);
      this.value.push({
        role: "user",
        content: this.newMessage,
      });
      this.value.push({
        role: "assistant",
        isWaiting: true,
        content: "...",
      });
      this.onChange(this.newMessage, e);
      this.renderChat();
      setTimeout(() => {
        this.newMessage = "";
      }, 100);
    },

    onChange(v, e) {
      this.emitDataBinding(v, "output");
      this.emitClick(e);
    },

    onCopyClick(content) {
      // Method to handle copy icon click
      navigator.clipboard
        .writeText(content)
        .then(() => {
          // Optionally, show a confirmation message
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    },

    onReloadClick(messageIndex) {
      // Method to handle reload icon click
      // Implement your reload logic here
      console.log("Reload message at index:", messageIndex);
    },
    assistantImageUrl() {
      const image = this.model?.props?.assistantImage;
      if (!image) return null;

      if (this.hash) {
        return `/rest/images/${this.hash}/${image.url}`;
      } else if (this.jwtToken) {
        return `/rest/images/${image.url}?token=${this.jwtToken}`;
      } else {
        if (!this.isPublic) {
          this.logger.warn("setImage", "error > no token or hash");
        }
        return `/rest/images/${image.url}`;
      }
    },
    getLabelNode() { },

    render(model, style, scaleX, scaleY) {
      this.model = model;
      this.style = style;
      this._scaleX = scaleX;
      this._scaleY = scaleY;
      if (model.props.options) {
        this.value = model.props.options.map((o) => {
          return {
            content: o,
            role: "assistant",
            init: true,
          };
        });
      }
      this.value = [
        ...this.value,
        // { role: "user", content: "Hi there!" },
        // { role: "assistant", content: "Hello! How can I assist you today?" },
      ];

      if (model.props.prompts) {
        this.prompts = model.props.prompts;
      }

      if (model.props.systemprompts) {
        this.systemprompts = model.props.systemprompts;
      }

      if (model.props.markup) {
        this.markDownConverter = new showdown.Converter();
      } else {
        delete this.markDownConverter;
      }

      this.renderChat();
    },

    renderChat() {
      this.renderBubbles(this.value);
      this.setStyle(this.style, this.model);
      this.setBubbleStyle(this.style);
      setTimeout(() => this.scrolldown(), 200);
    },

    renderBubbles(messages) {
      this.reset();
      const cntr = this.db.div("MatchWidgetTypeChatCntr").build();
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        const row = this.db.div("MatchWidgetTypeChatRow " + m.role).build(cntr);

        let bubble;
        let iconsDiv;

        const url = this.assistantImageUrl();
        if (m.role === "assistant" && url) {
          const rowAvatar = this.db.div("MatcFlex ").build(row);
          const avatar = this.db.div("MatchWidgetTypeChatAvatar").build(rowAvatar);
          avatar.style.backgroundImage = `url(${url})`;
          const bubblecontent = this.db.div(``).build(rowAvatar);
          bubble = this.db.div(`MatchWidgetTypeChatBubble`).build(bubblecontent);
          iconsDiv = this.db.div("MatchWidgetTypeChatIcons").build(bubblecontent);
        } else {
          bubble = this.db.div(`MatchWidgetTypeChatBubble`).build(row);
          iconsDiv = this.db.div("MatchWidgetTypeChatIcons").build(row);
        }

        if (this.model.props.markup) {
          bubble.innerHTML = this.getMarkDown(m.content);
        } else {
          bubble.innerText = m.content;
        }
        if (!m.init) {
          if (m.role === "assistant") {
            const copyIcon = document.createElement("span");
            copyIcon.className = "mdi mdi-content-copy";
            iconsDiv.appendChild(copyIcon);
            copyIcon.style.fontSize = this.bubbleIconStyle.fontSize;
            copyIcon.style.color = this.bubbleIconStyle.color;
            copyIcon.style.cursor = this.bubbleIconStyle.cursor;
            copyIcon.addEventListener("click", () =>
              this.onCopyClick(m.content)
            );

            const reloadIcon = document.createElement("span");
            reloadIcon.className = "mdi mdi-reload";
            iconsDiv.appendChild(reloadIcon);
            reloadIcon.style.fontSize = this.bubbleIconStyle.fontSize;
            reloadIcon.style.color = this.bubbleIconStyle.color;
            reloadIcon.style.cursor = this.bubbleIconStyle.cursor;
            reloadIcon.addEventListener("click", () => this.onReloadClick(i));
          }
        }

        this._shadowNodes.push(bubble);
        this._rowNodes.push({
          role: m.role,
          row: row,
          bubble: bubble,
        });
        if (m.isWaiting) {
          css.add(bubble, "waiting");
        }
      }

      this.cntr = cntr;
      this.$refs.wrapper.appendChild(cntr);
    },

    setBubbleStyle(style) {
      const bubbleShape = style.bubbleShape || "rounded";

      this._rowNodes.forEach((row) => {
        const node = row.bubble;
        node.classList.remove("speech-bubble");
        node.style.borderRadius = style.bubbleBorderRadius + "px"; // no scalled becasue in preview would be 0
        node.style.borderStyle = "solid";
        node.style.padding = this._getBorderWidth(style.bubblePadding) + "px" || "10px";
        if (row.role === "assistant") {
          const width = this._getBorderWidth(style.assistantBorderWidth);
          node.style.background = style.assistantBackground;
          node.style.color = style.assistantColor;
          node.style.borderColor = style.assistantBorderColor;
          node.style.borderWidth = width + "px";
          if (style.bubbleShape === "speech") {
            node.style.borderBottomLeftRadius = "0px";
          }
        } else {
          const width = this._getBorderWidth(style.userBorderWidth);
          node.style.background = style.userBackground;
          node.style.color = style.userColor;
          node.style.borderColor = style.userBorderColor;
          node.style.borderWidth = width + "px";
          if (style.bubbleShape === "speech") {
            node.style.borderBottomRightRadius = "0px";
          }
        }
        if (bubbleShape === "speech") {
          node.classList.add("speech-bubble");
          node.style.position = "relative";
        }
      });
    },

    getMarkDown(txt) {
      if (this.markDownConverter) {
        return this.markDownConverter.makeHtml(txt);
      }
      return txt;
    },

    setDataBinding(variable, value) {
      console.debug("setDataBinding", variable, value);
      const databinding = this.getDataBinding(this.model);
      if (databinding && databinding["input"]) {
        const widgetVariable = databinding["input"];
        if (widgetVariable === variable) {
          this._setDataBindingValue(value);
        }
      }
    },

    _setDataBindingValue(v) {
      if (v === this.newMessage) {
        return;
      }
      if (Array.isArray(v)) {
        this.setValue(v);
        return;
      }

      this.value = this.value.filter((m) => !m.isWaiting);
      this.value.push({
        content: v,
        role: "assistant",
      });
      this.setValue(this.value);
    },

    getValue() {
      return this.value;
    },

    setValue(v) {
      if (v && Array.isArray(v)) {
        this.value = v;
      }
      this.renderChat();
    },

    _set_gap(parent, style) {
      const gap = this._getBorderWidth(style.gap);
      this.cntr.style.gap = gap + "px";
      this.domNode.style.gap = gap + "px";
    },

    getState() { },

    setState() { },

    onClick(e) {
      this.stopEvent(e);
      this.emitClick(e);
    },
    resize() {
      this.updateVisiblePrompts();
    },
    updateVisiblePrompts() {
      // Reset visible prompts and overflow indicator
      this.visiblePrompts = [];
      this.hasOverflow = false;
      const container = this.$refs.promptsContainer;
      if (container) {
        const containerWidth = container.clientWidth;
        let totalWidth = 0;

        const tempElement = document.createElement("div");
        tempElement.className = "MatchWidgetTypeChatPrompt";
        tempElement.style.visibility = "hidden";
        tempElement.style.position = "absolute";
        tempElement.style.whiteSpace = "nowrap";
        tempElement.style.padding = this.promptStyle.padding;
        tempElement.style.fontSize = this.promptStyle.fontSize;
        tempElement.style.borderWidth = this.promptStyle.borderWidth;
        tempElement.style.borderStyle = this.promptStyle.borderStyle;
        tempElement.style.borderRadius = this.promptStyle.borderRadius;
        tempElement.style.borderColor = this.promptStyle.borderColor;
        tempElement.style.boxSizing = "border-box";
        container.appendChild(tempElement);

        for (let i = 0; i < this.prompts.length; i++) {
          const prompt = this.prompts[i];
          tempElement.innerText = prompt;
          const promptWidth = tempElement.offsetWidth + 8; // Adding gap

          if (totalWidth + promptWidth <= containerWidth) {
            this.visiblePrompts.push(prompt);
            totalWidth += promptWidth;
          } else {
            this.hasOverflow = true;
            break;
          }
        }
        container.removeChild(tempElement);
      } else {
        this.visiblePrompts = this.prompts;
      }
    },
  },
  watch: {
    prompts(newVal) {
      if (newVal && newVal.length > 0) {
        this.$nextTick(() => {
          this.updateVisiblePrompts();
        });
      }
    },
  },
  mounted() {
    this.db = new DomBuilder();
    this.$nextTick(() => {
      this.updateVisiblePrompts();
    });
  },
};
</script>
