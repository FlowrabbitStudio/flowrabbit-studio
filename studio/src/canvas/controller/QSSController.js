import Widget from './Widget'
import lang from '../../dojo/_base/lang';

export default class QSSController extends Widget{

	constructor () {
		super()
	}

	/**********************************************************************
	 * Update entire theme
	 **********************************************************************/

	updateTheme (value) {
		this.logger.log(-1,"updateTheme", "enter > ");

		this.startModelChange()

		/**
		 * make command
		 */
		const command = {
			timestamp : new Date().getTime(),
			type : "UpdateTheme",
			n: lang.clone(value),
			o: lang.clone(this.model.theme)
		}
		this.modelUpdateTheme(value)
		this.addCommand(command);
		this.render();
		this.commitModelChange()
		this.logger.log(-1,"updateTheme", "exit");
	}


	modelUpdateTheme (value) {
		this.model.theme = value
		this.onModelChanged([{type: 'theme', action:'update'}]);
	}

	undoUpdateTheme (command) {
		this.logger.log(-1,"undoUpdateTheme", "enter > ", command);
		this.modelUpdateTheme(command.o)
		this.render()
	}

	redoUpdateTheme (command) {
		this.logger.log(-1,"redoUpdateTheme", "enter > ", command);
		this.modelUpdateTheme(command.n)
		this.render();
	}

	/**********************************************************************
	 * Update single variable
	 **********************************************************************/

	updateThemeVariable (id, value, keys=[]) {
		this.logger.log(-1,"updateThemeVariable", "enter > " + id + " > "  + value, keys);

		this.startModelChange()

		if (!this.model.theme || !this.model.theme[id]) {
			return
		}

		const oldValues = {}
		const newValues = {}
		keys.forEach(k => {
			if (this.model.theme[k]) {
				const v = this.model.theme[k].value
				oldValues[k]=v
				newValues[k]=value
			} else {
				this.logger.error("updateThemeVariable", "ERROR > " + k);
			}
		})

		/**
		 * make command
		 */
		const command = {
			timestamp : new Date().getTime(),
			type : "UpdateThemeVariable",
			themeID: id,
			n: newValues,
			o: oldValues
		}
		this.modelUpdateThemeVariable(newValues)
		this.addCommand(command);
		this.render();
		this.commitModelChange()
		this.logger.log(-1,"unlinkDesignToken", "exit");
	}


	modelUpdateThemeVariable (values) {
		if (!this.model.theme) {
			return
		}

		for (let key in values) {
			if (this.model.theme[key]) {
				this.model.theme[key].value = values[key]
				this.onModelChanged([{type: 'theme', action:'update', id: key}]);
			}
		}
		this.onThemeChange()
	}

	undoUpdateThemeVariable (command) {
		this.logger.log(-1,"undoUpdateThemeVariable", "enter > ", command);
		this.modelUpdateThemeVariable(command.o)
		this.render()
	}

	redoUpdateThemeVariable (command) {
		this.logger.log(-1,"redoUpdateThemeVariable", "enter > ", command);
		this.modelUpdateThemeVariable(command.n)
		this.render();
	}

	onThemeChange () {
		if (this.toolbar) {
			this.toolbar.onThemeChange()
		}
	}
}