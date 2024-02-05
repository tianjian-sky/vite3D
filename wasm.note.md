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

### 关于EM_ASM 宏
https://en.cppreference.com/w/cpp/preprocessor/replace
https://blog.csdn.net/chengyq116/article/details/128668069
[宏展开的可视化](https://godbolt.org/)

``` c++
// Runs the given JavaScript code on the calling thread (synchronously), and returns no value back.
#define EM_ASM(code, ...) ((void)emscripten_asm_const_int(CODE_EXPR(#code) _EM_ASM_PREP_ARGS(__VA_ARGS__)))
// Runs the given JavaScript code on the calling thread (synchronously), and returns an i32 back.
#define EM_ASM_INT(code, ...) emscripten_asm_const_int(CODE_EXPR(#code) _EM_ASM_PREP_ARGS(__VA_ARGS__))
// Runs the given JavaScript code on the calling thread (synchronously), and returns an pointer back.
// On wasm32 this is the same as emscripten_asm_const_int but on wasm64 it returns an i64.
#define EM_ASM_PTR(code, ...) emscripten_asm_const_ptr(CODE_EXPR(#code) _EM_ASM_PREP_ARGS(__VA_ARGS__))
// Runs the given JavaScript code on the calling thread (synchronously), and returns a double back.
#define EM_ASM_DOUBLE(code, ...) emscripten_asm_const_double(CODE_EXPR(#code) _EM_ASM_PREP_ARGS(__VA_ARGS__))

#define CODE_EXPR(code) (__extension__({           \
    __attribute__((section("em_asm"), aligned(1))) \
    static const char x[] = code;                  \
    x;                                             \
}))

``` c++
#define _EM_ASM_PREP_ARGS(...) \
    , __em_asm_sig_builder<__typeof__(__em_asm_make_type_tuple(__VA_ARGS__))>::buffer, ##__VA_ARGS__

template<typename>
struct __em_asm_sig_builder {};
// Instead of std::tuple
template<typename... Args>
struct __em_asm_type_tuple {};

// Instead of std::make_tuple
template<typename... Args>
__em_asm_type_tuple<Args...> __em_asm_make_type_tuple(Args... args) {
    return {};
}

```
#### std::tuple
元组(tuple)是一种用于组合多个不同类型的值的数据结构
[tuple](https://zhuanlan.zhihu.com/p/666443999?utm_id=0)

``` c++
std::tuple <int, double, std::string> myTuple(10, 1.23, "Hello");

std::tuple<int, double, std::string> myTuple{10, 1.23, "Hello"};
// 使用std::make_tuple()函数创建元组
// 不需要指定各个元素数据类型
auto myTuple = std::make_tuple(10, 1.23, "Hello");

```

#### _typeof__()
_typeof__（）和 __typeof（）和  typeof（） 都是 C 的扩展，且意思是相同的，
https://blog.csdn.net/lhl_blog/article/details/8160098


#### gnu c __attribute__ 编译器命令
[来了解一下GNU C __attribute__机制](https://zhuanlan.zhihu.com/p/474790212)

#### c __extension__ 
[C语言宏定义前面的 extension 是什么意思](https://docs.pingcode.com/ask/23824.html)
__extension__是一个编译器指令，用于告诉编译器对宏进行扩展时可以使用一些不符合 ANSI 标准的语法。这个指令通常用于避免编译器产生一些不必要的警告或错误信息。

#### __VA_ARGS__ 可变参数宏
[C / C++ 可变参数的宏](https://www.jianshu.com/p/958162214e91)

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

### EMSCRIPTEN_BINDINGS
Embind is used to bind C++ functions and classes to JavaScript, so that the compiled code can be used in a natural way by “normal” JavaScript. Embind also supports calling JavaScript classes from C++.

``` c++

struct PersonRecord
{
    std::string name;
    int age;
};

struct ArrayInStruct
{
    int field[2];
};

PersonRecord findPersonAtLocation(Point2f pt)
{
    cout << pt.x << ":" << pt.y << endl;
    PersonRecord res;
    res.name = "yutianjian";
    res.age = 37;
    return res;
}

EMSCRIPTEN_BINDINGS(my_value_example)
{
    emscripten::value_array<Point2f>("Point2f")
        .element(&Point2f::x)
        .element(&Point2f::y);

    emscripten::value_object<PersonRecord>("PersonRecord")
        .field("name", &PersonRecord::name)
        .field("age", &PersonRecord::age);

    emscripten::value_object<ArrayInStruct>("ArrayInStruct")
        .field("field", &ArrayInStruct::field);

    // Register std::array<int, 2> because ArrayInStruct::field is interpreted as such
    emscripten::value_array<std::array<int, 2>>("array_int_2")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>());
    emscripten::function("findPersonAtLocation", &findPersonAtLocation);
}

```
``` javascript
 var person = WASM.findPersonAtLocation([10.2, 156.5]);
console.log('Found someone! Their name is ' + person.name + ' and they are ' + person.age + ' years old');
```

#### allow_raw_pointers
Because raw pointers have unclear lifetime semantics, embind requires their use to be marked with allow_raw_pointers.

``` javascript
class C {};
C* passThrough(C* ptr) { return ptr; }
EMSCRIPTEN_BINDINGS(raw_pointers) {
    class_<C>("C");
    function("passThrough", &passThrough, allow_raw_pointers());
}
```

#### value_array, value_object
Value arrays are converted to and from JavaScript Arrays
value objects are converted to and from JavaScript Objects.


##  --closure 1
代码混淆

## --post-js _post.tpl
在编译出的js文件增加前缀后缀代码


## --extern-pre-js ----extern-post-js
Specify a file whose contents are prepended to the JavaScript output. This file is prepended to the final JavaScript output, after all other work has been done, including optimization, optional MODULARIZE-ation, instrumentation like SAFE_HEAP, etc. 



### assemblyScript 
Its similarity with TypeScript makes it easy to compile to WebAssembly without learning a new language.

https://github.com/AssemblyScript/assemblyscript/tree/main/std/assembly/rt
https://www.assemblyscript.org/compiler.html#compiler-options
https://www.assemblyscript.org/stdlib/globals.html


## -mnontrapping-fptoint.
The LLVM Wasm backend avoids traps by adding more code around each possible trap (basically clamping the value if it would trap). This can increase code size and decrease speed, if you don’t need that extra code. The proper solution for this is to use newer Wasm instructions that do not trap, by calling emcc or clang with -mnontrapping-fptoint. That code may not run in older VMs, though.

## Web server setup
To serve Wasm in the most efficient way over the network, make sure your web server has the proper MIME type for .wasm files, which is application/wasm. That will allow streaming compilation, where the browser can start to compile code as it downloads.

In Apache, you can do this with

AddType application/wasm .wasm
Also make sure that gzip is enabled:

AddOutputFilterByType DEFLATE application/wasm
If you serve large .wasm files, the webserver will consume CPU compressing them on the fly at each request. Instead you can pre-compress them to .wasm.gz and use content negotiation:

Options Multiviews
RemoveType .gz
AddEncoding x-gzip .gz
AddType application/wasm .wasm

## static linking

```shell
 emcc a.o b.o c.o --memory-init-file=0  -o ./build/avc.js   -sFILESYSTEM=0  -sINVOKE_RUN=0 -sDOUBLE_MODE=0 -sAGGRESSIVE_VARIABLE_ELIMINATION=1 -sALIASING_FUNCTION_POINTERS=1 -sDISABLE_EXCEPTION_CATCHING=1 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_broadwayGetMajorVersion,_broadwayGetMinorVersion,_broadwayInit,_broadwayExit,_broadwayCreateStream,_broadwayPlayStream,_broadwayOnHeadersDecoded,_broadwayOnPictureDecoded -sINITIAL_MEMORY=52428800 --js-library ./Decoder/library.js 
```

## dynamic linking

In Emscripten’s case, code is typically going to run on the web. That means the following:

* The application is running in a sandbox. It has no local system libraries to dynamically link to; it must ship its own system library code.

* Code size is a major concern, as the application’s code is being downloaded over the internet, which is many orders of magnitude slower than an installed native app on one’s local machine.

For that reason, Emscripten automatically handles system libraries for you and automatically does dead code elimination etc. to do the best possible job it can at getting them small.

### Load-time Dynamic Linking

#### 1.full export
``` shell
~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.o -sSIDE_MODULE  -mnontrapping-fptoint # -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi # -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE ./main.cpp a.o  -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

```
#### 2.DCE'd module. We eliminate dead code normally.
``` shell
~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.o -sSIDE_MODULE=2  -mnontrapping-fptoint # -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi # -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE=2 ./main.cpp a.o  -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

```

However when linking a main module without its side modules (Usually with -sMAIN_MODULE=1) it is possible that required system libraries are not included. This section explains what to do to fix that by forcing the main module to be linked against certain libraries.

You can build the main module with EMCC_FORCE_STDLIBS=1 in the environment to force inclusion of all standard libs. A more refined approach is to name the system libraries that you want to explicitly include. For example, with something like EMCC_FORCE_STDLIBS=libcxx,libcxxabi (if you need those two libs).


### Runtime Dynamic Linking with dlopen() dlsym()

#### dlopen
``` c++
#include <dlfcn.h>

void *dlopen(const char *filename, int flag);
//dlopen用于打开指定名字(filename)的动态链接库，并返回操作句柄

```
#### dlsym

``` c++

void *dlsym(void *handle, const char *symbol);  
//根据动态链接库操作句柄与符号,返回符号对应的地址。使用这个函数不但可以获取函数地址，也可以获取变量地址。handle是由dlopen打开动态链接库后返回的指针，symbol就是要求获取的函数或全局变量的名称.

```

### Packaging Files
[Packaging Files](https://emscripten.org/docs/porting/files/packaging_files.html#packaging-files)

#### embed-file
#### preload-file
here are two alternatives for how files are packaged: preloading and embedding. Embedding stores the specified files inside the wasm file, while preloading packages them in a bundle on the side. Embedding files is more efficient than preloading because there isn’t a separate file to download and copy, but preloading enables the option to separately host the data.

Emcc uses the file packager to package the files and generate the File System API calls that create and load the file system at run time. While Emcc is the recommended tool for packaging, there are cases where it can make sense to run the file packager manually
### Emscripten file system architecture
MEMFS is mounted at / when the runtime is initialized. Files to be added to the MEMFS virtual file system are specified at compile time using emcc, as discussed in Packaging Files. The files are loaded asynchronously by JavaScript using Synchronous XHRs when the page is first loaded. The compiled code is only allowed to run (and call synchronous APIs) when the asynchronous download has completed and the files are available in the virtual file system.



