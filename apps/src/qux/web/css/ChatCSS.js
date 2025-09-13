import Logger from "../../core/Logger";

export default class ChatCSS {
  constructor(cssFactory) {
    Logger.log(5, "ChatCSS.constructor()");
    this.cssFactory = cssFactory;
  }

  run(selector, style, widget) {
    let result = "";

    // Main container
    result += `${selector} {\n`;
    result += this.cssFactory.getPosition(widget);
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties);
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties);
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties);
    if (style.gap !== undefined) {
      result += `  gap: ${style.gap}px;\n`;
    }
    result += this.cssFactory.getBackGround(style, widget);
    result += "}\n\n";

    // Chat container
    result += `${selector} .qux-chat-cntr {\n`;
    if (style.gap !== undefined) {
      result += `  gap: ${style.gap}px;\n`;
    }
    result += "}\n\n";

    // Chat input
    result += `${selector} .qux-chat-input {\n`;
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties);
    if (style.textareaBackground) {
      result += `  background: ${style.textareaBackground};\n`;
    }
    if (style.textareaRadius) {
      const textareaRadius = style.textareaRadius;
      result += `border-radius: ${textareaRadius}px; `;
    }
    if (style.textareaBorderWidth) {
      const textareaBorderWidth = style.textareaBorderWidth;
      result += `border-width: ${textareaBorderWidth}px; `;
      if (textareaBorderWidth > 0) result += `border-style: solid; `;
    }
    if (style.textareaBorderColor) {
      const textareaBorderColor = style.textareaBorderColor;
      result += `border-color: ${textareaBorderColor}; `;
    }
    result += "}\n\n";

    // Textarea
    result += `${selector} .qux-chat-input textarea {\n`;
    if (style.inputHeight !== undefined) {
      result += `  height: ${style.inputHeight}px;\n`;
    }
    if (style.textareaColor) {
      result += `  color: ${style.textareaColor};\n`;
    }
    result += "}\n\n";

    result += `${selector} .stop-icon {\n`;
    result += `  color: ${style.textareaBackground};\n`;
    result += `  background: ${style.textareaColor};\n`;
    result += "}\n\n";

    result += `${selector} .cancel-icon {\n`;
    result += `  color: ${style.textareaColor};\n`;
    result += "}\n\n";

    // Prompts
    result += `${selector} .qux-chat-prompt, ${selector} .overflow-prompts .qux-chat-prompt {\n`;
    if (style.promptBackground) {
      result += `  background: ${style.promptBackground};\n`;
    }
    if (style.promptColor) {
      result += `  color: ${style.promptColor};\n`;
    }
    if (style.promptBorderColor) {
      result += `  border-color: ${style.promptBorderColor};\n`;
    }
    if (style.promptBorderWidth !== undefined) {
      result += `  border-width: ${style.promptBorderWidth}px;\n`;
    }
    if (style.promptBorderRadius !== undefined) {
      result += `  border-radius: ${style.promptBorderRadius}px;\n`;
    }
    if (style.promptFontSize !== undefined) {
      result += `  font-size: ${style.promptFontSize}px;\n`;
    }
    result += "  border-style: solid;\n";
    result += "  cursor: pointer;\n";
    result += "}\n\n";

    // Prompt hover
    result += `${selector} .qux-chat-prompt:hover {\n`;
    if (style.promptBackgroundHover) {
      result += `  background-color: ${style.promptBackgroundHover};\n`;
    }
    if (style.promptColorHover) {
      result += `  color: ${style.promptColorHover};\n`;
    }
    if (style.promptBorderColorHover) {
      result += `  border-color: ${style.promptBorderColorHover};\n`;
    }
    result += "}\n\n";

    // Message action icons
    result += `${selector} .message-actions .mdi {\n`;
    if (style.bubbleIconColor) {
      result += `  color: ${style.bubbleIconColor};\n`;
    }
    if (style.bubbleIconSize !== undefined) {
      result += `  font-size: ${style.bubbleIconSize}px;\n`;
    }
    result += "}\n\n";

    // Bubble icon hover
    result += `${selector} .message-actions .mdi:hover {\n`;
    if (style.bubbleIconColorHover) {
      result += `  color: ${style.bubbleIconColorHover};\n`;
    }
    result += "}\n\n";

    // Hover state for chat input
    if (widget.hover) {
      const hover = widget.hover;
      result += `${selector} .qux-chat-input:hover {\n`;
      if (hover.background) {
        result += `  background: ${hover.background};\n`;
      }
      if (hover.color) {
        result += `  color: ${hover.color};\n`;
      }
      result += this.cssFactory.getStyleByKey(hover, widget, this.cssFactory.borderProperties);
      result += "}\n\n";
    }

    // Focus state for chat input
    if (widget.focus) {
      const focus = widget.focus;
      result += `${selector} .qux-chat-input:focus {\n`;
      if (focus.background) {
        result += `  background: ${focus.background};\n`;
      }
      if (focus.color) {
        result += `  color: ${focus.color};\n`;
      }
      result += this.cssFactory.getStyleByKey(focus, widget, this.cssFactory.borderProperties);
      result += "}\n\n";
    }

    // Chat bubble
    result += `${selector} .qux-chat-bubble {\n`;
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties);
    if (style.bubblePadding !== undefined) {
      result += `  padding: ${style.bubblePadding}px;\n`;
    }
    if (style.bubbleBorderRadius !== undefined) {
      result += `  border-radius: ${style.bubbleBorderRadius}px;\n`;
    }
    if (style.bubbleBorderColor !== undefined) {
      result += `  border-color: ${style.bubbleBorderColor}px;\n`;
    }
    if (style.boxShadow) {
      result += this.cssFactory.getBoxShadow(style.boxShadow) + ";\n";
    }
    result += "}\n\n";

    // User chat bubble
    result += `${selector} .user .qux-chat-bubble {\n`;
    if (style.userBackground) {
      result += `  background: ${style.userBackground};\n`;
    }
    if (style.userColor) {
      result += `  color: ${style.userColor};\n`;
    }
    if (style.userBorderColor) {
      result += `  border-color: ${style.userBorderColor};\n`;
    }
    if (style.bubbleShape === "speech") {
      result += `  border-radius: ${style.bubbleBorderRadius}px ${style.bubbleBorderRadius}px 0px  ${style.bubbleBorderRadius}px;\n`;
    }
    if (style.userBorderWidth !== undefined) {
      result += `  border-width: ${style.userBorderWidth}px;\n`;
    }
    result += "}\n\n";

    // Assistant chat bubble
    result += `${selector} .assistant .qux-chat-bubble {\n`;
    if (style.assistantBackground) {
      result += `  background: ${style.assistantBackground};\n`;
    }
    if (style.assistantColor) {
      result += `  color: ${style.assistantColor};\n`;
    }
    if (style.assistantBorderColor) {
      result += `  border-color: ${style.assistantBorderColor};\n`;
    }
    if (style.bubbleShape === "speech") {
      result += `  border-radius: ${style.bubbleBorderRadius}px ${style.bubbleBorderRadius}px ${style.bubbleBorderRadius}px 0px;\n`;
    }
    if (style.assistantBorderWidth !== undefined) {
      result += `  border-width: ${style.assistantBorderWidth}px;\n`;
    }
    result += "}\n\n";

    // System prompts select
    result += `${selector} .prompt-select {\n`;
    if (style.systempromptBackground) {
      result += `  background: ${style.systempromptBackground};\n`;
    }
    if (style.systempromptColor) {
      result += `  color: ${style.systempromptColor};\n`;
    }
    if (style.systempromptBorderColor) {
      result += `  border-color: ${style.systempromptBorderColor};\n`;
    }
    if (style.systempromptBorderWidth !== undefined) {
      result += `  border-width: ${style.systempromptBorderWidth}px;\n`;
    }
    if (style.systempromptBorderRadius !== undefined) {
      result += `  border-radius: ${style.systempromptBorderRadius}px;\n`;
    }
    result += "  border-style: solid;\n";
    if (style.systempromptFontSize !== undefined) {
      result += `  font-size: ${style.systempromptFontSize}px;\n`;
    }
    if (style.fontFamily) {
      result += `  font-family: ${style.fontFamily};\n`;
    }
    result += "  border-style: solid;\n";
    result += "  cursor: pointer;\n";
    result += "}\n\n";

    result += `${selector} .select-icon-container {\n`;
    result += `  color: ${style.systempromptColor};\n`;
    result += "}\n\n";

    result += `${selector} .select-icon-container:hover {\n`;
    if (style.systempromptColorHover) {
      result += `  color: ${style.systempromptColorHover};\n`;
    }
    result += "}\n\n";

    result += `${selector} .prompt-select:hover {\n`;
    if (style.systempromptBackgroundHover) {
      result += `  background: ${style.systempromptBackgroundHover};\n`;
    }
    if (style.systempromptColorHover) {
      result += `  color: ${style.systempromptColorHover};\n`;
    }
    if (style.systempromptBorderColorHover) {
      result += `  border-color: ${style.systempromptBorderColorHover};\n`;
    }
    result += "}\n\n";

    result += `${selector} .custom-arrow {\n`;
    if (style.systempromptColor) {
      result += `  color: ${style.systempromptColor};\n`;
    }
    result += "}\n\n";
    return result;
  }
}
