<template>
    <div :class="'MatcWidgetTypeTabBar ' + type">
    </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
//import css from "dojo/css";
// import lang from "dojo/_base/lang";
import on from "dojo/on";
// import topic from "dojo/topic";
import Logger from "common/Logger";
import DomBuilder from "common/DomBuilder";
import touch from "dojo/touch";

export default {
    name: "TabBar",
    mixins: [DojoWidget, UIWidget],
    data: function () {
        return {
            type: '',
            label: '',
            value: null,
            mode: "edit",
            hasFocus: false
        };
    },
    components: {},
    computed: {
    },
    methods: {
        postCreate() {
            this._borderNodes = [];
            this._backgroundNodes = [this.domNode];
            this._paddingNodes = [];
            this._shadowNodes = [];
            this._labelNodes = [];
        },

        wireEvents() {
            if (!this.wired) {
                this._items.forEach((div, i) => {
                    this.own(this.addClickListener(div, (e) => this.onItemClick(e, i)));
                    this.own(on(div, touch.over, (e) => this.onItemHover(e, i)));
                    this.own(on(div, touch.out, (e) => this.onItemHover(e, null)));
                })
            }
            this.wired = true;
        },

        onItemClick (e, i) {
            this.stopEvent(e)
            const item = this.navigation[i]
            if (item && item.to) {
                this.emit('navigation', item.to)
            }
        },

        onItemHover (e, index) {
            const hover = this.model.hover
            const active = this.model.active
            const style = this.model.style
            this._items.forEach((div, i) => {
                const item = this.navigation[i]
                if (index === i) {
                    this.setDivStyle(div, hover)
                } else {
                    if (item.selected) {
                        this.setDivStyle(div, active)
                    } else {
                        this.setDivStyle(div, style)
                    }
                }
            })
        },

        setDivStyle(div, style) {
            if (style.background) {
                div.style.background = style.background
            }
            if (style.color) {
                div.style.color = style.color
            }
            if (style.borderBottomColor) {
                div.style.borderBottomColor = style.borderBottomColor
            }
            if (style.borderBottomWidth) {
                div.style.borderBottomWidth = style.borderBottomWidth + 'px'
            }
            
        },


        render (model, style, scaleX, scaleY) {
            this.model = model;
            this.type = model.props.type
            this.navigation = model.props.navigation
            this.style = style;
            this._scaleX = scaleX;
            this._scaleY = scaleY;

            this.renderElements(this.navigation, style, scaleX)
            this.setStyle(style, model);
            this.setSelected(this.navigation, this.model.active)
        },

        setSelected (items, active) {
            items.forEach((item, i) => {
                if (item.selected) {
                    const div = this._items[i]
                    this.setDivStyle(div, active)
                }
            })
        },

        renderElements (items) {
            this.domNode.innerHTML = ""
            this._items = []
            this._icons = []
            const cntr = this.db.div("MatcWidgetTypeTabBarCntr").build()
            
            const align = this.style.align
            if (align === 'center' || align === 'right') {
                this._renderSpacer(cntr)
            }

            items.forEach(item => {
                const div = this.db
                    .div("MatcWidgetTypeTabBarItem")
                    .build(cntr)

                if (item.icon) {
                    const icon = this.db
                        .span("MatcWidgetTypeTabBarIcon " + item.icon)
                        .build(div)
                    this._icons.push(icon)
                }
                this.db
                    .span("'MatcWidgetTypeTabBarItemLabel'", item.label)
                    .build(div)
                this._labelNodes.push(div)
                this._paddingNodes.push(div)
                this._items.push(div)
                this._borderNodes.push(div)

            });
       
            if (align === 'center' || align === 'left') {
                this._renderSpacer(cntr)
            }
        

            this.domNode.appendChild(cntr)
            this.cntr = cntr
        },

        _renderSpacer (cntr) {
            const placeholder = this.db
                .div(" MatcWidgetTypeTabBarPlaceholder")
                .build(cntr)
            this._labelNodes.push(placeholder)
            this._paddingNodes.push(placeholder)
            this._borderNodes.push(placeholder)
        },

        _set_itemGap (parent, style) {
            this._items.forEach((div) => {
                const gap = this.getZoomed(style.itemGap, this._scaleY);
                div.style.gap = gap + 'px'
            })
        },

        _set_iconSize (parent, style) {
            this._icons.forEach((div) => {
                const size = this.getZoomed(style.iconSize, this._scaleY);
                div.style.fontSize = size + 'px'
            })
        },

        _set_gap(parent, style) {
     
            if (style.gap === -1) {
                this.cntr.style.gap = '0px'
                this.cntr.style.justifyContent = 'space-between'
            } else {
                const gap = this.getZoomed(style.gap, this._scaleY);
                this.cntr.style.gap = gap + 'px'
            }
        },



    },
    mounted() {
        this.log = new Logger("NavBar");
        this.db = new DomBuilder()
    }
};
</script>