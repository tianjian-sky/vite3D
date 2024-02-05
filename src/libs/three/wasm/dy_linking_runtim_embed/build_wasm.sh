# -c
# Tells emcc to emit an object file which can then be linked with other object files to produce an executable.

# Runtime dynamic linking can be performed by the calling the dlopen() function to load side modules after the program is already running.
# The procedure begins in the same way, with the same flags used to build the main and side modules.
# The difference is that you do not specify the side modules on the command line when linking the main module; instead, you must load the side module into the filesystem, so that dlopen (or fopen, etc.) can access it 



~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.so -sSIDE_MODULE=2  -mnontrapping-fptoint  #-sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi # -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE=2 ./main.cpp -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1  --embed-file . -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_main -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue --pre-js=pre.js  -sENVIRONMENT=web -sINITIAL_MEMORY=52428800


cp ./dynLink.wasm.js ../../../../../static/dy_linking_runtime_embed
cp ./dynLink.wasm.wasm ../../../../../static/dy_linking_runtime_embed
