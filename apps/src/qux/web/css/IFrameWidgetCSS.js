import Logger from '../../core/Logger'

export default class IFrameWidgetCSS {

    constructor(cssFactory) {
        Logger.log(5, 'IFrameWidgetCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        if (widget.style.backgroundImage) {
          result += this.cssFactory.getRawStyle(widget.style, widget);
        } else {
          result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
          result += `  height: ${widget.h}px\n`
        }
        result += '}\n\n'
        return result
    }
}