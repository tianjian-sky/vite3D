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
import ch1_2 from '@/components/webgpu/1/1.2.vue'
import ch1_3 from '@/components/webgpu/1/1.3.vue'
import ch1_4 from '@/components/webgpu/1/1.4.vue'
import ch1_5 from '@/components/webgpu/1/1.5.vue'
import ch1_6 from '@/components/webgpu/1/1.6.vue'
import ch1_7 from '@/components/webgpu/1/1.7.vue'

defineOptions({
    name: 'WebGpu',
    components: {
        ch1_1,
        ch1_2,
        ch1_3,
        ch1_4,
        ch1_5,
        ch1_6,
        ch1_7
    }
})
const menus = ref([
    {
        id: '1',
        title: 'chapter-1',
        children: [
            {
                id: 'ch1_1',
                title: '1.1'
            },
            {
                id: 'ch1_2',
                title: '1.2'
            },
            {
                id: 'ch1_3',
                title: '1.3'
            },
            {
                id: 'ch1_4',
                title: '1.4'
            },
            {
                id: 'ch1_5',
                title: '1.5'
            },
            {
                id: 'ch1_6',
                title: '1.6'
            },
            {
                id: 'ch1_7',
                title: '1.7'
            }
        ]
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