<template>
    <div class="about">
        <div class="toolbar">
            <input type="file" @change="loadFile" />
            <button @click="setFilter">set a filter</button>
            <button @click="getFilterStatus">get filter status</button>
            <button @click="getFilterResults">filter results</button>
            <button @click="toggleFilterIndicator">toggle filter indicator</button>
            <button @click="toJson">toJson</button>
            <button @click="toJson">toJson</button>
        </div>
        <div id="sheet"></div>
    </div>
</template>

<script setup lang="ts">
import '../../node_modules/@grapecity/spread-sheets/styles/gc.spread.sheets.css'
import GC from '@grapecity/spread-sheets'
import { IO } from '@grapecity/spread-excelio'
import { onMounted, onBeforeUnmount } from 'vue'

defineOptions({
    name: 'ExcelDemo'
})

interface Window {
    LOADERS: any
}
let spread
let sheetJson
const container = $ref(null)
const loadFile = function (e) {
    console.log('loadFile', e)
    spread = new GC.Spread.Sheets.Workbook(
        document.getElementById('sheet'),
        { sheetCount: 1, allowAutoExtendFilterRange: true }
    )
    new IO().open(e.target.files[0], function (json) {
        console.log('json', json)
        const ss = GC.Spread.Sheets.findControl(document.getElementById('sheet'))
        if (json.version && json.sheets) {
            ss.fromJSON(json)
            ss.focus()
        }
    }, function (e) {
        console.log(e);
    }, {})
}

const init = function () {
    const resizeFn = function () { }
    window.addEventListener('resize', resizeFn)
    onBeforeUnmount(() => {
        window.removeEventListener('resize', resizeFn)
    })
}

//Create a custom condition.
function CustomFilter() {
    GC.Spread.Sheets.ConditionalFormatting.Condition.apply(this, arguments);
};
CustomFilter.prototype = new GC.Spread.Sheets.ConditionalFormatting.Condition()
CustomFilter.prototype.evaluate = function (evaluator, row, col) {
    const value = evaluator.getValue(row, col);
    console.log('filter evaluate', row, col, value)
    if (value !== null && value >= 10 && value <= 50) {
        return true;
    } else {
        return false;
    }
};

function setFilter() {
    //Set a row Filter.
    // const spread = new GC.Spread.Sheets.Workbook(document.getElementById('sheet'))
    const activeSheet = spread.getActiveSheet()
    console.log('active sheet', spread, activeSheet)
    const rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(0, 0, 7, 2))
    activeSheet.rowFilter(rowFilter)
    rowFilter.addFilterItem(0, new CustomFilter())
    rowFilter.filter(0)
}

function getFilterStatus() {
    // const spread = new GC.Spread.Sheets.Workbook(document.getElementById('sheet'))
    const rowFilter = spread.getActiveSheet().rowFilter()
    const range = rowFilter.extendedRange
    const filters = {}
    for (let col = 0; col < range.colCount; col++) {
        console.log('row filter', col, rowFilter.isFiltered(col))
        if (rowFilter.isFiltered(col)) {
            filters[col] = rowFilter.getFilterItems(col)
            console.log('row filter', col, filters[col])
        }
    }
}

function getFilterResults() {
    const activeSheet = spread.getActiveSheet()
    const rowFilter = activeSheet.rowFilter()
    console.log(rowFilter, rowFilter.range, rowFilter.extendedRange)
    const range = rowFilter.extendedRange
    const filteredInRows = [], filteredOutRows = []
    // const filters = rowFilter.rrt
    for (let col = 0; col < range.colCount; col++) {
        if (rowFilter.isFiltered(col)) {
            const filterItems = rowFilter.getFilterItems(col)
            console.log(col, filterItems)
        }
    }
    for (let i = range.row, last = range.row + range.rowCount; i < last; i++) {
        if (rowFilter.isRowFilteredOut(i)) {
            filteredOutRows.push([i, activeSheet.getValue(i, 2)])
        } else {
            filteredInRows.push([i, activeSheet.getValue(i, 2)])
        }
    }
    console.log('filteredInRows', filteredInRows)
    console.log('filteredOutRows', filteredOutRows)
}

function toggleFilterIndicator() {
    const activeSheet = spread.getActiveSheet()
    const rowFilter = activeSheet.rowFilter()
    const range = rowFilter.extendedRange
    for (let col = 0; col < range.colCount; col++) {
        rowFilter.filterButtonVisible(col, !rowFilter.__show)
    }
    activeSheet.repaint()
    rowFilter.__show = !rowFilter.__show
}

function toJson() {
    const json = spread.toJSON()
    let activeSheet
    let filters = null
    for (const id in json.sheets) {
        if (json.sheets[id].index == json.activeSheetIndex) {
            activeSheet = json.sheets[id]
            filters = activeSheet.rowFilter
        }
    }
    console.log('json:', json)
    sheetJson = json
}

onMounted(() => {
    init()
})
</script>

<style lang="scss" scoped>
@media (min-width: 1024px) {
    .toolbar {
        display: flex;

        >* {
            margin-left: 12px;
        }
    }

    .about {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: $injectedColor;

        #sheet {
            position: relative;
            width: 100%;
            flex: 1;
        }
    }
}
</style>

<style lang="stylus" scoped>
@media (min-width: 1024px) {
    .about {
        color: $specialColor;

        #renderCanvas {
            position: relative;
            height: 100%;
        }
    }
}
</style>