<template>
    <div class="">
        <div class="MatcDialogHeader"><span class="MatcDialogHeaderTitle">{{title}}</span></div>
        <div class="MatcPadding">
  
            Deleting the variable will also remove the data bindings in {{widgets.length}} widgets.


            <div class="MatcButtonBarDialogFull MatcButtonBarDialogPadding">

                <a class="MatcLinkButtonDialog" @click="emit('cancel')">Cancel</a>
                <a class="MatcButtonDialog MatcButtonDialogDanger" @click="emit('delete')">Delete</a>
            </div>
        </div>
     

    </div>
</template>
<style lang="scss">

</style>
<script>
import Logger from 'common/Logger'
import DojoWidget from 'dojo/DojoWidget'

export default {
name: 'UserDialog',
mixins:[DojoWidget],
props: [''],
data: function () {
    return {
        title: 'XXX',
        widgets: ''        
    }
},
components: {

},
computed: {
},
methods: {
    show (widgets) {
        this.widgets = widgets
    }
},
mounted () {
  this.logger = new Logger('DeleteVariableDialog')
}
}
</script>