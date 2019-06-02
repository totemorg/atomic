cmd_Release/obj.target/engineIF/engineIF.o := g++ '-DNODE_GYP_MODULE_NAME=engineIF' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' '-DBUILDING_NODE_EXTENSION' -I/local/nodejs/include/node -I/local/nodejs/src -I/local/nodejs/deps/uv/include -I/local/nodejs/deps/v8/include -I../mac -I../.  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -fno-omit-frame-pointer -fno-rtti -fno-exceptions -std=gnu++0x -MMD -MF ./Release/.deps/Release/obj.target/engineIF/engineIF.o.d.raw   -c -o Release/obj.target/engineIF/engineIF.o ../engineIF.cpp
Release/obj.target/engineIF/engineIF.o: ../engineIF.cpp \
 /local/nodejs/include/node/node.h /local/nodejs/include/node/v8.h \
 /local/nodejs/include/node/v8-version.h \
 /local/nodejs/include/node/v8config.h \
 /local/nodejs/include/node/node_version.h ../mac/macIF.h
../engineIF.cpp:
/local/nodejs/include/node/node.h:
/local/nodejs/include/node/v8.h:
/local/nodejs/include/node/v8-version.h:
/local/nodejs/include/node/v8config.h:
/local/nodejs/include/node/node_version.h:
../mac/macIF.h:
