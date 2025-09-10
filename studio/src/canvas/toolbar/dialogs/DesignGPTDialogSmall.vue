
<template>
    <div :class="['MatcFlexDialog', {'':isDesktop}]">

        <div class="MatcFlexDialogWrapper">


            <div class="MatcToolbarTabs MatcToolbarTabsBig" v-if="viewMode !== 'select'">
 
       
                <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}">{{ getNLS('design-gpt.tab-prompt')}}</a>
                <a @click="tab='settings'" :class="{'MatcToolbarTabActive': tab === 'settings'}">{{ getNLS('design-gpt.tab-settings')}}</a>
         
     
            </div>

                        
                <div v-if="tab === 'settings'"  class="MatcFlexDialogMain">
                    <div class="form-group">
                        <CheckBox :value="useFlowrabbitToken" label="Use Flowrabbit token" @change="onChangeFlowrabbitToken"/>
                    </div>
                    <div class="form-group" v-if="!useFlowrabbitToken">
                        <label>{{ getNLS('design-gpt.key-title') }}</label>
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


                            <div :class="['MatchImportDialogPreviewCntr' ,{'MatchImportDialogAIRunning': isRunningAI}]">
                                <template v-if="!isRunningAI">
                                    <div class="MatcHintCenter" v-if="!preview">
                                        {{getNLS('design-gpt.no-preview')}}
                                    </div>

                                    <div ref="simCntr" class="MatchImportOpenAIDialogSimulator" />
                                 </template>

                                <div v-else class="MatchImportOpenAIDialogWaiting">
                                    
                                    <div class="MatcHintCntr">
                                            <div class="MatcHint">
                                                <p>{{ getNLS('design-gpt.waiting-details') }}</p>
                                            </div>
                                    
                                            <div class="MatchImportDialogProgressCntr MatcMarginTop" >
                                                <div class="MatchImportDialogProgress"></div>
                                            </div>
                                    </div>

                                    <!-- <div class="MatchImportOpenAIDialogHint">
                                        <h1>
                                            {{ getNLS('design-gpt.hint-did-you-know') }}
                                        </h1>
                                        {{hint.hint}}
                                        <p>
                                            "<AnimatedLabel :value="hint.prompt" :duration="70"/>"
                                        </p>
                                    </div>
                                     -->
                           

               
                            </div>
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
                    <a class=" MatcButtonDialog" @click.stop="onCreatePreview"> {{getNLS('design-gpt.preview') }}</a>    
                    <a class=" MatcButtonDialog" @click.stop="onSave" :disabled="!preview"> {{getNLS('btn.import') }}</a>       
                </div>

                <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'settings'">
                    <a class=" MatcLinkButtonDialog" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                    <a class=" MatcButtonDialog" @click.stop="saveSettings"> {{getNLS('btn.save') }}</a>
                </div>

            </template>

      

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
import Services from 'services/Services'
//import HTMLImporter from 'core/ai/HTMLImporter'
import * as StyleImporter from 'core/ai/StyleImporter'
import CheckBox from 'common/CheckBox'
//import AnimatedLabel from 'common/AnimatedLabel'
import YAMLImporter from '../../../core/ai/YAMLImporter'
import ModelUtil from '../../../core/ModelUtil'
//import QSS from '../../../core/QSS'

export default {
    name: 'OpenAIDialog',
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
        CheckBox
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

        async onSave() {
            this.logger.log(-1, 'onSave', 'enter')
            this.$emit('save', this.preview)
        },


        async onCreatePreview() {
            this.logger.log(-1, 'onCreatePreview', 'enter')
            this.cleanUp()         
            this.runDesignGPT()
        },

        async runDesignGPT() {
        
            if (!this.model) {
                this.logger.error('runDesignGPT', 'No model')
                this.setError('design-gpt.error-no-model')
                return
            }          
            if (!this.prompt || this.prompt.length < 5) {
                this.setError('design-gpt.error-prompt-too-short')
                return
            } 
            if (!this.useFlowrabbitToken && (!this.openAIKey || this.openAIKey.length < 5)) {
                this.setError('design-gpt.error-server-no-key')
                this.tab = 'settings'
                return
            }

            this.promptHistory.push(this.prompt)
            this.isRunningAI = true
            this.startHints()
            const result = await this.runGTPT()
            console.debug(result)
            //const result = await Services.getAIService().runFake(40000)
            this.isRunningAI = false
            if (result.error) {
                this.hint = this.getNLS(result.error),
                this.setError(result.error)
            } else {
                if (result.html) {
                    this.html = result.html
                    this.yaml = ''
                    this.buildAppHTML(this.html)
                }
                if (result.yaml) {
                    this.yaml = result.yaml
                    this.html = ''
                    this.buildAppYAML(this.yaml)
                }
     
            }
        },

        runGTPT () {
            this.logger.log(-1, 'runGTPT', 'enter', this.gptVersion )
            const aiService = Services.getAIService()
            return aiService.runGPT4TurboYaml(
                this.prompt, 
                this.openAIKey, 
                this.useFlowrabbitToken, 
                this.hash, 
                this.model, 
                {
                    isCustomStyles: this.isCustomStyles
                },
                this.yaml
            )
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

        buildAppYAML (yaml) {
            this.tab = 'openai'
            try {
                const screenSize = ModelUtil.getScreenSizeByPage(this.model, this.currentPage)
                const width = screenSize.w
                const height = screenSize.h
                const importer = new YAMLImporter(this.model.lastUUID)
                const result = importer.yamlQuantUX(yaml, 
                    this.$refs.iframeCntr, 
                    width,
                    height, 
                    {
                        isRemoveContainers: false,
                        isWireFrame: false,
                        customStyle: null
                    }
                )     

                if (result) {
                    this.preview = result
                    this.$nextTick(() => {
                        this.buildPreview(result)
                    })              
                } else {
                    this.hint = this.getNLS('design-gpt.no-preview'),
                    this.setError("design-gpt.error-yaml")
                }
            } catch (err) {
                console.debug(err)
                this.hint = this.getNLS('design-gpt.no-preview'),
                this.setError("design-gpt.error-yaml")
            }
           
        },

        getCustomerStyles () {
            if (this.isCustomStyles) {
                return StyleImporter.getCustomStyle(this.model)
            }
            return null
        },

        getDefaultStyle () {
            if (this.isWireFrame) {
                return StyleImporter.getDefaultStyle(this.model)
            }
            return null
        },

        async buildPreview () {
            if (!this.simulator) {
                const sim = this.renderSimulator(this.$refs.simCntr);
                sim.doNotRunOnLoadAnimation = true
                sim.doNotExecuteScripts = true
                this.simulator = sim;
            }
            try {
                const previewWithTheme = structuredClone(this.preview)
                previewWithTheme.theme = this.model.theme
                this.simulator.setModel(previewWithTheme);
            } catch (err) {
                console.error(err)
            }
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
        const quxUseFlowrabbitToken = localStorage.getItem('quxUseFlowrabbitToken')
        if (quxUseFlowrabbitToken) {
            this.useFlowrabbitToken = quxUseFlowrabbitToken === 'true' ? true : false
        }
 
        if (location.href.indexOf('localhost') > 0) {
           // this.prompt = 'Create a signup page with a funny message'
        }
    }
}
</script>