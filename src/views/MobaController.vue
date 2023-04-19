<script setup lang="ts">
import NavigatorController from '../components/NavigatorController.vue'
let show = $ref(false)

const onConfirm = (value) => {
  show = false
}
</script>

<template>
    <div class="page">
        <div>
            <NavigatorController topText="前进" bottomText="后退" leftText="左移" rightText="右移" :size="144" :inner-size="54" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page {
  height: 100vh;
  background: #aaa;
}
</style>
