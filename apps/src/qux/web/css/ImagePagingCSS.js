import Logger from '../../core/Logger'

export default class ImagePagingCSS {
    constructor(cssFactory) {
        Logger.log(5, 'ImagePagingCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += `  height: ${widget.h}px;\n`
        result += `  gap: ${widget.props.gap}px;\n`
        result += '}\n\n'
        result += selector + ' .qux-image-paging-element {\n'
        result += `  width: ${widget.h}px;\n`
        result += `  height: ${widget.h}px;\n`
        result += `  transition: all 0.25s;\n`
        result += `  background: ${style.background};\n`
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += `  border-color: ${style._borderTopColor};\n`
        result += `  border-style: solid;\n`
        result += '}\n\n'
        result += selector + ' .qux-image-paging-element.active {\n'
        result += `  background: ${style.activeBackground};\n`
        result += `  border-color: ${style.activeBorderColor};\n`
        result += '}\n\n'
        console.log("fdssd")
        return result
    }
}