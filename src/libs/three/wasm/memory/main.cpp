#include <iostream>
#include <stdlib.h>
#include <vector>
#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/heap.h>
#include <emscripten/console.h>
#include <emscripten/val.h>

using namespace std;

static vector<int> *vec = new vector<int>();
static vector<const int *> ptrs = new vector<int *>();
extern "C"
{
    extern void sayGoodBye();
    extern void sayHello();
    void EMSCRIPTEN_KEEPALIVE sayHi()
    {
        cout << "hi" << endl;
    }
    void EMSCRIPTEN_KEEPALIVE say()
    {
        sayHello();
        sayHi();
        sayGoodBye();
    }
    void EMSCRIPTEN_KEEPALIVE getHeapSize()
    {
        cout << "getHeapSize:" << (emscripten_get_heap_size() / 1024 / 1024) << "mb" << endl;
    }
    void EMSCRIPTEN_KEEPALIVE getMaxHeapSize()
    {
        cout << "getMaxHeapSize:" << (emscripten_get_heap_max() / 1024 / 1024) << "mb" << endl;
    }
    const int *EMSCRIPTEN_KEEPALIVE addData()
    {
        const int len = 1500000;
        const int *pt = new int[len];
        for (int i = 0; i < 1500000; i++)
        {
            pt[i] = i;
        }
        getHeapSize();
        getHeapSize();
        ptrs.emplace_back(pt);
        return pt;
    }
    void EMSCRIPTEN_KEEPALIVE freeMemory()
    {
        vec->clear();
        cout << "memory freed" << endl;
    }
}

int main() {}