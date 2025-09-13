import Logger from '../../core/Logger'
import * as Util from '../../core/ExportUtil'

export default class RepeaterCSS {

    constructor(cssFactory) {
        Logger.log(5, 'RepeaterCSS.constructor()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
      let result = ''

      /**
       * If we have just one child, we just take this to male sure we use teh min and max width
       */
      let boundingBox = widget.children.length === 1 ? widget.children[0]: Util.getBoundingBoxByBoxes(widget.children)
      boundingBox.parent = widget

            
      const grid = this.calculateGrid(
        widget, 
        boundingBox,             
        widget.props.distanceX, 
        widget.props.distanceY, 
        widget.props.layout !== 'rows'
      )


      result += selector + ' {\n'
      result += this.cssFactory.getRawStyle(style, widget);
      result += this.cssFactory.getPosition(widget);
      result += `  padding-top: ${grid.paddingTop}px;\n`;
      result += `  padding-bottom: ${grid.paddingBottom}px;\n`; 
      result += `  padding-left: ${grid.paddingLeft}px;\n`; 
      result += `  padding-right: ${grid.paddingRight}px;\n`; 
      result += '}\n\n'

      result += selector + ' .qux-repeater-wrapper{\n'

      if (Util.isRepeaterGrid(widget)) {
          result += "  display: flex;\n"
          result += "  flex-direction: row;\n"
          result += "  flex-wrap: wrap;\n"
          result += "  align-items: flex-start;\n"
          result += "  align-content: flex-start;\n"
          if (widget.props.distanceX < 0) {
            result += "  justify-content: space-between;\n"
            result += `  column-gap: 4px;\n`
          } else {
            result += `  column-gap: ${grid.spacingX}px;\n`
          }
          result += `  row-gap: ${grid.spacingY}px;\n`        
      } else {
          result += "  display: flex;\n"
          result += "  flex-direction: column;\n"
          result += "  justify-content: space-between;\n"
          result += `  row-gap: ${grid.spacingY}px;\n`        
        }

      result += '}\n\n'

      if (Util.isWrappedContainer(widget)) {
        Logger.warn('RepeaterCSS.run () > wrapped container not supported', widget)
      }

      result += selector + ' .qux-repeater-child {\n'
      result += this.getChildrenPositon(selector, widget, boundingBox)      
      result += '}\n\n'

      result += selector + ' .qux-repeater-child.selected .qux-element:first-child {\n'
      if(style.selectItemBackground) result +=  `  background: ${style.selectItemBackground};\n`
      result += '}\n\n'      

      result += selector + ' .qux-repeater-child.selected .qux-label{\n'
      if(style.selectedItemColor) result +=  `  color: ${style.selectedItemColor} !important;\n`
      result += '}\n\n'      

      result += selector + ' .qux-repeater-child.qux-repeater-loading {\n'
      let height = this.cssFactory.getFixedHeight(boundingBox)
      result += `  height: ${height};\n`; 
      if (widget.children.length ===1) {
        const firstChild = this.getFirstChild(widget)
        if (firstChild?.style.background) {
          result += `  background: ${firstChild?.style.background};\n`; 
        }
        result += this.cssFactory.getStyleByKey(firstChild.style, firstChild, this.cssFactory.borderProperties)
      }
      result += '}\n\n'

      for (let i=0; i < 20; i++) {
        result += selector + ` .qux-repeater-loading-${i} {\n`
        result += `   animation-delay: ${i * 50}ms;\n` 
        result += '}\n\n'
      }

      return result
    }

    getFirstChild(widget) {
      let firstChild = widget.children[0]
      if (firstChild.isGroup && firstChild.children.length === 1) {
        firstChild = firstChild.children[0]
      }
      return firstChild
    }

    getChildrenAuto(selector, widget, boundingBox) {
      Logger.log(3, 'RepeaterCSS.getChildrenAuto () > ', widget, boundingBox)
      let result = ''
      //let height = this.cssFactory.getFixedHeight(boundingBox)
      result += `  height: auto;\n`;
      result += this.cssFactory.getWrappedWidth(boundingBox);
      return result
    }

    getChildrenPositon (selector, widget, boundingBox) {
      Logger.log(3, 'RepeaterCSS.getChildrenRow () > ', widget)
      let result =''

      result += '  display: inline-block;\n';
      result += this.cssFactory.getWrappedWidth(boundingBox);
      //const height = this.cssFactory.getFixedHeight(boundingBox)
      result += `  height: auto;\n`;

      return result
    }

    calculateGrid(cntrBox, childBox, spacingX, spacingY, isGrid=true) {

      const offsetX = childBox.x
      const offsetY = childBox.y
  
      const width = cntrBox.w - offsetX * 2
      const height = cntrBox.h - offsetY * 2
  
      const childWidth = spacingX < 0 ? childBox.w : childBox.w + spacingX
      const childHeight = spacingY < 0 ? childBox.h : childBox.h + spacingY
  
      const columns = Math.max(isGrid ? Math.floor(width / childWidth) : 1, 1)
      const rows =  Math.floor(height / childHeight)
  
      if (spacingX < 0) {
          const restWidth =  width - (columns * childWidth) 
          spacingX = Math.max(0,( Math.floor(restWidth / Math.max(1, (columns - 1)))))
      } 
  
      if (spacingY < 0) {
          const restHeight =  height - (rows * childHeight) 
          spacingY = Math.max(0,( Math.floor(restHeight / (rows - 1))))
      } 
  
      return {
          columns: columns,
          rows: rows,
          childWidth: childWidth,
          childHeight: childHeight,
          contentWidth: width,
          contentHeight: height,
          paddingLeft: offsetX,
          paddingRight: offsetX,
          paddingTop: offsetY,
          paddingBottom: offsetY,
          spacingX: spacingX,
          spacingY: spacingY
      }
  
  }
}