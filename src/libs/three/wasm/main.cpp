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

    // applyMatrix4( m ) {
    //     const x = this.x, y = this.y, z = this.z;
    //     const e = m.elements;
    //     const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );
    //     this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
    //     this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
    //     this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;
    //     return this;
    // }

    float *vec3ApplyMatrix4(float *vec, float *arr)
    {
        for (int i = 0; i < 3; i++)
            cout << "vec_" << i << ":" << vec[i] << endl;
        float a[3];
        const float w = 1 / (arr[3] * vec[0] + arr[7] * vec[1] + arr[11] * vec[2] + arr[15]);
        a[0] = (arr[0] * vec[0] + arr[4] * vec[1] + arr[8] * vec[2] + arr[12]) * w;
        a[1] = (arr[1] * vec[0] + arr[5] * vec[1] + arr[9] * vec[2] + arr[13]) * w;
        a[2] = (arr[2] * vec[0] + arr[6] * vec[1] + arr[10] * vec[2] + arr[14]) * w;
        return a;
    }
}
