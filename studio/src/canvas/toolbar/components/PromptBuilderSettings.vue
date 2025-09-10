
<template>
    <div class="MatcToolbarRestSettings MatcToolbarPromptBuilder ">
        <div>     
            <div class="MatcDialogTitle">
                <label>Prompt Builder</label>
                <a class="VommondDialogHelper ml-2" :href="helper" target="_blank">
                    <span class="mdi mdi-help-circle-outline" />
                </a>
            </div>     
            <div class="MatcToolbarRestSettingsElementCntr MatcMarginTop">
                <div class="form-group">
                    <label>Prompt
                      <span class="MatcHelpIcon" ref="tooltipPromptIcon">
                        <span class="mdi mdi-help-circle" />
                      </span>
                    </label>
                    <AutoCompleteTextarea
                      placeholder="Summarize the following text: ${summary}"
                      v-model="config.prompt"
                      :options="variableAndSecretHints"
                      @change="setPrompt"
                    >
                    </AutoCompleteTextarea>           
                </div>
        
                <div class="form-group">
                  <label>Output Variable
                      <span class="MatcHelpIcon" ref="tooltipOutputVarIcon">
                        <span class="mdi mdi-help-circle" />
                      </span>
                    </label>
                    <Combo :value="config.output.databinding" @change="onChangeOutputVar" :hints="hints" :fireOnBlur="true"
                        :formControl="true" :isDropDown="true" placeholder="Name of output variable" />
                </div>
              
            </div>


        </div>


    </div>
</template>
<style>

</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import lang from 'dojo/_base/lang'
import Logger from 'common/Logger'
import Input from 'common/Input'
import RestEngine from 'core/RestEngine'
import AutoCompleteTextarea from 'page/AutoCompleteTextarea'
import _Tooltip from "common/_Tooltip";
import HelperUtil from '../../../util/HelperUtil'

export default {
    name: 'PromptBuilderSettings',
    mixins: [DojoWidget, Util, _Tooltip],
    props: ["app", "value"],
    data: function () {
        return {
            tab: "data",
            hasOutputPath: false,
            secretKeys: [],        
            model: {
                widgets: {}
            },
            widget: null,
            config: {             
                prompt: '',
                output: {
                    databinding: '',
                    path:''
                }
            },
            options: ['${aaa}', '${bbbb}'],
            helper: HelperUtil.PROMPTS
        }
    },
    components: {
        'AutoCompleteTextarea': AutoCompleteTextarea,
        // 'SegmentButton': SegmentButton,
        //'DropDownButton': DropDownButton,
        'Combo': Input
    },
    computed: {
        dataBindingKeys() {
            let values = RestEngine.getNeededDataBings(this.rest)
            return values
        },      
        variableAndSecretHints() {
            const hints = this.getAllAppVariables()
            const result = hints.map(h => {
                const v = "${" + h + "}"
                return {
                    label: v,
                    value: v
                }
            })
            if (this.secretKeys){
                this.secretKeys.forEach(e => {
                    const v = "${secrets." + e.key + "}"
                    result.push({
                        label: v,
                        value: v
                    })
                })
            }
            return result.map(i => i.value)
        },
        variableHints() {
            const hints = this.getAllAppVariables()
            return hints.map(h => {
                const v = "${" + h + "}"
                return {
                    label: v,
                    value: v
                }
            })
        },
        hints() {
            let hints = this.getAllAppVariables()
            return hints.map(h => {
                return {
                    label: h,
                    value: h
                }
            })
        }
    },
    methods: {

        setPrompt (p) {
            console.debug('setPrompt', p)
            this.config.prompt = p
        },
      
        setSecretKeys(s) {
            this.logger.log(-1, 'setSecretKeys', 'enter', s)
            this.secretKeys = s
        },

        async setWidget(w) {
            this.logger.log(-4, 'setWidget', 'enter')
            this.widget = lang.clone(w)
            console.debug()

            if (w.props && w.props.rest) {
                this.config = lang.clone(w.props.rest)
            }
        },

        setModel(m) {
            this.model = m;
        },
        setSchema (schema) {
            this.schema = schema
        },
        setHash(h) {
            this.hash = h
        },
        getValue() {
            return this.config
        },            
        onChangeOutputVar(value) {
            this.config.output.databinding = value
        }

    },
    watch: {
        value(v) {
            this.setWidget(v)
        }
    },
    mounted() {
        this.logger = new Logger("PromptBuilderSettings")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
        if (this.$refs.tooltipPromptIcon) {
          this.addTooltip(
            this.$refs.tooltipPromptIcon,
            "A prompt is an instruction given to an AI model. You can use your variables to build more complex prompts by using this format ${variableName}"
          );
        }
        if (this.$refs.tooltipOutputVarIcon) {
          this.addTooltip(
            this.$refs.tooltipOutputVarIcon,
            "A variable identifies and stores an element, in this case a prompt. Select an existing variable or type a new variable name."
          );
        }
    }
}
</script>