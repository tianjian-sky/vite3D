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
    extern void _sayGoodbye();
    extern void _sayHello();
}

int main() {}