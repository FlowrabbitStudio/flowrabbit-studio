import QSS from '../QSS'

export default class FormWizard {

    constructor (lastUUID = 10000) {
        this.lastUUID = lastUUID
        this.z = 0
    }

    create(width, height, elements) {
        console.debug('elements', elements)

        const app = {
            screenSize: {
                w: width,
                h: height
            },
            screens: {},
            widgets: {},
            lines: {},
            groups: {}
        }

        const scrn = {
            name: 'Screen',
            id: 's' + this.getUUID(),
            min : {
                w : width,
                h : height
            },
            x: 0,
            y: 0,
            w: width,
            h: height,
            props: {},
            has:{},
            style: {
                background: "@screen-background"
            },
            children: []
        }
        scrn.props.start = true

        app.screens[scrn.id] = scrn

        let lastY = 24;
        elements.forEach((e) => {
            const label = this.createWidget('Label', e, {x:24, y: lastY})
            app.widgets[label.id] = label
            scrn.children.push(label.id)
            lastY += label.h

            const widget = this.createWidget(e.type, e, {x:24, y: lastY})
            app.widgets[widget.id] = widget
            scrn.children.push(widget.id)
            lastY += widget.h

            lastY += 32

            const group = {
                "id" : 'w' + this.getUUID(),
                "children" : [
                    label.id,
                    widget.id
                ],
                "groups" : [ ],
                "name" : e.name+"_Group"
            }
            app.groups[group.id] = group
        }) 


        if (lastY > (scrn.h - 24)) {
            scrn.h = lastY + 24
        }

        return app
    }

    getUUID (){
		const uuid = this.lastUUID++ + "_" + Math.round(Math.random() * 100000);
		return uuid
	}

    createWidget(widgetType, element, pos) {

        const height = this.getHeight(widgetType, element)
        const has = this.getHas(widgetType)
        const props = this.getProps(widgetType, element)

        let widget = {
            id: 'w' + this.getUUID(),
            name: element.name,
            type: widgetType,
            x: pos.x,
            y: pos.y,
            w: "@form-width",
            h: height,
            z: this.z,
            props: props,
            has:has
        }


       
        this.z++
        widget.style = this.getStyle(widgetType, element)
        widget.active = this.getActiveStyle(widgetType, element)
        widget.hover = this.getHoverStyle(widgetType, element)
        widget.error = this.getErrorStyle(widgetType, element)
        widget.focus = this.getFocusStyle(widgetType, element)

        const qssTheme = QSS.getTheme("default")
       // QSS.replaceVariables(qssTheme, widget)
        QSS.replaceSize(qssTheme, widget)
        QSS.replaceBorderVariables(widget)
 
        return widget
    }

    getHeight(type) {
        if (type === "RadioGroup" || type === 'CheckBoxGroup' || type === 'TextArea')  {
            return "@box-height-l"
        }

        if (type === "Label")  {
            return 24
        }

        return  "@form-height"

    }


    getActiveStyle (type) {
        if (type === 'TextBox' || type === 'TextArea' || type === 'Password' || type === 'SegmentPicker') {
            return {
               "color": "@color-active",
               "background": "@background-active"
            }
        }
        return {}
    }

    getHoverStyle (type) {
        if (type === 'TextBox' || type === 'TextArea' || type === 'Password'  ) {
            return {
                "borderColor": "@form-border-color:hover",
                "background": "@form-background:hover",
                "color": "@form-color:hover"
            }
        }      
        return {}
    }


    getErrorStyle (type) {
        if (type === 'TextBox' || type === 'TextArea' || type === 'Password'  ) {
            return {
                "borderColor": "@form-border-color:error",
                "background": "@form-background:error",
                "color": "@form-color:error",
                "colorButton": "@form-border-color:error"		
            }
        }

        return {}
    }

    getFocusStyle (type) {
        if (type === 'TextBox' || type === 'TextArea' || type === 'Password'  ) {
            return {
                "borderWidth": "@border-width:focus",
                "borderColor": "@form-border-color:focus",
                "background": "@form-background:focus",
                "color": "@form-color:focus"
            }
        }

        return {}
    }

    getStyle (type) {
        const result = {
            fontFamily: "@font-family",
            fontSize: "@font-size-m",
            lineHeight: "@lineHeight",
            textAlign: "left",
            letterSpacing: "@letterSpacing",
            color: "@label-color",
            textShadow: null
        }

        if (type === 'DateDropDown') {
            result.background = "@form-background"
            result.color = "@form-color"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"       
            result.borderRadius = "@border-radius"
            result.paddingBottom = "@form-padding-vertical"
			result.paddingTop = "@form-padding-vertical"
			result.paddingLeft = "@form-padding-horizontal"
			result.paddingRight = "@form-padding-horizontal"
            result.boxShadow = "@box-shadow-m"
            result.headerColor = "@form-color"
            result.headerBackground = "@form-background"
            result.selectedColor = "@form-background"
            result.selectedInRangeBackground = "@background-passive"
            result.selectedInRangeColor = "@color-passive"
            result.tableHeaderColor = "@form-color"
            result.tableHeaderBackground = "transparent"
            result.popupBorderColor = "@form-popup-border-color"
            result.popupBorderWidth = "@form-popup-border-width"
            result.popupColor = "@form-popup-color"
            result.popupBackground = "@form-popup-background"
            result.itemBorderRadius = "@calendar-item-radius"

        }

        if (type === 'DropDown') {
            result.background = "@form-background"
            result.color = "@form-color"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"       
            result.borderRadius = "@border-radius"
            result.paddingBottom = "@form-padding-vertical"
			result.paddingTop = "@form-padding-vertical"
			result.paddingLeft = "@form-padding-horizontal"
			result.paddingRight = "@form-padding-horizontal"
            result.boxShadow = "@box-shadow-m"
  
            result.popupBorderColor = "@form-popup-border-color"
            result.popupBorderWidth = "@form-popup-border-width"
            result.popupColor = "@form-popup-color"
            result.popupBackground = "@form-popup-background"
            result.selectedOptionColor = "@form-popup-color:hover"
            result.selectedOptionBackground = "@form-popup-background:hover"

        }

        if (type === 'CheckBoxGroup' || type === 'RadioGroup') {
            result.background = "@form-background"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.color = "@form-color"
            result.borderRadius = "@border-radius"

            result.boxHeight = "@form-height"
            result.boxMarginRight = "@spacing-s"
            result.colorButton = "@background-active"


            if (type === 'RadioGroup') {
                result.borderRadius = "@border-radius-round"
            }
        }

   
       
        if (type === 'TextBox' || type === 'Password' || type === 'TextArea' || type === 'SegmentPicker') {
            result.background = "@form-background"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.borderRadius = "@border-radius"
            result.color = "@form-color"
            result.paddingBottom = "@form-padding-vertical",
			result.paddingTop = "@form-padding-vertical",
			result.paddingLeft = "@form-padding-horizontal",
			result.paddingRight = "@form-padding-horizontal"
           
            // if (node.TYPE === 'Checkbox') {
            //     result.colorButton = "@form-border-color"
            //     result.verticalAlign = "middle"
            // }
            // if (node.TYPE === 'RadioBox') {
            //     result.colorButton = "@form-border-color"
            //     result.verticalAlign = "middle"
            // }          
        }

        return result      
    }

    getPosition () {
        return {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        }
    }

    getWidgetName (type) {
        return type + this.z
    }

    getProps (type, node) {
        const result = {}
    

        if (type === 'Label') {
            result.label = node.name
        }

        if (type === 'Input') {
            result.placeholder = true
            result.label = node.label            
        }     
        
        if (type === 'RadioGroup' || type === 'CheckBoxGroup' || type === 'DropDown' || type === 'SegmentPicker') {
            result.options = ['Option 1', 'Option 2', 'Option 3']
        }

        if (type !== 'Label') {
                if (node.databinding) {
                    result.databinding = {
                        default: node.databinding
                    }
                }
        }
        return result
    }

    getHas(type) {
        if (type === 'Label') {
            return {
                "label": true,
                "padding": true,
                "advancedText": true,
                "data" : true	
            }
        }

        if (type === 'RadioGroup' || type === 'CheckBoxGroup' || type === 'DateDropDown') {
            return {
                "backgroundColor" : true,
                "onclick" : true,
                "border" : true,
                "label" : true,
                "data" : true	
            }
        }
        
        return {
            "label" : true,
            "backgroundColor" : true,
            "border" : true,
            "editable" : true,
            "onclick" : true,
            "padding" : true
        }
    }

}