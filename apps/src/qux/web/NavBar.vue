<template>
    <div :class="['qux-navbar', cssClass, type]">
        <router-link v-for="(n, i) in navigation" :key="i"
            :class="['qux-navbar-item', { 'qux-navbar-item-selected': n.selected }]" @click="onClick" :to="getLink(n)">
            <span :class="['qux-navbar-item-icon', n.icon]" v-if="n.icon"></span>
            <label>
                {{ n.label }}
            </label>
        </router-link>
    </div>

</template>
<style lang="scss">
@import '../scss/qux-navbar.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
    name: 'qNavBar',
    mixins: [_Base],
    data: function () {
        return {
        }
    },
    computed: {
        type() {
            if (this.element && this.element.props.type) {
                return this.element.props.type
            }
            return ''
        },
        navigation() {
            if (this.element && this.element.props.navigation) {
                return this.element.props.navigation.map(n => {
                    return n
                })
            }
            return []
        }
    },
    methods: {
        getLink(n) {
            const scrn = this.model.screens[n.to]
            if (scrn) {
                let prefix = ''
                if (this.config && this.config.router && this.config.router.prefix) {
                    prefix = '/' + this.config.router.prefix + '/'
                }
                return `${prefix}${scrn.name}.html`
            }
            return ""
        }
    },
    mounted() {
    }
}
</script>