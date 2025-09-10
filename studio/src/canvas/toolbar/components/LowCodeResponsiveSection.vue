<template>
    <div class="MatcToolbarLowCode">
        <template v-if="!isFixed">

                <div class="MatcToolbarFlexCntr">
                    <span class="MatcToolbarItemLabel">Min Width:</span>
                    <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" :value="minWidth" @change="onMinWidthChange" placeholder="Enter value" />
                </div>
      
    
                <div class="MatcToolbarFlexCntr" v-if="!isFixed">
                    <span class="MatcToolbarItemLabel">Max Width: </span>
                    <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" :value="maxWidth" @change="onMaxWidthChange" placeholder="Enter value"/>
                </div>
    

                <div class="MatcToolbarFlexCntr">
                    <span class="MatcToolbarItemLabel">Min Height:</span>
                    <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" :value="minHeight" @change="onMinHeightChange" placeholder="Enter value" />
                </div>
      
    
                <div class="MatcToolbarFlexCntr" v-if="!isFixed">
                    <span class="MatcToolbarItemLabel">Max Height: </span>
                    <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" :value="maxHeight" @change="onMaxHeightChange" placeholder="Enter value"/>
                </div>
        </template>
        <div v-else class="MatcToolbarItem MatcToolbarGridFull">
            This element has a fixed width
        </div>

        <CheckBox class="MatcToolbarItem" label="Wrap on mobile" :value="isWrap" @change="onWrapChange" v-show="hasReponsive"/>

    </div>
</template>
<script>

import DojoWidget from 'dojo/DojoWidget'
import _Tooltip from 'common/_Tooltip'
import CheckBox from 'common/CheckBox'

export default {
    name: 'LowCodeSection',
    mixins: [DojoWidget, _Tooltip],
    data: function () {
        return {
            widget: null,
            minWidth: '',
            maxWidth: '',
            maxHeight: '',
            minHeight: '',
            isWrap: false
        }
    },
    components: {
        'CheckBox': CheckBox
        // 'ToolbarDropDownButton': ToolbarDropDownButton,
        // 'InputDropDownButton': InputDropDownButton
    },
    computed: {
        hasReponsive () {        
            if ( this.widget &&  (this.widget.type == 'Button' || this.widget.type == 'ColumnContainer')) {
                return true
            }
            return false
        },
        isFixed() {
            let e = this.widget
            return e && e.props && e.props.resize && e.props.resize.fixedHorizontal
        }
    },
    methods: {
        onWrapChange(value) {
            this.isWrap = value
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'wrapOnMobile', value)
            } else {
                this.emit('changeStyle', 'wrapOnMobile', value)
            }
        },
        onMinHeightChange (e) {
            let value = e.target.value
            if (this.isInt(value)) {
                value = value * 1
                if (this.isGroup) {
                    this.emit('changeGroupStyle', 'minHeight', value)
                } else {
                    this.emit('changeStyle', 'minHeight', value)
                }
            }
        },
        onMaxHeightChange (e) {
            let value = e.target.value
            if (this.isInt(value)) {
                value = value * 1
                if (this.isGroup) {
                    this.emit('changeGroupStyle', 'maxHeight', value)
                } else {
                    this.emit('changeStyle', 'maxHeight', value)
                }
            }
        },
        onMinWidthChange(e) {
            let value = e.target.value
            if (this.isInt(value)) {
                value = value * 1
                if (this.isGroup) {
                    this.emit('changeGroupStyle', 'minWidth', value)
                } else {
                    this.emit('changeStyle', 'minWidth', value)
                }
            }
        },
        onMaxWidthChange(e) {
            let value = e.target.value
            if (this.isInt(value)) {
                value = value * 1
                if (this.isGroup) {
                    this.emit('changeGroupStyle', 'maxWidth', value)
                } else {
                    this.emit('changeStyle', 'maxWidth', value)
                }
            }
        },

        isInt(value) {
            var er = /^-?[0-9]+$/;
            return er.test(value);
        },

        setValue(widget, isGroup = false) {
            this.isGroup = isGroup
            this.widget = widget
            if (widget.style && widget.style.minWidth !== undefined) {
                this.minWidth = widget.style.minWidth
            } else {
                this.minWidth = ''
            }
            if (widget.style && widget.style.maxWidth !== undefined) {
                this.maxWidth = widget.style.maxWidth
            } else {
                this.maxWidth = ''
            }

            if (widget.style && widget.style.maxHeight !== undefined) {
                this.maxHeight = widget.style.maxHeight
            } else {
                this.maxHeight = ''
            }
            if (widget.style && widget.style.minHeight !== undefined) {
                this.minHeight = widget.style.minHeight
            } else {
                this.minHeight = ''
            }

            if (widget.style && widget.style.wrapOnMobile) {
                this.isWrap = true
            } else {
                this.isWrap = false
            }
        }
    },
    mounted() {
        if (this.$refs.tooltipMinWidth) {
            this.addTooltip(this.$refs.tooltipMinWidth, 'Relvant in preview')
        }
    }
}
</script>