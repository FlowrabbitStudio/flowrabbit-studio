<template>
        <div class="">
            <div class="MatcDialogHeader"><span class="MatcDialogHeaderTitle">{{title}}</span></div>
            <div class="MatcPadding">
                <div class="MatcFlex MatcGapM">
                    <div class="form-group MatcFlexGrow">
                        <label>Name</label>
                        <div>
                            <input class="MatcIgnoreOnKeyPress form-control" v-model="name" ref="inputName">
                        </div>      
                    </div>          

                    <div class="form-group" style="width: 128px;">
                        <label>Type</label>
                        <div>
                            <SegmentButton class="" v-model="type" :disabled="typeSelectionDisabled" :options="typeHints" />
                        </div>      
                    </div>   
                </div>


                <div class="form-group">
                    <label>Default Value</label>
                    <div>
                        <FullScreenTextArea 
                            class="form-control-l" 
                            v-model="defaultValue"
                            @keydown.tab.stop="handleTab"
                            @keyup.tab.stop="handleTab"
                            :disabled="type === 'array' || type === 'object'"    
                        ></FullScreenTextArea>
                    </div>      
                </div>   

    
                <div class="MatcButtonBarDialogFull MatcButtonBarDialogPadding">
                    <div v-if="errorMSG" class="MatcError">
                        {{errorMSG}}
                    </div>

                    <a class="MatcLinkButtonDialog" @click="emit('cancel')">Cancel</a>
                    <a class="MatcButtonDialog" @click="save">Save</a>
                </div>
            </div>
         

        </div>
</template>
<style lang="scss">
 
</style>
<script>
import Logger from 'common/Logger'
import DojoWidget from 'dojo/DojoWidget'
import * as SchemaUtil from '../../../core/SchemaUtil'
import SegmentButton from '../../../page/DropDownButton.vue'
import FullScreenTextArea from '../../../page/FullScreenTextArea.vue'

export default {
    name: 'UserDialog',
    mixins:[DojoWidget],
    props: [''],
    data: function () {
        return {
            title: 'XXX',
            name: '',
            defaultValue: '',
            type: "string",
            typeHints: [
                { value: 'string', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'boolean', label: 'Boolean' },
                { value: 'array', label: 'Array' },
                { value: 'object', label: 'Object' },
            ],
            errorMSG:'',
            typeSelectionDisabled: false
        }
    },
    components: {
        SegmentButton, FullScreenTextArea
    },
    computed: {
    },
    methods: {
        handleTab (e) {
            e.preventDefault()
            // we could add here some tab add the right place
        },
        save () {
            const name = this.name.trim()
            if (!name) {
                this.emit("error")
                this.errorMSG = "Enter a name"
                return
            }
            const newPath = this.parentPath ? `${this.parentPath}.${this.name}` : this.name
            if (SchemaUtil.exists(this.schema, newPath) && this.oldName !== this.name) {
                this.emit("error")
                this.errorMSG = "The name is already taken"
                return
            }
            this.emit("save", name, this.defaultValue, this.type)
        },
        show (schema, parentPath, name, defaultValue, type) {
     
            this.schema = schema
            this.oldName = name
            this.parentPath = parentPath
            this.name = name
            this.defaultValue = defaultValue
            if (type) {
                if (type === 'array' || type === 'object') {
                    this.typeSelectionDisabled = true
                }
                this.type = type 
            }
         
            setTimeout(() => {
                this.$refs.inputName.focus()
            }, 100);
        }
    },
    mounted () {
      this.logger = new Logger('NewVariableDialog')
    }
}
</script>