
<template>

    <div class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton" @click="showDialog" v-if="!condStyles">

			<label class="MatcToolbarItemIcon">
				<span class="mdi mdi-plus-circle"></span>
			</label>
			<span class="MatcToolbarItemLabel">{{this.getNLS('toolbar.condstyle.create')}}</span>

    </div>
    <div v-else @click="showDialog" class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton">

			<label class="MatcToolbarItemIcon">
				<span class="mdi mdi-circle-edit-outline"></span>
			</label>
			<span class="MatcToolbarItemLabel">{{this.getNLS('toolbar.condstyle.edit')}}</span>
            <span class="MatcToobarRemoveBtn" @click.stop="removeCondStyle">
                <span class="mdi mdi-close-circle"></span>
            </span>

    </div>

     
   


</template>
<style lang="scss">
	@import '../../../style/scss/toolbar_conditional_style.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import on from 'dojo/on'
import ConditionalStyleSettings from './ConditionalStyleSettings'
import lang from 'dojo/_base/lang'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'

export default {
    name: 'ConditionalStyleButton',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            element: null
        }
    },
    components: {
    },
    computed: {
        condStyles() {
            if (this.element && this.element?.props?.condStyles && this.element.props.condStyles.length > 0) {
               return this.element.props.condStyles[0]
            }
            return null
        }
    },
    methods: {

        removeCondStyle () {
            this.emit('change', [])
        },

        showDialog (e) {

            const value = this.element?.props?.condStyles && this.element.props.condStyles.length > 0
                ? this.element.props.condStyles[0] 
                : {state:null}

            const db = new DomBuilder();
			const popup = db.div("  ").build();
			const cntr = db.div("").build(popup);

            const settings = this.$new(ConditionalStyleSettings);
            settings.setModel(this.model)
			settings.setValue(value);
            settings.setSchema(this.schema)
			settings.placeAt(cntr);
       
            const d = new Dialog({overflow:true});
			d.autoClose = false


			// const bar = db.div("MatcButtonBarDialog MatcButtonBarDialogPadding").build(popup);
			// const cancel = db.a("MatcLinkButtonDialog", "Cancel").build(bar);
			// const write = db.div("MatcButtonDialog", "Save").build(bar);

            settings.on('cancel', () => {
                d.close()
            })
            settings.on('save', () => {
                this.onChange(d, settings, this.widget)
            })
			

			// d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			// d.own(on(write, touch.press, lang.hitch(this,"onChange", d, settings, this.widget)));
			d.own(on(d, "close", () => {
				settings.destroy();
			}));
			d.popup(popup, e.target);

        },

        onChange (d, settings) {
            const value = settings.getValue()
            if (value) {
                this.emit('change', [value])
            } else {
                this.emit('change', [])
            }
            d.close()
        },

        setModel (m) {
            this.model = m
        },
        setSchema (schema) {
            this.schema = schema
        },

        setValue(widget) { 
            this.element = lang.clone(widget)        
        },
    
    },
    mounted () {
    }
}
</script>