cmd_Release/obj.target/pythonIF/pythonIF.o := g++ -o Release/obj.target/pythonIF/pythonIF.o ../pythonIF.cpp '-DNODE_GYP_MODULE_NAME=pythonIF' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-DV8_DEPRECATION_WARNINGS' '-DV8_IMMINENT_DEPRECATION_WARNINGS' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' '-D__STDC_FORMAT_MACROS' '-DOPENSSL_NO_PINSHARED' '-DOPENSSL_THREADS' '-DNAPI_DISABLE_CPP_EXCEPTIONS' '-DBUILDING_NODE_EXTENSION' -I/local/nodejs/include/node -I/local/nodejs/src -I/local/nodejs/deps/openssl/config -I/local/nodejs/deps/openssl/openssl/include -I/local/nodejs/deps/uv/include -I/local/nodejs/deps/zlib -I/local/nodejs/deps/v8/include -I../. -I../../mac -I/local/atomconda/include/python2.7 -I/local/service/atomic/ifs/python/node_modules/node-addon-api  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -fno-omit-frame-pointer -fno-rtti -std=gnu++1y -MMD -MF ./Release/.deps/Release/obj.target/pythonIF/pythonIF.o.d.raw   -c
Release/obj.target/pythonIF/pythonIF.o: ../pythonIF.cpp ../../mac/macIF.h \
 /local/service/atomic/ifs/python/node_modules/node-addon-api/napi.h \
 /local/nodejs/include/node/node_api.h \
 /local/nodejs/include/node/js_native_api.h \
 /local/nodejs/include/node/js_native_api_types.h \
 /local/nodejs/include/node/node_api_types.h \
 /local/service/atomic/ifs/python/node_modules/node-addon-api/napi-inl.h \
 /local/service/atomic/ifs/python/node_modules/node-addon-api/napi-inl.deprecated.h \
 /local/atomconda/include/python2.7/Python.h \
 /local/atomconda/include/python2.7/patchlevel.h \
 /local/atomconda/include/python2.7/pyconfig.h \
 /local/atomconda/include/python2.7/pymacconfig.h \
 /local/atomconda/include/python2.7/pyport.h \
 /local/atomconda/include/python2.7/pymath.h \
 /local/atomconda/include/python2.7/pymem.h \
 /local/atomconda/include/python2.7/object.h \
 /local/atomconda/include/python2.7/objimpl.h \
 /local/atomconda/include/python2.7/pydebug.h \
 /local/atomconda/include/python2.7/unicodeobject.h \
 /local/atomconda/include/python2.7/intobject.h \
 /local/atomconda/include/python2.7/boolobject.h \
 /local/atomconda/include/python2.7/longobject.h \
 /local/atomconda/include/python2.7/floatobject.h \
 /local/atomconda/include/python2.7/complexobject.h \
 /local/atomconda/include/python2.7/rangeobject.h \
 /local/atomconda/include/python2.7/stringobject.h \
 /local/atomconda/include/python2.7/memoryobject.h \
 /local/atomconda/include/python2.7/bufferobject.h \
 /local/atomconda/include/python2.7/bytesobject.h \
 /local/atomconda/include/python2.7/bytearrayobject.h \
 /local/atomconda/include/python2.7/tupleobject.h \
 /local/atomconda/include/python2.7/listobject.h \
 /local/atomconda/include/python2.7/dictobject.h \
 /local/atomconda/include/python2.7/enumobject.h \
 /local/atomconda/include/python2.7/setobject.h \
 /local/atomconda/include/python2.7/methodobject.h \
 /local/atomconda/include/python2.7/moduleobject.h \
 /local/atomconda/include/python2.7/funcobject.h \
 /local/atomconda/include/python2.7/classobject.h \
 /local/atomconda/include/python2.7/fileobject.h \
 /local/atomconda/include/python2.7/cobject.h \
 /local/atomconda/include/python2.7/pycapsule.h \
 /local/atomconda/include/python2.7/traceback.h \
 /local/atomconda/include/python2.7/sliceobject.h \
 /local/atomconda/include/python2.7/cellobject.h \
 /local/atomconda/include/python2.7/iterobject.h \
 /local/atomconda/include/python2.7/genobject.h \
 /local/atomconda/include/python2.7/descrobject.h \
 /local/atomconda/include/python2.7/warnings.h \
 /local/atomconda/include/python2.7/weakrefobject.h \
 /local/atomconda/include/python2.7/codecs.h \
 /local/atomconda/include/python2.7/pyerrors.h \
 /local/atomconda/include/python2.7/pystate.h \
 /local/atomconda/include/python2.7/pyarena.h \
 /local/atomconda/include/python2.7/modsupport.h \
 /local/atomconda/include/python2.7/pythonrun.h \
 /local/atomconda/include/python2.7/ceval.h \
 /local/atomconda/include/python2.7/sysmodule.h \
 /local/atomconda/include/python2.7/intrcheck.h \
 /local/atomconda/include/python2.7/import.h \
 /local/atomconda/include/python2.7/abstract.h \
 /local/atomconda/include/python2.7/compile.h \
 /local/atomconda/include/python2.7/code.h \
 /local/atomconda/include/python2.7/eval.h \
 /local/atomconda/include/python2.7/pyctype.h \
 /local/atomconda/include/python2.7/pystrtod.h \
 /local/atomconda/include/python2.7/pystrcmp.h \
 /local/atomconda/include/python2.7/dtoa.h \
 /local/atomconda/include/python2.7/pyfpe.h
../pythonIF.cpp:
../../mac/macIF.h:
/local/service/atomic/ifs/python/node_modules/node-addon-api/napi.h:
/local/nodejs/include/node/node_api.h:
/local/nodejs/include/node/js_native_api.h:
/local/nodejs/include/node/js_native_api_types.h:
/local/nodejs/include/node/node_api_types.h:
/local/service/atomic/ifs/python/node_modules/node-addon-api/napi-inl.h:
/local/service/atomic/ifs/python/node_modules/node-addon-api/napi-inl.deprecated.h:
/local/atomconda/include/python2.7/Python.h:
/local/atomconda/include/python2.7/patchlevel.h:
/local/atomconda/include/python2.7/pyconfig.h:
/local/atomconda/include/python2.7/pymacconfig.h:
/local/atomconda/include/python2.7/pyport.h:
/local/atomconda/include/python2.7/pymath.h:
/local/atomconda/include/python2.7/pymem.h:
/local/atomconda/include/python2.7/object.h:
/local/atomconda/include/python2.7/objimpl.h:
/local/atomconda/include/python2.7/pydebug.h:
/local/atomconda/include/python2.7/unicodeobject.h:
/local/atomconda/include/python2.7/intobject.h:
/local/atomconda/include/python2.7/boolobject.h:
/local/atomconda/include/python2.7/longobject.h:
/local/atomconda/include/python2.7/floatobject.h:
/local/atomconda/include/python2.7/complexobject.h:
/local/atomconda/include/python2.7/rangeobject.h:
/local/atomconda/include/python2.7/stringobject.h:
/local/atomconda/include/python2.7/memoryobject.h:
/local/atomconda/include/python2.7/bufferobject.h:
/local/atomconda/include/python2.7/bytesobject.h:
/local/atomconda/include/python2.7/bytearrayobject.h:
/local/atomconda/include/python2.7/tupleobject.h:
/local/atomconda/include/python2.7/listobject.h:
/local/atomconda/include/python2.7/dictobject.h:
/local/atomconda/include/python2.7/enumobject.h:
/local/atomconda/include/python2.7/setobject.h:
/local/atomconda/include/python2.7/methodobject.h:
/local/atomconda/include/python2.7/moduleobject.h:
/local/atomconda/include/python2.7/funcobject.h:
/local/atomconda/include/python2.7/classobject.h:
/local/atomconda/include/python2.7/fileobject.h:
/local/atomconda/include/python2.7/cobject.h:
/local/atomconda/include/python2.7/pycapsule.h:
/local/atomconda/include/python2.7/traceback.h:
/local/atomconda/include/python2.7/sliceobject.h:
/local/atomconda/include/python2.7/cellobject.h:
/local/atomconda/include/python2.7/iterobject.h:
/local/atomconda/include/python2.7/genobject.h:
/local/atomconda/include/python2.7/descrobject.h:
/local/atomconda/include/python2.7/warnings.h:
/local/atomconda/include/python2.7/weakrefobject.h:
/local/atomconda/include/python2.7/codecs.h:
/local/atomconda/include/python2.7/pyerrors.h:
/local/atomconda/include/python2.7/pystate.h:
/local/atomconda/include/python2.7/pyarena.h:
/local/atomconda/include/python2.7/modsupport.h:
/local/atomconda/include/python2.7/pythonrun.h:
/local/atomconda/include/python2.7/ceval.h:
/local/atomconda/include/python2.7/sysmodule.h:
/local/atomconda/include/python2.7/intrcheck.h:
/local/atomconda/include/python2.7/import.h:
/local/atomconda/include/python2.7/abstract.h:
/local/atomconda/include/python2.7/compile.h:
/local/atomconda/include/python2.7/code.h:
/local/atomconda/include/python2.7/eval.h:
/local/atomconda/include/python2.7/pyctype.h:
/local/atomconda/include/python2.7/pystrtod.h:
/local/atomconda/include/python2.7/pystrcmp.h:
/local/atomconda/include/python2.7/dtoa.h:
/local/atomconda/include/python2.7/pyfpe.h:
