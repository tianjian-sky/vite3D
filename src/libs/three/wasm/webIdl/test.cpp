#include "test.h"
#include <iostream>

using namespace std;

int Foo::getVal()
{
    return value;
}
void Foo::setVal(int v)
{
    value = v;
}
Bar::Bar(int v) : value(v) {}
void Bar::doSomething()
{
    cout << "doSomething" << endl;
}
Matrix4::Matrix4()
{
    setElements(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
}
Matrix4::Matrix4(float e1,
                 float e2,
                 float e3,
                 float e4,
                 float e5,
                 float e6,
                 float e7,
                 float e8,
                 float e9,
                 float e10,
                 float e11,
                 float e12,
                 float e13,
                 float e14,
                 float e15,
                 float e16)
{
    setElements(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16);
}
void Matrix4::setElements(float e1,
                          float e2,
                          float e3,
                          float e4,
                          float e5,
                          float e6,
                          float e7,
                          float e8,
                          float e9,
                          float e10,
                          float e11,
                          float e12,
                          float e13,
                          float e14,
                          float e15,
                          float e16)
{
    elements[0] = e1;
    elements[1] = e2;
    elements[2] = e3;
    elements[3] = e4;
    elements[4] = e5;
    elements[5] = e6;
    elements[6] = e7;
    elements[7] = e8;
    elements[8] = e9;
    elements[9] = e10;
    elements[10] = e11;
    elements[11] = e12;
    elements[12] = e13;
    elements[13] = e14;
    elements[14] = e15;
    elements[15] = e16;
}
void Matrix4::multiply(Matrix4 *a, Matrix4 *b)
{
    const float *ae = (a->elements);
    const float *be = (b->elements);
    float *te = elements;

    const float a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    const float a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    const float a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    const float a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
    cout << a11 << ":" << a21 << endl;
    const float b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    const float b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    const float b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    const float b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
    cout << b11 << ":" << b21 << endl;
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
}

float Matrix4::getElement(int index)
{
    return elements[index];
}