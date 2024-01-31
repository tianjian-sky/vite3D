# -c
# Tells emcc to emit an object file which can then be linked with other object files to produce an executable.
~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.so -sSIDE_MODULE  -mnontrapping-fptoint  -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi   -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE ./main.cpp a.so  -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1   -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

cp ./dynLink.wasm.js ../../../../../static/dy_linking_full
cp ./dynLink.wasm.wasm ../../../../../static/dy_linking_full
cp ./a.so ../../../../../static/dy_linking_full