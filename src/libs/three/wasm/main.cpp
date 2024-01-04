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
        float a[3];
        const float w = 1 / (arr[3] * vec[0] + arr[7] * vec[1] + arr[11] * vec[2] + arr[15]);
        a[0] = (arr[0] * vec[0] + arr[4] * vec[1] + arr[8] * vec[2] + arr[12]) * w;
        a[1] = (arr[1] * vec[0] + arr[5] * vec[1] + arr[9] * vec[2] + arr[13]) * w;
        a[2] = (arr[2] * vec[0] + arr[6] * vec[1] + arr[10] * vec[2] + arr[14]) * w;
        return a;
    }

    float *mat4MultiplyMat4(float *a, float *b)
    {
        float res[16];
        const float a11 = a[0];
        const float a12 = a[4];
        const float a13 = a[8];
        const float a14 = a[12];
        const float a21 = a[1];
        const float a22 = a[5];
        const float a23 = a[9];
        const float a24 = a[13];
        const float a31 = a[2];
        const float a32 = a[6];
        const float a33 = a[10];
        const float a34 = a[14];
        const float a41 = a[3];
        const float a42 = a[7];
        const float a43 = a[11];
        const float a44 = a[15];
        const float b11 = b[0];
        const float b12 = b[4];
        const float b13 = b[8];
        const float b14 = b[12];
        const float b21 = b[1];
        const float b22 = b[5];
        const float b23 = b[9];
        const float b24 = b[13];
        const float b31 = b[2];
        const float b32 = b[6];
        const float b33 = b[10];
        const float b34 = b[14];
        const float b41 = b[3];
        const float b42 = b[7];
        const float b43 = b[11];
        const float b44 = b[15];
        res[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        res[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        res[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        res[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        res[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        res[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        res[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        res[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        res[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        res[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        res[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        res[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        res[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        res[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        res[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        res[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return res;
    }

    float *mat4PreMultiplyMat4(float *a, float *b)
    {
        float *res = mat4MultiplyMat4(b, a);
        return res;
    }
}
