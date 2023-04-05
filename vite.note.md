# vite

## vite 中使用scss

[vite项目使用全局样式(less|scss)](https://www.jianshu.com/p/4dd7cb87eae3)

``` javascript
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {// 需要安装sass， 不需要sass-loader
        additionalData: `$injectedColor: orange;`,
      },
      less: {
        math: 'parens-division',
      },
      styl: {// 需要安装stylus， 不需要stylus-loader
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
    },
  },
})


```

```
css.preprocessorOptions
Type: Record<string, object>
Specify options to pass to CSS pre-processors. The file extensions are used as keys for the options. The supported options for each preprocessors can be found in their respective documentation:

sass/scss - Options.
less - Options.
styl/stylus - Only define is supported, which can be passed as an object.
All preprocessor options also support the additionalData option, which can be used to inject extra code for each style content.
```

