<template>
    <div class="about">
        <div class="toolbar">
            <input type="file" @change="loadFile" />
            <button @click="setFilters">set filters from json</button>
            <button @click="unfilter">unfilter</button>
            <button @click="toggleFilterIndicator">toggle filter indicator</button>
            <button @click="toJson">toJson</button>
            <button @click="fromJson">fromJson</button>
            <button @click="clear">clear</button>
        </div>
        <div id="sheet"></div>
    </div>
</template>

<script setup lang="ts">
import canvasDatagrid from 'canvas-datagrid';
import { onMounted, onBeforeUnmount, ref } from 'vue'

defineOptions({
    name: 'SheetJsDemo'
})

let XLSX: any = null
let grid = null
let workbook: any = null
let sheetJson
const sheetHtml = ref('')
let filterJson
const loadFile = function (e) {
    sheetHtml.value = null
    if (!XLSX) return
    const fr = new FileReader()
    fr.readAsArrayBuffer(e.target.files[0])
    fr.onload = e => {
        const workbook = XLSX.read(e.target?.result)
        console.log('wb', workbook)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // const table = XLSX.utils.sheet_to_html(worksheet);
        // sheetHtml.value = table
        // if (!grid) {
        //     grid = window.x_spreadsheet(document.getElementById("sheet"));
        // }
        // grid.loadData(window.stox(workbook))
        // XLSX.writeFile(window.xtos(grid.getData()), "SheetJS.xlsx");
        const data = XLSX.utils.sheet_to_json(worksheet)
        console.error('json data', XLSX, worksheet, data)
        const schema = [
            { name: '起止日期', type: 'string' },
            { name: '类型', type: 'string' },
            { name: '功能名称', type: 'string' },
            { name: '使用频次（次）', type: 'number' }
        ]
        grid = canvasDatagrid({
            parentNode: document.getElementById("sheet"),
            data,
            allowColumnReordering: false,
            schema
        })
        console.dir(grid)
        grid.filters.string = function (value, filterFor) {
            console.log(value, filterFor)
            if (!filterFor) {
                return true
            }
            return value === filterFor;
        }
    }
}

const init = function () {
    if (!document.getElementById('sheetJs')) {
        const script = document.createElement('script')
        script.setAttribute('id', 'sheetJs')
        script.setAttribute('src', 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js')
        document.body.appendChild(script)
        const script2 = document.createElement('script')
        script2.setAttribute('id', 'xsheet')
        script2.setAttribute('src', 'https://unpkg.com/x-data-spreadsheet/dist/xspreadsheet.js')
        document.body.appendChild(script2)
        const script3 = document.createElement('script')
        script3.setAttribute('id', 'xsheet')
        script3.setAttribute('src', 'https://cdn.sheetjs.com/xspreadsheet/xlsxspread.js')
        document.body.appendChild(script3)
        const link = document.createElement('link')
        link.setAttribute('rel', 'stylesheet')
        link.setAttribute('href', 'https://unpkg.com/x-data-spreadsheet/dist/xspreadsheet.css')
        document.body.appendChild(link)
        script.onload = function () {
            console.log(window)
            XLSX = window.XLSX
        }
    } else {
        XLSX = window.XLSX
    }
    const resizeFn = function () { }
    window.addEventListener('resize', resizeFn)
    onBeforeUnmount(() => {
        window.removeEventListener('resize', resizeFn)
    })
}

function setFilters() {
    grid.setFilter('功能名称', '自动旋转')
}
function unfilter() {

}

function toggleFilterIndicator() {

}

function toJson() {
    // const json = workbook.toJSON()
    // let activeSheet
    // let filters = null
    // for (const id in json.sheets) {
    //     if (json.sheets[id].index == json.activeSheetIndex) {
    //         activeSheet = json.sheets[id]
    //         filters = activeSheet.rowFilter
    //         delete filters.filteredOutRows
    //     }
    // }
    // console.log('json:', json, filters)
    // sheetJson = json
    // filterJson = filters
}
function fromJson() {
    // if (sheetJson) {
    //     clear()
    //     if (!workbook) {
    //         workbook = new GC.Spread.Sheets.Workbook(
    //             document.getElementById('sheet'),
    //             { sheetCount: 1, allowAutoExtendFilterRange: true }
    //         )
    //     } else {
    //         clear()
    //     }
    //     const ss = GC.Spread.Sheets.findControl(document.getElementById('sheet'))
    //     ss.fromJSON(sheetJson)
    //     ss.focus()
    // } else {
    //     console.error('无json文件')
    // }
}
function clear() {
    if (grid) {
        grid.data = []
        document.getElementById("sheet").innerHTML = ''
        grid = null
    }
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