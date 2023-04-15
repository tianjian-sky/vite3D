
# all macros
## Implemented by Vue 3.3
> defineOptions
    Options API can be declared using the defineOptions in <script setup>, specifically to be able to set name, props, emits, and render inside of one function.

> defineSlots
> shortEmits
    Simplify the definition of emits

    ``` vue
    <script setup lang="ts">
        const increment = defineEmit('increment')
    </script>

    <template>
        <button @click="increment">increment</button>
    </template>
    ```

## Stable Features
> defineModels
> defineProps
> definePropsRefs
> defineRender
> shortVmodel
## Experimental Features
> defineProp
> defineEmit
> setupComponent
> setupSFC