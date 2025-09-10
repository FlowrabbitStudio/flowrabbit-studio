<template>
  <div>
  <div :class="['mact-data-table', {'mact-data-table-selectable': selectable}]">
    <table v-if="data.length > 0">
      <thead>
        <tr>
          <th v-if="isSelectable">
            <input type="checkbox" @change="selectAllRows" />
          </th>
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
          :class="{
            'data-table-row': true,
            'selected-row': isRowSelected(row)
          }"
        >
          <td v-if="isSelectable">
            <input
              type="checkbox"
              :checked="isRowSelected(row)"
              @change="toggleRowSelection(row)"
            />
          </td>
          <td
            v-for="col in columns"
            :key="col.id + '@' + i"
            :class="getCellClass(col, row)"
            @click="col.click ? handleCellClick(col, row, $event) : null"
          >
            <template v-if="col.key !== 'action'">
              <div v-if="col.type === 'dropdown'" style="width: 100px;" >
                <select :value="row[col.key]" @change="onRowChange(row, col, $event)" class="form-control">
                  <option v-for="option in col.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
            
              </div>
              <span v-if="col.type === 'array'" >
                <span class="cell-bubble" v-for=" v in getCellValue(col, row)" :key="v">
                  {{v}}
                </span>
                <!-- XX {{ getCellValue(col, row) }} -->
              </span>
              <span v-if="col.type !== 'dropdown' && col.type !== 'array'">
                {{ getCellValue(col, row) }}
              </span>
           </template>
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
                class="mdi mdi mdi-update"
                @click.stop="col.click(row, $event)"
              ></span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="data.length === 0" class="mact-data-table-loading">
      Loading...
    </div>
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
      <select v-model="rowsPerPage" @change="updatePageSize">
        <option v-for="option in [5, 10, 20, 50, 100, 200]" :key="option" :value="option">
          {{ option }} rows
        </option>
      </select>
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
    data: Array,
    columns: Array,
    selectable: {
      default: true,
    },
    size: {
      default: 100,
    },
    isSelectable: {
      type:Boolean,
      default: false,
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
      selectedRows: [],
      rowsPerPage: this.size,
    };
  },
  computed: {
    hasPaging() {
      return this.data.length > this.rowsPerPage;
    },
    pageCount() {
      return Math.ceil(this.data.length / this.rowsPerPage);
    },
    currentRows() {
      let rows = this.sortedRows;
      if (rows.length > this.rowsPerPage) {
        let from = (this.currentPage - 1) * this.rowsPerPage;
        let to = from + this.rowsPerPage;
        return rows.slice(from, to);
      }
      return rows;
    },
    sortedRows() {
      if (this.sortColumn) {
        return [...this.data].sort((a, b) => {
          let valueA = a[this.sortColumn.key];
          let valueB = b[this.sortColumn.key];
          return this.sortOrder === "asc"
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        });
      }
      return this.data;
    },
  },
  methods: {
    onRowChange (row, col, e) {
      const value = e.target.value
      if (col.callback) {
        col.callback(row, col.key, value)
      }
    },
    toggleRowSelection(row) {
      if (this.selectedRows.includes(row)) {
        this.selectedRows = this.selectedRows.filter((r) => r !== row);
      } else {
        this.selectedRows.push(row);
      }
    },
    isRowSelected(row) {
      return this.selectedRows.includes(row);
    },
    selectAllRows(event) {
      if (event.target.checked) {
        this.selectedRows = [...this.data];
      } else {
        this.selectedRows = [];
      }
      this.$emit("update:selectedRows", this.selectedRows);
    },
    updatePageSize() {
      this.currentPage = 1;
    },
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
      return col.max && value && value.length > col.max
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
    },
    previousPage() {
      this.currentPage = Math.max(1, this.currentPage - 1);
    },
    nextPage() {
      this.currentPage = Math.min(this.pageCount, this.currentPage + 1);
    },
    goToPage() {
      this.currentPage = Math.max(
        1,
        Math.min(this.pageCount, this.currentPage)
      );
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