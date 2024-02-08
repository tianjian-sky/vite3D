#include "./lib/a.h"
#include <emscripten/emscripten.h>
using namespace std;

extern "C"
{

    void EMSCRIPTEN_KEEPALIVE say()
    {
        sayHello();
        sayHi();
        sayGoodBye();
        boostFn();
    }
}
