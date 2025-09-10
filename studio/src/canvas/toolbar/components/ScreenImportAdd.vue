
<template>
     <div class="MatcToolbarItem MatcMultiIcon MatcScreenImportAdd MatcToolbarDropDownButton" @click="onAddScreen">
		<div type="button" data-dojo-attach-point="button">
			<label data-dojo-attach-point="label" class="">
				<span data-dojo-attach-point="icon" class=""></span>
				<!-- <span class="mdi mdi-plus-circle MatcTinyIcon MatcTinyIconAnimated"></span> -->
			</label>
			</div>			
		</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import topic from 'dojo/topic'
import Util from 'core/Util'
import RenderFactory from 'core/RenderFactory'

export default {
    name: 'ScreenImportAdd',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            screenWidth: 300,
            screenHeight: 600,
            selectedCategory: "Screen",
            showSubCatgeoryLabels: false,
			previewSizes : {
				"default" : {
					w : 120,
					h : 70
				},
				"Screen" : {
					w : 160,
					h : 200
				}
			}
        }
    },
    components: {},
    methods: {
			setModel (m){
				this.model = m;
				this.screenWidth = m.screenSize.w;
				this.screenHeight = m.screenSize.h;
				this.renderFactory = new RenderFactory();
				this.renderFactory.setModel(m);
				this.renderFactory.setSourceModel(m);
				css.add(this.icon, 'mdi mdi-shape-square-plus');
			},


			onAddScreen (e){
				this.stopEvent(e);
				var screen = this.createEmptyScreen(0,0,"Screen");
				screen._type = "Screen";	
				this.emit("onAdd", screen,e);
			},


			onFilesSelected (files,e){
				this.logger.log(0,"onFilesSelected", "enter" );
				topic.publish("matc/canvas/startupload", files, e);
				this.hideDropDown();
			},


			setInfo (txt){
				if(this.help){
					css.remove(this.help, "MatcError");
					this.help.innerHTML=txt;
				}

			},

			onError (txt){
				if(this.help){
					css.add(this.help, "MatcError");
					this.help.innerHTML=txt;
				}
			}
    },
    mounted () {
    }
}
</script>