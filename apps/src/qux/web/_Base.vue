<template>
  <div class="qux-base">
      {{label}}
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-tooltip.scss';
</style>
<script>

import * as Util from '../core/ExportUtil'
import JSONPath from '../core/JSONPath'
import Logger from '../core/Logger'
import Bus from '../core/Bus'
import * as RuleEngine from '../core/RuleEngine'

export default {
  name: '_Base',
  emits: ['update:modelValue', 'qClick', 'click', 'qCallback', 'qActionLine', 'qChange', 'change', 'qKeyPress', 'qFocus', 'qBlur', 'qDesignSystemCallback', 'qScrollTop', 'qViewModelChange', 'qStream'],
  props: {
      'model': {
        type: Object
      },
      'hash': {
        type: String
      },
      'element' : {
        type: Object
      },
      'config': {
        type: Object
      },
      'value': {
      },
      'lbl': {
        type: String
      },
      'url': {
        type: String
      },
      'optionList': {
        type: Array
      },
      'isStandAlone': {
        type: Boolean
      }
  },
  inject: ['viewModel', 'validationErrors', 'luisaAppState'],
  data: function () {
      return {
        hasLabelInOptions: true,
        hasValidationError: false
      }
  },
  directives: {
    tooltip: {
      mounted: (el, binding) => {
          if (binding && binding.value) {
            el.classList.add('qux-tooltip')
            el.setAttribute('data-tt-text', binding.value)
          }
      }
    }
  },
  computed: {
      tooltipText () {
        if (this.element?.props?.tooltipText) {
          return this.element?.props?.tooltipText
        }
        return ''  
      },
      isDesignSystemRoot () {
        return this.element && this.element.isDesignSystemRoot
      },
      hasSlot () {
        return this.$slots.default !== undefined && this.$slots.default !== null
      },
      hasLink () {
        if (this.url && this.url.length > 0) {
          return true
        }
        if (this.element && (this.element.lines && this.element.lines)) {
          let line = this.element.lines.find(l => this.isClick(l))
          if (line && line.validation) {
            return false
          }
          if (line) {
            let box = Util.getBoxById(line.to, this.model)
            if (box.type === 'Screen' && !box.style.overlay) {
             return true
            }
          }
        }
        return false
      },
      hasHistoryRouter () {    
        return this.config.isHistoryRouter === true
      },
      link () {
        if (this.url) {
          return this.url
        }
      
        if (this.element && (this.element.lines && this.element.lines.length  === 1)) {
          let line = this.element.lines.find(l => this.isClick(l))
          if (line) {
            let box = Util.getBoxById(line.to, this.model)
            if (box.type === 'Screen') {
              let prefix = ''
              if (this.config && this.config.router && this.config.router.prefix) {
                prefix = '/' + this.config.router.prefix + '/'
              }
              return `${prefix}${box.name}.html`
            }
          }
        }
        return false
      },
      hasAction () {
        if (this.element.type === "Screen") {
          return false
        }
        return this.element && 
              (this.element.action && Object.values(this.element.action).length > 0) ||
              (this.element.lines && this.element.lines.length > 0) ||
              (this.element.props.callbacks && this.element.props.callbacks.click)
      },
      label () {
        if (this.lbl) {
          return this.lbl
        }
        if (this.dataBindingInputPath && this.dataBindingInputPath.indexOf('$') === 0) {
          let dsRoot = this.getDesignSystemRoot()
          let path = this.dataBindingInputPath.substring(1)
          if (dsRoot) {
            if (dsRoot[path]) {
              return dsRoot[path]
            }
          }
        }
        if (this.element && this.element.props && this.element.props.label) {
          return this.escapeLabel(this.element.props.label)
        }
        return ''
      },
      cssComponentClasses () {
        if (this.element && this.element.cssComponentClasses) {
          return this.element.cssComponentClasses.join(' ')
        }
        return ''
      },
      cssValidation () {      
        if (this.hasValidationError) {
          return ' qux-validation-error'
        }
        return ""
      },
      cssClass () {
        let result = 'qux-element '
        if (this.element) {
          /**
           * FIXME: Move this to CSSFactory
           */
          if (this.element.children && this.element.children.length === 0) {
            if (this.element.style && this.element.style.verticalAlign) {
              result += `qux-valign-${this.element.style.verticalAlign} `
            }
          }
          if (this.hasAction) {
            result += `qux-action `
          }
          if (this.config && this.config.debug && this.config.debug.resize === true) {
            if (this.element.props && this.element.props.resize) {
              let resize = this.element.props.resize
              for (let direction in resize) {
                if (resize[direction]) {
                     result += ` qux-resize-${direction} `
                }
              }
            }
          }

          if (this.element.sharedCssClasses){
            result += this.element.sharedCssClasses.join(' ') + ' '
          }
          result += this.element.cssClass

          /**
           * Add conditional hidden class if we have a 'show' rule
           */
          result += this.conditionalVivibsility
        
        }

        if (Util.isWrapOnMobile(this.element)){
          result += ' qux-mobile-wrap qux-tablet-wrap'
        }

        if (this.hasValidationError) {
          result += ' qux-validation-error'
        }    
        return result
      },

      conditionalVivibsility () {
        Logger.log(5, '_Base.isConditionalHidden() > ')
        if (this.element.props?.condStyles) {
          const showRule = this.element.props.condStyles.find(s => s.state === 'show')
          if (showRule) {
            /**
             * If we have a show rule, we will hide the element,
             * unless the value is true. This is good for loading
             * animations and such.
             */
            const value = JSONPath.get(this.viewModel, showRule.databinding)
            const operation = showRule.operation
            const expected = showRule.value
            const result = RuleEngine.isValueMatchingRule(value, operation, expected)
            if (!result) {              
              return  ' qux-state-hidden'
            }
          }
          const hideRule = this.element.props.condStyles.find(s => s.state === 'hide')
          if (hideRule) {
            /**
             * If we have a hide rule, we will hide the element,
             * only, and only if, the result is true.
             */
            const value = JSONPath.get(this.viewModel, hideRule.databinding)
            const operation = hideRule.operation
            const expected = hideRule.value
            const result = RuleEngine.isValueMatchingRule(value, operation, expected)
            if (result) {              
              return  ' qux-state-hidden'
            }
          }

          const showWhenLoadingRule = this.element.props.condStyles.find(s => s.state === 'showWhenLoading')
          if (showWhenLoadingRule) {
            const isLuisaLoading = this.luisaAppState?.loading
            if (!isLuisaLoading) {              
              return  ' qux-state-hidden'
            }
          }

          const hideWhenLoadingRule = this.element.props.condStyles.find(s => s.state === 'hideWhenLoading')
          if (hideWhenLoadingRule) {
            const isLuisaLoading = this.luisaAppState?.loading
            if (isLuisaLoading) {              
              return  ' qux-state-hidden'
            }
          }
        }
        return ''
      },
      dataBinding () {
        if (this.element && this.element.props && this.element.props.databinding) {
          return this.element.props.databinding
        }
        return null
      },
      dataBindingInput () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.default
          if (path) {
            let value = JSONPath.get(this.viewModel, path)
            Logger.log(5, '_Base.dataBindingInput() > ' + path, `"${value}"`)
            return value
          }
        }
        return null
      },
      dataBindingOptions () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.options
          if (path) {
            let value = JSONPath.get(this.viewModel, path)
            Logger.log(5, '_Base.dataBindingOptions() > ' + path, `"${value}"`)
            return value
          }
        }
        return null
      },
      dataBindingInputPath () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.default
          return path
        }
        return ''
      },
      dataBindingOutputPath () {
        if (this.element && this.element.props && this.element.props.databinding) {
          let path =  this.element.props.databinding.output
          return path
        }
        return ''
      },
      dataBindingLabel () {

        /**
         * First, cgeck if we have set a lbl property
         */
        if (this.lbl) {
          Logger.log(6, '_Base.dataBindingLabel() > lbl ',`"${this.lbl}"`)
          this.afterDataBindingChange(this.lbl)
          return this.lbl
        }
        /**
         * Next, check data binding
         */
        if (this.hasDataBinding) {
          /**
           * Check if we have a magic property path like $label
           */
          if (this.dataBindingInputPath && this.dataBindingInputPath.indexOf('$') === 0) {
            Logger.log(4, '_Base.dataBindingLabel() > props : ',`"${this.dataBindingInputPath}"`)
            let dsRoot = this.getDesignSystemRoot()
            if (dsRoot) {
              let path = this.dataBindingInputPath.substring(1)
              if (dsRoot[path]) {
                this.afterDataBindingChange(dsRoot[path])
                return dsRoot[path]
   
              }
            }
          } else {
            /**
             * If not magic, check if there is a variable
             */
            let value = this.dataBindingInput
            if (value !== undefined && value !== null) {
              Logger.log(5, '_Base.dataBindingLabel() > databinding > ',`"${value}"`)
              this.afterDataBindingChange(value)
              return value
            }
          }
        }
        /**
         * Last, check element properties
         */
        if (this.element && this.element.props && this.element.props.label) {
            const escapted = this.escapeLabel(this.element.props.label)
            this.afterDataBindingChange(escapted)
            return escapted
        }
        this.afterDataBindingChange('')
        return ''
      },
      hasError () {
        return false
      },
      options () {
        if (this.optionList) {
          return this.optionList
        }
        const dataBindingOptions = this.dataBindingOptions
        if (dataBindingOptions && Array.isArray(dataBindingOptions)) {
            return dataBindingOptions
        }
        if (this.element && this.element.props && this.element.props.options){
          const options = this.element.props.options
          if (this.element.props.label && this.hasLabelInOptions) {
            options.unshift(this.element.props.label)
          }
          return options
        }
        return []
      },
      optionsWithValues () {
        if (this.optionList) {
          return this.optionList
        }
        const dataBindingOptions = this.dataBindingOptions
        if (dataBindingOptions && Array.isArray(dataBindingOptions)) {
            return dataBindingOptions.return.map(o => {
                if (o.toLowerCase) {
                    return {
                        label: o,
                        value: o
                    }
                }
                return o
            })
        }
        if (this.element && this.element.props && this.element.props.options){
          const options = this.element.props.options
          let optionValues = {} 
          if (this.element.props.optionValues) {
              for (let i=0; i < options.length; i++) {
                const key = options[i]
                const value = this.element.props.optionValues[i]
                optionValues[key] = value
              }

          }
          if (this.element.props.label && this.hasLabelInOptions) {
            options.unshift(this.element.props.label)
          }
          return options.map((o) => {
                if (o.toLowerCase) {
                    const v = (optionValues[o] !== undefined && optionValues[o] !== null && optionValues[o] !== '') ? optionValues[o] : o
                    return {
                        label: o,
                        value: v
                    }
                }
                return o
            })
        }
        return []
      }
  },
  watch: {   
  },
  methods: {
    fireDefaultValue () {
      if (this.element && this.element.props && this.element.props.selected) {
        let currentViewModelValue = this.dataBindingInput
        // only change when there is no other value defined
        // if there are several widgets with a diferent selected value,
        // all boiund to the same variable, the first one wins
        if (currentViewModelValue === undefined || currentViewModelValue === null) {
          let selected = this.element.props.selected
          console.debug('fireDefaultValue', this.element.name, selected)
          const index = this.element.props.options.indexOf(selected)
          // check also of we have a value for the option
          if (this.element.props.optionValues && this.element.props.optionValues[index] !== undefined) {
            const value = this.element.props.optionValues[index]
            Logger.log(1, '_Base.fireDefaultValue() > value:', value)
            this.onValueChange(value, 'default')
          } else {
            Logger.log(1, '_Base.fireDefaultValue() > selected:', selected)
            this.onValueChange(selected, 'default')
          }
        }
      }
    },
    afterDataBindingChange () {
    },
    stopEvent (e) {
      Logger.log(1, '_Base.stopEvent()')
      if (e) {
        e.stopPropagation()
      }
    },

    getDesignSystemRoot () {
      let parent = this.$parent
      while (parent && parent.element && !parent.element.isDesignSystemRoot) {
        parent = parent.$parent
      }
      if (parent.element && parent.element.isDesignSystemRoot) {
        return parent
      }
    },

    escapeLabel (lbl) {
      lbl = lbl.replace(/&nbsp;/ig, ' ')
      return lbl
    },
    isClick (line) {
      return line.event = 'click'
    },
    hasDataBinding () {
      return this.element && this.element.props && this.element.props.databinding
    },
    /**
     * Default event handlers which just delegate up
     * the hierachy
     */
    onClick (e) {
      this.$emit('qClick', this.element, e, this.getValue())
      this.$emit('click', e)
      this.checkDesignSystemCallback(e, 'click')
      this.fireParentDomEvent('click', e)
    },
    fireParentDomEvent(type, e) {
      /**
        * The wrapper stops our events, so we fire DOM event on parent
        */
      if (this.element && this.element.isDesignSystemRoot) {
        this.$parent.$emit(type, e)
      }
    },
    onChange (e) {
      if (this.isValid()) {
        this.$emit('qChange', this.element, e, this.getValue())
        this.checkDesignSystemCallback(e, 'change')
        this.fireParentDomEvent('change', e)
      } else {
        Logger.log(-1, '_Base.onChange() > Not valid ', this.element)
      }
    },
    onKeyPress (e) {
      this.$emit('qKeyPress', this.element, e, this.getValue())
      this.checkDesignSystemCallback(e, 'change')
      this.fireParentDomEvent('keyPress', e)
    },
    onFocus (e) { 
      this.$emit('qFocus', this.element, e)
      this.fireParentDomEvent('focus', e)
    },
    onBlur (e) {
      this.$emit('qBlur', this.element, e)
      this.fireParentDomEvent('blur', e)
    },
    onMouseOver (e) {
      this.$emit('qMouseOver', this.element, e)
    },
    onMouseOut (e) {
      this.$emit('qMouseOut', this.element, e)
    },
    onStream(e) {
      this.$emit('qStream', this.element, e)
    },
    isValid () {
      if (this.element?.props.validation) {
        const value = this.getValue()
        const result = this.validateInput(value)
        if (!result) {
          this.validationErrors[this.element.id] = true
          this.hasValidationError = true
        } else {
          delete this.validationErrors[this.element.id]
          this.hasValidationError = false
        }
        Logger.log(2, '_Base.isValid() > Not valid input : ' + value,  this.validationErrors)
      }
      return true
    },
    /**
     * Should be overwritten by children
     */
    validateInput (value) {
      Logger.log(-1, '_Base.validateInput() > : ', value)
      return true
    },
    checkDesignSystemCallback (e, type) {
      Logger.log(4, '_Base.checkDesignSystemCallback() > : ' + type, this.element)
      if (this.element && this.element.props && this.element.props.callbacks) {
        let callback = this.element.props.callbacks[type]
        if (callback) {
          Logger.log(1, '_Base.checkDesignSystemCallback() > : ' + this.element.name, type, callback)
          this.$emit('qDesignSystemCallback', this.element, e, type, callback, this.getValue())
          this.emitDesignSystemCallback()
        }
      }
    },

    forwardDesignSystemCallback (element, e, type, callback, elementValue) {
      Logger.log(5, '_Base.forwardDesignSystemCallback() > : ' + this.element.name, element.name)
      this.$emit('qDesignSystemCallback', element, e, type, callback, elementValue)
      this.emitDesignSystemCallback(element, e, type, callback, elementValue)
    },


    emitDesignSystemCallback (element, e, type, callback) {
      if (this.element.isDesignSystemRoot && this.$parent) {
        Logger.log(1, '_Base.emitDesignSystemCallback() > : ' + this.element.name, callback, this.viewModel)
        /**
         * We have to call on parent, because
         * we have this virtual wrapper around.
         */
        this.$parent.$emit(callback, this.viewModel, e)
      }
    },
    /**
     * Template method which can be implemnted by children to
     * give the current value to the onChange
     */
    getValue () {
      return this.dataBindingInput
    },

    getTypedValue (value) {
      // FIXME: later we could use the path here,
      // to check in the schema
      return value
    },

    /**
     * Method which sets the value accoridng to the dataBing path.
     */
    onValueChange (value, key = 'default', e, triggerChange = true) {
      Logger.log(-30, '_Base.onValueChange() > change : ' + this.element.name, value)
      if (this.element && this.element.props && this.element.props.databinding) {
        let path =  this.element.props.databinding[key]
        if (path && this.viewModel != undefined && this.viewModel !== true && this.viewModel !== false) {
          try {
            // we cast the value if needed
            const typedValue = this.getTypedValue(value, path)
            JSONPath.set(this.viewModel, path, typedValue)
            this.$parent.$emit('qViewModelChange', this.element, path, typedValue)
            Logger.log(3, '_Base.onValueChange() > change : ' + path, value, typedValue)
          } catch (ex) {
            Logger.error('_Base.onValueChange() > Could not set value in path:' + path, this.viewModel)
          }
          //Logger.log(-1, '_Base.onValueChange() > exit : ', JSON.stringify(this.value, null, 2))
        } else {
          Logger.error('_Base.onValueChange() >No databing iwth key: ' + key, this.viewModel)
        }
      }

      /**
       * We also trigger the change event
       */
      if (triggerChange) {
        this.$emit('qChange', this.element, e, value)
      }
      
      /**
       * For design system roots, we also fire event
       */
      if (this.element.isDesignSystemRoot && this.$parent) {
        this.$parent.$emit('update:modelValue', value)
        this.$parent.$emit('change', value)
      }
    }
  },
  mounted () {
    this._validationListener = Bus.subscribe(Bus.TOPIC_LUISA_VALIDATION, () => {
      this.isValid()
    })
  },
  beforeUnmount () {
    if (this._validationListener) {
      this._validationListener.remove()
      delete this._validationListene
    }
  }
}
</script>
