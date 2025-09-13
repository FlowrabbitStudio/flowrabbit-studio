<template>
    <div 
        v-if="visible" 
        :class="['ZoomDialogBackground', 
                {'ZoomDialogHidden': step == 0}, 
                {'ZoomDialogAnimation': step >= 2},
                {'ZoomDialogContentVisible': step >= 3}]" 
        @mousedown="onBackdrop">
        <div class="ZoomDialogContainer" ref="container" @click.stop="" @mousedown.stop="">
            <div class="ZoomDialogWrapper" ref="wrapper">
                <div class="ZoomDialogContent" ref="content">
                    <div v-if="getdialogheader()" class="MatcDialogHeader">
                        <span class="MatcDialogHeaderTitle">{{ getdialogheader() }}</span>
                    </div>
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    @import "../../scss/zoom-dialog.scss";
</style>
<script>
export default {
    name: "ZoomDialog",
    props: {
        'closeOnBackdrop': {
            type: Boolean,
            default: true
        }
    },
    data: function () {
      return {
        visible: false,
        step:0
      };
    },
    methods: {
        onBackdrop () {
            if (this.closeOnBackdrop) {
                this.close()
            }
        },
        show (target) {
            const startPos = target ? this.position(target) : {x:0,y:0}
            this.visible = true
            this.step = 0
            setTimeout(() => {
                this.animStep1(startPos)
            }, 100);
        },
        animStep1(startPos) { 
            const container = this.$refs.container
            const content = this.$refs.content      
            const endPos = this.position(content)
            const w = startPos.w / endPos.w
            const h = startPos.h / endPos.h
            const x = Math.round(startPos.x - endPos.x)
            const y = Math.round(startPos.y - endPos.y)
            container.style.transform = `translate(${x}px, ${y}px) scale(${w}, ${h})` //scale(${w}, ${h});
            container.style.opacity = 0.3
            this.step = 1
            setTimeout(() => {
                this.animStep2()
            }, 2);
            setTimeout(() => {
                this.animStep3()
            }, 300);
        },
        animStep2 () {
            this.step = 2
            const container = this.$refs.container
            container.style.transform = `scale(1,1)`
            container.style.opacity = 1
        },
        animStep3 () {
            this.step = 3
        },
        close () {
            this.visible = false
            this.step = 0
        },
        getdialogheader() {
            return this.$attrs && this.$attrs.dialogheader;
        },
        position (node, includeScroll = false) {
            if (node) {
                if (node && node.toLowerCase) {
                    node = document.getElementById(node)
                }
                const clientRect = node.getBoundingClientRect();               
                const ret = {
                    x: clientRect.left, 
                    y: clientRect.top, 
                    w: clientRect.right - clientRect.left, 
                    h: clientRect.bottom - clientRect.top
                };
                if(includeScroll){
                    ret.x += window.scrollX
                    ret.y += window.scrollY
                }
                return ret;
            }
            console.debug('ZoomDialog() return default')
            return {
                x: 0, y:0, w: 100, h:100
            }	
        },
        shake () {
            const wrapper = this.$refs.wrapper;
         
            setTimeout(() => {
                wrapper.style.left = (50) + "px";
            }, 1);

            setTimeout(() => {
                wrapper.style.left = (-50) + "px";
            }, 51);

            setTimeout(() => {
                wrapper.style.left = (50) + "px";
            }, 101);

            setTimeout(() => {
                wrapper.style.left = (-50) + "px";
            }, 151);

            setTimeout(() => {
                wrapper.style.left = (0) + "px";
            }, 201);

        }
    }
}
</script>