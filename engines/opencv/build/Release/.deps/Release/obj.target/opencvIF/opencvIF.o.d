cmd_Release/obj.target/opencvIF/opencvIF.o := g++ '-DNODE_GYP_MODULE_NAME=opencvIF' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' -I/home/jamesdb/.node-gyp/5.5.0/include/node -I/home/jamesdb/.node-gyp/5.5.0/src -I/home/jamesdb/.node-gyp/5.5.0/deps/uv/include -I/home/jamesdb/.node-gyp/5.5.0/deps/v8/include -I../. -I../../mac -I/usr/local/opencv/include -I/usr/local/caffe/include -I/usr/local/caffe/build/src -I/usr/local/cuda/include -I/usr/local/atlas/include  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -ffunction-sections -fdata-sections -fno-omit-frame-pointer -D HASCAFFE=0 -D HASGPU=0 -fno-rtti -fno-exceptions -std=gnu++0x -fexceptions -MMD -MF ./Release/.deps/Release/obj.target/opencvIF/opencvIF.o.d.raw   -c -o Release/obj.target/opencvIF/opencvIF.o ../opencvIF.cpp
Release/obj.target/opencvIF/opencvIF.o: ../opencvIF.cpp \
 /usr/local/caffe/include/caffe/caffe.hpp \
 /usr/local/caffe/include/caffe/blob.hpp \
 /usr/local/caffe/include/caffe/common.hpp \
 /usr/local/caffe/include/caffe/util/device_alternate.hpp \
 /usr/local/cuda/include/cublas_v2.h /usr/local/cuda/include/cublas_api.h \
 /usr/local/cuda/include/driver_types.h \
 /usr/local/cuda/include/host_defines.h \
 /usr/local/cuda/include/cuComplex.h \
 /usr/local/cuda/include/vector_types.h \
 /usr/local/cuda/include/builtin_types.h \
 /usr/local/cuda/include/device_types.h \
 /usr/local/cuda/include/surface_types.h \
 /usr/local/cuda/include/texture_types.h \
 /usr/local/cuda/include/cuda_fp16.h /usr/local/cuda/include/cuda.h \
 /usr/local/cuda/include/cuda_runtime.h \
 /usr/local/cuda/include/host_config.h \
 /usr/local/cuda/include/channel_descriptor.h \
 /usr/local/cuda/include/cuda_runtime_api.h \
 /usr/local/cuda/include/cuda_device_runtime_api.h \
 /usr/local/cuda/include/driver_functions.h \
 /usr/local/cuda/include/vector_functions.h \
 /usr/local/cuda/include/vector_functions.hpp \
 /usr/local/cuda/include/curand.h /usr/local/cuda/include/driver_types.h \
 /usr/local/caffe/build/src/caffe/proto/caffe.pb.h \
 /usr/local/caffe/include/caffe/syncedmem.hpp \
 /usr/local/caffe/include/caffe/filler.hpp \
 /usr/local/caffe/include/caffe/util/math_functions.hpp \
 /usr/local/caffe/include/caffe/util/mkl_alternate.hpp \
 /usr/local/atlas/include/cblas.h \
 /usr/local/caffe/include/caffe/layer.hpp \
 /usr/local/caffe/include/caffe/layer_factory.hpp \
 /usr/local/caffe/include/caffe/net.hpp \
 /usr/local/caffe/include/caffe/parallel.hpp \
 /usr/local/caffe/include/caffe/internal_thread.hpp \
 /usr/local/caffe/include/caffe/solver.hpp \
 /usr/local/caffe/include/caffe/solver_factory.hpp \
 /usr/local/caffe/include/caffe/util/blocking_queue.hpp \
 /usr/local/caffe/include/caffe/util/benchmark.hpp \
 /usr/local/caffe/include/caffe/util/io.hpp \
 /usr/local/caffe/include/caffe/util/format.hpp \
 /usr/local/caffe/include/caffe/util/upgrade_proto.hpp \
 /usr/local/opencv/include/opencv2/objdetect/objdetect.hpp \
 /usr/local/opencv/include/opencv2/objdetect.hpp \
 /usr/local/opencv/include/opencv2/core.hpp \
 /usr/local/opencv/include/opencv2/core/cvdef.h \
 /usr/local/opencv/include/opencv2/hal/defs.h \
 /usr/local/opencv/include/opencv2/core/version.hpp \
 /usr/local/opencv/include/opencv2/core/base.hpp \
 /usr/local/opencv/include/opencv2/core/cvstd.hpp \
 /usr/local/opencv/include/opencv2/core/ptr.inl.hpp \
 /usr/local/opencv/include/opencv2/hal.hpp \
 /usr/local/opencv/include/opencv2/core/sse_utils.hpp \
 /usr/local/opencv/include/opencv2/core/traits.hpp \
 /usr/local/opencv/include/opencv2/core/matx.hpp \
 /usr/local/opencv/include/opencv2/core/types.hpp \
 /usr/local/opencv/include/opencv2/core/mat.hpp \
 /usr/local/opencv/include/opencv2/core/bufferpool.hpp \
 /usr/local/opencv/include/opencv2/core/mat.inl.hpp \
 /usr/local/opencv/include/opencv2/core/persistence.hpp \
 /usr/local/opencv/include/opencv2/core/operations.hpp \
 /usr/local/opencv/include/opencv2/core/cvstd.inl.hpp \
 /usr/local/opencv/include/opencv2/core/utility.hpp \
 /usr/local/opencv/include/opencv2/core/core_c.h \
 /usr/local/opencv/include/opencv2/core/types_c.h \
 /usr/local/opencv/include/opencv2/core/optim.hpp \
 /usr/local/opencv/include/opencv2/objdetect/detection_based_tracker.hpp \
 /usr/local/opencv/include/opencv2/objdetect/objdetect_c.h \
 /usr/local/opencv/include/opencv2/highgui/highgui.hpp \
 /usr/local/opencv/include/opencv2/highgui.hpp \
 /usr/local/opencv/include/opencv2/imgcodecs.hpp \
 /usr/local/opencv/include/opencv2/videoio.hpp \
 /usr/local/opencv/include/opencv2/highgui/highgui_c.h \
 /usr/local/opencv/include/opencv2/imgproc/imgproc_c.h \
 /usr/local/opencv/include/opencv2/imgproc/types_c.h \
 /usr/local/opencv/include/opencv2/imgcodecs/imgcodecs_c.h \
 /usr/local/opencv/include/opencv2/videoio/videoio_c.h \
 /usr/local/opencv/include/opencv2/imgproc/imgproc.hpp \
 /usr/local/opencv/include/opencv2/imgproc.hpp \
 /usr/local/opencv/include/opencv2/opencv.hpp \
 /usr/local/opencv/include/opencv2/photo.hpp \
 /usr/local/opencv/include/opencv2/photo/photo_c.h \
 /usr/local/opencv/include/opencv2/video.hpp \
 /usr/local/opencv/include/opencv2/video/tracking.hpp \
 /usr/local/opencv/include/opencv2/video/background_segm.hpp \
 /usr/local/opencv/include/opencv2/video/tracking_c.h \
 /usr/local/opencv/include/opencv2/features2d.hpp \
 /usr/local/opencv/include/opencv2/flann/miniflann.hpp \
 /usr/local/opencv/include/opencv2/flann/defines.h \
 /usr/local/opencv/include/opencv2/flann/config.h \
 /usr/local/opencv/include/opencv2/calib3d.hpp \
 /usr/local/opencv/include/opencv2/core/affine.hpp \
 /usr/local/opencv/include/opencv2/calib3d/calib3d_c.h \
 /usr/local/opencv/include/opencv2/ml.hpp \
 /home/jamesdb/.node-gyp/5.5.0/include/node/node.h \
 /home/jamesdb/.node-gyp/5.5.0/include/node/v8.h \
 /home/jamesdb/.node-gyp/5.5.0/include/node/v8-version.h \
 /home/jamesdb/.node-gyp/5.5.0/include/node/v8config.h \
 /home/jamesdb/.node-gyp/5.5.0/include/node/node_version.h \
 ../../mac/macIF.h
../opencvIF.cpp:
/usr/local/caffe/include/caffe/caffe.hpp:
/usr/local/caffe/include/caffe/blob.hpp:
/usr/local/caffe/include/caffe/common.hpp:
/usr/local/caffe/include/caffe/util/device_alternate.hpp:
/usr/local/cuda/include/cublas_v2.h:
/usr/local/cuda/include/cublas_api.h:
/usr/local/cuda/include/driver_types.h:
/usr/local/cuda/include/host_defines.h:
/usr/local/cuda/include/cuComplex.h:
/usr/local/cuda/include/vector_types.h:
/usr/local/cuda/include/builtin_types.h:
/usr/local/cuda/include/device_types.h:
/usr/local/cuda/include/surface_types.h:
/usr/local/cuda/include/texture_types.h:
/usr/local/cuda/include/cuda_fp16.h:
/usr/local/cuda/include/cuda.h:
/usr/local/cuda/include/cuda_runtime.h:
/usr/local/cuda/include/host_config.h:
/usr/local/cuda/include/channel_descriptor.h:
/usr/local/cuda/include/cuda_runtime_api.h:
/usr/local/cuda/include/cuda_device_runtime_api.h:
/usr/local/cuda/include/driver_functions.h:
/usr/local/cuda/include/vector_functions.h:
/usr/local/cuda/include/vector_functions.hpp:
/usr/local/cuda/include/curand.h:
/usr/local/cuda/include/driver_types.h:
/usr/local/caffe/build/src/caffe/proto/caffe.pb.h:
/usr/local/caffe/include/caffe/syncedmem.hpp:
/usr/local/caffe/include/caffe/filler.hpp:
/usr/local/caffe/include/caffe/util/math_functions.hpp:
/usr/local/caffe/include/caffe/util/mkl_alternate.hpp:
/usr/local/atlas/include/cblas.h:
/usr/local/caffe/include/caffe/layer.hpp:
/usr/local/caffe/include/caffe/layer_factory.hpp:
/usr/local/caffe/include/caffe/net.hpp:
/usr/local/caffe/include/caffe/parallel.hpp:
/usr/local/caffe/include/caffe/internal_thread.hpp:
/usr/local/caffe/include/caffe/solver.hpp:
/usr/local/caffe/include/caffe/solver_factory.hpp:
/usr/local/caffe/include/caffe/util/blocking_queue.hpp:
/usr/local/caffe/include/caffe/util/benchmark.hpp:
/usr/local/caffe/include/caffe/util/io.hpp:
/usr/local/caffe/include/caffe/util/format.hpp:
/usr/local/caffe/include/caffe/util/upgrade_proto.hpp:
/usr/local/opencv/include/opencv2/objdetect/objdetect.hpp:
/usr/local/opencv/include/opencv2/objdetect.hpp:
/usr/local/opencv/include/opencv2/core.hpp:
/usr/local/opencv/include/opencv2/core/cvdef.h:
/usr/local/opencv/include/opencv2/hal/defs.h:
/usr/local/opencv/include/opencv2/core/version.hpp:
/usr/local/opencv/include/opencv2/core/base.hpp:
/usr/local/opencv/include/opencv2/core/cvstd.hpp:
/usr/local/opencv/include/opencv2/core/ptr.inl.hpp:
/usr/local/opencv/include/opencv2/hal.hpp:
/usr/local/opencv/include/opencv2/core/sse_utils.hpp:
/usr/local/opencv/include/opencv2/core/traits.hpp:
/usr/local/opencv/include/opencv2/core/matx.hpp:
/usr/local/opencv/include/opencv2/core/types.hpp:
/usr/local/opencv/include/opencv2/core/mat.hpp:
/usr/local/opencv/include/opencv2/core/bufferpool.hpp:
/usr/local/opencv/include/opencv2/core/mat.inl.hpp:
/usr/local/opencv/include/opencv2/core/persistence.hpp:
/usr/local/opencv/include/opencv2/core/operations.hpp:
/usr/local/opencv/include/opencv2/core/cvstd.inl.hpp:
/usr/local/opencv/include/opencv2/core/utility.hpp:
/usr/local/opencv/include/opencv2/core/core_c.h:
/usr/local/opencv/include/opencv2/core/types_c.h:
/usr/local/opencv/include/opencv2/core/optim.hpp:
/usr/local/opencv/include/opencv2/objdetect/detection_based_tracker.hpp:
/usr/local/opencv/include/opencv2/objdetect/objdetect_c.h:
/usr/local/opencv/include/opencv2/highgui/highgui.hpp:
/usr/local/opencv/include/opencv2/highgui.hpp:
/usr/local/opencv/include/opencv2/imgcodecs.hpp:
/usr/local/opencv/include/opencv2/videoio.hpp:
/usr/local/opencv/include/opencv2/highgui/highgui_c.h:
/usr/local/opencv/include/opencv2/imgproc/imgproc_c.h:
/usr/local/opencv/include/opencv2/imgproc/types_c.h:
/usr/local/opencv/include/opencv2/imgcodecs/imgcodecs_c.h:
/usr/local/opencv/include/opencv2/videoio/videoio_c.h:
/usr/local/opencv/include/opencv2/imgproc/imgproc.hpp:
/usr/local/opencv/include/opencv2/imgproc.hpp:
/usr/local/opencv/include/opencv2/opencv.hpp:
/usr/local/opencv/include/opencv2/photo.hpp:
/usr/local/opencv/include/opencv2/photo/photo_c.h:
/usr/local/opencv/include/opencv2/video.hpp:
/usr/local/opencv/include/opencv2/video/tracking.hpp:
/usr/local/opencv/include/opencv2/video/background_segm.hpp:
/usr/local/opencv/include/opencv2/video/tracking_c.h:
/usr/local/opencv/include/opencv2/features2d.hpp:
/usr/local/opencv/include/opencv2/flann/miniflann.hpp:
/usr/local/opencv/include/opencv2/flann/defines.h:
/usr/local/opencv/include/opencv2/flann/config.h:
/usr/local/opencv/include/opencv2/calib3d.hpp:
/usr/local/opencv/include/opencv2/core/affine.hpp:
/usr/local/opencv/include/opencv2/calib3d/calib3d_c.h:
/usr/local/opencv/include/opencv2/ml.hpp:
/home/jamesdb/.node-gyp/5.5.0/include/node/node.h:
/home/jamesdb/.node-gyp/5.5.0/include/node/v8.h:
/home/jamesdb/.node-gyp/5.5.0/include/node/v8-version.h:
/home/jamesdb/.node-gyp/5.5.0/include/node/v8config.h:
/home/jamesdb/.node-gyp/5.5.0/include/node/node_version.h:
../../mac/macIF.h:
