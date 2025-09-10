<template>
	<div class="MatcDataSection"></div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import CheckBox from 'common/CheckBox'
import InputList from 'common/InputList'
import OptionsList from 'common/OptionsList'
import ScrollContainer from 'common/ScrollContainer'
import _Tooltip from 'common/_Tooltip'
import Util from 'core/Util'
import ToolbarColor from './ToolbarColor'
import InputDropDownButton from './InputDropDownButton'
import ToolbarDropDownButton from './ToolbarDropDownButton'
import ToolbarSlider from './ToolbarSlider'
import ToolbarImage from './ToolbarImage'
import ToolbarImageLabel from './ToolbarImageLabel'
import DataBinding from './DataBindingTree2'
import RestSettings from './RestSettings'
import TemplatedRestSettings from './TemplatedRestSettings'
import OpenAIAssistantSettings from './OpenAIAssistantSettings'
import PromptBuilderSettings from './PromptBuilderSettings'
import SymbolService from 'services/SymbolService'
import Preview from 'page/Preview'
import TableSettings from './TableSettings'
import DropDownTree from './DropDownTree'
import ImageRotate from './ImageRotate'
import ChartAnimationSettings from './ChartAnimationSettings'
import DataBindingButton from './DataBindingButton'
import BoxShadow from './BoxShadow2'
import DomUtil from 'core/DomUtil'
import ScriptEdior from '../dialogs/ScriptEditor.vue'
import Table from './Table.vue'
import APISettings from '../api/APISettings'
import NavidationEditor from './NavidationTable.vue'
import AIRestVue from './AIRest.vue'
import FTPSettings from './FTPSettings.vue'
import DocTextSettings from './DocTextSettings.vue'
import TextDocSettings from './TextDocSettings.vue'
import RadioBoxListVue from '../../../common/RadioBoxList.vue'
import LocalStorageSettings from './LocalStorageSettings.vue'
import ModelUtil from '../../../core/ModelUtil'
import SystemPromptsDialog from 'common/SystemPromptsDialog.vue'
import {iconDOM} from '../../../page/QIconUtil'
import {ChatThemes} from './ChatThemes'

export default {
	name: 'DataSection',
	mixins: [_Tooltip, Util, DojoWidget],
	data: function () {
		return {
			mode: "private",
			icons: [],
			previewWidth: 150,
			secretKeys: [],
			borderStyles: [
				{ value: "Cell", icon: "mdi mdi-border-all", label: "Full Border" },
				{ value: "HLines", icon: "mdi mdi-border-horizontal", label: "Horizontal Border" },
				{ value: "VLines", icon: "mdi mdi-border-vertical", label: "Vertical Border" },
				{ value: "None", icon: "mdi mdi-border-none", label: "No Border" },
				{ value: "Out", icon: "mdi mdi-border-outside", label: "Outside Border" }
			],
			iconsClasses: {
				IconFontSizeIcon: "Ruler",
				FontSizeIcon: "FontSize",
				BorderRadiusIcon: "BorderRadius",
				HeightIcon: "Height",
				SpacingIcon: "Separator",
				BorderWidthIcon: "BorderWidth",
				DimensionsIcon: "Dimensions",
				CheckBoxIcon: "CheckBoxRound",
				CircleSizeIcon: "Circle",
				BorderStyleIcon: "BorderStyle",
				PaddingIcon: "Padding"
			}
		}
	},
	components: {},
	methods: {
		postCreate() {
			this.logger = new Logger("DataSection");
			this.db = new DomBuilder();
		},

		setSectionHeader(header) {
			this.header = header;
		},

		setPage(page) {
			this.currentPage = page
		},

		setOrganization (o) {
			this.selectedOrg = o
		},

		setUser(user) {
			this.user = user;
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		setHash(h) {
			this.hash = h
		},

		setCanvas(canvas) {
			this.canvas = canvas;
		},

		setModel(model) {
			this.model = model;
		},

		setSchema(schema) {
			this.logger.log(1, "setSchema() ", schema)
			this.schema = schema
		},

		setMode(mode) {
			this.mode = mode;
		},

		setIcons(icons) {
			this.icons = icons
		},

		setSecretKeys(keys) {
			this.secretKeys = keys
		},

		setValue(widget, isDataView = false, widgetViewMode) {

			this.isDataView = isDataView
			const type = widget.type;

			if (this.widget && this.widget.id === widget.id) {
				this.logger.log(1, "setValue", "exit because same widget", type);
				if (this["_update" + type]) {
					this["_update" + type](widget);
					this.logger.log(1, "setValue", "exit() >> Update ");
					return;
				}
			}
			this.widget = widget;

			this._cleanUpChildWidgets();
			this.cleanUpTempListener();
			this.domUtil.removeAllChildNodes(this.domNode)
			this.cntr = this.db
				.div("MatcToolbarSectionContent")
				.build(this.domNode);

			let show = "_show" + type
			if (widgetViewMode && widgetViewMode === "hover") show += "_Hover"
			if (widgetViewMode && widgetViewMode === "focus") show += "_Focus"
			if (widgetViewMode && widgetViewMode === "active") show += "_Active"
			if (this[show]) {
				this.beforeShow()
				this[show](widget);
			} else {
				const props = SymbolService.getWidgetDataProps(type)
				if (props) {
					this.showWidgetByProps(widget, props)
				} else {
					this.logger.log(-1, "setValue", "No Render method for type " + type);
				}
			}

		},

		beforeShow() {
			// template method for validate
		},

		_setSectionLabel(lbl) {
			this.header.firstChild.innerHTML = lbl;
		},

		showWidgetByProps(widget, props) {
			this._setSectionLabel(widget.type);

			props.forEach(p => {
				switch (p.type) {
					case 'Number':
						var options = p.options ? p.options : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
						this._renderInputDropDown(p.label, widget, options, p.key, p.isProp);
						break;

					case 'Color':
						var icon = `<span class="mdi ${p.icon}"></span>`
						if (p.isProp) {
							this._renderColor(p.label, icon, widget.props[p.key], p.key, "onProperyChanged", true);
						} else {
							this._renderColor(p.label, icon, widget.style[p.key], p.key, "onStyleChanged", true);
						}

						break;

					case 'Boolean':
						if (p.isProp) {
							this._renderCheck(p.label, widget.props[p.key], p.key, '', 'onProperyChanged');
						} else {
							this._renderCheck(p.label, widget.style[p.key], p.key, '', 'onStyleChanged');
						}
						break;

					case 'Options':
						if (p.isProp) {
							this._renderLabelDropDown(p.label, widget, p.key, p.options, false);
						} else {
							this._renderLabelDropDown(p.label, widget, p.key, p.options, true);
						}
						break;

					default:
						console.error('DataSection.showWidgetByProps() not supported prop', p)
				}
			})
		},

		_showVisualPicker(model) {
			this._setSectionLabel("Visual Picker");

			this._renderCheck("Checked", model.props.checked, "checked");
			this._renderInputDropDown("Icon Size", model, [8, 12, 16, 24, 32, 40, 48, 64, 96, 128], "iconSize", false);

			this._renderButton("Icon", "mdi mdi-cog-outline", "_renderIconDialog");
			this._renderColor('Icon Color', '<span class="mdi mdi-check"></span>', model.style.iconColor, "iconColor", "onStyleChanged", true);

			this._renderButton("Checked Icon", "mdi mdi-cog-outline", (e) => this._renderIconDialog(e, 'popIcon'));
			this._renderColor('Checked Color', '<span class="mdi mdi-check"></span>', model.style.popColor, "popColor", "onStyleChanged", true);
			this._renderColor('Checked Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.popBackground, "popBackground", "onStyleChanged", true);

			const lbl = model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "mdi mdi-cog-outline", "_showFormGroupDialog");
		},


		_showIconToggleButton(model) {
			this._setSectionLabel("Icon Toggle Button");

			this._renderCheck("Checked", model.props.checked, "checked");
			this._renderInputDropDown("Icon Size", model, [8, 12, 16, 24, 32, 40, 48, 64, 96, 128], "iconSize", false);
			this._renderButton("Icon", "mdi mdi-cog-outline", "_renderIconDialog");

			const lbl = model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "mdi mdi-cog-outline", "_showFormGroupDialog");
		},

		_showIFrameWidget(model) {
			this._setSectionLabel("IFrame");
			this._renderInput(model.props, "url", "The URL to link", "https://yourlink.com");
		},

		_showCopyClipboard(model) {
			this._setSectionLabel("Settings");
			this._renderDataBinding(model);			
		},

		_showAudioPlayer(model) {
			this._setSectionLabel("Audio File");
			this._renderButton("Icon", "mdi mdi-cog-outline", "_renderIconDialog");
			this._renderInput(model.props, "srcaudio", "The URL ot he Audio File", "https://example.com/audio.wav");
		},

		_showAudioRecording(model) {
			this._setSectionLabel("Recording Settings");
			this._renderButton("Record Icon", "mdi mdi-cog-outline", "_renderIconDialog");
			this._renderButton("Stop Icon", "mdi mdi-cog-outline", (e) => this._renderIconDialog(e, 'stopIcon'));
			this._renderCheck("Streaming", model.props.stream, "stream");
			this._renderCheck("Animation", model.props.animation, "animation");
			// this._renderInput(model.props, "audio", "The URL ot he Audio File", "https://example.com/audio.wav");	
		},

		_showScreenSegment(widget) {
			this._setSectionLabel("Screen Section");
			// this._renderCheck("Show Scroll",widget.props.scroll, "scroll" );

			if (widget.props.screenID) {
				const screen = this.model.screens[widget.props.screenID]
				if (screen) {
					const div = this.db.div("MatcToolbarGridFull MatcToolbarItem MatcToobarActionCntr").build(this.cntr);
					this.db.span("MatcToolbarSmallIcon mdi mdi-content-duplicate").build(div);
					this.db.span("MatcToolbarItemLabel", screen.name).build(div);
					const btn = this.db.span("MatcToobarRemoveBtn ")
						.tooltip("Remove Segment", "vommondToolTipRightBottom")
						.span("mdi mdi-close-circle-outline")
						.build(div);
					this.tempOwn(on(btn, touch.press, lang.hitch(this, "onSegmentScreenSelected", '')));

					//this._renderCheck("Snapp on scroll",widget.props.snapp, "snapp" );

				}
			} else {
				const add = this.db.div("MatcToolbarGridFull MatcPointer  MatcToolbarItem").build(this.cntr);
				this.db.span("MatcToolbarSmallIcon mdi mdi-plus-circle").build(add);
				this.db.span("MatcToolbarItemLabel", "Select Segment Screen").build(add);
				this.tempOwn(on(add, touch.press, lang.hitch(this, "_renderSegmentScreen")));
			}


			//this._renderButton(lbl, icon, "_renderSegmentScreen");
		},

		_showRepeater(model) {
			this._setSectionLabel("Image List");

			this._renderLabelDropDown("Normal", model, "layout", [
				{ value: "rows", icon: "mdi mdi-view-agenda-outline", label: "Rows" },
				{ value: "grid", icon: "mdi mdi-view-grid-outline", label: "Grid" }
			]);
			this._renderInputDropDown("Visibile Items", model, [
				{ label: 'All', value: 0 },
				{ label: '10', value: 10 },
				{ label: '20', value: 20 },
				{ label: '50', value: 50 }
			], "itemToShow", true);



			let margin = [
				{ label: 'Auto', value: -1 },
				{ label: '0', value: 0 },
				{ label: '8', value: 8 },
				{ label: '16', value: 16 },
				{ label: '24', value: 24 },
				{ label: '30', value: 30 },
				{ label: '40', value: 40 },
				{ label: '50', value: 50 }
			];

			this._renderInputDropDown("Vertical Spacing ", model, margin, "distanceY", true);
			if (model.props.layout === "grid") {
				this._renderInputDropDown("Horizontal Spacing", model, margin, "distanceX", true);
			}
			
			this._renderSubSection("Selected Item Style")
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.selectItemBackground, "selectItemBackground", "onStyleChanged", true);
			this._renderColor('Color', '<span class="mdi mdi-border-color"></span>', model.style.selectedItemColor, "selectedItemColor", "onStyleChanged", true);

			//this._renderCheck("Loading Animation",model.props.loadingAnimation, "loadingAnimation" );
		},

		_showLabeledImageList(model) {
			this._setSectionLabel("LabeledImageList");

			// this._renderLabelDropDown("Normal", model,"layout",[
			// 	{ value: "rows", icon:"mdi mdi-view-agenda-outline", label : "Rows"},
			// 	{ value:"grid", icon:"mdi mdi-view-grid-outline", label : "Grid"}
			// ]);

			this._renderImagesLabelDropDown(model, "images");

			this._renderInputDropDown("Image Width", model, [
				{ label: '64', value: 64 },
				{ label: '96', value: 96 },
				{ label: '128', value: 128 },
				{ label: '256', value: 256 }
			], "imageWidth", true);

			this._renderInputDropDown("Image Height", model, [
				{ label: '64', value: 64 },
				{ label: '96', value: 96 },
				{ label: '128', value: 128 },
				{ label: '256', value: 256 }
			], "imageHeight", true);



			let margin = [
				{ label: '0', value: 0 },
				{ label: '8', value: 8 },
				{ label: '16', value: 16 },
				{ label: '24', value: 24 },
				{ label: '30', value: 32 }
			];

			this._renderInputDropDown("Spacing ", model, margin, "gap", true);

			this._renderColor('Select Color', '<span class="mdi mdi-border-color"></span>', model.style.selectColor, "selectColor", "onStyleChanged", true);
			this._renderLabelDropDown("Normal", model, "selectionMode", [
				{ value: "single", icon: "SingleSelect", label: "Single Selection" },
				{ value: "multi", icon: "MultiSelect", label: "Multi Selection" }
			]);

			//this._renderCheck("Loading Animation",model.props.loadingAnimation, "loadingAnimation" );
		},

		_showVerticalNavigation() {
			this._setSectionLabel("Vertical Naigation");
			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");
		},

		_showTree(model) {
			this._setSectionLabel("Tree");
			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");

			//this._renderBoxColor("Hover", model, "hoverBackground", "hoverColor");
			//this._renderBoxColor("Selected", model, "selectedBackground", "selectedColor");

			//this._renderInputDropDown("Indicator Width",model, [0,1,2,3,4,5, 10], "selectedBorderWidth", false);
			//this._renderColor('Indicator Color','<span class="mdi mdi-format-color-fill"></span>',model.style.selectedBorderColor, "selectedBorderColor", "onStyleChanged",true );

			this._renderLabelDropDown("Icon", model, "icon", [
				{ value: "mdi mdi-chevron-down", icon: "mdi mdi-chevron-down", label: "Chevron" },
				{ value: "mdi mdi-menu-down", icon: "mdi mdi-menu-down", label: "Arrow" },
				{ value: "mdi mdi-menu-down-outline", icon: "mdi mdi-menu-down-outline", label: "Arrow Outline" },
				{ value: "nulll", icon: "mdi mdi-close", label: "No Icon" }
			], true);

			this._renderCheck("Collapsed", model.props.collapsed, "collapsed");
		},

		_showTabBar(model) {
			this._setSectionLabel("TabBar");

			this._renderButton("Navigation", "mdi mdi-arrow-decision-outline", "_renderNavBarDialog");

			this._renderLabelDropDown("Align", model, "align", [
				{ value: "left", icon: "mdi mdi-format-horizontal-align-left", label: "Align Left" },
				{ value: "center", icon: "mdi mdi-format-horizontal-align-center", label: "Align Center" },
				{ value: "right", icon: "mdi mdi-format-horizontal-align-right", label: "Align Right" }
			], true);
		},

		_showNavBar(model) {
			this._setSectionLabel("NavBar");

			this._renderButton("Navigation", "mdi mdi-arrow-decision-outline", "_renderNavBarDialog");

			this._renderInputDropDown("Spacing", model, [
				{ value: -1, label: 'Spread' },
				{ value: 0, label: 'None' },
				{ value: 8, label: '8' },
				{ value: 12, label: '12' },
				{ value: 16, label: '16' },
				{ value: 18, label: '18' },
				{ value: 20, label: '20' },
				{ value: 24, label: '24' },
				{ value: 32, label: '32' },
				{ value: 40, label: '40' }
			], "gap", false);

			if (model.props.type === 'MobileBottom') {
				this._renderInputDropDown("Icon Size", model, [
					{ value: 8, label: '8' },
					{ value: 12, label: '12' },
					{ value: 16, label: '16' },
					{ value: 18, label: '18' },
					{ value: 20, label: '20' },
					{ value: 24, label: '24' },
					{ value: 28, label: '28' },
					{ value: 32, label: '32' },
					{ value: 40, label: '40' }
				], "iconSize", false);
			}

		},

		_showNavMenu(model) {
			this._setSectionLabel("Navigation Menu");

			this._renderButton("Navigation", "mdi mdi-arrow-decision-outline", "_renderNavBarDialog");

			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");
			this._renderColor('Popup Border', '<span class="mdi mdi-border-color"></span>', model.style.popupBorderColor, "popupBorderColor", "onStyleChanged", true);
			this._renderCheck("Merge borders", model.props.hideUpperBorder, "hideUpperBorder");
			this._renderLabelDropDown("Popup Position", model, "popupPosition", [
				{ value: "MatcWidgetTypeDropDownPopUber", icon: "mdi mdi-arrow-up-bold-circle", label: "Popup Over" },
				{ value: null, icon: "mdi mdi-arrow-down-bold-circle", label: "Popup Under" },
			]);
			this._renderShadowPicker("Popup", model, "popupShadow");

		},




		_showTimeline(model) {
			this._setSectionLabel("Timeline");

			this._renderButton("Options", "mdi mdi-cog-outline-outline", "_renderOptionDialog");

			let style = model.style

			this._renderDropDownTree("Line", "mdi mdi-cursor-text", [
				{
					label: "Background",
					type: "color",
					value: style.lineBackground,
					key: 'lineBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Width",
					type: "int",
					value: style.lineWidth,
					key: 'lineWidth',
					icon: 'mdi mdi-pound',
					options: [1, 2, 5, 8, 16, 24, 32, 40, 48, 60],
					isStyle: true
				}
			])

			this._renderDropDownTree("Circles", "mdi mdi-checkbox-blank-circle-outline", [
				{
					label: "Background",
					type: "color",
					value: style.cicleBackground,
					key: 'cicleBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.cicleBorderColor,
					key: 'cicleBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.circleBorderWidth,
					key: 'circleBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20],
					isStyle: true
				},
				{
					label: "Size",
					type: "int",
					value: style.circleSize,
					key: 'circleSize',
					icon: this.iconsClasses['CircleSizeIcon'],
					options: [5, 8, 16, 24, 32, 40, 48, 60],
					isStyle: true
				},
				{
					label: "Spacing",
					type: "int",
					value: style.elementSpacing,
					key: 'elementSpacing',
					icon: this.iconsClasses['SpacingIcon'],
					options: [-1, 8, 16, 24, 32, 40, 48, 60],
					isStyle: true
				}
			])

			this._renderDropDownTree("Active Circles", "mdi mdi-checkbox-blank-circle", [
				{
					label: "Background",
					type: "color",
					value: style.cicleActiveBackground,
					key: 'cicleActiveBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.cicleActiveBorderColor,
					key: 'cicleActiveBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Text Color",
					type: "color",
					value: style.cicleActiveTextColor,
					key: 'cicleActiveTextColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

		},

		_showIconButton(model) {
			this._setSectionLabel("Icon Button");
			this._renderButton("Icon", "mdi mdi-cog-outline", "_renderIconDialog");
			this._renderInputDropDown("Space", model, [4, 8, 12, 16, 24, 320], "iconMargin", false);
			this._renderColor('Color', '<span class="mdi mdi-format-color-fill"></span>', model.style.iconColor, "iconColor", "onStyleChanged", true);
		},

		_showCheckBoxGroup(model) {
			this._setSectionLabel("CheckBox Group");

			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderColor('Hook Color', '<span class="mdi mdi-check"></span>', model.style.colorButton, "colorButton", "onStyleChanged", true);
			if (!model.has?.backgroundColor) {
				this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			}
			this._renderInputDropDown("Height", model, [8, 12, 16, 24, 32, 40, 64, 80, 120], "boxHeight", false);

		},

		_showProgressBar(model) {
			this._setSectionLabel("Progress Bar");

			this._renderColor('Foreground', '<span class="mdi mdi-format-color-fill"></span>', model.style.foreground, "foreground", "onStyleChanged", true);
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			this._renderInputDropDown("Progress", model, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], "value", true);
		},

		_showProgressSegments(model) {
			this._setSectionLabel("Progress Steps");

			this._renderInputDropDown("Border Width", model, [0, 1, 2, 3, 4, 8], "borderTopWidth", false);
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			this._renderColor('Border', '<span class="mdi mdi-format-color-fill"></span>', model.style.borderTopColor, "borderTopColor", "onStyleChanged", true);

			this._renderSubSection()
			this._renderColor('Active Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.activeBackground, "activeBackground", "onStyleChanged", true);
			this._renderColor('Active Border', '<span class="mdi mdi-format-color-fill"></span>', model.style.activeBorderColor, "activeBorderColor", "onStyleChanged", true);

			this._renderSubSection()
			this._renderInputDropDown("Progress", model, [0, 1, 2, 3, 4, 5], "value", true);
			this._renderInputDropDown("# Elements", model, [1, 2, 3, 4, 5, 10], "max", true);
			this._renderInputDropDown("Gap", model, [4, 8, 16, 32], "gap", true);
		},

		_showImagePaging(model) {
			this._setSectionLabel("Paging");

			this._renderInputDropDown("Border Width", model, [0, 1, 2, 3, 4, 8], "borderTopWidth", false);
			this._renderColor('Border', '<span class="mdi mdi-format-color-fill"></span>', model.style.borderTopColor, "borderTopColor", "onStyleChanged", true);
			this._renderColor('Active Border', '<span class="mdi mdi-format-color-fill"></span>', model.style.activeBorderColor, "activeBorderColor", "onStyleChanged", true);

			this._renderSubSection()
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			this._renderColor('Active Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.activeBackground, "activeBackground", "onStyleChanged", true);

			this._renderSubSection()
			this._renderInputDropDown("Selected", model, [1, 2, 3, 4, 5], "value", true);
			this._renderInputDropDown("# Elements", model, [1, 2, 3, 4, 5, 10], "max", true)
		},

		_showRadioGroup(model) {
			this._setSectionLabel("Radio Group");

			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderColor('Checked Button', '<span class="MatcIconCircle"></span>', model.style.colorButton, "colorButton");

			if (!model.has?.backgroundColor) {
				this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			}
			this._renderInputDropDown("Height", model, [8, 12, 16, 24, 32, 40, 64, 80, 120], "boxHeight", false);

		},

		_showColumnContainer(model) {
			this._setSectionLabel("Column Container");

			this._renderInputDropDown("Columns", model, [1, 2, 3, 4, 6], "cols", false);
			this._renderInputDropDown("Space", model, [8, 12, 16, 24, 32, 40, 64], "gap", false);

		},

		_showUpload(model) {
			this._setSectionLabel("Upload Settings");

			const fileTypeOptions = [
				{ value: "all", label: "All Files" },
				{ value: "images", label: "Images" },
				{ value: "pdfs", label: "PDFs" },
				{ value: "documents", label: "Documents" },
				{ value: "videos", label: "Videos" },
				{ value: "audio", label: "Audio" }
			];

			this._renderInputDropDown('File Types Allowed', model, fileTypeOptions, 'fileTypes', true, undefined, true);
			this._renderInputDropDown("Max File Size (MB)", model, [1, 5, 10, 15, 20, 25, 30, 35, 40, 50], "maxFileSize", true);
			this._renderInputDropDown("Max Files Allowed", model, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "maxFilesAllowed", true);
		},

		_showAPI(model) {
			const title = model.props.title ? model.props.title : 'API'
			this._setSectionLabel(title);

			this._renderPrimaryButton("Configuration", "mdi mdi-cog-outline", "_renderAPIDialog");
			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}
		},

		_showRest(model) {
			const title = model.props.title ? model.props.title : 'Rest'
			this._setSectionLabel(title);

			if (this.widget?.props?.template) {
				this._renderPrimaryButton("Configuration", "mdi mdi-cog-outline", "_rendeTemplateRestDialog");
			} else {
				this._renderPrimaryButton("Configuration", "mdi mdi-cog-outline", "_renderRestDialog");
			}


			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}

		},

		_showAIRest(model) {
			this._setSectionLabel("Settings");
			this._renderPrimaryButton("Configuration", "mdi mdi-cog", "_renderAIRestDialog");

			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}
		},

		_showFTP(model) {
			this._setSectionLabel("Settings");
			this._renderPrimaryButton("Configuration", "mdi mdi-cog", "_renderFTPDialog");

			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}
		},

		_showDocToText(model) {
			this._setSectionLabel("Settings");
			this._renderPrimaryButton("Configuration", "mdi mdi-cog", "_renderDocToTextDialog");

			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}
		},

		_showTextToDoc(model) {
			this._setSectionLabel("Settings");
			this._renderPrimaryButton("Configuration", "mdi mdi-cog", "_renderTextToDocDialog");

			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}
		},

		_showDownload(model) {
			this._setSectionLabel("Settings");
			this._renderInput(model.props, "srcfile", "The URL of the File to Download", "https://example.com/file.pdf");
			this._renderCheck("Open File in browser", model.props.opentab, "opentab");
			this._renderDataBinding(model);
		},

		_showPromptBuilder() {
			this._setSectionLabel("Settings");
			this._renderPrimaryButton("Configuration", "mdi mdi-cog-outline", "_renderPromptBuilderDialog");
		},

		_showOpenAIAssistant() {
			this._setSectionLabel("Settings");
			this._renderPrimaryButton("Configuration", "mdi mdi-cog-outline", "_renderOpenAIAssistantDialog");
		},

		_showScript(model) {
			this._setSectionLabel("Script");
			this._renderPrimaryButton("Edit Script", "mdi mdi-code-tags", "_renderScriptDialog");


			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "databinding", icon: "mdi mdi-database-edit-outline", label: "Data Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}

		},

		_showLocalStorage(model) {
			this._setSectionLabel("Settings");
			this._renderPrimaryButton("Configuration", "mdi mdi-cog", "_renderLocalStorageDialog");

			this._renderLabelDropDown("Icon", model, "trigger", [
				{ value: null, icon: "mdi mdi-cursor-default-click-outline", label: "Click Trigger" },
				{ value: "load", icon: "mdi mdi mdi-progress-download", label: "Loaded Trigger" },
				{ value: "repeat", icon: "mdi mdi-clock-fast", label: "Repeat Trigger" }
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds", model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}
		},

		_showLogicOr(model) {
			this._setSectionLabel("Logic");
			this._renderCheck("A / B Test", model.props.isRandom, "isRandom");
		},

		_showBarChart(model) {
			this._setSectionLabel("Chart");

			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");

			if (model?.props?.isLine) {
				this._renderInputDropDown("Width", model, [0, 1, 2, 3, 4, 5, 8, 16, 24, 32], "lineWidth", false);
			}

			if (model.props.data && model.props.data[0]) {
				const row = model.props.data[0];
				for (let i = 0; i < row.length; i++) {


					if (model.has.fill) {

						const key = "background" + i;
						this._renderColor('' + this.getNiceNumber(i + 1) + " Fill-Color", '<span class="mdi mdi-format-color-fill"></span>', model.style[key], key, "onStyleChanged", true, true);


						const key2 = "color" + i;
						this._renderColor('' + this.getNiceNumber(i + 1) + " Line-Color", '<span class="mdi mdi-format-color-fill"></span>', model.style[key2], key2, "onStyleChanged", true, true);

					} else {
						const key = "background" + i;
						this._renderColor('' + this.getNiceNumber(i + 1) + " Color", '<span class="mdi mdi-format-color-fill"></span>', model.style[key], key, "onStyleChanged", true, true);
					}
				}
			}


			this._renderChartAnimation(model)
		},

		getNiceNumber(n) {
			if (n === 1) {
				return '1st'
			}
			if (n === 1) {
				return '2nd'
			}
			if (n === 3) {
				return '3rd'
			}
			return n + 'th'
		},

		_showStackedRingChart(model) {
			this._setSectionLabel("Chart");

			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");
			this._renderInputDropDown("Width", model, [0, 1, 2, 3, 4, 5, 8, 16, 24, 32], "lineWidth", false);

			if (model.props.data && model.props.data[0]) {
				const row = model.props.data[0];
				for (let i = 0; i < row.length; i++) {
					const key = "background" + i;
					this._renderColor('' + this.getNiceNumber(i + 1) + " Color", '<span class="mdi mdi-format-color-fill"></span>', model.style[key], key, "onStyleChanged", true, true);
				}
			}
			this._renderChartAnimation(model)
		},


		_showRingChart(model) {
			this._setSectionLabel("Chart");

			this._renderInputDropDown("Value", model, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], "value", true);
			this._renderInputDropDown("Width", model, [0, 4, 8, 12, 16, 24, 32, 40, 64], "lineWidth", false);
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true, true);
			this._renderColor("Foreground", '<span class="mdi mdi-format-color-fill"></span>', model.style.color, "color", "onStyleChanged", true, true);

			this._renderChartAnimation(model)
		},

		_renderChartAnimation() {
			//this._renderButton("Animation", "mdi mdi-video", "_renderChartAnimationDialog");		
		},


		_showPieChart(model) {
			this._setSectionLabel("Chart");
			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");

			if (model.props.data && model.props.data[0]) {
				const row = model.props.data[0];
				for (let i = 0; i < row.length; i++) {
					const key = "background" + i;
					this._renderColor('' + this.getNiceNumber(i + 1) + " Color", '<span class="mdi mdi-format-color-fill"></span>', model.style[key], key, "onStyleChanged", true, true);
				}
			}
			this._renderChartAnimation(model)
		},


		_showMultiRingChart(model) {
			this._setSectionLabel("Chart");
			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");
			this._renderInputDropDown("Width", model, [0, 4, 8, 12, 16, 24, 32, 40, 64], "lineWidth", false);

			if (model.props.data && model.props.data[0]) {
				const row = model.props.data[0];
				for (let i = 0; i < row.length; i++) {
					const key = "background" + i;
					this._renderColor('' + this.getNiceNumber(i + 1) + " Color", '<span class="mdi mdi-format-color-fill"></span>', model.style[key], key, "onStyleChanged", true, true);
				}
			}
			this._renderChartAnimation(model)
		},


		_showLabel(model) {
			if (!model?.props?.animated) {
				this._setSectionLabel("Label");
			}
		},

		_showToggleButton(model) {
			if (model.props.isLoadingButton) {
				this._setSectionLabel("Loading Button");
				this._renderTextInput(model.props, "loadingMessage", "Set the loading message")
			} else {
				this._setSectionLabel("Toggle Button");
				this._renderCheck("Active", model.props.active, "active");
			}
		},

		_showChat(model) {
			this._setSectionLabel("Chat Settings");
			this._renderButton("Initial Chat", "SettingsCog", "_renderListDialog");
			this._renderButton("Prompts", "SettingsCog", (e) => this._renderOptionDialog(e, 'multi', "prompts", "promptSelected", "promptsValues"));
			this._renderButton("System Prompts", "SettingsCog", (e) => this._renderDropdownGroupDialog(e, "systemprompts"));
			this._renderCheck("Has Transcription", model.props.hasTranscription, "hasTranscription");
			this._renderCheck("Stream", model.props.stream, "stream");


			this._renderSubSection("Chat Styling");
			this._renderImagesDropDown(model, "assistantImage", false);
			this._renderThemeDropDown(model, "theme", 'Palette')
			this._renderDropDownTree("Input Field", "TextArea", [
				{
					label: "Spacing",
					type: "list",
					value: model.style.gap,
					key: 'gap',
					icon: this.iconsClasses['SpacingIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '4px', value: 4 },
						{ label: '8px', value: 8 },
						{ label: '12px', value: 12 },
						{ label: '16px', value: 16 },
						{ label: '24px', value: 24 },
						{ label: '32px', value: 32 },
						{ label: '40px', value: 40 },
						{ label: '64px', value: 64 }],
					isStyle: true
				},
				{
					label: "Input Height",
					type: "list",
					value: model.style.inputHeight,
					key: 'inputHeight',
					icon: this.iconsClasses['HeightIcon'],
					options: [
						{ label: '32px', value: 32 },
						{ label: '40px', value: 40 },
						{ label: '48px', value: 48 },
						{ label: '56px', value: 56 },
						{ label: '64px', value: 64 },
						{ label: '72px', value: 72 },
						{ label: '80px', value: 80 },
						{ label: '88px', value: 88 },
						{ label: '96px', value: 96 },
						{ label: '104px', value: 104 },
						{ label: '112px', value: 112 }],
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: model.style.textareaBackground,
					key: 'textareaBackground',
					icon: 'ColorPicker',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: model.style.textareaColor,
					key: 'textareaColor',
					icon: 'ColorPicker',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "list",
					value: model.style.textareaRadius,
					key: 'textareaRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '2px', value: 2 },
						{ label: '4px', value: 4 },
						{ label: '6px', value: 6 },
						{ label: '8px', value: 8 },
						{ label: '10px', value: 10 },
						{ label: '12px', value: 12 },
						{ label: '14px', value: 14 },
						{ label: '10px', value: 16 },
						{ label: '18px', value: 18 },
						{ label: '20px', value: 20 },
						{ label: '22px', value: 22 },
						{ label: '24px', value: 24 },
						{ label: '26px', value: 26 }],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "list",
					value: model.style.textareaBorderWidth,
					key: 'textareaBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '1px', value: 1 },
						{ label: '2px', value: 2 },
						{ label: '3px', value: 3 },
						{ label: '4px', value: 4 },
						{ label: '8px', value: 8 }
					],
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: model.style.textareaBorderColor,
					key: 'textareaBorderColor',
					icon: 'ColorPicker',
					isStyle: true
				}
			])
			this._renderDropDownTree('Global Message', 'Message', [
				{
					label: "Border Radius",
					type: "list",
					value: model.style.bubbleBorderRadius,
					key: 'bubbleBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '2px', value: 2 },
						{ label: '4px', value: 4 },
						{ label: '6px', value: 6 },
						{ label: '8px', value: 8 },
						{ label: '10px', value: 10 },
						{ label: '12px', value: 12 },
						{ label: '14px', value: 14 }
					],
					isStyle: true
				},
				{
					label: "Message Padding",
					type: "list",
					value: model.style.bubblePadding,
					key: 'bubblePadding',
					icon: this.iconsClasses['PaddingIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '4px', value: 4 },
						{ label: '8px', value: 8 },
						{ label: '10px', value: 10 },
						{ label: '12px', value: 12 },
						{ label: '16px', value: 16 },
						{ label: '24px', value: 24 },
						{ label: '32px', value: 32 },
						{ label: '40px', value: 40 },
						{ label: '64px', value: 64 }
					],
					isStyle: true
				},
				{
					label: "Message Bubble Shape",
					type: "list",
					value: model.style.bubbleShape,
					key: 'bubbleShape',
					icon: 'MessageBubble',
					options: [
						{ label: 'None', value: 'none' },
						{ label: 'Speech', value: 'speech' },
					],
					isStyle: true
				},
			]);

			this._renderDropDownTree('Assistant Message', 'MessageAssistant', [
				{
					label: "Background",
					type: "color",
					value: model.style.assistantBackground,
					key: 'assistantBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Text Color",
					type: "color",
					value: model.style.assistantColor,
					key: 'assistantColor',
					icon: 'mdi mdi-format-color-text',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: model.style.assistantBorderColor,
					key: 'assistantBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "list",
					value: model.style.assistantBorderWidth,
					key: 'assistantBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '1px', value: 1 },
						{ label: '2px', value: 2 },
						{ label: '3px', value: 3 },
						{ label: '4px', value: 4 },
						{ label: '8px', value: 8 }
					],
					isStyle: true
				},
				{
					label: "Icon Size",
					type: "list",
					value: model.style.bubbleIconSize,
					key: 'bubbleIconSize',
					icon: this.iconsClasses['IconFontSizeIcon'],
					options: [
						{ label: 'Auto', value: -1 },
						{ label: '8px', value: 8 },
						{ label: '10px', value: 10 },
						{ label: '12px', value: 12 },
						{ label: '14px', value: 14 },
						{ label: '16px', value: 16 }
					],
					isStyle: true
				},
				{
					label: "Icon Color",
					type: "color",
					value: model.style.bubbleIconColor,
					key: 'bubbleIconColor',
					icon: 'ColorPicker',
					isStyle: true
				}
			]);

			this._renderDropDownTree('User Message', 'MessageUser', [
				{
					label: "Background",
					type: "color",
					value: model.style.userBackground,
					key: 'userBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Text Color",
					type: "color",
					value: model.style.userColor,
					key: 'userColor',
					icon: 'mdi mdi-format-color-text',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "list",
					value: model.style.userBorderWidth,
					key: 'userBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '1px', value: 1 },
						{ label: '2px', value: 2 },
						{ label: '3px', value: 3 },
						{ label: '4px', value: 4 },
						{ label: '8px', value: 8 }
					],
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: model.style.userBorderColor,
					key: 'userBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				}
			]);

			this._renderDropDownTree('Prompts', 'Prompt', [
				{
					label: "Background",
					type: "color",
					value: model.style.promptBackground,
					key: 'promptBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Text Color",
					type: "color",
					value: model.style.promptColor,
					key: 'promptColor',
					icon: 'mdi mdi-format-color-text',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: model.style.promptBorderColor,
					key: 'promptBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "list",
					value: model.style.promptBorderWidth,
					key: 'promptBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '1px', value: 1 },
						{ label: '2px', value: 2 },
						{ label: '3px', value: 3 },
						{ label: '4px', value: 4 },
						{ label: '8px', value: 8 }
					],
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "list",
					value: model.style.promptBorderRadius,
					key: 'promptBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '2px', value: 2 },
						{ label: '4px', value: 4 },
						{ label: '6px', value: 6 },
						{ label: '8px', value: 8 },
						{ label: '10px', value: 10 },
						{ label: '12px', value: 12 },
						{ label: '14px', value: 14 }
					],
					isStyle: true
				},
				{
					label: "Font Size",
					type: "list",
					value: model.style.promptFontSize,
					key: 'promptFontSize',
					icon: this.iconsClasses['FontSizeIcon'],
					options: [
						{ label: 'Auto', value: -1 },
						{ label: '8px', value: 8 },
						{ label: '12px', value: 12 },
						{ label: '16px', value: 16 },
						{ label: '18px', value: 18 },
						{ label: '20px', value: 20 },
						{ label: '24px', value: 24 },
						{ label: '32px', value: 32 },
						{ label: '40px', value: 40 }
					],
					isStyle: true
				}
			]);

			this._renderDropDownTree('System Prompts', 'SystemPrompt', [
				{
					label: "Background",
					type: "color",
					value: model.style.systempromptBackground,
					key: 'systempromptBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Text Color",
					type: "color",
					value: model.style.systempromptColor,
					key: 'systempromptColor',
					icon: 'mdi mdi-format-color-text',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: model.style.systempromptBorderColor,
					key: 'systempromptBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "list",
					value: model.style.systempromptBorderWidth,
					key: 'systempromptBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '1px', value: 1 },
						{ label: '2px', value: 2 },
						{ label: '3px', value: 3 },
						{ label: '4px', value: 4 },
						{ label: '8px', value: 8 }
					],
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "list",
					value: model.style.systempromptBorderRadius,
					key: 'systempromptBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [
						{ label: '0px', value: 0 },
						{ label: '2px', value: 2 },
						{ label: '4px', value: 4 },
						{ label: '6px', value: 6 },
						{ label: '8px', value: 8 },
						{ label: '10px', value: 10 },
						{ label: '12px', value: 12 },
						{ label: '14px', value: 14 }
					],
					isStyle: true
				},
				{
					label: "Font Size",
					type: "list",
					value: model.style.systempromptFontSize,
					key: 'systempromptFontSize',
					icon: this.iconsClasses['FontSizeIcon'],
					options: [
						{ label: 'Auto', value: -1 },
						{ label: '8px', value: 8 },
						{ label: '12px', value: 12 },
						{ label: '16px', value: 16 },
						{ label: '18px', value: 18 },
						{ label: '20px', value: 20 },
						{ label: '24px', value: 24 },
						{ label: '32px', value: 32 },
						{ label: '40px', value: 40 }
					],
					isStyle: true
				}
			]);
		},

		_showChat_Hover(model) {
			this._setSectionLabel('Chat Styling')
			this._renderDropDownTree('Hover Color Icons', 'MessageAssistant', [
				{
					label: "Hover Color Icons",
					type: "color",
					value: model.style.bubbleIconColorHover,
					key: 'bubbleIconColorHover',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				}
			]);
			this._renderDropDownTree('Prompts', 'Prompt', [
				{
					label: "Hover Background",
					type: "color",
					value: model.style.promptBackgroundHover,
					key: 'promptBackgroundHover',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Hover Color",
					type: "color",
					value: model.style.promptColorHover,
					key: 'promptColorHover',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Hover Border Color",
					type: "color",
					value: model.style.promptBorderColorHover,
					key: 'promptBorderColorHover',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				}
			]);
			this._renderDropDownTree('System Prompts', 'SystemPrompt', [
				{
					label: "Hover Background",
					type: "color",
					value: model.style.systempromptBackgroundHover,
					key: 'systempromptBackgroundHover',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Hover Color",
					type: "color",
					value: model.style.systempromptColorHover,
					key: 'systempromptColorHover',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Hover Border Color",
					type: "color",
					value: model.style.systempromptBorderColorHover,
					key: 'systempromptBorderColorHover',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				}
			]);
		},

		_showTextBox(model) {
			this._setSectionLabel("TextBox");
			this._renderCheck("Text is placeholder", model.props.placeholder, "placeholder");
			//this._renderCheck("Animate placeholder",model.props.animate, "animate" );
			this._renderCheck("Focus on load", model.props.focus, "focus");
			this._renderLabelDropDown("Normal", model, "stringCase", [
				{ value: null, icon: "mdi mdi-briefcase-check", label: "Normal" },
				{ value: "UpperCase", icon: "mdi mdi-briefcase-upload", label: "Upper Case" },
				{ value: "LowerCase", icon: "mdi mdi-briefcase-download", label: "Lower Case" }
			]);
		},


		_showLabeledTextBox(model) {
			this._setSectionLabel("Labeled Text Box");
			this._renderCheck("Focus on load", model.props.focus, "focus");
			this._renderColor('Label Color', '<span class="mdi mdi-border-color"></span>', model.style.labelColor, "labelColor", "onStyleChanged", true);
			this._renderInputDropDown("Label Size", model, [
				{ value: -1, label: 'Auto' },
				{ value: 8, label: '8' },
				{ value: 12, label: '12' },
				{ value: 16, label: '16' },
				{ value: 18, label: '18' },
				{ value: 20, label: '20' },
				{ value: 24, label: '24' },
				{ value: 32, label: '32' },
				{ value: 40, label: '40' }
			], "labelFontSize", false);
			this._renderInputDropDown("Input Size", model, [
				{ value: -1, label: 'Auto' },
				{ value: 16, label: '16' },
				{ value: 18, label: '18' },
				{ value: 20, label: '20' },
				{ value: 24, label: '24' },
				{ value: 32, label: '32' },
				{ value: 40, label: '40' },
				{ value: 56, label: '56' },
				{ value: 64, label: '64' },
			], "inputHeight", false);
			this._renderInputDropDown("Horizontal Offset", model, [0, 4, 8, 12, 16, 20], "labelOffset", false);
			
			this._renderSubSection("Placeholder");
			this._renderInput(model.props, "placeholderLabel", "", 'Enter a value');
		},

		_showTypeAheadTextBox(model) {
			this._setSectionLabel("Input Field");
			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderCheck("Text is placeholder", model.props.placeholder, "placeholder");
			this._renderCheck("Open on Focus", model.props.openOnFocus, "openOnFocus");
			this._renderCheck("Show Chevron", model.props.showChevron, "showChevron");

			this._renderSubSection("Popup")
			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");
			this._renderColor('Popup Border', '<span class="mdi mdi-border-color"></span>', model.style.popupBorderColor, "popupBorderColor", "onStyleChanged", true);
			this._renderCheck("Merge borders", model.props.hideUpperBorder, "hideUpperBorder");
			this._renderShadowPicker("Popup", model, "popupShadow");
		},

		_showRating(model) {
			this._setSectionLabel("Rating");
			this._renderColor('Color', '<span class="mdi mdi-star"></span>', model.style.color, "color", "onStyleChanged", true);
			this._renderDropDown(model, "selected", [
				{ value: 0, label: "0 Star" },
				{ value: 1, label: "1 Star" },
				{ value: 2, label: "2 Stars" },
				{ value: 3, label: "3 Stars" },
				{ value: 4, label: "4 Stars" },
				{ value: 5, label: "5 Stars" }
			]);
		},

		_showImageCarousel(model) {
			this._setSectionLabel("Image Carousel");

			this._renderImagesDropDown(model, "images");
			this._renderDropDown(model, "vertical", [
				{ value: false, icon: "mdi mdi-swap-horizontal", label: "Horizontal Scrolling" },
				{ value: true, icon: "mdi mdi-swap-vertical", label: "Vertical Scrolling" }
			]);
			this._renderDropDown(model, "buttonType", [
				{ value: "default", label: "Default" },
				{ value: "rounded", label: "Rounded" },
				{ value: "square", label: "Square" },
				{ value: "outline", label: "Outline" }
			]);
			this._renderBoxColor("Button Styling", model, "buttonBackground", "buttonColor");
			this._renderDropDown(model, "numCovers", [
				{ value: 1, label: "1 Cover" },
				{ value: 2, label: "2 Covers" },
				{ value: 3, label: "3 Covers" },
				{ value: 4, label: "4 Covers" },
				{ value: 5, label: "5 Covers" }
			]);
		},

		_showIconToggle(model) {
			this._setSectionLabel("Icon Toggle");
			this._renderCheck("Active", model.props.active, "active");
			this._renderColor('Active Color', '<span class="' + model.props.activeIcon + '"></span>', model.style.activeColor, "activeColor", "onStyleChanged", true);
			this._renderColor('Passive Color', '<span class="' + model.props.passiveIcon + '"></span>', model.style.passiveColor, "passiveColor", "onStyleChanged", true);
		},

		_showLabeledIconToggle(model) {
			this._setSectionLabel("Icon Toggle");
			this._renderCheck("Active", model.props.active, "active");
			this._renderColor('Active Color', '<span class="' + model.props.activeIcon + '"></span>', model.style.activeColor, "activeColor", "onStyleChanged", true);
			this._renderColor('Passive Color', '<span class="' + model.props.passiveIcon + '"></span>', model.style.passiveColor, "passiveColor", "onStyleChanged", true);
		},

		_showPassword(model) {
			this._setSectionLabel("Password");

			this._renderCheck("Can show clear text", model.props.cleartext, "cleartext");

			if (model.props.cleartext) {
				this._renderCheck("Is visible", model.props.cleartextVisible, "cleartextVisible", "By default the password is visible");
				this._renderColor('Color', '<span class="mdi mdi-format-text"></span>', model.style.cleartextColor, "cleartextColor", "onStyleChanged", true);
				this._renderInput(model.props, "cleartextHideLabel", "The label to hide the characters", 'e.g. Hide');
				this._renderInput(model.props, "cleartextShowLabel", "The label to show the characters", 'e.g. Show');
			}
			this._renderCheck("Focus on load", model.props.focus, "focus");

		},

		_showTextArea(model) {
			this._setSectionLabel("Text Area");
			this._renderCheck("Text is placeholder", model.props.placeholder, "placeholder");
			this._renderCheck("Focus on load", model.props.focus, "focus");
		},

		_showDropDown(model) {
			this._setSectionLabel("DropDown");
			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");

			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");


			this._renderColor('Popup Border', '<span class="mdi mdi-border-color"></span>', model.style.popupBorderColor, "popupBorderColor", "onStyleChanged", true);
			this._renderCheck("Merge borders", model.props.hideUpperBorder, "hideUpperBorder");

			this._renderLabelDropDown("Popup Position", model, "popupPosition", [
				{ value: "MatcWidgetTypeDropDownPopUber", icon: "mdi mdi-arrow-up-bold-circle", label: "Popup Over" },
				{ value: null, icon: "mdi mdi-arrow-down-bold-circle", label: "Popup Under" },
			]);
			this._renderShadowPicker("Popup", model, "popupShadow");

		},

		_showHoverDropDown(model) {
			this._setSectionLabel("Hover DropDown");
			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");
			this._renderCheck("Merge borders", model.props.hideUpperBorder, "hideUpperBorder");

			this._renderLabelDropDown("Popup Position", model, "popupPosition", [
				{ value: "MatcWidgetTypeDropDownPopUber", icon: "mdi mdi-arrow-up-bold-circle", label: "Popup Over" },
				{ value: null, icon: "mdi mdi-arrow-down-bold-circle", label: "Popup Under" },
			]);
			this._renderColor('Popup Border', '<span class="mdi mdi-border-color"></span>', model.style.popupBorderColor, "popupBorderColor", "onStyleChanged", true);
			this._renderShadowPicker("Popup", model, "popupShadow");

		},

		_showMobileDropDown(model) {
			this._setSectionLabel("Modal Select");
			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderColor('Popup Text', '<span class="mdi mdi-format-text"></span>', model.style.popupColor, "popupColor", "onStyleChanged", true);
			this._renderColor('Popup Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.popupBackground, "popupBackground", "onStyleChanged", true);
			this._renderColor('Popup Border', '<span class="mdi mdi-border-color"></span>', model.style.popupBorderColor, "popupBorderColor", "onStyleChanged", true);
		},

		_showWebLink(model) {
			this._setSectionLabel("Link Settings");			
			this._renderCheck("Open in New Tab", model.props.newTab, "newTab");		
		},

		_showSegmentButton(model) {			
			let style = model.style;
			let props = model.props;
			this._setSectionLabel("Segment Button");
			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderDropDownTree("Button Border", 'mdi mdi-border-color', [
				{
					label: "Border Style",
					type: "list",
					value: props.buttonBorderStyle,
					key: 'buttonBorderStyle',
					icon: this.iconsClasses['BorderStyleIcon'],
					options: this.borderStyles,
					isStyle: false
				},
				{
					label: "Border Color",
					type: "color",
					value: style.buttonBorderColor,
					key: 'buttonBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.buttonBorderWidth,
					key: 'buttonBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20],
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.buttonBorderRadius,
					key: 'buttonBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
			])
			this._renderCheck("Multi Selection", props.multi, "multi");			
			this._renderInputDropDown("Gap", model, [4, 8, 12, 16, 20, 24, 28, 32], "buttonsGap", true);
		},

		_showSegmentPicker(model) {
			this._setSectionLabel("Segment Picker");
			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderColor('Select Text', '<span class="mdi mdi-format-text"></span>', model.style.selectedColor, "selectedColor", "onStyleChanged", true);
			this._renderColor('Select Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.selectedBackground, "selectedBackground", "onStyleChanged", true);
		},

		_showLockSlider(model) {
			this._setSectionLabel("Lock Slider");
			this._renderButton("Icon", "mdi mdi-cog-outline", "_renderIconDialog");
			this._renderColor('Icon Color', '<span class="mdi mdi-format-color-fill"></span>', model.style.iconColor, "iconColor", "onStyleChanged", true);
			this._renderColor('Handle Color', '<span class="mdi mdi-format-color-fill"></span>', model.style.handleColor, "handleColor", "onStyleChanged", true);
			this._renderColor('Foreground', '<span class="mdi mdi-format-color-fill"></span>', model.style.foregroundColor, "foregroundColor", "onStyleChanged", true);
		},


		_showPaging(model) {
			this._setSectionLabel("Paging");
			this._renderInputDropDown("Max", model, [1, 5, 15, 20], "max", true);
			this._renderInputDropDown("Value", model, [1, 2, 3, 4, 5, 10, 15, 20], "selected", true);
			// this._renderInputDropDown("Visible Elements",model, [5,10,15,20], "maxVisisble", true);

			this._renderLabelDropDown("Popup Position", model, "justifyContent", [
				{ value: "left", icon: "mdi  mdi-arrow-collapse-left", label: "Left" },
				{ value: "right", icon: "mdi  mdi-arrow-collapse-right", label: "Right" },
				{ value: "center", icon: "mdi mdi-arrow-split-vertical", label: "Center" },
				{ value: null, icon: "mdi mdi-arrow-expand-horizontal", label: "Full Width" },
			]);
		},

		_showHSlider(model) {
			this._setSectionLabel("Slider");

			this._renderInputDropDown("Value", model, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], "value", true);
			this._renderInputDropDown("Min", model, [0, 1, 5, 10, 20, 50, 100, 200], "min", true);
			this._renderInputDropDown("Max", model, [0, 1, 5, 10, 20, 50, 100, 200], "max", true);
			this._renderCheck("Show Label Value", model.props.hasLabel, "hasLabel");
			this._renderCheck("Has Decimals", model.props.hasDecimals, "hasDecimals");

			this._renderSubSection()
			this._renderColor('Handle Color', '<span class="mdi mdi-format-color-fill"></span>', model.style.handleColor, "handleColor", "onStyleChanged", true);
			this._renderColor('Foreground Color', '<span class="mdi mdi-format-color-fill"></span>', model.style.barColor, "barColor", "onStyleChanged", true);


			this._renderInputDropDown("Handle Width", model, [4, 8, 12, 16, 24, 32, 40, 64, 80, 120], "handleWidth");
			this._renderInputDropDown("Handle Radius", model, [4, 8, 12, 16, 24, 32, 40, 64, 80, 120], "handleRadius");
			this._renderShadowPicker("Handle", model, "handleShadow");

			//this._renderReferenceButton(model,"valueLabel", "No Label", "mdi mdi-label");
		},


		_showStepper(model) {
			this._setSectionLabel("Stepper");
			this._renderInputDropDown("Start Value", model, [0, 1, 5, 10, 20, 30, 40, 50, 100], "value", true);
			var refs = this.getRef(model, "valueLabel");
			if (refs && refs.length > 0) {
				this._renderReferenceButton(model, "valueLabel", "No Label", "mdi mdi-label");
			}
		},

		_showCountingStepper(model) {
			this._setSectionLabel("Counting Stepper");
			this._renderInputDropDown("Start Value", model, [0, 1, 5, 10, 20, 30, 40, 50, 100], "value", true);

			this._renderColor('Button Color', '<span class="mdi mdi-format-text"></span>', model.style.colorButton, "colorButton", "onStyleChanged", true);
			this._renderColor('Button Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.backgroundButton, "backgroundButton", "onStyleChanged", true);

		},

		_showSpinner(model) {
			this._setSectionLabel("Spinner");
			this._renderButton("Options", "mdi mdi-cog-outline", "_renderOptionDialog");
			this._renderColor('Border', '<span class="mdi mdi-border-color"></span>', model.style.borderBoxColor, "borderBoxColor", "onStyleChanged", true);

		},

		_showDateDropDown(model) {
			const style = model.style;
			let selectedOptions = [
				{
					label: "Text",
					type: "color",
					value: style.selectedColor,
					key: 'selectedColor',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.selectedBackground,
					key: 'selectedBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.selectedBorderColor,
					key: 'selectedBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.selectedBorderRadius,
					key: 'selectedBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.selectedBorderWidth,
					key: 'selectedBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			]
			if (model.props.range) {
				this._setSectionLabel("Date Range");
				selectedOptions = [ 
					{
						label: "Range Background",
						type: "color",
						value: style.selectedInRangeBackground,
						key: 'selectedInRangeBackground',
						icon: 'mdi mdi-format-color-fill',
						isStyle: true
					},
					{
						label: "Range Color",
						type: "color",
						value: style.selectedInRangeColor,
						key: 'selectedInRangeColor',
						icon: 'mdi mdi-format-color-fill',
						isStyle: true
					},...selectedOptions
				]
			} else {
				this._setSectionLabel("Calendar");
			}
			this._renderDropDownTree("Calendar Header", "mdi mdi-format-header-1", [
				{
					label: "Font Color",
					type: "color",
					value: style.headerColor,
					key: 'headerColor',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Font Weight",
					type: "list",
					key: "headerFontWeight",
					value: style.headerFontWeight,
					icon: 'mdi mdi-format-text',
					options: [
						{ label: 'Light', value: 200 },
						{ label: 'Normal', value: 400 },
						{ label: 'Medium', value: 600 },
						{ label: 'Strong', value: 700 }],
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.headerBackground,
					key: 'headerBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.headerBorderColor,
					key: 'headerBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.headerBorderRadius,
					key: 'headerBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.headerBorderWidth,
					key: 'headerBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			])
			this._renderDropDownTree("Table Header", "mdi mdi-table", [
				{
					label: "Text",
					type: "color",
					value: style.tableHeaderColor,
					key: 'tableHeaderColor',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.tableHeaderBackground,
					key: 'tableHeaderBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.tableHeaderBorderColor,
					key: 'tableHeaderBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.tableHeaderBorderRadius,
					key: 'tableHeaderBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.tableHeaderBorderWidth,
					key: 'tableHeaderBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			])
			
			this._renderDropDownTree("Selected Date", "mdi mdi-calendar", selectedOptions)

		},

		_showDate(model) {
			const style = model.style;
			let selectedOptions = [
				{
					label: "Text",
					type: "color",
					value: style.selectedColor,
					key: 'selectedColor',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.selectedBackground,
					key: 'selectedBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.selectedBorderColor,
					key: 'selectedBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.selectedBorderRadius,
					key: 'selectedBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.selectedBorderWidth,
					key: 'selectedBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			]
			if (model.props.range) {
				this._setSectionLabel("Date Range");
				selectedOptions = [ 
					{
						label: "Range Background",
						type: "color",
						value: style.selectedInRangeBackground,
						key: 'selectedInRangeBackground',
						icon: 'mdi mdi-format-color-fill',
						isStyle: true
					},
					{
						label: "Range Color",
						type: "color",
						value: style.selectedInRangeColor,
						key: 'selectedInRangeColor',
						icon: 'mdi mdi-format-color-fill',
						isStyle: true
					},...selectedOptions
				]
			} else {
				this._setSectionLabel("Calendar");
			}
			this._renderDropDownTree("Calendar Header", "mdi mdi-format-header-1", [
				{
					label: "Font Color",
					type: "color",
					value: style.headerColor,
					key: 'headerColor',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Font Weight",
					type: "list",
					key: "headerFontWeight",
					value: style.headerFontWeight,
					icon: 'mdi mdi-format-text',
					options: [
						{ label: 'Light', value: 200 },
						{ label: 'Normal', value: 400 },
						{ label: 'Medium', value: 600 },
						{ label: 'Strong', value: 700 }],
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.headerBackground,
					key: 'headerBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.headerBorderColor,
					key: 'headerBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.headerBorderRadius,
					key: 'headerBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.headerBorderWidth,
					key: 'headerBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			])
			this._renderDropDownTree("Table Header", "mdi mdi-table", [
				{
					label: "Text",
					type: "color",
					value: style.tableHeaderColor,
					key: 'tableHeaderColor',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.tableHeaderBackground,
					key: 'tableHeaderBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.tableHeaderBorderColor,
					key: 'tableHeaderBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.tableHeaderBorderRadius,
					key: 'tableHeaderBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.tableHeaderBorderWidth,
					key: 'tableHeaderBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			])
			
			this._renderDropDownTree("Selected Date", "mdi mdi-calendar", selectedOptions)
		},

		_showDragNDrop(model) {
			this._setSectionLabel("Drag N Drop");
			this._renderCheck("Vertical Move", model.props.dndY, "dndY");
			this._renderCheck("Horizontal Move", model.props.dndX, "dndX");
		},

		_showCheckBox(model) {
			this._setSectionLabel("CheckBox");
			this._renderCheck("Checked", model.props.checked, "checked");
			console.debug('model.style.colorButton', model.style)
			this._renderColor('Hook Color', '<span class="mdi mdi-check"></span>', model.style.colorButton, "colorButton", "onStyleChanged", true);
			//this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );
		},

		_showLabeledCheckBox(model) {
			this._setSectionLabel("CheckBox");
			this._renderCheck("Checked", model.props.checked, "checked");
			this._renderColor('Hook Color', '<span class="mdi mdi-check"></span>', model.style.colorButton, "colorButton", "onStyleChanged", true);
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			this._renderInputDropDown("Gap", model, [4, 8, 12, 16, 20, 24, 28, 32], "gap", true);
			this._renderInputDropDown("Height", model, [8, 12, 16, 24, 32, 40, 64, 80, 120], "boxHeight", false);
		},


		_showRadioBox(model) {
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked", model.props.checked, "checked");
			this._renderColor('Checked Button', '<span class="MatcIconCircle"></span>', model.style.colorButton, "colorButton");
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);

		},

		_showLabeledRadioBox(model) {
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked", model.props.checked, "checked");
			this._renderColor('Hook Color', '<span class="mdi mdi-check"></span>', model.style.colorButton, "colorButton", "onStyleChanged", true);
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			this._renderInputDropDown("Gap", model, [4, 8, 16, 32], "gap", true);

			const lbl = model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "mdi mdi-cog-outline", "_showFormGroupDialog");
		},

		_showRadioBox2(model) {
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked", model.props.checked, "checked");
			this._renderColor('Checked Button', '<span class="MatcIconCircle"></span>', model.style.colorButton, "colorButton");
			this._renderColor('Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);

			const lbl = model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "mdi mdi-cog-outline", "_showFormGroupDialog");
		},

		_showIcon(model) {
			this._setSectionLabel("Icon");
			this._renderButton("Icon", "mdi mdi-cog-outline", "_renderIconDialog");
			this._renderColor('Color', '<span class="mdi mdi-format-color-fill"></span>', model.style.color, "color", "onStyleChanged", true);

			var row = this.db.div("MatcToobarRow").build(this.cntr);
			let rotate = this.$new(ImageRotate)
			rotate.placeAt(row)
			this.tempOwn(on(rotate, "change", lang.hitch(this, 'onStyleChanged', 'backgroundImageRotation')));
			this.tempOwn(on(rotate, "changing", lang.hitch(this, "onTempStyleChanged", 'backgroundImageRotation')));
			rotate.setValue(model.style.backgroundImageRotation)
			this._addChildWidget(rotate);
		},

		_showCamera(model) {
			this._setSectionLabel("Camera");
			this._renderButton("Icon", "mdi mdi-cog-outline", "_renderIconDialog");
			this._renderColor('Color', '<span class="mdi mdi-format-color-fill"></span>', model.style.color, "color", "onStyleChanged", true);
		},

		_showGeoLocation(model) {
			this._setSectionLabel("Geo Location");
			this._renderCheck("Auto load", model.props.autoLoad, "autoLoad");
		},

		_showSwitch(model) {
			this._setSectionLabel("Switch");
			this._renderCheck("Active", model.props.checked, "checked");
			this._renderColor('Button Background', '<span class="MatcIconCircle"></span>', model.style.colorButton, "colorButton");
			this._renderColor('Active Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.background, "background", "onStyleChanged", true);
			this._renderColor('Passive Background', '<span class="mdi mdi-format-color-fill"></span>', model.style.colorForeGround, "colorForeGround", "onStyleChanged", true);
			this._renderShadowPicker("Handle", model, "handleShadow");
		},

		_showDataGrid(model) {
			this._showTable(model)
		},

		_showTable(model) {
			this._setSectionLabel("Table");

			this._renderButton("Config Table", "mdi mdi-cog-outline", "_renderTableSettings");

			this._renderInputDropDown("Visibile Rows", model, [
				{ label: 'All', value: 0 },
				{ label: '10', value: 10 },
				{ label: '20', value: 20 },
				{ label: '50', value: 50 }
			], "rowsToShow", true);


			this._renderSubSection()

			//this._renderButton("Dummy Data", "mdi mdi-table-large", "_renderStyledTableDialog");


			let style = model.style
			let props = model.props

			this._renderDropDownTree("Odd Rows", "mdi mdi-format-color-fill", [
				{
					label: "Background",
					type: "color",
					value: style.background,
					key: 'background',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.color,
					key: 'color',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

			this._renderDropDownTree("Even Rows", "mdi mdi-format-color-fill", [
				{
					label: "Background",
					type: "color",
					value: style.evenRowBackground,
					key: 'evenRowBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.evenRowColor,
					key: 'evenRowColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

			this._renderDropDownTree("Hover", "mdi mdi-format-color-fill", [
				{
					label: "Background",
					type: "color",
					value: style.hoverBackground,
					key: 'hoverBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.hoverColor,
					key: 'hoverColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

			this._renderDropDownTree("Header", "mdi mdi-format-text", [
				{
					label: "Sticky",
					type: "check",
					key: "headerSticky",
					value: style.headerSticky === true,
					valueTrue: true,
					valueFalse: false,
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.headerBackground,
					key: 'headerBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.headerColor,
					key: 'headerColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				},
				{
					label: "Bold",
					type: "check",
					key: "headerFontWeight",
					value: style.headerFontWeight === 700,
					valueTrue: 700,
					valueFalse: 400,
					isStyle: true
				},
				{
					label: "Italic",
					type: "check",
					key: "headerFontStyle",
					value: style.headerFontStyle === 'italic',
					valueTrue: 'italic',
					valueFalse: 'normal',
					isStyle: true
				},
				{
					label: "Underline",
					type: "check",
					key: "headerTextDecoration",
					value: style.headerTextDecoration === 'underline',
					valueTrue: 'underline',
					valueFalse: 'none',
					isStyle: true
				},
				{
					label: "Bottom Border Width",
					type: "int",
					value: style.headerBottomBorderWidth,
					key: 'headerBottomBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20],
					isStyle: true
				},
			])

			let selectedBorderStyle = this.borderStyles.find(s => s.value === props.borderStyle)
			let borderStyleIcon = selectedBorderStyle ? selectedBorderStyle.icon : 'mdi mdi-border-color'
			this._renderDropDownTree("Border", borderStyleIcon, [
				{
					label: "Border Style",
					type: "list",
					value: props.borderStyle,
					key: 'borderStyle',
					icon: this.iconsClasses['BorderStyleIcon'],
					options: this.borderStyles,
					isStyle: false
				},
				{
					label: "Border Color",
					type: "color",
					value: style.borderBottomColor,
					key: 'borderBottomColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.borderBottomWidth,
					key: 'borderBottomWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20],
					isStyle: true
				},
			])

			this._renderDropDownTree("Selectable", "mdi mdi-checkbox-multiple-marked-outline", [
				{
					label: "Show Checkbox",
					type: "check",
					value: style.checkBox,
					key: 'checkBox',
					icon: '',
					valueTrue: true,
					valueFalse: false,
					isStyle: true
				},
				{
					label: "Hook Color",
					type: "color",
					value: style.checkBoxHookColor,
					key: 'checkBoxHookColor',
					icon: this.iconsClasses['CheckBoxIcon'],
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.checkBoxBackground,
					key: 'checkBoxBackground',
					icon: 'mdi mdi-format-color-fill',
					isStyle: true
				},
				{
					label: "Size",
					type: "int",
					value: style.checkBoxSize,
					key: 'checkBoxSize',
					icon: this.iconsClasses['DimensionsIcon'],
					options: [style.fontSize, 10, 12, 16, 20, 24, 32],
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.checkBoxBorderColor,
					key: 'checkBoxBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.checkBoxBorderRadius,
					key: 'checkBoxBorderRadius',
					icon: this.iconsClasses['BorderRadiusIcon'],
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.checkBoxBorderWidth,
					key: 'checkBoxBorderWidth',
					icon: this.iconsClasses['BorderWidthIcon'],
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			])


		},


		_renderIgnoreState(widget) {
			const row = this.db.div("MatcToobarRow").build(this.cntr);
			const chkBox = this.$new(CheckBox);
			css.add(chkBox.domNode, "MatcToolbarItem");
			chkBox.placeAt(row);
			chkBox.setLabel("Forget State")
			chkBox.setValue(widget.props.ignoreStateOnPageLoad);
			this.tempOwn(on(chkBox, "change", lang.hitch(this, "setIgnoreState")));
			this._addChildWidget(chkBox);
			this.addTooltip(row, "Do not load previous state when showing the widget again.");
		},

		/**********************************************************************
		 * Script
		 **********************************************************************/

		_renderScriptDialog(e) {

			const dialogCSS = (this.model.type === 'desktop' || this.model.type === 'tablet') ? 'MatcScriptEditorDialogXL' : ''
			const popup = this.db.div("MatcScriptEditorDialog MatcPadding " + dialogCSS).build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(ScriptEdior, { schema: this.schema });
			settings.setPage(this.currentPage)
			const bar = this.db.div("MatcButtonBarDialogFull MatcButtonBarDialogPadding").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);

			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setScript", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			d.onOpen(() => {
				settings.placeAt(cntr);
				settings.setHash(this.hash);
				settings.setWidget(this.widget);
				settings.setModel(this.model);
			})
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}

		},

		setScript(d, settings) {
			const value = settings.getValue()
			this.onProperyChanged('script', value)
			d.close()
		},

		/**********************************************************************
		 * REST
		 **********************************************************************/


		_renderChartAnimationDialog(e) {
			this.stopEvent(e);
			let db = new DomBuilder();
			let popup = db.div(" MatcPadding").build();
			let cntr = db.div("").build(popup);

			let settings = this.$new(ChartAnimationSettings);
			settings.setWidget(this.widget);
			settings.placeAt(cntr);

			let bar = db.div("MatcButtonBarDialog MatcButtonBarDialogPadding").build(popup);
			let cancel = db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			let write = db.div("MatcButtonDialog", "Save").build(bar);

			let d = new Dialog({ overflow: true });
			d.autoClose = false

			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(write, touch.press, lang.hitch(this, "setChartAnimation", d, settings, this.widget)));
			d.own(on(d, "close", () => {
				settings.destroy();
			}));
			d.popup(popup, e.target);

		},

		setChartAnimation(d, settings) {
			const newAnimation = settings.getValue()
			this.onProperyChanged('animation', newAnimation),
				d.close()
		},

		_renderPromptBuilderDialog(e) {
			const popup = this.db.div("").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(PromptBuilderSettings, { schema: this.schema });

			settings.setModel(this.model);
			settings.setSecretKeys(this.secretKeys)
			settings.setHash(this.hash);
			// ,ust come last because we load assistsnat with hash and appID
			settings.setWidget(this.widget);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialogFull MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setPromptRest", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		setPromptRest(d, settings) {
			// some timeout because, otherwise change events
			// in the input fields are not fired
			setTimeout(() => {
				const value = settings.getValue()
				value.prompt = value.prompt.replaceAll("\"", '\'')
				this.onProperyChanged('rest', value)
				d.close()
			}, 50)
		},

		_renderFTPDialog(e) {
			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(FTPSettings, { schema: this.schema });

			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setDocToText", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		_renderTextToDocDialog(e) {
			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(TextDocSettings, { schema: this.schema });

			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setTextToDoc", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		_renderLocalStorageDialog(e) {
			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(LocalStorageSettings, { schema: this.schema });

			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setTextToDoc", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},


		setTextToDoc(d, settings) {
			setTimeout(() => {
				const value = settings.getValue()
				this.onProperyChanged('rest', value)
				d.close()
			}, 50)
		},


		_renderDocToTextDialog(e) {
			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(DocTextSettings, { schema: this.schema });

			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setDocToText", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		setDocToText(d, settings) {
			setTimeout(() => {
				const value = settings.getValue()
				this.onProperyChanged('rest', value)
				d.close()
			}, 50)
		},

		_renderOpenAIAssistantDialog(e) {
			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(OpenAIAssistantSettings, { schema: this.schema });

			settings.setModel(this.model);
			settings.setSecretKeys(this.secretKeys)
			settings.setHash(this.hash);
			// ,ust come last because we load assistsnat with hash and appID
			settings.setWidget(this.widget);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(write, touch.press, lang.hitch(this, "setRest", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},


		_rendeTemplateRestDialog(e) {

			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);

			const settings = this.$new(TemplatedRestSettings, { title: "Open AI - GPT", schema: this.schema });
			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.setSecretKeys(this.secretKeys)
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setRestTemplate", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		_renderAIRestDialog(e) {

			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);

			const settings = this.$new(AIRestVue, {
				title: this.widget?.props?.title, 
				schema: this.schema, 
				user: this.user,
				org: this.selectedOrg
			});
			settings.resetAllVariables()
			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.setSecretKeys(this.secretKeys)
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setAIRestTemplate", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				popup.remove();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		_renderAPIDialog(e) {
			const popup = this.db.div("").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(APISettings, { schema: this.schema });
			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.setSecretKeys(this.secretKeys)
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			// const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			// const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			// const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			settings.on('save', lang.hitch(this, "setAPI", d, settings));
			settings.on('cancel', lang.hitch(this, "closeDialog", d, settings));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		setAPI(d, settings) {
			// some timeout because, otherwise change events
			// in the input fields are not fired
			setTimeout(() => {
				const value = settings.getValue()
				const databinding = settings.getDataBinding()
				this.emit("propertyMultiChange", {
					api: value,
					databinding: databinding
				})
				d.close()
			}, 50)
		},

		_renderRestDialog(e) {
			const popup = this.db.div("MatcDialogWithTest").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(RestSettings, { schema: this.schema });
			settings.setModel(this.model);
			settings.setWidget(this.widget);

			settings.setSecretKeys(this.secretKeys)
			settings.setHash(this.hash);
			settings.placeAt(cntr);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPaddingAll").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setRest", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		setRest(d, settings) {
			// some timeout because, otherwise change events
			// in the input fields are not fired
			setTimeout(() => {
				const value = settings.getValue()
				this.onProperyChanged('rest', value)
				d.close()
			}, 50)
		},

		setRestTemplate(d, settings) {
			// some timeout because, otherwise change events
			// in the input fields are not fired
			setTimeout(() => {
				const value = settings.getValue()
				const template = settings.getTemplate()
				this.emit("propertyMultiChange", {
					rest: value,
					template: template
				})
				// this.onProperyChanged('rest', value)
				// this.onProperyChanged('template', template)
				d.close()
			}, 50)
		},

		setAIRestTemplate(d, settings) {
			// some timeout because, otherwise change events
			// in the input fields are not fired
			setTimeout(() => {
				const value = settings.getValue()
				const aiModel = settings.getAIModelId()
				this.emit("propertyMultiChange", {
					rest: value,
					aiModelId: aiModel
				})
				d.close()
			}, 50)
		},

		/**********************************************************************
		 * Segment
		 **********************************************************************/

		_renderSegmentScreen(e) {

			const d = new Dialog({ overflow: true });

			const div = this.db.div("MatcToolbarScreenListDialog MatcPadding").build();
			this.db.label("", "Select Screen Segment").build(div);
			const cntr = this.db.div("MatcToolbarScreenListDialogCntr").build(div);
			const list = this.db.div().build();

			const screenSize = ModelUtil.getScreenSizeByPage(this.model, this.currentPage)
			const height = Math.min(screenSize.h / (screenSize.w / this.previewWidth), 250);

			this.previews = [];

			const screens = ModelUtil.getScreensInPage(this.model, this.currentPage)
			for (let i = 0; i < screens.length; i++) {
				const screen = screens[i]
				const screenID = screen.id
				/**
				 * Do not show the selected screen or any parents
				 */
				if (screen.segment) {
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
					d.own(on(wrapper, touch.press, lang.hitch(this, "onSegmentScreenSelected", screenID, d)));
				}
			}

			const scroll = this.$new(ScrollContainer);
			scroll.placeAt(cntr);
			scroll.wrap(list);
			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(div);
			const cancel = this.db.a("MatcButton", "Cancel").build(bar);

			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function () {
				scroll.destroy()
			}))
			d.popup(div, e.target);

		},

		onSegmentScreenSelected(screenID, d) {
			if (d && d.close) {
				d.close()
			}
			this.onProperyChanged("screenID", screenID);
		},

		/**********************************************************************
		 * DataBinding
		 **********************************************************************/

		_renderDataBinding(widget, hasIgnoreState = true) {

			const dataBindingBtn = this.$new(DataBindingButton, { schema: this.schema })
			dataBindingBtn.setWidget(widget)
			dataBindingBtn.setModel(this.model)
			dataBindingBtn.placeAt(this.cntr)
			dataBindingBtn.on('showDialog', (variable) => {
				this._showDataBindingDialog(widget, variable)
			})
			dataBindingBtn.on('change', (value) => {
				this.emit("propertyChange", "databinding", value);
			})

			if (hasIgnoreState) {
				this._renderSurveyBindig(widget)
				//this._renderIgnoreState(widget);
			}
		},


		_renderSurveyBindig() {

			// var row = this.db.div("MatcToobarRow").build(this.cntr);

			// var chkBox = this.$new(CheckBox);
			// css.add(chkBox.domNode, "MatcToolbarItem");
			// chkBox.placeAt(row);
			// chkBox.setLabel("Survey element")
			// chkBox.setValue(widget.props.isSurveyElement);
			// this.tempOwn(on(chkBox, "change", lang.hitch(this, "setSurveyElement")));
			// this._addChildWidget(chkBox);
			// this.addTooltip(row, "User inout will be saved and shown in the survey section.");
		},

		setSurveyElement(value) {
			this.emit("propertyChange", "isSurveyElement", value);
		},

		_showDataBindingDialog(widget, variable) {

			const popup = this.db.div("MatcDataBindingDialogXXL MatcPadding").build();
			const cntr = this.db.div("").build(popup);

			const dataBinding = this.$new(DataBinding, { schema: lang.clone(this.schema) })
			dataBinding.setModel(this.model)
			dataBinding.setWidget(widget)
			dataBinding.setVariable(variable)
			dataBinding.placeAt(cntr)

			const bar = this.db.div("MatcButtonBarDialog MatcMarginTop").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog MatcButtonPrimary", "Save").build(bar);
			write.setAttribute("id", "dataBindingOkId");

			const d = new Dialog({ overflow: true });

			d.own(on(write, touch.press, lang.hitch(this, "setDataBinding", d, dataBinding, widget)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", () => {
				dataBinding.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setDataBinding(d, dataBindingWidget) {
			/**
			 * We do not set default values here any more
			 */
			const value = dataBindingWidget.getValue()
			this.emit("propertyChange", "databinding", value);
			d.close();
		},

		/**********************************************************************
		 * Table
		 **********************************************************************/

		_renderTableSettings(e) {

			const popup = this.db.div(" MatcPadding").build();
			const cntr = this.db.div("").build(popup);
			const table = this.$new(TableSettings, { schema: this.schema });
			table.setModel(this.model)
			table.setWidget(this.widget);
			table.placeAt(cntr);

			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog MatcButtonPrimary", "Save").build(bar);

			const d = this.canvas.createDialog();
			d.overflow = true
			d.own(on(write, touch.press, lang.hitch(this, "setTableSettings", d, table)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, table)));
			d.own(on(d, "close", () => {
				table.destroy();
				this.canvas.setState(0);
			}));
			d.popup(popup, e.target);
		},

		setTableSettings(dialog, settings) {
			const value = settings.getValue()
			this.emit("propertyMultiChange", {
				tableActions: value.tableActions,
				columns: value.columns,
				data: value.data
			})
			settings.destroy();
			dialog.close();
		},


		_renderTableDialog(e, maxColumns = 6) {

			const popup = this.db.div(" MatcPadding").build();
			const cntr = this.db.div("").build(popup);
			const table = this.$new(Table, { columns: maxColumns });
			table.placeAt(cntr);
			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);
			const write = this.db.div("MatcButton", "Ok").build(bar);

			const d = this.canvas.createDialog();
			d.own(on(write, touch.press, lang.hitch(this, "setTableData", d, table)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, table)));
			d.own(on(d, "close", () => {
				table.destroy();
				this.canvas.setState(0);
			}));
			d.onOpen(() => {
				// render table only after dialog is open
				table.setWidget(this.widget);
			})
			d.popup(popup, e.target);
		},

		setTableData(d, table) {
			if (table.dataDirty) {
				var data = table.getData();
				this.onProperyChanged("data", data);
			}
			if (table.widthDirty) {
				var widths = table.getWidths();
				this.onProperyChanged("widths", widths);
			}
			table.destroy();
			d.close();
		},

		/**********************************************************************
		 * Form Group
		 **********************************************************************/

		_showFormGroupDialog(e) {
			this.stopEvent(e);

			var popup = this.db.div(" MatcPadding").build();
			var cntr = this.db.div("MatcDialogTable").build(popup);
			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);

			var list = this.$new(InputList, { "check": "single", 'checkNewOption': true });
			if (this.widget.props) {
				list.setSelected(this.widget.props.formGroup);
			}
			list.setOptions(this.getFormGroups(this.widget));
			scroller.wrap(list.domNode);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);
			var write = this.db.div("MatcButton", "Ok").build(bar);

			var d = new Dialog({ overflow: true });

			d.own(on(write, touch.press, lang.hitch(this, "setFormGroup", d, list)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function () {
				list.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setFormGroup(d, list) {
			var value = list.getSelected();
			console.debug("setFormGroup", value)
			this.emit("propertyChange", "formGroup", value);
			d.close();
			list.destroy();
		},


		getFormGroups(model) {
			var result = [];
			var screen = this.getParentScreen(model);
			if (screen) {
				var children = screen.children;
				for (var i = 0; i < children.length; i++) {
					var widgetID = children[i];
					var widget = this.model.widgets[widgetID];
					if (widget.props && widget.props.formGroup) {
						if (result.indexOf(widget.props.formGroup) < 0) {
							result.push(widget.props.formGroup);
						}
					}
				}
			} else {
				console.warn("getFormGroups() > no screen", model)
			}
			return result;
		},


		/**********************************************************************
		 * Reference
		 **********************************************************************/


		_renderReferenceButton(model, refId, txt, refIcon) {
			var refs = this.getRef(model, refId);

			var icon = "mdi mdi-close";
			var refButton;
			if (refs) {
				refButton = refs[0];
				if (refButton) {
					icon = refIcon;
					var btn = this.model.widgets[refButton];
					if (btn) {
						txt = btn.name;
					}
				}

			}

			var row = this.db.div("MatcToobarRow MatcAction ").build(this.cntr);

			var cntr = this.db.div(" MatcToolbarItem MatcToolbarDropDownButton MatcToolbarGridFull").build(row);
			var lbl = this.db.label("MatcToolbarItemIcon").build(cntr);
			this.db.span(icon).build(lbl);
			this.db.span("MatcToolbarDropDownButtonLabel", txt).build(lbl);


			this.db.span("caret").build(cntr);
			this.tempOwn(on(cntr, touch.press, lang.hitch(this, "_showRefDialog", model, refButton, refId)));

		},

		_showRefDialog(model, refElement, refId, e) {

			this.stopEvent(e);
			var popup = this.db.div(" MatcPadding").build();

			var cntr = this.db.div("MatcDialogTable MatcDialogTableXL").build(popup);
			var widgetsWidthDistance = this._getSortedReferenceableWidgets(model);

			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);


			var list = this.$new(InputList, { "check": "single", "add": false, "remove": false, "edit": false });
			list.setLabelFct(function (option) {
				if (option && option.widget) {
					return option.widget.name;
				}
				return option;
			});
			list.isSelected = function (option) {
				if (option && option.widget) {
					return refElement == option.widget.id
				}
				return false;
			};
			list.setSelected(refElement);
			list.setOptions(widgetsWidthDistance);


			scroller.wrap(list.domNode);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);

			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);
			var write = this.db.div("MatcButton", "Ok").build(bar);


			var d = new Dialog({ overflow: true });

			d.own(on(write, touch.press, lang.hitch(this, "setReference", d, list, model, refId)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function () {
				list.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setReference(d, list, model, refId) {

			var ref = {};
			if (model.props && model.props.refs) {
				ref = lang.clone(model.props.refs);
			}

			var selectedOption = list.getSelected();

			if (selectedOption && selectedOption.widget) {
				/**
				 * ATTENTION: Set as array!
				 */
				ref[refId] = [selectedOption.widget.id];

			} else {
				delete ref[refId];
			}
			this.emit("propertyChange", "refs", ref);


			d.close();
			list.destroy();

		},

		_getSortedReferenceableWidgets() {
			var widgetsWidthDistance = [];

			var supportedType = ["Box", "Label", "Icon", "Button"];
			var screen = this.getParentScreen(this.widget);
			var children = screen.children;
			for (var i = 0; i < children.length; i++) {
				var widgetID = children[i];
				var widget = this.model.widgets[widgetID];
				var type = widget.type;
				if (supportedType.indexOf(type) >= 0) {
					widgetsWidthDistance.push({
						d: 0,
						y: widget.y,
						widget: widget,
					});
				}
			}

			widgetsWidthDistance.sort(function (a, b) {
				return a.y - b.y;
			});

			return widgetsWidthDistance;
		},

		/**********************************************************************
		 * NavBar
		 **********************************************************************/

		_renderNavBarDialog(e) {

			const popup = this.db.div(" MatcPadding").build();

			const cntr = this.db.div("").build(popup);

			const editor = this.$new(NavidationEditor);
			const screens = Object.values(this.model.screens).map(s => {
				return { label: s.name, value: s.id }
			})
			screens.push({
				label: 'None', value: '', css: "passive"
			})
			editor.setScreens(screens);
			editor.setWidget(this.widget);
			editor.placeAt(cntr)

			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);
			const write = this.db.div("MatcButton", "Ok").build(bar);

			const d = new Dialog({ autoClose: false });
			d.own(on(write, touch.press, lang.hitch(this, "setNavBar", d, editor)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, editor)));
			d.popup(popup, e.target);
		},

		setNavBar(d, editor) {
			d.close()
			const navigation = editor.getValue()
			this.onProperyChanged("navigation", navigation);
		},

		/**********************************************************************
		 * Dropdown Group Options
		 **********************************************************************/

		_renderDropdownGroupDialog(e, variable) {

			const popup = this.db.div("MatcDialog MatcDialogL MatcOptionDialog MatcPadding").build();
			const cntr = this.db.div("MatcDialogTable").build(popup);

			const dialogInstance = this.$new(SystemPromptsDialog, {
				title: 'Prompts',
			});

			dialogInstance.setWidget(this.widget, this.icons);
			const scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);
			scroller.wrap(dialogInstance.domNode);


			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPadding").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
			const d = this.canvas.createDialog();
			d.autoClose = false
			d.own(on(write, touch.press, lang.hitch(this, "setDropdownGroups", d, dialogInstance, variable)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, dialogInstance)));
			d.own(on(d, "close", () => {
				dialogInstance.destroy();
				popup.remove();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
		},

		setDropdownGroups(d, list, variable) {
			this.closeDialog(d, list);
			const systemprompts = list.getSystemPrompts();

			const changes = {};
			changes[variable] = systemprompts;

			this.emit("propertyMultiChange", changes);
		},

		/**********************************************************************
		 * Options
		 **********************************************************************/

		 _renderListDialog(e, variable = "options", selected = "selected", values = "optionValues") {
			this.stopEvent(e);

			const popup = this.db
				.div("MatcDialog MatcDialogL MatcOptionDialog MatcPadding ").build();

			const cntr = this.db
				.div("MatcDialogTable").build(popup);

			const scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);

			const list = this.$new(OptionsList, { "check": "none", 'hasDefaultValues': false });
			list.setSelected(this.widget.props[selected]);
			list.setOptions(this.widget.props[variable]);
			list.setOptionValues(this.widget.props[values]);

			scroller.wrap(list.domNode);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPadding").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
	

			const d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(this, "setOptions", d, scroller, list, variable, selected, values)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, scroller, list)));
			d.popup(popup, e.target);
		},


		_renderOptionDialog(e, type = 'single', variable = "options", selected = "selected", values = "optionValues") {
			this.stopEvent(e);

			const popup = this.db
				.div("MatcDialog MatcDialogL MatcOptionDialog MatcPadding ").build();

			const cntr = this.db
				.div("MatcDialogTable").build(popup);

			const scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);

			const list = this.$new(OptionsList, { "check": type });
			list.setSelected(this.widget.props[selected]);
			list.setOptions(this.widget.props[variable]);
			list.setOptionValues(this.widget.props[values]);

			scroller.wrap(list.domNode);

			const bar = this.db.div("MatcButtonBarDialog MatcButtonBarDialogPadding").build(popup);
			const cancel = this.db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			const write = this.db.div("MatcButtonDialog", "Save").build(bar);
	
			const d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(this, "setOptions", d, scroller, list, variable, selected, values)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog", d, scroller, list)));
			d.popup(popup, e.target);
		},

		setOptions(d, scroller, list, variable, selectedValue, values) {
			this.closeDialog(d, scroller, list);
			const options = list.getOptions();
			const optionValues = list.getOptionsValues();
			const selected = list.getSelected();

			const changes = {}
			changes[variable] = options;
			changes[selectedValue] = selected;
			changes[values] = optionValues;

			this.emit("propertyMultiChange", changes)
		},

		/**********************************************************************
		 * Icons
		 **********************************************************************/
		_renderIconDialog(e, iconKey = 'icon') {
			this.logger.log(-1, '_renderIconDialog', 'enter', iconKey)
			this.stopEvent(e);

			const popup = this.db
				.div("MatcDialogXXL MatcPadding")
				.build();

			const top = this.db
				.div("MatcRight")
				.build(popup);
			const div = this.db
				.div("form-group has-feedback")
				.build(top);
			const input = this.db
				.input("MatcCreateSearch MatcIgnoreOnKeyPress form-control")
				.build(div);

			this.db
				.span("mdi mdi-magnify  form-control-feedback MatcCreateSearchBtn")
				.build(div);

			input.type = "search";


			const cntr = this.db.div("MatcDateSectionIconCntr MatcDateSectionIconCntrOverflow ", "").build(popup);
			const table = this.db.div("").build();

			const scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);
			scroller.wrap(table);


			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			const d = new Dialog();
			d.hasCSSAnimation = false
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(table, touch.press, lang.hitch(this, "setIcon", d, iconKey)));
			d.own(on(input, touch.press, function (e) { e.stopPropagation() }));
			d.own(on(input, "keypress", function (e) { e.stopPropagation() }));
			d.own(on(input, "keydown", function (e) { e.stopPropagation() }));
			d.own(on(input, "keyup", lang.hitch(this, "onIconSearch", input, table)));

			d.popup(popup, e.target);

			const selected = this.getSelectedIcon(iconKey)

			setTimeout(() => {
				input.focus();
				this.renderIconTable(table, "", selected, iconKey);
			}, 400);
		},

		getSelectedIcon(iconKey = 'icon') {
			if (this.widget && this.widget.style) {
				return this.widget.style[iconKey]
			}
		},

		renderIconTable(table, filter, selected = false) {
			table.innerHTML = "";
			const icons = this.icons;

			for (let j = 0; j < icons.length; j++) {
				const icon = icons[j];
				if (!filter || icon.indexOf(filter.toLowerCase()) >= 0) {
					const span = this.db
						.span("MatcToolbarDropDownButtonItem mdi mdi-" + icons[j])
						.build(table);

					span.setAttribute("data-matc-icon", icons[j]);
					if ('mdi mdi-' + icons[j] === selected) {
						this.focusIcon(span)
					}
				}
			}
		},

		focusIcon(span) {
			css.add(span, 'selected')
			setTimeout(() => {
				span.scrollIntoView({ block: "nearest", inline: "nearest" })
			}, 100)
		},

		onIconSearch(input, tbody, e) {
			this.stopEvent(e);
			var filter = input.value;
			if (filter.length >= 3) {
				this.renderIconTable(tbody, filter);
			} else {
				this.renderIconTable(tbody, "");
			}
		},

		setIcon(d, iconKey, e) {
			const node = e.target;
			if (node) {
				css.add(node, 'selected')
				const icon = node.getAttribute("data-matc-icon");
				if (icon) {
					this.onStyleChanged(iconKey, "mdi mdi-" + icon);
				}
			}
			setTimeout(() => {
				d.close();
			}, 250)
		},

		closeDialog(d, scroller, list) {
			d.close();
			if (scroller && scroller.destroy) {
				scroller.destroy();
			}
			if (list && list.destroy) {
				list.destroy();
			}
			delete this._optionInputs;
		},


		/**********************************************************************
		 *Helpers
		**********************************************************************/


		getRef(model, id) {
			if (model.props.refs && model.props.refs[id]) {
				return model.props.refs[id];
			}
			return null;
		},


		_renderShadowPicker(label, model, prop) {

			var row = this.db.div("MatcToobarRow MatcToobarRowHover").build(this.cntr);

			let radius = this.db.div('MatcToolbarRadius').build(row);

			let picker = this.$new(BoxShadow)
			picker.placeAt(radius)
			//picker.setLabelPrefixFix(label)
			picker.setValue(model.style[prop])
			this.tempOwn(on(picker, "change", lang.hitch(this, "onStyleChanged", prop)));
			this.tempOwn(on(picker, "changing", lang.hitch(this, "onTempStyleChanged", prop)));

		},

		_renderSlider(label, model, prop, min, max) {

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			let radius = this.db.div('MatcToolbarRadius').build(row);
			this.db.span('MatcToolbarItemLabel', label).build(radius);

			var slider = this.$new(ToolbarSlider, { max: max, min: min });
			slider.placeAt(radius);
			slider.render()
			slider.setValue(model.props[prop])
			this.own(on(slider, "change", lang.hitch(this, "onProperyChanged", prop)));


			this._addChildWidget(slider);
		},


		_renderCheck(lbl, value, property, tt, callback = 'onProperyChanged') {

			var row = this.db.div("MatcToobarRow").build(this.cntr);
			//this.db.span("MatcToolbarItemLabel", lbl).build(row);

			var chkBox = this.$new(CheckBox);
			css.add(chkBox.domNode, "MatcToolbarItem");
			chkBox.placeAt(row);
			chkBox.setLabel(lbl)
			chkBox.setValue(value);
			this.tempOwn(on(chkBox, "change", lang.hitch(this, callback, property)));
			this._addChildWidget(chkBox);

			if (tt) {
				this.addTooltip(row, tt);
			}
		},

		_renderRadioGroup(options, value, property, tt, callback = 'onProperyChanged') {
			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var formattinglist = this.$new(RadioBoxListVue);
			css.add(formattinglist.domNode, "MatcMarginLeft MatcMarginTopXS");
			formattinglist.setOptions(options);
			formattinglist.placeAt(row);
			formattinglist.setValue(value);
			this.tempOwn(on(formattinglist, "change", lang.hitch(this, callback, property)));
			this._addChildWidget(formattinglist);
			if (tt) {
				this.addTooltip(row, tt);
			}
		},

		_renderSpacer() {
			this.db.div("MatcToobarRow MatcToobarRowSpacer ").build(this.cntr);
		},

		_renderSubSection(lbl) {
			this.db
				.div("MatcToobarRow MatcToobarSubSection ")
				.build(this.cntr);

			if (lbl) {
				this.db
					.div("MatcToobarSubSectionLabel", lbl)
					.build(this.cntr);
			}
		},

		_renderButton(lbl, icon, callback) {
			const row = this.db.div("MatcToobarRow ").build(this.cntr);
			const item = this.db.div("MatcToolbarItem MatcToolbarGridFull MatcToolbarDropDownButton").build(row);
			const btn = this.db.span("MatcToolbarItemIcon").build(item);

			const iconNode = iconDOM(icon, "MatcQIconInButton") 
			btn.appendChild(iconNode)

			this.db.span("MatcToolbarItemLabel", lbl).build(btn);
			this.tempOwn(on(row, touch.press, lang.hitch(this, callback)));
		},

		_renderDropDownTree(lbl, icon, options) {
			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var drpDwn = this.$new(DropDownTree, { hasPicker: true });
			css.add(drpDwn.domNode, "MatcToolbarGridFull")
			drpDwn.reposition = true;
			drpDwn.setOptions(options);
			drpDwn.setModel(this.model)
			drpDwn.setLabel(`<span class="MatcToolbarItemLabel">${lbl}</span>`)
			drpDwn.setIcon(icon)
			drpDwn.setPopupCss("MatcActionAnimProperties");

			this.tempOwn(on(drpDwn, "change", (option, value) => {
				if (option.isStyle) {
					this.onStyleChanged(option.key, value)
				} else {
					this.onProperyChanged(option.key, value)
				}
			}))
			this.tempOwn(on(drpDwn, "changing", (option, value) => {
				if (option.isStyle) {
					this.onTempStyleChanged(option.key, value)
				}
			}))

			drpDwn.placeAt(row);

			this._addChildWidget(drpDwn);
		},

		_renderPrimaryButton(lbl, icon, callback) {
			var row = this.db.div("MatcToobarRow MatcMarginBottomXS").build(this.cntr);
			var item = this.db.div("MatcToolbarItem MatcToolbarGridFull").build(row);
			var btn = this.db.span("MatcToolbarButton MatcButton MatcToolbarButtonPrimary").build(item);
			this.db.span(icon + ' MatcButtonIcon').build(btn)
			this.db.span("MatcButtonIconLabel", lbl).build(btn);
			this.tempOwn(on(row, touch.press, lang.hitch(this, callback)));
		},


		_renderInfo(lbl, icon) {
			var row = this.db.div("MatcToobarRow ").build(this.cntr);
			var item = this.db.div("MatcToolbarItem MatcToolbarGridFull MatcToolbarDropDownButton").build(row);
			var btn = this.db.span("MatcToolbarItemIcon").build(item);
			this.db.span(icon).build(btn)
			this.db.span("MatcToolbarItemLabel", lbl).build(btn);
		},

		_renderThemeDropDown(model, prop, icon) {
			const themes = ChatThemes;
			let options = Object.keys(themes).map((theme) => {
				return { value: theme, label: `Theme: ${theme}`, icon: icon }
			});
			const row = this.db.div("MatcToobarRow").build(this.cntr);

			const drpDwn = this.$new(ToolbarDropDownButton, { maxLabelLength: 15 });
			drpDwn.setIcon(icon)
			css.add(drpDwn.domNode, "MatcToolbarGridFull")
			drpDwn.reposition = true;
			drpDwn.setOptions(options);
			drpDwn.setValue(model.props[prop])
			drpDwn.setPopupCss("MatcActionAnimProperties");
			this.own(on(drpDwn, "change", lang.hitch(this, "onThemeChanged", { key: prop, model: model })));
			drpDwn.placeAt(row);

			this._addChildWidget(drpDwn);
		},


		_renderDropDown(model, prop, options, icon) {

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var drpDwn = this.$new(ToolbarDropDownButton, { maxLabelLength: 15 });
			drpDwn.setIcon(icon)
			css.add(drpDwn.domNode, "MatcToolbarGridFull")
			drpDwn.reposition = true;
			drpDwn.setOptions(options);
			drpDwn.setValue(model.props[prop])
			drpDwn.setPopupCss("MatcActionAnimProperties");
			this.own(on(drpDwn, "change", lang.hitch(this, "onProperyChanged", prop)));
			drpDwn.placeAt(row);

			this._addChildWidget(drpDwn);
		},

		_renderLabelDropDown(label, model, prop, options, isStyle) {

			var row = this.db.div("MatcToobarRow").build(this.cntr);
			var drpDwn = this.$new(ToolbarDropDownButton, { maxLabelLength: 15 });
			css.add(drpDwn.domNode, "MatcToolbarGridFull")
			drpDwn.reposition = true;
			drpDwn.setOptions(options);
			drpDwn.setLabelPostfix(label);

			if (isStyle) {
				drpDwn.setValue(model.style[prop])
			} else {
				drpDwn.setValue(model.props[prop])
			}

			drpDwn.setPopupCss("MatcActionAnimProperties");
			if (isStyle) {
				this.own(on(drpDwn, "change", lang.hitch(this, 'onStyleChanged', prop)));
			} else {
				this.own(on(drpDwn, "change", lang.hitch(this, 'onProperyChanged', prop)));
			}

			drpDwn.placeAt(row);
			this._addChildWidget(drpDwn);
		},

		_renderImagesDropDown(widget, prop = "images", multiselection = true) {

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var imageDrpDwn = this.$new(ToolbarImage, { mode: this.mode });
			css.add(imageDrpDwn.domNode, "MatcToolbarGridFull")
			imageDrpDwn.setJwtToken(this.jwtToken)
			imageDrpDwn.setModel(this.model);
			imageDrpDwn.setCanvas(this.canvas);
			imageDrpDwn.setSelection(widget.props[prop]);
			imageDrpDwn.setMultiSelection(multiselection);
			//imageDrpDwn.setLabel('<span class="mdi mdi-image"></span> <span class="MatcToolbarItemLabel">Images</span>');
			imageDrpDwn.placeAt(row);
			this.tempOwn(on(imageDrpDwn, "change", lang.hitch(this, "onProperyChanged", prop)));


			this._addChildWidget(imageDrpDwn);

		},

		_renderImagesLabelDropDown(widget) {

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var imageDrpDwn = this.$new(ToolbarImageLabel, { mode: this.mode });
			css.add(imageDrpDwn.domNode, "MatcToolbarGridFull")
			imageDrpDwn.setJwtToken(this.jwtToken)
			imageDrpDwn.setModel(this.model);
			imageDrpDwn.setCanvas(this.canvas);
			imageDrpDwn.setSelection(widget.props.images);
			imageDrpDwn.setMultiSelection(true);
			//imageDrpDwn.setLabel('<span class="mdi mdi-image"></span> <span class="MatcToolbarItemLabel">Images</span>');
			imageDrpDwn.placeAt(row);
			this.tempOwn(on(imageDrpDwn, "change", lang.hitch(this, "onProperyChanged", "images")));


			this._addChildWidget(imageDrpDwn);

		},

		_renderColor(lbl, icon, value, property, callback, updateColor, hasGradient = false) {

			if (!callback) {
				callback = "onStyleChanged";
			}

			var row = this.db.div("MatcToobarRow MatcToobarRowHover").build(this.cntr);

			var color = this.$new(ToolbarColor, { hasPicker: true, hasGradient: hasGradient });
			color.placeAt(row);
			if (updateColor) {
				color.updateColor = true;
			} else {
				color.updateLabel = true;
			}

			color.setLabel(lbl);
			color.setModel(this.model);
			color.setValue(value);
			color.setBox(this.widget)
			color.setCssProps([property])
			css.add(color.domNode, " MatcToolbarGridFull");
			this.tempOwn(on(color, "change", lang.hitch(this, callback, property)));
			this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", property)));

			//this.db.span("MatcToolbarItemLabel", lbl).build(row);

			this._addChildWidget(color);

			return color;
		},


		_renderInput(model, property, tt, placeholder = "") {

			const row = this.db
				.div("MatcToobarRow MatcToolbarItem MatcToolbarGridFull")
				.build(this.cntr);
		
			const input = this.db
				.input("MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput")
				.build(row);

			input.value = model[property];
			input.placeholder = placeholder
			this.tempOwn(on(input, "change", () => {
				this.onProperyChanged(property, input.value);
			}));
			if (tt) {
				this.addTooltip(row, tt);
			}
		},

		_renderTextInput(model, property, tt, placeholder = "") {

			const row = this.db
				.div("MatcToobarRow MatcToolBarTextArea MatcToolbarItem  MatcToolbarGridFull")
				.build(this.cntr);

			const input = this.db
				.input("MatcIgnoreOnKeyPress MatcToobarInlineEdit")
				.build(row);

			if (tt) {
				this.addTooltip(row, tt);
			}

			const value = model[property]
			input.value = model[property];
			input.placeholder = placeholder

			const onChangeListener = () => {
				if (value !== input.value) {
					this.onProperyChanged(property, input.value);
				}
			}
			this._addBlurListener(input)
			this.tempOwn(on(input, "blur", onChangeListener));


		},

		_renderTextArea(model, property, tt, placeholder = "") {

			const row = this.db
				.div("MatcToobarRow MatcToolBarTextArea MatcToolbarItem  MatcToolbarGridFull")
				.build(this.cntr);

			const textarea = this.db
				.textarea("MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput")
				.build(row);

			if (tt) {
				this.addTooltip(row, tt);
			}

			const value = model[property]
			textarea.value = model[property];
			textarea.placeholder = placeholder

			const onChangeListener = () => {
				if (value !== textarea.value) {
					this.onProperyChanged(property, textarea.value);
				}
			}
			this._addBlurListener(textarea)
			this.tempOwn(on(textarea, "blur", onChangeListener));


		},


		_renderInputDropDown(lbl, model, options, property, isProp, type = false, multiselect = false) {
			const row = this.db.div('MatcToobarRow').build(this.cntr);

			let dropDown;

			if (multiselect) {
				dropDown = this.$new(InputDropDownButton, { qIcon: null, qIsDropDown: true, qPlacement: 'left' });
				dropDown.setLabel(lbl);
				dropDown.setOptions(options);
				css.add(dropDown.domNode, 'MatcToolbarGridFull');

				const selectedValues = isProp ? model.props[property] : model.style[property];
				dropDown.setValue(selectedValues || []);

				dropDown.placeAt(row);

				this.tempOwn(
					on(dropDown, 'change', lang.hitch(this, function (selectedValues) {
						if (isProp) {
							this.onProperyChanged(property, selectedValues);
						} else {
							this.onStyleChanged(property, selectedValues);
						}
					}))
				);

				this._addChildWidget(dropDown);
			} else {
				dropDown = this.$new(InputDropDownButton, { qPlacement: 'left' });
				if (type) {
					dropDown.type = type;
				}
				dropDown.reposition = true;
				dropDown.setLabelPostfix(`   (${lbl})`);
				dropDown.setOptions(options);
				css.add(dropDown.domNode, 'MatcToolbarGridFull');

				if (isProp) {
					dropDown.setValue(model.props[property]);
				} else {
					dropDown.setValue(model.style[property]);
				}

				dropDown.placeAt(row);

				if (isProp) {
					this.tempOwn(on(dropDown, 'change', lang.hitch(this, 'onProperyChanged', property)));
				} else {
					this.tempOwn(on(dropDown, 'change', lang.hitch(this, 'onStyleChanged', property)));
				}

				this._addChildWidget(dropDown);
			}
		},

		_renderBoxColor(lbl, model, propertyBack, propertyColor, propertyBorder) {

			let row = this.db.div("MatcToobarRow").build(this.cntr);

			var color = this.$new(ToolbarColor, { hasPicker: true });
			color.placeAt(row);
			color.updateColor = true;
			color.setLabel(lbl + ' Fill');
			color.setCssProps([propertyBack])
			color.setModel(this.model);
			color.setValue(model.style[propertyBack]);
			css.add(color.domNode, "MatcToolbarGridFull");
			this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyBack)));
			this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyBack)));
			this._addChildWidget(color);

			if (propertyColor) {
				row = this.db.div("MatcToobarRow  MatcToolbarGridFull").build(this.cntr);
				color = this.$new(ToolbarColor, { hasPicker: true });
				color.placeAt(row);
				color.setCssProps([propertyColor])
				color.setLabel(lbl + ' Text');
				color.setModel(this.model);
				color.setValue(model.style[propertyColor]);
				css.add(color.domNode, "MatcToolbarGridFull");
				this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyColor)));
				this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyColor)));
				this._addChildWidget(color);
			}

			if (propertyBorder) {
				row = this.db.div("MatcToobarRow MatcToolbarGridFull").build(this.cntr);
				color = this.$new(ToolbarColor, { hasPicker: true });
				color.placeAt(row);
				color.setCssProps([propertyBorder])
				color.setLabel(lbl + ' Border');
				color.setModel(this.model);
				color.setValue(model.style[propertyBorder]);
				css.add(color.domNode, "MatcToolbarGridFull");
				this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyBorder)));
				this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyBorder)));
				this._addChildWidget(color);
			}
			return color;
		},

		onThemeChanged(obj, value) {
			this.logger.log(2, "onThemeChanged", "enter > " + value);
			const key = obj.key;
			this.emit("propertyChange", key, value);
			const model = obj.model;
			if (model) {
				const themes = ChatThemes
				const themeStyles = themes[value];
				this.emit("stypeMutlitChange", themeStyles);
			}
		},

		onProperyChanged(key, value) {
			this.logger.log(2, "onProperyChanged", "enter > " + key + " > " + value);
			this.emit("propertyChange", key, value);
		},

		onStyleChanged(key, value) {
			this.logger.log(2, "onStyleChanged", "enter > " + key + " > " + value);
			this.emit("stypeChange", key, value);
		},

		onTempStyleChanged(key, value) {
			this.logger.log(2, "onTempStyleChanged", "enter > " + key + " > " + value);
			this.emit("stypeChanging", key, value);
		},

		_addChildWidget(w) {
			if (!this._childWidgets) {
				this._childWidgets = [];
			}
			this._childWidgets.push(w);
		},

		_addBlurListener(input) { // must of blur()
			if (!this._blurListener) {
				this._blurListener = []
			}
			this._blurListener.push(input)
		},

		blur() {
			this.logger.log(1, "blur", "enter");
			if (this._blurListener) {
				try {
					for (let i = 0; i < this._blurListener.length; i++) {
						if (this._blurListener[i].blur) {
							this._blurListener[i].blur();
						}
					}
				} catch (err) {
					this.logger.error("blur", "Some error", err);
					this.logger.sendError(err)
				}

			}
		},

		_cleanUpChildWidgets() {
			if (this._childWidgets) {
				for (var i = 0; i < this._childWidgets.length; i++) {
					this._childWidgets[i].destroy();
				}
			}
			delete this._childWidgets;
			delete this._blurListener
		}
	},
	mounted() {
		this.domUtil = new DomUtil()
	}
}
</script>