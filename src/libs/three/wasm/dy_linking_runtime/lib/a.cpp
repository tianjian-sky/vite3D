#include "a.h"
#include <iostream>
#include <emscripten/emscripten.h>
using namespace std;

// extern "C"
// {
//     void EMSCRIPTEN_KEEPALIVE sayHello()
//     {
//         cout << "hello" << endl;
//     };
//     void EMSCRIPTEN_KEEPALIVE sayHi()
//     {
//         cout << "hi" << endl;
//     };
//     void EMSCRIPTEN_KEEPALIVE sayGoodBye()
//     {
//         cout << "good bye" << endl;
//     };
// }

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
