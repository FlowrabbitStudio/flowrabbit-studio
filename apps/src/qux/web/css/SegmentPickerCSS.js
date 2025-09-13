import Logger from '../../core/Logger'

export default class SegmentCSS {

    constructor(cssFactory) {
        Logger.log(5, 'SegmentCSS()')
        this.cssFactory = cssFactory
        this.imagePrefix = cssFactory.imagePrefix
    }

    run (selector, style, widget) {
        let result = ''

        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getBackGround(style, widget)
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderRadiusProperties)
        result += '}\n\n'

        result += selector + ' .qux-segment-picker-cntr {\n'
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += '}\n\n'

        result += selector + ' .qux-segment-inidcator{\n'
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderRadiusProperties)
        result += `  border-color: transparent;\n`
        result += `  background:${style.selectedBackground};\n`
        result += `  color:${style.selectedColor};\n`
        result += '}\n\n'

        result += selector + ' .qux-segment-item {\n'
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderRadiusProperties)
        result += '}\n\n'
   
        result += selector + ' .qux-segment-item.qux-segment-item-selected{\n'
        result += `  color:${style.selectedColor};\n`
        result += '}\n\n'
        
        return result
    }

}