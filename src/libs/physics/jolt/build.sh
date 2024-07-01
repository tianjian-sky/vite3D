#!/bin/sh
export PATH=$PATH:/Users/yutianjian/develop/emscripten-main

if [ -z $1 ] 
then
	BUILD_TYPE=Distribution
else
	BUILD_TYPE=$1
	shift
fi

rm -rf ./dist
if [ $? -ne 0 ]; then
	exit 1
fi

mkdir dist
if [ $? -ne 0 ]; then
	exit 1
fi

cmake -B Build/$BUILD_TYPE -DCMAKE_BUILD_TYPE=$BUILD_TYPE "${@}"
if [ $? -ne 0 ]; then
	exit 1
fi

cmake --build Build/$BUILD_TYPE -j`nproc`
if [ $? -ne 0 ]; then
	exit 1
fi

cat > ./dist/jolt-physics.d.ts << EOF
import Jolt from "./types";

export default Jolt;
export * from "./types";

EOF
if [ $? -ne 0 ]; then
	exit 1
fi

cp ./dist/jolt-physics.d.ts ./dist/jolt-physics.wasm.d.ts
if [ $? -ne 0 ]; then
	exit 1
fi

cp ./dist/jolt-physics.d.ts ./dist/jolt-physics.wasm-compat.d.ts
if [ $? -ne 0 ]; then
	exit 1
fi

cp ./dist/jolt-physics.wasm-compat*.js ./Examples/js/
if [ $? -ne 0 ]; then
	exit 1
fi
