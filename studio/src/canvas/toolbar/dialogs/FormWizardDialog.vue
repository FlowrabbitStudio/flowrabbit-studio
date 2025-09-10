
<template>
    <div :class="['MatcFlexDialog', {'MatchImportOpenAIDialogDesktop':isDesktop}]">

        <div class="MatcFlexDialogWrapper">

            <div class="MatcToolbarTabs MatcToolbarTabsBig" v-if="viewMode !== 'select'">
                <a @click="tab='formWizard'" :class="{'MatcToolbarTabActive': tab === 'formWizard'}">{{ getNLS('design-gpt.tab-form-wizard')}}</a>
                <a @click="tab='preview'" :class="[{'MatcToolbarTabActive': tab === 'preview'}, {'MatcToolbarTabDisabled': !preview}]">{{ getNLS('design-gpt.tab-preview')}}</a>
            </div>
     
                
            <div v-if="tab === 'formWizard'"  class="MatcFlexDialogMain">
                <FormWizardSettings :model="model" :schema="schema" :selectedVariables="selectedVariables" ref="formWizard" />
            </div>


            <div v-show="tab === 'preview'" class="MatcFlexDialogMain MatchImportOpenAIDialogPreview">
                    <div :class="['MatchImportDialogPreviewCntr' ,{'MatchImportDialogAIRunning': isRunningAI}]">
                        <div class="MatcHint" v-if="!preview && !isRunningAI">
                            {{getNLS('design-gpt.no-preview')}}
                        </div>

                        <div ref="simCntr" class="MatchImportOpenAIDialogSimulator">
                        </div>
                    </div>       
            </div>


            <div class="MatcError" v-show="errorMSG && errorMSG.length > 0">
                <span>{{errorMSG}}</span>
            </div>

            <!-- <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'formWizard'">
                <a class=" MatcLinkButtonDialog" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                <a class=" MatcButtonDialog" @click.stop="onCreateFormWizardPreview"> {{getNLS('design-gpt.preview-wizard') }}</a>         
            </div> -->

            <div class="MatcButtonBar MatcMarginTop">
                <a class=" MatcLinkButtonDialog" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                <a class=" MatcButtonDialog" @click.stop="onSave">{{ getNLS('btn.import') }} </a>                  
            </div>
      

        </div>

        <div ref="iframeCntr" class="iframeCntr"></div>
    </div>
</template>
<style lang="scss">
@import '../../../style/scss/flex_dialog.scss';
@import '../../../style/scss/gpt_dialog.scss';


.iframeCntr {
    width: 0px;
    height: 0px;
    overflow: hidden;
}
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import DomBuilder from 'common/DomBuilder'
import domGeom from 'dojo/domGeom'
import ScrollContainer from 'common/ScrollContainer'
import Simulator from 'core/Simulator'

import FormWizardSettings from './FormWizardSettings'
import FormWizard from '../../../core/ai/FormWizard'
import ModelUtil from '../../../core/ModelUtil'

export default {
    name: 'OpenAIDialog',
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            viewMode: 'select',
            tab: "formWizard",
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
            promptPlaceholder: this.getNLS('design-gpt.prompt-placeholder'),
            openAIKey: '',
            preview: null,
            hint: this.getNLS('design-gpt.hint-1'),
            promptHistory: [],
            isWireFrame: false,
            isMinimal: false,
            isRunningAI: false,
            isCustomStyles: false,
            isToggleWireFrameAndCustom: false,
            hasRobo: true,
            openAITemperature: 2,
            gptVersion: 'gpt4-turbo-yaml',
            robo: {
                icon:'mdi mdi-robot-outline',
                messages: [],
            },
            isFormPreview: false,
            schema: null,
            selectedVariables: null
        }
    },
    components: {
        FormWizardSettings
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
            console.debug(t)
            this.viewMode = t
            if (t === 'text2UI') {
                this.tab = 'openai'
            } else {
                this.tab = 'formWizard'
            }
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

        async onSave() {
            const elements = this.$refs.formWizard.getElements()
            this.formElements = elements
            this.buildForm(elements)
            this.logger.log(-1, 'onSave', 'enter')
            this.$emit('save', this.preview)
        },

        onCreateFormWizardPreview () {
            this.logger.log(-1, 'onCreateFormWizardPreview', 'enter')
            this.cleanUp()
            const elements = this.$refs.formWizard.getElements()
            this.formElements = elements
            this.buildForm(elements)
        },

        buildForm (elements) {
            const screenSize = ModelUtil.getScreenSizeByPage(this.model, this.currentPage)
            const width = screenSize.w
            const height = screenSize.h
            const result = new FormWizard(this.model.lastUUID).create(width, height, elements)
            this.preview = result
            // this.tab = 'preview'
            // this.isFormPreview = true
            // this.$nextTick(() => {
            //     this.buildPreview(result)
            // })       
        },

        async onCreatePreview() {
            this.logger.log(-1, 'onCreatePreview', 'enter')
            this.cleanUp()         
            this.runDesignGPT()
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
                    hint: this.getNLS('design-gpt.hint-' + i),
                    prompt: this.getNLS('design-gpt.hint-' + i + '-prompt'),
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

        async buildPreview () {

            if (!this.simulator) {
                const sim = this.renderSimulator(this.$refs.simCntr);
                sim.doNotRunOnLoadAnimation = true
                sim.doNotExecuteScripts = true
                this.simulator = sim;
            }
            this.simulator.setModel(this.preview);
        },

        renderSimulator(cntr) {

            const db = new DomBuilder();

            const domPos = domGeom.position(this.domNode);
            const pos = domGeom.position(cntr);
            pos.h = domPos.h;

            const container = db.div("MatchSimulatorContainer MatcAnimationComposerSimulator")
                .h(pos.h)
                .w(pos.w)
                .build();

            const scroller = this.$new(ScrollContainer, { canDestroy: true });
            scroller.placeAt(container);

            const s = this.$new(Simulator, { 
                mode: "debug", 
                logData: false, 
                runTimerLinesOnScreenLoad: false, 
                isDesktopTest: true, 
                isWiringEvents: true 
            });
            s.scrollListenTarget = "parent";
            s.setHash(this.hash)     
            s.initParent = () => { };
            s.setScrollContainer(scroller);
            scroller.wrap(s.domNode);
            cntr.appendChild(container);
            return s;
        },

        cleanUp() {
            this.errorMSG = ''
            this.hint = this.getNLS('design-gpt.no-preview'),
            clearTimeout(this.updateTimeout)
   
            this.preview = null
            this.formElements = null
            this.isFormPreview = false
            if (this.simulator) {
                this.simulator.destroy()
                this.simulator = null
            }
            if (this.$refs.simCntr) {
                this.$refs.simCntr.innerHTML = ''
            }
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
        }  

    },
    mounted() {
        this.logger = new Logger("DesignGPTDialog");
        this.openAIKey = localStorage.getItem('quxOpenAIKey')
        this.isWireFrame = localStorage.getItem('quxOpenAIIsWireFrame')=== 'true' ? true : false
        this.isMinimal = localStorage.getItem('quxOpenAIIsMinimal') === 'true' ? true : false
        this.isCustomStyles = localStorage.getItem('quxOpenAIIsCustomStyles') === 'true' ? true : false
        this.useFlowrabbitToken = localStorage.getItem('quxUseFlowrabbitToken') === 'true' ? true : false
        if (location.href.indexOf('localhost') > 0) {
            this.prompt = 'Create a signup page with a funny message'
        }
    }
}
</script>