
<template>
    <div class="MatcToolbar" @dblclick="onDoubleClick">
    </div>

</template>

<script>


export default {
 name: 'Actions',
   mixins:[],
   props:[],
   data: function () {
       return {
    
       }
   },
   components: {
   },
   computed: {

   },
   methods: {
    onToolRemoveTemplate (e) {
			this.logger.log(1,"onToolRemoveTemplate", "entry : " + this._selectedWidget);
			this.stopEvent(e);
			if (this._selectedWidget){
				this.controller.unlinkTemplate(this._selectedWidget.id, false);
			}
			if (this._selectedGroup){
				this.controller.unlinkTemplate(this._selectedGroup.id, true);
			}
		},

		onToolUpdateTemplate (e) {
			this.stopEvent(e);
			this.logger.log(1,"onToolUpdateTemplate", "entry : " + this._selectedWidget);
			if (this._selectedWidget){
				this.controller.updateTemplateStyle(this._selectedWidget.id);
			} 
			if (this._selectedGroup){
				this.controller.updateGroupTemplateStyle(this._selectedGroup.id);
			}
		},

		onToolCreateTemplate (e){
			this.stopEvent(e);
			this.logger.log(1,"onToolCreateTemplate", "entry : " + this._selectedWidget);

			let name = this.getNLS("toolbar.templates.new");
			if(this._selectedWidget && this._selectedWidget.name){
				name = this._selectedWidget.name;
			}

			if(this._selectedScreen && this._selectedScreen.name){
				name = this._selectedScreen.name;
			}

			if(this._selectedGroup && this._selectedGroup.name){
				name = this._selectedGroup.name;
			}

			this.showTemplateCreateDialog(name);
		},

   }
}
</script>