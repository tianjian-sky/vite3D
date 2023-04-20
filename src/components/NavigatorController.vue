<script setup lang="ts">
import { onMounted } from 'vue'
const { topText, bottomText, leftText, rightText, innerSize, size } = defineProps<{
  topText: string
  bottomText: string
  leftText: string
  rightText: string
  size: number
  innerSize: number
  borderSize: number
}>()
const clips = $ref({
  top: '',
  bottom: '',
  left: '',
  right: ''
})
const wrapper = $ref(null)
const triggerStartEvent = $ref('pointerdown')
const moveDistance = $ref({
  offsetX: 0,
  offsetY: 0,
  bbox: null
})
const triggerOffset = $ref({
  x: 0,
  y: 0
})
const dirClass = $ref('')
const initLayout = () => {
  const radius = 0.5 * size
  const innerRadius = 0.5 * innerSize
  const quaterProj = Math.round(radius * Math.sin(Math.PI / 4))
  const innerQuaterProj = Math.round(innerRadius * Math.sin(Math.PI / 4))
  // init top
  clips.top = `M ${radius - innerQuaterProj} ${
    radius - innerQuaterProj
  } A ${innerRadius} ${innerRadius} 0 0 1 ${radius + innerQuaterProj} ${
    radius - innerQuaterProj
  } L ${radius + quaterProj} ${radius - quaterProj} A ${radius} ${radius} 0 0 0 ${
    radius - quaterProj
  } ${radius - quaterProj} Z`
  // init bottom
  clips.bottom = `M ${
    radius - innerQuaterProj
  } ${innerQuaterProj} A ${innerRadius} ${innerRadius} 0 0 0 ${
    radius + innerQuaterProj
  } ${innerQuaterProj} L ${radius + quaterProj} ${quaterProj} A ${radius} ${radius} 0 0 1 ${
    radius - quaterProj
  } ${quaterProj} Z`
  // init left
  clips.left = `M ${radius - innerQuaterProj} ${
    radius - innerQuaterProj
  } A ${innerRadius} ${innerRadius} 0 0 0 ${radius - innerQuaterProj} ${
    radius + innerQuaterProj
  } L ${radius - quaterProj} ${radius + quaterProj} A ${radius} ${radius} 0 0 1 ${
    radius - quaterProj
  } ${radius - quaterProj} Z`
  // init right
  clips.right = `M ${innerQuaterProj} ${
    radius - innerQuaterProj
  } A ${innerRadius} ${innerRadius} 0 0 1 ${innerQuaterProj} ${
    radius + innerQuaterProj
  } L ${quaterProj} ${radius + quaterProj} A ${radius} ${radius} 0 0 0 ${quaterProj} ${
    radius - quaterProj
  } Z`
}
const _inRange = (val, min, max) => {
  return val >= min && val <= max
}
const _getDist = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
const _clamp = (val, min, max) => {
  if (val < min) {
    return min
  } else if (val > max) {
    return max
  } else {
    return val
  }
}
const onTriggerStart = (e) => {
  const triggerRadius = innerSize / 2
  moveDistance.bbox = wrapper.getBoundingClientRect()
  moveDistance.offsetX = e.clientX - moveDistance.bbox.left
  moveDistance.offsetY = e.clientY - moveDistance.bbox.top
  if (_getDist(moveDistance.offsetX, moveDistance.offsetY, 0.5 * size, 0.5 * size) <= 0.5 * size) {
    if (
      _getDist(
        moveDistance.offsetX,
        moveDistance.offsetY,
        0.5 * size + triggerOffset.x,
        0.5 * size + triggerOffset.y
      ) >
      innerSize / 2
    ) {
      let newX = _clamp(moveDistance.offsetX, triggerRadius, size - triggerRadius)
      let newY = _clamp(moveDistance.offsetY, triggerRadius, size - triggerRadius)
      triggerOffset.x = newX - 0.5 * size
      triggerOffset.y = newY - 0.5 * size
    } else {
      triggerOffset.x = 0
      triggerOffset.y = 0
    }
    document.body.addEventListener('pointermove', onTriggerMove)
    document.body.addEventListener('pointerup', onTriggerMoveEnd)
  }
}
const onTriggerMove = (e) => {
  const radius = 0.5 * size
  const innerRadius = 0.5 * innerSize
  const pos = {
    offsetX: e.clientX - moveDistance.bbox.left,
    offsetY: e.clientY - moveDistance.bbox.top
  }
  const diff = {
    x: pos.offsetX - moveDistance.offsetX,
    y: pos.offsetY - moveDistance.offsetY
  }
  let newX = triggerOffset.x + diff.x
  let newY = triggerOffset.y + diff.y
  if (_getDist(newX + radius, newY + radius, radius, radius) <= radius - innerRadius) {
    triggerOffset.x = newX
    triggerOffset.y = newY
  }
  moveDistance.offsetX = pos.offsetX
  moveDistance.offsetY = pos.offsetY
}
const onTriggerMoveEnd = (e) => {
  triggerOffset.x = 0
  triggerOffset.y = 0
  document.body.removeEventListener('pointermove', onTriggerMove)
  document.body.removeEventListener('pointerup', onTriggerMoveEnd)
}
onMounted(() => {
  initLayout()
})
</script>

<template>
    <div class="navigator-controller" ref="wrapper" :class="[dirClass]" :style="{width: size + 'px', height: size + 'px'}" @[triggerStartEvent]="onTriggerStart">
        <a class="navigator-controller-button navigator-controller-top" :style="{clipPath: `path('${clips.top}')`}" @click="handleClick">
            <label class="label" :style="{marginTop: `${-.5 * innerSize}px`}">{{topText}}</label>
        </a>
        <a class="navigator-controller-button navigator-controller-bottom" :style="{clipPath: `path('${clips.bottom}')`}">
            <label class="label" :style="{marginTop: `${.5 * innerSize}px`}">{{bottomText}}</label>
        </a>
        <a class="navigator-controller-button navigator-controller-left" :style="{clipPath: `path('${clips.left}')`}">
            <label class="label" :style="{marginLeft: `${-.5 * innerSize}px`}">{{leftText}}</label>
        </a>
        <a class="navigator-controller-button navigator-controller-right" :style="{clipPath: `path('${clips.right}')`}">
            <label class="label" :style="{marginLeft: `${.5 * innerSize}px`}">{{rightText}}</label>
        </a>
        <div class="center-circle" :style="{width: `${innerSize}px`, height: `${innerSize}px`, marginLeft: `${triggerOffset.x}px`, marginTop: `${triggerOffset.y}px`}"></div>
    </div>
</template>

<style lang="scss" scoped>
.navigator-controller {
  --borderSize: 2px;
  position: absolute;
  right: 0;
  top: 0;
  border-radius: 50%;
  border: var(--borderSize) solid transparent;
  //   box-sizing: content-box;
  &.top {
    border-top: var(--borderSize) solid rgb(246, 93, 48);
  }
  &.bottom {
    border-bottom: var(--borderSize) solid rgb(246, 93, 48);
  }
  &.left {
    border-left: var(--borderSize) solid rgb(246, 93, 48);
  }
  &.right {
    border-right: var(--borderSize) solid rgb(246, 93, 48);
  }
  .label {
    position: absolute;
    cursor: pointer;
    color: rgb(255, 255, 255);
    user-select: none;
  }
  &-button {
    display: flex;
    position: absolute;
    overflow: hidden;
    background: rgba(240, 242, 246, 0.2);
    mix-blend-mode: normal;
    justify-content: center;
    align-items: center;
    font-family: PingFang SC;
    font-size: 12px;
    cursor: pointer;
    &:active {
      background: rgb(0, 255, 0, 0.2);
    }
  }
  .navigator-controller-top {
    left: calc(var(--borderSize) * -1);
    top: calc(var(--borderSize) * -1);
    height: calc(50% + var(--borderSize));
    width: calc(100% + var(--borderSize) * 2);
  }
  .navigator-controller-bottom {
    position: absolute;
    left: calc(var(--borderSize) * -1);
    top: 50%;
    height: calc(50% + var(--borderSize));
    width: calc(100% + var(--borderSize) * 2);
  }
  .navigator-controller-left {
    position: absolute;
    left: calc(var(--borderSize) * -1);
    top: calc(var(--borderSize) * -1);
    height: calc(100% + var(--borderSize) * 2);
    width: calc(50% + var(--borderSize));
  }
  .navigator-controller-right {
    position: absolute;
    left: 50%;
    top: calc(var(--borderSize) * -1);
    height: calc(100% + var(--borderSize) * 2);
    width: calc(50% + var(--borderSize));
  }
  .center-circle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 50%;
  }
}
</style>
