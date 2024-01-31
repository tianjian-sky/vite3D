## 动态链接
[Dynamic-Linking](https://emscripten.org/docs/compiling/Dynamic-Linking.html)
### Load-time Dynamic Linking
 the side modules are loaded along with the main module, during startup and they are linked together before your application starts to run.

* 不使用dlopen()
* 动态库编译时指定参数-sSIDE_MODULE=0|1|2
* 主模块编译时指定参数-sMAIN_MODULE=0|1|2
* 主模块编译时指定引入的动态库a.so


``` shell
~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.so -sSIDE_MODULE=2  -mnontrapping-fptoint  #-sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi # -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE=2 ./main.cpp a.so  -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

```
#### SIDE_MODULE=0|1|2的作用
* 1: Normal main module. 会包含所有的系统库不管用没用到
* 2: DCE'd main module. We eliminate dead code normally.

### Runtime Dynamic Linking with dlopen()

#### preload-file


There are two alternatives for how files are packaged: preloading and embedding. Embedding stores the specified files inside the wasm file, while preloading packages them in a bundle on the side. Embedding files is more efficient than preloading because there isn’t a separate file to download and copy, but preloading enables the option to separately host the data.

* 使用dlopen()
* 不再需要在主模块编译时，指定引入的动态库a.so
* 增加参数 --preload-file . 
* 需要动态加载的文件另外打包成一个.data文件
``` shell

~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.so -sSIDE_MODULE=2  -mnontrapping-fptoint  #-sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi # -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE=2 ./main.cpp -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1  --preload-file . -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue --pre-js=pre.js  -sENVIRONMENT=web -sINITIAL_MEMORY=52428800


```

#### embed-file

There are two alternatives for how files are packaged: preloading and embedding. Embedding stores the specified files inside the wasm file, while preloading packages them in a bundle on the side. Embedding files is more efficient than preloading because there isn’t a separate file to download and copy, but preloading enables the option to separately host the data.

* 使用dlopen()
* 不再需要在主模块编译时，指定引入的动态库a.so
* 增加参数 --embed-file . 
* 需要动态加载的文件直接放在wasm文件里
``` shell

~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.so -sSIDE_MODULE=2  -mnontrapping-fptoint  #-sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi # -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE=2 ./main.cpp -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1  --embed-file . -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue --pre-js=pre.js  -sENVIRONMENT=web -sINITIAL_MEMORY=52428800



```