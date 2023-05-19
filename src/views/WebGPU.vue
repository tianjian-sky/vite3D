<template>
    <div class="webgpu">
        <div class="main">

        </div>
        <div class="menus">
            <div v-for="chapter in menus" :key="chapter.id">
                <p class="chapter-title">{{ chapter.title }}</p>
                <ul class="examples">
                    <li v-for="item in chapter.children"><a>{{ item.title }}</a></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const menus = ref([
    {
        id: '1',
        title: 'chapter-1',
        children: [{
            id: '1.1',
            title: '1.1'
        }]
    }
])
defineOptions({
    name: 'WebGpu'
})

interface Window {
    LOADERS: any
}

onBeforeUnmount(() => {
    // window.removeEventListener('resize', resizeFn)
})

onMounted(() => {
})
</script>

<style lang="scss" scoped>
@media (min-width: 1024px) {
    .webgpu {
        width: 100%;
        height: 100vh;
        overflow: hidden;
        display: flex;
        background: $injectedColor;

        .main {
            flex: 1;
            height: 100%;
            overflow: hidden;
            margin-right: 20px;
            border: 1px solid green;
        }

        .menus {
            flex: 0 0 100px;
            height: 100%;
            overflow: hidden;
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