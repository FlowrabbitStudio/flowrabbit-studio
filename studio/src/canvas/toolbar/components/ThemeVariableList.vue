<template>
  <div class="MatcDesignTokenList MatcThemeList" @mousedown.stop="" @click.stop="">

    <div class=" MatcDesignTokenListSection" v-if="model">

      <div class=" MatcToolbarSectionLabel" @click.stop="showColors = !showColors" @mousedown.stop="">Global Colors</div> 
      <div class="MatcDesignTokenListSectionContent" v-show="showColors">
        <div v-for="(c, i) in colorStyles " :key="c.id"
          class="MatcToolbarItem MatcToolbarColor MatcToolbarDropDownButton" @mousedown.stop=""
          @click.stop="showColor(c, i, $event)" ref="colorNodes">
          <span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator" :style="getColor(c)"></span>
          <span class="MatcToolbarItemLabel">{{ c.label }}</span>
        </div>
      </div>

      <!-- <div class=" MatcToolbarSectionLabel">Form Colors</div>
      <div class="MatcDesignTokenListSectionContent">
        <div v-for="(c, i) in formColors " :key="c.id"
          class="MatcToolbarItem MatcToolbarColor MatcToolbarDropDownButton" @mousedown.stop=""
          @click.stop="showColor(c, i, $event)" ref="colorNodes">
          <span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator" :style="getColor(c)"></span>
          <span class="MatcToolbarItemLabel">{{ c.label }}</span>
        </div>
      </div> -->

      <div class=" MatcToolbarSectionLabel" @click.stop="showFonts = !showFonts" @mousedown.stop="">Global Fonts</div>
      <div class="MatcDesignTokenListSectionContent" v-show="showFonts">

        <div class="MatcToolbarItem MatcToolbarDropDownButton" ref="familyNode" @mousedown.stop=""
          @click.stop="showFontFamily($event)">
          {{ fontFamily }}
        </div>

        <div v-for="(c, i) in fontSizes " :key="c.id" class="MatcToolbarItem MatcToolbarDropDownButton "
          @mousedown.stop="" @click.stop="showFontSize(c, i, $event)" ref="numberNodes">
          <span class="">{{ c.label }}: </span>
          <span class="MatcToolbarItemLabel">{{ c.value }}</span>
        </div>
      </div>


      <div class=" MatcToolbarSectionLabel" @click.stop="showBorder = !showBorder" @mousedown.stop="">Global Border</div>
      <div class="MatcDesignTokenListSectionContent" v-show="showBorder">
        <div v-for="(c, i) in borderProps " :key="c.id" class="MatcToolbarItem MatcToolbarDropDownButton "
          @mousedown.stop="" @click.stop="showBorderSize(c, i, $event)" ref="borderNodes">
          <span class="">{{ c.label }}: </span>
          <span class="MatcToolbarItemLabel">{{ c.value }}</span>
        </div>
      </div>
    </div>

    <div
      :class="['MatcToolbarPopUp MatcLight MatcDesignTokenListPopup MatcToolbarDropDownButtonPopup', { 'MatcDesignTokenListPopupXS': variableType === 'number' }]"
      role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="onPopupClick">
      <div>
        <div class="MatcDesignTokenListPopupSection" v-show="variableType == 'color'">
          <ColorPickerSketch ref="colorSettings" @resize="onResize" @change="onChangeColor" />
        </div>
        <div class="MatcDesignTokenListPopupSection MatcDesignTokenListPopupSectionFonts"
          v-show="variableType == 'fontFamily'">
          <ul>
            <template v-for="(f, i) in fontFamilies">
              <li v-if="f.value" :key="i" @click="onChangeFont(f)" :class="getFontCSS(f)">
                {{ f.value }}
              </li>

            </template>

          </ul>
        </div>

        <div class="" v-show="variableType == 'number'">
          <ul>
            <li v-for="n in numbers" :key="n" @click="onChangeNumber(n)"
              :class="{ 'MatcToolbarPopupSelected': n === selectedNumber }">
              {{ n }}
            </li>

          </ul>
        </div>


        <div class="MatcDesignTokenListPopupSection" v-show="variableType !== 'number'">
          <div class="MatcButtonBar">
            <a class="MatcLinkButtonDialog" @click="onCancel">Cancel</a>
            <a class="MatcButton MatcButtonPrimary" @click="onSave">Save</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import '../../../style/scss/toolbar_theme.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import _DropDown from './_DropDown'
import ColorPickerSketch from 'common/ColorPickerSketch'

import Logger from 'common/Logger'
import topic from 'dojo/topic'
//import Input from '../../../common/Input.vue'

export default {
  name: 'DesignTokenBtn',
  mixins: [DojoWidget, _DropDown],
  data: function () {
    return {
      model: null,
      visible: true,
      reposition: true,
      arrowPosition: "right",
      fontFamilies: [],
      selectedColor: '',
      selectedNumber: 0,
      selectFontFamily: '',
      variableType: '',
      numbers: [0, 1, 2, 4, 8, 10, 12, 14, 16, 24, 32, 64, 96, 128],
      showColors: true,
      showBorder: true,
      showFonts: true,
      colorStyles: [
        {
          label: 'Text Color',
          id: '@label-color',
          keys: [
            '@label-color',
            '@form-color',
            '@form-color:hover',
            '@button-passive-color',
            '@button-passive-color:hover'
          ]
        },
        {
          label: 'Screen Background',
          id: '@screen-background',
          keys: [
            '@screen-background', 
            '@form-popup-background', 
            '@form-popup-color:hover', 
            '@table-header-background'
          ]
        },

        {
          label: 'Primary Foreground',
          id: '@button-primary-color',
          keys: [
            '@color-active:hover',
            '@color-active',
            '@button-primary-color', 
            '@button-primary-color:hover', 
            '@button-secundary-background', 
            '@button-secundary-color:hover', 
            '@button-danger-color', 
            '@button-danger-color:hover', 
          ]
        },       
        {
          label: 'Primary Background',
          id: '@button-primary-background',
          keys: [
            '@button-primary-background',
            '@button-primary-border-color',
            '@background-active',
            '@color-passive',
            '@color-passive:hover',
            '@button-secundary-border-color',
            '@button-secundary-color',
            '@form-border-color:focus',
            '@form-color:focus',
            '@form-popup-background:hover',
          ]
        },
        {
          label: 'Primary Background (Hover)',
          id: '@background-active:hover',
          keys: [
            '@background-active:hover', 
            '@button-primary-border-color:hover', 
            '@button-primary-background:hover', 
            '@button-secundary-border-color:hover', 
            '@button-secundary-background:hover'
          ]
        },
        {
          label: 'Danger',
          id: '@color-danger',
          keys: [
            '@form-border-color:error',
            '@form-color:error',
            '@color-danger',
            '@color-danger:hover',
            '@button-danger-background',
            '@button-danger-border-color'
          ]
        },
        {
          label: 'Danger (Hover)',
          id: '@button-danger-border-color:hover',
          keys: [
            '@button-danger-border-color:hover',
            '@button-danger-background:hover'
          ]
        },
        {
          label: 'Danger Light',
          id: '@background-danger',
          keys: [
            '@background-danger',
            '@background-info:danger',
            '@form-background:error',
            '@button-danger-border-color',
            '@button-danger-background'
          ]
        },
        {
          label: 'Passive Foreground',
          id: '@button-passive-color',
          keys: [
            '@button-passive-color'
          ]
        },
        {
          label: 'Passive Background',
          id: '@button-passive-background',
          keys: [
            '@background-passive', 
            '@background-passive:hover', 
            '@form-background:hover', 
            '@form-background:focus', 
            '@button-passive-border-color', 
            '@button-passive-background', 
            '@button-passive-border-color:hover', 
            '@button-passive-background:hover'
          ]
        },
        {
          label: 'Form Border',
          id: '@form-border-color',
          keys: [
            '@form-border-color',
            '@form-border-color:hover',
            '@form-popup-border-color'
          ]
        },
        {
          label: 'Form Background',
          id: '@form-background',
          keys: [
            '@form-background'
          ]
        },
        {
          label: 'Panel Background',
          id: '@panel-background',
          keys: [
            '@panel-background'
          ]
        },
        {
          label: 'Panel Border',
          id: '@panel-border-color',
          keys: [
            '@panel-border-color'
          ]
        }
      ],
      fontSizes: [
        {
          label: 'Font Size - S',
          id: '@font-size-s',
          keys: ['@font-size-s']
        },
        {
          label: 'Font Size - M',
          id: '@font-size-m',
          keys: ['@font-size-m']
        },
        {
          label: 'Font Size - L',
          id: '@font-size-l',
          keys: ['@font-size-l']
        }
      ],
      borderProps: [
        {
          label: 'Border Width',
          id: '@border-width',
          keys: ['@border-width', '@panel-border-width']
        },
        {
          label: 'Border Radius',
          id: '@border-radius',
          keys: ['@border-radius', '@panel-border-radius']
        },
      ]
    }
  },
  components: {
    // 'ShadowSettings': ShadowSettings,
    'ColorPickerSketch': ColorPickerSketch
    // 'TextProperties': TextProperties,
    // 'BoxBorder': BoxBorder,
    // 'BoxPadding': BoxPadding,
    // 'GradientPicker': GradientPicker,
    //'TooltipSettings': TooltipSettings
  },
  computed: {
    fontFamily() {
      const variable = this.model.theme['@font-family']
      if (variable) {
        return variable.value
      }
      return ''
    }

  },
  methods: {
    getColor(c) {
      return `background: ${c.value};`
    },

    getFontCSS(f) {
      let result = f.css
      if (this.selectFontFamily == f.value) {
        result += ' MatcToolbarPopupSelected'
      }
      return result
    },

    showFontFamily(e) {
      const node = this.$refs.familyNode
      if (!node) {
        console.debug('showFontFamily() > no node')
        return
      }
      this.variableType = 'fontFamily'
      const variable = this.model.theme['@font-family']
      this.selectedVaribale = {
        id: '@font-family',
        value: variable.value,
        keys: ['@font-family']
      }
      this.selectFontFamily = this.selectedVaribale.value
      this.popupRootNode = node
      this.hideDropDown()
      this.$nextTick(() => this.showDropDown(e, true))
    },

    onChangeFont(f) {
      this.selectedVaribale.value = f.value
      this.selectFontFamily = f.value
    },

    showColor(c, i, e) {
      const node = this.$refs.colorNodes[i]
      if (!node) {
        console.debug('showColor() > no node')
        return
      }
      this.variableType = 'color'
      this.selectedVaribale = c
      this.selectedColor = c.value
      this.$refs.colorSettings.setValue(this.selectedColor)
      this.popupRootNode = node
      this.hideDropDown()
      this.$nextTick(() => this.showDropDown(e, true))
    },

    onChangeColor(color) {
      this.selectedVaribale.value = color
    },

    showFontSize(c, i, e) {
      const node = this.$refs.numberNodes[i]
      if (!node) {
        return
      }
      this.variableType = 'number'
      this.selectedVaribale = c
      this.selectedNumber = c.value
      this.popupRootNode = node
      this.hideDropDown()
      this.$nextTick(() => this.showDropDown(e, true))
    },

    showBorderSize(c, i, e) {
      const node = this.$refs.borderNodes[i]
      if (!node) {
        return
      }
      this.variableType = 'number'
      this.selectedVaribale = c
      this.selectedNumber = c.value
      this.popupRootNode = node
      this.hideDropDown()
      this.$nextTick(() => this.showDropDown(e, true))
    },

    onChangeNumber(n) {
      this.selectedNumber = n
      this.selectedVaribale.value = n
      this.onSave()
      this.$forceUpdate()
    },

    onPopupClick() {
      topic.publish('matc/dropdown/child')
    },

    setFontFamilies(f) {
      this.fontFamilies = f
      // if (this.family){
      //   this.family.setOptions(this.fontFamilies);
      // }
    },

    onCanvasClick(id, type, e) {
      if (!e || !e.isChildDropDown) {
        this.hideDropDown(id, type);
      }
    },

    onHide() {
    },

    onSave() {
      if (this.selectedVaribale) {
        this.emit('change', this.selectedVaribale)
      }
      this.selectedVaribale = null
      this.hideDropDown()
      this.$forceUpdate()
    },

    onCancel() {
      this.hideDropDown()
    },

    onResize() {
      this.updatePosition()
    },


    getPopupRootNode() {
      if (this.popupRootNode) {
        return this.popupRootNode
      }
      return this.domNode
    },

    buildList() {
      const values = {}
      for (let k in this.model.theme) {
        const variable = this.model.theme[k]
        const value = variable.value
        if (!values[value]) {
          values[value] = []
        }
        values[value].push(k)
      }
      this.colorStyles.forEach(c => {
        const variable = this.model.theme[c.id]
        console.debug('>', c.id, variable.value, values[variable.value])
      })
    },

    setModel(m) {
      this.model = null
      this.model = m
      //this.buildList()
      this.colorStyles.forEach(c => {
        if (this.model.theme[c.id]) {
          const variable = this.model.theme[c.id]
          c.type = variable.type
          c.value = variable.value
        }
      })
      this.fontSizes.forEach(c => {
        if (this.model.theme[c.id]) {
          const variable = this.model.theme[c.id]
          c.type = variable.type
          c.value = variable.value
        }
      })
      this.borderProps.forEach(c => {
        if (this.model.theme[c.id]) {
          const variable = this.model.theme[c.id]
          c.type = variable.type
          c.value = variable.value
        }
      })
      const variable = this.model.theme['@font-family']
      if (variable) {
        this.selectFontFamily = variable.value
      }
      this.$forceUpdate()
    }

  },
  mounted() {
    this.logger = new Logger('DesignTokenList')
  }
}
</script>