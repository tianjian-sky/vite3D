<script setup lang="ts">
import { onMounted } from 'vue'
const { topText, bottomText, leftText, rightText, innerSize, size } = defineProps<{
  topText: string
  bottomText: string
  leftText: string
  rightText: string
  size: number
  innerSize: number
}>()
const clips = $ref({
  top: '',
  bottom: '',
  left: '',
  right: ''
})
const initLayout = () => {
  const radius = 0.5 * size
  const innerRadius = 0.5 * innerSize
  const quaterProj = radius * Math.sin(Math.PI / 4)
  const innerQuaterProj = innerRadius * Math.sin(Math.PI / 4)
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
const handleClick = (e) => {
  console.log('click')
}
onMounted(() => {
  initLayout()
})
</script>

<template>
    <div class="navigator-controller" :style="{width: size + 'px', height: size + 'px'}">
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
        <div class="center-circle" :style="{width: `${innerSize}px`, height: `${innerSize}px`}"></div>
    </div>
</template>

<style lang="scss" scoped>
.navigator-controller {
  position: relative;
  border-radius: 50%;
  .label {
    position: absolute;
    cursor: pointer;
    color: rgb(255, 255, 255);
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
    left: 0;
    top: 0;
    height: 50%;
    width: 100%;
  }
  .navigator-controller-bottom {
    position: absolute;
    left: 0;
    top: 50%;
    height: 50%;
    width: 100%;
  }
  .navigator-controller-left {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 50%;
  }
  .navigator-controller-right {
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    width: 50%;
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
