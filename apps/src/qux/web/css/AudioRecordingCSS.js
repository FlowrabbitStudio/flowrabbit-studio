import Logger from '../../core/Logger'

export default class AudioRecordingCSS {

    constructor(cssFactory) {
        Logger.log(5, 'AudioRecordingCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getRawStyle(style, widget);
        result += '}\n\n'

        // icon
        const h = Math.min(widget.h, widget.w) * 0.6;
        result += selector + ' .mdi {\n'
        result += `  font-size: ${h}px;\n`
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


        if (widget.hover) {
            let hover = widget.hover
            result += selector + ':hover {\n'
            result += `  background:${hover.background};\n`
            result += `  color:${hover.color};\n`
            result += this.cssFactory.getStyleByKey(hover, widget, this.cssFactory.borderColorProperties)
            result += '}\n\n'
          }
  
        if (widget.active) {
            let active = widget.active
            result += selector + '.qux-active {\n'
            result += `  background:${active.background};\n`
            result += `  color:${active.color};\n`
            result += this.cssFactory.getStyleByKey(active, widget, this.cssFactory.borderColorProperties)
            result += '}\n\n'
        }


   
        return result
    }
}