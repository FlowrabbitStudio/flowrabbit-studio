import * as Util from "../core/ExportUtil"
import Logger from "../core/Logger"
import QSS from "../core/QSS"
import DataBindingUtil from "../core/DataBindingUtil"
import * as ResponsiveLayouter from "./ResponsiveLayouter"

export function transform(app, config) {
	Logger.log(3, "Quant2Flat.transform () > enter", config)

	let model = Util.clone(app)

	let isForcePinnedLeft = config.css && config.css.pinnedLeft === true
	let isForcePinnedRight = config.css && config.css.pinnedRight === true
	let isForceFixedHorizontal = config.css && config.css.fixedHorizontal === true

	/**
	 * Before we start, we create an inherited model!
	 */
	model = Util.createInheritedModel(model)

	/**
	 * Copy templates as _template into widgets so we can use the information later
	 * in the CSSPostion.getCorrectedHeight!
	 */
	model = Util.copyTemplateStyles(model)

	/**
	 * Set forced left and right pinned
	 */
	model = addForcedResize(model, isForcePinnedLeft, isForcePinnedRight, isForceFixedHorizontal)


	/**
	 * Set default data binding
	 */
	if (config.addDefaultDatabinding) {
		model = DataBindingUtil.addDefaultDataBinding(model)
	}

	/**
	 * We have links that have databinding prop. We will
	 * update the databidning for the *from* links
	 */
	model = DataBindingUtil.addDataBindingLinks(model)

	/**
	 * Set certain widgets horizontal fixed
	 */
	model = fixHorizontal(model)

	/**
	 * Make sure names are unique
	 */
	model = fixNames(model)

	/**
	 * Add links
	 */
	model = addActions(model)

	/**
	 * Make sure templates are inlined
	 */
	setTemplateStyles(model)

	/**
	 * 
	 */
	setThemeVars(model)

	/**
	 * Set validation labels
	 */
	setValidationLabels(model)

	/**
	 * Add here virtual elements for the groups
	 */
	for (let screenID in model.screens) {
		const screen = model.screens[screenID]
		const widgets = Util.getOrderedWidgets(getWidgets(screen, model))
		model = addGroupWrapper(screen,widgets, model)
		model = addFlexContainerWrappers(screen, widgets, model)
	}

	return model
}



function addFlexContainerWrappers(screen, widgets, model) {
	Logger.log(1, "Quant2Flat.addFlexContainerWrappers()")

	let order = []
	widgets.forEach((widget) => {
		if (widget.type == 'ColumnContainer') {
			Logger.log(-1, "Quant2Flat.addFlexContainerWrappers() > found " + widget.name)
			let boxes = ResponsiveLayouter.getWrapperBoxes(model, widgets, widget)
			boxes.forEach(box => {
				model.widgets[box.id] = box
				screen.children.push(box.id)
			})
			widget.type = "Box"
			widget.style = {
				wrapOnMobile: true,
				gap: 16
			}
			//screen.children = screen.children.filter(id => id != widget.id)
		}
	})

	/**
	 * Set new z to ensure that the groups are before the
	 */
	order.forEach((widget, i) => {
		widget.z = i
	})
	return model
}

function setThemeVars(model) {
	Logger.log(2, "Quant2Flat.setThemeVars()")
	return QSS.replaceModel(model)
}

function setValidationLabels(model) {
	Logger.log(2, "Quant2Flat.setValidationLabels()")

	Object.values(model.widgets).forEach(w => {
		if (w?.props?.refs?.errorLabels) {
			const refs = w.props.refs.errorLabels	
			refs.forEach(ref => {
				const label = model.widgets[ref]
				if (label) {
					label.props.errorLabelSource = w.id
				} else {
					Logger.warn("Quant2Flat.setValidationLabels() > no ref ", ref)
				}
			})			
		}
	})
	return model
}

/**
 * Set tenplates in widgets
 */
function setTemplateStyles(model) {
	if (model.templates) {
		Object.values(model.templates).forEach((t) => {
			t.cssSelector = `.qux-template-${t.name}`
			t.cssClass = `qux-template-${t.name}`
			/**
			 * TODO: Make faster with lookup map...
			 */
			Object.values(model.widgets).forEach((widget) => {
				if (widget.template === t.id) {
					if (!widget.sharedCssClasses) {
						widget.sharedCssClasses = []
					}
					widget.sharedCssClasses.push(t.cssClass)
					/**
					 * The vertical align is copied directly... This should be some how handled
					 * by the css factory...
					 */
					if (t.style && t.style.verticalAlign && !widget.style.verticalAlign) {
						widget.style.verticalAlign = t.style.verticalAlign
					}
				}
			})
		})
	}
}

function addActions (model) {
		Object.values(model.widgets).forEach(w => {
				let lines = Util.getLines(w, model, true)
				if (lines.length > 0) {
						w.lines = lines
				}
		})
		Object.values(model.screens).forEach(s => {
				let lines = Util.getLines(s, model, true)
				if (lines.length > 0) {
						s.lines = lines
				}
		})
		return model
}

function addForcedResize(model, isForcePinnedLeft, isForcePinnedRight, isForceFixedHorizontal) {
	if (isForcePinnedLeft || isForcePinnedRight || isForceFixedHorizontal) {
		Logger.log(2, "Quant2Flat.addForcedResize()", isForcePinnedLeft, isForcePinnedRight)
		Object.values(model.widgets).forEach((w) => {
			if (!w.props.resize) {
				w.props.resize = {
					right: false,
					up: false,
					left: false,
					down: false,
					fixedHorizontal: false,
					fixedVertical: false,
				}
			}
			if (isForcePinnedLeft) {
				w.props.resize.left = true
			}
			if (isForceFixedHorizontal && !w.props.right) {
				w.props.resize.fixedHorizontal = true
			}
			if (isForcePinnedRight && !w.props.fixedHorizontal) {
				w.props.resize.right = true
			}
		})
	}

	return model
}

function fixHorizontal(model) {
	let fixed = ["Switch", "Stepper"]
	for (let widgetId in model.widgets) {
		let widget = model.widgets[widgetId]
		if (fixed.indexOf(widget.type) >= 0) {
			if (!widget.props.resize) {
				widget.props.resize = {}
			}
			widget.props.resize.fixedHorizontal = true
		}
	}

	return model
}


function fixNames(model) {
	let screens = Object.values(model.screens)
	screens.forEach((screen, j) => {
		screen.name = fixElementName(screen.name)
		let otherScreensWithSameName = screens.filter((o) => o.name === screen.name)
		if (otherScreensWithSameName.length > 1) {
			Logger.log(3, "Quant2Flat.fixNames() > Fix double screen name:" + screen.name)
			screen.name += "_" + j
		}

		let children = screen.children
		if (children) {
			let widgets = children.map((widgetId) => {
				return model.widgets[widgetId]
			})

			widgets.forEach((w, i) => {
				w.name = fixElementName(w.name)
				if (w.name === screen.name) {
					Logger.log(3, "Quant2Flat.fixNames() > Fix widget == screen name: " + w.name + " in screen " + screen.name)
					w.name += "_" + i
				} else {
					let others = widgets.filter((o) => o.name === w.name)
					if (others.length > 1) {
						Logger.log(3, "Quant2Flat.fixNames() > Fix double widget name: " + w.name + " in screen " + screen.name)
						w.name += "_" + i
					}
				}				
			})
		}
	})

	if (model.templates) {
		Object.values(model.templates).forEach((t) => {
			t.name = fixElementName(t.name)
		})
	}
	
	
	return model
}

/**
 * DEPREACTED SHOULD NEVER BE CALLED: We should fix doubles names. With mastre screens
 * we could have overwites! We could rename them, but this
 * would have to be consistant in all screens!
 */
export function validateNoDoubelNames (model) {
	for (let screenID in model.screens) {
		let screen = model.screens[screenID]
		let children = screen.children
		let names = children.map((c) => model.widgets[c].name)
		let count = {}
		names.forEach((n) => {
			if (count[n]) {
				Logger.error(`Quant2Flat.fixNames() > Dubplicate name of element '${n}' in screen '${screen.name}'`)
			}
			count[n] = true
		})
	}
}

function fixElementName (str) {
	/**
	 * This should be lowerCase!!!
	 */
	return str.replace(/[^0-9a-z-]/gi, '')
}

function addGroupWrapper(screen,widgets, model) {
	Logger.log(4, "Quant2Flat.addGroupWrapper() > create ", screen.name)


	let createdGroups = {}
	let order = []
	widgets.forEach((widget) => {
		let group = Util.getGroup(widget.id, model)
		if (group) {
			createGroupCntr(group, model, createdGroups, order, screen)
		}
		order.push(widget)
	})

	/**
	 * Set new z to ensure that the groups are before the
	 */
	order.forEach((widget, i) => {
		widget.z = i
	})
	return model
}

function createGroupCntr(group, model, createdGroups, order, screen) {
	/**
	 * Create new group container only if needed
	 */
	if (!createdGroups[group.id]) {
		Logger.log(2, "Quant2Flat.createGroupCntr() > create ", group.name)

		/**
		 * 1) check if we need to create parent group. If so we go up hierachy
		 */
		let parentGroup = Util.getParentGroup(group.id, model)
		if (parentGroup) {
			createGroupCntr(parentGroup, model, createdGroups, order, screen)
		}

		/**
		 * 2) Now create the group cntr
		 */
		let allGroupChildren = Util.getAllGroupChildren(group, model)

		let boundingBox = Util.getBoundingBoxByIds(allGroupChildren, model)

		let groupCntr = {
			id: `gc${group.id}`,
			name: `${group.name}_${group.id}`,
			groupId: group.id,
			isGroup: true,
			type: "Box",
			x: boundingBox.x,
			y: boundingBox.y,
			w: boundingBox.w,
			h: boundingBox.h,
			style: group.style ? group.style : {},
			props: {
				resize: group.props && group.props.resize ? group.props.resize : {
                    right: false,
                    up: false,
                    left: false,
                    down: false,
                    fixedHorizontal: false,
                    fixedVertical: false,
                }
			},
		}

		/**
		 * For inhereted groups make sure that the inherited flag
		 * is set, other wise the sortWidgets methods will put
		 * it behind it's children and nesting does not work!
		 */
		if (group.inherited) {
			groupCntr.inherited = group.inherited
		}

		/**
		 * Add it to the model and link stuff properly
		 */
		model.widgets[groupCntr.id] = groupCntr
		screen.children.push(groupCntr.id)
		createdGroups[group.id] = groupCntr

		/**
		 * Attention, this is imporant! We add the groupCntr here.
		 * After this method, the widget will be added! By doing this,
		 * we ensure the right order.
		 */
		order.push(groupCntr)
	}
}

function getWidgets(screen, model) {
	let widgets = []
	for (let i = 0; i < screen.children.length; i++) {
		let id = screen.children[i]
		let widget = model.widgets[id]
		widgets.push(widget)
	}
	return widgets
}
