import Logger from '../../core/Logger'

export default class UploadPreviewCSS {

    constructor(cssFactory) {
        Logger.log(5, 'UploadPreviewCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += this.cssFactory.getBackGround(style, widget);
        result += '}\n\n'
        return result
    }

}