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