import RestUtil from "../core/RestUtil";
class DataBindingService {

	constructor () {
		this.emitsObjectData = new Set()
		this.emitsObjectData.add("Table")
		this.emitsObjectData.add("Repeater")
	}

	isArrayDataBindingWidget(widget) {
		const type = widget.type
		return type === 'Repeater' || type === 'Table'
	}

	getHintsAppVariables (model){
		console.error('getHintsAppVariables() ')
		const variables = [];
		if (model) {
		  for(let id in model.widgets){
			const widget = model.widgets[id];
			// the rest widget save at some oher place
			if(widget.props && widget.props.rest && widget.props.rest.output){
			  const hints = widget.props.rest.output.hints;
			  if (hints) {
				RestUtil.getHints(hints).forEach(variable => {
					if(variables.indexOf(variable)<0){
					  variables.push(variable);
					}
				})
				// for (let key in hints) {
				//   if (key) {
				// 	variables.push(key.replace(/_/g, '.'))
				//   }           
				// }
			  }
			}
			if (widget.props && widget.props.api && widget.props.api.output) {
			  const hints = widget.props.api.output.hints
			  if (hints) {
				RestUtil.getHints(hints).forEach(variable => {
					if(variables.indexOf(variable)<0){
					  variables.push(variable);
					}
				})
				// for (let key in hints) {
				//   if (key) {
				// 	variables.push(key.replace(/_/g, "."))
				//   }
				// }
			  }
			}
  
		  }
		}

		return variables;
	}
  

	getAllBindingPaths(model, hintType) {
		const variables = []
		if (model) {
			for (let id in model.widgets) {
				const widget = model.widgets[id]
				// the rest widget save at some oher place
				if (widget.props && widget.props.rest && widget.props.rest.output && widget.props.rest.output.hints) {
					const hints = widget.props.rest.output.hints
					RestUtil.getHints(hints, hintType).forEach(variable => {
						if(variables.indexOf(variable)<0){
						  variables.push(variable);
						}
					})
                }

				if (widget.props && widget.props.rest) {
					RestUtil.getRestInputBindings(widget.props.rest).forEach(variable => {
						if(variables.indexOf(variable)<0){
						  variables.push(variable);
						}
					})
				}

				if (widget.props && widget.props.api && widget.props.api.output && widget.props.api.output.hints) {
					let hints = widget.props.api.output.hints
					RestUtil.getHints(hints, hintType).forEach(variable => {
						if(variables.indexOf(variable)<0){
						  variables.push(variable);
						}
					})
                }

                if(widget.props && widget.props.databinding){
                    let databinding = widget.props.databinding;
                    for(let key in databinding){
                        let variable = databinding[key];
                        if(variables.indexOf(variable)<0){
                        	variables.push(variable);
                        }
                    }
                }
                // the rest widget save at some oher place
                if(widget.props && widget.props.rest && widget.props.rest.output){
                    let variable = widget.props.rest.output.databinding
                    if(variables.indexOf(variable)<0){
                        variables.push(variable);
                    }
                }
			}
        }

		return variables
	}

	

	getDefautlBindings(widget) {
		if (widget && widget.type === "Table") {
			return [
				{ label: "Input", value: "default", hint: "The data to show in the table", type:'array' },
				{ label: "Selected", value: "output", hint: "The element(s) the user has clicked on or selected", type:'object' },
				{ label: "Filter", value: "filter" , hint: "The search varibale that will be used to filter the table data"},
				{ label: "Pagination Count", value: "paginationCount", hint: "The number of pages will be send out, e.g. to a Pagination element" },
				{ label: "Pagination Position", value: "paginationPosition", hint: "The current page to show"}
			]
		}
		if (widget && widget.type === "Repeater") {
			return [
				{ label: "Input", value: "default", hint: "The list of elements to repeat", type:'array' },
				{ label: "Selected", value: "output" , hint: "The element that the user has clicked on", type:'object'}
			]
		}
		if (widget && widget.type === "LabeledImageList") {
			return [
				{ label: "Images", value: "input", hint: "An array of image URLs" },
				{ label: "Selected", value: "output" , hint: "The list of selected images"},
				{ label: "Text", value: "text" , hint: "The concatenated text of the selected descriptions"},
			]
		}
		if (widget && widget.type === "Paging") {
			return [
				{ label: "# Elements", value: "input", hint: "The number of elements" },
				{ label: "Selected", value: "output" , hint: "The current selected element"},
			]
		}
		if (widget && widget.type === "Chat") {
			return [
				{ label: "All Messages", value: "default" , hint: "Includes all messages exchanged within the chat, whether they come from an Assistant, ChatGPT, or user input. This variable is useful for capturing the entire conversation context."},
				{ label: "Input Message", value: "output", hint: "Refers to the user’s input message that is sent to the Language Model (e.g., GPT). You can use this variable in the 'Prompt' field of a 'Text AI' widget to pass user-provided data for processing."},
				{ label: "Output Message", value: "input" , hint: "Represents the response message generated by the Language Model (e.g., GPT). Use this variable in the 'Output' field of a connected 'Text AI' widget to display or utilize the model’s reply."},
				{ label: "System Prompts", value: "system" , hint: "Contains pre-defined prompts or instructions configured in the dropdown menu. These can be added to the 'System' field of a connected 'Text AI' widget to guide or modify the behavior of the model."},
				{ label: "Audio", value: "file" , hint: "Represents audio files captured via the 'Record Audio' feature. You can use this variable to process or transcribe audio inputs in your workflow."}
			]
		}
		if ([widget && "TypeAheadTextBox", "DropDown", "MobileDropDown", "CheckBoxGroup", "RadioGroup", "Timeline"].indexOf(widget.type) >= 0) {
			return [
				{ label: "Selected Option(s)", value: "default" },
				{ label: "List of Options", value: "options", hint: "The list of options to be shown" },
			]
		}
		if (widget && widget.type === "SegmentButton") {
			return [
				{ label: "Selected Option(s)", value: "default" }
			]
		}
		if (widget && widget.type === "API") {
			return [
				{ label: "Output", value: "default" }
			]
		}
		if (widget && widget.type === "Button") {
			return [
				{ label: "Loading", value: "default" }
			]
		}

		return [{ label: "Value", value: "default" }]
	}

	hasObjectOutput(widget) {
		return this.emitsObjectData.has(widget.type)
	}

	getActionTypes (widget) {
		const result =  []

		// As rest widgets have the data binding hidden in the URL, template or
		// the output, the DataBindingUtil in martello_apps will create a fake
		// databinding that will map:
		//
		// - rest.output.databinding => default
		// - rest.input.template => template
		//
		// If the template has more than one varibale it will take the last!!

		if (widget.type === 'Chat') {
			result.push({ 
				value: "llm", 
				label: "Send Input",
				icon: "mdi mdi-contain-end",
				action: "llm", 
				targets: ['AIRest', 'OpenAIAssistant', 'API'],
				databinding: {type: 'inputOutput', variables: {"input" : "default", "output": "template"}}
			})
			result.push({ 				
				value: "transcription", 
				label: "Send Audio Record",
				icon: "mdi mdi-microphone",
				action: "transcription", 
				targets: ['AIRest'],
				databinding: {type: 'inputOutput', variables: {"input" : "file", "output": "template"}}			
			})
		}

		if (widget.type === 'Repeater') {
			result.push({ 
				value: "click", 
				label: "Click", 
				action: "ElementClick", 
				icon: "mdi mdi-cursor-default"
			})
			result.push({ 
				value: "loaded", 
				label: "Loaded", 
				action: "Loaded",
				targets: ['Rest', 'API'],
				icon: "mdi mdi mdi-progress-download",
				databinding: {type: 'rest', variables: {'default': 'default'}}
			})
			result.push({ 
				value: "search", 
				label: "Search", 
				action: "Search", 
				targets: ['TextBox'],
				icon: "mdi mdi-magnify",
				databinding: {type: 'filter', variables: {'filter': 'default'}}
			})

			result.push({ 
				value: "pagination", 
				label: "Pagination", 
				action: "Pagination", 
				targets: ['Paging'],
				icon: "mdi mdi-table-arrow-right",
				databinding: {type: 'pagination', variables: {
					'paginationCount': 'input',
					'paginationPosition': 'output'
				}}
			})

		}

		if (widget.type === 'Table') {
			result.push({ 
				value: "click", 
				label: "Click", 
				action: "RowClick", 
				icon: "mdi mdi-cursor-default"
			})

			result.push({ 
				css: 'MatcToolbarDropDownButtonLine'
			})

			result.push({ 
				value: "loaded", 
				label: "Loaded", 
				action: "TableLoad",
				targets: ['Rest', 'API'],
				icon: "mdi mdi mdi-progress-download",
				databinding: {type: 'rest', variables: {'default': 'default'}}
			})

			result.push({ 
				value: "search", 
				label: "Search", 
				action: "Search", 
				targets: ['TextBox'],
				icon: "mdi mdi-magnify",
				databinding: {type: 'filter', variables: {'filter': 'default'}}
			})

			result.push({ 
				value: "pagination", 
				label: "Pagination", 
				action: "Pagination", 
				targets: ['Paging'],
				icon: "mdi mdi-table-arrow-right",
				databinding: {type: 'pagination', variables: {
					'paginationCount': 'input',
					'paginationPosition': 'output'
				}}
			})
		}

		if (widget?.props?.tableActions) {
			result.push({ 
				css: 'MatcToolbarDropDownButtonLine'
			})
		
			const actions = widget.props.tableActions
			actions.forEach(action => {
				result.push({ 
					value: `click`, 
					action:action.id, 
					label: action.label, 
					icon: "mdi mdi-database-import-outline"
				})
			})
		}

		return result
	}
}

export default new DataBindingService()
