import path from 'path'
import { fileURLToPath } from 'url'
import Autoprefixer from 'autoprefixer'
import PostcssPluginPx2rem from 'postcss-plugin-px2rem'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
    plugins: [
        // 兼容浏览器，添加前缀
        new Autoprefixer({
            overrideBrowserslist: ['> 0.15% in CN']
        }),
        // px --> rem
        new PostcssPluginPx2rem({
            rootValue: 100,
            unitPrecision: 5,
            propWhiteList: [],
            propBlackList: [/^.el-/],
            selectorBlackList: [/^.el-time/, 'ignore-px2rem'],
            ignoreIdentifier: false,
            replace: true,
            mediaQuery: false,
            minPixelValue: 0,
            exclude: path.resolve(__dirname, '/node_modules/element-ui')
        })
    ]
}
