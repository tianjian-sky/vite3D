#ifndef GOOD_H_
#define GOOD_H_
class Foo
{
public:
    int value;
    int getVal();
    void setVal(int v);
};

class Bar
{
public:
    int value;
    Bar(int val);
    void doSomething();
};
class Matrix4
{
public:
    float elements[16];
    Matrix4();
    Matrix4(
        float e1,
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
        float e16);
    void setElements(
        float e1,
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
        float e16);
    void multiply(Matrix4 *a, Matrix4 *b);
    float getElement(int index);
};

#endif