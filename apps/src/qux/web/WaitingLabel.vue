<template>
    <div class="qux-waiting-label">
        <span v-for="i in steps" :key="i" :class="i == selected ? 'qux-waiting-label-selected' : ''">.</span>
    </div>
</template>
<style lang="scss">
@import '../scss/qux-waiting-label.scss';
</style>
<script>

import Logger from '../core/Logger'

export default {
    name: 'WaitingLabel',
    mixins: [],
    data: function () {
        return {
            selected: 0,
            steps: [0,1,2]
        }
    },
    computed: {
       
    },
    methods: {
        animate () {
            this.selected++
            if (this.selected > this.steps.length * 2) {
                this.selected = 0
            }
        },
    },
    mounted() {
        Logger.log(-5, 'WaitingLabel.mounted() enter')
        this.intervalId = setInterval(() => {
            this.animate()
        }, 120)
    },
    beforeUnmount () {
        Logger.log(-5, 'WaitingLabel.beforeUnmount() enter')
        clearInterval(this.intervalId)
    }
}
</script>
  