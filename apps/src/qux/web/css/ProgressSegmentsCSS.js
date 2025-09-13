import Logger from '../../core/Logger'

export default class ProgressSegmentsCSS {
    constructor(cssFactory) {
        Logger.log(5, 'ProgressSegmentsCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += '}\n\n'
        result += selector + ' .qux-progress-segments {\n'
        result += '  display: flex;\n'
        result += '  justify-content: space-between;\n'
        result += `  height: ${widget.h}px;\n`
        result += '  width: 100%;\n'
        result += '  outline: none;\n'
        result += '  border: none;\n'   
        result += `  gap: ${widget.props.gap}px;\n`         
        result += '}\n\n'
        result += selector + ' .qux-progress-element {\n'
        result += '  flex-grow: 1;\n'
        result += `  color: ${style.color};\n`
        result += `  background: ${style.background};\n`
        if (style.border) {
            result += `  border: ${style.border};\n`
        }
        if (style.borderColor) {
            result += `  border-color: ${style.borderColor};\n`
            result += `  border-width: ${style.borderWidth};\n`
            result += `  border-style: ${style._borderTopStyle};\n`
        }
        result += `  border-radius: ${style.borderRadius};\n`
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += '  height: 100%;\n'
        result += '  width: 100%;\n'
        result += '}\n\n'
        result += selector + ' .qux-progress-element.active {\n'
        result += `  background: ${style.activeBackground};\n`
        result += `  border-color: ${style.activeBorderColor};\n`
        result += '  height: 100%;\n'
        result += '  width: 100%;\n'
        result += '}\n\n'

        return result
    }
}
