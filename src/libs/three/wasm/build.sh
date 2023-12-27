~/develop/emscripten-main/emcc -v
~/develop/emscripten-main/emcc ./main.cpp -o three.wasm.js -sEXPORTED_FUNCTIONS=_malloc,_add,_add_1,_vec3ApplyMatrix4 -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue --extern-post-js _post.tpl

cp ./three.wasm.wasm ../../../../static/