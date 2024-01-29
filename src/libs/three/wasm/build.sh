~/develop/emscripten-main/emcc -v
~/develop/emscripten-main/emcc ./main.cpp ./Mat4.cpp -O3 -lembind -o three.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_malloc,_free,_mat4MultiplyMat4,_mat4MultiplyMat4CallJs,_vec3MultiplyMat4CallJs,_runJs2,_vec3MultiplyMat4,_mat4MultiplyMat4ReturnVoid -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

cp ./three.wasm.wasm ../../../../static/