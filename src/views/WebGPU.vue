<template>
    <div class="webgpu">
        <div class="main">
            <component :is="current"></component>
        </div>
        <div class="menus">
            <div v-for="chapter in menus" :key="chapter.id">
                <p class="chapter-title">{{ chapter.title }}</p>
                <ul class="examples">
                    <li :class="{ active: current == item.id }" v-for="item in chapter.children" @click="current = item.id">
                        <a>{{ item.title }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ch1_1 from '@/components/webgpu/1/1.1.vue'
defineOptions({
    name: 'WebGpu',
    components: {
        ch1_1
    }
})
const menus = ref([
    {
        id: '1',
        title: 'chapter-1',
        children: [{
            id: 'ch1_1',
            title: '1.1'
        }]
    }
])
const current = ref('')
onBeforeUnmount(() => { })
onMounted(() => { })
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

            .examples li {
                cursor: pointer;

                &.active {
                    color: blue;
                }
            }
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