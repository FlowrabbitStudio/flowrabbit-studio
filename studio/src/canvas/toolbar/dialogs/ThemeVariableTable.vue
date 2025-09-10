
<template>

        <div class=" MatcDialogTableScrollable">
            <table>
                <!-- <thead>
                    <tr>            
                        <th style="width:80%">Name</th>
                        <th>Value</th>
                    </tr>
                </thead> -->
                <tbody>
                    <tr v-for="variable in getTokensByType(['color'])"  :key="variable.id" >
             
                        <td class="" style="width:80%">
                            <div class="MatcThemeConfigVarsRow">
                                <span class="mdi mdi-palette-outline"/>
                                <span class="form-control-label">
                                    {{variable.name}}
                                </span>
                            </div>
                        </td>
                        <td>
                            <ToolbarColor
                                ref="colorWidgets"
                                :isDialog="true"
                                :app="model"
                                :color="variable.value"
                                @change="onChangeVariable(variable.id, $event)"/>
                        </td>
                    </tr>
        
                    <tr v-for="variable in getTokensByType(['fontFamily'])"  :key="variable.id" >                 
                        <td class="">
                            <div class="MatcThemeConfigVarsRow">
                                <span class="mdi mdi-format-text"/>
                                <span class="form-control-label">
                                    {{variable.name}}
                                </span>
                            </div>
                        </td>
                        <td>
                            <ToolbarDropDownButton 
                                :qOptions="fontFamilies" 
                                :qMaxLabelLength="30"
                                :qValue="variable.value" 
                                :qReposition="true"
                                @change="onChangeVariable(variable.id, $event, 'option')"
                                :isDialog="true" >

                            </ToolbarDropDownButton>
                        </td>
                    </tr>

                    <tr v-for="variable in getTokensByType(['fontSize', 'letterSpacing', 'lineHeight', 'borderWidth', 'paddingHorizontal', 'paddingVertical', 'borderRadius'])"  :key="variable.id" >              
                        <td class="">
                            <div class="MatcThemeConfigVarsRow">
                                <span :class="icons[variable.type]"/>
                                <span class="form-control-label">
                                    {{variable.name}}
                                </span>
                            </div>
                        </td>
                        <td>
                           <input class="MatcIgnoreOnKeyPress form-control vommondInlineEdit" :value="variable.value" @change="onChangeVariable(variable.id, $event, 'int')" />
                        </td>
                    </tr>                    
                </tbody>
            </table>         
        </div>

</template>
<style lang="scss">
    @import '../../../style/scss/theme_dialog.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'

import ToolbarColor from '../components/ToolbarColor'
import ToolbarDropDownButton from '../components/ToolbarDropDownButton'

export default {
    name: 'GitExport',
    mixins: [Util, DojoWidget],
    props:['theme', 'model'],
    data: function () {
        return { 
            icons: {
                'fontSize': 'mdi mdi-format-size',
                'letterSpacing': 'mdi mdi-format-text-rotation-none',
                'lineHeight': 'mdi mdi-format-line-spacing',
                'borderWidth' : 'mdi mdi-border-left-variant',
                'paddingHorizontal': 'mdi mdi-arrow-expand-horizontal',
                'paddingVertical': 'mdi mdi-arrow-expand-vertical',
                'borderRadius': 'mdi mdi mdi-crop-square'
            }
        }
    },
    components: {
        //'ExportGit': ExportGit,
        'ToolbarColor': ToolbarColor,
        'ToolbarDropDownButton': ToolbarDropDownButton
    },
    computed: {
        fontFamilies (){
			let fonts = [
				{ value: 'Helvetica Neue,Helvetica,Arial,sans-serif', label: "Helvetica Neue",  css:"MatchFont MatchFontHelvetica"},
				{ value:"Arial, sans-serif", label:"Arial", css:"MatchFont MatchFontArial"},
				{ value: 'Arial Black, Gadget, sans-serif', label : "Arial Black", css:"MatchFont MatchFontArialBlack"},

				{ value: 'Source Sans Pro, sans-serif', label: "Source Sans Pro",  css:"MatchFont MatchSourceSansPro"},
				{ value: 'Roboto, sans-serif', label: "Roboto",  css:"MatchFont MatchFontRoboto"},

				{ value:"Comic Sans MS, cursive, sans-serif", label:"Comic Sans MS", css:"MatchFont MatchFontComic"},
				{ value:"Impact, Charcoal, sans-serif", label:"Impact", css:"MatchFont MatchFontImpact"},
				{ value:"Lucida Sans Unicode, Lucida Grande, sans-serif", label:"Lucida", css:"MatchFont MatchFontLucida"},
				{ value:"Tahoma, Geneva, sans-serif", label:"Tahoma", css:"MatchFont MatchFontTahoma"},

				{ css:"MatcToolbarPopUpLine"},
				{ value:"Georgia, serif", label:"Georgia", css:"MatchFont MatchFontGeorgia"},
				{ value : '"Palatino Linotype", "Book Antiqua", Palatino, serif', label:"Palatino", css: "MatchFontPalatino"},
				{ value: 'Times New Roman, Times, serif', label:"Times New Roman", css:" MatchFont MatchFontTimesNewRoman"},

				{ css:"MatcToolbarPopUpLine"},
				{ value:"Courier New, Courier, monospace", label:"Courier New", css:"MatchFont MatchFontCourier"}
			];

			if (this.model.fonts) {
				fonts.push({ css:"MatcToolbarPopUpLine"});
				this.model.fonts.forEach(f => {
					if (f){
						fonts.push({
							value: f.name,
							label: f.name,
							font: f.name,
							css: 'MatchFont'
						})
					}
				})
			}
			return fonts
		}
    },
    methods: {
        getTokensByType(types) {
            const result = []
            if (this.theme) {
                for (let id in this.theme) {
                    const token = this.theme[id]
                    if (types.indexOf(token.type) > -1) {
                        result.push({
                            id: id,
                            type: token.type,
                            value: token.value,
                            name: this.getName(id)
                        })
                    }
                }
            }
            // result.sort((a, b) => {
            //     return a.id.localeCompare(b.id)
            // })
            return result
        },

        getName (id) {
            return id
                .replace(':hover', ' (Hover)')
                .replace(':focus', ' (Focus)')
                .replace(':error', ' (Error)')
                .replace('@', '')
                .split('-')
                .map(s => this.getCapitalized(s))
                .join(' ')
        },

        getCapitalized (s) {
            const cap = s.charAt(0).toUpperCase()
            const rest = s.slice(1)
            return cap + rest
        },

        onChangeVariable (key, value, type) {
            if (value.target) {
                value = value.target.value
            }
            if (type === 'int') {
                var er = /^-?[0-9]+$/;
                var isInt =  er.test(value);
                if (isInt){
                    value = value * 1
                } else {
                    this.logger.error('onChangeVariable', "No int", value)
                    return
                }
            }
            this.$emit("change", key, value)
        }
    },
    mounted() {
        this.logger = new Logger("ThemeVariableTable");        
    }
}
</script>