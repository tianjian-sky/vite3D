import { ref } from 'vue'
import type { DirectiveBinding, VNode } from 'vue'
import { createGlobalState, useElementBounding } from '@vueuse/core'

const _visibleFlg = false

const enum ALIGN_TYPES {
    XALIGN, // x坐标对齐，y坐标取最接近的
    YALIGN,
    MIN_DIST, // 取距离理想位置最接近的
    MIN_XY // 取x，y坐标最小的
}

const useGlobalState = createGlobalState(() => {
    const testElements = ref({})
    return { testElements }
})

const _showVisibleRanges = (ranges, containerBbox) => {
    const _el = document.createElement('div')
    _el.id = 'test'
    _el.style = `position:fixed;left:${containerBbox.left.value}px;top:${containerBbox.top.value}px;width:${containerBbox.width.value}px;height:${containerBbox.height.value}px;z-index:2000;pointer-events:none;`
    document.body.appendChild(_el)
    ranges.forEach(range => {
        const d = document.createElement('div')
        d.classList.add('td')
        d.style = `position:absolute;left:${range[0]}px;top:${range[1][0]}px;height:${range[1][1] - range[1][0]}px;width:1px;background:rgba(255,0,0,.2);z-index:1000;`
        _el.appendChild(d)
    })
}

const _clearVisibleRanges = () => {
    const _el = document.getElementById('test')
    if (_el) {
        document.body.removeChild(_el)
    }
}

const testOverLap = (bbox, testBbox) => {
    let xflag = false
    let yflag = false
    if (bbox.left.value <= testBbox.left.value && bbox.right.value >= testBbox.right.value) {
        xflag = true
    } else if (bbox.left.value >= testBbox.left.value && bbox.left.value < testBbox.right.value || bbox.right.value > testBbox.left.value && bbox.right.value <= testBbox.right.value) {
        xflag = true
    }
    if (bbox.top.value <= testBbox.top.value && bbox.bottom.value >= testBbox.bottom.value) {
        yflag = true
    } else if (bbox.top.value >= testBbox.top.value && bbox.top.value < testBbox.bottom.value || bbox.bottom.value > testBbox.top.value && bbox.bottom.value <= testBbox.bottom.value) {
        yflag = true
    }
    return xflag && yflag
}

const setElPosition = function (el, position, configs = {}) {
    const { offsetX, offsetY } = configs
    const isAbsolutelyPositionElement = ['absolute', 'fixed'].includes(window.getComputedStyle(el, null).position)
    if (isAbsolutelyPositionElement) {
        el.style.left = `${position.x - offsetX}px`
        el.style.top = `${position.y - offsetY}px`
        el.style.right = 'auto'
        el.style.bottom = 'auto'
    }
}

const preventCollision = (id, el, container, configs = {}) => {
    const history = useGlobalState()
    const positionParent = el.offsetParent
    const positionParentBbox = useElementBounding(positionParent)
    const containerBbox = useElementBounding(container)
    const bbox = useElementBounding(el)
    const originPosition = { x: bbox.left.value - containerBbox.left.value, y: bbox.top.value - containerBbox.top.value }
    let offsetX = 0
    let offsetY = 0
    if (positionParent != container) {
        offsetX =  positionParentBbox.left.value - containerBbox.left.value
        offsetY = positionParentBbox.top.value - containerBbox.top.value
    }
    let overlap = false
    const testBboxes = {}
    for (const rid in history.testElements.value) {
        if (!history.testElements.value[id].el || id == rid) continue
        const testBbox = useElementBounding(history.testElements.value[rid].el)
        testBboxes[rid] = testBbox
        overlap = overlap || testOverLap(bbox, testBbox)
    }
    if (overlap) {
        const ranges = []
        console.time('开始计算')
        for (let x = 0; x < container.clientWidth - bbox.width.value; x++) {
            let X = x + containerBbox.left.value
            let Y = 0 + containerBbox.top.value
            const _bbox = {
                left: ref(X),
                top: ref(Y),
                right: ref(bbox.width.value + X),
                bottom: ref(bbox.height.value + Y)
            }
            const relateTestBboxes = Object.values(testBboxes).filter(tb => {
                if (_bbox.left.value <= tb.left.value && _bbox.right.value >= tb.right.value) {
                    return true
                } else if (_bbox.left.value >= tb.left.value && _bbox.left.value < tb.right.value || _bbox.right.value > tb.left.value && _bbox .right.value <= tb.right.value) {
                    return true
                }
            }).sort((tb1, tb2) => {
                return tb1.top.value <= tb2.top.value ? -1 : 1
            })
            relateTestBboxes.push({
                left: ref(X),
                top: ref(containerBbox.top.value + containerBbox.height.value),
                right: ref(X + 1),
                bottom: ref(99999)
            })
            let range = [0, -1]
            relateTestBboxes.forEach(tb => {
                const beginY = tb.top.value - containerBbox.top.value
                const endY = tb.bottom.value - containerBbox.top.value
                if (beginY - range[0] >= bbox.height.value) {
                    range[1] = beginY - bbox.height.value
                    ranges.push([x, range])
                }
                range = [endY, -1]
            })
        }
        console.timeEnd('开始计算')
        if (_visibleFlg) {
            _clearVisibleRanges()
            _showVisibleRanges(ranges, containerBbox)
        }
        console.time('选择放置点')
        console.error('--positions', ranges)
        let xSame = { x: originPosition.x, y: -Infinity }
        let ySame = { x: -Infinity, y: originPosition.y }
        let minDist = { x: -Infinity, y: -Infinity }
        let minXY = { x: Infinity, y: Infinity }
        const panelSnapPositions = {} // 面板吸附点
        Object.keys(testBboxes).forEach(id => {
            const tb = testBboxes[id]
            panelSnapPositions[id] = {
                t: [{x: -Infinity, y: tb.top.value - containerBbox.top.value - bbox.height.value}, ALIGN_TYPES.YALIGN, { x: tb.left.value - containerBbox.left.value, y: tb.top.value - containerBbox.top.value - bbox.height.value }],
                b: [{x: -Infinity, y: tb.bottom.value - containerBbox.top.value}, ALIGN_TYPES.YALIGN, { x: tb.left.value - containerBbox.left.value, y: tb.bottom.value - containerBbox.top.value }],
                l: [{x: tb.left.value - containerBbox.left.value - bbox.width.value, y: -Infinity}, ALIGN_TYPES.XALIGN, { x: tb.left.value - containerBbox.left.value - bbox.width.value, y: tb.top.value - containerBbox.top.value }],
                r: [{x: tb.right.value - containerBbox.left.value, y: -Infinity}, ALIGN_TYPES.XALIGN, { x: tb.right.value - containerBbox.left.value, y: tb.top.value - containerBbox.top.value }]
            }
        })
        const _updateAlignOptimalPosition = (range, flg, refrencePoint, output) => {
            if (flg == ALIGN_TYPES.XALIGN) {
                if (range[0] == refrencePoint.x) {
                    output.y = Math.abs(range[1][0] - refrencePoint.y) <= Math.abs(range[1][1] - refrencePoint.y) ? range[1][0] : range[1][1]
                }
            } else if (flg == ALIGN_TYPES.YALIGN) {
                if (range[1][0] <= refrencePoint.y && range[1][1] >= refrencePoint.y) {
                    output.x = (Math.abs(output.x - refrencePoint.x) <= Math.abs(range[0] - refrencePoint.x)) ? output.x : range[0]
                }
            } else if (flg == ALIGN_TYPES.MIN_DIST) {
                const curDist = Math.pow(output.x - refrencePoint.x, 2) + Math.pow(output.y - refrencePoint.y, 2)
                const dist1 = Math.pow(range[0] - refrencePoint.x, 2) + Math.pow(range[1][0] - refrencePoint.y, 2)
                const dist2 = Math.pow(range[0] - refrencePoint.x, 2) + Math.pow(range[1][1] - refrencePoint.y, 2)
                if (dist1 < curDist || dist2 < curDist) {
                    output.x = range[0]
                    output.y = dist1 < dist2 ? range[1][0] : range[1][1]
                }
            } else if (flg == ALIGN_TYPES.MIN_XY) {
                output.x = Math.min(output.x, range[0])
                output.y = Math.min(output.y, range[1][0])
            }
        }
        ranges.forEach((range, index) => {
            if (index == 0) {
                _updateAlignOptimalPosition(range, ALIGN_TYPES.MIN_XY, originPosition, minXY)
            }
            _updateAlignOptimalPosition(range, ALIGN_TYPES.XALIGN, originPosition, xSame)
            _updateAlignOptimalPosition(range, ALIGN_TYPES.YALIGN, originPosition, ySame)
            _updateAlignOptimalPosition(range, ALIGN_TYPES.MIN_DIST, originPosition, minDist)
            Object.values(panelSnapPositions).forEach(panelSnap => {
                Object.values(panelSnap).forEach(panelSnapConfig => {
                    _updateAlignOptimalPosition(range, panelSnapConfig[1], panelSnapConfig[2], panelSnapConfig[0])
                })
            })
        })
        console.log(xSame, ySame, minDist, minXY, panelSnapPositions, ranges)
        console.timeEnd('选择放置点')
        let positions = [xSame, ySame, minDist, minXY]
        if (ranges.length) {
            Object.values(panelSnapPositions).forEach(panel => {
                Object.values(panel).forEach(pandelSnap => {
                    positions.push(pandelSnap[0])
                })
            })
            positions = positions.filter(obj => isFinite(obj.x) && isFinite(obj.y))
            setElPosition(el, positions[0], { offsetX, offsetY})
        } else {
            console.error('无可以放置点位')
        }
        history.testElements.value[id].tested = true
    }
}

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
        try {
            const history = useGlobalState()
            const container = document.querySelector(binding.value.container || '#model .main')
            if (!history.testElements.value[binding.value.id]) {
                history.testElements.value[binding.value.id] = { el, tested: false }
            } else if (!history.testElements.value[binding.value.id].el) {
                history.testElements.value[binding.value.id].el = el
            }
            if (binding.value.static) {
                return
            }
            if (binding.value.enable && (!binding.value.once || !history.testElements.value[binding.value.id].tested)) {
                history.testElements.value[binding.value.id].opacity = window.getComputedStyle(el)['opacity']
                el.style.opacity = 0
                setTimeout(() => {
                    preventCollision(binding.value.id, el, container, {
                        once: binding.value.once
                    })
                    el.style.opacity = history.testElements.value[binding.value.id].opacity
                }, 0)
            }
        } catch (e) {
            console.error(e)
        }
    },
    beforeUnmount(el, binding) {
        const history = useGlobalState()
        if (history.testElements.value[binding.value.id]) {
            delete history.testElements.value[binding.value.id].el
        }
        if (_visibleFlg) {
            _clearVisibleRanges()
        }
    }
}
