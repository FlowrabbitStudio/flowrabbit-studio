<template>
    <div :class="['qux-table', cssClass]" >
        <template v-if="sortedRows.length">
            <table>
                <thead>
                    <tr>
                        <th v-for="col in columns" :key="col.id" :class="'qux-table-cell qux-table-column-' + col.id" @click="sortBy(col)">                        
                    
                            {{col.label}}           
                        
                            <span v-if="sortColumn.id == col.id && sortOrder === 'asc'" class="mdi mdi-chevron-down">

                            </span>
                            <span v-if="sortColumn.id == col.id && sortOrder !== 'asc'" class="mdi mdi-chevron-up">

                            </span>
                        </th>
                    </tr>
                </thead>

                <tbody>
                
                    <tr v-for="row in sortedRows" :key="row.id" class="qux-table-row" @click.stop="onRowClick(row, $event)">
                        <td v-if="hasCheckBox" class="qux-table-cell">
                            <CheckBox :value="isRowSelected(row)" @change="(checked, event) => selectRow(row, event)"/>
                        </td>
                        <td v-for="(value,i) in row.values" :key="i" :class="'qux-table-cell qux-table-column-style-' + i + ' qux-table-column-' + i">
                            {{value}}
                        </td>
                        <td v-if="hasActions" class="qux-table-action-cntr">
                            <a v-for="(action,i) in actions"
                                @click.stop="onActionClick(action, row)"
                                :key="action.label"
                                :class="['qux-table-action','qux-table-action-' + i, {'qux-table-action-hover': action.isHover }]">
                                {{action.label}}
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
        <div v-else class="">

            <table>
                <thead>
                    <tr>
                        <th v-for="col in columns" :key="col.id" :class="'qux-table-cell qux-table-column-' + col.id">   
                            {{col.label}}                                   
                            <span v-if="sortColumn.id == col.id && sortOrder === 'asc'" class="mdi mdi-chevron-down">
                            </span>
                            <span v-if="sortColumn.id == col.id && sortOrder !== 'asc'" class="mdi mdi-chevron-up">
                            </span>
                        </th>
                    </tr>
                </thead>

                <tbody v-if="!filter">
                        <tr v-for="id in [0, 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]" :key="id" class="qux-table-row" >
                            <td v-for="col in columns" :key="col.id" :class="'qux-table-cell qux-table-column-' + col.id"> 
                                <span :class="'qux-table-loading qux-table-loading-' +id ">{{id}}</span>
                            </td>
                        </tr>
                </tbody>        

            </table>
   
        </div>
    </div>
</template>
<style lang="scss">
    @import '../scss/qux-table.scss';
    @import '../scss/qux-checkbox.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import CheckBox from './CheckBox.vue'
import JSONPath from '../core/JSONPath'

export default {
  name: 'qTable',
  mixins: [_Base],
  data: function () {
      return {
          'selected': [],
          'sortColumn': '',
          'sortOrder': 'arc'
      }
  },
  inject: ['viewModel', 'validationErrors', 'user'],
  components: {
      'CheckBox': CheckBox
  },
  computed: {
    columns () {
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
                    key:i - offset
                }
            })
        }
        return []
    },
    hasCheckBox () {
        if (this.element) {
            return this.element.style.checkBox === true
        }
        return false
    },
    hasActions () {
        if (this.element) {
            return this.element.props.tableActions && this.element.props.tableActions.length > 0
        }
        return false
    },
    actions () {
        if (this.element) {
            return this.element.props.tableActions
        }
        return []
    },
    currentPage () {
        let currentPage = 0
        const dataBinding = this.dataBinding
        if (dataBinding?.paginationPosition) {
            const dbValue = JSONPath.get(this.viewModel, dataBinding.paginationPosition)
            if (dbValue) {
                currentPage = dbValue
            }
        }
        return currentPage
    },
    filter () {
        const dataBinding = this.dataBinding
        if (dataBinding?.filter) {
            return JSONPath.get(this.viewModel, dataBinding.filter)
        }
        return ''
    },
    sortedRows () {
        let rows = this.rows
        if (this.filter && this.filter.length > 2) {
            const filter = this.filter.toLocaleLowerCase()
            rows = rows.filter(row => {
                for (let v of row.values) {
                    const vs = (v+'').toLocaleLowerCase()
                    if (vs.indexOf(filter) > -1) {
                        return true
                    }                    
                }
                return false
            })

            this.initPaginationPosition()
        }            
        this.firePaggination(rows)

        if (this.sortColumn) {
            const key = this.sortColumn.key
            rows = rows.sort((a,b) => {
                let valueA = a.values[key]
                let valueB = b.values[key]

                if (valueA.localeCompare && valueB.localeCompare) {
                    if (this.sortOrder === 'asc') {
                        return valueA.localeCompare(valueB)
                    } else {
                        return valueB.localeCompare(valueA)
                    }

                }
                if (this.sortOrder === 'asc') {
                    return valueA - valueB
                } else {
                    return valueB - valueA
                }
            })
        }
        return this.getVisibleRows(rows, this.currentPage)
    },
    rows () {      
        const dataBindingInput = this.dataBindingInput
        if (dataBindingInput && Array.isArray(dataBindingInput)) {
            let rows = dataBindingInput
            if (this.element && this.element.props &&  this.element.props.columns && this.element.props.columns.length > 0) {
                const tableDataBinding = this.dataBindingInputPath
                const cols = this.element.props.columns.map(c => {
                    return {
                        databinding: this.updateDataBindingKeys(tableDataBinding, c.databinding)
                    }
                })
                rows = dataBindingInput.map((row, i) => {
                    let values = cols.map(col => {
                        const rowValue = JSONPath.get(row, col.databinding)
                        if (rowValue === undefined) {
                            //Logger.warn('qTable.rows() Error > Cannot find ' , col.databinding)
                        }
                        return rowValue !== undefined ? rowValue : ''
                    })
                    return {
                        id: i,
                        values: values,
                        obj: row
                    }
                })
            }
            this.firePaggination(rows)
            return rows
        } else {
            if (this.element) {
                let data = this.parseData(this.element.props.data, this.element.props.columns)
                return data.map((row, i) => {
                    return {
                        id: i,
                        values: row,
                        obj: row
                    }
                })
            }
        }
        return []
    }
  },
  methods: {
    updateDataBindingKeys (parentPath, path) {
        // if we have parent path remove
        if (path && path.indexOf(parentPath) === 0) {
            path = path.substring(parentPath.length)

            // if path starts with array we remove
            if (path.indexOf('[0]') === 0) {
                path = path.substring(3)
            }
            // or with there is a starting dot
            if (path.indexOf('.') === 0) {
                path = path.substring(1)
            }
        }
      
        return path

    },
    firePaggination (rows) {
        if (this.element && this.element.props.rowsToShow > 0){
            const dataBinding = this.dataBinding
            if (dataBinding?.paginationCount) {
                const rowsToShow = this.element.props.rowsToShow 
                const paginationCount = Math.ceil(rows.length / rowsToShow)
                this.onValueChange(paginationCount, 'paginationCount')                
            }
        }
    },
    initPaginationPosition () {
        if (this.element && this.element.props.rowsToShow > 0){
            const dataBinding = this.dataBinding
            if (dataBinding?.paginationPosition) {
                this.onValueChange(0, 'paginationPosition')        
            }
        }
    },
    getVisibleRows (rows, page) {
        console.debug('getVisibleRows', rows)
        if (this.element && this.element.props.rowsToShow > 0) {
            const rowsToShow = this.element.props.rowsToShow * 1
            const start = page * rowsToShow
            Logger.log(1, 'qTable.getVisibleRows() enter > ', start, start + rowsToShow)
            return rows.slice(start, start + rowsToShow)
        }
        return rows
    },
    sortBy (col) {
        Logger.log(0, 'qTable.sortBy() enter > ', col)
        this.sortColumn = col
        if (this.sortOrder === 'asc') {
            this.sortOrder = 'desc'
        } else {
            this.sortOrder = 'asc'
        }
    },
    onRowClick(row, e) {
        Logger.log(-5, 'qTable.onRowClick() enter > ', row)
        if (this.hasCheckBox) {
            this.selectRow(row, e);
        } else {
            const databinding = this.dataBinding
            if (databinding.output) {
                this.onValueChange(row.obj, 'output')
            }
            this.$emit('qActionLine', this.element, {
                action: "RowClick",
                value: row.obj
            })
        }
    },
    onActionClick (action, row) {
        Logger.log(-5, 'qTable.onActionClick() enter > ' + action.id, row)
        const databinding = this.dataBinding
        if (databinding.output) {
            this.onValueChange(row, 'output')
        }
        this.$emit('qActionLine', this.element, {
            action: action.id,
            value: row.obj
        })
    },
    selectRow (row, e) {
        e.stopPropagation();
        let pos = this.selected.indexOf(row.id)
        if (pos < 0) {
            this.selected.push(row.id)
        } else {
            this.selected.splice(pos, 1)
        }
        let databinding = this.dataBinding
        if (databinding.output) {
            let values = this.rows.filter(row => this.selected.indexOf(row.id) >= 0).map(row => row.obj)
            this.onValueChange(values, 'output')
        }
    },
    isRowSelected (row) {
        return this.selected.indexOf(row.id) >= 0
    },
    parseData (data, columns) {
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
    fillData (table, columns) {
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
    initActionLines() {
        if (this.element.lines) {
            const loadLine = this.element.lines.find(l => l.action ==='TableLoad')
            // we rest here to have loading...
            if (loadLine) {
                this.onValueChange([], 'default')
            }
        }
        this.$emit('qActionLine', this.element, {
            action: "TableLoad"
        })
    }
  },
  mounted () {
    Logger.log(5, 'qTable.mounted() enter')
    this.initPaginationPosition()
    this.initActionLines()
  }
}
</script>
