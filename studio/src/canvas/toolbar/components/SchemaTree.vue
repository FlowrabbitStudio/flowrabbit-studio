<template>

    <div class="MatcSchemaTree">
        <Tree :value="root" @open="onOpen" @select="onSelect" @actionEdit="onChildActionEdit"
            @actionDelete="onChildActionDelete" @changeLabel="onChangeLabel" />
    </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import Tree from 'common/Tree'

export default {
    name: 'DataList',
    props: ['schema', 'includeMasterNodes', 'hasChildSelect', 'hasOptions', 'ignoreEdit'],
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            selection: [],
            collapsed: {},
            openNodes: {},
            root: {},
            trees: [],
            nodes: {},
            isVisible: true,
            isDebug: false,
            sidebarName: "Variables"
        }
    },
    components: {
        'Tree': Tree
    },
    methods: {
        postCreate() {
            this.logger = new Logger("SchemaTree");
            this.logger.log(2, "constructor", "entry > " + this.mode);
        },


        isTreeCollapsed(tree) {
            if (this.collapsed[tree.id] !== null && this.collapsed[tree.id] != undefined) {
                return this.collapsed[tree.id]
            }
            return false
        },

        toggleTreeCollapsed(tree) {
            if (this.collapsed[tree.id] !== null && this.collapsed[tree.id] != undefined) {
                this.$set(this.collapsed, tree.id, !this.collapsed[tree.id])
            } else {
                this.$set(this.collapsed, tree.id, true)
            }
        },


        onOpen(id, open) {
            this.logger.log(1, "onOpen", "entry > ", id + ': ' + open);
            this.openNodes[id] = open
        },

        onSelect(ids) {
            this.logger.log(2, "onSelect", "entry > ", ids);
            this.$emit("select", ids)
        },

        onChildActionEdit(id, e) {
            this.$emit('edit', id, e)
        },
        onChildActionDelete(id, e) {
            this.$emit('delete', id, e)
        },
        onChangeLabel(id, txt) {
            this.logger.log(1, "onChangeLabel", "entry > ", id + ': ' + txt);
            this.$emit('change', id, txt)
        },

        render(schema) {
            this.logger.log(2, "render", "enter > ", schema);
            this.schema = schema;
            this.createNestedModel(schema)
        },

        createNestedModel(schema) {
            const result = [];
            const root = {
                name: "",
                id: "root",
                children: []
            };
            this.nodes = {}
            const keys = Object.keys(schema)
            keys.sort((a,b) => {
                return a.localeCompare(b, undefined, {sensitivity: 'base'})
            })
            keys.forEach(key => {
                const child = schema[key]
                let tree = this.createTree(key, child)
                root.children.push(tree)
            })
            this.trees = result
            this.root = root
        },

        createTree(id, value) {

            if (this.openNodes[id] === undefined) {
                this.openNodes[id] = true
            }
            const tree = {
                name: value.title,
                label: value.title,
                id: id,
                domId: this.getScrollId(id),
                css: 'MatcToolbarLayerListScreen',
                icon: this.getNodeIcon(value),
                closeIcon: this.getCloseIcon(),
                openIcon: this.getOpenIcon(),
                open: this.openNodes[id],
                type: 'element',
                children: [],
                hasOptions: this.hasOptions,
                hasEdit: true,
                hasDelete: true,
                ignoreEdit: this.ignoreEdit,
                hasChildSelect: this.hasChildSelect
            };
            if (value.defaultValue) {
                tree.defaultValue = value.defaultValue + ''
            }
            this.nodes[id] = tree

            if (this.selection && this.selection.indexOf(tree.id) >= 0) {
                tree.selected = true
            }

            this.createChildren(id, value, tree)


            return tree
        },

        createChildren(parentID, parent, parentNode) {
            let properties;
            if (parent.properties) {
                properties = parent.properties
            }
            if (parent.items && parent.items.properties) {
                properties = parent.items.properties
            }

            if (!properties) {
                return
            }

            const keys = Object.keys(properties)
            keys.sort((a,b) => {
                return a.localeCompare(b, undefined, {sensitivity: 'base'})
            })

            keys.forEach(key =>{
                const value = properties[key]
                const id = `${parentID}.${key}`
                if (this.openNodes[id] === undefined) {
                    this.openNodes[id] = true
                }
                const node = {
                    name: value.title,
                    label: value.title,
                    id: id,
                    domId: this.getScrollId(id),
                    css: '',
                    icon: this.getNodeIcon(value),
                    closeIcon: this.getCloseIcon(),
                    openIcon: this.getOpenIcon(),
                    open: this.openNodes[id],
                    type: 'element',
                    children: [],
                    hasOptions: this.hasOptions,
                    hasEdit: true,
                    hasDelete: true,
                    ignoreEdit: this.ignoreEdit,
                    hasChildSelect: this.hasChildSelect
                };
                this.nodes[id] = node
                // swap here hint and name...
                if (value.defaultValue) {
                    node.defaultValue = value.defaultValue
                }
                parentNode.children.push(node)

                this.createChildren(id, value, node)
            })
        },

        getScrollId(id) {
            return 'layerListItem' + id
        },

        getCloseIcon() {
            return 'mdi mdi-chevron-right MatcTreeIcon' // mdi-select
        },

        getOpenIcon() {
            return 'mdi mdi-chevron-down MatcTreeIcon'
        },


        getNodeIcon(value) {
            if (value.type === 'array') {
                return "mdi mdi-code-brackets";
            }
            if (value.type === 'object') {
                return "mdi mdi-code-braces";
            }
            if (value.type === 'number') {
                return "mdi mdi-numeric-1-box"
            }
            return "mdi mdi-code-string";
        },


        changeName(box) {
            let node = this.nodes[box.id]
            if (node) {
                this.$set(node, 'label', box.name)
            } else {
                let tree = this.trees.find(t => t.id === box.id)
                if (tree) {
                    this.$set(tree, 'name', box.name)
                } else {
                    /**
                     * This can happen for REST and OR nodes,
                     * which are not shown in the tree
                     */
                    this.logger.warn('changeName', 'No node with id: ' + box.id)
                }
            }
        },

        unSelect() {
            this.unSelectNodes()
        },

        selectGroup(groupID) {
            this.selectNode([groupID])
        },

        selectWidget(widgetID) {
            this.selectNode([widgetID])
        },

        selectSVGPath(widgetID, pathID) {
            const id = this.getPathId(widgetID, pathID)
            this.selectNode([id])
        },

        selectMulti(ids) {
            this.selectNode(ids)
        },

        selectScreen(screenID) {
            this.selectNode([screenID])
        },

        selectScreens(screenIDs) {
            this.selectNode(screenIDs)
        },


        selectNode(ids) {
            this.unSelectNodes()
            this.selection = ids
            this.$nextTick(() => {
                ids.forEach(id => {
                    const node = this.nodes[id]
                    if (node) {
                        this.$set(node, 'selected', true)
                    } else {
                        this.logger.log(4, 'selectNode', 'No node with id: ' + id)
                    }
                })
                this.scrollToSelection(ids)
                this.$forceUpdate()
            })
        },

        getSelectedWidgetIds() {
            const result = new Set()
            if (this.selection) {
                this.selection.forEach(id => {
                    let node = this.nodes[id]

                    if (node.type === 'widget') {
                        result.add(node.widgetID)
                    }
                    if (node.type === 'group') {
                        this._getGroupChildren(node, result)
                    }
                })
            }
            return Array.from(result)
        },

        _getGroupChildren(node, result) {
            if (node.children) {
                node.children.forEach(child => {

                    if (child.type === 'widget') {
                        result.add(child.widgetID)
                    }
                    if (child.type === 'group') {
                        this._getGroupChildren(child, result)
                    }
                })
            }
        },

        scrollToSelection(ids) {
            const id = ids[0]
            if (id) {
                const element = document.getElementById(this.getScrollId(id))
                if (element) {
                    element.scrollIntoViewIfNeeded(true)
                } else {
                    this.logger.log(4, 'scrollToSelection', 'No node with id: ' + this.getScrollId(id))
                }
            }
        },

        unSelectNodes() {
            for (let id in this.nodes) {
                let node = this.nodes[id]
                this.$set(node, 'selected', false)
                //this.$set(node, 'scroll', false)
            }
        }
    },
    watch: {
        schema(v) {
            this.render(v)
        }
    },
    mounted() {
        if (this.schema) {
            this.render(this.schema)
        }
    }
}
</script>