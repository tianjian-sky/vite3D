<script setup lang="ts">
import { now } from 'lodash-es'
console.log(now())
// 注入的import对象
console.log(import.meta, new URL('./img.png', import.meta.url).href, import.meta.env)
document.documentElement.style.fontSize = '100px'
</script>

<template>
    <div class="app_wrapper">
        <RouterView />
    </div>
</template>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
