import QSSController from './QSSController'

import * as SchemaUtil from '../../core/SchemaUtil'
import RestUtil from '../../core/RestUtil'
import JSONPath from '../../core/JSONPath'
import lang from '../../dojo/_base/lang'
import DataBindingService from '../../services/DataBindingService';
import * as CollabUtil from './CollabUtil'
export default class Data extends QSSController {

    setData (data) {
        this.logger.log(1,"setData", "entry", data);
        this.data = data
        this.oldData = lang.clone(data)
    }

    /**
     * called after model is set into the controller
     */
    initSchema (model) {
        this.logger.log(1,"initSchema", "entry" );

        if (!this.data) {
            this.data = {}
        }
        if (!this.data.schema) {
            this.logger.log(2, "initSchema", "create Schema");
            this.data.schema = {}     
            this.oldData = lang.clone(this.data)
            this.fixMissingDataInSchema(model) 
            this.saveSchemaChanges()     
        } 
        this.oldData = lang.clone(this.data)        
		if(this.toolbar){
			this.toolbar.setSchema(this.data.schema);
		}
        
        this.renderSchema()
    }

    fixMissingDataInSchema(model) {
        const appData = model.data ? model.data : {}
        const variables = DataBindingService.getAllBindingPaths(model)
        let changeCount = 0
        variables.forEach(variable => {
            if (!SchemaUtil.exists(this.data.schema, variable)) {
                this.logger.debug("fixMissingDataInSchema", "add", variable );
                const value = JSONPath.get(appData, variable, "")
                SchemaUtil.updateSchemaPath(this.data.schema, variable, value)
                changeCount++
            }
        })
        if (changeCount > 0) {
            this.logger.debug("fixMissingDataInSchema", "update" );
        }
        // maybe send some server error
    }

    commitSchemaChange() {
        this.isSchemaDirty = true
        // save this chages, so we can pass them in the commitModelChanges
        // to the undo stack
        this._schemaChanges = this.saveSchemaChanges()
        this._schemaHasChanged = true

        this.saveDefaultDataChanges()
       
    }

    saveDefaultDataChanges() {
         // update model.data if need
         const newData = {}
         const defaultValues = SchemaUtil.getDefaultValues(this.data.schema)
         for (let key in defaultValues) {
             const value = defaultValues[key] 
             if (value !== undefined && value != null) {
                 JSONPath.set(newData, key, value)
             }
         }
        //  console.log("oldData", this.model.data)
        //  console.log("newData", newData)
         if (!this.objectEquals(newData, this.model.data)) {
             this.model.data = newData
             this.logger.log(1, "saveDefaultDataChanges", "Update app data", this.model.data);      
             this.onModelChanged([{type: 'data', action: 'update'}])
         }
    }

    saveSchemaChanges () {
        const changes = CollabUtil.getModelDelta(this.oldData, this.data)
        if (changes.length > 0) {
            this.logger.log(1, "saveSchemaChanges", "Save schema changes");
            this.modelService.updateDataByApp(this.model.id, changes).then(res => {
                this.onSchemaUpdated(res);
            }).catch(err => {
                this.logger.error("saveModelChanges", "Something wenrt wrong with the rest", err);
                this.showError("Could not reach server! Changes not saved!");
            })
        }
        return changes
    }

    onSchemaUpdated (){
        this.logger.log(1,"onSchemaUpdated", "entry" );
        this.oldData = lang.clone(this.data)
        this.isSchemaDirty = false
        this.showSuccess("ViewModel Saved!");
    }

    renderSchema() {
        this.logger.log(2,"renderSchema", "entry" );
        if (this._canvas) {
            const copy = structuredClone(this.data.schema)
			this._canvas.renderSchema(copy)
		}
    }

	/**********************************************************************
	 * Create variable
	 **********************************************************************/
    createSchemaVariable (path, defaultValue, type) {
        this.logger.log(-1,"createSchemaVariable", "entry > path: " + path + " > type: " + type, defaultValue );
        const v = this.convertDefaultValue(defaultValue, type)
        const command = {
			timestamp : new Date().getTime(),
			type : "CreateSchemaVariable",
			path : path,
            defaultValue: v,
            defaultType: type
		};
        this.startModelChange()	
        this.dataCreateVariable(path, v, type)
        this.addCommand(command);
        this.commitModelChange()
    }

    convertDefaultValue (defaultValue, type) {
        if (type !== 'string') {
            return SchemaUtil.convertDefaultValue(defaultValue)
        }
        return defaultValue
    }

	dataCreateVariable (path, defaultValue, type) {	
        SchemaUtil.updateSchemaPath(this.data.schema, path, defaultValue, type)
        this.renderSchema()
        this.commitSchemaChange()
	} 


	redoCreateSchemaVariable(command) {
		this.logger.log(-3,"redoCreateSchemaVariable", "enter > " + command.id);
		this.dataCreateVariable(command.path, command.defaultValue);
	}

	undoCreateSchemaVariable(command) {
		this.logger.log(-3,"undeUpdateDataBinding", "enter > " + command.id);
		this.dataDeleteVariable(command.path, command.defaultValue);
        this.render()
	}

    /**********************************************************************
	 * Delete variable
	 **********************************************************************/
    

    deleteSchemaVariable (path) {
        this.logger.log(-1,"deleteSchemaVariable", "entry", path);        
        this.startModelChange()	

        const element = SchemaUtil.getElement(this.data.schema, path)
        const defaultValue = element ?  element.defaultValue : undefined
        const command = {
			timestamp : new Date().getTime(),
			type : "DeleteSchemaVariable",
			path : path,
            defaultValue: defaultValue
		};
        this.dataDeleteVariable(path)
        this.addCommand(command);
        // render because we might update widgets
        this.render()
        this.commitModelChange()
    }


	dataDeleteVariable (path) {	
        SchemaUtil.deleteElement(this.data.schema, path)

        for (let widgetId in this.model.widgets) {
            const widget = this.model.widgets[widgetId]
            if (widget?.props?.databinding) {
                const databinding = widget?.props?.databinding
                for (let key in databinding) {
                    const widgetPath = databinding[key]
                    if (widgetPath.indexOf(path) === 0) {
                        this.logger.log(-2,"dataDeleteVariable", "delete databinding: " + widgetPath + " in " + widgetId);
                        delete databinding[key]
                    }
                }
            }
        }

        this.renderSchema()
        this.commitSchemaChange()
	} 

	redoDeleteSchemaVariable(command) {
		this.logger.log(-3,"redoCreateSchemaVariable", "enter > " + command.id);
		this.dataDeleteVariable(command.path);
        this.render()
	}

	undoDeleteSchemaVariable(command) {
		this.logger.log(-3,"undoDeleteSchemaVariable", "enter > " + command.id);
		this.dataCreateVariable(command.path, command.defaultValue);
        this.render()
	}


    /**********************************************************************
	 * Rename variable
	 **********************************************************************/
    renameSchemaVariable(path, newName, defaultValue, type) {
        this.logger.log(-1,"renameSchemaVariable", "entry " +  path + " > "  + newName + " > type: " + type, defaultValue);    

        if (!newName) {
            this.logger.error("renameSchemaVariable", "empty name");    
            return
        }

        defaultValue = this.convertDefaultValue(defaultValue)
  
        const element = SchemaUtil.getElement(this.data.schema, path)
        if (!element) {
            return
        }
        const oldDefault = element.defaultValue
        const oldType = element.type
        const [oldName, parentPath] = SchemaUtil.splitPath(path)
        const newPath = parentPath ? `${parentPath}.${newName}` : newName

        const command = {
			timestamp : new Date().getTime(),
			type : "RenameSchemaVariable",
			path : path,
            name: newName,
            defaultValue: defaultValue,
            defaultType: type,
            undoPath: newPath,
            undoName: oldName,
            undoDefaultValue: oldDefault,
            undoType: oldType
		};
        this.startModelChange()
        this.dataRenameVariable(path, newName, defaultValue, type)
        this.addCommand(command);
        // render because we might update widgets
        this.render()
        this.commitModelChange()
    }

    dataRenameVariable (oldPath, newName, defaultValue, type) {
        const element = SchemaUtil.getElement(this.data.schema, oldPath)
        if (!element) {
            return
        }
        if (defaultValue !== undefined && defaultValue !== null) {
            element.defaultValue = defaultValue
        }
        if (type) {
            element.type = type
        }
        let changes = []
        const newPath = SchemaUtil.renameElement(this.data.schema, oldPath, newName)
        if (newPath) {
      
            for (let id in this.model.widgets) {
                const widget = this.model.widgets[id]
                if (widget?.props?.databinding) {
                    const databinding = widget?.props?.databinding
                    for (let key in databinding) {
                        const widgetPath = databinding[key]
                        const newWidgetPath = SchemaUtil.updateVariable(widgetPath, oldPath, newPath)
                        if (newWidgetPath) {            
                            databinding[key] = newWidgetPath
                            changes.push({type: 'widget', action:"change", id: widget.id})
                        }
                    }
                }
            }
            this.onModelChanged(changes)
            if (changes.length > 0) {
                this.logger.log(-1,"dataRenameVariable", "Change widgets: " + changes.length);
                // we do not call setDirty, because the setDirty will be called later when the
                // commitModelChanges is called
                //this.setDirty()             
            }

        } else {
            this.logger.warn("dataRenameVariable", "no new path");
        }

        this.renderSchema()
        this.commitSchemaChange()
        return changes > 0
	} 

	redoRenameSchemaVariable(command) {
		this.logger.log(-3,"redoRenameSchemaVariable", "enter > " + command.id);
		this.dataRenameVariable(command.path, command.name, command.defaultValue, command.defaultType);
        this.render()
	}

	undoRenameSchemaVariable(command) {
		this.logger.log(-3,"undoRenameSchemaVariable", "enter > " + command.id);
		this.dataRenameVariable(command.undoPath, command.undoName, command.undoDefaultValue, command.undoType);
        this.render()
	}

    /**********************************************************************
	 * PropertyChanges
	 **********************************************************************/

    getSchemaChanges (widget, props, type) {
        const changes = []
        if ('props' === type) {
            const schema = this.data.schema
            const temp = DataBindingService.getDefautlBindings(widget)
            const defaultTypes = {}
            temp.forEach(t => {
                defaultTypes[t.value] = t
            })
            if (props['databinding']) {
                this.logger.log(3,"getSchemaChanges", "databinding", props.databinding);
                const values = props['databinding']
                // create variables for all variables
                for (let key in values) {
                    const variable = values[key]
                    if (!SchemaUtil.exists(schema,variable)) {
                        // here we have some smart logic
                        // that can make for instance 'default' for tables
                        // an array
                        let dataType = 'string'
                        if (defaultTypes[key] && defaultTypes[key].type) {             
                            dataType = defaultTypes[key].type
                        }
                        changes.push({type: 'add', path: variable, 'dataType': dataType})
                    }
                }

                // check if the widget is a Table or Repeater
                // and if they have an output, deduct the schema
                if (widget.type === 'Table' || widget.type === 'Repeater') {
                    if (values['default'] && values['output']) {
                        const inputVariable = values['default']
                        const outputVariable = values['output']

                        // we do not check if we overwrite something here??
                        if (SchemaUtil.exists(schema, inputVariable)) {
                            const childPaths = SchemaUtil.getChildPaths(schema, inputVariable)
                            childPaths.forEach(p => {
                                const outputVariableChildVariable = `${outputVariable}.${p}`
                                if (!SchemaUtil.exists(schema,outputVariableChildVariable)) {
                                    changes.push({type: 'add', path: outputVariableChildVariable})
                                }
                            })            
                        }
                    }
                }

    
                // some widgets might return complex types, e.g.
                // the geo location
                if (values['default']) {
                    const defaultVariable = values['default']
                    const outputSchema = SchemaUtil.getOutputSchema(widget)
                    if (outputSchema) {
                        outputSchema.forEach(p => {
                            const outputVariableChildVariable = `${defaultVariable}.${p}`
                            if (!SchemaUtil.exists(schema,outputVariableChildVariable)) {
                                changes.push({type: 'add', path: outputVariableChildVariable})
                            }
                        })  
                    }
                }

            }
            if (props['rest']) {
                this.logger.log(-3,"getSchemaChanges", "rest");
                const rest = props['rest']
                const variables = RestUtil.getAllVariables(rest)
                variables.forEach(variable => {
                    if (!SchemaUtil.exists(schema,variable)) {
                        changes.push({type: 'add', path: variable})
                    }
                })
                if (rest?.props?.output?.hints) {
                    delete rest.props.output.hints
                }
            }
            if (props['api']) {
                this.logger.log(-3,"getSchemaChanges", "api");
                const api = props.api
                if (api.output && api.output.hints) {
                    const hints = api.output.hints
                    const variables = RestUtil.getHints(hints)
                    variables.forEach(variable => {
                        if (!SchemaUtil.exists(schema,variable)) {
                            changes.push({type: 'add', path: variable})
                        }
                    })
                }    
                if (api?.props?.output?.hints) {
                    delete api.props.output.api
                }        
            }

            if (props['script']) {
                this.logger.log(-3,"getSchemaChanges", "script");
                const script = props['script']
                const variables = this.extractDataVariables(script).map(variable => {
                    return variable.replace(/data\./, '')
                }).filter(v => v.length > 0 && v !== 'data')
                variables.forEach(variable => {
                    if (!SchemaUtil.exists(schema,variable)) {
                        changes.push({type: 'add', path: variable})
                    }
                })
            }
        }

        return changes
	}

    extractDataVariables(script) {
        const variableRegex = /\bdata(?:\.[a-zA-Z_$][\w$]*)*/g;
        const matches = script.match(variableRegex) || [];
        return [...new Set(matches)];
    }
    


    dataApplySchemaChanges(changes, isUndo=false) {
        if (!changes) {
            return
        }
        this.dateExceuteSchemaChanges(changes, isUndo)
        if (changes.length > 0) {
            this.commitSchemaChange()
        }
    }

    dateExceuteSchemaChanges (changes, isUndo=false) {
        if (!changes) {
            return
        }
        const schema = this.data.schema
        changes.sort((a, b) => {
            return b.path.length - a.path.length
        })
        changes.forEach(change => {
            console.log("change", change)
            if (!isUndo) {
                this.logger.log(-1,"dataApplySchemaChanges", "add: " + change.path + " > " + change.dataType);
                // the order of the elements might be messed up.
                // we do not want shorter paths to overwrite parent paths
                if (!SchemaUtil.exists(schema, change.path)) {
                    SchemaUtil.updateSchemaPath(schema, change.path, null, change.dataType)
                }
  
            } else {
                this.logger.log(-1,"dataApplySchemaChanges", "remove: " + change.path);
                SchemaUtil.deleteElement(schema, change.path)
            }
        })
        if (changes.length > 0) {
            this.renderSchema()
        }
    }




}