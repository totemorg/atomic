cmd_Release/obj.target/opencvIF/opencvIF.o := g++ '-DNODE_GYP_MODULE_NAME=opencvIF' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' -I/home/jamesbd/.node-gyp/5.5.0/include/node -I/home/jamesbd/.node-gyp/5.5.0/src -I/home/jamesbd/.node-gyp/5.5.0/deps/uv/include -I/home/jamesbd/.node-gyp/5.5.0/deps/v8/include -I../. -I../../mac -I/local/include/cuda -I/local/caffe/build/src -I/local/caffe/include -I/local/include/atlas -I/local/include -I/local/include/opencv  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -ffunction-sections -fdata-sections -fno-omit-frame-pointer -D HASCAFFE=0 -D HASGPU=0 -fno-rtti -fno-exceptions -std=gnu++0x -fexceptions -MMD -MF ./Release/.deps/Release/obj.target/opencvIF/opencvIF.o.d.raw   -c -o Release/obj.target/opencvIF/opencvIF.o ../opencvIF.cpp
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
 /local/include/opencv/opencv2/ml.hpp \
 /home/jamesbd/.node-gyp/5.5.0/include/node/node.h \
 /home/jamesbd/.node-gyp/5.5.0/include/node/v8.h \
 /home/jamesbd/.node-gyp/5.5.0/include/node/v8-version.h \
 /home/jamesbd/.node-gyp/5.5.0/include/node/v8config.h \
 /home/jamesbd/.node-gyp/5.5.0/include/node/node_version.h \
 ../../mac/macIF.h /local/caffe/include/caffe/caffe.hpp \
 /local/caffe/include/caffe/blob.hpp \
 /local/caffe/include/caffe/common.hpp /local/include/glog/logging.h \
 /local/include/glog/log_severity.h /local/include/glog/vlog_is_on.h \
 /local/caffe/include/caffe/util/device_alternate.hpp \
 /local/include/cuda/cublas_v2.h /local/include/cuda/cublas_api.h \
 /local/include/cuda/driver_types.h /local/include/cuda/host_defines.h \
 /local/include/cuda/cuComplex.h /local/include/cuda/vector_types.h \
 /local/include/cuda/builtin_types.h /local/include/cuda/device_types.h \
 /local/include/cuda/surface_types.h /local/include/cuda/texture_types.h \
 /local/include/cuda/cuda_fp16.h /local/include/cuda/library_types.h \
 /local/include/cuda/cuda.h /local/include/cuda/cuda_runtime.h \
 /local/include/cuda/host_config.h \
 /local/include/cuda/channel_descriptor.h \
 /local/include/cuda/cuda_runtime_api.h \
 /local/include/cuda/cuda_device_runtime_api.h \
 /local/include/cuda/driver_functions.h \
 /local/include/cuda/vector_functions.h \
 /local/include/cuda/vector_functions.hpp /local/include/cuda/curand.h \
 /local/include/cuda/driver_types.h \
 /local/caffe/build/src/caffe/proto/caffe.pb.h \
 /local/caffe/include/caffe/syncedmem.hpp \
 /local/caffe/include/caffe/filler.hpp \
 /local/caffe/include/caffe/util/math_functions.hpp \
 /local/caffe/include/caffe/util/mkl_alternate.hpp \
 /local/include/atlas/cblas.h /local/caffe/include/caffe/layer.hpp \
 /local/caffe/include/caffe/layer_factory.hpp \
 /local/caffe/include/caffe/net.hpp \
 /local/caffe/include/caffe/parallel.hpp \
 /local/caffe/include/caffe/internal_thread.hpp \
 /local/caffe/include/caffe/solver.hpp \
 /local/caffe/include/caffe/solver_factory.hpp \
 /local/caffe/include/caffe/util/blocking_queue.hpp \
 /local/caffe/include/caffe/util/benchmark.hpp \
 /local/caffe/include/caffe/util/io.hpp \
 /local/caffe/include/caffe/util/format.hpp \
 /local/caffe/include/caffe/util/upgrade_proto.hpp
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
/home/jamesbd/.node-gyp/5.5.0/include/node/node.h:
/home/jamesbd/.node-gyp/5.5.0/include/node/v8.h:
/home/jamesbd/.node-gyp/5.5.0/include/node/v8-version.h:
/home/jamesbd/.node-gyp/5.5.0/include/node/v8config.h:
/home/jamesbd/.node-gyp/5.5.0/include/node/node_version.h:
../../mac/macIF.h:
/local/caffe/include/caffe/caffe.hpp:
/local/caffe/include/caffe/blob.hpp:
/local/caffe/include/caffe/common.hpp:
/local/include/glog/logging.h:
/local/include/glog/log_severity.h:
/local/include/glog/vlog_is_on.h:
/local/caffe/include/caffe/util/device_alternate.hpp:
/local/include/cuda/cublas_v2.h:
/local/include/cuda/cublas_api.h:
/local/include/cuda/driver_types.h:
/local/include/cuda/host_defines.h:
/local/include/cuda/cuComplex.h:
/local/include/cuda/vector_types.h:
/local/include/cuda/builtin_types.h:
/local/include/cuda/device_types.h:
/local/include/cuda/surface_types.h:
/local/include/cuda/texture_types.h:
/local/include/cuda/cuda_fp16.h:
/local/include/cuda/library_types.h:
/local/include/cuda/cuda.h:
/local/include/cuda/cuda_runtime.h:
/local/include/cuda/host_config.h:
/local/include/cuda/channel_descriptor.h:
/local/include/cuda/cuda_runtime_api.h:
/local/include/cuda/cuda_device_runtime_api.h:
/local/include/cuda/driver_functions.h:
/local/include/cuda/vector_functions.h:
/local/include/cuda/vector_functions.hpp:
/local/include/cuda/curand.h:
/local/include/cuda/driver_types.h:
/local/caffe/build/src/caffe/proto/caffe.pb.h:
/local/caffe/include/caffe/syncedmem.hpp:
/local/caffe/include/caffe/filler.hpp:
/local/caffe/include/caffe/util/math_functions.hpp:
/local/caffe/include/caffe/util/mkl_alternate.hpp:
/local/include/atlas/cblas.h:
/local/caffe/include/caffe/layer.hpp:
/local/caffe/include/caffe/layer_factory.hpp:
/local/caffe/include/caffe/net.hpp:
/local/caffe/include/caffe/parallel.hpp:
/local/caffe/include/caffe/internal_thread.hpp:
/local/caffe/include/caffe/solver.hpp:
/local/caffe/include/caffe/solver_factory.hpp:
/local/caffe/include/caffe/util/blocking_queue.hpp:
/local/caffe/include/caffe/util/benchmark.hpp:
/local/caffe/include/caffe/util/io.hpp:
/local/caffe/include/caffe/util/format.hpp:
/local/caffe/include/caffe/util/upgrade_proto.hpp:
