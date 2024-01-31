#ifndef GOOD_H_
#define GOOD_H_
#include <emscripten/emscripten.h>

extern "C"
{
    void EMSCRIPTEN_KEEPALIVE sayHello();
    void EMSCRIPTEN_KEEPALIVE sayHi();
    void EMSCRIPTEN_KEEPALIVE sayGoodBye();
}

#endif