import Logger from "../../core/Logger";

export default class ImageCSS {
  constructor(cssFactory) {
    Logger.log(5, "ImageCSS.constructor()");
    this.cssFactory = cssFactory;
  }

  run(selector, style, widget) {
    let result = "";
    result += selector + " {\n";
    result += this.cssFactory.getPosition(widget);
    if (widget.style.backgroundImage) {
      result += this.cssFactory.getRawStyle(widget.style, widget);
      if (style.filter) {
        result += `  filter: ${this.getFilter(style.filter)};\n`;
      }
    } else {
      result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties);
      result += `  background:#fafafa;\n`;      
      result += `  display: flex;\n`
      result += `  align-items: center;\n`
      result += `  justify-content: center;\n`
    }
    result += "}\n\n";
    result += selector + ' .qux-image-icon' + " {\n";
    if (widget.style.backgroundImage) {
      result += `  display: none;\n`;
    } else {
      result += `  display: block;\n`;
    }
    result += "}\n\n";
    return result;
  }

  getFilter(filter) {
    const filters = [];
    if (filter.blur) {
      let blur = filter.blur;
      blur = this.getZoomed(blur, this._scaleX);
      filters.push(`blur(${blur}px)`);
    }

    if (filter.grayscale) {
      filters.push(`grayscale(${filter.grayscale}%)`);
    }

    if (filter.opacity) {
      filters.push(`opacity(${filter.opacity}%)`);
    }

    if (filter.contrast !== undefined) {
      filters.push(`contrast(${filter.contrast}%)`);
    }

    if (filter.brightness !== undefined) {
      filters.push(`brightness(${filter.brightness}%)`);
    }

    if (filter.saturate !== undefined) {
      filters.push(`saturate(${filter.saturate}%)`);
    }

    if (filter.hueRotate !== undefined) {
      filters.push(`hue-rotate(${(filter.hueRotate * 360) / 100}deg)`);
    }
    return filters.join(" ");
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
