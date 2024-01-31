# -c
# Tells emcc to emit an object file which can then be linked with other object files to produce an executable.


# SIDE_MODULE
# MAIN_MODUL
#
# A main module is a file compiled in a way that allows us to link it to
# a side module at runtime.
# 1: Normal main module.
# 2: DCE'd main module. We eliminate dead code normally. If a side
# module needs something from main, it is up to you to make sure
# it is kept alive.
# [compile+link]
# var MAIN_MODULE = 0;
# Corresponds to MAIN_MODULE (also supports modes 1 and 2)
# [compile+link]
# var SIDE_MODULE = 0;

~/develop/emscripten-main/emcc ./lib/a.cpp  -c -o a.so -sSIDE_MODULE=2  -mnontrapping-fptoint  #-sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi # -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue 
~/develop/emscripten-main/emcc -sMAIN_MODULE=2 ./main.cpp a.so  -o dynLink.wasm.js -mnontrapping-fptoint -sEXPORT_ES6=1 -sALLOW_MEMORY_GROWTH=1 -sEXPORTED_FUNCTIONS=_sayGoodBye,_sayHello,_sayHi -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue -sINITIAL_MEMORY=52428800

cp ./dynLink.wasm.wasm ../../../../../static/dy_linking
cp ./dynLink.wasm.js ../../../../../static/dy_linking
cp ./a.so ../../../../../static/dy_linking