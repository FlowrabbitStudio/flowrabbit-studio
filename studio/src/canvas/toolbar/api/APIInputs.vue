
<template>
    <div class="MatcToolbarAPIElements">
      
                <div v-for="e in api.input" :key="e.id">
                    <div class="form-group">
                        <label>{{ e.label }} 
                            <!-- <span class="MatcToolbarItemIcon" :data-id="getDataID(e.id)">
                                <span class="mdi mdi-help-circle"></span>
                            </span> -->
                        </label>
                        

                        <!-- <AutoCompleteTextarea v-if="e.type === 'TextArea'" :options="variableHints" :value="e.value" :placeholder="e.placeholder" class="MatcAutoCompleteTextareaXS"
                            @change="onElementChange(e, $event)">
                        </AutoCompleteTextarea> -->

                        <input v-if="e.isVar === false" :value="e.value" :placeholder="e.placeholder" class="MatcIgnoreOnKeyPress form-control"
                            @change="onElementChange(e, $event)" />

                        <Combo v-if="e.isVar === true" :value="e.variable" @change="onElementChange(e, $event)"
                            :hints="variableHints" :fireOnBlur="true" :formControl="true" :isDropDown="true"
                            :placeholder="e.placeholder" />
<!-- 
                        <DropDownButton v-if="e.type === 'DropDown'" :value="e.value" :options="e.options"
                            @change="onElementChange(e, $event)" :formControl="true" :placeholder="e.placeholder" /> -->

                        <!-- <div v-if="e.type === 'SegmentButton'" class="MatcSegmentButtonInline">
                            <SegmentButton :value="e.value" @change="onElementChange(e, $event)"
                                :options="e.options" />
                        </div> -->

                        <!-- <div v-if="e.type === 'Label'" >
                            {{e.value}}
                        </div> -->

                    </div>
                </div>
    


    </div>
</template>
<style lang="scss">

</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
// import SegmentButton from 'page/SegmentButton'
// import DropDownButton from 'page/DropDownButton'
import Input from 'common/Input'
// import AutoCompleteTextarea from 'page/AutoCompleteTextarea'
import _Tooltip from "common/_Tooltip";

export default {
    name: 'APIElements',
    mixins: [DojoWidget, Util, _Tooltip],
    props: ["api", "secretKeys", "app", "databinding", "hints", "variableHints", "variableAndSecretHints"],
    data: function () {
        return {
        }
    },
    components: {
        // 'SegmentButton': SegmentButton,
        // 'DropDownButton': DropDownButton,
        'Combo': Input,
        //'AutoCompleteTextarea': AutoCompleteTextarea
        //'FileButton': FileButton,
        //'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor')
    },
    computed: {
        buttons() {
            return this.$attrs.buttons;
        }
    },
    methods: {
        
        onElementChange(element, value) {
            this.logger.log(5, 'onElementChange', 'enter')
            const target = value.target
            if (target) {
                value = target.value   
            } 
            this.$emit("change", element, value)
            this.logger.log(-5, 'onElementChange', 'exit')
        },

       
    
    },
    watch: {
        
    },
    mounted() {
        this.logger = new Logger("APIElements")
    }
}
</script>