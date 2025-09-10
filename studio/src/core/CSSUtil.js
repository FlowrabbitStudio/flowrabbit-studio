import Logger from './Logger'

const needsScaling =  new Set([
    'borderBottomWidth', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth',
    'borderBottomLeftRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderTopRightRadius',
    'fontSize', "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "letterSpacing", "lineHeightPX"
])

class CSSUtil {

    constructor(){
        this.styleElements = {}
    }

    scale (style, f) {
        const result = {}

        for (let key in style) {
            const value = style[key]
            if (needsScaling.has(key)) {
                result[key] = Math.max(1,Math.round(value * f))
            } else {
                result[key] = value
            }
        }

        return result
    }

    addWidget(id, css) {
        const head = document.head || document.getElementsByTagName('head')[0];
        if (this.styleElements[id]) {
            const style = this.styleElements[id]
            style.innerText = css
        } else {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.qux = true
            style.setAttribute('qux', id)
            style.innerText = css
            head.appendChild(style);
            this.styleElements[id] = style
        }
    }

    deleteWidget (id) {
       
        if (this.styleElements[id]) {
            Logger.log(-5, 'CSSWriter.deleteWidget() >', id)
            const head = document.head || document.getElementsByTagName('head')[0];
            head.removeChild(this.styleElements[id])
            delete this.styleElements[id]
        }
    }

    cleanUpAll() {
        console.error('CSSUtil.cleanUp')
        this.styleNodes = []
    }


}

export default new CSSUtil()