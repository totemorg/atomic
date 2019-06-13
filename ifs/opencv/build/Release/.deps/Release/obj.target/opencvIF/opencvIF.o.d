cmd_Release/obj.target/opencvIF/opencvIF.o := g++ '-DNODE_GYP_MODULE_NAME=opencvIF' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' -I/local/nodejs/include/node -I/local/nodejs/src -I/local/nodejs/deps/uv/include -I/local/nodejs/deps/v8/include -I../. -I../../mac -I/local/include/cuda -I/local/caffe/build/src -I/local/caffe/include -I/local/include/atlas -I/local/include -I/local/include/opencv  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -fno-omit-frame-pointer -D HASCAFFE=0 -D HASGPU=0 -fno-exceptions -std=gnu++0x -fexceptions -MMD -MF ./Release/.deps/Release/obj.target/opencvIF/opencvIF.o.d.raw   -c -o Release/obj.target/opencvIF/opencvIF.o ../opencvIF.cpp
Release/obj.target/opencvIF/opencvIF.o: ../opencvIF.cpp \
 /local/include/opencv/opencv2/objdetect/objdetect.hpp \
 /local/include/opencv/opencv2/objdetect.hpp \
 /local/include/opencv/opencv2/core.hpp \
 /local/include/opencv/opencv2/core/cvdef.h \
 /local/include/opencv/opencv2/hal/defs.h \
 /local/include/opencv/opencv2/core/version.hpp \
 /local/include/opencv/opencv2/core/base.hpp \
 /local/include/opencv/opencv2/core/cvstd.hpp \
 /local/include/opencv/opencv2/core/ptr.inl.hpp \
 /local/include/opencv/opencv2/hal.hpp \
 /local/include/opencv/opencv2/core/sse_utils.hpp \
 /local/include/opencv/opencv2/core/traits.hpp \
 /local/include/opencv/opencv2/core/matx.hpp \
 /local/include/opencv/opencv2/core/types.hpp \
 /local/include/opencv/opencv2/core/mat.hpp \
 /local/include/opencv/opencv2/core/bufferpool.hpp \
 /local/include/opencv/opencv2/core/mat.inl.hpp \
 /local/include/opencv/opencv2/core/persistence.hpp \
 /local/include/opencv/opencv2/core/operations.hpp \
 /local/include/opencv/opencv2/core/cvstd.inl.hpp \
 /local/include/opencv/opencv2/core/utility.hpp \
 /local/include/opencv/opencv2/core/core_c.h \
 /local/include/opencv/opencv2/core/types_c.h \
 /local/include/opencv/opencv2/core/optim.hpp \
 /local/include/opencv/opencv2/objdetect/detection_based_tracker.hpp \
 /local/include/opencv/opencv2/objdetect/objdetect_c.h \
 /local/include/opencv/opencv2/highgui/highgui.hpp \
 /local/include/opencv/opencv2/highgui.hpp \
 /local/include/opencv/opencv2/imgcodecs.hpp \
 /local/include/opencv/opencv2/videoio.hpp \
 /local/include/opencv/opencv2/highgui/highgui_c.h \
 /local/include/opencv/opencv2/imgproc/imgproc_c.h \
 /local/include/opencv/opencv2/imgproc/types_c.h \
 /local/include/opencv/opencv2/imgcodecs/imgcodecs_c.h \
 /local/include/opencv/opencv2/videoio/videoio_c.h \
 /local/include/opencv/opencv2/imgproc/imgproc.hpp \
 /local/include/opencv/opencv2/imgproc.hpp \
 /local/include/opencv/opencv2/opencv.hpp \
 /local/include/opencv/opencv2/photo.hpp \
 /local/include/opencv/opencv2/photo/photo_c.h \
 /local/include/opencv/opencv2/video.hpp \
 /local/include/opencv/opencv2/video/tracking.hpp \
 /local/include/opencv/opencv2/video/background_segm.hpp \
 /local/include/opencv/opencv2/video/tracking_c.h \
 /local/include/opencv/opencv2/features2d.hpp \
 /local/include/opencv/opencv2/flann/miniflann.hpp \
 /local/include/opencv/opencv2/flann/defines.h \
 /local/include/opencv/opencv2/flann/config.h \
 /local/include/opencv/opencv2/calib3d.hpp \
 /local/include/opencv/opencv2/core/affine.hpp \
 /local/include/opencv/opencv2/calib3d/calib3d_c.h \
 /local/include/opencv/opencv2/ml.hpp /local/nodejs/include/node/node.h \
 /local/nodejs/include/node/v8.h /local/nodejs/include/node/v8-version.h \
 /local/nodejs/include/node/v8config.h \
 /local/nodejs/include/node/node_version.h ../../mac/macIF.h
../opencvIF.cpp:
/local/include/opencv/opencv2/objdetect/objdetect.hpp:
/local/include/opencv/opencv2/objdetect.hpp:
/local/include/opencv/opencv2/core.hpp:
/local/include/opencv/opencv2/core/cvdef.h:
/local/include/opencv/opencv2/hal/defs.h:
/local/include/opencv/opencv2/core/version.hpp:
/local/include/opencv/opencv2/core/base.hpp:
/local/include/opencv/opencv2/core/cvstd.hpp:
/local/include/opencv/opencv2/core/ptr.inl.hpp:
/local/include/opencv/opencv2/hal.hpp:
/local/include/opencv/opencv2/core/sse_utils.hpp:
/local/include/opencv/opencv2/core/traits.hpp:
/local/include/opencv/opencv2/core/matx.hpp:
/local/include/opencv/opencv2/core/types.hpp:
/local/include/opencv/opencv2/core/mat.hpp:
/local/include/opencv/opencv2/core/bufferpool.hpp:
/local/include/opencv/opencv2/core/mat.inl.hpp:
/local/include/opencv/opencv2/core/persistence.hpp:
/local/include/opencv/opencv2/core/operations.hpp:
/local/include/opencv/opencv2/core/cvstd.inl.hpp:
/local/include/opencv/opencv2/core/utility.hpp:
/local/include/opencv/opencv2/core/core_c.h:
/local/include/opencv/opencv2/core/types_c.h:
/local/include/opencv/opencv2/core/optim.hpp:
/local/include/opencv/opencv2/objdetect/detection_based_tracker.hpp:
/local/include/opencv/opencv2/objdetect/objdetect_c.h:
/local/include/opencv/opencv2/highgui/highgui.hpp:
/local/include/opencv/opencv2/highgui.hpp:
/local/include/opencv/opencv2/imgcodecs.hpp:
/local/include/opencv/opencv2/videoio.hpp:
/local/include/opencv/opencv2/highgui/highgui_c.h:
/local/include/opencv/opencv2/imgproc/imgproc_c.h:
/local/include/opencv/opencv2/imgproc/types_c.h:
/local/include/opencv/opencv2/imgcodecs/imgcodecs_c.h:
/local/include/opencv/opencv2/videoio/videoio_c.h:
/local/include/opencv/opencv2/imgproc/imgproc.hpp:
/local/include/opencv/opencv2/imgproc.hpp:
/local/include/opencv/opencv2/opencv.hpp:
/local/include/opencv/opencv2/photo.hpp:
/local/include/opencv/opencv2/photo/photo_c.h:
/local/include/opencv/opencv2/video.hpp:
/local/include/opencv/opencv2/video/tracking.hpp:
/local/include/opencv/opencv2/video/background_segm.hpp:
/local/include/opencv/opencv2/video/tracking_c.h:
/local/include/opencv/opencv2/features2d.hpp:
/local/include/opencv/opencv2/flann/miniflann.hpp:
/local/include/opencv/opencv2/flann/defines.h:
/local/include/opencv/opencv2/flann/config.h:
/local/include/opencv/opencv2/calib3d.hpp:
/local/include/opencv/opencv2/core/affine.hpp:
/local/include/opencv/opencv2/calib3d/calib3d_c.h:
/local/include/opencv/opencv2/ml.hpp:
/local/nodejs/include/node/node.h:
/local/nodejs/include/node/v8.h:
/local/nodejs/include/node/v8-version.h:
/local/nodejs/include/node/v8config.h:
/local/nodejs/include/node/node_version.h:
../../mac/macIF.h:
