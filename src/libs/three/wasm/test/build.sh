# -c
# Tells emcc to emit an object file which can then be linked with other object files to produce an executable.

# Runtime dynamic linking can be performed by the calling the dlopen() function to load side modules after the program is already running.
# The procedure begins in the same way, with the same flags used to build the main and side modules.
# The difference is that you do not specify the side modules on the command line when linking the main module; instead, you must load the side module into the filesystem, so that dlopen (or fopen, etc.) can access it 


# ~/develop/emscripten-main/emcc --clear-cache


g++ ./lib/a.cpp -shared -o liba.so -I/usr/local/lib/boost
g++ ./main.cpp --std=c++11 -L. -la