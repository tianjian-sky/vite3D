import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import stylus from 'stylus'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue({
        reactivityTransform: true // 省略访问ref时.value
    }), vueJsx()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: { // 需要安装sass， 不需要sass-loader
                additionalData: `$injectedColor: orange;`,
            },
            stylus: {// 需要安装stylus， 不需要stylus-loader
                define: {
                    $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
                },
            }
        }
    }
})
