#  -shared -shared 参数时，目的是使源码编译成动态库 .so 文件；
# -fPIC -fPIC的作用是 告知编译器 生成位置无关代码（编译产生的代码没有绝对位置，只有相对位置）；从而可以在任意地方调用生成的动态库。
g++  -shared -fPIC ./a.cpp  -oliba.so