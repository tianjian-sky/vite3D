#include <iostream>
#include <stdlib.h>
#include <array>
#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/console.h>
#include <emscripten/val.h>

using namespace std;

extern "C"
{
    void EMSCRIPTEN_KEEPALIVE sayGoodBye()
    {
        cout << "goodblye" << endl;
    }
    void EMSCRIPTEN_KEEPALIVE _sayGoodbye()
    {
        cout << "goodblye_" << endl;
    }
}
