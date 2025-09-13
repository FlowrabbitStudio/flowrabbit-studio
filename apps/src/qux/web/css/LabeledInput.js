import Logger from '../../core/Logger'

export default class LabeledInput {

    constructor(cssFactory) {
        Logger.log(5, 'LabeledInput.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
        result += '}\n\n'

        result += selector + ' label {\n'
        result += `  color:${style.labelColor};\n`
        result += `  font-size:${style.labelFontSize}px;\n`
        if (style.labelFontWeight) {
            result += `  font-weight:${style.labelFontWeight};\n`
        }

        result += `  padding-left:${style.labelOffset}px;\n`
        result += '}\n\n'


        result += selector + ' .qux-textbox {\n'
        result += this.cssFactory.getRawStyle(style, widget);
        result += `  height:${this.getInputSize(style)};\n`
        result += '}\n\n'



        if (widget.hover) {
            let hover = widget.hover
            result += selector + ' .qux-textbox:hover {\n'
            result += this.cssFactory.getRawStyle(hover, widget);
            result += '}\n\n'
        }

        if (widget.focus) {
            let focus = widget.focus
            result += selector + ' .qux-textbox:focus {\n'
            result += this.cssFactory.getRawStyle(focus, widget);
            result += '}\n\n'
        }

        if (widget.error) {
            let error = widget.error
            result += selector + ' .qux-textbox.qux-validation-error {\n'
            result += this.cssFactory.getRawStyle(error, widget);
            result += '}\n\n'
        }


        return result
    }

    getInputSize(style) {
        if (style.inputHeight && style.inputHeight > 0) {
            return style.inputHeight + "px"
        } else {
            let h = style.fontSize +
                style.paddingBottom +
                style.paddingTop +
                style.borderTopWidth +
                style.borderBottomWidth
            
            return h + 'px'
        }
    }
}