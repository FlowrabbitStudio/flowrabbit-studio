import Logger from '../../core/Logger'

export default class LabeledImageListCSS {
    constructor(cssFactory) {
        Logger.log(5, 'LabeledImageListCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        
        let result = ''

        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
        //result += this.cssFactory.getRawStyle(style, widget);
        result += '}\n\n'

        const w = (widget.props.imageWidth || 128)
        const h = (widget.props.imageHeight || 128)

        result += selector + ' .qux-labeled-image-list-cntr {\n'
        result += `  gap: ${widget?.props?.gap}px;\n`
        result += `  grid-template-columns: repeat(auto-fill, ${w}px);\n`
        result += `  grid-auto-rows: ${h}px;\n`
        result += '}\n\n'


        // result += selector + ' .qux-labeled-image-list-item {\n'      
        // result += '}\n\n'


        result += selector + ' .qux-labeled-image-list-image {\n'
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        if (style.boxShadow) {
            result += this.cssFactory.getBoxShadow(style.boxShadow) + ';\n'
        }
        if (style.background) {
            result += `  background-color: ${style.background};\n`
        }
        result += `  width: ${w}px;\n`
        result += `  height: ${h}px;\n`
        result += '}\n\n'

        if (widget.hover) {
            let hover = widget.hover
            result += selector + ' .qux-labeled-image-list-image:hover {\n'
            result += this.cssFactory.getStyleByKey(hover, widget, this.cssFactory.borderProperties)
            if (hover.boxShadow) {
                result += this.cssFactory.getBoxShadow(hover.boxShadow) + ';\n'
            }
            if (hover.background) {
                result += `  background-color: ${hover.background};\n`
            }
            result += '}\n\n'
        }


        result += selector + ' .qux-labeled-image-list-hook {\n'
        result += `  border-color: ${style.selectColor};\n`
        result += '}\n\n'

        result += selector + ' .qux-labeled-image-list-item-selected .qux-labeled-image-list-image {\n'
        result += `  border-color: ${style.selectColor};\n`
        result += '}\n\n'
        

        for (let i=0; i < 20; i++) {
            result += selector + ` .qux-labeled-image-list-item-loading-${i} {\n`
            result += `   animation-delay: ${i * 50}ms;\n` 
            result += `  width: ${w}px;\n`
            result += `  height: ${h}px;\n`
            result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
            if (style.background) {
                result += `  background-color: ${style.background};\n`
            }
            result += '}\n\n'
          }
   
        return result
    }
}


// this.imageW = w
// this.imageH = h

// this.gap = this.model.props.gap
// this.layout = this.model.props.layout
// this.borderRadius = style.borderBottomLeftRadius  * scaleX
// this.borderWidth = style.borderTopWidth * scaleX
// this.borderColor = style.borderTopColor * scaleX
// this.boxShadow = this.getBoxShadow(style)
// this.backgroundColor = style.background
