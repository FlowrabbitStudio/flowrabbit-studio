
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import touch from 'dojo/touch'
import hash from 'dojo/hash'
import domGeom from 'dojo/domGeom'
import win from 'dojo/win'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'

import ScrollContainer from 'common/ScrollContainer'
import RadioBoxList from 'common/RadioBoxList'
import ScreenSizeSelector from 'page/ScreenSizeSelector'
import SecretsDialog from '../dialogs/SecretWizardDialog';

import Services from 'services/Services'


import ImportDialog from 'canvas/toolbar/dialogs/ImportDialog'
import DesignGPTDialogSmall from 'canvas/toolbar/dialogs/DesignGPTDialogSmall'
import Text2JSDialog from 'canvas/toolbar/dialogs/Text2JSDialog'
import FormWizardDialog from 'canvas/toolbar/dialogs/FormWizardDialog'

import AnimationComposer from 'canvas/toolbar/dialogs/AnimationComposer'
import ExportDialog from 'canvas/toolbar/dialogs/ExportDialog'
import CustomFonts from 'canvas/toolbar/dialogs/CustomFonts'
import ThemeDialog from 'canvas/toolbar/dialogs/ThemeDialog'
import PublishApp from '../dialogs/PublishApp.vue'

import PreviewDebugger from  '../components/PreviewDebugger.vue'
import ModelUtil from '../../../core/ModelUtil'

export default {
	name: '_Dialogs',
	mixins: [DojoWidget],
	data: function () {
		return {

		}
	},
	components: {},
	methods: {

		async showSecretesDialog(e) {
			const d = new Dialog();
			const db = new DomBuilder()
			const onclose = lang.hitch(d, "close");
			const div = db.div("").build();
			const secrets = this.$new(SecretsDialog, {app: this.model, close: onclose, setSecrets: this.onUpdateKeys});
			const content = db.div("").build(div);
			secrets.placeAt(content);

			d.popup(div, e.target);
		},

		async showDeleteDialog() {
			const db = new DomBuilder()
			const div = db.div("MatcPadding MatcDeleteDialog").build();
			db.h3("title is-4", 'Delete Prototype').build(div);
			db.p('', `Do you want to delete the '${this.app.name}' prototype?`).build(div)
			const bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			const cancel = db.a("MatcLinkButtonDialog", this.getNLS("btn.cancel")).build(bar);
			const write = db.a("MatcButtonDialog MatcButtonDialogDanger", this.getNLS("btn.delete")).build(bar);

			const d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(this, "deleteApp", d)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.popup(div, this.$refs.deleteBtn);

		},
		async deleteApp (d) {
			await this.modelService.deleteApp(this.model);
			hash("#/");
			d.close()
		},

		showFontDialog(e) {
			this.logger.log(0, "showFontDialog", "entry > ", this.isPublic);

			const db = new DomBuilder();
			const popup = db.div("MatcFontDialog  MatcPadding").build();
			const customFonts = this.$new(CustomFonts);
			customFonts.placeAt(popup);
			customFonts.setModel(this.model)
			const row = db.div("row MatcMarginTop").build(popup);
			const right = db.div("col-md-12 MatcButtonBar").build(row);
			const save = db.div("MatcButton", "Save").build(right);
			const close = db.div("MatcLinkButton", "Close").build(right);
			const d = new Dialog({autoClose:false});
			d.own(on(close, touch.press, lang.hitch(d, "close")));
			d.own(on(save, touch.press, lang.hitch(this, "saveFonts", d, customFonts)));
			d.popup(popup, e.target);
		},

		saveFonts(dialog, customFonts) {
			this.logger.log(0, "saveFonts", "entry > ");
			this.controller.setFonts(customFonts.getFonts());
			dialog.close()
		},

		showTextToScript (e) {

			const dialog = new Dialog({autoClose:false});
			const db = new DomBuilder();
			const pageCSS = this.currentPage === 'm' ? 'MatchImportOpenAIDialogMobile':  'MatchImportOpenAIDialogDesktop'
			const popup = db.div("MatcDialog MatchImportDialog MatchImportOpenAIDialog MatcPadding " + pageCSS).build();
			dialog.popup(popup, e.target);

			const aiDialog = this.$new(Text2JSDialog)
			aiDialog.placeAt(popup)

			aiDialog.setPublic(this.isPublic)
			aiDialog.setJwtToken(this.jwtToken)
			aiDialog.setHash(this.hash)
			aiDialog.setModel(this.model)
			aiDialog.setSchema(this.schema)
			aiDialog.setController(this.controller)
			aiDialog.setCanvas(this.canvas)
			aiDialog.setZoom(this.canvas.getZoomFactor())
			aiDialog.setPage(this.currentPage)
		
			if (this.dataList) {
				const selectedVars = this.dataList.getSelection()
				aiDialog.setSelectedVars(selectedVars)
			}
			aiDialog.$on('save', (clickEvent, script) => {
				this.logger.log(-1, "showTextToScript", "save > ", script);
				this.onNewScriptObject(clickEvent, script);
				dialog.close()
			})
			aiDialog.$on('cancel', () => {
				this.logger.log(-1, "showTextToScript", "cancel > ");
				dialog.close()
			})
		},

		showDesignGPT(e) {
		
			const dialog = new Dialog({autoClose:false});
			const db = new DomBuilder();
			const pageCSS = this.currentPage === 'm' ? 'MatchImportOpenAIDialogMobile':  'MatchImportOpenAIDialogDesktop'
			const popup = db.div("MatcDialog MatchImportDialog MatchImportOpenAIDialog MatcPadding " + pageCSS).build();
			dialog.popup(popup, e.target);

			const aiDialog = this.$new(DesignGPTDialogSmall)
			aiDialog.placeAt(popup)

			aiDialog.setPublic(this.isPublic)
			aiDialog.setJwtToken(this.jwtToken)
			aiDialog.setHash(this.hash)
			aiDialog.setModel(this.model)
			aiDialog.setSchema(this.schema)
			aiDialog.setController(this.controller)
			aiDialog.setCanvas(this.canvas)
			aiDialog.setZoom(this.canvas.getZoomFactor())
			aiDialog.setPage(this.currentPage)
		
			if (this.dataList) {
				const selectedVars = this.dataList.getSelection()
				aiDialog.setSelectedVars(selectedVars)
			}
			aiDialog.$on('save', data => {
				this.logger.log(-1, "showDesignGPT", "save > ", data);
				this.emit("newImportApp", { "obj": data, "event": this._lastMouseMoveEvent });
				dialog.close()
			})
			aiDialog.$on('cancel', () => {
				this.logger.log(-1, "showDesignGPT", "cancel > ");
				dialog.close()
			})
		},

		showFormWizard(e) {

			const dialog = new Dialog({autoClose:false});
			const db = new DomBuilder();
			const popup = db.div("MatcDialog MatchImportDialog MatchImportOpenAIDialog MatcPadding").build();
			dialog.popup(popup, e.target);

			const aiDialog = this.$new(FormWizardDialog)
			aiDialog.placeAt(popup)

			aiDialog.setPublic(this.isPublic)
			aiDialog.setJwtToken(this.jwtToken)
			aiDialog.setModel(this.model)
			aiDialog.setSchema(this.schema)
			aiDialog.setController(this.controller)
			aiDialog.setCanvas(this.canvas)
			aiDialog.setZoom(this.canvas.getZoomFactor())
			aiDialog.setPage(this.currentPage)

			if (this.dataList) {
				const selectedVars = this.dataList.getSelection()
				aiDialog.setSelectedVars(selectedVars)
			}
			aiDialog.$on('save', data => {
				this.logger.log(-1, "showFormWizard", "save > ", data);
				this.emit("newImportApp", { "obj": data, "event": this._lastMouseMoveEvent });
				dialog.close()
			})
			aiDialog.$on('cancel', () => {
				this.logger.log(-1, "showFormWizard", "cancel > ");
				dialog.close()
			})			
		},

		showImportDialog(e, zipFiles = null) {
			this.logger.log(-1, "showImportDialog", "entry > " + this.isPublic);
			let dialog = new Dialog({autoClose:false});
			var db = new DomBuilder();
			var popup = db.div("MatcDialog MatchImportDialog MatcPadding").build();
			dialog.popup(popup, e.target);

			let importDialog = this.$new(ImportDialog)
			importDialog.placeAt(popup)

			importDialog.setPublic(this.isPublic)
			importDialog.setJwtToken(this.jwtToken)
			importDialog.setModel(this.model)
			importDialog.setController(this.controller)
			importDialog.setCanvas(this.canvas)
			importDialog.setZoom(this.canvas.getZoomFactor())
			if (zipFiles) {
				importDialog.onZipFileDropped(zipFiles)
			}
			importDialog.$on('save', data => {
				this.logger.log(-1, "showImportDialog", "save > ", data);
				dialog.close()
			})
			importDialog.$on('cancel', () => {
				this.logger.log(-1, "showImportDialog", "cancel > ");
				dialog.close()
			})
		},


		// async showSharing(e) {
		// 	this.logger.log(-1, "showSharing", "entry > ", this.isPublic);

		// 	const invitation = await Services.getModelService(this.$route).findInvitation(this.model.id)
		// 	const temp = {};
		// 	for (let key in invitation) {
		// 		temp[invitation[key]] = key;
		// 	}

		// 	const db = new DomBuilder();
		// 	const popup = db.div("MatcInfitationDialog MatcInfitationDialogLarge MatcPadding").build();
		// 	const cntr = db.div("container").build(popup);
		// 	let row = db.div("row").build(cntr);
		// 	let right = db.div("col-md-12").build(row);
		// 	db.h3("", this.getNLS("share.Headline")).build(right);

		// 	const share = this.$new(Share)
		// 	share.placeAt(right)
		// 	share.setInvitation(temp[1])
		// 	share.setPublic(this.isPublic)

		// 	row = db.div("row MatcMarginTop").build(cntr);
		// 	right = db.div("col-md-12 MatcButtonBar").build(row);

		// 	const write = db.div("MatcButton", "Close").build(right);

		// 	const d = new Dialog({autoClose:false});
		// 	d.own(on(write, touch.press, lang.hitch(d, "close")));
		// 	d.popup(popup, e.target);
		// },


		showDownloadDialog(e) {
			const d = new Dialog({autoClose:false});
			const db = new DomBuilder();
			const div = db.div("").build();
			const exportDialog = this.$new(ExportDialog);
			exportDialog.setJwtToken(this.jwtToken);
			exportDialog.placeAt(div);
			setTimeout(() => {
				exportDialog.setModel(this.model);
			}, 500)
			d.own(on(exportDialog, 'cancel', lang.hitch(d, "close")));
			d.popup(div, e.target);
		},

		onChangeTheme  (e) {

			const d = new Dialog({autoClose:false});
			const db = new DomBuilder();
			const div = db.div("MatcDialog MatcThemeDialog ").build();

			const selector = this.$new(ThemeDialog);
			selector.setModel(this.model);
			selector.placeAt(div);
			selector.on("save", value => {
				this._changeTheme(value)
				d.close()
			})
			selector.on("cancel", () => {
				d.close()
			})
		
		

			// d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			// d.own(on(change, touch.release, lang.hitch(this, "_changeTheme", d, selector, div)));
			d.popup(div, e.target);
		},

		_changeTheme (theme) {
			this.logger.log(-1, "_changeTheme", "entry > ", theme);
			this.controller.updateTheme(theme)
		},


		onChangeScreenSize  (e) {
			const d = new Dialog({autoClose:false});
			const db = new DomBuilder();
			let popup = db.div("").build();	

			db.h3("MatcDialogHeader", "Change Screen Size").build(popup);
			const cntr = db.div("MatcDialogBody").build(popup);

			const div = db.div("MatcResizeDialog form-group").build(cntr);
			const selector = this.$new(ScreenSizeSelector);

			selector.setValue(this.model);
			selector.placeAt(div);

			const bar = db.div("MatcMarginTop").build(cntr);
			const left = db.div("MatcButtonBarDialogFull").build(bar);
			const cancel = db.a("MatcLinkButtonDialog", "Close").build(left);
			const change = db.a("MatcButtonDialog", "Change").build(left);


			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.own(on(change, touch.release, lang.hitch(this, "_changeScreenSize", d, selector, cntr)));
			d.popup(popup, e.target);
		},

		_changeScreenSize(d, selector) {
			const newSize = selector.getValue();
			d.close();
			this.controller.setScreenSize(newSize, false);
		},

		showOutOFSyncError(localApp, callback) {
			const db = new DomBuilder();
			const popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();

			db.h3("MatcDialogHeader", "Error Detected").build(popup);
			const cntr = db.div("MatcDialogBody").build(popup);

			db.p("", "We found that there is a newer version stored on your computer. This can happen when there are networking issues.").build(cntr);
			db.p("", "Do you want to use the local version, or the version from the server.").build(cntr);
			const dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
			const bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);
			const fix = db.div("MatcButton", "Keep local version").build(bar);
			const stay = db.a("MatcButton ", "Keep online version").build(bar);
			dialog.own(on(fix, touch.press, () => {
				dialog.close()
				callback(true)
			}));

			dialog.own(on(stay, touch.press, () => {
				dialog.close()
				callback(false)
			}));

			dialog.popup(popup, this.template);
		},


		showShortCuts (e) {

			const d = new Dialog();

			const db = new DomBuilder();

			const div = db.div("MatcDialog MatcShortCutDialog").build();

			const tblCntr = db.div("MatcToolbarHelpKeyCntr container").build(div);

			const row = db.div("row").build(tblCntr);
			const left = db.div("col-md-6").build(row);
			const right = db.div("col-md-6").build(row);


			let tbl = db.table().build(left);

			this._renderShortCut(db, tbl, "SPACE", "Move Tool");
			this._renderShortCut(db, tbl, "ALT", "Measure Tool");
			this._renderShortCut(db, tbl, "ALT MOVE", "Copy");
			this._renderShortCut(db, tbl, "TAB", "Change View Mode");
			this._renderShortCut(db, tbl, "CTRL", " Disable Snapping");
			this._renderShortCut(db, tbl, "CTRL C", "Copy");
			this._renderShortCut(db, tbl, "CTRL V", "Paste");
			this._renderShortCut(db, tbl, "CTRL D", "Duplicate");
			this._renderShortCut(db, tbl, "CTRL G", "Group / Ungroup");
			this._renderShortCut(db, tbl, "CTRL &uarr;", "Bring to Front ");
			this._renderShortCut(db, tbl, "CTRL &darr;", "Send to Back");
			this._renderShortCut(db, tbl, "CTRL [", "Send Backward");
			this._renderShortCut(db, tbl, "CTRL ]", "Bring Forward");
			this._renderShortCut(db, tbl, "SHIFT CLICK", "Multi Selection");


			tbl = db.table().build(right);		

			this._renderShortCut(db, tbl, "+", "Zoom In");
			this._renderShortCut(db, tbl, "-", "Zoom Out");
			this._renderShortCut(db, tbl, "L", "Create Line");
			this._renderShortCut(db, tbl, "R", "Create Rectangle");
			this._renderShortCut(db, tbl, "H", "Create Hotspot");
			this._renderShortCut(db, tbl, "T", "Create Text");
			this._renderShortCut(db, tbl, "S", "Create Screen");
			this._renderShortCut(db, tbl, "W", "Create Widget");
			this._renderShortCut(db, tbl, "V", "Create Vector");
			this._renderShortCut(db, tbl, "D", "Distribute Selection");
			this._renderShortCut(db, tbl, "C", "Clone Selection");
			this._renderShortCut(db, tbl, "I", "Select Background Color");
			this._renderShortCut(db, tbl, "SHIFT I", "Select Text Color");
			this._renderShortCut(db, tbl, "CTRL I", "Select Border Color");	


			const scroller = this.$new(ScrollContainer);
			scroller.placeAt(tblCntr);
			scroller.wrap(row);

			const bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			const cancel = db.a("MatcButton", "Close").build(bar);

			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, e.target);
		},

		_renderShortCut: function (db, tbl, keys, txt) {
			var tr = db.tr().build(tbl);
			var td = db.td().build(tr);
			var parts = keys.split(" ");
			for (var i = 0; i < parts.length; i++) {
				db.span("MatcToolbarHelpKeyBlock", parts[i]).build(td);
			}
			db.td("MatcHint MatcToolbarHelpKeyBlockTxt", txt).build(tr);
		},


		showThemeCreateDialog(e) {

			var db = new DomBuilder();
			var div = db.div("MatcDialogXL MatcPadding").build();
			var txt = db.textarea("form-control MatcContentWidgetEditor").build(div);

			let category = this.model.lastCategory ? this.model.lastCategory : 'XXX'

			if (this._selectedGroup) {

				let boundingBox = this.getBoundingBox(this._selectedGroup.children);
				let group = {
					"id": "XXX",
					"type": "Group",
					"_type": "Group",
					"name": this._selectedGroup.name,
					"category": category,
					"subcategory": "XXX",
					"children": []
				}
				let children = this.sortChildren(this._selectedGroup.children);
				for (let i = 0; i < children.length; i++) {
					var org = children[i];
					let widget = lang.clone(org);
					delete widget.created
					delete widget.modified
					delete widget.z
					delete widget.template
					delete widget.copyOf
					widget._type = "Widget"
					widget.style = this.getStyle(org);
					widget.x = widget.x - boundingBox.x;
					widget.y = widget.y - boundingBox.y;
					widget.id = this._selectedGroup.name + i;
					widget.z = null;
					widget.template = null;
					// delete copyOf;
					group.children.push(widget);
				}
				txt.value = JSON.stringify(group, null, '  ');
			}
			if (this._selectedWidget) {
				let widget = lang.clone(this._selectedWidget)
				widget._type = "Widget"
				widget.category = category
				widget.subcategory = "XXX"
				delete widget.created
				delete widget.modified
				delete widget.x
				delete widget.y
				delete widget.z
				delete widget.template
				delete widget.copyOf
				txt.value = JSON.stringify(widget, null, '  ');
			}

			if (this._selectedScreen) {
				let app = {
					type: 'ScreenAndWidget',
					_type: 'ScreenAndWidget',
					id: this._selectedScreen.name,
					name: this._selectedScreen.name,
					category: category,
					subcategory: 'AAA',
					screens: {},
					widgets: {},
					lines: {},
					groups: {}
				}
				let screen = lang.clone(this._selectedScreen)
				screen._type = "Screen"
				screen.category = category
				screen.subcategory = "XXX"
				screen.id = screen.name
				screen.children = []
				screen.w = '$100%'
				screen.h = '$100%'
				screen.x = 0
				screen.y = 0

				app.screens[screen.id] = (screen)

				let children = this.sortChildren(this._selectedScreen.children);
				for (let i = 0; i < children.length; i++) {
					let org = children[i];
					let widget = lang.clone(org);
					delete widget.created
					delete widget.modified
					delete widget.z
					delete widget.template
					delete widget.copyOf
					widget._type = "Widget"
					widget.style = this.getStyle(org);
					widget.x = widget.x - screen.x;
					widget.y = widget.y - screen.y;
					widget.id = this._selectedScreen.name + i;
					widget.z = null;
					widget.template = null;
					screen.children.push(widget.id);
					app.widgets[widget.id] = (widget)
				}
				delete screen.created
				delete screen.modified
				delete screen.x
				delete screen.y
				delete screen.z
				delete screen.min
				delete screen.template
				delete screen.copyOf
				txt.value = JSON.stringify(app, null, '  ');
			}

			var bar = db.div("MatcButtonBar MatcMarginTop").build(div);
			var cancel = db.a("MatcButton", "Close").build(bar);
			var d = new Dialog();
			d.own(on(cancel, touch.release, lang.hitch(d, "close")));
			d.popup(div, e.target);

			this.logger.log(0, "showThemeCreateDialog", "exit > ");
		},

		/**********************************************************************
		 * Settings
		 **********************************************************************/

		onShowSettings: function () {

			var db = new DomBuilder();
			var popup = db.div("MatcDialog MatcHeaderDialog MatcPadding").build();
			var cntr = db.div("").build(popup);
			var settings = this.canvas.getSettings();

			/**
			 * Themes
			 */
			db.h1("", "Change Theme :").build(cntr);
			var themeList = this.$new(RadioBoxList);
			themeList.setOptions([
				{ value: "MatcLight", label: "Light" },
				{ value: "MatcDark", label: "Dark" }
			]);
			themeList.setValue(settings.canvasTheme);
			themeList.placeAt(cntr);

		
			var bar = db.div("MatcButtonBar MatcMarginTopXL").build(popup);

			var save = db.a("MatcButton ", "Save").build(bar);
			var cancel = db.a(" MatcLinkButton ", "Cancel").build(bar);

			var dialog = new Dialog({autoClose:false});
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			dialog.own(on(save, touch.press, lang.hitch(
				this, "onSaveSettings", dialog, themeList
			)));

			dialog.popup(popup, this.template);

			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");

			this.logger.log(0, "onShowSettings", "exit > ");
		},

		onSaveSettings(dialog, themeList) {
			const settings = {
				canvasTheme: themeList.getValue()
			};

			this.canvas.setSettings(settings);
			dialog.close();
		},


	
		/**********************************************************************
		 * Publish
		 **********************************************************************/

		 async onShowPublish(user, app, invitations, e) {
			this.logger.log(0, "onShowPublish", "entry");

			const db = new DomBuilder();
			const popup = db.div(" MatcPublishDialog").build();

			const publish = this.$new(PublishApp);
			publish.setApp(app)
			publish.setUser(user);
			publish.setInvitations(invitations);
			publish.setWidget();
			publish.placeAt(popup);

			const dialog = new Dialog();
			dialog.own(on(dialog, "close", (e) => this.closeDialog(e)));

			dialog.own(on(publish, "cancel", () => dialog.close()));
			dialog.own(on(publish, "save", () => {
				this.canvas.showSuccess("Publish settings changed")
				dialog.close()
			}));
			dialog.popup(popup, e.target);
			this.canvas.setState("simulate");
		},

		/**********************************************************************
		 * Create Template
		 **********************************************************************/

		showTemplateCreateDialog: function (name) {
			this.logger.log(0, "showTemplateCreateDialog", "entry");

			const db = new DomBuilder();
			const popup = db.div("MatcDialogMShortX").build();
			db.h3("MatcDialogHeader", "Create Component").build(popup);

			const cntr = db.div('MatcDialogBody').build(popup)
			const row = db.div("form-group").build(cntr)
	
			db.label("MatcLeft", "Name").build(row);
			const inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", name, "Name of the template").build(row);


			const bar = db.div("MatcButtonBar MatcMarginTopL").build(cntr);
			const cancel = db.a(" MatcLinkButtonDialog ", "Cancel").build(bar);
			const write = db.div("MatcButtonDialog", "Create").build(bar);
	

			const dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			dialog.own(on(inputName, 'keyup', e => {
				const k = e.keyCode ? e.keyCode : e.which;
				if (k === 13) {
					this._createTemplate(inputName, dialog)
				}
			}))
			dialog.own(on(write, touch.press, lang.hitch(this, "_createTemplate", inputName, dialog)));
			dialog.popup(popup, this.template);


			setTimeout(() => { inputName.focus() }, 400);
			this.canvas.setState("simulate");

		},

		_createTemplate: function (input, dialog) {

			dialog.hide(this.template);
			this.closeDialog();

			if (this._selectedWidget) {
				this.controller.addTemplateWidget(this._selectedWidget, input.value);
			}

			if (this._selectedScreen) {
				this.controller.addeTemplateScreen(this._selectedScreen, input.value);
			}

			if (this._selectedGroup) {
				this.controller.addNestedTemplateGroup(this._selectedGroup, input.value);
			}
		},


		/**********************************************************************
		 * Save As
		 **********************************************************************/

		onSaveAs () {
			this.logger.log(0, "onSaveAs", "entry");


			const db = new DomBuilder();

			const popup = db.div("").build();		

			db.h3("MatcDialogHeader", "Duplicate").build(popup);
			const cntr = db.div("MatcDialogBody").build(popup);

			const container = db.div("MatcResizeDialog").build()
			cntr.appendChild(container)

			const row = db.div("form-group").build(container)
	
			db.label("MatcLeft", "Name").build(row);
			const inputName = db.input("form-control input-lg MatcIgnoreOnKeyPress", "Copy of " + this.model.name, "Name of the template").build(row);
			
			const dialog = new Dialog();
			dialog.own(on(dialog, "close", lang.hitch(this, "closeDialog")));
			const bar = db.div("MatcButtonBarDialogFull MatcButtonBarDialogPadding").build(cntr);
			const cancel = db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = db.div("MatcButtonDialog", "Create a copy").build(bar);
			dialog.own(on(cancel, touch.press, lang.hitch(dialog, "close")));
			dialog.own(on(write, touch.press, lang.hitch(this, "_saveAs", inputName, dialog)));

			setTimeout(() => {
				inputName.select()
				inputName.focus()
			}, 200)
			
			dialog.popup(popup, this.home);
			this.canvas.setState("simulate");
		},

		async _saveAs(inputName, dialog) {
			dialog.close();
			this.closeDialog();
			var app = await this.controller.onSaveAs(this.model, inputName.value);
			if (app) {
				this.redirectAfterExit = false;
				hash("#/apps/" + app.id + ".html");
			}
		},

		closeDialog: function () {
			this.canvas.enableMouseZoom(true);
			this.canvas.setState(0);
		},


		/**********************************************************************
		 * Simulation Stuff
		 **********************************************************************/

		startPreview() {
			this.logger.log(-1, "startSimilator", "entry");
		
			const d = new Dialog();
			d.hasCSSAnimation = false;
			d.hasHandle = true

	
			const pos = this.getPreviewSize()

			const dialog = document.createElement("div");
			css.add(dialog, "MatcPreviewDialog");
			dialog.style.height = pos.h + 'px';
			dialog.style.width = pos.w + 'px';

			const wrapper = document.createElement("div");
			css.add(wrapper, "MatcPreviewDialogCntr");
			dialog.appendChild(wrapper)


			const debugCntr = document.createElement("div");
			css.add(debugCntr, "MatcPreviewDialogDebuggerCntr");

			const previewDebugger = this.$new(PreviewDebugger)
			previewDebugger.setModel(this.model)
			previewDebugger.placeAt(debugCntr)
			previewDebugger.on('open', () => {
				// move the window if needed
				const spaceLeft = Math.round((window.innerWidth - pos.w) / 2)
				if (spaceLeft < 350) {
					d.move(350 - spaceLeft)
				}
			})
			previewDebugger.on('close', () => {
				d.move(0)
			})
			d.addIcon(debugCntr)


			const iframe = document.createElement("iframe")
			iframe.allow = "camera;microphone;geolocation"
			css.add(iframe, "MatcPreviewDialogIframe");
			iframe.src = this.getPreviewURL()
			wrapper.appendChild(iframe)
			const iframeListener = on(window, 'message', event => {
				previewDebugger.setData(event.data)
			})

			const scroller = this.$new(ScrollContainer, { canDestroy: true });
			scroller.placeAt(dialog);
			scroller.wrap(wrapper);

			d.popup(dialog, this.simulatorButton);
			d.on("close", () => {
				css.remove(win.body(), 'MatcCanvasSimulatorVisible')
				scroller.destroy()
				iframeListener.remove()
			});
			d.own(on(dialog, 'click', (e) => {
				if (e.target === dialog) {
					d.close()
				}
			}));
			d.on('resize', size => {
				console.debug('resize', size)
			})
		},

		getPreviewURL () {
			const scrn = this._getSimulatorScreen();
			const isLocal = location.href.indexOf('local') > 0
			const host = isLocal ? 'http://localhost:8081' : Services.getConfig().app_URL
			if (scrn) {
				return `${host}/embedded/${this.hash}.html?start=${scrn.id}`
			}
			console.debug(`${host}/embedded/${this.hash}.html`)
			return `${host}/embedded/${this.hash}.html`
		},

		getPreviewSize () {
			const previewSize = ModelUtil.getScreenSizeByPage(this.model, this.currentPage)
			const bodySize = domGeom.position(win.body());
			const maxHeight = bodySize.h - 100
			let f = 1	
			if (previewSize.w + 100 > bodySize.w) {
				const newW = bodySize.w - 100			
				f = newW / previewSize.w 
			}
			return {
				w: previewSize.w * f,
				h: Math.min(maxHeight, previewSize.h * f)
			}
		},


		// startSimilator() {
		// 	this.logger.log(0, "startSimilator", "entry");

		// 	const screenSize = ModelUtil.getScreenSizeByPage(this.model, this.currentPage)
		// 	const pos = domGeom.position(win.body());
		// 	const maxHeight = pos.h - 100
		// 	/**
		// 	 * Since 2.1.7 we have better scalling.
		// 	 * Keep in sync with the ShareCanvas.startSimulator() method
		// 	 *
		// 	 * FIXME: This could be still a litte bit better. We could max the height and with factors
		// 	 */
		// 	css.add(win.body(), 'MatcCanvasSimulatorVisible')
		// 	if (this.model.type === "desktop") {
		// 		pos.w = pos.w * 0.75;
		// 		pos.h = pos.h * 0.75;
		// 		this._showDesktopSimulator(this.model, pos, maxHeight);
		// 	} else if (this.model.type === "tablet") {
		// 		if (screenSize.w > screenSize.h) {
		// 			pos.w = pos.w * 0.65;
		// 			pos.h = pos.h * 0.65;
		// 			this._showMobileTest(this.model, pos, "MatchSimulatorWrapperTablet", maxHeight);
		// 		} else {
		// 			pos.w = pos.w * 0.35;
		// 			pos.h = pos.h * 0.35;
		// 			this._showMobileTest(this.model, pos, "MatchSimulatorWrapperTablet", maxHeight);
		// 		}
		// 	} else {
		// 		pos.w = pos.w * 0.25;
		// 		pos.h = pos.h * 0.25;
		// 		this._showMobileTest(this.model, pos, "MatchSimulatorWrapperMobile", maxHeight);
		// 	}
		// },


		// _showDesktopSimulator(model, pos, maxHeight) {

		// 	var dialog = document.createElement("div");
		// 	css.add(dialog, "MatchSimulatorDialog");

		// 	var container = document.createElement("div");
		// 	css.add(container, "MatchSimulatorContainer");
		// 	dialog.appendChild(container);

		// 	pos = this.getScaledSize(pos, "width", this.model);
		// 	if (pos.h > maxHeight) {
		// 		let factor = pos.h / maxHeight
		// 		pos.h = pos.h / factor
		// 		pos.w = pos.w / factor
		// 	}
		// 	container.style.width = Math.round(pos.w) + "px";
		// 	container.style.height = Math.round(pos.h) + "px";

		// 	var s = this.$new(Simulator, { mode: "debug", logData: false });
		// 	s.scrollListenTarget = "parent";
		// 	s.isDesktopTest = true
		// 	s.setHash(this.hash)

		// 	var scroller = this.$new(ScrollContainer, { canDestroy: true });
		// 	scroller.placeAt(container);
		// 	s.setScrollContainer(scroller);


		// 	var d = new Dialog();
		// 	d.hasCSSAnimation = false;
		// 	d.popup(dialog, this.simulatorButton);

		// 	d.own(d.on("close", lang.hitch(this, "stopSimulator", s, scroller)));
		// 	d.own(on(dialog, 'click', (e) => {
		// 		if (e.target === dialog) {
		// 			d.close()
		// 		}
		// 	}));

		// 	/**
		// 	 * Isn#t the model passed
		// 	 */
		// 	model = this.model;
		// 	var screen = this._getSimulatorScreen();
		// 	s.setStartScreen(screen);
		// 	setTimeout(function () {
		// 		scroller.wrap(s.domNode);
		// 		s.setModel(model);
		// 	}, 500);

		// 	/**
		// 	 * otherwise the mouse wheel listener will prevent
		// 	 * scrolling in the simulator!
		// 	 */
		// 	this.canvas.enableMouseZoom(false);
		// 	this.canvas.setState("simulate");

		// },



		// _showMobileTest(model, pos, clazz, maxHeight) {
		// 	const dialog = document.createElement("div");
		// 	css.add(dialog, "MatchSimulatorDialog");

		// 	const wrapper = document.createElement("div");
		// 	css.add(wrapper, "MatchSimulatorWrapper ");
		// 	if (clazz) {
		// 		css.add(wrapper, clazz);
		// 	}
		// 	dialog.appendChild(wrapper);

		// 	const container = document.createElement("div");
		// 	css.add(container, "MatchSimulatorContainer");

		// 	pos = this.getScaledSize(pos, "width", this.model);
		// 	if (pos.h > maxHeight) {
		// 		let factor = pos.h / maxHeight
		// 		pos.h = Math.ceil(pos.h / factor)
		// 		pos.w = Math.ceil(pos.w / factor)
		// 	}

		// 	container.style.width = Math.ceil(pos.w) + "px";
		// 	container.style.height = Math.ceil(pos.h) + "px";

		// 	wrapper.style.width = Math.ceil(pos.w) + "px";
		// 	wrapper.style.height = Math.ceil(pos.h) + "px";
		// 	css.add(wrapper, 'MatcSimulatorFadeOut')
		// 	wrapper.appendChild(container);

		// 	const scroller = this.$new(ScrollContainer, { canDestroy: true });
		// 	scroller.placeAt(container);

		// 	const s = this.$new(Simulator, { mode: "debug", logData: false });
		// 	s.scrollListenTarget = "parent";
		// 	s.isDesktopTest = true
		// 	s.setScrollContainer(scroller);
		// 	s.setHash(this.hash)


		// 	// sinde 4.1.03 the qr code can be hidden in the settings.
		// 	const settings = this.getSettings()
		// 	if (settings.hasQRCode !== false) {
		// 		const qrCodeWrapper = document.createElement("div")
		// 		css.add(qrCodeWrapper, "MatcSimulatorQRWrapper");
		// 		dialog.appendChild(qrCodeWrapper);

		// 		const img = document.createElement("img");
		// 		QR.getQRCode(this.hash, false, true).then(url => {
		// 			img.src = url
		// 		})
		// 		css.add(img, "MatcSimulatorQR");
		// 		qrCodeWrapper.appendChild(img);
		// 	}



		// 	/**
		// 	 * FIXME: We have here some flickering. Because of the fixed
		// 	 * positions widgets we cannot use cssAniamtion because the scale(1,1)
		// 	 * set in Dialog.js will mess up the the fixed attribute.
		// 	 *
		// 	 * Solutions:
		// 	 *
		// 	 * 1) Do not add screen pos whne flag is set?
		// 	 */
		// 	const d = new Dialog();
		// 	d.hasCSSAnimation = false;
		// 	d.popup(dialog, this.simulatorButton);

		// 	d.on("close", lang.hitch(this, "stopSimulator", s, scroller));
		// 	d.own(on(dialog, 'click', (e) => {
		// 		if (e.target === dialog) {
		// 			d.close()
		// 		}
		// 	}));

		// 	/**
		// 	 * Isnt the model passed???
		// 	 */
		// 	model = this.model;

		// 	const screen = this._getSimulatorScreen();
		// 	s.setStartScreen(screen);
		// 	setTimeout(() => {
		// 		scroller.wrap(s.domNode);
		// 		s.setModel(model);
		// 		css.remove(wrapper, 'MatcSimulatorFadeOut')
		// 	}, 600);

		// 	/**
		// 	 * otherwise the mouse wheel listener will prevent
		// 	 * scrolling in the simulator!
		// 	 */
		// 	this.canvas.enableMouseZoom(false);
		// 	this.canvas.setState("simulate");

		// },

		_getSimulatorScreen() {
			if (this._selectedScreen) {
				return this._selectedScreen;
			}
			if (this._selectedGroup) {
				const childId = this._selectedGroup.children[0]
				return this.getParentScreen({ id: childId });
			}
			if (this._selectedWidget) {
				return this.getParentScreen(this._selectedWidget);
			}
		},


		_showAnimationComposer: function (screen, type, node) {

			var d = new Dialog();
			var db = new DomBuilder();
			var dialog = db.div("MatchAnimationDialog").build();
			var div = db.div("MatchAnimationDialogCntr").build(dialog);

			var pos = domGeom.position(win.body());
			dialog.style.width = Math.round(pos.w * 0.95) + "px";
			dialog.style.height = Math.round(pos.h * 0.9) + "px";

			var composer = this.$new(AnimationComposer);
			composer.setHash(this.hash)
			composer.setType(type);
			composer.placeAt(div);
			composer.setPage(this.currentPage)
			composer.setModel(this.model);

			var cntr = db.div("container-fluid").build(div);
			var row = db.div("").build(cntr);

			var left = db.div("MatcButtonBarDialogFull MatcButtonBarDialogPadding").build(row);
			//var right = db.div("col-md-9 MatcHint MatcPaddingTop", "* Only copied widgets and groups have the &quot;Transfrom&quot; animation").build(row);

			const cancel = db.a("MatcLinkButtonDialog", "Cancel").build(left);
			const write = db.div("MatcButtonDialog", "Save").build(left);

			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(write, touch.press, lang.hitch(this, "_setScreenAnimation", composer, d, screen, type)));


			setTimeout(function () {
				composer.setScreen(screen);
			}, 500);


			d.popup(dialog, node);
			d.on("close", lang.hitch(this, "stopSimulator", composer, null));

			this.canvas.enableMouseZoom(false);
			this.canvas.setState("simulate");
		},

		_setScreenAnimation: function (composer, dialog, screen, type) {
			var anim = composer.getValue();
			composer.destroy();
			dialog.close();
			this.controller.setScreenAnimation(screen.id, type, anim);

		},


		stopSimulator: function (s, scroller) {
			this.canvas.enableMouseZoom(true);
			this.canvas.setState(0);
			css.remove(win.body(), 'MatcCanvasSimulatorVisible')
			if (s) {
				s.destroy();
			}
			if (scroller) {
				scroller.destroy();
			}
		}
	},
	mounted() {
	}
}
</script>