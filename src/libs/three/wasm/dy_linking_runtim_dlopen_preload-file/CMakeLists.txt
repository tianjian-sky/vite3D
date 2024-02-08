cmake_minimum_required(VERSION 3.01)
project("test_dylib" VERSION 1.0.1 DESCRIPTION "test_dylib 1" HOMEPAGE_URL "github.com" LANGUAGES CXX)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ./dist)
SET(CMAKE_CACHEFILE_DIR ./cache)
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)
include_directories(./lib --std=c++11)

set(LIBA ${CMAKE_CURRENT_SOURCE_DIR}/lib/build/liba.dylib)
link_libraries(${LIBA})

add_executable("main" main.cpp) 
