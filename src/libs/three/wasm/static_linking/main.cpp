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

    void EMSCRIPTEN_KEEPALIVE sayHi()
    {
        cout << "hi" << endl;
    }
    extern void sayGoodBye();
    extern void sayHello();
    void EMSCRIPTEN_KEEPALIVE say()
    {
        sayHello();
        sayHi();
        sayGoodBye();
    }
}

int main() {}