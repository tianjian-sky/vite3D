## Calling compiled C functions from JavaScript using ccall/cwrap

[Calling compiled C functions from JavaScript using ccall/cwrap](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-code-ccall-cwrap)

## extern "C"
to prevent C++ name mangling.

### ccall() or cwrap().
The easiest way to call compiled C functions from JavaScript is to use ccall() or cwrap().

#### ccall() calls a compiled C function with specified parameters and returns the result, 
#### cwrap() “wraps” a compiled C function and returns a JavaScript function you can call normally. cwrap() is therefore more useful if you plan to call a compiled function a number of times.

EXPORTED_FUNCTIONS tells the compiler what we want to be accessible from the compiled code (everything else might be removed if it is not used), and EXPORTED_RUNTIME_METHODS tells the compiler that we want to use the runtime functions ccall and cwrap (otherwise, it will not include them).

``` javascript
function ccall(ident, returnType, argTypes, args, opts) {
      // For fast lookup of conversion functions
    var toC = {
    'string': (str) => {
        var ret = 0;
        if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = stringToUTF8OnStack(str);
        }
        return ret;
    },
    'array': (arr) => {
        var ret = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret);
        return ret;
    }
    };

    function convertReturnValue(ret) {
    if (returnType === 'string') {
        
        return UTF8ToString(ret);
    }
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
    }

    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
    for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
        } else {
        cArgs[i] = args[i];
        }
    }
    }
    var ret = func.apply(null, cArgs);
    function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
    }

    ret = onDone(ret);
    return ret;
}

/**
 * @param {string=} returnType
 * @param {Array=} argTypes
 * @param {Object=} opts
 */
function cwrap(ident, returnType, argTypes, opts) {
    return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
    }
}
```

### Using direct function calls

Functions in the original source become JavaScript functions, so you can call them directly if you do type translations yourself — this will be faster than using ccall() or cwrap(), but a little more complicated.

To call the method directly, you will need to use the full name as it appears in the generated code. This will be the same as the original C function, but with a leading _.

If you use ccall() or cwrap(), you do not need to prefix function calls with _ – just use the C name.

#### The parameters you pass to and receive from functions need to be primitive values:

Integer and floating point numbers can be passed as-is.

Pointers can be passed as-is also, as they are simply integers in the generated code.

#### JavaScript string someString can be converted to a char * using ptr = stringToNewUTF8(someString).

Note
The conversion to a pointer allocates memory, which needs to be freed up via a call to free(ptr) afterwards (_free in JavaScript side) -
char * received from C/C++ can be converted to a JavaScript string using UTF8ToString().
There are other convenience functions for converting strings and encodings in preamble.js.
Other values can be passed via emscripten::val. Check out examples on as_handle and take_ownership methods.

## Calling JavaScript from C/C++

## emscripten_run_script

The most direct, but slightly slower, way is to use emscripten_run_script(). This effectively runs the specified JavaScript code from C/C++ using eval().

``` c++

int main() {
  // EMSCRIPTEN_COMMENT("hello from the source");
  emscripten_run_script("out('hello world' + '!')");
  printf("*%d*\n", emscripten_run_script_int("5*20"));
  printf("*%s*\n", emscripten_run_script_string("'five'+'six'"));
  emscripten_run_script("Module['_save_me_aimee']()");
}
```
* emscripten_run_script_int
* emscripten_run_script_string
* emscripten_run_script



### EM_JS
EM_JS’s implementation is essentially a shorthand for implementing a JavaScript library.
``` c++
EM_JS(void, print_args, (float x, float y), {
    console.log('I received: ' + x + '+ ' + y);
});
float add_2(float *arr)
{
    char sBuf[15];
    gcvt(arr[0], 12, sBuf);
    // emscripten_console_logf(temp);
    cout << sBuf << endl;
    // emscripten_console_log("11111");
    // emscripten_console_logf(sBuf);
    gcvt(arr[1], 12, sBuf);
    // emscripten_console_logf(sBuf);
    cout << sBuf << endl;
    print_args(arr[0], arr[1]);
    return arr[1] + arr[0];
}
```

## 数组类型js入参处理
``` javascript
var toC = {
    'string': (str) => {
        var ret = 0;
        if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = stringToUTF8OnStack(str);
        }
        return ret;
    },
    'array': (arr) => {
        var ret = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret);
        return ret;
    }
};
```
### stackAlloc

``` javascript
var stackAlloc = createExportWrapper("stackAlloc");
```

### writeArrayToMemory
``` javascript
writeArrayToMemory(arr, ret);
```
``` javascript
function writeArrayToMemory(array, buffer) {
    assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
    HEAP8.set(array, buffer);
}
```
其实就是在wasm内存中，申请一段buffer，再往buffer里填充内容

## string类型js入参处理
``` javascript
var toC = {
    'string': (str) => {
        var ret = 0;
        if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = stringToUTF8OnStack(str);
        }
        return ret;
    },
    'array': (arr) => {
        var ret = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret);
        return ret;
    }
};
```

## js调用c流程

### 
1. createExportWrapper
> var _add = Module["_add"] = createExportWrapper("add");

``` javascript
/** @param {boolean=} fixedasm */
function createExportWrapper(name, fixedasm) {
    return function () {
        var displayName = name;
        var asm = fixedasm;
        if (!fixedasm) {
            asm = Module['asm'];
        }
        assert(runtimeInitialized, 'native function `' + displayName + '` called before runtime initialization');
        if (!asm[name]) {
            assert(asm[name], 'exported native function `' + displayName + '` not found');
        }
        return asm[name].apply(null, arguments);
    };
}
```
2. getCFunc
> var func = getCFunc(ident);

3. appply
> var ret = func.apply(null, cArgs);




##  --closure 1
代码混淆

## --post-js _post.tpl
在编译出的js文件增加前缀后缀代码


## --extern-pre-js ----extern-post-js
Specify a file whose contents are prepended to the JavaScript output. This file is prepended to the final JavaScript output, after all other work has been done, including optimization, optional MODULARIZE-ation, instrumentation like SAFE_HEAP, etc. 