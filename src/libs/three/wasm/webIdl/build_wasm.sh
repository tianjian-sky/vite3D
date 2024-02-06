~/develop/emscripten-main/emcc ./test.cpp ./main.cpp -O3  --post-js glue.js -o test.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1  -sINITIAL_MEMORY=52428800 -I/Users/yutianjian/develop/babylonDemo/src/libs/three/wasm/webIdl

cp ./test.wasm.wasm ../../../../../static/webidl
cp ./test.wasm.js ../../../../../static/webidl
