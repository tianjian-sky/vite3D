#include <emscripten/emscripten.h>
#include <assert.h>
#include <iostream>
#include <stdlib.h>
#include <dlfcn.h>

using namespace std;

#define DL_TYPE 2 // 1 dlopen() 2 emscripten_dlopen(...)

int mydata = 0;

void invokeLibFn(void *handle)
{
    void (*_sayHi)() = (void (*)())dlsym(handle, "sayHi");
    void (*_sayHello)() = (void (*)())dlsym(handle, "sayHello");
    void (*_sayGoodBye)() = (void (*)())dlsym(handle, "sayGoodBye");
    void (*_boostFn)() = (void (*)())dlsym(handle, "boostFn");
    cout << "boostFn success" << handle << _sayHi << ":" << _sayHello << endl;
    cout << "dl_open success" << endl;
    _sayHi();
    _sayHello();
    _sayGoodBye();
    _boostFn();
}
void onsuccess(void *user_data, void *handle)
{
    assert(user_data == &mydata);
    invokeLibFn(handle);
}

void onerror(void *user_data)
{
    assert(user_data == &mydata);
    cout << "dl_open failed" << endl;
}

extern "C"
{
    void EMSCRIPTEN_KEEPALIVE say()
    {
        // 动态库接口必须在extern C 中
        cout << "say wrapper" << endl;
        if (DL_TYPE == 1)
        {
            void *handle = dlopen("liba.so", RTLD_NOW);
            invokeLibFn(handle);
        }
        else
        {
            emscripten_dlopen("liba.so", RTLD_NOW, &mydata, onsuccess, onerror);
        }
        cout << "after dlopen() return main" << endl;
    }
}
// int main()
// {
//     return 99;
// }
