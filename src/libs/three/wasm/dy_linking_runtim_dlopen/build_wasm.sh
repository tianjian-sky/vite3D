# -c
# Tells emcc to emit an object file which can then be linked with other object files to produce an executable.

# Runtime dynamic linking can be performed by the calling the dlopen() function to load side modules after the program is already running.
# The procedure begins in the same way, with the same flags used to build the main and side modules.
# The difference is that you do not specify the side modules on the command line when linking the main module; instead, you must load the side module into the filesystem, so that dlopen (or fopen, etc.) can access it 


~/develop/emscripten-main/emcc --clear-cache
~/develop/emscripten-main/emcc ./lib/a.cpp  -o liba.so  -I/usr/local/lib/boost -sSIDE_MODULE -mnontrapping-fptoint #   -I/usr/local/lib/boost
~/develop/emscripten-main/emcc -sMAIN_MODULE=2 ./main.cpp liba.so  -o dynLink.wasm.js --embed-file . -mnontrapping-fptoint -sEXPORT_ES6=1  -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue --pre-js=pre.js  -sENVIRONMENT=web -sINITIAL_MEMORY=52428800  #  -L./ -la  -sALLOW_MEMORY_GROWTH=1   --embed-file .


# sed [opstions] "addresscommand...[flags]" filename
# sed -ir 's/dynLink\.wasm\.wasm/\/dy_linking_runtime_embed\/dynLink\.wasm\.wasm/g' dynLink.wasm.js

cp ./liba.so ../../../../../static/dy_linking_runtim_dlopen
cp ./dynLink.wasm.js ../../../../../static/dy_linking_runtim_dlopen
cp ./dynLink.wasm.wasm ../../../../../static/dy_linking_runtim_dlopen
