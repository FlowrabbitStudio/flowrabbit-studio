
<template>
	<div class="VommondRadioBoxList"></div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import RadioBox from 'common/RadioBox'

export default {
	name: 'RadioBoxList',
	mixins: [DojoWidget],
	props: ['qOptions', 'qValue', 'qCols', 'qCustom', 'qPlaceholder'],
	data: function () {
		return {
			value: false,
			options: ""
		}
	},
	components: {},
	methods: {
		postCreate() {
			if (this.options) {
				var list = this.options.split(",");
				this.options = [];
				for (var i = 0; i < list.length; i++) {
					this.options.push({
						value: list[i],
						label: list[i]
					});
				}
				this.render(this.options);
			}
			//this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
		},


		setOptions(options) {
			this.options = options;
			this.render(options);
		},

		render(options) {

			const cntr = document.createElement("div");
			if (this.qCols) {
				css.add(cntr, 'VommondRadioBoxListCol' + this.qCols)
			}
			this.radios = {};
			for (let i = 0; i < options.length; i++) {
				const option = options[i];
				const row = document.createElement("div");
				css.add(row, "VommondRadioBoxListItem");
				const radio = this.$new(RadioBox);
				radio.placeAt(row);
				this.radios[option.value] = radio;

				const lbl = document.createElement("span");
				lbl.innerHTML = option.label;
				css.add(lbl, "VommondRadioBoxLabel");
				row.appendChild(lbl);
				cntr.appendChild(row);
				this.own(on(row, touch.press, lang.hitch(this, "onChange", option)));
			}
			this.domNode.appendChild(cntr);
			if (this.qCustom) {
				const row = document.createElement("div");
				css.add(row, "VommondRadioBoxListItem VommondRadioBoxListItemCustom");
				const radio = this.$new(RadioBox);
				radio.placeAt(row);
		
				const input = document.createElement("input");
				input.placeholder = this.qPlaceholder
				css.add(input, "form-control");
				this.own(on(input, "change", lang.hitch(this, "onChangeCustom")));

				row.appendChild(input);
				this.domNode.appendChild(row);
				this.own(on(row, touch.press, lang.hitch(this, "onCustom")));
				this.customRadio = radio
				this.customInput = input
			}
		},

		onChangeCustom () {
			const value = this.customInput.value
			this.setValue(value)
			this.emit("changeCustom", this.value);
		},

		onCustom () {
			this.isCustom = true
			this.setValue('')
		},

		onChange(option) {
			this.isCustom = false
			this.setValue(option.value);
			this.emit("change", this.value);
		},

		getValue() {
			return this.value;
		},

		setValue(value) {
			this.value = value;
			let found = false
			for (let i = 0; i < this.options.length; i++) {
				const option = this.options[i];
				const radio = this.radios[option.value];
				if (value == option.value) {
					radio.setValue(true);
					found = true
				} else {
					radio.setValue(false);
				}
			}
			if (this.customRadio) {
				this.customRadio.setValue(this.isCustom);				
			}
			if (this.customInput && !found) {
				this.customInput.value = value
			}
		}
	},
	mounted() {
		if (this.qOptions) {
			this.setOptions(this.qOptions)
		}
		if (this.qValue) {
			this.setValue(this.qValue)
		}
	}
}
</script>