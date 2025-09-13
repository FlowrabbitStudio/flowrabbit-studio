<template>
    <div :class="['qux-tabbar', cssClass]">
        <div class="qux-tabbar-placeholder" v-if="isRight || isCenter"></div>
        <div v-for="(n, i) in navigation" :key="i"
            :class="['qux-tabbar-item', { 'qux-tabbar-item-selected': n.selected }]" @click="selectTab(i, n, $event)">
            <span :class="['qux-tabbar-item-icon', n.icon]" v-if="n.icon"></span>
            <label>
                {{ n.label }}
            </label>
        </div>
        <div class="qux-tabbar-placeholder" v-if="isLeft || isCenter"></div>
    </div>

</template>
<style lang="scss">
@import '../scss/qux-tabbar.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
    name: 'qNavBar',
    mixins: [_Base],
    data: function () {
        return {
            selectedTabIndex: -1
        }
    },
    computed: {
        isRight() {
            if (this.element && this.element.style.align) {
                return this.element.style.align === 'right'
            }
            return false
        },
        isLeft() {
            if (this.element && this.element.style.align) {
                return this.element.style.align === 'left'
            }
            return false
        },
        isCenter() {
            if (this.element && this.element.style.align) {
                return this.element.style.align === 'center'
            }
            return false
        },
        navigation() {
            if (this.element && this.element.props.navigation) {
                return this.element.props.navigation.map((n, i) => {
                    if (this.selectedTabIndex > -1) {
                        n.selected = i === this.selectedTabIndex 
                    }
                    return n
                })
            }
            return []
        }
    },
    methods: {
        selectTab (i, item, e) {
            this.selectedTabIndex = i
            if (item && item.to) {
                this.onValueChange(item.to, 'default')
                this.onClick(e)
            } else {
                console.error('onClick')
            }
        }
    },
    mounted() {
       
    }
}
</script>