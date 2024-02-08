#include "a.h"
#include <iostream>
#include <emscripten/emscripten.h>
#include <boost/algorithm/clamp.hpp>
using namespace std;

bool isOdd(int i) { return i % 2 == 1; }
bool lessThan10(int i) { return i < 10; }

extern "C"
{
    void EMSCRIPTEN_KEEPALIVE sayHello()
    {
        cout << "hello" << endl;
    };
    void EMSCRIPTEN_KEEPALIVE sayHi()
    {
        cout << "hi" << endl;
    };
    void EMSCRIPTEN_KEEPALIVE sayGoodBye()
    {
        cout << "good bye" << endl;
    };
    void EMSCRIPTEN_KEEPALIVE boostFn()
    {
        int value = 5;
        int low = 10, high = 20;
        int ans = boost::algorithm::clamp(value, low, high);
        cout << "clamped value by boost:" << ans << endl;
    };
}
