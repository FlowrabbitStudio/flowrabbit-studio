import Logger from "../../core/Logger";

export default class ImageCarouselCSS {
  constructor(cssFactory) {
    Logger.log(5, "ImageCarouselCSS.constructor()");
    this.cssFactory = cssFactory;
  }

  run(selector, style, widget) {
    let result = "";
    result += selector + " {\n";
    result += this.cssFactory.getPosition(widget);
    result += `  height: ${widget.h}px;\n`;
    result += `  width: ${widget.w}px;\n`;
    result += "}\n\n";
    const numCovers = widget.props?.numCovers || 1;
    const vertical = widget.props?.vertical;
    result += selector + " .carousel-image {\n";
    result += `  width: ${vertical ? "100%" : `calc(${100 / numCovers}% - 10px)`};\n`;
    result += `  height: ${vertical ? `calc(${100 / numCovers}% - 10px)` : "100%"};\n`;
    result += `  margin: ${vertical ? "5px 0" : "0 5px"};\n`;
    if (style.border) {
      result += `  border: ${style.border};\n`;
    } else {
      result += `  border-top: ${style.borderTopWidth || 0}px ${style.borderTopStyle || "solid"} ${style.borderTopColor || "#000"};\n`;
      result += `  border-bottom: ${style.borderBottomWidth || 0}px ${style.borderBottomStyle || "solid"} ${style.borderBottomColor || "#000"};\n`;
      result += `  border-left: ${style.borderLeftWidth || 0}px ${style.borderLeftStyle || "solid"} ${style.borderLeftColor || "#000"};\n`;
      result += `  border-right: ${style.borderRightWidth || 0}px ${style.borderRightStyle || "solid"} ${style.borderRightColor || "#000"};\n`;
    }
    if (style.borderRadius) {
      result += `  border-radius: ${style.borderRadius};\n`;
    } else {
      result += `  border-top-left-radius: ${style.borderTopLeftRadius || 0}px;\n`;
      result += `  border-top-right-radius: ${style.borderTopRightRadius || 0}px;\n`;
      result += `  border-bottom-left-radius: ${style.borderBottomLeftRadius || 0}px;\n`;
      result += `  border-bottom-right-radius: ${style.borderBottomRightRadius || 0}px;\n`;
    }
    result += `  background-color: ${style.backgroundColor || "transparent"};\n`;
    result += `  background-image:${this.getImagePlaceHolder(widget)};\n`;
    result += "}\n\n";
    return result;
  }
  getImagePlaceHolder(widget) {
    try {
      var w = widget.w * 2;
      var h = widget.h * 2;
      var c = document.createElement("canvas");
      var context = c.getContext("2d");
      c.width = w;
      c.height = h;
      h += 0.5;
      w += 0.5;
      var n = 0.5;
      context.moveTo(n, n);
      context.lineTo(w, h);
      context.moveTo(w, n);
      context.lineTo(n, h);
      context.strokeStyle = "#333";
      context.strokeWidth = 2;
      context.imageSmoothingEnabled = false;
      context.stroke();
      let url = "url(" + c.toDataURL("image/png") + ")";
      return url;
    } catch (err) {
      /**
       * can happen in jest
       */
      Logger.log(5, "ImageCSS.getImagePlaceHolder() error");
    }
  }
}
