import Logger from '../../core/Logger'

export default class AudioPlayerCSS {

    constructor(cssFactory) {
        Logger.log(5, 'AudioPlayerCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += `  height: ${widget.h}px;\n`
        result += `  width: ${widget.w}px\n`
        result += '}\n\n'

        // Styles of the audio component
        result += selector + ' audio::-webkit-media-controls-enclosure {\n'
        if (style.background) {
            result += `  background: ${style.background};\n`
        }
        
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderColorProperties)
        result += `  border: ${style.border};\n`
        result += '}\n\n'
        
        if (style.color) {
            result += selector + ' audio::-webkit-media-controls-panel input {\n'
            result += `  color: ${style.color} !important;\n`
            result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
            result += '}\n\n'
        }

        return result
    }
}