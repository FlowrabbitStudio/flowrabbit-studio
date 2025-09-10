<template>
    <div class="">
      
        <div class="MatcSidebarHeader">
            <div>
                <!-- <div class="MatcCreateSearchContainer">
          <input
            type="search"
            class="MatcCreateSearch MatcIgnoreOnKeyPress form-control"
            placeholder="Search"
            data-dojo-attach-point="searchBox"
          />
        </div> -->
            </div>
            <div data-dojo-attach-point="leftCntr" @mousedown.stop @dblclick.stop>
                <a class="MatcButton MatcButtonPrimary MatcButtonFullWidth MatcButtonXS" @click="onCreateNew">
                    <span class="mdi mdi-plus"></span>New Variable
                </a>
            </div>
        </div>
        <div class="MatcSidebarListCntr" data-dojo-attach-point="cntr">
            <div class="MatcToolbarLayerListScreenCntr">


                <div class="MatcLayerListScreens">
                    <div class=" MatcToolbarSectionContent">
                        <SchemaTree
                            :hasOptions="true"
                            :schema="schema" 
                            @edit="onEditVar" 
                            @change="onChangeVar"
                            @delete="onDeleteVar" 
                            @select="onSelect">
                        </SchemaTree>
                    </div>

                </div>
            </div>
        </div>

    </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import SchemaTree from './SchemaTree'
import NewVariableDialog from '../dialogs/NewVariableDialog'
import DeleteVariableDialog from '../dialogs/DeleteVariableDialog'
import DomBuilder from 'common/DomBuilder'
import * as SchemaUtil from '../../../core/SchemaUtil'

export default {
    name: 'DataList',
    props: ['value', 'includeMasterNodes'],
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            schema: {},           
            sidebarName: "Variables"
        }
    },
    components: {
        'SchemaTree': SchemaTree
    },
    methods: {
        postCreate() {
            this.logger = new Logger("DataList");
            this.logger.log(2, "constructor", "entry > " + this.mode);
            this.isDebug = location.href.indexOf('debug=true') >= 0
            this.db = new DomBuilder()
        },
        onHideSidebar() {
            this.toolbar.onHideSidebar()
        },
        setController(c) {
            this.controller = c;
        },

        onChangeVar (path, newName, defaultValue, type) {
            if (this.controller) {
                this.controller.renameSchemaVariable(path, newName, defaultValue, type)
            }
        },

        onEditVar (id, e) {

            const element = SchemaUtil.getElement(this.schema, id)
            if (!element) {
                return
            }

            const popup = this.db.div(" MatcDialogMShort  ").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(NewVariableDialog, {title: 'Edit Variable'});
            settings.placeAt(cntr)            
			settings.on("save", (path, defaultValue, type) => {
                this.onChangeVar(id, path, defaultValue, type)
                this.closeDialog()
            });
			settings.on('cancel',() => {
                this.closeDialog()
            });
            settings.on('error',() => {
                d.shake()
            });

            const d = this.canvas.createDialog();
			d.autoClose = false
			d.onOpen(() => {            
                const [part, parentPath] = SchemaUtil.splitPath(id)
                settings.show(this.schema, parentPath, part, element.defaultValue, element.type)
            });
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
        },

        closeDialog () {
            this.canvas.closeDialog()
        },

        onSelect (ids) { 
            this.selectedIDs = ids
        },

        getSelection() {
            return this.selectedIDs
        },

        onDeleteVar (path, e) {
            const widgets = this.getWidgetWithDataBindingPath(path)
            if (widgets.length > 0) {
                this.showDeleteDialog(widgets, path, e)
                return      
            }
            if (this.controller) {
                this.controller.deleteSchemaVariable(path)
            }
        },

        showDeleteDialog (widgets, path, e) {
    
            const popup = this.db.div(" MatcDialogMShortX  ").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(DeleteVariableDialog, {title: 'Delete Variable'});
            settings.placeAt(cntr)            
			settings.on("delete", () => {
                if (this.controller) {
                    this.controller.deleteSchemaVariable(path)
                }
                this.closeDialog()
            });
			settings.on('cancel',() => {
                this.closeDialog()
            });
      
            const d = this.canvas.createDialog();
			d.autoClose = false
			d.onOpen(() => {            
                settings.show(widgets)
            });
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
        },

        getWidgetWithDataBindingPath(path) {
            const result = []
            if (this.model) {
                for (let widgetId in this.model.widgets) {
                    const widget = this.model.widgets[widgetId]
                    if (widget?.props?.databinding) {
                        const databinding = widget?.props?.databinding
                        for (let key in databinding) {
                            const widgetPath = databinding[key]
                            if (widgetPath.indexOf(path) === 0) {
                                result.push(widget.name)
                            }
                        }
                    }
                }
            }
            return result
        },

        onCreateVar (path, defaultValue, type) {
            if (this.controller) {
                this.controller.createSchemaVariable(path, defaultValue, type)
            }
        },

        onCreateNew(e) {

            const popup = this.db.div(" MatcDialogMShort  ").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(NewVariableDialog, {title: 'New Variable'});
            settings.placeAt(cntr)
			settings.on("save", (path, defaultValue, type) => {
                this.onCreateVar(path, defaultValue, type)
                this.closeDialog()
            });
			settings.on('cancel',() => {
                this.closeDialog()
            });
            settings.on('error',() => {
                d.shake()
            });

			const d = this.canvas.createDialog();
			d.autoClose = false
			d.onOpen(() => {
                const name = this.selectedIDs ? this.selectedIDs[0] + '.' : null 
                settings.show(this.schema, "", name)
            });
	
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}

            this.logger.log(-2, "onCreateNew", "entry > ");
           
        },

        createVariable () {

        },

        setCanvas(c) {
            this.canvas = c;
        },

        setToolbar(t) {
            this.toolbar = t;
        },

        setModel(m) {
            this.model = m;
        },

        setSidebarName(name) {
            this.sidebarName = name
        },

        render(schema) {       
            this.schema = schema
        },


        hide() {
            this.isVisible = false
        },

        show() {
            this.isVisible = true
        }
    },
    watch: {
        value(v) {
            this.render(v)
        }
    },
    mounted() {
        if (this.value) {
            this.render(this.value)
        }
    }
}
</script>