<template>
    <div class="mact-data-table">
      <table v-if="data.items.length > 0">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.id"
              @click="col.sortable !== false ? sortBy(col) : null"
              :style="getColWidth(col)"
              :class="getHeaderClass(col)"
            >
              <div v-if="col.key !== 'action'">
                {{ col.label }}
                <span
                  v-if="sortColumn.id === col.id"
                  class="sort-icon"
                  :class="
                    sortOrder === 'asc'
                      ? 'mdi mdi-chevron-down'
                      : 'mdi mdi-chevron-up'
                  "
                ></span>
              </div>
            </th>
          </tr>
        </thead>
  
        <tbody>
          <tr
            v-for="(row, i) in currentRows"
            :key="i"
            @click="onRowClick(row)"
            class="data-table-row"
          >
            <td
              v-for="col in columns"
              :key="col.id + '@' + i"
              :class="getCellClass(col, row)"
              @click="col.click ? handleCellClick(col, row, $event) : null"
            >
              <span v-if="col.key !== 'action'">
                {{ getCellValue(col, row) }}
              </span>
              <span v-else class="action-icons">
                <span
                  v-if="col.id === 'action-edit'"
                  class="mdi mdi-pencil"
                  @click.stop="col.click(row, $event)"
                ></span>
                <span
                  v-if="col.id === 'action-delete'"
                  class="mdi mdi-delete"
                  @click.stop="col.click(row, $event)"
                ></span>
                <span
                  v-if="col.id === 'action-pay'"
                  class="mdi mdi-update"
                  @click.stop="col.click(row, $event)"
                ></span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
  
      <div v-if="data.items.length === 0" class="mact-data-table-loading">
        Loading...
      </div>
  
      <div v-if="hasPaging" class="mact-data-table-paging-cntr">
        <span class="mdi mdi-chevron-left" @click="previousPage" />
        <input
          v-model="currentPage"
          type="number"
          min="1"
          :max="pageCount"
          @change="goToPage"
        />
        <span>of {{ pageCount }}</span>
        <span class="mdi mdi-chevron-right" @click="nextPage" />
      </div>
    </div>
  </template>
  
  
  <style lang="scss">
  @import "../../style/mcu/data-table.scss";
  </style>
  
  <script>
  import Logger from "core/Logger";
  
  export default {
    props: {
      data: Object,
      columns: Array,
      size: {
        default: 100,
      },
      onRowClickCallback: {
        type: Function,
        default: null,
      },
    },
    data() {
      return {
        currentPage: 1,
        sortColumn: "",
        sortOrder: "asc",
      };
    },
    computed: {
      hasPaging() {
        return this.pageCount > 0
      },
      pageCount() {
        return Math.ceil(this.data.count / this.data.limit);
      },
      currentRows() {
        return this.data.items;
      },
      sortedRows() {
        // if (this.sortColumn) {
        //   return [...this.data].sort((a, b) => {
        //     let valueA = a[this.sortColumn.key];
        //     let valueB = b[this.sortColumn.key];
        //     return this.sortOrder === "asc"
        //       ? String(valueA).localeCompare(String(valueB))
        //       : String(valueB).localeCompare(String(valueA));
        //   });
        // }
        return this.data.items;
      },
    },
    methods: {
      onRowClick(row) {
        Logger.log("Row clicked:", row);
        if (this.onRowClickCallback) {
          this.onRowClickCallback(row);
        }
      },
      getCellClass(col, row) {
        return col.class
          ? typeof col.class === "function"
            ? col.class(row)
            : col.class
          : "";
      },
      getCellValue(col, row) {
        let value = row[col.key];
        if (col.value) {
          value = typeof col.value === "function" ? col.value(row) : col.value;
        }
        if (!value) {
            return '-'
        }
        return col.max && value.length > col.max
          ? `${value.substring(0, col.max)}...`
          : value;
      },
      getColWidth(col) {
        if (col.key === "action") return "width: 5%";
        return col.width ? `width: ${col.width};` : "";
      },
      sortBy(col) {
        if (col.sortable === false) return;
        this.sortColumn = col;
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        this.$emit('sortyBy', this.sortColumn.key, this.sortOrder)
      },
      previousPage() {
        this.currentPage = Math.max(1, this.currentPage - 1);
        this.$emit('load', this.currentPage)
      },
      nextPage() {
        this.currentPage = Math.min(this.pageCount, this.currentPage + 1);
        this.$emit('load', this.currentPage)
      },
      goToPage() {
        this.currentPage = Math.max(
          1,
          Math.min(this.pageCount, this.currentPage)
        );
        this.$emit('load', this.currentPage)
      },
      handleCellClick(col, row, event) {
        if (col.click) {
          col.click(row, event);
        }
      },
      getHeaderClass(col) {
        return col.headerClass ? col.headerClass : "";
      },
    },
    mounted() {
      Logger.log("Table mounted");
    },
  };
  </script>