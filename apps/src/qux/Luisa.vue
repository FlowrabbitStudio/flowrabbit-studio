<template>
    <div class="qux-marketplace-container">
        <div :class="['content-container', { 'content-container-top': isAppStore }]">
            <div :class="['qux', { 'qux-component-screen': isComponentScreen }]">
                <qContainer v-if="currentScreen" :class="screenCSS" :element="currentScreen" :model="model" :hash="hash" :config="mergedConfig"
                    @qActionLine="onActionLine" 
                    @qCallback="onCallback" 
                    @qClick="onClick" 
                    @qChange="onChange" 
                    @qKeyPress="onKeyPress" 
                    @qFocus="onFocus"
                    @qBlur="onBlur" 
                    @qMouseOver="onMouseOver" 
                    @qMouseOut="onMouseOut" 
                    @qViewModelChange="onViewModelChange"
                    @qStream="onStream">
                </qContainer>
                <div v-else>
                    {{ msg }}
                </div>

                <div v-if="hasOverlay" :class="['qux-overlay-wrapper', { 'qux-overlay-wrapper-fixed': isFixedOverlay }]"
                    @mousedown="popOverlay" ref="overlayWrapper">
                    <qContainer ref="overlayCntr" v-if="currentOverlay" :element="currentOverlay" :hash="hash" :class="'qux-screen'"
                        :model="model" :config="mergedConfig" 
                        @qActionLine="onActionLine" 
                        @qCallback="onCallback" 
                        @qClick="onClick" 
                        @qChange="onChange"
                        @qKeyPress="onKeyPress" 
                        @qFocus="onFocus" 
                        @qBlur="onBlur" 
                        @qMouseOver="onMouseOver" 
                        @qMouseOut="onMouseOut"
                        @qViewModelChange="onViewModelChange"
                        @qStream="onStream"></qContainer>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
@import './scss/qux.scss';
@import './scss/qux-mobile-wrap.scss';
</style>
<script>

import * as Util from './core/ExportUtil'
import Config from './core/Config'
import Logger from './core/Logger'
import ModelTransformer from './core/ModelTransformer'
import CSSOptimizer from './core/CSSOptimizer'
import CSSFactory from './core/CSSFactory'
import CSSWriter from './core/CSSWriter'
//import ActionEngine from './actions/ActionEngine'
import FontWriter from './core/FontWriter'

import Logic from './mixins/Logic.vue'
import Event from './mixins/Event.vue'
import Script from './mixins/Script.vue'
import API from './mixins/API.vue'
import Validation from './mixins/Validation.vue'
import Services from "../services/Services";


import JSONPath from './core/JSONPath'
import { mapState } from "vuex";

export default {
    mixins: [Event, Logic, Validation, Script, API],
    name: 'Luisa',
    emits: ['update:modelValue', 'qScreenLoad', 'qClick', 'click', 'qChange', 'change', 'qKeyPress', 'qFocus', 'qBlur', 'qDesignSystemCallback', 'qScrollTop', 'qViewModelChange', 'showCreditsModal', 'qStream'],
    props: {
        'app': {
            default: false
        },
        'token': {
            default: ''
        },
        'design': {
        },
        'screen': {
            type: String
        },
        'selected': {
            type: String
        },
        'startScreenId': {
            type: String
        },
        'debug': {
            type: String
        },
        'resizeParent': {
            type: String,
            default: "window"
        },
        'modelValue': {
            type: Object,
            default: function () {
                return {
                }
            }
        },
        'executor': {
            type: Object
        },
        'config': {
            type: Object,
            default: function () {
                return {
                }
            }
        },
        'actions': {
            type: Array
        },
        'isAppStore': {
            default: false
        }
    },
    components: {
    },
    provide() {
        return {
            viewModel: this.modelValue,
            user: this.user,
            validationErrors: this.validationErrors,
            segementScreens: this.segementScreens,
            server: Services.getConfig().api_URL,
            luisaAppState: this.luisaAppState
        }
    },
    data: function () {
        return {
            server: Services.getConfig().api_URL,
            model: null,
            mobileModel: null,
            tabletModel: null,
            desktoModel: null,
            selectedScreenId: null,
            overlayScreenIds: [],
            hash: false,
            msg: '',
            mergedConfig: Config.getDefault(),
            deviceType: '',
            validationErrors: {},
            segementScreens: {},
            treeModel: {screens:[]},
            luisaAppState: {
                loading: false
            }
        }
    },
    computed: {
        ...mapState(["user"]),
        screenCSS() {
            if (this.isBluredOverlay) {
                return 'qux-screen qux-screen-blurred'
            }
            return 'qux-screen'
        },
        currentScreen() {
            if (this.selectedScreenId) {
                let screen = this.treeModel.screens.filter(screen => screen.isComponentScreen !== true).find(screen => screen.id === this.selectedScreenId)
                if (screen) {
                    return screen
                }
            }
            return this.getDefaultScreen()
        },
        isComponentScreen() {
            let s = this.currentScreen
            return s ? s.isComponentScreen : false
        },
        imagePrefix() {
            if (this.hash) {
                return `${this.server}/rest/images/${this.hash}/`
            }
            return this.mergedConfig.imageFolder
        },
        hasOverlay() {
            return this.overlayScreenIds.length > 0
        },
        currentOverlay() {
            let overlayId = this.overlayScreenIds[this.overlayScreenIds.length - 1]
            let overlay = this.treeModel.screens.find(screen => screen.id === overlayId)
            return overlay
        },
        isFixedOverlay() {
            let overlayId = this.overlayScreenIds[this.overlayScreenIds.length - 1]
            let overlay = this.treeModel.screens.find(screen => screen.id === overlayId)
            if (overlay) {
                return overlay.style.fixed
            }
            return false
        },
        isBluredOverlay() {
            let overlayId = this.overlayScreenIds[this.overlayScreenIds.length - 1]
            let overlay = this.treeModel.screens.find(screen => screen.id === overlayId)
            if (overlay) {
                return overlay.style.blur
            }
            return false
        }
    },
    methods: {
        onLoadingStart() {
            Logger.log(-11, 'Luisa.onLoadingStart() > enter')
            this.luisaAppState['loading'] = true
            //JSONPath.set(this.modelValue, '$flowrabbit.loading', true)
        },
        onLoadingEnd() {
            Logger.log(-11, 'Luisa.onLoadingEnd() > enter')
            this.luisaAppState['loading'] = false
            //JSONPath.set(this.modelValue, '$flowrabbit.loading', false)
        },
        computeTreeModel (model) {
            Logger.log(-1, 'Luisa.computeTreeModel() > enter >')
            let transformer = new ModelTransformer(model, this.mergedConfig, this.selected)
            let tree = transformer.transform()
            this.setGlobalCSS(tree, this.selected)
            this.setGlobalFonts(model, this.mergedConfig)
            this.setTreeModel(tree)
            return tree       
        },
        setTreeModel (tree) {
            Logger.log(1, 'Luisa.setTreeModel() > enter >')
            this.treeModel = tree
            tree.screens.forEach(s => {
                if (s.segment) {
                    this.segementScreens[s.id] = s
                }
            })
        },
       
        setGlobalFonts(model, config) {
            FontWriter.write(model, config)
        },
        setGlobalCSS(tree) {
            let compressed = new CSSOptimizer(this.mergedConfig).runTree(tree)
            let classes = new CSSFactory(this.mergedConfig, this.imagePrefix).generate(compressed)
            let css = []
            css = Object.values(classes).flatMap(element => {
                return element.map(e => {
                    return e.code
                })
            });
            css = css.join('\n')
            CSSWriter.write(css, tree.id)
        },
        async setDesign(design) {
            Logger.log(1, 'Luisa.setDesign() > ', design)

            if (this.config) {
                this.setConfig(this.config, design)
            }
            await this.setQUX(design)
        },
        setConfig(c, design) {
            if (design.figmaId || design.figmaFile && design.figmaAccessKey) {
                Logger.log(1, 'Luisa.setConfig() > Set Figma')
                this.mergedConfig.css = Config.getFigmaCSS()
            }
            this.mergedConfig = Config.merge(this.mergedConfig, c)
            this.mergedConfig.proxy = `${Services.getConfig().proxy_URL}/proxy`
            this.initCustomComponents(this.mergedConfig.components)
            Logger.setLogLevel(this.mergedConfig.debug.logLevel)
            Logger.log(1, 'Luisa.setConfig()', this.mergedConfig)
        },
        async setQUX(app) {
            Logger.log(1, 'Luisa.setQUX() > enter')
            if (app.substring) {
                let model = await this.loadAppByKey(app)
                this.model = model
                this.hash = app
            } else {
                this.model = app
            }
            this.sourceModel = this.model
            this.model = this.computeResponsiveModel(this.sourceModel)
            this.computeTreeModel(this.model)
            this.initViewModel()
            this.onDesignLoaded()
        },
        computeResponsiveModel(model) {
            Logger.log(3, 'Luisa.computeResponsiveModel() > enter', model.type)
            if (Util.isResponsiveModel(model)) {
                Logger.log(-10, 'Luisa.computeResponsiveModel() > RESPONSIVE > ' + this.deviceType)

                this.responsiveModel = Util.getResponsiveModel(model, this.deviceType)


            } else {
                this.responsiveModel = model
            }
            return this.responsiveModel
        },
        async loadAppByKey(key) {
            Logger.log(3, 'Luisa.loadAppByKey() > enter', key)
            let url = `${this.server}/rest/invitation/${key}/app.json`
            let start = new Date().getTime()
            const response = await fetch(url);
            if (response.status === 200) {
                let app = await response.json();
                Logger.log(-1, 'Luisa.loadAppByKey() > exit', new Date().getTime() - start)
                return app
            } else {
                this.msg = 'The debug id is wrong!'
            }
        },
        setScreen(screenName, query) {
            Logger.log(-1, 'Luisa.setScreen() > ', screenName, query)

            if (this.mergedConfig.router.disabled === true) {
                this.loadScreen(screenName)
                Logger.log(1, 'Luisa.setScreen() > router disabled', screenName)
                return
            }
            // Update url, which will trigger watcher, which will call setScreenByRouter() which will call loadScreen()
            let prefix = ''
            if (this.config && this.config.router && this.config.router.prefix) {
                prefix = this.config.router.prefix + '/'
            }
            let url = `/${prefix}${screenName}.html`
            if (query) {
                url += '?' + query
            }
            /**
             * In history mode we have to set the entire URL
             */
            this.$router.push(url)
        },
        loadScreen(name) {
            Logger.log(-2, 'Luisa.loadScreen() >', name)

            this.closeAllOverlays()
            if (this.model) {
                this.beforeScreenLoaded(name)
                /**
                 * FIXME: Use here tree model.
                 */
                const model = this.responsiveModel
                const screen = Object.values(model.screens).find(s => s.name === name)
                Logger.log(2, 'Luisa.loadScreen() > Found ', screen)
                if (screen) {
                    // make here somethink like: use router? and update the url as well?
                    this.selectedScreenId = screen.id
                    this.onScreenLoaded(screen)
                } else {
                    Logger.warn('Luisa.loadScreen() > No screen with name', name)
                    let startScreen = this.getDefaultScreen()
                    if (startScreen) {
                        this.selectedScreenId = startScreen.id
                        this.onScreenLoaded(startScreen)
                    } else {
                        this.msg = `404 - No Screen with name ${this.msg}`
                    }
                }
            } else {
                Logger.warn('Luisa.loadScreen() > No Model')
            }
        },
        getDefaultScreen() {
            Logger.log(1, 'Luisa.getDefaultScreen() > enter')
            if (this.startScreenId) {
                let startScreen = this.treeModel.screens.filter(screen => screen.isComponentScreen !== true).find(screen => screen.id === this.startScreenId)
                if (startScreen) {
                    return startScreen
                }
            }
            let screen = this.treeModel.screens.filter(screen => screen.isComponentScreen !== true).find(screen => screen.props.start === true)
            if (!screen) {
                screen = this.treeModel.screens.filter(screen => screen.isComponentScreen !== true)[0]
            }
            return screen
        },
        setStartScreen() {
            Logger.log(5, 'Luisa.setStartScreen() > enter ')
            const startScreen = this.getDefaultScreen()
            if (startScreen) {
                this.selectedScreenId = startScreen.id
                this.onScreenLoaded(startScreen)
            } else {
                this.selectedScreenId = null
            }
        },
        setScreenByRouter() {
            Logger.log(2, 'Luisa.setScreenByRoute() > enter ', this.$route)
            let key = 'screenName'            
            if (this.config && this.config.router && this.config.router.key) {
                key = this.config.router.key
            }
            const screenName = this.$route.params[key]
            if (screenName) {
                Logger.log(1, 'Luisa.setScreenByRoute() > exit ', screenName, `(${key})`)
                this.loadScreen(screenName)
            } else {
                Logger.log(1, 'Luisa.setScreenByRoute() > exit > set start')
                this.setStartScreen()
            }
        },

        initCustomComponents(components) {
            Logger.log(1, 'Luisa.initCustomComponents()', components)
            //for (let key in components) {
            //    let c = components[key]
            //    //Vue.component(key, c);
            //}
        },
        initViewModel() {
            Logger.log(5, 'Luisa.initViewModel > enter')

            if (this.modelValue && this.model) {

                /**
                 * Fix screen names
                 */
                Object.values(this.model.screens).forEach(screen => {
                    screen.name = Util.getFileName(screen.name)
                })

                /**
                 * Set default data binding
                 */
                if (this.model.data) {
                    Logger.log(5, 'Luisa.initViewModel > enter', this.model.data)
                    for (let key in this.model.data) {
                        JSONPath.set(this.modelValue, key, this.model.data[key])
                    }
                    this.$emit('qViewModelChange', this.modelValue)
                }
                const userData = Services.getUserService().getUser()            
                if (userData && userData.id) {
                    JSONPath.set(this.modelValue, '$flowrabbit.user', {
                        id: userData.id,
                        name: userData.name,
                        lastname: userData.lastname,
                        email: userData.email,
                        acceptedGDPR: userData.acceptedGDPR
                    })
                }
            }
        },
        initReziseListener() {
            window.addEventListener("resize", this.onScreenSizeChange);
        },
        onScreenSizeChange() {
            Logger.log(1, 'Luisa.onScreenSizeChange > enter')
            const change = this.setDeviceType()
            if (change) {
                this.model = this.computeResponsiveModel(this.sourceModel)
                this.computeTreeModel(this.model)
                this.setScreenByRouter()
            }
        },
        getDeviceWidth () {
            if (this.resizeParent === 'iframe') {
                return document.body.clientWidth
            }
            return window.outerWidth
        },
        setDeviceType() {
            Logger.log(1, 'Luisa.setDeviceType > enter')
            const currentDeviceType = this.deviceType
            const w = this.getDeviceWidth()
            const breakpoints = this.mergedConfig.breakpoints
            if (breakpoints) {
                if (w < breakpoints.mobile.max) {
                    Logger.log(2, 'Luisa.setDeviceType > exit mobile', w)
                    this.deviceType = 'm'
                    return currentDeviceType !== this.deviceType
                }
                Logger.log(2, 'Luisa.setDeviceType > exit desktop', w)
                this.deviceType = 'd'
                return currentDeviceType !== this.deviceType
            }
        },
        getMethodExcutor() {
            Logger.log(3, 'Luisa.getMethodExcutor() > ')
            if (this.executor) {
                return this.executor
            }
            return this.$parent
        },
    },
    watch: {
        '$route'() {
            Logger.log(2, 'Luisa.watch(router) > enter')
            if (this.mergedConfig.router.disabled === true) {
                Logger.log(-1, 'Luisa.watch(router) > Diabled')
                return
            }
            this.setScreenByRouter()
            this.scrollToTop()
        },
        'screen'(v) {
            Logger.log(3, 'Luisa.watch(screen) > enter')
            this.setScreen(v)
        },
        'value'(v) {
            Logger.error('Luisa.watch(value) > enter', v)
            //this.value = v
            //this.initViewModel()
        },
        'design'(v) {
            Logger.error('Luisa.watch(design) > enter', v)
            //this.app = v
            //this.setApp(this.app)
        }
    },
    beforeMount() {
    },
    async mounted() {
        Logger.log(2, 'Luisa.mounted() > verion 1.0.17', this.value)
        this.setDeviceType()
        if (this.design) {
            await this.setDesign(this.design)
        }
        if (this.app) {
            Logger.error('Luisa.mounted () > APP is depcreated')
            await this.setDesign(this.app)
        }
        if (this.token && this.user) {
            this.user.token = this.token
        } else {
            console.warn('Luisa.mounted() > No token passed or no user')
        }
        // if (this.user && this.isAppStore) {            
        //     const response = await Services.getStripeService().getCurrentBudget()
        //     this.budget = response.creditsInCentiCent && response.creditsInCentiCent / 10000 || 0
        // }
        if (this.debug) {
            console.warn('Luisa.mounted() > debug property is decrecated. Use "app" instead.')
            await this.loadAppByKey(this.debug)
        }
        if (!this.selected) {
            if (this.screen) {
                this.loadScreen(this.screen)
            } else {
                this.setScreenByRouter()
            }
        } else {
            Logger.log(-1, 'Luisa.mounted() > Selected:', this.selected, this.app)
        }

        if (this.$router && this.$router.mode === 'history') {
            Logger.log(-1, 'Luisa.mounted() > Launch router with history', this.$router)
        }

        this.initReziseListener()
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.onResize);
    }
}
</script>
