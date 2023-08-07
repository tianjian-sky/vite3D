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

## 特性
### css预处理
There is no need to install Vite-specific plugins for them, but the corresponding pre-processor itself must be installed:

### JSON files can be directly imported

### Pre-Bundling

#### es-build
Our current build tools for the web are 10-100x slower than they could be:
The main goal of the esbuild bundler project is to bring about a new era of build tool performance, and create an easy-to-use modern bundler along the way.
![image.png](https://pic1.zhimg.com/80/v2-b77d6af5e0f5bbdc6ac45a2b2f00d87c_1440w.webp)

#### common-js -> esm

``` javascript
// input
const dep = require('dep');
console.log(dep);

// output
import * as dep$1 from 'dep';

function getAugmentedNamespace(n) {
  var a = Object.defineProperty({}, '__esModule', { value: true });
  Object.keys(n).forEach(function (k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(
      a,
      k,
      d.get
        ? d
        : {
            enumerable: true,
            get: function () {
              return n[k];
            }
          }
    );
  });
  return a;
}

var dep = /*@__PURE__*/ getAugmentedNamespace(dep$1);

console.log(dep);
```

### .env 

``` javascript
console.log(import.meta.env.VITE_SOME_KEY) // 123
console.log(import.meta.env.DB_PASSWORD) // undefined
```

## unplugin

### unplugin-vue-macros/vite
提供许多宏，简化代码

安装：
1. npm i unplugin-vue-macros
2. vite.config.js中接入

``` javascript
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
    Inspect({
        outputDir: '.vite-inspect'
    })
],
```

3. 安装ts插件 @vue-macros/volar
   
4.ts.config中接入

``` javascript
 "compilerOptions": {
        // ...
        "types": [
            "unplugin-vue-macros/macros-global" /* ... */
        ]
    },
    "vueCompilerOptions": {
        "plugins": [
            "@vue-macros/volar/define-options",
            "@vue-macros/volar/define-models",
            "@vue-macros/volar/define-props",
            "@vue-macros/volar/define-props-refs",
            "@vue-macros/volar/short-vmodel",
            "@vue-macros/volar/define-slots",
            "@vue-macros/volar/export-props"
        ],
        "shortVmodel": {
            "prefix": "$"
        }
    }
```
5.选装vite-plugin-inspect

6. 配置unplugin-auto-import

[配置unplugin-auto-import](https://www.npmjs.com/package/unplugin-auto-import)

## 6.1 与ts环境集成

``` javascript
AutoImport({
  dts: true // or a custom path
})
```
> Enable options.dts so that auto-imports.d.ts file is automatically generated
> Make sure auto-imports.d.ts is not excluded in tsconfig.json

## 6.2 与eslint集成

1.Enable eslintrc.enabled

``` javascript

eslintrc: {
    enabled: true, // Default `false`
    filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
    globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
  }

```

2. Update your eslintrc: Extending Configuration Files

``` javascript
// .eslintrc.js
module.exports = {
  extends: [
    './.eslintrc-auto-import.json',
  ],
}
```

## 7 服务器构建

### 配置baseurl， 用于引导index.html引入的静态资源
### 配置nginx 

``` nginx
 location /vite3D {
    root   html;
    index  index.html index.htm;
    try_files $uri $uri/ /vite3D/index.html;
}
```

## 8.其他
### .eslintrc.js 与.eslint.cjs的区别
[配置文件格式](https://zh-hans.eslint.org/docs/latest/use/configure/configuration-files)
```
JavaScript - 使用 .eslintrc.js 并导出包括配置的对象。 JavaScript (ESM) - 当在 JavaScript 包中运行 ESLint 时，且其 package.json 中指定 "type":"module" 时，使用 .eslintrc.cjs。请注意 ESLint 目前不支持 ESM 配置。 YAML - 使用 .eslintrc.yaml 或 .eslintrc.yml 来定义配置结构。 JSON - 使用 .eslintrc.json 来定义配置结构。ESLint JSON 文件中也可以使用 JavaScript 风格注释。 package.json - 在 package.json 文件中创建 eslintConfig 属性并在那里定义你的配置。
```

### package.json 的type字段

[npm](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
[package.json中type的含义](http://www.manongjc.com/detail/22-ojhfzhiuhfojawa.html)

type字段的产生用于定义package.json文件和该文件所在目录根目录中.js文件和无拓展名文件的处理方式。值为'moduel'则当作es模块处理；值为'commonjs'则被当作commonJs模块处理


当package.json.type = 'module'时，配置autoImport.config.js的导出为commonjs格式，则出现以下报错

```
module.exports = {
    ...
}
```

```
ERROR: No matching export in "autoImport.config.js" for import "default"
```

#### 不管type字段的值是多少, 以.mjs后缀名的文件总是被当作ES6模块,而以.cjs后缀名的文件总是被当成CommonJS模块


目前node默认的是如果pacakage.json没有定义type字段，则按照commonJs规范处理
node官方建议包的开发者明确指定package.json中type字段的值
无论package.json中的type字段为何值，.mjs的文件都按照es模块来处理，.cjs的文件都按照commonJs模块来处理

### commonjs 改为 esm
#### 解决 __dirname is not defined in ES module scope 报错

原因：__dirname 是commonjs环境自动注入的变量，换成esm环境自然无此变量

``` javascript
const __dirname = path.dirname(fileURLToPath(import.meta.url))

```

### import.meta

import.meta是一个给 JavaScript 模块暴露特定上下文的元数据属性的对象。它包含了这个模块的信息，比如说这个模块的 URL。

import.meta对象是由 ECMAScript 实现的，它带有一个null的原型对象。这个对象可以扩展，并且它的属性都是可写，可配置和可枚举的。

[import.meta](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/import.meta)
