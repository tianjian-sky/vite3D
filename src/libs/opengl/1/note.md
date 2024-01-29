## gcc 的 -framework

在OSX的开发环境中，存在框架的概念。 框架是一种包，其中包含标头，共享库和其他有用的东西。 可以将框架传递给编译器，以便编译器在搜索路径上包括其标头，并使用其共享库将程序链接到它们。

因此，例如，如果将-framework FrameworkName传递给OSX上的gcc或clang，则编译器将查找/System/Library/Frameworks目录以找到FrameworkName.framework目录。 如果找到它，则编译器将包括其头并将程序链接到其共享库。

``` shell
g++ ./main.cpp -framework OpenGL -I/opt/homebrew/include -L/opt/homebrew/lib -lglfw.3 -lglew  --std=c++11

```

## pkg-config
https://blog.csdn.net/mrwangwang/article/details/93896554