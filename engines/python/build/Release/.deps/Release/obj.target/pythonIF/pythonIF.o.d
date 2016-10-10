cmd_Release/obj.target/pythonIF/pythonIF.o := g++ '-DNODE_GYP_MODULE_NAME=pythonIF' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' -I/usr/local/nodejs/include/node -I/usr/local/nodejs/src -I/usr/local/nodejs/deps/uv/include -I/usr/local/nodejs/deps/v8/include -I../. -I../../mac -I/usr/local/include/python  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -ffunction-sections -fdata-sections -fno-omit-frame-pointer -fno-rtti -fno-exceptions -std=gnu++0x -MMD -MF ./Release/.deps/Release/obj.target/pythonIF/pythonIF.o.d.raw   -c -o Release/obj.target/pythonIF/pythonIF.o ../pythonIF.cpp
Release/obj.target/pythonIF/pythonIF.o: ../pythonIF.cpp \
 /usr/local/include/python/Python.h \
 /usr/local/include/python/patchlevel.h \
 /usr/local/include/python/pyconfig.h \
 /usr/local/include/python/pymacconfig.h \
 /usr/local/include/python/pyport.h /usr/local/include/python/pymath.h \
 /usr/local/include/python/pymem.h /usr/local/include/python/object.h \
 /usr/local/include/python/objimpl.h /usr/local/include/python/pydebug.h \
 /usr/local/include/python/unicodeobject.h \
 /usr/local/include/python/intobject.h \
 /usr/local/include/python/boolobject.h \
 /usr/local/include/python/longobject.h \
 /usr/local/include/python/floatobject.h \
 /usr/local/include/python/complexobject.h \
 /usr/local/include/python/rangeobject.h \
 /usr/local/include/python/stringobject.h \
 /usr/local/include/python/memoryobject.h \
 /usr/local/include/python/bufferobject.h \
 /usr/local/include/python/bytesobject.h \
 /usr/local/include/python/bytearrayobject.h \
 /usr/local/include/python/tupleobject.h \
 /usr/local/include/python/listobject.h \
 /usr/local/include/python/dictobject.h \
 /usr/local/include/python/enumobject.h \
 /usr/local/include/python/setobject.h \
 /usr/local/include/python/methodobject.h \
 /usr/local/include/python/moduleobject.h \
 /usr/local/include/python/funcobject.h \
 /usr/local/include/python/classobject.h \
 /usr/local/include/python/fileobject.h \
 /usr/local/include/python/cobject.h \
 /usr/local/include/python/pycapsule.h \
 /usr/local/include/python/traceback.h \
 /usr/local/include/python/sliceobject.h \
 /usr/local/include/python/cellobject.h \
 /usr/local/include/python/iterobject.h \
 /usr/local/include/python/genobject.h \
 /usr/local/include/python/descrobject.h \
 /usr/local/include/python/warnings.h \
 /usr/local/include/python/weakrefobject.h \
 /usr/local/include/python/codecs.h /usr/local/include/python/pyerrors.h \
 /usr/local/include/python/pystate.h /usr/local/include/python/pyarena.h \
 /usr/local/include/python/modsupport.h \
 /usr/local/include/python/pythonrun.h /usr/local/include/python/ceval.h \
 /usr/local/include/python/sysmodule.h \
 /usr/local/include/python/intrcheck.h /usr/local/include/python/import.h \
 /usr/local/include/python/abstract.h /usr/local/include/python/compile.h \
 /usr/local/include/python/code.h /usr/local/include/python/eval.h \
 /usr/local/include/python/pyctype.h /usr/local/include/python/pystrtod.h \
 /usr/local/include/python/pystrcmp.h /usr/local/include/python/dtoa.h \
 /usr/local/include/python/pyfpe.h /usr/local/nodejs/include/node/v8.h \
 /usr/local/nodejs/include/node/v8-version.h \
 /usr/local/nodejs/include/node/v8config.h ../../mac/macIF.h
../pythonIF.cpp:
/usr/local/include/python/Python.h:
/usr/local/include/python/patchlevel.h:
/usr/local/include/python/pyconfig.h:
/usr/local/include/python/pymacconfig.h:
/usr/local/include/python/pyport.h:
/usr/local/include/python/pymath.h:
/usr/local/include/python/pymem.h:
/usr/local/include/python/object.h:
/usr/local/include/python/objimpl.h:
/usr/local/include/python/pydebug.h:
/usr/local/include/python/unicodeobject.h:
/usr/local/include/python/intobject.h:
/usr/local/include/python/boolobject.h:
/usr/local/include/python/longobject.h:
/usr/local/include/python/floatobject.h:
/usr/local/include/python/complexobject.h:
/usr/local/include/python/rangeobject.h:
/usr/local/include/python/stringobject.h:
/usr/local/include/python/memoryobject.h:
/usr/local/include/python/bufferobject.h:
/usr/local/include/python/bytesobject.h:
/usr/local/include/python/bytearrayobject.h:
/usr/local/include/python/tupleobject.h:
/usr/local/include/python/listobject.h:
/usr/local/include/python/dictobject.h:
/usr/local/include/python/enumobject.h:
/usr/local/include/python/setobject.h:
/usr/local/include/python/methodobject.h:
/usr/local/include/python/moduleobject.h:
/usr/local/include/python/funcobject.h:
/usr/local/include/python/classobject.h:
/usr/local/include/python/fileobject.h:
/usr/local/include/python/cobject.h:
/usr/local/include/python/pycapsule.h:
/usr/local/include/python/traceback.h:
/usr/local/include/python/sliceobject.h:
/usr/local/include/python/cellobject.h:
/usr/local/include/python/iterobject.h:
/usr/local/include/python/genobject.h:
/usr/local/include/python/descrobject.h:
/usr/local/include/python/warnings.h:
/usr/local/include/python/weakrefobject.h:
/usr/local/include/python/codecs.h:
/usr/local/include/python/pyerrors.h:
/usr/local/include/python/pystate.h:
/usr/local/include/python/pyarena.h:
/usr/local/include/python/modsupport.h:
/usr/local/include/python/pythonrun.h:
/usr/local/include/python/ceval.h:
/usr/local/include/python/sysmodule.h:
/usr/local/include/python/intrcheck.h:
/usr/local/include/python/import.h:
/usr/local/include/python/abstract.h:
/usr/local/include/python/compile.h:
/usr/local/include/python/code.h:
/usr/local/include/python/eval.h:
/usr/local/include/python/pyctype.h:
/usr/local/include/python/pystrtod.h:
/usr/local/include/python/pystrcmp.h:
/usr/local/include/python/dtoa.h:
/usr/local/include/python/pyfpe.h:
/usr/local/nodejs/include/node/v8.h:
/usr/local/nodejs/include/node/v8-version.h:
/usr/local/nodejs/include/node/v8config.h:
../../mac/macIF.h:
