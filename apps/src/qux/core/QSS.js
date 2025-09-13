
class QSS {

    replaceModel (model) {
        const theme = model.theme
        if (theme) {
            for (let screenID in model.screens) {
                const scrn = model.screens[screenID]
                this.replaceVariables(theme, scrn)
            }
            for (let widgetID in model.widgets) {
                const widget = model.widgets[widgetID]
                this.replaceVariables(theme, widget)
            }
        }
        return model
    }

    replaceVariables (theme, widget) {
        if (widget.style) {
            this.replaceSingleStyle(theme, widget.style)
        }
        if (widget.hover) {
            this.replaceSingleStyle(theme, widget.hover)
        }
        if (widget.error) {
            this.replaceSingleStyle(theme, widget.error)
        }
        if (widget.focus) {
            this.replaceSingleStyle(theme, widget.focus)
        }
        if (widget.active) {
            this.replaceSingleStyle(theme, widget.active)
        }
        if (widget.checked) {
            this.replaceSingleStyle(theme, widget.checked)
        }
        return widget
    }

    replaceSingleStyle (t, style) {
        for (let key in style) {
            const value = style[key]
            if (t[value]) {
                style[key] = t[value].value
            }
        }
    }
   
}

export default new QSS()

