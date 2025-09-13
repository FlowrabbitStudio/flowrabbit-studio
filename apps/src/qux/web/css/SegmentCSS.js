import Logger from "../../core/Logger";

export default class SegmentCSS {
  constructor(cssFactory) {
    Logger.log(5, "SegmentCSS()");
    this.cssFactory = cssFactory;
    this.imagePrefix = cssFactory.imagePrefix;
  }

  run(selector, style, widget) {
    let result = "";

    result += selector + " {\n";
    result += this.cssFactory.getPosition(widget);

    result += "}\n\n";

    result += selector + " .qux-segment-picker-cntr {\n";
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties);
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties);
    result += this.cssFactory.getBackGround(style, widget);
    if (style.boxShadow) {
      result += this.cssFactory.getBoxShadow(style.boxShadow) + ";\n";
    }
    if (widget?.props?.buttonsGap) {
      result += ` display: flex;\n`;
      result += ` gap: ${widget?.props?.buttonsGap}px;\n`;
    }
    result += "}\n\n";
    result += selector + " .qux-segment-indicator{\n";
    result += `  border-radius: ${style.buttonBorderRadius}px;\n`;
    result += `  border-color: transparent;\n`;
    if (!widget.props?.multi) {
      result += `  background:${widget.active.background};\n`;
      result += `  color:${widget.active.color};\n`;
    }
    let active = widget.active;
    if (active.boxShadow) {
      result += this.cssFactory.getBoxShadow(active.boxShadow) + ";\n";
    }
    if (active.borderTopWidth) {
      result += ` border: ${active.borderTopWidth}px solid ${active.borderBottomColor};\n`;
    }
    result += "}\n\n";

    result += selector + " .qux-segment-item {\n";
    result += `  background:transparent;\n`;
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties);

    if (style.buttonBorderColor) result += `  border-color: ${style.buttonBorderColor};\n`;
    if (style.buttonBorderStyle) result += `  border-style: ${style.buttonBorderStyle};\n`;
    result += `  border-width: ${style.buttonBorderWidth || 0}px;\n`;
    result += `  border-radius: ${style.buttonBorderRadius}px;\n`;
    if (style.buttonBoxShadow) {
      result += this.cssFactory.getBoxShadow(style.buttonBoxShadow) + ";\n";
    }
    result += "}\n\n";

    if (widget.active) {
      let active = widget.active;
      result += selector + " .qux-segment-item.qux-segment-item-selected{\n";
      if (!widget.props?.multi) {
        result += `  background:transparent;\n`;
      } else {
        result += `  background:${active.background};\n`;
        result += this.cssFactory.getBoxShadow(active.boxShadow) + ";\n";
        if (active.borderTopWidth) {
          result += ` border: ${active.borderTopWidth}px solid ${active.borderBottomColor};\n`;
        }
      }
      if (active.fontSize) {
        result += ` font-size: ${active.fontSize}px;\n`;
      }
      if (active.fontStyle) {
        result += ` font-style: ${active.fontStyle};\n`;
      }
      result += `  color:${active.color};\n`;
      result += ` z-index: 9;\n`;
      result += "}\n\n";
    }

    return result;
  }
}
