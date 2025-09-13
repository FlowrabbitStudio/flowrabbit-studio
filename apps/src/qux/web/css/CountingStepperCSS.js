import Logger from '../../core/Logger'

export default class CountingStepperCSS {
    constructor(cssFactory) {
        Logger.log(5, 'CountingStepperCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
        result += `  background: ${style.background};\n`       
        result += '}\n\n'
        result += selector + ' .qux-stepper-btn {\n'
        result += `   background: ${style.backgroundButton};\n` 
        result += `   color: ${style.colorButton};\n`    
        result += '}\n\n'
        result += selector + '.qux-stepper .qux-stepper-num {\n' 
        result += '}\n\n'

        return result
    }
}
