
<template>
	<div :class="['MatcOptionList', {'MatcOptionListNoDefault' :! hasDefaultValues}]">
		<table>
			<tbody>
                    <tr class="" v-for="(option,i) in options" :key="option"
							:class="[{'MatcFormRowDNDHover': i === hoverRow}, {'MatcFormRowDNDSelect': i == dragRow}]"
							:draggable="isDraggable"
							@dragstart="onDragStart($event, i)"
							@dragover="onDragOver($event, i)"
							@dragleave="onDragLeave($event, i)"
							@drop="onDrop($event, i)"
						>
                        <td class="MatcDialogTableSelectCntr">
                            <div class="MatcFormRowDND">    
								<span class="mdi mdi-drag-vertical"  @mouseover="isDraggable = true" @mouseout="isDraggable = false" ></span>      
                                <CheckBox :value="option === selected" @change="onCheckBoxChange(i, option)" v-if="hasSelection"/>
                            </div>
                        </td>                 
                       
                        <td >
							<input class="form-control" :value="option" @keyup="onChangingOption($event, i, option)" @change="onOptionChange($event, i, option)" ref="inputs"/>
                        </td>

						            
                        <td class="MatcDataBindingVariableDefault" v-if="hasDefaultValues">
							<input 
								placeholder="Optional data value"
								class="form-control" 
								:value="optionValues[i]"
								@keyup="onChangingOptionValue($event, i, optionValues[i])" 
								@change="onOptionChangeValue($event, i, optionValues[i])" 
								ref="valueInputs"/>
                        </td>
                       
						<td class="">           
							<div class="MatcFormRowRemove">
								<span class="mdi mdi-close"  @click="removeOption(i, option)" ></span>   
							</div>
							        
  
                        </td>
                    </tr>

                    <tr>
                        <td class="MatcDialogTableSelectCntr">
                           
                        </td>                 
                       
                        <td :colspan="hasDefaultValues ? 2 : 1">
							<input class="form-control MatcOptionListInputNew" placeholder="Create a new value" v-model="newValue" @change="onNewOption()"/>
                        </td>

						<td class="MatcFormRowRemove">                   
                        	
                        </td>
                    </tr>
                 </tbody>
		</table>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import Logger from 'common/Logger'
import CheckBox from 'common/CheckBox'
import DomBuilder from 'common/DomBuilder'

export default {
	name: 'OptionsList',
	mixins: [DojoWidget],
	data: function () {
		return {
			dragRow: -1,
			hoverRow: -1,
			selected: false,
			isDraggable: false,
            newValue: '',
			options: [],
			optionValues: [],
			inline: true,
			placeholder: "Enter a new value",
			removeIcon: "mdi mdi-close-circle",
			remove: true,
			check: "none",
			add: true,
			newValueMessage: "Enter a value",
			checkNewOption: false,
			edit: true,
			hasDefaultValues: true,
			hints: []
		}
	},
	components: {
		'CheckBox': CheckBox
	},
	computed: {
		hasSelection() {
			return this.check !== 'none'
		},
	},
	methods: {
		postCreate() {
			this.log = new Logger("InputList");
			this.db = new DomBuilder();
		},

		setHints(h) {
			this.log.log(-1, "setHints()", "enter", h)
			this.hints = h
		},

		setSelected(checked) {
			this.selected = checked;
		},

		blur() {
			
		},

		getSelected() {
			this.blur();
			return this.selected;
		},

		setOptions(o) {
			this.options = lang.clone(o);
		},

		setOptionValues(v) {
			if (v) {
				this.optionValues = lang.clone(v)
			}
		},

		getOptions() {
			if (this.newValue) {
                const newValue = this.stripHTML(this.newValue)
				this.options.push(newValue);
                this.selected = newValue
			}
			return this.options;
		},

		getOptionsValues () {
			console.debug(this.optionValues)
			return this.optionValues
		},

		isSelected(option) {
			return this.selected === option;
		},

		getLabel(option) {
			let result = option;
			if (this.labelFCT) {
				result = this.labelFCT(option);
			}
			return this.unStripHTML(result);
		},

		onDragStart(e, i) {
			e.dataTransfer.setData("text", i);
			e.dataTransfer.effectAllowed = 'move';
			this.dragRow = i
		},

		onDrop(e, i) {
			e.preventDefault();
			const data = e.dataTransfer.getData("text");
			const j = data * 1
			if (this.options[i] && this.options[j]) {
				let temp = this.options[i]
				this.options[i] = this.options[j]
				this.options[j] = temp

				temp = this.optionValues[i]
				this.optionValues[i] = this.optionValues[j]
				this.optionValues[j] = temp
			}
			this.dragRow = -1
			this.hoverRow = -1
		},

		onDragOver(e, i) {
			e.preventDefault();
			this.hoverRow = i
		},

		onDragLeave () {
			this.hoverRow = -1
		},

		setLabelFct(fct) {
			this.labelFCT = fct;
		},

        onChangingOption (e, i,) {
            const input = e.target;
            const newValue = this.stripHTML(input.value);
            this.options[i] = newValue
        },

		onOptionChange (e, i, oldvalue) {
			const input = e.target;
            const newValue = this.stripHTML(input.value);
            this.options[i] = newValue
            if (this.isSelected(oldvalue)) {
                this.selected = newValue
            }
		},


        onChangingOptionValue (e, i,) {
            const input = e.target;
            const newValue = this.stripHTML(input.value);
            this.optionValues[i] = newValue
        },

		onOptionChangeValue (e, i) {
			const input = e.target;
            const newValue = this.stripHTML(input.value);
            this.optionValues[i] = newValue
		},



		onCheckBoxChange(j, option) {
			if (this.isSelected(option)) {
				this.selected = null;
			} else {
				this.selected = this.options[j];
			}
		},

		cleanUp() {
		},

		onNewOption() {
			if (this.newValue) {
                const newValue = this.stripHTML(this.newValue)
				this.options.push(newValue);
                this.selected = newValue
			}
            this.newValue = ''
		},

		removeOption (i, option) {
			if (this.isSelected(option)) {
				this.selected = false;
			}
			this.options.splice(i, 1);
		},

		destroy () {
		}
	},
	mounted() {
	}
}
</script>