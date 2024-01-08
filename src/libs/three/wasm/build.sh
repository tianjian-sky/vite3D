~/develop/emscripten-main/emcc -v
~/develop/emscripten-main/emcc ./main.cpp -lembind -o three.wasm.js -sEXPORT_ES6=1 -sEXPORTED_FUNCTIONS=_malloc,_free,_add,_add_1,_vec3ApplyMatrix4,_mat4MultiplyMat4,_mat4PreMultiplyMat4,_mat4MultiplyMat4CallJs,_runJs1,_runJs2 -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue

cp ./three.wasm.wasm ../../../../static/