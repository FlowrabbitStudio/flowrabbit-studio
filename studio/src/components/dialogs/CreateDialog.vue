<template>
    <ZoomDialog ref="dialog" :dialogheader="dialogHeader">        
        <div key="MatcSurveyDialog" class="MatcDialog MatcCreateDialog">
            <div v-if="tab == 'step1'">
                
                <div class="form-group">
                    <label>{{ $t('create.name') }}</label>
                    <input type="text" class="form-control" v-model="name" :placeholder="$t('create.name-placeholder')"
                        ref="inputName" />
                    <div data-binding-error="name"></div>
                </div>

                <div class="form-group">
                    <label>{{ $t('create.type') }}</label>
                    <ScreenSizeSelector @change="setType" />
                </div>


                <div class="MatcError" v-show="errorMSG && errorMSG.length > 0">
                    {{ errorMSG }}
                </div>
                <div class="MatcButtonBarDialogFull MatcMarginTop">
                    <!-- <a id="createNewApp" class="button is-primary" @click="check">Next</a> -->
                    <a @click="close" class="MatcLinkButtonDialog">Cancel</a>
                    <a id="createNewApp" class="MatcButtonDialog" @click="create">Create</a>
                </div>
            </div>
            <div v-if="tab == 'step2'" class="MatcThemeConfig">
                <div class="form-group">
                    <label>{{ $t('create.theme') }}</label>
                    <div class="MatcThemeConfigThemeCntr">

                            <div class="MatcThemeConfigTheme">
                                <label>Default</label>
                                <button class="MatcButton" @click="setBuildInTheme('default')">Use</button>
                            </div>

                            <div class="MatcThemeConfigTheme">
                                <label>Unter</label>
                                <button class="MatcButton" @click="setBuildInTheme('unter')">Use</button>
                            </div>

                            <div class="MatcThemeConfigTheme">
                                <label>WireFrame</label>
                                <button class="MatcButton" @click="setBuildInTheme('wireframe')">Use</button>
                            </div>
                    </div>
                </div>



                <div class="MatcButtonBarDialog MatcMarginTop">
                    <a @click="close" class="MatcButtonDialog">Cancel</a>
                    <a id="createNewApp" class="MatcLinkButtonDialog" @click="create">Create</a>
                </div>
            </div>

        </div>



    </ZoomDialog>
</template>
<style lang="scss">
    @import 'style/scss/theme_dialog.scss';
    @import "style/components/dialog.scss";
</style>
<script>
import Logger from 'common/Logger'
import ZoomDialog from 'common/ZoomDialog'
import ScreenSizeSelector from "page/ScreenSizeSelector"
import ModelFactory from "core/ModelFactory"
import Services from "services/Services";
import { mapState } from 'vuex'

export default {
    name: 'CreateDialog',
    mixins: [],
    props: ['test', 'app', 'events', 'annotation'],
    data: function () {
        return {
            name: "",
            errorMSG: '',
            theme: 'default',
            tab: 'step1',
            type: null,
            dialogHeader: 'Create new app'
        }
    },
    components: {
        'ZoomDialog': ZoomDialog,
        'ScreenSizeSelector': ScreenSizeSelector
    },
    computed: {
            ...mapState(["selectedOrg"]),
    },
    methods: {
        setType(t) {
            this.type = t;
        },
        check() {

            if (!this.name) {
                this.errorMSG = this.$t('create.name-error')
                this.$refs.dialog.shake()
                return
            }
            this.tab = 'step2'
        },
        setBuildInTheme (value) {
            this.theme = value
        },
        async create() {

            if (!this.name) {
                this.errorMSG = this.$t('create.name-error')
                this.$refs.dialog.shake()
                this.tab = 'step1'
                return
            }
            this.logger.info("create", "enter > user");
            const fac = new ModelFactory();
            const model = fac.createAppModel(this.name, "", this.type);
            const app = await Services.getModelService().createAppInOrg(model, this.selectedOrg.id);
            if (app && app.id) {
                location.href = "#/apps/" + this.selectedOrg.id + "/" + app.id + "/create.html";
            }
        },
        close() {
            this.$refs.dialog.close()
        },
        show(target) {
            this.$refs.dialog.show(target)
            this.tab = 'step1'
            setTimeout(() => {
                if (this.$refs.inputName) {
                    this.$refs.inputName.focus()
                }
            }, 300)
        }
    },
    mounted() {
        this.logger = new Logger('CreateDialog')
    }
}
</script>