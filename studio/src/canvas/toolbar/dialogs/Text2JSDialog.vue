
<template>
    <div :class="['MatcFlexDialog', {'':isDesktop}]">

        <div class="MatcFlexDialogWrapper">


            <div class="MatcToolbarTabs MatcToolbarTabsBig" v-if="viewMode !== 'select'">
       
                <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}">{{ getNLS('text2js.tab-prompt')}}</a>
                <a @click="tab='settings'" :class="{'MatcToolbarTabActive': tab === 'settings'}">{{ getNLS('text2js.tab-settings')}}</a>
         
     
            </div>

                        
                <div v-if="tab === 'settings'"  class="MatcFlexDialogMain">
                    <div class="form-group">
                        <CheckBox :value="useFlowrabbitToken" label="Use Flowrabbit token" @change="onChangeFlowrabbitToken"/>
                    </div>
                    <div class="form-group" v-if="!useFlowrabbitToken">
                        <label>{{ getNLS('text2js.key-title') }}</label>
                        <form autocomplete="off">
                            <input type="password" autocomplete="off" class="form-control" v-model="openAIKey" @change="onChangeOpenAIKey"/>
                        </form>
                    </div>
                </div>

                <div v-show="tab === 'openai'"  class="MatcFlexDialogMain">
                        
                    <div class="MatcFlex MatcFlexSpaceBetween MatcFlexFullHeight">
                        <textarea 
                            :placeholder="promptPlaceholder"
                            type="text" 
                            class="form-control" 
                            v-model="prompt" 
                            @keyup="onKeyUp($event)"
                            ref="promptBox"></textarea>


                            <div :class="['MatchImportDialogPreviewCntr MatcScriptEditorIDE' ,{'MatchImportDialogAIRunning': isRunningAI}]" ref="aceContainer">
                            
                                
                                    <div class="MatcScriptEditorContent" ref="ideCntr">
                                        <Ace
                                            v-if="loaded"
                                            ref="aceEditor"
                                            v-model="script"
                                            @init="editorInit"
                                            lang="javascript"
                                            theme="chrome"
                                            :width="w"
                                            :height="h"></Ace>
                                    </div>
                                
                            
<!-- 
                                <div v-else class="MatchImportOpenAIDialogWaiting">
                                    
                                    <div class="MatcHintCntr">
                                            <div class="MatcHint">
                                                <p>{{ getNLS('text2js.waiting-details') }}</p>
                                            </div>
                                    
                                            <div class="MatchImportDialogProgressCntr MatcMarginTop" >
                                                <div class="MatchImportDialogProgress"></div>
                                            </div>
                                    </div>
               
                            </div> -->
                        </div>       
                    </div>
                    
                </div>



            <div class="MatcButtonBar MatcMarginTop" v-if="viewMode === 'select'">    
                <a class=" MatcLinkButtonDialog" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>
            <template v-else>

                <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'openai'">
                    <div class="MatcError" v-show="errorMSG && errorMSG.length > 0">
                        <span>{{errorMSG}}</span>                       
                    </div>
                    <div v-if="errorMSG && errorMSG.length > 0" class="MatcFlexGrow">

                    </div>

                    <a class=" MatcLinkButtonDialog" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                    <a class=" MatcButtonDialog" @click.stop="onCreateScript"> {{getNLS('text2js.preview') }}</a>    
                    <a class=" MatcButtonDialog" @click.stop="onSave" :disabled="!script"> {{getNLS('btn.import') }}</a>       
                </div>

                <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'settings'">
                    <a class=" MatcLinkButtonDialog" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                    <a class=" MatcButtonDialog" @click.stop="saveSettings"> {{getNLS('btn.save') }}</a>
                </div>

            </template>

      

        </div>
    </div>
</template>
<style lang="scss">
@import '../../../style/scss/flex_dialog.scss';
@import '../../../style/scss/gpt_dialog.scss';

</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import domGeom from 'dojo/domGeom'
import Services from 'services/Services'
import CheckBox from 'common/CheckBox'
import ModelUtil from '../../../core/ModelUtil'
import * as SchemaUtil from '../../../core/SchemaUtil'

export default {
    name: 'Text2JSDialog',
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            viewMode: 'text2UI',
            tab: "openai",
            model: null,
            hasContinue: false,
            uploadFiles: [],
            uploadPreviews: [],
            useFlowrabbitToken: true,
            hasZip: false,
            zoom: 1,
            errorMSG: '',
            progressMSG: '',
            progessPercent: 0,
            isPublic: false,
            prompt: '',
            promptPlaceholder: this.getNLS('text2js.prompt-placeholder'),
            openAIKey: '',
            preview: null,
            hint: this.getNLS('text2js.hint-1'),
            promptHistory: [],
            openAITemperature: 2,
            gptVersion: 'gpt4-turbo-yaml',
            isFormPreview: false,
            schema: null,
            selectedVariables: null,
            w: 400,
            h: 500,
            loaded: false,
            script: '',
            isRunningAI: false
        }
    },
    components: {
        CheckBox,
        'Ace': () => import(/* webpackChunkName: "ace" */ 'vue2-ace-editor')
    },
    computed: {
        isDesktop () {
          
            if (this.model) {
                const screenSize = ModelUtil.getScreenSizeByPage(this.model, this.currentPage)
                if (screenSize.w >= 768) {
                    return true
                }
            }
            return false
        }
    },
    methods: {

        setType(t) {
            this.viewMode = t
        },

        setSelectedVars (s) {
            this.selectedVariables = s
        },
        setViewMode (mode, tab) {
            this.viewMode = mode
            this.tab = tab
        },
        setSchema (schema) {
            this.schema = schema
            console.log(this.getSchemaAsText())
        },
        setModel(m) {
            this.model = m;
        },
        setPage (page) {
			this.currentPage = page
		},
        setPublic(isPublic) {
            this.isPublic = isPublic
        },

        setController(controller) {
            this.controller = controller
        },

        setCanvas(c) {
            this.canvas = c
        },

        setJwtToken(t) {
            this.jwtToken = t
        },

        setHash (h) {
            this.hash = h
        },

        setZoom(z) {
            this.zoom = z
        },

        onCancel() {
            this.$emit('cancel')
        },

        onKeyUp (e) {
            if (e.key === '#') {
                this.logger.log(-1, 'onKeyUp', '#')
                // show color selector..
                //this.insertAtCursor(this.$refs.promptBox, '333333')
            }
        },

        insertAtCursor(el, newText) {
            const [start, end] = [el.selectionStart, el.selectionEnd];
            el.setRangeText(newText, start, end, 'select');
            el.setSelectionRange(start + newText.length, start + newText.length);
        },

        async onSave(clickEvent) {
            this.logger.log(-1, 'onSave', 'enter')
            this.$emit('save', clickEvent, this.script)
        },


        async onCreateScript() {
            this.logger.log(-1, 'onCreateScript', 'enter')
            this.cleanUp()         
            this.runDesignGPT()
        },

        async runDesignGPT() {
        
            if (!this.model) {
                this.logger.error('runDesignGPT', 'No model')
                this.setError('text2js.error-no-model')
                return
            }          
            if (!this.prompt || this.prompt.length < 5) {
                this.setError('text2js.error-prompt-too-short')
                return
            } 
            if (!this.useFlowrabbitToken && (!this.openAIKey || this.openAIKey.length < 5)) {
                this.setError('text2js.error-server-no-key')
                this.tab = 'settings'
                return
            }

            this.promptHistory.push(this.prompt)
            this.isRunningAI = true
            //this.startHints()
            const result = await this.runGTPT()
            this.isRunningAI = false
            if (result.error) {
                this.hint = this.getNLS(result.error),
                this.setError(result.error)
            } else {
                if (result.js) {
                    this.script = result.script
                    this.$refs.aceEditor.editor.setValue(result.js)
                }
            }
        },

        runGTPT () {
            const schemaAsText = this.getSchemaAsText()
            this.logger.log(-1, 'runGTPT', 'enter', this.gptVersion )
            const aiService = Services.getAIService()
            return aiService.runText2JS(
                this.prompt, 
                this.openAIKey, 
                this.useFlowrabbitToken, 
                this.hash, 
                this.model, 
                schemaAsText
            )
        },

        getSchemaAsText () {
            const paths = SchemaUtil.getAllPaths(this.schema, "")
            const result = []
            for (const path of paths) {
                const e = SchemaUtil.getElement(this.schema, path)
                result.push(`${path} of type ${e.type}`)
            }
            return result.join('\n')
        },

        startHints () {
            const waitingMessages = this.getWaitingMessages()
            this.updateHint(waitingMessages, 0)
        },

        updateHint (waitingMessages, call = 0) {
            const m = waitingMessages.pop()   
            if (!this.isRunningAI || !m) {
                return
            }     
            this.hint = m
            this.updateTimeout = setTimeout(() => {
                this.updateHint(waitingMessages, call+1)
            }, 15000)
        },
        
        getWaitingMessages () {
            const waitingMessages = []
            for (let i = 1; i <= 4; i++) {
                waitingMessages.push({
                    hint: this.getNLS('text2js.hint-' + i),
                    prompt: this.getNLS('text2js.hint-' + i + '-prompt'),
                })
            }
            return waitingMessages
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        },

        setError (errorKey) {
            this.errorMSG = this.getNLS(errorKey)
            this.robo.icon = "mdi mdi-robot-dead"
            this.robo.messages = [this.errorMSG]
            clearTimeout(this.updateTimeout)
        },

       
        cleanUp() {
            this.errorMSG = ''
            this.hint = this.getNLS('text2js.no-preview'),
            clearTimeout(this.updateTimeout)
        },

        onChangeOpenAITemperature () {        
        },

        onChangeModelType (v) {
            this.gptVersion = v
        },

        onChangeOpenAIKey () {
        },

        onChangeWireFrame (v) {
            this.isWireFrame = v
            if (this.isWireFrame && this.isToggleWireFrameAndCustom) {
                this.isCustomStyles = false
            }
            this.saveOptions()
        },

        onChangeCustomStyles (v) {
            this.isCustomStyles = v
            if (this.isCustomStyles && this.isToggleWireFrameAndCustom) {
                this.isWireFrame = false
            }
            this.saveOptions()
        },

        onChangeMinimal(v) {
            this.isMinimal = v
            this.saveOptions()           
        },

        onChangeFlowrabbitToken (v) {
            this.useFlowrabbitToken = v
            localStorage.setItem('quxUseFlowrabbitToken', this.useFlowrabbitToken)
        },

        saveOptions () {
            localStorage.setItem('quxOpenAIIsWireFrame', this.isWireFrame)
            localStorage.setItem('quxOpenAIIsMinimal', this.isMinimal)
            localStorage.setItem('quxOpenAIIsCustomStyles', this.isCustomStyles)
         
            if (this.html) {
                this.buildAppHTML(this.html)
            }
            if (this.yaml) {
                this.buildAppYAML(this.yaml)
            }
            if (this.formElements) {
                this.buildForm(this.formElements)
            }
        },

        saveSettings() {
            localStorage.setItem('quxOpenAITemperature', this.openAITemperature)
            localStorage.setItem('quxOpenAIGPTVersion', this.gptVersion)
            localStorage.setItem('quxOpenAIKey', this.openAIKey)
            this.tab = 'openai'
        },

        renderACE () {
            /**
             * Get size for ace
             */
            const idePos = domGeom.position(this.$refs.aceContainer);
            this.w = idePos.w-2
            this.h = idePos.h-2
            this.loaded = true
        },

        editorInit () {
            require(/* webpackChunkName: "ace" */ 'brace/ext/language_tools') //language extension prerequsite...
            require(/* webpackChunkName: "ace" */ 'brace/mode/javascript')
            require(/* webpackChunkName: "ace" */ 'brace/theme/chrome')

            const editor = this.$refs.aceEditor.editor
            editor.setOptions({
                enableBasicAutocompletion: false,
                enableSnippets: false,
                enableLiveAutocompletion: false
            });

        

        }
    },
    mounted() {
        this.logger = new Logger("DesignGPTDialog");
        this.openAIKey = localStorage.getItem('quxOpenAIKey')
        this.isWireFrame = localStorage.getItem('quxOpenAIIsWireFrame')=== 'true' ? true : false
        this.isMinimal = localStorage.getItem('quxOpenAIIsMinimal') === 'true' ? true : false
        this.isCustomStyles = localStorage.getItem('quxOpenAIIsCustomStyles') === 'true' ? true : false
        const quxUseFlowrabbitToken = localStorage.getItem('quxUseFlowrabbitToken')
        if (quxUseFlowrabbitToken) {
            this.useFlowrabbitToken = quxUseFlowrabbitToken === 'true' ? true : false
        }
 
        if (location.href.indexOf('localhost') > 0) {
           // this.prompt = 'Create a signup page with a funny message'
        }
        setTimeout(() => {
            this.renderACE()
            this.$refs.promptBox.focus()
        }, 500)

   
    }
}
</script>