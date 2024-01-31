~/develop/emscripten-main/emcc ./main.cpp ./a.cpp ./b.cpp -o staticLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1  -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

cp ./staticLink.wasm.wasm ../../../../../static/static_linking
cp ./staticLink.wasm.js ../../../../../static/static_linking