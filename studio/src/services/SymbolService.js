import AbstractService from './AbstractService'
import Logger from '../common/Logger'
import ModelGeom from '../core/ModelGeom'
import lang from '../dojo/_base/lang'
import CoreUtil from '../core/CoreUtil'

/**
 * Add here imports
 */

class SymbolService extends AbstractService{

    constructor () {
        super()
        this.logger = new Logger('SymbolService')
        this.widgets = {
          // 'HelloWorld': HelloWorld
        }

    }

    getWidgetClass (name) {
      return this.widgets[name]
    }

    getWidgetDataProps (name) {
      if (this.widgetDataProps){
        return this.widgetDataProps[name]
      }
    }

    getIcons () {
      return this._getChached('/icons.json')
    }

    getCore() {
      return new Promise( (resolve) => {
        if (!this.themes) {
          this.logger.log(3, 'getCore', 'exit > Load')
          Promise.all([
            import(/* webpackChunkName: "themes" */ 'themes/screen.json'),

            import(/* webpackChunkName: "themes" */ 'themes/wireframe/box.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/separator.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/button.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/carousel.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/textbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/labeledtextbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/typeahead.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/checkbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/checkboxgroup.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/date.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/dropbox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/icon.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/image.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/label.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/link.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/menu.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/mobile_drop_down.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/radiobox.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/radiogroup.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/ratings.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/slider.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/spinner.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/stepper.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/switch.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/segment_button.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/segment_picker.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/tab.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/table.json'),

            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/volume.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/repeater.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/upload.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/camera.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/uploadpreview.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/weblink.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/progressbar.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/screensegment.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/countingstepper.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/tree.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/iconbutton.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/paging.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/timeline.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/svg.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/lockslider.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/visualpicker.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/icontogglebutton.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/iframe.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/progresssegments.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/imagepaging.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/panel.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/navbar.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/navmenu.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/tabbar.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/chat.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/audioplayer.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/audiorecording.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/downloadbutton.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/columncontainer.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/copyclipboard.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/geolocation.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/labeledimagelist.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/templates/card.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/templates/teamcard.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/templates/issuecard.json'),
            import(/* webpackChunkName: "themes" */ 'themes/wireframe/templates/questionnaire.json'),
            

            //import(/* webpackChunkName: "themes" */ 'themes/wireframe/datagrid.json'),

            //import(/* webpackChunkName: "themes" */ 'themes/logic/prompt.json'),            
            //import(/* webpackChunkName: "themes" */ 'themes/logic/airtable.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/logic/airtable_api.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/logic/chatgpt.json'),
            //import(/* webpackChunkName: "themes" */ 'themes/logic/openai_assistant.json'),
    

            // import(/* webpackChunkName: "themes" */ 'themes/charts/bar.json'),
            // import(/* webpackChunkName: "themes" */ 'themes/charts/legend.json'),
            // import(/* webpackChunkName: "themes" */ 'themes/charts/pie.json'),
            // import(/* webpackChunkName: "themes" */ 'themes/charts/ring.json'),


          ]).then(values => {
            this.themes = []
            values.forEach(v => {
              this.themes = this.themes.concat(v.default)
            })
            //this.hookInWidgets(this.themes)
            this.logger.log(3, 'getCore', 'exit > loaded', this.themes.length)
            resolve(this.themes)
          })
        } else {
          this.logger.log(3, 'getCore', 'exit > Cache')
          resolve(this.themes)
        }
      })
    }

    convertAppToSymbols (app) {
      let elements = Object.values(app.widgets).map(widget => {
    		let element = lang.clone(widget)
				if (element.template && app.templates) {
					let template = app.templates[element.template]
					if (template) {
						var merged = lang.clone(template.style)
						if (element.style) {
							for (var key in element.style) {
								merged[key] = element.style[key]
							}
						}
						element.style = merged
						delete element.template
					}
				}
				element._type = 'Widget'
				element.imported = app.id + '@' + element.id
				let group = this.getElementGroup(element.id, app)
				if (group) {
					element._group = group.id
				}
				return element
			})

			if (app.groups) {
				let groups = Object.values(app.groups).map(group => {
          let bbbox = ModelGeom.getBoundingBox(group.children, app)
          let result = {
            w: bbbox.w,
            h: bbbox.h,
            id: group.id,
            name: group.name,
            children: [],
            type: 'Group',
            _type: 'Group'
          }
          group.children.forEach(childID => {
            let element = elements.find(e => e.id === childID);
            if (element) {
              element = lang.clone(element)
              delete element._type
              delete element._group
              element.x = element.x - bbbox.x
              element.y = element.y - bbbox.y
              result.children.push(element)
            }
          })

          /**
           * Sort the group elements to ensure the correct rendering!
           */
          result.children = CoreUtil.getOrderedWidgets(result.children)

					return result
        })
        elements = elements.concat(groups)
			}

      elements = elements.filter(element => !element._group);
      return elements
    }

    getElementGroup (widgetID, model) {
			if (model.groups) {
				for (let id in model.groups) {
					const group = model.groups[id];
					const i = group.children.indexOf(widgetID);
					if (i > -1) {
						return group;
					}
				}
			}
			return null;
		}

}
export default new SymbolService()