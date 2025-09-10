
<template>
	<div class="MatcTreeEditor MatcTree">
        <div class="MatcTreeItem MatcTreeHeader"  >
            <div class="MatcTreeItemRow">
                <span class="MatcTreeIcon"></span>     
                <div class="MatcTreeItemInput">Label</div>
                <div class="MatcTreeItemNav">Target</div>
                <div class="MatcTreeItemNav">Icon</div>
                <span class="MatcTreeItemNav"></span>     
            </div>
        </div>
        <NavigationEditorItem v-for="child in tree.children"
            :screens="screens"
            :parent="tree"
            @change="onChange"
            :level="0"
            :key="child.id"
            class="MatcTreeRootNode"
            :value="child"
            @endEdit="onChildEndEdit"
            @startEdit="onStartEdit"
            @select="onSelect"
            @icon="showIcons"
            @add="onAdd"
            @locked="onChildLocked"
            @hidden="onChildHidden"
            @open="onOpen"
            @dnd="onDnd">
        </NavigationEditorItem>
        <div :class="['MatcTreeItem', 'MatcTreeItemLevel']"  >
            <div class="MatcTreeItemRow MatcTreeItemAdd">
                <span class="MatcTreeIcon"></span>        
                <label class="MatcTreeItemLabel " @click="onAdd(tree)">
                    Add
                </label>                
            </div>                
        </div>
	</div>
</template>
<style lang="scss">
  @import "../../../style/scss/tree_editor.scss";
</style>
<style>

</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import Tree from '../../../common/Tree'
import NavigationEditorItem from './NavigationEditorItem.vue'
export default {
    name: 'TreeEditor',
	mixins:[DojoWidget, Tree],
	props: ["options", "value", "screens"],
    data: function () {
        return {  
            tree: {}  
        }
    },
    components: {
        NavigationEditorItem
    },
    methods: {  
        onAdd (item) {
            console.debug("onAdd", item)
            this.addSibling(item)
        },
        addSibling(item) {
            if (!item.children) {
                item.children = []
            }
            item.children.push({
                id: '1' + new Date().getTime(), 
                label: 'Newww', 
                icon: '', 
                to: "s1"
            })
        },
        onChange () {
            console.debug(JSON.stringify(this.tree, null, 2))
        },
        showIcons (v) {
            console.debug('showIcons', v)
        },
        setValue (v) {
            this.tree = lang.clone(v)
        },
        setScreens (s) {
            this.screens = s
        }
	},
	watch: {
		value (v) {
			this.setValue(v)
		}
	},
    mounted () {
		if (this.value) {
            this.setValue(this.value)
        }
    }
}
</script>