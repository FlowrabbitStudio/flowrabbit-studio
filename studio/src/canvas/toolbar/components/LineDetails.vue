<template>
    <div class="MatcToolbarIconButton MatcToolbarItem">
        <span :class="'MatcToolbarSmallIcon ' + icon"></span>
        <span class="MatcToolbarItemLabel">
            {{ label }}
        </span>

        <span class=" MatcToobarRemoveBtn vommondToolTipCntr">
            <div class=" vommondToolTip vommondToolTipRightBottom">
                <div class=" vommondToolTipArrow"></div>
                <span class=" vommondToolTipLabel">Remove Link</span>
            </div>
            <span class=" mdi mdi-close-circle" @click="onDelete"></span>
        </span>
    </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
export default {
    name: 'LineDetails',
    mixins: [DojoWidget, Util],
    data: function () {
        return {
            value: {},
            label: '?',
            icon: ''
        }
    },
    computed: {
    },
    methods: {

        onDelete () {
            console.debug('onDelete')
            this.emit("onDelete", this.value)
        },

        getBox(id) {
            let to = this.model.screens[id];
            if (!to) {
                to = this.model.widgets[id];
            }
            return to;
        },

        getToIcon() {
            const to = this.getBox(this.value.to)
            let icon = "mdi mdi-link-variant"; //this.getAppTypeIcon(this.model);
            if (this.hasLogic(to)) {
                icon = "MatcToolbarIconAddLogic mdi mdi-checkbox-blank"
            }
            if (this.hasRest(to)) {
                icon = "mdi mdi-cloud"
            }
            if (this.hasScript(to)) {
                icon = "mdi mdi-code-tags"
            }
            return icon
        },

        getLabel() {
            if (this.model && this.value) {
                const to = this.getBox(this.value.to)
                if (to) {
                    return to.name
                }
            }
            return '?'
        },


        setValue(v) {
            this.value = v
            this.label = this.getLabel()
            this.icon = this.getToIcon()
        },


        setModel(m) {
            this.model = m;
        }
    },
    mounted() {
    }
}
</script>