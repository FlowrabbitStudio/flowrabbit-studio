<template>
  <div :class="['qux-repeater', cssClass, {'qux-repeater-loading' : rows.length === 0}]">

      <!--
          FIXME: the forwardClick ($event) contains only the element that was called, nit the value, nor
          the dom event. We would need something like $event1,...$event2

          FIXME: For auto layout we might need a stupid wrapper around that can grow horizontally
          to allow scrolling. In This oculd for now somehow be solved in Figma, so I will ignore this...
      -->
      <div class="qux-repeater-wrapper">
        <div v-for="row in filteredRows" :key="row.index" :class="['qux-repeater-child', { 'selected': selectedIndex === row.index }]">
          <!--
              FIXME: the getDeepCopy() might cause some weird reactivity issues with lot's of 
              recursive calls. Maybe we could compute this in the filteredRows() method?
          -->
          <component v-for="child in element.children"
              :is="child.qtype"
              :key="child.id"
              :element="getDeepCopy(child, row.data, row.index)"
              :model="model"
              :config="config"      
              @qClick="forwardClick(row.index, $event)"
              @qChange="forwardChange"
              @qKeyPress="forwardKeyPress"
              @qFocus="forwardFocus"
              @qBlur="forwardBlur"
              @qMouseOver="forwardMouseOver"
              @qMouseOut="forwardMouseOut"
              @qViewModelChange="forwardViewModel"
              />
        </div>
        <template v-if="rows.length === 0 && isLoadingAnimation">        
          <div v-for="(placeholder, i) in loadingPlaceHolders" :key="'p'+i" :class="'qux-repeater-child qux-repeater-loading qux-repeater-loading-' + i" >

          </div>
          <div v-for="(placeholder, i) in placeholders" :key="'p'+i" class="qux-repeater-child qux-repeater-placeholder" style="height:0px; margin:0px;" >
          </div>
        </template>

        <!-- add here some empty placeholder elements to get a nice wrapping... -->
        <template v-if="rows.length > 0">
          <div v-for="(placeholder, i) in placeholders" :key="'p'+i" class="qux-repeater-child qux-repeater-placeholder" style="height:0px; margin:0px;" >
          </div>
        </template>

      </div>
      
      <div v-if="rows.length === 0 && !isLoadingAnimation" class="qux-repeater-loading-label">
          Loading... 
      </div>



  </div>
</template>
<style lang="scss">
    @import '../scss/qux-repeater.scss';
</style>
<script>

import _Base from './_Base.vue'
import JSONPath from '../core/JSONPath'
import Logger from '../core/Logger'
import * as Util from '../core/ExportUtil'

export default {
  name: 'qRepeater',
  mixins: [_Base],
  data: function () {
      return {
        debug: false,
        selectedIndex: null
      }
  },
  computed: {
      isLoadingAnimation () {
        // if (this.element) {
        //   return this.element?.props.loadingAnimation === true
        // }
        return true
      },
      loadingPlaceHolders () {
        return [1,2,3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
      },
      placeholders () {
        /**
         * Make here some better math and calculate hwo many elements i really need?
         */
        if (Util.isLayoutAuto(this.element)) {
          return []
        }
        return [1,2,3,4,5,6,7]
      },
      filter () {
          const dataBinding = this.dataBinding
          if (dataBinding?.filter) {
              return JSONPath.get(this.viewModel, dataBinding.filter)
          }
          return ''
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
      filteredRows() {
        // keep the orginal indexes, because the getDeepCopy()
        // method operates on the real rows, not the filtered ones
        let rows = this.rows.map((r,i) => {
          return {
            index:i,
            data: r
          }
        })
        if (this.filter && this.filter.length > 2) {
            const filter = this.filter.toLocaleLowerCase()
            rows = rows.filter(row => {
                const data = row.data
                for (let key in data) {
                    const vs = (data[key] + '').toLocaleLowerCase()
                    if (vs.indexOf(filter) > -1) {
                        return true
                    }                    
                }
                return false
            })
            this.initPaginationPosition()
        }            
        this.firePaggination(rows)
        return this.getVisibleRows(rows, this.currentPage)
      },
      rows () {
      
        if (this.element && this.element.props && this.element.props.databinding) {
            const path =  this.element.props.databinding.default
            if (!path) {
              Logger.error('Repeater.rows() > No path: ')
              return []
            }    
            const value = JSONPath.get(this.viewModel, path)
            if (!value) {
              Logger.log(5, 'Repeater.rows() > No value for path: ' + path)
              return []
            }
       
            Logger.log(5, 'Repeater.rows() > path: > ' + path, value)
            if (Array.isArray(value)) {
                return value
            } else {
              Logger.warn('Repeater.rows() > Value is no array: > ' + path)
              Logger.warn('Repeater.rows() > Value is no array: > ' + JSON.stringify(this.viewModel, null, 2))
            }
        } else {
            return this.getRowsFromTable(this.element)
        }
        return []
      }
  },
  methods: {
    firePaggination (rows) {
        Logger.log(-4, 'Repeater.firePaggination()')
        if (this.element && this.element.props.itemToShow > 0){
            const dataBinding = this.dataBinding
            if (dataBinding?.paginationCount) {
                const itemToShow = this.element.props.itemToShow 
                const paginationCount = Math.ceil(rows.length / itemToShow)
                this.onValueChange(paginationCount, 'paginationCount')                
            }
        }
    },
    getVisibleRows (rows, page) {
        Logger.log(-4, 'Repeater.getVisibleRows()')
        if (this.element && this.element.props.itemToShow > 0) {
            const itemToShow = this.element.props.itemToShow * 1
            const start = page * itemToShow
            Logger.log(1, 'qTable.getVisibleRows() enter > ', start, start + itemToShow)
            return rows.slice(start, start + itemToShow)
        }
        return rows
    },
    getDeepCopy (element, row, i) {
       //Logger.log(-4, 'Repeater.getDeepCopy() > exit : > ' + i, row)
        let copy = structuredClone(element) //this.clone(element)
        let path = this.dataBindingInputPath
        this.updateDataBinding(copy, i, path, true)
        return copy
    },
    // clone(obj) {
    //     if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
    //         return obj;

    //     let temp = obj.constructor();
    //     for (var key in obj) {
    //         if (Object.prototype.hasOwnProperty.call(obj, key)) {
    //             if (key !== 'parent') {
    //                 /**
    //                  * FIXME: Make this somehow better
    //                  */
    //                 obj['isActiveClone'] = null;
    //                 temp[key] = this.clone(obj[key]);
    //                 delete obj['isActiveClone'];
    //             } else {
    //                  temp[key] = obj[key]
    //             }
    //         }
    //     }
    //     return temp;
    // },
    updateDataBinding (copy, i, parentPath, isRoot = false) {
        //Logger.log(5, 'Repeater.updateDataBinding() > enter : > ' + i, copy.name + ' @ ' + parentPath)

        if (copy.children && copy.children.length > 0) {
            copy.children.forEach(child => {
                /**
                 * Update the path for each child
                 */
                this.updateDataBindingKeys(child, i, parentPath)

                /**
                 * Go down recursive
                 */
                this.updateDataBinding(child, i, parentPath)
            })
        } else if (isRoot) {
          /**
           * We might have a special case, where the repeater has only one child.
           */
          Logger.log(5, 'Repeater.updateDataBinding() > No wrapper children : > ' + i, copy.name + ' @ ' + parentPath)
          this.updateDataBindingKeys(copy, i, parentPath)
        }
    },

    updateDataBindingKeys (child, i, parentPath) {
      //Logger.log(-4, 'Repeater.updateDataBindingKeys()')
      
      if (child && child.props && child.props.databinding) {
          let databinding = child.props.databinding

          for (let key in databinding) {
              let path = databinding[key]
              // if we have parent path remove
              if (path.indexOf(parentPath) === 0) {
                  path = path.substring(parentPath.length)
              }
              // if path starts with array we remove
              if (path.indexOf('[0]') === 0) {
                  path = path.substring(3)
              }
              if (path.indexOf('.') === 0) {
                  path = path.substring(1)
              }
              databinding[key] = `${parentPath}[${i}].${path}`
              Logger.log(2, 'Repeater.updateDataBindingKeys() > exit : > ' +databinding[key])
          }
      }
    },

    forwardClick (i, element, e) {
      this.selectedIndex = i;
      let row = this.dataBindingInputPath ? JSONPath.get(this.viewModel, `${this.dataBindingInputPath}[${i}]`) : null
      if (this.dataBindingOutputPath && this.dataBindingInputPath) {
        if (row) {
          Logger.log(5, `qRepeater.forwardClick() > Update databinding "${this.dataBindingOutputPath}"`, row)
          /**
           * FIXME: Should we do a copy here???
           */
          JSONPath.set(this.viewModel, this.dataBindingOutputPath, row)
        }
      }
      /**
       * We check if there is a click method defined on the repeater and dispatch the click on this element
       * if the clicked child does not have a link or call back
       */
      Logger.log(5, 'qRepeater.forwardClick() ', JSON.stringify(row))
      if (element.lines && element.lines.length > 0) {
        this.$emit('qClick', element, e, row);
      } else {
        this.$emit('qClick', this.element, e, row);
      }

    },
    forwardChange (element, e, value) {
      this.$emit('qChange', element, e, value);
    },
    forwardFocus (element, e, value) {
      this.$emit('qFocus', element, e, value);
    },
    forwardBlur (element, e, value) {
      this.$emit('qBlur', element, e, value);
    },
    forwardMouseOver (element, e, value) {
      this.$emit('qMouseOver', element, e, value);
    },
    forwardMouseOut (element, e, value) {
      this.$emit('qMouseOut', element, e, value);
    },
    forwardKeyPress (element, e, value) {
      this.$emit('qKeyPress', element, e, value)
    },
    forwardCallback (element, e, value) {
      this.$emit('qCallback', element, e, value)
    },
    forwardViewModel (element, path, value) {
      this.$emit('qViewModelChange', element, path, value)
    },
    getRowsFromTable (widget) {
        let result = []
        if (widget.props.data && widget.props.data.length > 1) {
            let data = widget.props.data
            this.dataBindingValues = []
            let header = widget.props.data[0]
            for (let r=1; r < data.length; r++) {
                let row = {}
                for (let c=0; c < header.length; c++) {
                    let col = header[c]
                    row[col] = data[r][c]
                }
                result.push(row)
            }
        }
        return result
    },
    initPaginationPosition () {
        Logger.log(-4, 'Repeater.initPaginationPosition()')
        if (this.element && this.element.props.itemToShow > 0){
            const dataBinding = this.dataBinding
            if (dataBinding?.paginationPosition) {
                this.onValueChange(0, 'paginationPosition')        
            }
        }
    },
    initActionLines() {
        Logger.log(-4, 'Repeater.initPaginationPosition()')
        if (this.element.lines) {
            const loadLine = this.element.lines.find(l => l.action ==='Loaded')
            // we rest here to have loading...
            if (loadLine) {
                this.onValueChange([], 'default')
            }
        }
      this.$emit('qActionLine', this.element, {
            action: "Loaded"
        })
    }
  },
  mounted () {
    Logger.log(3, 'Repeater.mounted() > enter', this.element)
    this.initActionLines()
    this.initPaginationPosition()
  }
}
</script>
