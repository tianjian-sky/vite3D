# ~/develop/emscripten-main/emcc --clear-cache
~/develop/emscripten-main/emcc -v
~/develop/emscripten-main/emcc -msimd128  -O3   ./main.cpp ./Mat4.cpp -lembind -o three.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_malloc,_free,_mat4MultiplyMat4,_mat4MultiplyMat4CallJs,_vec3MultiplyMat4CallJs,_vec3MultiplyMat4,_mat4MultiplyMat4ReturnVoid,_getEdgeGeomVertices -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

cp ./three.wasm.js ../../../../static/
cp ./three.wasm.wasm ../../../../static/