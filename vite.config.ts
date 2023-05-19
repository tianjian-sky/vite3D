import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import stylus from 'stylus'
import AutoImport from 'unplugin-auto-import/vite'
import autoImportConfig from './autoImport.config'

import VueMacros from 'unplugin-vue-macros/vite'
// import { transformShortVmodel } from '@vue-macros/short-vmodel'
// import Inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig((vite) => {
    console.log('vite', vite)
    // env
    console.log('env', loadEnv('dev', process.cwd(), '')) // 读取环境变量
    return {
        // define: {
        //     __APP_NAME_: 'VIDE_3D'
        // },
        publicDir: './static',
        // plugins: [
        //     vue({
        //         reactivityTransform: true // 省略访问ref时.value
        //     }),
        //     vueJsx()
        // ],
        plugins: [ // 增强型 macro
            VueMacros({
                setupBlock: true,
                defineOptions: true,
                shortEmits: true,
                hoistStatic: true,
                defineSlots: true,
                defineModels: true,
                namedTemplate: false,
                plugins: {
                    vue: vue({
                        include: [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/],
                        reactivityTransform: true // 省略访问ref时.value
                    }),
                    vueJsx: vueJsx(),
                },
            }),
            AutoImport(autoImportConfig)
            // ,
            // Inspect({
            //     outputDir: '.vite-inspect'
            // })
        ],
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
        },
        build: {},
        server: {
            host: '0.0.0.0' // 本地开发暴露地址
        },
        base: process.env.NODE_ENV == 'production' ? '/vite3D' : '/'
    }
})
