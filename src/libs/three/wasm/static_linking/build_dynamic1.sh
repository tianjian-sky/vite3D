# -c
# Tells emcc to emit an object file which can then be linked with other object files to produce an executable.
~/develop/emscripten-main/emcc ./a.cpp  -c -o a.o -sSIDE_MODULE
~/develop/emscripten-main/emcc ./b.cpp  -c -o b.o -sSIDE_MODULE
~/develop/emscripten-main/emcc -sMAIN_MODULE ./main.cpp a.o b.o  -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1  -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

# cp ./dynLink.wasm.wasm ../../../../../static