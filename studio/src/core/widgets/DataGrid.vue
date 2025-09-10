<template>
    <div :class="['qux-datagrid', cssClass]">

        <table>
            <thead>
                <tr>
                    <th v-for="col in columns" :key="col.id" :class="'qux-table-cell qux-table-column-' + col.id"
                        @click="sortBy(col)">

                        {{ col.label }}

                        <span v-if="sortColumn.id == col.id && sortOrder === 'asc'" class="mdi mdi-chevron-down">

                        </span>
                        <span v-if="sortColumn.id == col.id && sortOrder !== 'asc'" class="mdi mdi-chevron-up">

                        </span>
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="row in sortedRows" :key="row.id" class="qux-table-row">
                    <td v-if="hasCheckBox" class="qux-table-cell">
                        <CheckBox :value="isRowSelected(row)" @change="selectRow(row)" />
                    </td>
                    <td v-for="(value, i) in row.values" :key="i"
                        :class="'qux-table-cell qux-table-column-style-' + i + ' qux-table-column-' + i">
                        {{ value }}
                    </td>
                    <td v-if="hasActions" class="qux-table-action-cntr">
                        <a v-for="(action, i) in actions" @click="onActionClick(action, row)" :key="action.label"
                            :class="['qux-table-action', 'qux-table-action-' + i, { 'qux-table-action-hover': action.isHover }]">
                            {{ action.label }}
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style lang="scss">
  @import "../../style/widgets/datagrid.scss";
</style>
<script>
import DojoWidget from "dojo/DojoWidget";
import UIWidget from "core/widgets/UIWidget";
import CSSUtil from 'core/CSSUtil'
import CSSFactory from './css/CSSFactory'

export default {
    name: "DataGrid",
    mixins: [UIWidget, DojoWidget],
    data: function () {
        return {
            value: null,
            modelID: '',
            element: null,
            selected: [],
            sortColumn: '',
            sortOrder: 'arc'
        };
    },
    components: {},
    computed: {
        cssClass() {
            return this.modelID
        },
        columns() {
            if (this.element) {
                let columns = []
                if (this.element.props.columns && this.element.props.columns.length > 0) {
                    columns = this.element.props.columns.map((col) => col.label)
                } else {
                    let data = this.parseData(this.element.props.data)
                    columns = data[0]
                }
                let offset = 0
                if (this.hasCheckBox) {
                    columns.unshift('')
                    offset = 1
                }
                if (this.hasActions) {
                    columns.push('')
                }
                return columns.map((col, i) => {
                    return {
                        id: i,
                        label: col,
                        key: i - offset
                    }
                })
            }
            return []
        },
        hasCheckBox() {
            if (this.element) {
                return this.element.style.checkBox === true
            }
            return false
        },
        hasActions() {
            if (this.element) {
                return this.element.props.tableActions && this.element.props.tableActions.length > 0
            }
            return false
        },
        actions() {
            if (this.element) {
                return this.element.props.tableActions
            }
            return []
        },
        sortedRows() {
            if (this.element) {
                const data = this.parseData(this.element.props.data, this.element.props.columns)
                return data.map((row, i) => {
                    return {
                        id: i,
                        values: row,
                        obj: row
                    }
                })
            }
            return []
        }
    },
    methods: {
        postCreate() {
            this.dataGridCSS = CSSFactory.getDataGridCSS()
        },

        wireEvents() {

        },

        rerender() {
            this.render(this.model, this.style, this._scaleX, this._scaleY)
        },

        render(model, style, scaleX, scaleY) {

            this.model = model;
            this.element = model
            this.modelID = model.id
            this.style = style;
            this.props = model.props;
            this._scaleX = scaleX;
            this._scaleY = scaleY;

            if (scaleX < 1) {
                style = CSSUtil.scale(style, scaleX)
            }

            // fixme: if (scale < 1) then scale the css

            const css = this.dataGridCSS.run(`.${model.id}`, style, model)
            //console.debug(css)

            CSSUtil.addWidget(model.id, css)
            console.debug(this.domNode)
        },


        parseData(data, columns) {
            if (data.substring) {
                const table = [];
                const lines = data.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    table.push(line.split(","));
                }
                return this.fillData(table, columns);
            } else {
                return this.fillData(data, columns);
            }
        },

        fillData(table, columns) {
            if (columns) {
                columns.forEach((c, i) => {
                    table.forEach(r => {
                        if (r[i] === undefined) {
                            r[i] = '-'
                        }
                    })
                })
            }
            return table
        },
        beforeDestroy() {
            console.error('beforeDestroy')
        }
    },
    mounted() { }
};
</script>