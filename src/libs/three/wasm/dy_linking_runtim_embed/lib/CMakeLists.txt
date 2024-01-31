cmake_minimum_required(VERSION 3.01)
project("test_dylib" VERSION 1.0.1 DESCRIPTION "test_dylib 1" HOMEPAGE_URL "github.com" LANGUAGES CXX)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ./build)
SET(CMAKE_CACHEFILE_DIR ./cache)
# set(CMAKE_BUILD_DIRECTORY ./build)
# set(CMAKE_BUILD_FILES_DIRECTORY ./build_file)
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)
include_directories(/opt/homebrew/include --std=c++11)
# 动态库
add_library(a SHARED a.cpp) # 生成的库文件会自动增加lib前缀

# 静态链接
# add_library(A STATIC a.cpp)
# add_library(B STATIC b.cpp)

