## as of vue 3.2.13+ and @vitejs/plugin-vue 1.9.0+, @vue/compiler-sfc is no longer required as a peer dependency.


## options
``` javascript
export interface Options {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]

  isProduction?: boolean

  // options to pass on to vue/compiler-sfc
  script?: Partial<Pick<SFCScriptCompileOptions, 'babelParserPlugins'>>
  template?: Partial<
    Pick<
      SFCTemplateCompileOptions,
      | 'compiler'
      | 'compilerOptions'
      | 'preprocessOptions'
      | 'preprocessCustomRequire'
      | 'transformAssetUrls'
    >
  >
  style?: Partial<Pick<SFCStyleCompileOptions, 'trim'>>

  /**
   * Transform Vue SFCs into custom elements.
   * - `true`: all `*.vue` imports are converted into custom elements
   * - `string | RegExp`: matched files are converted into custom elements
   *
   * @default /\.ce\.vue$/
   */
  customElement?: boolean | string | RegExp | (string | RegExp)[]

  /**
   * Enable Vue reactivity transform (experimental).
   * https://vuejs.org/guide/extras/reactivity-transform.html
   * - `true`: transform will be enabled for all vue,js(x),ts(x) files except
   *           those inside node_modules
   * - `string | RegExp`: apply to vue + only matched files (will include
   *                      node_modules, so specify directories if necessary)
   * - `false`: disable in all cases
   *
   * @default false
   */
  reactivityTransform?: boolean | string | RegExp | (string | RegExp)[]

  /**
   * Use custom compiler-sfc instance. Can be used to force a specific version.
   */
  compiler?: typeof _compiler
}
```

### Reactivity Transform

[Refs vs. Reactive Variables](https://vuejs.org/guide/extras/reactivity-transform.html#refs-vs-reactive-variables)

``` vue
<script setup>
let count = $ref(0)

console.log(count)

function increment() {
  count++
}
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```
> ref -> $ref
> computed -> $computed
> shallowRef -> $shallowRef
> customRef -> $customRef
> toRef -> $toRef
>

#### Destructuring with $()

``` javascript
import { useMouse } from '@vueuse/core'

const { x, y } = $(useMouse())

console.log(x, y)
```

output

``` javascript
import { toRef } from 'vue'
import { useMouse } from '@vueuse/core'

const __temp = useMouse(),
  x = toRef(__temp, 'x'),
  y = toRef(__temp, 'y')

console.log(x.value, y.value)
```

#### destruct props后不能响应的问题
``` javascript
instance.props = isSSR ? props : shallowReactive(props);
``` 
``` javascript

const shallowReactiveHandlers = /*#__PURE__*/ extend({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet
});
```

``` vue
<script setup lang="ts">
  interface Props {
    msg: string
    count?: number
    foo?: string
  }

  const {
    msg,
    // default value just works
    count = 1,
    // local aliasing also just works
    // here we are aliasing `props.foo` to `bar`
    foo: bar
  } = defineProps<Props>()

  watchEffect(() => {
    // will log whenever the props change
    console.log(msg, count, bar)
  })
</script>
```

#### $$()
before
``` javascript
function useMouse() {
  let x = $ref(0)
  let y = $ref(0)

  // listen to mousemove...

  // doesn't work!
  return {
    x,
    y
  }
  /*
  return {
  x: x.value,
  y: y.value
}
*/
}
```

after
``` javascript
function useMouse() {
  let x = $ref(0)
  let y = $ref(0)

  // listen to mousemove...

  // fixed
  return $$({
    x,
    y
  })
}
```

#### 配置
1.vite
2. webpack

``` javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          reactivityTransform: true
        }
      }
    ]
  }
}
```

### Asset URL handling
before

``` javascript
<img src="../image.png" />
```

after

``` javascript
<script setup>
import _imports_0 from '../image.png'
</script>

<img :src="_imports_0" />
```
By default the following tag/attribute combinations are transformed, and can be configured using the template.transformAssetUrls option.

``` json
{
  video: ['src', 'poster'],
  source: ['src'],
  img: ['src'],
  image: ['xlink:href', 'href'],
  use: ['xlink:href', 'href']
}
```

### Using Vue SFCs as Custom Elements

Vue 3.2 introduces the defineCustomElement method, which works with SFCs. By default, <style> tags inside SFCs are extracted and merged into CSS files during build. However when shipping a library of custom elements, it may be desirable to inline the styles as JavaScript strings and inject them into the custom elements' shadow root instead.

Starting in 1.4.0, files ending with *.ce.vue will be compiled in "custom elements" mode: its <style> tags are compiled into inlined CSS strings and attached to the component as its styles property:

``` javascript
import { defineCustomElement } from 'vue'
import Example from './Example.ce.vue'

console.log(Example.styles) // ['/* css content */']

// register
customElements.define('my-example', defineCustomElement(Example))
```

## @vue/compiler-sfc

```
This package contains lower level utilities that you can use if you are writing a plugin / transform for a bundler or module system that compiles Vue Single File Components (SFCs) into JavaScript. It is used in vue-loader, rollup-plugin-vue and vite.
```

### Example for passing options to vue/compiler-sfc:

``` javascript
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // ...
        },
        transformAssetUrls: {
          // ...
        },
      },
    }),
  ],
}
```

### eslint 报$ref() is not defined
配置eslint
在eslintrc.cjs中加上globals 全局变量
``` js
    globals: {
        $ref: 'readonly' // 开启reactivityTransform: true后，会报错：'$ref' is not defined 
    },
```

[Specifying Globals](https://www.eslint.com.cn/docs/user-guide/configuring#specifying-globals)
