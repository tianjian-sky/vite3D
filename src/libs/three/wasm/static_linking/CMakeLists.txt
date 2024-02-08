cmake_minimum_required(VERSION 3.01)
project("static_link" VERSION 1.0.1 DESCRIPTION "static_link" HOMEPAGE_URL "github.com" LANGUAGES CXX)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ./dist)
SET(CMAKE_CACHEFILE_DIR ./cache)
set(CMAKE_CXX_STANDARD 17)
# set(CMAKE_CXX_STANDARD_REQUIRED True)
include_directories(/opt/homebrew/include)
# include_directories(/Users/yutianjian/develop/emscripten-main/system/include --std=c++17)

add_library(A STATIC a.cpp)
add_library(B STATIC b.cpp)
add_executable("main" main.cpp) 

# https://www.coder.work/article/6221866

