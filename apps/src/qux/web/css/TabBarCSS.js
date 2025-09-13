import Logger from '../../core/Logger'

export default class TabBar {

    constructor(cssFactory) {
        Logger.log(5, 'TabBar.NavBarCSS()')
        this.cssFactory = cssFactory
    }

    run (selector, style, widget) {
        let result = ''
        result += selector + ' {\n'
        result += this.cssFactory.getPosition(widget);
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
        result += this.cssFactory.getBackGround(style, widget)
        if (style.gap > 0) {
            result += `  gap:${style.gap}px;\n`
        }      
        result += '}\n\n'

        result += selector + ' .qux-tabbar-item{\n'
        result += `  gap:${style.itemGap}px;\n`
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += '}\n\n'

        result += selector + ' .qux-tabbar-placeholder{\n'
        result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
        result += '}\n\n'


        result += selector + ' .qux-tabbar-item-icon{\n'
        result += `  font-size:${style.iconSize}px;\n`
        result += '}\n\n'

        if (widget.hover) {
            let hover = widget.hover
            result += selector + ' .qux-tabbar-item:hover {\n'
            if (hover.background) {
                result += `  background:${hover.background};\n`
            }
            result += this.cssFactory.getStyleByKey(hover, widget, this.cssFactory.textProperties)
            result += this.cssFactory.getStyleByKey(hover, widget, this.cssFactory.borderProperties)
            result += '}\n\n'
        }

        if (widget.active) {
            let active = widget.active
            result += selector + ' .qux-tabbar-item.qux-tabbar-item-selected {\n'
            if (active.background) {
                result += `  background:${active.background};\n`
            }
            result += this.cssFactory.getStyleByKey(active, widget, this.cssFactory.textProperties)
            result += this.cssFactory.getStyleByKey(active, widget, this.cssFactory.borderProperties)
            result += '}\n\n'
        }


        return result
    }
}