const path = require('path')
module.exports = {
    plugins: [
        // 兼容浏览器，添加前缀
        require('autoprefixer')({
            overrideBrowserslist: ['> 0.15% in CN']
        }),
        // px --> rem
        require('postcss-plugin-px2rem')({
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
