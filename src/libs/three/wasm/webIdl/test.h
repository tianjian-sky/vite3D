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

#endif