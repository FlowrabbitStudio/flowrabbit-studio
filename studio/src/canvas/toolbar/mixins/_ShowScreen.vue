<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import _Tooltip from 'common/_Tooltip'
import QSS from 'core/QSS'
import lang from 'dojo/_base/lang'

export default {
    name: '_Show',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
			colorWidgets: []
      }
	},
    components: {},
	computed: {
	},
    methods: {

		/*****************************************************************************************************
		* screen properties
		****************************************************************************************************/

		showScreenProperties (model){
			this.logger.log(0,"showScreenProperties", "entry");


			this.showProperties();

			if (this.isDataView) {
				return this.showScreenDataProperties(model)
			}


			if (this.isDesignView) {
				this.showScreenDesignProperties(model)
			}

			if (this.isPrototypeView) {
				this.showScreenPrototypeProperties(model)
			}


			this.restorePropertiesState();

			this.logger.log(2,"showScreenProperties", "exit");
		},

		showScreenPrototypeProperties (model) {
				this.logger.log(-1,"showScreenPrototypeProperties", "entry");

				if(model.name){
					this.screenName.value = model.name;
				} else {
					this.screenName.value = "";
				}
				this.screenName.blur();

				css.add(this.screenSize.domNode, 'MatcHidden')
				css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");

				if(this.screenActionDiv){
					css.remove(this.screenActionDiv, "MatcToolbarSectionHidden");
					this.screenActionBTN.setScreen(model);
				}
				
		},

		showScreenDesignProperties (model) {

				this.showDesignTokenBtns(model, 'screen')

				if(this.screenDIV){
					css.remove(this.screenDIV, "MatcToolbarSectionHidden");
				}

				css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenBackDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenImageDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenParentsDiv, "MatcToolbarSectionHidden");
				css.remove(this.screenDownloadDiv, "MatcToolbarSectionHidden");

				if(this.screenAnimationDiv){
					css.remove(this.screenAnimationDiv, "MatcToolbarSectionHidden")
				}
				
				const theme = this.model.theme
				if (theme) {
					model = QSS.replaceVariables(theme, lang.clone(model))
				}

				const style = model.style;
		
				if (style) {
					this.screenBackgroundImage.setValue(style.backgroundImage);
					this.screenBackgroundImage.setModel(this.model);
					this.screenBackgroundColor.setValue(style.background);
					this.screenBackgroundColor.setBox(model)

					if(style.overlay){
						css.remove(this.overlayOptions, "hidden");
					} else {
						css.add(this.overlayOptions, "hidden");
					}
					this.screenFixedOverlayCheckBox.setValue(style.fixed);
					this.screenBlurOverlayCheckBox.setValue(style.blur);
					this.screenBackgroundOverlayCheckBox.setValue(style.hasBackground);
				} else {
					console.warn("_Render.showScreenProperties() > No Style", model)
				}

				this.screenParentList.setPage(this.currentPage)
				this.screenParentList.setScreen(model);
				//this.childWidget.setScreen(model);

				if(model.name){
					this.screenName.value = model.name;
				} else {
					this.screenName.value = "";
				}
				this.screenName.blur();

				if(this.screenDownLoad) {
					css.remove(this.screenDownLoad.domNode, "MatcHidden")
					this.screenDownLoad.setModel(this.model, model.id);
				}
				if(this.screenExport) {
					this.screenExport.setScreen(model, model.id);
				}

				if(this.screenSize){
					css.remove(this.screenSize.domNode, 'MatcHidden')
					this.screenSize.setModel(this.model);
					this.screenSize.setValue(model);
				}

		},


		showScreenDataProperties (model) {
			this.showProperties();

			if(model.name){
				this.screenName.value = model.name;
			} else {
				this.screenName.value = "";
			}
			this.screenName.blur();

			css.add(this.screenSize.domNode, 'MatcHidden')
			css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.callBackDiv, "MatcToolbarSectionHidden")
			this.callbackSection.setValue(model, 'screen')			
		}		
    },
    mounted () {
    }
}
</script>