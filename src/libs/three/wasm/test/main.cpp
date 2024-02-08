#include <assert.h>
#include <iostream>
#include <stdlib.h>
#include <dlfcn.h>

using namespace std;

#define DL_TYPE 1 // 1 dlopen() 2 emscripten_dlopen(...)

int mydata = 0;

int main()
{
    if (DL_TYPE == 1)
    {
        void *handle = dlopen("./liba.so", RTLD_NOW);
        void (*_sayHi)() = (void (*)())dlsym(handle, "sayHi");
        void (*_sayHello)() = (void (*)())dlsym(handle, "sayHello");
        void (*_sayGoodBye)() = (void (*)())dlsym(handle, "sayGoodBye");
        void (*_boostFn)() = (void (*)())dlsym(handle, "boostFn");
        cout << "dl_open success" << endl;
        _sayHi();
        _sayHello();
        _sayGoodBye();
        _boostFn();
    }
    cout << "after dlopen() return main" << endl;
    return 99;
}
