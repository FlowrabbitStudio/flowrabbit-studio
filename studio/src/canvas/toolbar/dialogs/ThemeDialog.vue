
<template>
    <div class="MatcThemeConfig">
        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='themes'" :class="{'MatcToolbarTabActive': tab === 'themes'}">{{ getNLS('theme.tab-themes')}}</a>
            <a @click="tab='vars'" :class="{'MatcToolbarTabActive': tab === 'vars'}">{{ getNLS('theme.tab-vars')}}</a>
     
 
        </div>

        <div class="MatcThemeConfigVars  MatcDialogTableScrollable"  v-if="tab === 'vars'">
            <ThemeVariableTable :theme="theme" :model="model" @change="onChangeVariable"></ThemeVariableTable>
        </div>

        <div  v-if="tab === 'themes'" class="MatcThemeConfigThemeCntr">
               
            <div class="MatcThemeConfigTheme">
                <label>Default</label>
                <button class="MatcButton" @click="setBuildInTheme('default')" >Use</button>
            </div>

           <div class="MatcThemeConfigTheme">
                <label>Unter</label>
                <button class="MatcButton" @click="setBuildInTheme('unter')">Use</button>
            </div>

             <!-- 
            <div class="MatcThemeConfigTheme">
                <label>Funky</label>
                <button class="MatcButton" @click="setBuildInTheme('funky')">Use</button>
            </div> -->

            <div class="MatcThemeConfigTheme">
                <label>WireFrame</label>
                <button class="MatcButton" @click="setBuildInTheme('wireframe')">Use</button>
            </div>
        </div>
   

        <div class=" MatcButtonBar MatcMarginTop">
            <a class=" MatcButton" @click="onSave" >{{ getNLS('btn.save')}}</a>
            <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel')}}</a>
        </div>



    </div>
</template>
<style lang="scss">
    @import '../../../style/scss/theme_dialog.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'

import lang from '../../../dojo/_base/lang'
import ThemeVariableTable from './ThemeVariableTable'
import QSS from '../../../core/QSS'

export default {
    name: 'GitExport',
    mixins: [Util, DojoWidget],
    props:['app'],
    data: function () {
        return {
            tab: 'themes',
            model: {},
            theme: {},
            jwtToken: '',
            isPublic: false
        }
    },
    components: {
        'ThemeVariableTable': ThemeVariableTable
    },
    computed: {
        
    },
    methods: {
        

        onSave () {
            this.emit("save", this.theme)
        },

        onCancel () {
            this.emit("cancel")
        },

        onChangeVariable (key, value) {
            this.theme[key].value = value
        },

        setBuildInTheme (name) {
            this.theme = QSS.getTheme(name)
            this.tab = 'vars'
        },

        setModel(m) {
            this.model = m;
            if (m.theme) {
                this.theme = lang.clone(m.theme)
            }
        },

        setPublic(isPublic) {
            this.isPublic = isPublic
        },

        setJwtToken(t) {
            this.jwtToken = t
        },

        setZoom(z) {
            this.zoom = z
        },
        destroy () {
            console.debug('destroy', 'colorWidgets')
        },
        
    },
    mounted() {
        this.logger = new Logger("ThemeDialog");
        if (this.app) {
            this.setModel(this.app)
        }
    }
}
</script>