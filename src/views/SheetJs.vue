<template>
    <div class="about">
        <div class="toolbar">
            <input type="file" @change="loadFile" />
            <button @click="unfilter">unfilter</button>
            <button @click="filter1">filter1</button>
            <button @click="filter2">filter2</button>
            <button @click="clear">clear</button>
        </div>
        <div id="sheet"></div>
    </div>
</template>

<script setup lang="ts">
import loadScript from 'load-script'
import { onMounted } from 'vue'

declare global {
    interface Window {
        XLSX: any;
        x_spreadsheet: any;
        stox: any
    }
}

defineOptions({
    name: 'SheetJsDemo'
})

let grid = null
let workbook: any = null
let data
let pluginType = 2

const loadFile = function (e) {
    if (!window.XLSX) return
    const fr = new FileReader()
    fr.readAsArrayBuffer(e.target.files[0])
    fr.onload = async e => {
        workbook = window.XLSX.read(e.target?.result, {
            dense: false,
            sheetStubs: true
        })
        clear()
        data = window.stox(window.XLSX.read(e.target?.result))
        console.log('wb', workbook, window.XLSX, data)
        showSheet(data)
    }
}

const init = function () {
    if (pluginType == 2) {
        if (!window.XLSX) {
            const link = document.createElement('link')
            link.setAttribute('id', 'xsheetStyle')
            link.setAttribute('href', 'https://unpkg.com/x-data-spreadsheet/dist/xspreadsheet.css')
            link.setAttribute('rel', 'stylesheet')
            document.body.appendChild(link)
            loadScript('https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js', {}, function () {
                loadScript('https://unpkg.com/x-data-spreadsheet/dist/xspreadsheet.js', {}, function () {
                    loadScript('https://cdn.sheetjs.com/xspreadsheet/xlsxspread.min.js', {}, function () {
                    })
                })
            })
        }
    }
}

const getCellValue = (row, key, ri, ci, sheet, merge) => { // TODO:
    if (ci in row.cells) {
        return row.cells[ci]
    }
}

function filterFn1(row, merges) {
    return row.cells[2].text % 2 != 0
}

function filterFn2(row, merges) {
    const reg1 = ['构件树', '选择集', '标注', '资源库', '版本', '后期', '资产', '渲染', '帮助', '设置', '天空', '地形', '水体', '太阳光', '聚光灯', '点光源', '测量', '剖切', '标注', '分析图', '聚焦', '局部放大', '运动', '漫游', '气候', '4DBIM', '绘路', '仅显示图标', '显示设置', '视图', '相机速度', '自动旋转', '开启动态效果', '属性', '导航图', '全屏']
    const reg2 = ['场景保存', '场景另存', '导出fbx', '分享', '右键菜单', '全选', '反选', '隐藏', '隔离', '同材质构件', '同类型构件', '还原', '重置模型', '组件', '法线']
    const reg3 = ['新建文件夹', '合并模型组', '上传模型', '模型下载', '新建项目', '插件下载', '快捷键']
    if (row?.cells[1]?.text == '菜单' &&
        (row?.cells[2]?.text || '').match(new RegExp(reg1.join('|')))) {
        return true
    } else if (row?.cells[1].text != '菜单' && (row?.cells[2]?.text || '').match(new RegExp(reg2.join('|')))) {
        return true
    } else if (row?.cells[1].text != '菜单' && (row?.cells[2]?.text || '').match(new RegExp(reg3.join('|')))) {
        return true
    }
}
const unfilter = function () {
    clear()
    showSheet(data)
}

const filter1 = function () {
    clear()
    const sheet1 = data[0]
    const filteredData = filter(sheet1, filterFn1)
    showSheet([{
        rows: filteredData,
        name: sheet1.name
    }])
}

const filter2 = function () {
    clear()
    const sheet1 = data[0]
    const filteredData = filter(sheet1, filterFn2)
    showSheet([{
        rows: filteredData,
        name: sheet1.name
    }])
}
function filter(sheet, filterFn) {
    const _rows = { len: 0 }
    const merges = [].concat(sheet.merges)
    let deleteCount = 0
    if (!sheet.rows.len) {
        sheet.rows.len = Object.keys(sheet.rows).filter(key => key != 'len').length
    }
    for (let i = 0; i < sheet.rows.len; i++) {
        if (filterFn(sheet.rows[i], merges)) {
            _rows[i - deleteCount] = { cells: sheet.rows[i].cells }
            _rows.len++
        } else {
            let row = i - deleteCount
            const nextRow = sheet.rows[i + 1]
            const curRow = sheet.rows[i]
            for (let _m = 0; _m < merges.length; _m++) {
                const range = window.XLSX.utils.decode_range(merges[_m])
                console.error(row, i, _m, range, merges[_m], curRow, JSON.stringify(merges))
                if (row <= range.e.r) {
                    if (row == range.s.r) {
                        if (range.e.r > row) {
                            range.e.r -= 1
                            merges[_m] = window.XLSX.utils.encode_range(range)
                        } else {
                            merges.splice(_m, 1)
                            _m--
                        }
                        if (nextRow) {
                            nextRow.cells[range.s.c] = curRow.cells[range.s.c]
                        }
                    } else {
                        if (range.s.r >= row) range.s.r -= 1
                        range.e.r -= 1
                        merges[_m] = window.XLSX.utils.encode_range(range)
                    }
                }
            }
            deleteCount++
        }
    }
    merges.forEach((merge) => {
        const xlsUtils = window.XLSX?.utils
        const range = xlsUtils.decode_range(merge)
        _rows[range.s.r].cells[range.s.c].merge = [range.e.r - range.s.r, 0]
    })
    console.log(_rows, merges)
    return _rows
}

function showSheet(data) {
    if (pluginType == 2) {
        window.x_spreadsheet(document.getElementById('sheet')).loadData(data)
    }
}
function clear() {
    if (grid) {
        grid.data = []
        grid = null
    }
    document.getElementById('sheet').innerHTML = ''
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