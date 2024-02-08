#include "a.h"
#include <iostream>
// #include <emscripten/emscripten.h>
#include <boost/algorithm/clamp.hpp>
using namespace std;

// extern "C"
// {
void boostFn()
{
    int value = 5;
    int low = 10, high = 20;
    int ans = boost::algorithm::clamp(value, low, high);
    cout << "clamped value by boost:" << ans << endl;
};

void sayHello()
{
    cout << "hello" << endl;
};
void sayHi()
{
    cout << "hi" << endl;
};
void sayGoodBye()
{
    cout << "good bye" << endl;
};
// }
