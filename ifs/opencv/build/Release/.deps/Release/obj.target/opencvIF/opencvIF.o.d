cmd_Release/obj.target/opencvIF/opencvIF.o := g++ '-DNODE_GYP_MODULE_NAME=opencvIF' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-DV8_DEPRECATION_WARNINGS' '-DV8_IMMINENT_DEPRECATION_WARNINGS' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' '-DOPENSSL_NO_PINSHARED' '-DOPENSSL_THREADS' '-DNAPI_DISABLE_CPP_EXCEPTIONS' '-DBUILDING_NODE_EXTENSION' -I/home/admin/.cache/node-gyp/12.14.0/include/node -I/home/admin/.cache/node-gyp/12.14.0/src -I/home/admin/.cache/node-gyp/12.14.0/deps/openssl/config -I/home/admin/.cache/node-gyp/12.14.0/deps/openssl/openssl/include -I/home/admin/.cache/node-gyp/12.14.0/deps/uv/include -I/home/admin/.cache/node-gyp/12.14.0/deps/zlib -I/home/admin/.cache/node-gyp/12.14.0/deps/v8/include -I../. -I../../mac -I/local/include/opencv -I/local/include/cuda -I/local/caffe/build/src -I/local/caffe/include -I/local/include/atlas -I/local/service/atomic/ifs/opencv/node_modules/node-addon-api  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -fno-omit-frame-pointer -D HASCAFFE=0 -D HASGPU=0 -std=gnu++1y -MMD -MF ./Release/.deps/Release/obj.target/opencvIF/opencvIF.o.d.raw   -c -o Release/obj.target/opencvIF/opencvIF.o ../opencvIF.cpp
Release/obj.target/opencvIF/opencvIF.o: ../opencvIF.cpp \
 /local/include/opencv/opencv2/objdetect/objdetect.hpp \
 /local/include/opencv/opencv2/objdetect.hpp \
 /local/include/opencv/opencv2/core.hpp \
 /local/include/opencv/opencv2/core/cvdef.h \
 /local/include/opencv/opencv2/core/hal/interface.h \
 /local/include/opencv/opencv2/core/cv_cpu_dispatch.h \
 /local/include/opencv/opencv2/core/version.hpp \
 /local/include/opencv/opencv2/core/base.hpp \
 /local/include/opencv/opencv2/opencv_modules.hpp \
 /local/include/opencv/opencv2/core/cvstd.hpp \
 /local/include/opencv/opencv2/core/cvstd_wrapper.hpp \
 /local/include/opencv/opencv2/core/neon_utils.hpp \
 /local/include/opencv/opencv2/core/vsx_utils.hpp \
 /local/include/opencv/opencv2/core/check.hpp \
 /local/include/opencv/opencv2/core/traits.hpp \
 /local/include/opencv/opencv2/core/matx.hpp \
 /local/include/opencv/opencv2/core/saturate.hpp \
 /local/include/opencv/opencv2/core/fast_math.hpp \
 /local/include/opencv/opencv2/core/types.hpp \
 /local/include/opencv/opencv2/core/mat.hpp \
 /local/include/opencv/opencv2/core/bufferpool.hpp \
 /local/include/opencv/opencv2/core/mat.inl.hpp \
 /local/include/opencv/opencv2/core/persistence.hpp \
 /local/include/opencv/opencv2/core/operations.hpp \
 /local/include/opencv/opencv2/core/cvstd.inl.hpp \
 /local/include/opencv/opencv2/core/utility.hpp \
 /local/include/opencv/opencv2/core/optim.hpp \
 /local/include/opencv/opencv2/core/ovx.hpp \
 /local/include/opencv/opencv2/core/cvdef.h \
 /local/include/opencv/opencv2/objdetect/detection_based_tracker.hpp \
 /local/include/opencv/opencv2/highgui/highgui.hpp \
 /local/include/opencv/opencv2/highgui.hpp \
 /local/include/opencv/opencv2/imgcodecs.hpp \
 /local/include/opencv/opencv2/videoio.hpp \
 /local/include/opencv/opencv2/imgproc/imgproc.hpp \
 /local/include/opencv/opencv2/imgproc.hpp \
 /local/include/opencv/opencv2/opencv.hpp \
 /local/include/opencv/opencv2/calib3d.hpp \
 /local/include/opencv/opencv2/features2d.hpp \
 /local/include/opencv/opencv2/flann/miniflann.hpp \
 /local/include/opencv/opencv2/flann/defines.h \
 /local/include/opencv/opencv2/flann/config.h \
 /local/include/opencv/opencv2/core/affine.hpp \
 /local/include/opencv/opencv2/dnn.hpp \
 /local/include/opencv/opencv2/dnn/dnn.hpp \
 /local/include/opencv/opencv2/core/async.hpp \
 /local/include/opencv/opencv2/dnn/../dnn/version.hpp \
 /local/include/opencv/opencv2/dnn/dict.hpp \
 /local/include/opencv/opencv2/dnn/layer.hpp \
 /local/include/opencv/opencv2/dnn/dnn.inl.hpp \
 /local/include/opencv/opencv2/dnn/utils/inference_engine.hpp \
 /local/include/opencv/opencv2/dnn/utils/../dnn.hpp \
 /local/include/opencv/opencv2/flann.hpp \
 /local/include/opencv/opencv2/flann/flann_base.hpp \
 /local/include/opencv/opencv2/flann/general.h \
 /local/include/opencv/opencv2/flann/matrix.h \
 /local/include/opencv/opencv2/flann/params.h \
 /local/include/opencv/opencv2/flann/any.h \
 /local/include/opencv/opencv2/flann/defines.h \
 /local/include/opencv/opencv2/flann/saving.h \
 /local/include/opencv/opencv2/flann/nn_index.h \
 /local/include/opencv/opencv2/flann/result_set.h \
 /local/include/opencv/opencv2/flann/all_indices.h \
 /local/include/opencv/opencv2/flann/kdtree_index.h \
 /local/include/opencv/opencv2/flann/dynamic_bitset.h \
 /local/include/opencv/opencv2/flann/dist.h \
 /local/include/opencv/opencv2/flann/heap.h \
 /local/include/opencv/opencv2/flann/allocator.h \
 /local/include/opencv/opencv2/flann/random.h \
 /local/include/opencv/opencv2/flann/kdtree_single_index.h \
 /local/include/opencv/opencv2/flann/kmeans_index.h \
 /local/include/opencv/opencv2/flann/logger.h \
 /local/include/opencv/opencv2/flann/composite_index.h \
 /local/include/opencv/opencv2/flann/linear_index.h \
 /local/include/opencv/opencv2/flann/hierarchical_clustering_index.h \
 /local/include/opencv/opencv2/flann/lsh_index.h \
 /local/include/opencv/opencv2/flann/lsh_table.h \
 /local/include/opencv/opencv2/flann/autotuned_index.h \
 /local/include/opencv/opencv2/flann/ground_truth.h \
 /local/include/opencv/opencv2/flann/index_testing.h \
 /local/include/opencv/opencv2/flann/timer.h \
 /local/include/opencv/opencv2/flann/sampling.h \
 /local/include/opencv/opencv2/ml.hpp \
 /local/include/opencv/opencv2/ml/ml.inl.hpp \
 /local/include/opencv/opencv2/photo.hpp \
 /local/include/opencv/opencv2/stitching.hpp \
 /local/include/opencv/opencv2/stitching/warpers.hpp \
 /local/include/opencv/opencv2/stitching/detail/warpers.hpp \
 /local/include/opencv/opencv2/core/cuda.hpp \
 /local/include/opencv/opencv2/core/cuda_types.hpp \
 /local/include/opencv/opencv2/core/cuda.inl.hpp \
 /local/include/opencv/opencv2/stitching/detail/warpers_inl.hpp \
 /local/include/opencv/opencv2/stitching/detail/warpers.hpp \
 /local/include/opencv/opencv2/stitching/detail/matchers.hpp \
 /local/include/opencv/opencv2/stitching/detail/motion_estimators.hpp \
 /local/include/opencv/opencv2/stitching/detail/matchers.hpp \
 /local/include/opencv/opencv2/stitching/detail/util.hpp \
 /local/include/opencv/opencv2/stitching/detail/util_inl.hpp \
 /local/include/opencv/opencv2/stitching/detail/camera.hpp \
 /local/include/opencv/opencv2/stitching/detail/exposure_compensate.hpp \
 /local/include/opencv/opencv2/stitching/detail/seam_finders.hpp \
 /local/include/opencv/opencv2/stitching/detail/blenders.hpp \
 /local/include/opencv/opencv2/stitching/detail/camera.hpp \
 /local/include/opencv/opencv2/video.hpp \
 /local/include/opencv/opencv2/video/tracking.hpp \
 /local/include/opencv/opencv2/video/background_segm.hpp \
 ../../mac/macIF.h \
 /local/service/atomic/ifs/opencv/node_modules/node-addon-api/napi.h \
 /home/admin/.cache/node-gyp/12.14.0/include/node/node_api.h \
 /home/admin/.cache/node-gyp/12.14.0/include/node/js_native_api.h \
 /home/admin/.cache/node-gyp/12.14.0/include/node/js_native_api_types.h \
 /home/admin/.cache/node-gyp/12.14.0/include/node/node_api_types.h \
 /local/service/atomic/ifs/opencv/node_modules/node-addon-api/napi-inl.h \
 /local/service/atomic/ifs/opencv/node_modules/node-addon-api/napi-inl.deprecated.h
../opencvIF.cpp:
/local/include/opencv/opencv2/objdetect/objdetect.hpp:
/local/include/opencv/opencv2/objdetect.hpp:
/local/include/opencv/opencv2/core.hpp:
/local/include/opencv/opencv2/core/cvdef.h:
/local/include/opencv/opencv2/core/hal/interface.h:
/local/include/opencv/opencv2/core/cv_cpu_dispatch.h:
/local/include/opencv/opencv2/core/version.hpp:
/local/include/opencv/opencv2/core/base.hpp:
/local/include/opencv/opencv2/opencv_modules.hpp:
/local/include/opencv/opencv2/core/cvstd.hpp:
/local/include/opencv/opencv2/core/cvstd_wrapper.hpp:
/local/include/opencv/opencv2/core/neon_utils.hpp:
/local/include/opencv/opencv2/core/vsx_utils.hpp:
/local/include/opencv/opencv2/core/check.hpp:
/local/include/opencv/opencv2/core/traits.hpp:
/local/include/opencv/opencv2/core/matx.hpp:
/local/include/opencv/opencv2/core/saturate.hpp:
/local/include/opencv/opencv2/core/fast_math.hpp:
/local/include/opencv/opencv2/core/types.hpp:
/local/include/opencv/opencv2/core/mat.hpp:
/local/include/opencv/opencv2/core/bufferpool.hpp:
/local/include/opencv/opencv2/core/mat.inl.hpp:
/local/include/opencv/opencv2/core/persistence.hpp:
/local/include/opencv/opencv2/core/operations.hpp:
/local/include/opencv/opencv2/core/cvstd.inl.hpp:
/local/include/opencv/opencv2/core/utility.hpp:
/local/include/opencv/opencv2/core/optim.hpp:
/local/include/opencv/opencv2/core/ovx.hpp:
/local/include/opencv/opencv2/core/cvdef.h:
/local/include/opencv/opencv2/objdetect/detection_based_tracker.hpp:
/local/include/opencv/opencv2/highgui/highgui.hpp:
/local/include/opencv/opencv2/highgui.hpp:
/local/include/opencv/opencv2/imgcodecs.hpp:
/local/include/opencv/opencv2/videoio.hpp:
/local/include/opencv/opencv2/imgproc/imgproc.hpp:
/local/include/opencv/opencv2/imgproc.hpp:
/local/include/opencv/opencv2/opencv.hpp:
/local/include/opencv/opencv2/calib3d.hpp:
/local/include/opencv/opencv2/features2d.hpp:
/local/include/opencv/opencv2/flann/miniflann.hpp:
/local/include/opencv/opencv2/flann/defines.h:
/local/include/opencv/opencv2/flann/config.h:
/local/include/opencv/opencv2/core/affine.hpp:
/local/include/opencv/opencv2/dnn.hpp:
/local/include/opencv/opencv2/dnn/dnn.hpp:
/local/include/opencv/opencv2/core/async.hpp:
/local/include/opencv/opencv2/dnn/../dnn/version.hpp:
/local/include/opencv/opencv2/dnn/dict.hpp:
/local/include/opencv/opencv2/dnn/layer.hpp:
/local/include/opencv/opencv2/dnn/dnn.inl.hpp:
/local/include/opencv/opencv2/dnn/utils/inference_engine.hpp:
/local/include/opencv/opencv2/dnn/utils/../dnn.hpp:
/local/include/opencv/opencv2/flann.hpp:
/local/include/opencv/opencv2/flann/flann_base.hpp:
/local/include/opencv/opencv2/flann/general.h:
/local/include/opencv/opencv2/flann/matrix.h:
/local/include/opencv/opencv2/flann/params.h:
/local/include/opencv/opencv2/flann/any.h:
/local/include/opencv/opencv2/flann/defines.h:
/local/include/opencv/opencv2/flann/saving.h:
/local/include/opencv/opencv2/flann/nn_index.h:
/local/include/opencv/opencv2/flann/result_set.h:
/local/include/opencv/opencv2/flann/all_indices.h:
/local/include/opencv/opencv2/flann/kdtree_index.h:
/local/include/opencv/opencv2/flann/dynamic_bitset.h:
/local/include/opencv/opencv2/flann/dist.h:
/local/include/opencv/opencv2/flann/heap.h:
/local/include/opencv/opencv2/flann/allocator.h:
/local/include/opencv/opencv2/flann/random.h:
/local/include/opencv/opencv2/flann/kdtree_single_index.h:
/local/include/opencv/opencv2/flann/kmeans_index.h:
/local/include/opencv/opencv2/flann/logger.h:
/local/include/opencv/opencv2/flann/composite_index.h:
/local/include/opencv/opencv2/flann/linear_index.h:
/local/include/opencv/opencv2/flann/hierarchical_clustering_index.h:
/local/include/opencv/opencv2/flann/lsh_index.h:
/local/include/opencv/opencv2/flann/lsh_table.h:
/local/include/opencv/opencv2/flann/autotuned_index.h:
/local/include/opencv/opencv2/flann/ground_truth.h:
/local/include/opencv/opencv2/flann/index_testing.h:
/local/include/opencv/opencv2/flann/timer.h:
/local/include/opencv/opencv2/flann/sampling.h:
/local/include/opencv/opencv2/ml.hpp:
/local/include/opencv/opencv2/ml/ml.inl.hpp:
/local/include/opencv/opencv2/photo.hpp:
/local/include/opencv/opencv2/stitching.hpp:
/local/include/opencv/opencv2/stitching/warpers.hpp:
/local/include/opencv/opencv2/stitching/detail/warpers.hpp:
/local/include/opencv/opencv2/core/cuda.hpp:
/local/include/opencv/opencv2/core/cuda_types.hpp:
/local/include/opencv/opencv2/core/cuda.inl.hpp:
/local/include/opencv/opencv2/stitching/detail/warpers_inl.hpp:
/local/include/opencv/opencv2/stitching/detail/warpers.hpp:
/local/include/opencv/opencv2/stitching/detail/matchers.hpp:
/local/include/opencv/opencv2/stitching/detail/motion_estimators.hpp:
/local/include/opencv/opencv2/stitching/detail/matchers.hpp:
/local/include/opencv/opencv2/stitching/detail/util.hpp:
/local/include/opencv/opencv2/stitching/detail/util_inl.hpp:
/local/include/opencv/opencv2/stitching/detail/camera.hpp:
/local/include/opencv/opencv2/stitching/detail/exposure_compensate.hpp:
/local/include/opencv/opencv2/stitching/detail/seam_finders.hpp:
/local/include/opencv/opencv2/stitching/detail/blenders.hpp:
/local/include/opencv/opencv2/stitching/detail/camera.hpp:
/local/include/opencv/opencv2/video.hpp:
/local/include/opencv/opencv2/video/tracking.hpp:
/local/include/opencv/opencv2/video/background_segm.hpp:
../../mac/macIF.h:
/local/service/atomic/ifs/opencv/node_modules/node-addon-api/napi.h:
/home/admin/.cache/node-gyp/12.14.0/include/node/node_api.h:
/home/admin/.cache/node-gyp/12.14.0/include/node/js_native_api.h:
/home/admin/.cache/node-gyp/12.14.0/include/node/js_native_api_types.h:
/home/admin/.cache/node-gyp/12.14.0/include/node/node_api_types.h:
/local/service/atomic/ifs/opencv/node_modules/node-addon-api/napi-inl.h:
/local/service/atomic/ifs/opencv/node_modules/node-addon-api/napi-inl.deprecated.h:
