<template>
    <div></div>
</template>
<script>

import AIModelsUtil from '../../../util/aimodels/AIModelsUtil.js'

export default {
	name: '_Add',
	mixins: [],
	methods: {

	
        /*********************************************************************
		 * Add & Remove Events
		 **********************************************************************/

		onToolCreateScreen(e) {
			this.logger.log(-1,"onToolCreateScreen", "entry >", e);
			let scrn = this.createEmptyScreen(0, 0, 'Screen', this.currentPage)
			this.emit("newThemedScreen", {"obj" : scrn, "event" : e});
		},

		onPromptBuilderObject(e) {
			this.logger.log(-1, "onPromptBuilderObject", "entry > ");
			var obj = {
				"id": "PromptBuilder",
				"name": "PromptBuilder",
				"type": "PromptBuilder",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"rest": {
						"token": "",
						"assistant": "",
						"input": {
							"databinding": "",
							"prompt": ""
						},
						"output": {
							"databinding": "",
							"path": ""
						}
					}
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"logo": "prompt-builder"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onNewAIRestObject(e, type) {
			const title = AIModelsUtil[type].title;
			const id = AIModelsUtil[type].id;
			const icon = AIModelsUtil[type].icon;
			const logo = AIModelsUtil[type].logo;
			const inputType = AIModelsUtil[type].input && AIModelsUtil[type].input.type;
			var obj = {
				"id": id,
				"name": title,
				"type": "AIRest",
				"category": "Logic",
				"subcategory": title,
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"title": title,
					"template": {
						"title": title,
						"type": id,
						"rest": {
							"method": "POST",
							"url": "",
							"token": "",
							"authType": "Bearer",
							"vars": {
							},
							"input": {
								"type": inputType || "JSON",
								"template": "{\"model\":\"@{model}\"}"
							},
							"output": {
								"databinding": "abc",
								"template": "",
								"type": "JSON",
								"hints": []
							},
							"headers": []
						},
					},
					"rest": {
						"vars": {							
						},						
						"token": "",
						"authType": "Bearer",
						"input": {
							"type": inputType || "JSON",
							"fileDataBinding": "",
							"template": "{}"
						},
						"output": {
							"databinding": "",
							"path": "",
							"template": "",
							"type": "JSON",
							"hints": {}
						},
						"headers": []
					}
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"iconSize": 0.7,
					"icon": icon,
					"logo": logo
				}
			}

			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onNewAssistantObject(e) {
			this.logger.log(-1, "onNewAssistantObject", "entry > ");
			var obj = {
				"id": "OpenAIAssistant",
				"name": "OpenAI Assistant",
				"type": "OpenAIAssistant",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"rest": {
						"token": "",
						"assistant": "",
						"input": {
							"databinding": "",
							"prompt": ""
						},
						"output": {
							"databinding": "",
							"path": ""
						}
					}
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"iconSize": 0.7,
					"icon": "mdi mdi-robot-outline ",
					"logo": "OpenAI"
				}
			}
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onNewScriptObject(e, script="") {
			this.logger.log(-1, "onNewScriptObject", "entry > script: " + script);

			var obj = {
				"id": "Script",
				"name": "Script",
				"type": "Script",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"script": script
				},
				"has": {
					"script": true
				},
				"style": {
					"background": "#777",
					"iconSize": 0.7,
					"logo": "script"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onNewRestObject(v, e) {
			this.logger.log(-1, "onNewRestObject", "entry > ");

			const obj = {
				"id": "Rest",
				"name": "API",
				"type": "Rest",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"rest": {
						"method": "GET",
						"url": "",
						"token": "",
						"authType": "Bearer",
						"input": {
							"type": "JSON",
							"fileDataBinding": '',
							"template": ''
						},
						"output": {
							"databinding": '',
							"template": '',
							"type": 'JSON',
							"hints": {}
						},
						"headers": []
					}
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"logo": "api"
				}
			};
			this.emit("onNewRestObject", { "obj": obj, "event": e });
		},

		onNewLogicObject(e, item) {
			this.logger.log(0, "onNewLogicObject", "entry > ");

			var obj = {
				"id": item.id,
				"name": item.id,
				"type": item.type,
				"x": 0,
				"y": 0,
				"w": 64,
				"h": 64,
				"props": {
					"label": item.id
				},
				"has": {
					"logic": true
				},
				"style": {
					"background": "#04152c",
					"logo": item.logo
				}
			};
			// 56a9fc
			this.emit("onNewLogicObject", { "obj": obj, "event": e });
		},

		onApiObject (e, params) {
			this.logger.log(-1, "onApiObject", "entry > ", params);
			const obj = {
				"id": params.type,
				"name": params.label,
				"type": "API",
				"category": "Logic",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"type": params.type
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"iconSize": 0.7,
					"icon": "mdi mdi-air-filter",
					"iconStyle": "Airtable",
					"logo": params.logo
				}
			};
			this.emit("onNewLogicObject", { "obj": obj, "event": e });
		},

		// onAirtableBuilderObject(e) {
		// 	this.logger.log(-1, "onAirtableBuilderObject", "entry > ");
		// 	var obj = {
		// 		"id": "Airtable",
		// 		"name": "Airtable",
		// 		"type": "Rest",
		// 		"category": "Logic",
		// 		"subcategory": "ABox",
		// 		"_type": "Widget",
		// 		"x": 0,
		// 		"y": 0,
		// 		"w": 72,
		// 		"h": 72,
		// 		"props": {
		// 			"title": "Airtable",
		// 			"wizard": "AirtableRestWizard",
		// 			"template": {
		// 				"title": "Airtable",
		// 				"rest": {
		// 					"method": "POST",
		// 					"url": "",
		// 					"token": "",
		// 					"authType": "Bearer",
		// 					"vars": {
		// 					},
		// 					"input": {
		// 						"type": "JSON",
		// 						"template": ""
		// 					},
		// 					"output": {
		// 						"databinding": "",
		// 						"template": "",
		// 						"type": "JSON",
		// 						"hints": []
		// 					},
		// 					"headers": []
		// 				},
		// 				"elements": []
		// 			},
		// 			"rest": {
		// 				"vars": {
		// 				},
		// 				"method": "POST",
		// 				"url": "",
		// 				"token": "",
		// 				"authType": "Bearer",
		// 				"input": {
		// 					"type": "JSON",
		// 					"fileDataBinding": "",
		// 					"template": "{}"
		// 				},
		// 				"output": {
		// 					"databinding": "",
		// 					"path": "",
		// 					"template": "",
		// 					"type": "JSON",
		// 					"hints": {}
		// 				},
		// 				"headers": []
		// 			}
		// 		},
		// 		"has": {
		// 			"rest": true
		// 		},
		// 		"style": {
		// 			"background": "#777",
		// 			"iconSize": 0.7,
		// 			"icon": "mdi mdi-air-filter",
		// 			"iconStyle": "Airtable",
		// 			"logo": "Airtable"
		// 		}
		// 	};
		// 	this.emit("onNewScriptObject", { "obj": obj, "event": e });
		// },

		onTextToDocBuilderObject(e) {
			this.logger.log(0, "onNewLogicObject", "entry > ");

			var obj = {
				"id": "textToDoc",
				"name": "Text to Doc",
				"type": "TextToDoc",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"input": {
						"databinding": "",
						"type": "markdown"
					},
					"output": {
						"databinding": "",
						"content": ""
					}
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"logo": "pdf-parser"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onDocToTextBuilderObject(e) {
			this.logger.log(0, "onNewLogicObject", "entry > ");

			var obj = {
				"id": "docToText",
				"name": "Doc to Text",
				"type": "DocToText",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"input": {
						"databinding": "",
						"type": "file"
					},
					"output": {
						"databinding": "",
						"content": ""
					}
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"logo": "pdf-parser"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onDownloadObject(e) {
			this.logger.log(0, "onNewLogicObject", "entry > ");

			var obj = {
				"id": "download",
				"name": "Download",
				"type": "Download",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"srcfile": "",
					"opentab": false
				},
				"has": {
				},
				"style": {
					"background": "#777",
					"logo": "download"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onCopyClipboardObject(e) {
			this.logger.log(0, "onNewLogicObject", "entry > ");

			var obj = {
				"id": "copyClipboard",
				"name": "CopyClipboard",
				"type": "CopyClipboard",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
				},
				"has": {
				},
				"style": {
					"background": "#777",
					"logo": "copy-clipboard"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onLocalStorageBuilderObject(e) {
			this.logger.log(0, "onNewLogicObject", "entry > ");

			var obj = {
				"id": "localStorage",
				"name": "Local Storage",
				"type": "LocalStorage",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"input": {
						"databinding": "",
						"type": "file"
					},
					"output": {
						"databinding": "",
						"content": ""
					}
				},
				"has": {
				},
				"style": {
					"background": "#777",
					"logo": "local-storage"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onFTPBuilderObject(e) {
			this.logger.log(0, "onNewLogicObject", "entry > ");

			var obj = {
				"id": "FTP",
				"name": "FTP",
				"type": "FTP",
				"category": "Logic",
				"subcategory": "ABox",
				"_type": "Widget",
				"x": 0,
				"y": 0,
				"w": 72,
				"h": 72,
				"props": {
					"input": {
						"databinding": "",
						"type": "file"
					},
					"output": {
						"databinding": "",
						"content": ""
					}
				},
				"has": {
					"rest": true
				},
				"style": {
					"background": "#777",
					"logo": "pdf-parser"
				}
			};
			this.emit("onNewScriptObject", { "obj": obj, "event": e });
		},

		onThemedMultiScreen(screens, e) {
			this.logger.log(0, "onThemedMultiScreen", "entry > ");
			this.emit("newMultiThemedScreen", { "obj": screens, "event": e });
		},

		onImportChange(imports) {
			this.logger.log(-1, "onImportChange", "entry > ", imports);
			if (this.controller) {
				this.controller.setImports(imports)
			}
		},


		onRemoveTemplate(template) {
			this.logger.log(-1, "onRemoveTemplate", "entry > ", template);
			if (this.controller && template) {
				this.controller.removeAndUnlinkTemplate(template.id)
			}
		},

		onNewThemeObject(obj, e) {
			this.logger.log(1, "onNewThemeObject", "entry > " + obj._type + " > " + obj.type + " > " + obj._isTemplate);
			const type = obj._type;

			/**
			 * remove here some of the shit not needed
			 */
			delete obj._extends;
			delete obj._type;
			delete obj._group;
			delete obj.category;
			delete obj.subcategory;
			delete obj._previewSize
			/**
			 * Now dispatch the the right listener
			 */
			if (obj._isTemplate) {
				/**
				 * special handling for templates
				 */
				this.emit("newTemplated" + type, { "id": obj.id, "event": e });
			} else if (type === "Screen") {
				this.emit("newThemedScreen", { "obj": obj, "event": e });
			} else if (type === "Group") {
				this.emit("newThemedGroup", { "obj": obj, "event": e });
			} else if (type === "Widget") {
				this.emit("newThemedWidget", { "obj": obj, "event": e });
			} else if (type === "ScreenAndWidget") {
				this.emit("newThemedScreenAndWidget", { "obj": obj, "event": e });
			}
		},


		onNewLine(e, action, databinding, targets) {	

			console.debug('newLine', targets)
			this.stopEvent(e);
			if (this._selectedWidget) {
				const line = { "type": "line", "event": e, "from": this._selectedWidget.id }
				if (action) {
					line.action = action
				}
				if (databinding) {
					line.databinding = databinding
				}
				if (targets) {
					line.targets = targets
				}
				this.emit("newLine", line);
			} else if (this._selectedGroup) {
				this.emit("newLine", { "type": "line", "event": e, "from": this._selectedGroup.id });
			} else if (this._selectedScreen) {
				this.emit("newLine", { "type": "line", "event": e, "from": this._selectedScreen.id });
			}
			return false;
		},

		onNewDataBindingLine(widget, databinding, action, e) {
			this.stopEvent(e);
			if (this._selectedWidget) {
				const line = { 
					type: "line", 
					event: e, 
					from: this._selectedWidget.id,
					action:action,
					databinding: databinding
				}
				
				this.emit("newLine", line);
			} 
			return false;
		},

		onNewTransformLine(e) {
			this.stopEvent(e);

			if (this._selectedWidget) {

				this.emit("newLine", { "type": "line", "event": e, "from": this._selectedWidget.id, "duration": 500, "animation": "transform" });

			} else if (this._selectedGroup) {

				this.emit("newLine", { "type": "line", "event": e, "from": this._selectedGroup.id, "duration": 500, "animation": "transform" });

			} else if (this._selectedScreen) {

				this.emit("newLine", { "type": "line", "event": e, "from": this._selectedScreen.id, "duration": 500, "animation": "transform" });

			}

			return false;
		},

		onNewComment(e) {
			this.logger.log(0, "onNewComment", "entry");
			this.stopEvent(e);

			this.emit("newComment", { "type": "comment", "event": e });
		},

		createOnClick(e) {
			this.emit("newLine", { "type": "line", "event": e, "from": this._selectedWidget.id });
			return false;
		}
    }


}
</script>