~/develop/emscripten-main/emcc -v
~/develop/emscripten-main/emcc ./main.cpp -o three.wasm.js -sEXPORTED_FUNCTIONS=_add,_add_1,_add_2,_vec3ApplyMatrix4,_vec3ApplyMatrix4_2 -sEXPORTED_RUNTIME_METHODS=ccall,cwrap --extern-post-js _post.tpl

cp ./three.wasm.wasm ../../../../static/