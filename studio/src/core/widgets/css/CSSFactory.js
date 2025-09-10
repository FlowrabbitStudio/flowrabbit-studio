import * as Color from './ColorUtil'
import Logger from '../../../core/Logger'
import DataGridCSS from './DataGridCSS'

class CSSFactory {

    constructor(config = {}, imagePrefix = '') {
        Logger.log(4, 'CSSFactory.constructor() ', config)
        this.marginWhiteSpaceCorrect = 0
        this.imagePrefix = imagePrefix

        this.mapping = {

            "color": "color",
            "textAlign": "text-align",
            "fontFamily": "font-family",
            "fontSize": "font-size",
            "fontStyle": "font-style",
            "fontWeight": "font-weight",
            "letterSpacing": "letter-spacing",
            "lineHeight": "line-height",
            "lineHeightPX": "line-height",
            "textTransform": "text-transform",

            "border": "border",
            "borderWidth": "border-width",
            "borderStyle": "border-style",
            "borderColor": "border-color",
            "borderRadius": "border-radius",
            "borderLeft": "border-left",
            "borderRight": "border-right",
            "borderTop": "border-top",
            "borderBottom": "border-bottom",

            "borderBottomColor": "border-bottom-color",
            "borderTopColor": "border-top-color",
            "borderLeftColor": "border-left-color",
            "borderRightColor": "border-right-color",

            "borderBottomLeftRadius": "border-bottom-left-radius",
            "borderTopLeftRadius": "border-top-left-radius",
            "borderBottomRightRadius": "border-bottom-right-radius",
            "borderTopRightRadius": "border-top-right-radius",

            "borderBottomWidth": "border-bottom-width",
            "borderTopWidth": "border-top-width",
            "borderLeftWidth": "border-left-width",
            "borderRightWidth": "border-right-width",

            "borderTopStyle": "border-top-style",
            "borderBottomStyle": "border-bottom-style",
            "borderRightStyle": "border-left-style",
            "borderLeftStyle": "border-right-style",

            "paddingBottom": "padding-bottom",
            "paddingLeft": "padding-left",
            "paddingRight": "padding-right",
            "paddingTop": "padding-top",
            "padding": "padding",

            //"marginBottom" : "margin-bottom",
            //"marginLeft" : "margin-left",
            //"marginRight" : "margin-right",
            //"marginTop": "margin-top",

            "textDecoration": "text-decoration",
            "boxShadow": "box-shadow",
            "textShadow": "text-shadow",

            "opacity": "opacity",

            "cursor": "cursor"
        }

        this.paddingProperties = ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "padding"]

        this.borderProperties = [
            'borderWidth', 'border', 'borderRadius', 'boderColor',
            'borderBottomColor', 'borderTopColor', 'borderLeftColor', 'borderRightColor',
            'borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle',
            'borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth',
            'borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius'
        ]

        this.borderColorProperties = ['borderBottomColor', 'borderTopColor', 'borderLeftColor', 'borderRightColor']
        this.borderWidthProperties = ['borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth']
        this.borderStyleProperties = ['borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftStyle']
        this.borderRadiusProperties = ['borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius', 'borderRadius']

        this.textProperties = [
            'color', 'textDecoration', 'textAlign', 'fontFamily',
            'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight', 'lineHeightPX'
        ]

        this.isPixel = {
            "borderBottomLeftRadius": true,
            "borderBottomRightRadius": true,
            "borderTopRightRadius": true,
            "borderTopLeftRadius": true,

            "borderBottomWidth": true,
            "borderLeftWidth": true,
            "borderTopWidth": true,
            "borderRightWidth": true,

            "paddingBottom": true,
            "paddingLeft": true,
            "paddingRight": true,
            "paddingTop": true,

            "fontSize": true,

            "letterSpacing": true,
            "lineHeightPX": true
        }


        this.easingMapping = {
            'easeInQuad': 'ease-in',
            'easeOutQuad': 'ease-out',
            'linear': 'linear',
            'easeInOutQuad': 'ease-in-out',
            'easeElasticIn': 'ease-in',
            'easeElasticOut': 'ease-out',
            'easeBounceIn': 'ease-in',
            'easeBounceOut': 'ease-out',
        }

        this.fontProperties = ['color', 'fontSize', 'fontWeight', 'textAlign', 'fontStyle', 'letterSpacing', 'lineHeight']
    }

    getDataGridCSS() {
        return new DataGridCSS(this)
    }


    getRaw(model, selectedWidgets) {
        var result = "";
        for (var i = 0; i < selectedWidgets.length; i++) {
            var id = selectedWidgets[i];
            var widget = model.widgets[id];
            if (widget) {
                result += this.getCSS(widget, null, false)
            } else {
                this.logger.warn("getRaw", "No widget with id > " + widget);
            }
        }
        return result;
    }




    /*********************************************************************
     * Position
     *********************************************************************/

    getPosition() {
        return ''
    }


    getStyleByKey(style, widget, keys) {
        let result = ''
        keys.forEach(key => {
            if (style[key] !== undefined && style[key] !== null) {
                const value = style[key];
                result += '  ' + this.getKey(key) + ': ' + this.getValue(key, value) + ';\n'
            }
        })
        return result;
    }

    getRawStyle(style, widget) {
        let result = this.getStyleByKey(style, widget, Object.keys(this.mapping))
        result += this.getBackGround(style, widget)
        return result;
    }

    getPlaceHolderColor(color) {
        if (color) {
            let c = Color.fromString(color);
            c.a = 0.5;
            return Color.toString(c);
        }
        return 'rgba(0, 0, 0, 0.5)'
    }

    getBackGround(style, widget) {
        let result = ''

        if (style.background && style.overlay !== true) {
            if (style.background.colors) {
                if (style.background.radial) {
                    let background = style.background
                    let gradient = background.colors.map(color => {
                        return color.c + ' ' + color.p + '%'
                    }).join(', ')
                    result += `  background: radial-gradient(circle, ${gradient});\n`
                } else {
                    let background = style.background
                    let gradient = "(" + background.direction + "deg";
                    for (let i = 0; i < background.colors.length; i++) {
                        let color = background.colors[i];
                        gradient += "," + color.c + " " + color.p + "% ";
                    }
                    gradient += ")";
                    result += `  background: linear-gradient${gradient};\n`
                }

            } else {
                result += `  background-color: ${style.background};\n`
            }
        }
        if (style.backgroundColor) {
            result += `  background-color: ${style.backgroundColor};\n`
        }

        if (style.backgroundImage && style.backgroundImage.url) {


            if (style.backgroundImage.url.indexOf('http') === 0) {
                result += `  background-image: url(${style.backgroundImage.url});\n`
            } else {
                result += `  background-image: url(${this.imagePrefix}/${style.backgroundImage.url});\n`
            }

            if (style.backgroundSize) {
                result += `  background-size: ${style.backgroundSize}%;\n`
            } else {
                result += `  background-size: 100%;\n`
            }

            if (style.backgroundPosition) {
                var pos = style.backgroundPosition;
                let w = Math.round(pos.left * widget.w)
                let h = Math.round(pos.top * widget.h)
                result += `  background-position: ${w}px ${h}px;\n`
            } else {
                result += `  background-position: 0px 0px;\n`
            }
            result += `  background-repeat: no-repeat;\n`
        }
        return result
    }

    getKey(key) {
        return this.mapping[key];
    }

    getValue(key, value) {
        let result = ''
        if (key === 'fontFamily') {
            result += this.escapeFontFamily(value)
        } else if (this.isPixel[key]) {
            result += value + 'px';
        } else if (key === "boxShadow") {
            result = value.h + "px " + value.v + "px " + value.b + "px " + value.s + "px " + value.c;
            if (value.i) {
                result += 'inset'
            }
        } else if (key === 'textShadow') {
            result = value.h + "px " + value.v + "px " + value.b + "px " + value.c;
        } else {
            result += value
        }
        return result;
    }

    getBoxShadow(value) {
        let result = '  box-shadow: ' + value.h + "px " + value.v + "px " + value.b + "px " + value.c;
        if (value.i) {
            result += 'inset'
        }
        return result
    }

    escapeFontFamily(value) {
        return value.split(',').map(f => {
            if (f.indexOf(' ') >= 0) {
                return '"' + f + '"';
            }
            return f
        }).join(', ')
    }

    clone(obj) {
        if (!obj) {
            return null
        }
        let _s = JSON.stringify(obj)
        return JSON.parse(_s)
    }
}

export default new CSSFactory()