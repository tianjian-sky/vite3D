#include <ctime>
#include <iostream>
#include <emscripten/emscripten.h>
#include <emscripten/bind.h>

class Mat4
{
public:
    float elements[16];
    Mat4()
    {
        for (int i = 0; i < 16; i++)
        {
            elements[i] = rand();
        }
    }
    Mat4 *multiplyMatrices(Mat4 a, Mat4 b)
    {
        const float *ae = a.elements;
        const float *be = b.elements;
        float *te = this->elements;

        const float a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const float a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const float a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const float a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const float b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const float b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const float b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const float b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        return this;
    }
};

// Binding code
EMSCRIPTEN_BINDINGS(my_class_example)
{
    emscripten::class_<Mat4>("Matrix4_C")
        .constructor<>()
        .function("multiplyMatrices", &Mat4::multiplyMatrices, emscripten::allow_raw_pointers());
    // .property("elements", &Mat4::elements, emscripten::allow_raw_pointers());
}