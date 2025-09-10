<template>
	<div class="MatcToolbarScreenList">
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import Preview from 'page/Preview'
import Util from 'core/Util'
import ModelUtil from '../../../core/ModelUtil'
import {iconDOM} from 'page/QIconUtil'

export default {
	name: 'ScreenList',
	mixins: [Util, DojoWidget],
	data: function () {
		return {
			previewWidth: 150
		}
	},
	components: {},
	methods: {

		setPage(page) {
			this.logger.log(3, "setPage", "entry", page);
			this.currentPage = page
		},

		postCreate () {
			this.logger = new Logger("ScreenList");
			this.db = new DomBuilder();
		},

		setModel (model) {
			this.model = model;
		},

		setScreen (screen) {
			this.screen = screen;
			this.render(screen);
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		render () { // screen param removed
			this.cleanUp();
			const cntr = this.db.div("").build();
			const parents = this.getParents();
			for (let i = 0; i < parents.length; i++) {
				const screenID = parents[i];
				if (this.model.screens[screenID]) {
					const screen = this.model.screens[screenID];
					const div = this.db.div("MatcToolbarIconButton MatcToolbarItem MatcToobarActionCntr").build(cntr);
					div.appendChild(iconDOM("MasterScreen"))
					this.db.span("MatcToolbarItemLabel", screen.name).build(div);
					const btn = this.db.span("MatcToobarRemoveBtn ")
						.tooltip("Remove Master", "vommondToolTipRightBottom")
						.build(div);
					btn.appendChild(iconDOM("DeleteX"))
					this.tempOwn(on(btn, touch.press, lang.hitch(this, "onRemoveParent", i)));
				} else {
					console.warn("render() > no screen with id" + screenID);
				}
			}
			this.domNode.appendChild(cntr);
			const add = this.db.div("MatcToolbarIconButton MatcPointer  MatcToolbarItem").build();
			add.appendChild(iconDOM("Plus"))
			
			this.db.span("MatcToolbarItemLabel", "Select Master Screen").build(add);
			this.tempOwn(on(add, touch.press, lang.hitch(this, "showDialog")));
			this.domNode.appendChild(add);
		},


		showDialog() {

			const d = new Dialog({ overflow: true });

			const div = this.db.div("MatcToolbarScreenListDialog MatcPadding").build();
			this.db.label("", "Select Master Screen").build(div);
			const cntr = this.db.div("MatcToolbarScreenListDialogCntr").build(div);
			const list = this.db.div().build();


			const screenSize = ModelUtil.getScreenSizeByPage(this.model, this.currentPage)
			const height = Math.min(screenSize.h / (screenSize.w / this.previewWidth), 250) ;

			this.previews = [];
			const parents = this.getParents();
			const screens = this.getScreensInPage()
			for (let i=0; i< screens.length; i++) {
				const screen = screens[i]
				const screenID = screen.id
				/**
				 * Do not show the selected screen or any parents
				 */
				if (this.screen.id != screenID && (parents.indexOf(screenID) < 0)) {
					
					/**
					 * Since 2.2.0 we have ScreenSegment
					 */
					if (!screen.segment) {
						const wrapper = this.db.div("MatcToolbarScreenListPreviewWrapper MatcCreateBtnElement MatcToolbarDropDownButtonItem").build(list);
						const screenCntr = this.db.div("MatcToolbarScreenListPreview").build(wrapper);
						screenCntr.style.width = this.previewWidth + "px";
						screenCntr.style.height = height + "px";
						const preview = this.$new(Preview);
						preview.setJwtToken(this.jwtToken);
						preview.setScreenPos({ w: this.previewWidth, h: height });
						preview.setModel(this.model);
						preview.setScreen(screenID);
						preview.placeAt(screenCntr);
						this.previews.push(preview);
						const lbl = this.db.div("MatcCreateBtnElementLabel", screen.name).build(wrapper);
						lbl.style.width = this.previewWidth + "px";
						d.own(on(wrapper, touch.press, lang.hitch(this, "onScreenSelected", screenID)));
					}
				}
			}

			const scroll = this.$new(ScrollContainer);
			scroll.placeAt(cntr);
			scroll.wrap(list);
			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(div);
			const cancel = this.db.a("MatcButton", "Cancel").build(bar);

			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", lang.hitch(this, "closeDialog")));
			d.popup(div, this.domNode);
			this.dialog = d;
		},

		getScreensInPage() {
			return ModelUtil.getScreensInPage(this.model, this.currentPage)
			// const result = []
			// if (this.model.type === 'responsive') {
			// 	this.logger.log(-1, 'getScreensInPage', 'get responsive', this.currentPage)
			// 	for (let screenID in this.model.screens) {
			// 		const scrn = this.model.screens[screenID]
			// 		if (scrn.p === this.currentPage) {
			// 			result.push(scrn)
			// 		}
			// 	}
			// } else {
		
			// 	for (let screenID in this.model.screens) {
			// 		const scrn = this.model.screens[screenID]
			// 		result.push(scrn)
			// 	}
			// }
			// return result
		},

		onScreenSelected (screenID) {
			this.dialog.close()
			const parents = this.getParents();
			parents.push(screenID);
			this.onChange(parents)
		},

		onRemoveParent (i) {
			const parents = this.getParents();
			parents.splice(i, 1);
			this.onChange(parents)
		},

		getParents  () {
			let parents = [];
			if (this.screen.parents) {
				parents = this.screen.parents;
			}
			return lang.clone(parents);
		},

		closeDialog  () {
			for (let i = 0; i < this.previews.length; i++) {
				this.previews[i].destroy();
			}
			delete this.previews;
		},

		onChange (parents) {
			this.emit("change", parents);
		},

		_getAbstract (string, max) {
			if (string.length > max) {
				string = string.substring(0, max) + "...";
			}
			return string;
		},

		cleanUp  () {
			this.cleanUpTempListener();
			this.domNode.innerHTML = "";
		}
	},
	mounted() {
	}
}
</script>