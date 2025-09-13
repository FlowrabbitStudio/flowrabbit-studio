import Logger from '../../core/Logger'

export default class ProgressBarCSS {
    
        constructor(cssFactory) {
            Logger.log(5, 'ProgressBarCSS.constructor()')
            this.cssFactory = cssFactory
        }
    
        run (selector, style, widget) {
            let result = ''
            result += selector + ' {\n'
            result += this.cssFactory.getPosition(widget);
            result += `  justify-content: flex-start;\n`
            result += '}\n\n'
    
            result += selector + ' .qux-progress-bar {\n'
            result += `  width:100%;\n`
            result += `  height:${widget.h}px;\n`
            result += `  background:${style.background};\n`
            result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
            result += '}\n\n'
    
            result += selector + ' .qux-progress-bar-fill {\n'
            result += `  height:100%;\n`
            result += `  background:${style.fill};\n`
            result += '}\n\n'
    
            return result
        }
    }

