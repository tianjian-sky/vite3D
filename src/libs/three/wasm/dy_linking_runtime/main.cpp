#include <emscripten/emscripten.h>
#include <assert.h>
#include <iostream>
#include <stdlib.h>
#include <dlfcn.h>

using namespace std;

#define DL_TYPE 2 // 1 dlopen() 2 emscripten_dlopen(...)

int mydata = 0;

void onsuccess(void *user_data, void *handle)
{
    assert(user_data == &mydata);
    void (*_sayHi)() = (void (*)())dlsym(handle, "sayHi");
    void (*_sayHello)() = (void (*)())dlsym(handle, "sayHello");
    void (*_sayGoodBye)() = (void (*)())dlsym(handle, "sayGoodBye");
    cout << "dl_open success" << endl;
    _sayHi();
    _sayHello();
    _sayGoodBye();
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
        cout << "say" << endl;
    }
}
int main()
{
    if (DL_TYPE == 1)
    {
        void *handle = dlopen("./a.so", RTLD_NOW);
        void (*_sayHi)() = (void (*)())dlsym(handle, "sayHi");
        void (*_sayHello)() = (void (*)())dlsym(handle, "sayHello");
        void (*_sayGoodBye)() = (void (*)())dlsym(handle, "sayGoodBye");
        cout << "dl_open success" << endl;
        _sayHi();
        _sayHello();
        _sayGoodBye();
    }
    else
    {
        emscripten_dlopen("./a.so", RTLD_NOW, &mydata, onsuccess, onerror);
    }
    cout << "after dlopen() return main" << endl;
    return 99;
}
