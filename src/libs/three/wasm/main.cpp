#include <iostream>
#include <stdlib.h>
#include <emscripten/emscripten.h>
#include <emscripten/console.h>
using namespace std;

EM_JS(void, print_args, (float x, float y), {
    console.log('I received: ' + x + ', ' + y);
});

extern "C"
{
    float add(float a, float b)
    {
        return a + b;
    }
    float add_1(float *arr)
    {
        char sBuf[15];
        // gcvt(arr[0], 12, sBuf);
        // emscripten_console_logf(temp);
        cout << "pointer address:" << &arr << endl;
        // cout << sBuf << endl;
        // emscripten_console_log("11111");
        // emscripten_console_logf(sBuf);
        // gcvt(arr[1], 12, sBuf);
        // emscripten_console_logf(sBuf);
        // cout << sBuf << endl;
        cout << arr[0] << endl;
        cout << arr[1] << endl;
        print_args(arr[0], arr[1]);
        return arr[0] + arr[1];
    }
    float add_2(float *arr)
    {
        char sBuf[15];
        gcvt(arr[0], 12, sBuf);
        // emscripten_console_logf(temp);
        cout << "pointer address:" << &arr << endl;
        cout << sBuf << endl;
        // emscripten_console_log("11111");
        // emscripten_console_logf(sBuf);
        gcvt(arr[1], 12, sBuf);
        // emscripten_console_logf(sBuf);
        cout << sBuf << endl;
        print_args(arr[0], arr[1]);
        return arr[1] + arr[0];
    }

    // applyMatrix4( m ) {
    //     const x = this.x, y = this.y, z = this.z;
    //     const e = m.elements;
    //     const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );
    //     this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
    //     this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
    //     this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
    //     return this;
    // }
    float *vec3ApplyMatrix4(float x, float y, float z, float e0, float e1, float e2, float e3, float e4, float e5, float e6, float e7, float e8, float e9, float e10, float e11, float e12, float e13, float e14, float e15)
    {
        float a[3];
        const float w = 1 / (e3 * x + e7 * y + e11 * z + e15);
        a[0] = (e0 * x + e4 * y + e8 * z + e12) * w;
        a[1] = (e1 * x + e5 * y + e9 * z + e13) * w;
        a[2] = (e2 * x + e6 * y + e10 * z + e14) * w;
        return a;
    }

    float *vec3ApplyMatrix4_2(float x, float y, float z, float *arr)
    {
        float a[3];
        const float w = 1 / (arr[3] * x + arr[7] * y + arr[11] * z + arr[15]);
        a[0] = (arr[0] * x + arr[4] * y + arr[8] * z + arr[12]) * w;
        a[1] = (arr[1] * x + arr[5] * y + arr[9] * z + arr[13]) * w;
        a[2] = (arr[2] * x + arr[6] * y + arr[10] * z + arr[14]) * w;
        return a;
    }
}

int main()
{
    float arr[2];
    arr[0] = 3.33;
    arr[1] = 5.55;
    add_2(arr);
}
