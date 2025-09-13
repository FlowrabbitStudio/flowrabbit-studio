<template>
    <div class="Progress">
        <div class="qux-progress-bar">
            <div class="qux-progress-bar-fill" :style="{'width': width, 'background': foreground }">
            </div>
        </div>
    </div>
  </template>
<script>
    import _Base from './_Base.vue'

    export default {
        name: 'qProgressBar',
        mixins: [_Base],
        data: function () {
            return {
            }
        },
        computed: {
            width () {
                if (this.dataBindingInput) {
                    return this.dataBindingInput + '%'
                }
                return this.element.props.value + '%'
            },
            foreground () {
                if (this.element && this.element.style) {
                    return this.element.style.foreground
                }
                return '#333'
            }
        },
        methods: {
        },
        mounted () {
            
        }    
    };
</script>