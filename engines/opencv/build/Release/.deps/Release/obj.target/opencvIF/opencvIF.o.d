cmd_Release/obj.target/opencvIF/opencvIF.o := g++ '-DNODE_GYP_MODULE_NAME=opencvIF' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' -I/home/admin/.node-gyp/5.5.0/include/node -I/home/admin/.node-gyp/5.5.0/src -I/home/admin/.node-gyp/5.5.0/deps/uv/include -I/home/admin/.node-gyp/5.5.0/deps/v8/include -I../. -I../../mac -I/local/include/cuda -I/local/caffe/build/src -I/local/caffe/include -I/local/include/atlas -I/local/include -I/local/include/opencv  -fPIC -pthread -Wall -Wextra -Wno-unused-parameter -m64 -O3 -ffunction-sections -fdata-sections -fno-omit-frame-pointer -D HASCAFFE=0 -D HASGPU=0 -fno-rtti -fno-exceptions -std=gnu++0x -fexceptions -MMD -MF ./Release/.deps/Release/obj.target/opencvIF/opencvIF.o.d.raw   -c -o Release/obj.target/opencvIF/opencvIF.o ../opencvIF.cpp
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
 /home/admin/.node-gyp/5.5.0/include/node/node.h \
 /home/admin/.node-gyp/5.5.0/include/node/v8.h \
 /home/admin/.node-gyp/5.5.0/include/node/v8-version.h \
 /home/admin/.node-gyp/5.5.0/include/node/v8config.h \
 /home/admin/.node-gyp/5.5.0/include/node/node_version.h \
 ../../mac/macIF.h /local/caffe/include/caffe/caffe.hpp \
 /local/caffe/include/caffe/blob.hpp \
 /local/caffe/include/caffe/common.hpp \
 /local/include/boost/shared_ptr.hpp \
 /local/include/boost/smart_ptr/shared_ptr.hpp \
 /local/include/boost/config.hpp /local/include/boost/config/user.hpp \
 /local/include/boost/config/select_compiler_config.hpp \
 /local/include/boost/config/compiler/gcc.hpp \
 /local/include/boost/config/select_stdlib_config.hpp \
 /local/include/boost/config/no_tr1/utility.hpp \
 /local/include/boost/config/stdlib/libstdcpp3.hpp \
 /local/include/boost/config/select_platform_config.hpp \
 /local/include/boost/config/platform/linux.hpp \
 /local/include/boost/config/posix_features.hpp \
 /local/include/boost/config/suffix.hpp \
 /local/include/boost/config/no_tr1/memory.hpp \
 /local/include/boost/assert.hpp \
 /local/include/boost/current_function.hpp \
 /local/include/boost/checked_delete.hpp \
 /local/include/boost/throw_exception.hpp \
 /local/include/boost/smart_ptr/detail/shared_count.hpp \
 /local/include/boost/smart_ptr/bad_weak_ptr.hpp \
 /local/include/boost/smart_ptr/detail/sp_counted_base.hpp \
 /local/include/boost/smart_ptr/detail/sp_has_sync.hpp \
 /local/include/boost/smart_ptr/detail/sp_counted_base_gcc_x86.hpp \
 /local/include/boost/detail/sp_typeinfo.hpp \
 /local/include/boost/smart_ptr/detail/sp_counted_impl.hpp \
 /local/include/boost/utility/addressof.hpp \
 /local/include/boost/smart_ptr/detail/sp_convertible.hpp \
 /local/include/boost/smart_ptr/detail/sp_nullptr_t.hpp \
 /local/include/boost/smart_ptr/detail/spinlock_pool.hpp \
 /local/include/boost/smart_ptr/detail/spinlock.hpp \
 /local/include/boost/smart_ptr/detail/spinlock_sync.hpp \
 /local/include/boost/smart_ptr/detail/yield_k.hpp \
 /local/include/boost/memory_order.hpp \
 /local/include/boost/smart_ptr/detail/operator_bool.hpp \
 /local/include/gflags/gflags.h /local/include/gflags/gflags_declare.h \
 /local/include/glog/logging.h /local/include/glog/log_severity.h \
 /local/include/glog/vlog_is_on.h \
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
 /local/caffe/include/caffe/solver.hpp /local/include/boost/function.hpp \
 /local/include/boost/preprocessor/iterate.hpp \
 /local/include/boost/preprocessor/iteration/iterate.hpp \
 /local/include/boost/preprocessor/arithmetic/dec.hpp \
 /local/include/boost/preprocessor/config/config.hpp \
 /local/include/boost/preprocessor/arithmetic/inc.hpp \
 /local/include/boost/preprocessor/array/elem.hpp \
 /local/include/boost/preprocessor/array/data.hpp \
 /local/include/boost/preprocessor/tuple/elem.hpp \
 /local/include/boost/preprocessor/cat.hpp \
 /local/include/boost/preprocessor/facilities/overload.hpp \
 /local/include/boost/preprocessor/variadic/size.hpp \
 /local/include/boost/preprocessor/tuple/rem.hpp \
 /local/include/boost/preprocessor/variadic/elem.hpp \
 /local/include/boost/preprocessor/array/size.hpp \
 /local/include/boost/preprocessor/slot/slot.hpp \
 /local/include/boost/preprocessor/slot/detail/def.hpp \
 /local/include/boost/function/detail/prologue.hpp \
 /local/include/boost/config/no_tr1/functional.hpp \
 /local/include/boost/function/function_base.hpp \
 /local/include/boost/integer.hpp /local/include/boost/integer_fwd.hpp \
 /local/include/boost/limits.hpp /local/include/boost/cstdint.hpp \
 /local/include/boost/integer_traits.hpp \
 /local/include/boost/static_assert.hpp \
 /local/include/boost/type_traits/has_trivial_copy.hpp \
 /local/include/boost/type_traits/config.hpp \
 /local/include/boost/type_traits/intrinsics.hpp \
 /local/include/boost/type_traits/is_same.hpp \
 /local/include/boost/type_traits/detail/bool_trait_def.hpp \
 /local/include/boost/type_traits/detail/template_arity_spec.hpp \
 /local/include/boost/mpl/int.hpp /local/include/boost/mpl/int_fwd.hpp \
 /local/include/boost/mpl/aux_/adl_barrier.hpp \
 /local/include/boost/mpl/aux_/config/adl.hpp \
 /local/include/boost/mpl/aux_/config/msvc.hpp \
 /local/include/boost/mpl/aux_/config/intel.hpp \
 /local/include/boost/mpl/aux_/config/gcc.hpp \
 /local/include/boost/mpl/aux_/config/workaround.hpp \
 /local/include/boost/mpl/aux_/nttp_decl.hpp \
 /local/include/boost/mpl/aux_/config/nttp.hpp \
 /local/include/boost/mpl/aux_/integral_wrapper.hpp \
 /local/include/boost/mpl/integral_c_tag.hpp \
 /local/include/boost/mpl/aux_/config/static_constant.hpp \
 /local/include/boost/mpl/aux_/static_cast.hpp \
 /local/include/boost/mpl/aux_/template_arity_fwd.hpp \
 /local/include/boost/mpl/aux_/preprocessor/params.hpp \
 /local/include/boost/mpl/aux_/config/preprocessor.hpp \
 /local/include/boost/preprocessor/comma_if.hpp \
 /local/include/boost/preprocessor/punctuation/comma_if.hpp \
 /local/include/boost/preprocessor/control/if.hpp \
 /local/include/boost/preprocessor/control/iif.hpp \
 /local/include/boost/preprocessor/logical/bool.hpp \
 /local/include/boost/preprocessor/facilities/empty.hpp \
 /local/include/boost/preprocessor/punctuation/comma.hpp \
 /local/include/boost/preprocessor/repeat.hpp \
 /local/include/boost/preprocessor/repetition/repeat.hpp \
 /local/include/boost/preprocessor/debug/error.hpp \
 /local/include/boost/preprocessor/detail/auto_rec.hpp \
 /local/include/boost/preprocessor/tuple/eat.hpp \
 /local/include/boost/preprocessor/inc.hpp \
 /local/include/boost/mpl/aux_/config/lambda.hpp \
 /local/include/boost/mpl/aux_/config/ttp.hpp \
 /local/include/boost/mpl/aux_/config/ctps.hpp \
 /local/include/boost/mpl/aux_/config/overload_resolution.hpp \
 /local/include/boost/type_traits/integral_constant.hpp \
 /local/include/boost/mpl/bool.hpp /local/include/boost/mpl/bool_fwd.hpp \
 /local/include/boost/mpl/integral_c.hpp \
 /local/include/boost/mpl/integral_c_fwd.hpp \
 /local/include/boost/mpl/aux_/lambda_support.hpp \
 /local/include/boost/type_traits/detail/bool_trait_undef.hpp \
 /local/include/boost/type_traits/is_reference.hpp \
 /local/include/boost/type_traits/is_lvalue_reference.hpp \
 /local/include/boost/type_traits/is_rvalue_reference.hpp \
 /local/include/boost/type_traits/ice.hpp \
 /local/include/boost/type_traits/detail/yes_no_type.hpp \
 /local/include/boost/type_traits/detail/ice_or.hpp \
 /local/include/boost/type_traits/detail/ice_and.hpp \
 /local/include/boost/type_traits/detail/ice_not.hpp \
 /local/include/boost/type_traits/detail/ice_eq.hpp \
 /local/include/boost/type_traits/is_volatile.hpp \
 /local/include/boost/type_traits/detail/cv_traits_impl.hpp \
 /local/include/boost/type_traits/is_pod.hpp \
 /local/include/boost/type_traits/is_void.hpp \
 /local/include/boost/type_traits/is_scalar.hpp \
 /local/include/boost/type_traits/is_arithmetic.hpp \
 /local/include/boost/type_traits/is_integral.hpp \
 /local/include/boost/type_traits/is_float.hpp \
 /local/include/boost/type_traits/is_enum.hpp \
 /local/include/boost/type_traits/is_pointer.hpp \
 /local/include/boost/type_traits/is_member_pointer.hpp \
 /local/include/boost/type_traits/is_member_function_pointer.hpp \
 /local/include/boost/type_traits/detail/is_mem_fun_pointer_impl.hpp \
 /local/include/boost/type_traits/remove_cv.hpp \
 /local/include/boost/type_traits/broken_compiler_spec.hpp \
 /local/include/boost/type_traits/detail/type_trait_def.hpp \
 /local/include/boost/type_traits/detail/type_trait_undef.hpp \
 /local/include/boost/type_traits/has_trivial_destructor.hpp \
 /local/include/boost/type_traits/is_const.hpp \
 /local/include/boost/type_traits/composite_traits.hpp \
 /local/include/boost/type_traits/is_array.hpp \
 /local/include/boost/type_traits/is_union.hpp \
 /local/include/boost/ref.hpp /local/include/boost/mpl/if.hpp \
 /local/include/boost/mpl/aux_/value_wknd.hpp \
 /local/include/boost/mpl/aux_/config/integral.hpp \
 /local/include/boost/mpl/aux_/config/eti.hpp \
 /local/include/boost/mpl/aux_/na_spec.hpp \
 /local/include/boost/mpl/lambda_fwd.hpp \
 /local/include/boost/mpl/void_fwd.hpp \
 /local/include/boost/mpl/aux_/na.hpp \
 /local/include/boost/mpl/aux_/na_fwd.hpp \
 /local/include/boost/mpl/aux_/lambda_arity_param.hpp \
 /local/include/boost/mpl/aux_/arity.hpp \
 /local/include/boost/mpl/aux_/config/dtp.hpp \
 /local/include/boost/mpl/aux_/preprocessor/enum.hpp \
 /local/include/boost/mpl/aux_/preprocessor/def_params_tail.hpp \
 /local/include/boost/mpl/limits/arity.hpp \
 /local/include/boost/preprocessor/logical/and.hpp \
 /local/include/boost/preprocessor/logical/bitand.hpp \
 /local/include/boost/preprocessor/identity.hpp \
 /local/include/boost/preprocessor/facilities/identity.hpp \
 /local/include/boost/preprocessor/empty.hpp \
 /local/include/boost/preprocessor/arithmetic/add.hpp \
 /local/include/boost/preprocessor/control/while.hpp \
 /local/include/boost/preprocessor/list/fold_left.hpp \
 /local/include/boost/preprocessor/list/detail/fold_left.hpp \
 /local/include/boost/preprocessor/control/expr_iif.hpp \
 /local/include/boost/preprocessor/list/adt.hpp \
 /local/include/boost/preprocessor/detail/is_binary.hpp \
 /local/include/boost/preprocessor/detail/check.hpp \
 /local/include/boost/preprocessor/logical/compl.hpp \
 /local/include/boost/preprocessor/list/fold_right.hpp \
 /local/include/boost/preprocessor/list/detail/fold_right.hpp \
 /local/include/boost/preprocessor/list/reverse.hpp \
 /local/include/boost/preprocessor/control/detail/while.hpp \
 /local/include/boost/preprocessor/arithmetic/sub.hpp \
 /local/include/boost/type_traits/alignment_of.hpp \
 /local/include/boost/type_traits/detail/size_t_trait_def.hpp \
 /local/include/boost/mpl/size_t.hpp \
 /local/include/boost/mpl/size_t_fwd.hpp \
 /local/include/boost/type_traits/detail/size_t_trait_undef.hpp \
 /local/include/boost/utility/enable_if.hpp \
 /local/include/boost/function_equal.hpp \
 /local/include/boost/function/function_fwd.hpp \
 /local/include/boost/mem_fn.hpp /local/include/boost/bind/mem_fn.hpp \
 /local/include/boost/get_pointer.hpp \
 /local/include/boost/bind/mem_fn_template.hpp \
 /local/include/boost/bind/mem_fn_cc.hpp \
 /local/include/boost/preprocessor/enum.hpp \
 /local/include/boost/preprocessor/repetition/enum.hpp \
 /local/include/boost/preprocessor/enum_params.hpp \
 /local/include/boost/preprocessor/repetition/enum_params.hpp \
 /local/include/boost/preprocessor/iteration/detail/iter/forward1.hpp \
 /local/include/boost/preprocessor/iteration/detail/bounds/lower1.hpp \
 /local/include/boost/preprocessor/slot/detail/shared.hpp \
 /local/include/boost/preprocessor/iteration/detail/bounds/upper1.hpp \
 /local/include/boost/function/detail/function_iterate.hpp \
 /local/include/boost/function/detail/maybe_include.hpp \
 /local/include/boost/function/function_template.hpp \
 /local/include/boost/detail/no_exceptions_support.hpp \
 /local/caffe/include/caffe/solver_factory.hpp \
 /local/caffe/include/caffe/util/benchmark.hpp \
 /local/include/boost/date_time/posix_time/posix_time.hpp \
 /local/include/boost/date_time/compiler_config.hpp \
 /local/include/boost/date_time/locale_config.hpp \
 /local/include/boost/config/auto_link.hpp \
 /local/include/boost/date_time/posix_time/ptime.hpp \
 /local/include/boost/date_time/posix_time/posix_time_system.hpp \
 /local/include/boost/date_time/posix_time/posix_time_config.hpp \
 /local/include/boost/config/no_tr1/cmath.hpp \
 /local/include/boost/date_time/time_duration.hpp \
 /local/include/boost/operators.hpp /local/include/boost/iterator.hpp \
 /local/include/boost/date_time/time_defs.hpp \
 /local/include/boost/date_time/special_defs.hpp \
 /local/include/boost/date_time/time_resolution_traits.hpp \
 /local/include/boost/date_time/int_adapter.hpp \
 /local/include/boost/date_time/gregorian/gregorian_types.hpp \
 /local/include/boost/date_time/date.hpp \
 /local/include/boost/date_time/year_month_day.hpp \
 /local/include/boost/date_time/period.hpp \
 /local/include/boost/date_time/gregorian/greg_calendar.hpp \
 /local/include/boost/date_time/gregorian/greg_weekday.hpp \
 /local/include/boost/date_time/constrained_value.hpp \
 /local/include/boost/type_traits/is_base_of.hpp \
 /local/include/boost/type_traits/is_base_and_derived.hpp \
 /local/include/boost/type_traits/is_class.hpp \
 /local/include/boost/date_time/date_defs.hpp \
 /local/include/boost/date_time/gregorian/greg_day_of_year.hpp \
 /local/include/boost/date_time/gregorian_calendar.hpp \
 /local/include/boost/date_time/gregorian_calendar.ipp \
 /local/include/boost/date_time/gregorian/greg_ymd.hpp \
 /local/include/boost/date_time/gregorian/greg_day.hpp \
 /local/include/boost/date_time/gregorian/greg_year.hpp \
 /local/include/boost/date_time/gregorian/greg_month.hpp \
 /local/include/boost/date_time/gregorian/greg_duration.hpp \
 /local/include/boost/date_time/date_duration.hpp \
 /local/include/boost/date_time/date_duration_types.hpp \
 /local/include/boost/date_time/gregorian/greg_duration_types.hpp \
 /local/include/boost/date_time/gregorian/greg_date.hpp \
 /local/include/boost/date_time/adjust_functors.hpp \
 /local/include/boost/date_time/wrapping_int.hpp \
 /local/include/boost/date_time/date_generators.hpp \
 /local/include/boost/date_time/date_clock_device.hpp \
 /local/include/boost/date_time/c_time.hpp \
 /local/include/boost/date_time/date_iterator.hpp \
 /local/include/boost/date_time/time_system_split.hpp \
 /local/include/boost/date_time/time_system_counted.hpp \
 /local/include/boost/date_time/time.hpp \
 /local/include/boost/date_time/posix_time/date_duration_operators.hpp \
 /local/include/boost/date_time/posix_time/time_formatters.hpp \
 /local/include/boost/date_time/gregorian/gregorian.hpp \
 /local/include/boost/date_time/gregorian/conversion.hpp \
 /local/include/boost/date_time/gregorian/formatters.hpp \
 /local/include/boost/date_time/date_formatting.hpp \
 /local/include/boost/date_time/iso_format.hpp \
 /local/include/boost/date_time/parse_format_base.hpp \
 /local/include/boost/date_time/date_format_simple.hpp \
 /local/include/boost/date_time/gregorian/gregorian_io.hpp \
 /local/include/boost/io/ios_state.hpp /local/include/boost/io_fwd.hpp \
 /local/include/boost/date_time/date_facet.hpp \
 /local/include/boost/algorithm/string/replace.hpp \
 /local/include/boost/algorithm/string/config.hpp \
 /local/include/boost/range/iterator_range.hpp \
 /local/include/boost/range/iterator_range_core.hpp \
 /local/include/boost/iterator/iterator_traits.hpp \
 /local/include/boost/detail/iterator.hpp \
 /local/include/boost/iterator/iterator_facade.hpp \
 /local/include/boost/iterator/interoperable.hpp \
 /local/include/boost/mpl/or.hpp \
 /local/include/boost/mpl/aux_/config/use_preprocessed.hpp \
 /local/include/boost/mpl/aux_/nested_type_wknd.hpp \
 /local/include/boost/mpl/aux_/include_preprocessed.hpp \
 /local/include/boost/mpl/aux_/config/compiler.hpp \
 /local/include/boost/preprocessor/stringize.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/or.hpp \
 /local/include/boost/type_traits/is_convertible.hpp \
 /local/include/boost/type_traits/is_abstract.hpp \
 /local/include/boost/type_traits/add_lvalue_reference.hpp \
 /local/include/boost/type_traits/add_reference.hpp \
 /local/include/boost/type_traits/add_rvalue_reference.hpp \
 /local/include/boost/type_traits/is_function.hpp \
 /local/include/boost/type_traits/detail/false_result.hpp \
 /local/include/boost/type_traits/detail/is_function_ptr_helper.hpp \
 /local/include/boost/iterator/detail/config_def.hpp \
 /local/include/boost/iterator/detail/config_undef.hpp \
 /local/include/boost/iterator/detail/facade_iterator_category.hpp \
 /local/include/boost/iterator/iterator_categories.hpp \
 /local/include/boost/mpl/eval_if.hpp \
 /local/include/boost/mpl/identity.hpp \
 /local/include/boost/mpl/placeholders.hpp \
 /local/include/boost/mpl/arg.hpp /local/include/boost/mpl/arg_fwd.hpp \
 /local/include/boost/mpl/aux_/na_assert.hpp \
 /local/include/boost/mpl/assert.hpp /local/include/boost/mpl/not.hpp \
 /local/include/boost/mpl/aux_/yes_no.hpp \
 /local/include/boost/mpl/aux_/config/arrays.hpp \
 /local/include/boost/mpl/aux_/config/pp_counter.hpp \
 /local/include/boost/mpl/aux_/arity_spec.hpp \
 /local/include/boost/mpl/aux_/arg_typedef.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/arg.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/placeholders.hpp \
 /local/include/boost/mpl/and.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/and.hpp \
 /local/include/boost/detail/indirect_traits.hpp \
 /local/include/boost/type_traits/remove_reference.hpp \
 /local/include/boost/type_traits/remove_pointer.hpp \
 /local/include/boost/iterator/detail/enable_if.hpp \
 /local/include/boost/type_traits/add_const.hpp \
 /local/include/boost/type_traits/add_pointer.hpp \
 /local/include/boost/type_traits/remove_const.hpp \
 /local/include/boost/mpl/always.hpp /local/include/boost/mpl/apply.hpp \
 /local/include/boost/mpl/apply_fwd.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/apply_fwd.hpp \
 /local/include/boost/mpl/apply_wrap.hpp \
 /local/include/boost/mpl/aux_/has_apply.hpp \
 /local/include/boost/mpl/has_xxx.hpp \
 /local/include/boost/mpl/aux_/type_wrapper.hpp \
 /local/include/boost/mpl/aux_/config/has_xxx.hpp \
 /local/include/boost/mpl/aux_/config/msvc_typename.hpp \
 /local/include/boost/preprocessor/repetition/enum_trailing_params.hpp \
 /local/include/boost/mpl/aux_/config/has_apply.hpp \
 /local/include/boost/mpl/aux_/msvc_never_true.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/apply_wrap.hpp \
 /local/include/boost/mpl/lambda.hpp /local/include/boost/mpl/bind.hpp \
 /local/include/boost/mpl/bind_fwd.hpp \
 /local/include/boost/mpl/aux_/config/bind.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/bind_fwd.hpp \
 /local/include/boost/mpl/next.hpp \
 /local/include/boost/mpl/next_prior.hpp \
 /local/include/boost/mpl/aux_/common_name_wknd.hpp \
 /local/include/boost/mpl/protect.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/bind.hpp \
 /local/include/boost/mpl/aux_/full_lambda.hpp \
 /local/include/boost/mpl/quote.hpp /local/include/boost/mpl/void.hpp \
 /local/include/boost/mpl/aux_/has_type.hpp \
 /local/include/boost/mpl/aux_/config/bcc.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/quote.hpp \
 /local/include/boost/mpl/aux_/template_arity.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/template_arity.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/full_lambda.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/apply.hpp \
 /local/include/boost/range/functions.hpp \
 /local/include/boost/range/begin.hpp \
 /local/include/boost/range/config.hpp \
 /local/include/boost/range/iterator.hpp \
 /local/include/boost/range/mutable_iterator.hpp \
 /local/include/boost/range/detail/extract_optional_type.hpp \
 /local/include/boost/range/const_iterator.hpp \
 /local/include/boost/range/end.hpp \
 /local/include/boost/range/detail/implementation_help.hpp \
 /local/include/boost/range/detail/common.hpp \
 /local/include/boost/range/detail/sfinae.hpp \
 /local/include/boost/range/size.hpp \
 /local/include/boost/range/size_type.hpp \
 /local/include/boost/range/difference_type.hpp \
 /local/include/boost/type_traits/make_unsigned.hpp \
 /local/include/boost/type_traits/is_signed.hpp \
 /local/include/boost/type_traits/is_unsigned.hpp \
 /local/include/boost/type_traits/add_volatile.hpp \
 /local/include/boost/range/distance.hpp \
 /local/include/boost/range/empty.hpp \
 /local/include/boost/range/rbegin.hpp \
 /local/include/boost/range/reverse_iterator.hpp \
 /local/include/boost/iterator/reverse_iterator.hpp \
 /local/include/boost/next_prior.hpp \
 /local/include/boost/iterator/iterator_adaptor.hpp \
 /local/include/boost/range/rend.hpp \
 /local/include/boost/range/algorithm/equal.hpp \
 /local/include/boost/range/concepts.hpp \
 /local/include/boost/concept_check.hpp \
 /local/include/boost/concept/assert.hpp \
 /local/include/boost/concept/detail/general.hpp \
 /local/include/boost/concept/detail/backward_compatibility.hpp \
 /local/include/boost/concept/detail/has_constraints.hpp \
 /local/include/boost/type_traits/conversion_traits.hpp \
 /local/include/boost/concept/usage.hpp \
 /local/include/boost/concept/detail/concept_def.hpp \
 /local/include/boost/preprocessor/seq/for_each_i.hpp \
 /local/include/boost/preprocessor/repetition/for.hpp \
 /local/include/boost/preprocessor/repetition/detail/for.hpp \
 /local/include/boost/preprocessor/seq/seq.hpp \
 /local/include/boost/preprocessor/seq/elem.hpp \
 /local/include/boost/preprocessor/seq/size.hpp \
 /local/include/boost/preprocessor/seq/enum.hpp \
 /local/include/boost/concept/detail/concept_undef.hpp \
 /local/include/boost/iterator/iterator_concepts.hpp \
 /local/include/boost/range/value_type.hpp \
 /local/include/boost/range/detail/misc_concept.hpp \
 /local/include/boost/range/detail/safe_bool.hpp \
 /local/include/boost/range/iterator_range_io.hpp \
 /local/include/boost/algorithm/string/find_format.hpp \
 /local/include/boost/range/as_literal.hpp \
 /local/include/boost/range/detail/str_types.hpp \
 /local/include/boost/algorithm/string/concept.hpp \
 /local/include/boost/algorithm/string/detail/find_format.hpp \
 /local/include/boost/algorithm/string/detail/find_format_store.hpp \
 /local/include/boost/algorithm/string/detail/replace_storage.hpp \
 /local/include/boost/algorithm/string/sequence_traits.hpp \
 /local/include/boost/algorithm/string/yes_no_type.hpp \
 /local/include/boost/algorithm/string/detail/sequence.hpp \
 /local/include/boost/mpl/logical.hpp \
 /local/include/boost/algorithm/string/detail/find_format_all.hpp \
 /local/include/boost/algorithm/string/finder.hpp \
 /local/include/boost/algorithm/string/constants.hpp \
 /local/include/boost/algorithm/string/detail/finder.hpp \
 /local/include/boost/algorithm/string/compare.hpp \
 /local/include/boost/algorithm/string/formatter.hpp \
 /local/include/boost/algorithm/string/detail/formatter.hpp \
 /local/include/boost/algorithm/string/detail/util.hpp \
 /local/include/boost/date_time/special_values_formatter.hpp \
 /local/include/boost/date_time/period_formatter.hpp \
 /local/include/boost/date_time/period_parser.hpp \
 /local/include/boost/date_time/string_parse_tree.hpp \
 /local/include/boost/lexical_cast.hpp \
 /local/include/boost/detail/lcast_precision.hpp \
 /local/include/boost/array.hpp /local/include/boost/swap.hpp \
 /local/include/boost/utility/swap.hpp \
 /local/include/boost/functional/hash_fwd.hpp \
 /local/include/boost/functional/hash/hash_fwd.hpp \
 /local/include/boost/numeric/conversion/cast.hpp \
 /local/include/boost/type.hpp \
 /local/include/boost/numeric/conversion/converter.hpp \
 /local/include/boost/numeric/conversion/conversion_traits.hpp \
 /local/include/boost/numeric/conversion/detail/conversion_traits.hpp \
 /local/include/boost/numeric/conversion/detail/meta.hpp \
 /local/include/boost/mpl/equal_to.hpp \
 /local/include/boost/mpl/aux_/comparison_op.hpp \
 /local/include/boost/mpl/aux_/numeric_op.hpp \
 /local/include/boost/mpl/numeric_cast.hpp \
 /local/include/boost/mpl/tag.hpp \
 /local/include/boost/mpl/aux_/has_tag.hpp \
 /local/include/boost/mpl/aux_/numeric_cast_utils.hpp \
 /local/include/boost/mpl/aux_/config/forwarding.hpp \
 /local/include/boost/mpl/aux_/msvc_eti_base.hpp \
 /local/include/boost/mpl/aux_/is_msvc_eti_arg.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/equal_to.hpp \
 /local/include/boost/numeric/conversion/detail/int_float_mixture.hpp \
 /local/include/boost/numeric/conversion/int_float_mixture_enum.hpp \
 /local/include/boost/numeric/conversion/detail/sign_mixture.hpp \
 /local/include/boost/numeric/conversion/sign_mixture_enum.hpp \
 /local/include/boost/numeric/conversion/detail/udt_builtin_mixture.hpp \
 /local/include/boost/numeric/conversion/udt_builtin_mixture_enum.hpp \
 /local/include/boost/numeric/conversion/detail/is_subranged.hpp \
 /local/include/boost/mpl/multiplies.hpp \
 /local/include/boost/mpl/times.hpp \
 /local/include/boost/mpl/aux_/arithmetic_op.hpp \
 /local/include/boost/mpl/aux_/largest_int.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/times.hpp \
 /local/include/boost/mpl/aux_/preprocessor/default_params.hpp \
 /local/include/boost/mpl/less.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/less.hpp \
 /local/include/boost/numeric/conversion/converter_policies.hpp \
 /local/include/boost/numeric/conversion/detail/converter.hpp \
 /local/include/boost/numeric/conversion/bounds.hpp \
 /local/include/boost/numeric/conversion/detail/bounds.hpp \
 /local/include/boost/numeric/conversion/numeric_cast_traits.hpp \
 /local/include/boost/numeric/conversion/detail/numeric_cast_traits.hpp \
 /local/include/boost/numeric/conversion/detail/preprocessed/numeric_cast_traits_common.hpp \
 /local/include/boost/numeric/conversion/detail/preprocessed/numeric_cast_traits_long_long.hpp \
 /local/include/boost/type_traits/has_left_shift.hpp \
 /local/include/boost/type_traits/detail/has_binary_operator.hpp \
 /local/include/boost/type_traits/is_fundamental.hpp \
 /local/include/boost/type_traits/has_right_shift.hpp \
 /local/include/boost/math/special_functions/sign.hpp \
 /local/include/boost/math/tools/config.hpp \
 /local/include/boost/math/tools/user.hpp \
 /local/include/boost/math/special_functions/detail/round_fwd.hpp \
 /local/include/boost/detail/fenv.hpp \
 /local/include/boost/math/special_functions/math_fwd.hpp \
 /local/include/boost/math/tools/promotion.hpp \
 /local/include/boost/type_traits/is_floating_point.hpp \
 /local/include/boost/math/policies/policy.hpp \
 /local/include/boost/mpl/list.hpp \
 /local/include/boost/mpl/limits/list.hpp \
 /local/include/boost/mpl/list/list20.hpp \
 /local/include/boost/mpl/list/list10.hpp \
 /local/include/boost/mpl/list/list0.hpp \
 /local/include/boost/mpl/long.hpp /local/include/boost/mpl/long_fwd.hpp \
 /local/include/boost/mpl/list/aux_/push_front.hpp \
 /local/include/boost/mpl/push_front_fwd.hpp \
 /local/include/boost/mpl/list/aux_/item.hpp \
 /local/include/boost/mpl/list/aux_/tag.hpp \
 /local/include/boost/mpl/list/aux_/pop_front.hpp \
 /local/include/boost/mpl/pop_front_fwd.hpp \
 /local/include/boost/mpl/list/aux_/push_back.hpp \
 /local/include/boost/mpl/push_back_fwd.hpp \
 /local/include/boost/mpl/list/aux_/front.hpp \
 /local/include/boost/mpl/front_fwd.hpp \
 /local/include/boost/mpl/list/aux_/clear.hpp \
 /local/include/boost/mpl/clear_fwd.hpp \
 /local/include/boost/mpl/list/aux_/O1_size.hpp \
 /local/include/boost/mpl/O1_size_fwd.hpp \
 /local/include/boost/mpl/list/aux_/size.hpp \
 /local/include/boost/mpl/size_fwd.hpp \
 /local/include/boost/mpl/list/aux_/empty.hpp \
 /local/include/boost/mpl/empty_fwd.hpp \
 /local/include/boost/mpl/list/aux_/begin_end.hpp \
 /local/include/boost/mpl/begin_end_fwd.hpp \
 /local/include/boost/mpl/list/aux_/iterator.hpp \
 /local/include/boost/mpl/iterator_tags.hpp \
 /local/include/boost/mpl/deref.hpp \
 /local/include/boost/mpl/aux_/msvc_type.hpp \
 /local/include/boost/mpl/aux_/lambda_spec.hpp \
 /local/include/boost/mpl/list/aux_/include_preprocessed.hpp \
 /local/include/boost/mpl/list/aux_/preprocessed/plain/list10.hpp \
 /local/include/boost/mpl/list/aux_/preprocessed/plain/list20.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/list.hpp \
 /local/include/boost/mpl/contains.hpp \
 /local/include/boost/mpl/contains_fwd.hpp \
 /local/include/boost/mpl/sequence_tag.hpp \
 /local/include/boost/mpl/sequence_tag_fwd.hpp \
 /local/include/boost/mpl/aux_/has_begin.hpp \
 /local/include/boost/mpl/aux_/contains_impl.hpp \
 /local/include/boost/mpl/begin_end.hpp \
 /local/include/boost/mpl/aux_/begin_end_impl.hpp \
 /local/include/boost/mpl/aux_/traits_lambda_spec.hpp \
 /local/include/boost/mpl/find.hpp /local/include/boost/mpl/find_if.hpp \
 /local/include/boost/mpl/aux_/find_if_pred.hpp \
 /local/include/boost/mpl/aux_/iter_apply.hpp \
 /local/include/boost/mpl/iter_fold_if.hpp \
 /local/include/boost/mpl/pair.hpp \
 /local/include/boost/mpl/aux_/iter_fold_if_impl.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/iter_fold_if_impl.hpp \
 /local/include/boost/mpl/same_as.hpp \
 /local/include/boost/mpl/remove_if.hpp /local/include/boost/mpl/fold.hpp \
 /local/include/boost/mpl/O1_size.hpp \
 /local/include/boost/mpl/aux_/O1_size_impl.hpp \
 /local/include/boost/mpl/aux_/has_size.hpp \
 /local/include/boost/mpl/aux_/fold_impl.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/fold_impl.hpp \
 /local/include/boost/mpl/reverse_fold.hpp \
 /local/include/boost/mpl/aux_/reverse_fold_impl.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/reverse_fold_impl.hpp \
 /local/include/boost/mpl/aux_/inserter_algorithm.hpp \
 /local/include/boost/mpl/back_inserter.hpp \
 /local/include/boost/mpl/push_back.hpp \
 /local/include/boost/mpl/aux_/push_back_impl.hpp \
 /local/include/boost/mpl/inserter.hpp \
 /local/include/boost/mpl/front_inserter.hpp \
 /local/include/boost/mpl/push_front.hpp \
 /local/include/boost/mpl/aux_/push_front_impl.hpp \
 /local/include/boost/mpl/clear.hpp \
 /local/include/boost/mpl/aux_/clear_impl.hpp \
 /local/include/boost/mpl/vector.hpp \
 /local/include/boost/mpl/limits/vector.hpp \
 /local/include/boost/mpl/vector/vector20.hpp \
 /local/include/boost/mpl/vector/vector10.hpp \
 /local/include/boost/mpl/vector/vector0.hpp \
 /local/include/boost/mpl/vector/aux_/at.hpp \
 /local/include/boost/mpl/at_fwd.hpp \
 /local/include/boost/mpl/vector/aux_/tag.hpp \
 /local/include/boost/mpl/aux_/config/typeof.hpp \
 /local/include/boost/mpl/vector/aux_/front.hpp \
 /local/include/boost/mpl/vector/aux_/push_front.hpp \
 /local/include/boost/mpl/vector/aux_/item.hpp \
 /local/include/boost/mpl/vector/aux_/pop_front.hpp \
 /local/include/boost/mpl/vector/aux_/push_back.hpp \
 /local/include/boost/mpl/vector/aux_/pop_back.hpp \
 /local/include/boost/mpl/pop_back_fwd.hpp \
 /local/include/boost/mpl/vector/aux_/back.hpp \
 /local/include/boost/mpl/back_fwd.hpp \
 /local/include/boost/mpl/vector/aux_/clear.hpp \
 /local/include/boost/mpl/vector/aux_/vector0.hpp \
 /local/include/boost/mpl/vector/aux_/iterator.hpp \
 /local/include/boost/mpl/plus.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/plus.hpp \
 /local/include/boost/mpl/minus.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/minus.hpp \
 /local/include/boost/mpl/advance_fwd.hpp \
 /local/include/boost/mpl/distance_fwd.hpp \
 /local/include/boost/mpl/prior.hpp \
 /local/include/boost/mpl/vector/aux_/O1_size.hpp \
 /local/include/boost/mpl/vector/aux_/size.hpp \
 /local/include/boost/mpl/vector/aux_/empty.hpp \
 /local/include/boost/mpl/vector/aux_/begin_end.hpp \
 /local/include/boost/mpl/vector/aux_/include_preprocessed.hpp \
 /local/include/boost/mpl/vector/aux_/preprocessed/typeof_based/vector10.hpp \
 /local/include/boost/mpl/vector/aux_/preprocessed/typeof_based/vector20.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/vector.hpp \
 /local/include/boost/mpl/at.hpp \
 /local/include/boost/mpl/aux_/at_impl.hpp \
 /local/include/boost/mpl/advance.hpp /local/include/boost/mpl/negate.hpp \
 /local/include/boost/mpl/aux_/advance_forward.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/advance_forward.hpp \
 /local/include/boost/mpl/aux_/advance_backward.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/advance_backward.hpp \
 /local/include/boost/mpl/size.hpp \
 /local/include/boost/mpl/aux_/size_impl.hpp \
 /local/include/boost/mpl/distance.hpp \
 /local/include/boost/mpl/iter_fold.hpp \
 /local/include/boost/mpl/aux_/iter_fold_impl.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/iter_fold_impl.hpp \
 /local/include/boost/mpl/iterator_range.hpp \
 /local/include/boost/mpl/comparison.hpp \
 /local/include/boost/mpl/not_equal_to.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/not_equal_to.hpp \
 /local/include/boost/mpl/greater.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/greater.hpp \
 /local/include/boost/mpl/less_equal.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/less_equal.hpp \
 /local/include/boost/mpl/greater_equal.hpp \
 /local/include/boost/mpl/aux_/preprocessed/gcc/greater_equal.hpp \
 /local/include/boost/config/no_tr1/complex.hpp \
 /local/include/boost/math/special_functions/detail/fp_traits.hpp \
 /local/include/boost/detail/endian.hpp \
 /local/include/boost/math/special_functions/fpclassify.hpp \
 /local/include/boost/math/tools/real_cast.hpp \
 /local/include/boost/container/container_fwd.hpp \
 /local/include/boost/algorithm/string/case_conv.hpp \
 /local/include/boost/iterator/transform_iterator.hpp \
 /local/include/boost/type_traits/function_traits.hpp \
 /local/include/boost/utility/result_of.hpp \
 /local/include/boost/preprocessor/repetition/enum_binary_params.hpp \
 /local/include/boost/preprocessor/repetition/enum_shifted_params.hpp \
 /local/include/boost/preprocessor/facilities/intercept.hpp \
 /local/include/boost/utility/declval.hpp \
 /local/include/boost/utility/detail/result_of_iterate.hpp \
 /local/include/boost/algorithm/string/detail/case_conv.hpp \
 /local/include/boost/date_time/string_convert.hpp \
 /local/include/boost/date_time/date_generator_formatter.hpp \
 /local/include/boost/date_time/date_generator_parser.hpp \
 /local/include/boost/date_time/format_date_parser.hpp \
 /local/include/boost/date_time/strings_from_facet.hpp \
 /local/include/boost/date_time/special_values_parser.hpp \
 /local/include/boost/date_time/gregorian/parsers.hpp \
 /local/include/boost/date_time/date_parsing.hpp \
 /local/include/boost/tokenizer.hpp \
 /local/include/boost/token_iterator.hpp \
 /local/include/boost/iterator/detail/minimum_category.hpp \
 /local/include/boost/token_functions.hpp \
 /local/include/boost/date_time/posix_time/posix_time_types.hpp \
 /local/include/boost/date_time/time_clock.hpp \
 /local/include/boost/date_time/microsec_time_clock.hpp \
 /local/include/boost/date_time/filetime_functions.hpp \
 /local/include/boost/date_time/posix_time/posix_time_duration.hpp \
 /local/include/boost/date_time/posix_time/time_period.hpp \
 /local/include/boost/date_time/time_iterator.hpp \
 /local/include/boost/date_time/dst_rules.hpp \
 /local/include/boost/date_time/time_formatting_streams.hpp \
 /local/include/boost/date_time/date_formatting_locales.hpp \
 /local/include/boost/date_time/date_names_put.hpp \
 /local/include/boost/date_time/time_parsing.hpp \
 /local/include/boost/date_time/posix_time/posix_time_io.hpp \
 /local/include/boost/date_time/time_facet.hpp \
 /local/include/boost/algorithm/string/erase.hpp \
 /local/include/boost/date_time/posix_time/conversion.hpp \
 /local/include/boost/date_time/posix_time/time_parsers.hpp \
 /local/caffe/include/caffe/util/io.hpp \
 /local/include/boost/filesystem.hpp \
 /local/include/boost/filesystem/config.hpp \
 /local/include/boost/system/api_config.hpp \
 /local/include/boost/filesystem/path.hpp \
 /local/include/boost/filesystem/path_traits.hpp \
 /local/include/boost/type_traits/decay.hpp \
 /local/include/boost/type_traits/remove_bounds.hpp \
 /local/include/boost/system/error_code.hpp \
 /local/include/boost/system/config.hpp \
 /local/include/boost/noncopyable.hpp /local/include/boost/cerrno.hpp \
 /local/include/boost/config/abi_prefix.hpp \
 /local/include/boost/config/abi_suffix.hpp \
 /local/include/boost/system/system_error.hpp \
 /local/include/boost/io/detail/quoted_manip.hpp \
 /local/include/boost/filesystem/operations.hpp \
 /local/include/boost/detail/scoped_enum_emulation.hpp \
 /local/include/boost/detail/bitmask.hpp \
 /local/include/boost/filesystem/convenience.hpp \
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
/home/admin/.node-gyp/5.5.0/include/node/node.h:
/home/admin/.node-gyp/5.5.0/include/node/v8.h:
/home/admin/.node-gyp/5.5.0/include/node/v8-version.h:
/home/admin/.node-gyp/5.5.0/include/node/v8config.h:
/home/admin/.node-gyp/5.5.0/include/node/node_version.h:
../../mac/macIF.h:
/local/caffe/include/caffe/caffe.hpp:
/local/caffe/include/caffe/blob.hpp:
/local/caffe/include/caffe/common.hpp:
/local/include/boost/shared_ptr.hpp:
/local/include/boost/smart_ptr/shared_ptr.hpp:
/local/include/boost/config.hpp:
/local/include/boost/config/user.hpp:
/local/include/boost/config/select_compiler_config.hpp:
/local/include/boost/config/compiler/gcc.hpp:
/local/include/boost/config/select_stdlib_config.hpp:
/local/include/boost/config/no_tr1/utility.hpp:
/local/include/boost/config/stdlib/libstdcpp3.hpp:
/local/include/boost/config/select_platform_config.hpp:
/local/include/boost/config/platform/linux.hpp:
/local/include/boost/config/posix_features.hpp:
/local/include/boost/config/suffix.hpp:
/local/include/boost/config/no_tr1/memory.hpp:
/local/include/boost/assert.hpp:
/local/include/boost/current_function.hpp:
/local/include/boost/checked_delete.hpp:
/local/include/boost/throw_exception.hpp:
/local/include/boost/smart_ptr/detail/shared_count.hpp:
/local/include/boost/smart_ptr/bad_weak_ptr.hpp:
/local/include/boost/smart_ptr/detail/sp_counted_base.hpp:
/local/include/boost/smart_ptr/detail/sp_has_sync.hpp:
/local/include/boost/smart_ptr/detail/sp_counted_base_gcc_x86.hpp:
/local/include/boost/detail/sp_typeinfo.hpp:
/local/include/boost/smart_ptr/detail/sp_counted_impl.hpp:
/local/include/boost/utility/addressof.hpp:
/local/include/boost/smart_ptr/detail/sp_convertible.hpp:
/local/include/boost/smart_ptr/detail/sp_nullptr_t.hpp:
/local/include/boost/smart_ptr/detail/spinlock_pool.hpp:
/local/include/boost/smart_ptr/detail/spinlock.hpp:
/local/include/boost/smart_ptr/detail/spinlock_sync.hpp:
/local/include/boost/smart_ptr/detail/yield_k.hpp:
/local/include/boost/memory_order.hpp:
/local/include/boost/smart_ptr/detail/operator_bool.hpp:
/local/include/gflags/gflags.h:
/local/include/gflags/gflags_declare.h:
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
/local/caffe/include/caffe/solver.hpp:
/local/include/boost/function.hpp:
/local/include/boost/preprocessor/iterate.hpp:
/local/include/boost/preprocessor/iteration/iterate.hpp:
/local/include/boost/preprocessor/arithmetic/dec.hpp:
/local/include/boost/preprocessor/config/config.hpp:
/local/include/boost/preprocessor/arithmetic/inc.hpp:
/local/include/boost/preprocessor/array/elem.hpp:
/local/include/boost/preprocessor/array/data.hpp:
/local/include/boost/preprocessor/tuple/elem.hpp:
/local/include/boost/preprocessor/cat.hpp:
/local/include/boost/preprocessor/facilities/overload.hpp:
/local/include/boost/preprocessor/variadic/size.hpp:
/local/include/boost/preprocessor/tuple/rem.hpp:
/local/include/boost/preprocessor/variadic/elem.hpp:
/local/include/boost/preprocessor/array/size.hpp:
/local/include/boost/preprocessor/slot/slot.hpp:
/local/include/boost/preprocessor/slot/detail/def.hpp:
/local/include/boost/function/detail/prologue.hpp:
/local/include/boost/config/no_tr1/functional.hpp:
/local/include/boost/function/function_base.hpp:
/local/include/boost/integer.hpp:
/local/include/boost/integer_fwd.hpp:
/local/include/boost/limits.hpp:
/local/include/boost/cstdint.hpp:
/local/include/boost/integer_traits.hpp:
/local/include/boost/static_assert.hpp:
/local/include/boost/type_traits/has_trivial_copy.hpp:
/local/include/boost/type_traits/config.hpp:
/local/include/boost/type_traits/intrinsics.hpp:
/local/include/boost/type_traits/is_same.hpp:
/local/include/boost/type_traits/detail/bool_trait_def.hpp:
/local/include/boost/type_traits/detail/template_arity_spec.hpp:
/local/include/boost/mpl/int.hpp:
/local/include/boost/mpl/int_fwd.hpp:
/local/include/boost/mpl/aux_/adl_barrier.hpp:
/local/include/boost/mpl/aux_/config/adl.hpp:
/local/include/boost/mpl/aux_/config/msvc.hpp:
/local/include/boost/mpl/aux_/config/intel.hpp:
/local/include/boost/mpl/aux_/config/gcc.hpp:
/local/include/boost/mpl/aux_/config/workaround.hpp:
/local/include/boost/mpl/aux_/nttp_decl.hpp:
/local/include/boost/mpl/aux_/config/nttp.hpp:
/local/include/boost/mpl/aux_/integral_wrapper.hpp:
/local/include/boost/mpl/integral_c_tag.hpp:
/local/include/boost/mpl/aux_/config/static_constant.hpp:
/local/include/boost/mpl/aux_/static_cast.hpp:
/local/include/boost/mpl/aux_/template_arity_fwd.hpp:
/local/include/boost/mpl/aux_/preprocessor/params.hpp:
/local/include/boost/mpl/aux_/config/preprocessor.hpp:
/local/include/boost/preprocessor/comma_if.hpp:
/local/include/boost/preprocessor/punctuation/comma_if.hpp:
/local/include/boost/preprocessor/control/if.hpp:
/local/include/boost/preprocessor/control/iif.hpp:
/local/include/boost/preprocessor/logical/bool.hpp:
/local/include/boost/preprocessor/facilities/empty.hpp:
/local/include/boost/preprocessor/punctuation/comma.hpp:
/local/include/boost/preprocessor/repeat.hpp:
/local/include/boost/preprocessor/repetition/repeat.hpp:
/local/include/boost/preprocessor/debug/error.hpp:
/local/include/boost/preprocessor/detail/auto_rec.hpp:
/local/include/boost/preprocessor/tuple/eat.hpp:
/local/include/boost/preprocessor/inc.hpp:
/local/include/boost/mpl/aux_/config/lambda.hpp:
/local/include/boost/mpl/aux_/config/ttp.hpp:
/local/include/boost/mpl/aux_/config/ctps.hpp:
/local/include/boost/mpl/aux_/config/overload_resolution.hpp:
/local/include/boost/type_traits/integral_constant.hpp:
/local/include/boost/mpl/bool.hpp:
/local/include/boost/mpl/bool_fwd.hpp:
/local/include/boost/mpl/integral_c.hpp:
/local/include/boost/mpl/integral_c_fwd.hpp:
/local/include/boost/mpl/aux_/lambda_support.hpp:
/local/include/boost/type_traits/detail/bool_trait_undef.hpp:
/local/include/boost/type_traits/is_reference.hpp:
/local/include/boost/type_traits/is_lvalue_reference.hpp:
/local/include/boost/type_traits/is_rvalue_reference.hpp:
/local/include/boost/type_traits/ice.hpp:
/local/include/boost/type_traits/detail/yes_no_type.hpp:
/local/include/boost/type_traits/detail/ice_or.hpp:
/local/include/boost/type_traits/detail/ice_and.hpp:
/local/include/boost/type_traits/detail/ice_not.hpp:
/local/include/boost/type_traits/detail/ice_eq.hpp:
/local/include/boost/type_traits/is_volatile.hpp:
/local/include/boost/type_traits/detail/cv_traits_impl.hpp:
/local/include/boost/type_traits/is_pod.hpp:
/local/include/boost/type_traits/is_void.hpp:
/local/include/boost/type_traits/is_scalar.hpp:
/local/include/boost/type_traits/is_arithmetic.hpp:
/local/include/boost/type_traits/is_integral.hpp:
/local/include/boost/type_traits/is_float.hpp:
/local/include/boost/type_traits/is_enum.hpp:
/local/include/boost/type_traits/is_pointer.hpp:
/local/include/boost/type_traits/is_member_pointer.hpp:
/local/include/boost/type_traits/is_member_function_pointer.hpp:
/local/include/boost/type_traits/detail/is_mem_fun_pointer_impl.hpp:
/local/include/boost/type_traits/remove_cv.hpp:
/local/include/boost/type_traits/broken_compiler_spec.hpp:
/local/include/boost/type_traits/detail/type_trait_def.hpp:
/local/include/boost/type_traits/detail/type_trait_undef.hpp:
/local/include/boost/type_traits/has_trivial_destructor.hpp:
/local/include/boost/type_traits/is_const.hpp:
/local/include/boost/type_traits/composite_traits.hpp:
/local/include/boost/type_traits/is_array.hpp:
/local/include/boost/type_traits/is_union.hpp:
/local/include/boost/ref.hpp:
/local/include/boost/mpl/if.hpp:
/local/include/boost/mpl/aux_/value_wknd.hpp:
/local/include/boost/mpl/aux_/config/integral.hpp:
/local/include/boost/mpl/aux_/config/eti.hpp:
/local/include/boost/mpl/aux_/na_spec.hpp:
/local/include/boost/mpl/lambda_fwd.hpp:
/local/include/boost/mpl/void_fwd.hpp:
/local/include/boost/mpl/aux_/na.hpp:
/local/include/boost/mpl/aux_/na_fwd.hpp:
/local/include/boost/mpl/aux_/lambda_arity_param.hpp:
/local/include/boost/mpl/aux_/arity.hpp:
/local/include/boost/mpl/aux_/config/dtp.hpp:
/local/include/boost/mpl/aux_/preprocessor/enum.hpp:
/local/include/boost/mpl/aux_/preprocessor/def_params_tail.hpp:
/local/include/boost/mpl/limits/arity.hpp:
/local/include/boost/preprocessor/logical/and.hpp:
/local/include/boost/preprocessor/logical/bitand.hpp:
/local/include/boost/preprocessor/identity.hpp:
/local/include/boost/preprocessor/facilities/identity.hpp:
/local/include/boost/preprocessor/empty.hpp:
/local/include/boost/preprocessor/arithmetic/add.hpp:
/local/include/boost/preprocessor/control/while.hpp:
/local/include/boost/preprocessor/list/fold_left.hpp:
/local/include/boost/preprocessor/list/detail/fold_left.hpp:
/local/include/boost/preprocessor/control/expr_iif.hpp:
/local/include/boost/preprocessor/list/adt.hpp:
/local/include/boost/preprocessor/detail/is_binary.hpp:
/local/include/boost/preprocessor/detail/check.hpp:
/local/include/boost/preprocessor/logical/compl.hpp:
/local/include/boost/preprocessor/list/fold_right.hpp:
/local/include/boost/preprocessor/list/detail/fold_right.hpp:
/local/include/boost/preprocessor/list/reverse.hpp:
/local/include/boost/preprocessor/control/detail/while.hpp:
/local/include/boost/preprocessor/arithmetic/sub.hpp:
/local/include/boost/type_traits/alignment_of.hpp:
/local/include/boost/type_traits/detail/size_t_trait_def.hpp:
/local/include/boost/mpl/size_t.hpp:
/local/include/boost/mpl/size_t_fwd.hpp:
/local/include/boost/type_traits/detail/size_t_trait_undef.hpp:
/local/include/boost/utility/enable_if.hpp:
/local/include/boost/function_equal.hpp:
/local/include/boost/function/function_fwd.hpp:
/local/include/boost/mem_fn.hpp:
/local/include/boost/bind/mem_fn.hpp:
/local/include/boost/get_pointer.hpp:
/local/include/boost/bind/mem_fn_template.hpp:
/local/include/boost/bind/mem_fn_cc.hpp:
/local/include/boost/preprocessor/enum.hpp:
/local/include/boost/preprocessor/repetition/enum.hpp:
/local/include/boost/preprocessor/enum_params.hpp:
/local/include/boost/preprocessor/repetition/enum_params.hpp:
/local/include/boost/preprocessor/iteration/detail/iter/forward1.hpp:
/local/include/boost/preprocessor/iteration/detail/bounds/lower1.hpp:
/local/include/boost/preprocessor/slot/detail/shared.hpp:
/local/include/boost/preprocessor/iteration/detail/bounds/upper1.hpp:
/local/include/boost/function/detail/function_iterate.hpp:
/local/include/boost/function/detail/maybe_include.hpp:
/local/include/boost/function/function_template.hpp:
/local/include/boost/detail/no_exceptions_support.hpp:
/local/caffe/include/caffe/solver_factory.hpp:
/local/caffe/include/caffe/util/benchmark.hpp:
/local/include/boost/date_time/posix_time/posix_time.hpp:
/local/include/boost/date_time/compiler_config.hpp:
/local/include/boost/date_time/locale_config.hpp:
/local/include/boost/config/auto_link.hpp:
/local/include/boost/date_time/posix_time/ptime.hpp:
/local/include/boost/date_time/posix_time/posix_time_system.hpp:
/local/include/boost/date_time/posix_time/posix_time_config.hpp:
/local/include/boost/config/no_tr1/cmath.hpp:
/local/include/boost/date_time/time_duration.hpp:
/local/include/boost/operators.hpp:
/local/include/boost/iterator.hpp:
/local/include/boost/date_time/time_defs.hpp:
/local/include/boost/date_time/special_defs.hpp:
/local/include/boost/date_time/time_resolution_traits.hpp:
/local/include/boost/date_time/int_adapter.hpp:
/local/include/boost/date_time/gregorian/gregorian_types.hpp:
/local/include/boost/date_time/date.hpp:
/local/include/boost/date_time/year_month_day.hpp:
/local/include/boost/date_time/period.hpp:
/local/include/boost/date_time/gregorian/greg_calendar.hpp:
/local/include/boost/date_time/gregorian/greg_weekday.hpp:
/local/include/boost/date_time/constrained_value.hpp:
/local/include/boost/type_traits/is_base_of.hpp:
/local/include/boost/type_traits/is_base_and_derived.hpp:
/local/include/boost/type_traits/is_class.hpp:
/local/include/boost/date_time/date_defs.hpp:
/local/include/boost/date_time/gregorian/greg_day_of_year.hpp:
/local/include/boost/date_time/gregorian_calendar.hpp:
/local/include/boost/date_time/gregorian_calendar.ipp:
/local/include/boost/date_time/gregorian/greg_ymd.hpp:
/local/include/boost/date_time/gregorian/greg_day.hpp:
/local/include/boost/date_time/gregorian/greg_year.hpp:
/local/include/boost/date_time/gregorian/greg_month.hpp:
/local/include/boost/date_time/gregorian/greg_duration.hpp:
/local/include/boost/date_time/date_duration.hpp:
/local/include/boost/date_time/date_duration_types.hpp:
/local/include/boost/date_time/gregorian/greg_duration_types.hpp:
/local/include/boost/date_time/gregorian/greg_date.hpp:
/local/include/boost/date_time/adjust_functors.hpp:
/local/include/boost/date_time/wrapping_int.hpp:
/local/include/boost/date_time/date_generators.hpp:
/local/include/boost/date_time/date_clock_device.hpp:
/local/include/boost/date_time/c_time.hpp:
/local/include/boost/date_time/date_iterator.hpp:
/local/include/boost/date_time/time_system_split.hpp:
/local/include/boost/date_time/time_system_counted.hpp:
/local/include/boost/date_time/time.hpp:
/local/include/boost/date_time/posix_time/date_duration_operators.hpp:
/local/include/boost/date_time/posix_time/time_formatters.hpp:
/local/include/boost/date_time/gregorian/gregorian.hpp:
/local/include/boost/date_time/gregorian/conversion.hpp:
/local/include/boost/date_time/gregorian/formatters.hpp:
/local/include/boost/date_time/date_formatting.hpp:
/local/include/boost/date_time/iso_format.hpp:
/local/include/boost/date_time/parse_format_base.hpp:
/local/include/boost/date_time/date_format_simple.hpp:
/local/include/boost/date_time/gregorian/gregorian_io.hpp:
/local/include/boost/io/ios_state.hpp:
/local/include/boost/io_fwd.hpp:
/local/include/boost/date_time/date_facet.hpp:
/local/include/boost/algorithm/string/replace.hpp:
/local/include/boost/algorithm/string/config.hpp:
/local/include/boost/range/iterator_range.hpp:
/local/include/boost/range/iterator_range_core.hpp:
/local/include/boost/iterator/iterator_traits.hpp:
/local/include/boost/detail/iterator.hpp:
/local/include/boost/iterator/iterator_facade.hpp:
/local/include/boost/iterator/interoperable.hpp:
/local/include/boost/mpl/or.hpp:
/local/include/boost/mpl/aux_/config/use_preprocessed.hpp:
/local/include/boost/mpl/aux_/nested_type_wknd.hpp:
/local/include/boost/mpl/aux_/include_preprocessed.hpp:
/local/include/boost/mpl/aux_/config/compiler.hpp:
/local/include/boost/preprocessor/stringize.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/or.hpp:
/local/include/boost/type_traits/is_convertible.hpp:
/local/include/boost/type_traits/is_abstract.hpp:
/local/include/boost/type_traits/add_lvalue_reference.hpp:
/local/include/boost/type_traits/add_reference.hpp:
/local/include/boost/type_traits/add_rvalue_reference.hpp:
/local/include/boost/type_traits/is_function.hpp:
/local/include/boost/type_traits/detail/false_result.hpp:
/local/include/boost/type_traits/detail/is_function_ptr_helper.hpp:
/local/include/boost/iterator/detail/config_def.hpp:
/local/include/boost/iterator/detail/config_undef.hpp:
/local/include/boost/iterator/detail/facade_iterator_category.hpp:
/local/include/boost/iterator/iterator_categories.hpp:
/local/include/boost/mpl/eval_if.hpp:
/local/include/boost/mpl/identity.hpp:
/local/include/boost/mpl/placeholders.hpp:
/local/include/boost/mpl/arg.hpp:
/local/include/boost/mpl/arg_fwd.hpp:
/local/include/boost/mpl/aux_/na_assert.hpp:
/local/include/boost/mpl/assert.hpp:
/local/include/boost/mpl/not.hpp:
/local/include/boost/mpl/aux_/yes_no.hpp:
/local/include/boost/mpl/aux_/config/arrays.hpp:
/local/include/boost/mpl/aux_/config/pp_counter.hpp:
/local/include/boost/mpl/aux_/arity_spec.hpp:
/local/include/boost/mpl/aux_/arg_typedef.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/arg.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/placeholders.hpp:
/local/include/boost/mpl/and.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/and.hpp:
/local/include/boost/detail/indirect_traits.hpp:
/local/include/boost/type_traits/remove_reference.hpp:
/local/include/boost/type_traits/remove_pointer.hpp:
/local/include/boost/iterator/detail/enable_if.hpp:
/local/include/boost/type_traits/add_const.hpp:
/local/include/boost/type_traits/add_pointer.hpp:
/local/include/boost/type_traits/remove_const.hpp:
/local/include/boost/mpl/always.hpp:
/local/include/boost/mpl/apply.hpp:
/local/include/boost/mpl/apply_fwd.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/apply_fwd.hpp:
/local/include/boost/mpl/apply_wrap.hpp:
/local/include/boost/mpl/aux_/has_apply.hpp:
/local/include/boost/mpl/has_xxx.hpp:
/local/include/boost/mpl/aux_/type_wrapper.hpp:
/local/include/boost/mpl/aux_/config/has_xxx.hpp:
/local/include/boost/mpl/aux_/config/msvc_typename.hpp:
/local/include/boost/preprocessor/repetition/enum_trailing_params.hpp:
/local/include/boost/mpl/aux_/config/has_apply.hpp:
/local/include/boost/mpl/aux_/msvc_never_true.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/apply_wrap.hpp:
/local/include/boost/mpl/lambda.hpp:
/local/include/boost/mpl/bind.hpp:
/local/include/boost/mpl/bind_fwd.hpp:
/local/include/boost/mpl/aux_/config/bind.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/bind_fwd.hpp:
/local/include/boost/mpl/next.hpp:
/local/include/boost/mpl/next_prior.hpp:
/local/include/boost/mpl/aux_/common_name_wknd.hpp:
/local/include/boost/mpl/protect.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/bind.hpp:
/local/include/boost/mpl/aux_/full_lambda.hpp:
/local/include/boost/mpl/quote.hpp:
/local/include/boost/mpl/void.hpp:
/local/include/boost/mpl/aux_/has_type.hpp:
/local/include/boost/mpl/aux_/config/bcc.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/quote.hpp:
/local/include/boost/mpl/aux_/template_arity.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/template_arity.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/full_lambda.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/apply.hpp:
/local/include/boost/range/functions.hpp:
/local/include/boost/range/begin.hpp:
/local/include/boost/range/config.hpp:
/local/include/boost/range/iterator.hpp:
/local/include/boost/range/mutable_iterator.hpp:
/local/include/boost/range/detail/extract_optional_type.hpp:
/local/include/boost/range/const_iterator.hpp:
/local/include/boost/range/end.hpp:
/local/include/boost/range/detail/implementation_help.hpp:
/local/include/boost/range/detail/common.hpp:
/local/include/boost/range/detail/sfinae.hpp:
/local/include/boost/range/size.hpp:
/local/include/boost/range/size_type.hpp:
/local/include/boost/range/difference_type.hpp:
/local/include/boost/type_traits/make_unsigned.hpp:
/local/include/boost/type_traits/is_signed.hpp:
/local/include/boost/type_traits/is_unsigned.hpp:
/local/include/boost/type_traits/add_volatile.hpp:
/local/include/boost/range/distance.hpp:
/local/include/boost/range/empty.hpp:
/local/include/boost/range/rbegin.hpp:
/local/include/boost/range/reverse_iterator.hpp:
/local/include/boost/iterator/reverse_iterator.hpp:
/local/include/boost/next_prior.hpp:
/local/include/boost/iterator/iterator_adaptor.hpp:
/local/include/boost/range/rend.hpp:
/local/include/boost/range/algorithm/equal.hpp:
/local/include/boost/range/concepts.hpp:
/local/include/boost/concept_check.hpp:
/local/include/boost/concept/assert.hpp:
/local/include/boost/concept/detail/general.hpp:
/local/include/boost/concept/detail/backward_compatibility.hpp:
/local/include/boost/concept/detail/has_constraints.hpp:
/local/include/boost/type_traits/conversion_traits.hpp:
/local/include/boost/concept/usage.hpp:
/local/include/boost/concept/detail/concept_def.hpp:
/local/include/boost/preprocessor/seq/for_each_i.hpp:
/local/include/boost/preprocessor/repetition/for.hpp:
/local/include/boost/preprocessor/repetition/detail/for.hpp:
/local/include/boost/preprocessor/seq/seq.hpp:
/local/include/boost/preprocessor/seq/elem.hpp:
/local/include/boost/preprocessor/seq/size.hpp:
/local/include/boost/preprocessor/seq/enum.hpp:
/local/include/boost/concept/detail/concept_undef.hpp:
/local/include/boost/iterator/iterator_concepts.hpp:
/local/include/boost/range/value_type.hpp:
/local/include/boost/range/detail/misc_concept.hpp:
/local/include/boost/range/detail/safe_bool.hpp:
/local/include/boost/range/iterator_range_io.hpp:
/local/include/boost/algorithm/string/find_format.hpp:
/local/include/boost/range/as_literal.hpp:
/local/include/boost/range/detail/str_types.hpp:
/local/include/boost/algorithm/string/concept.hpp:
/local/include/boost/algorithm/string/detail/find_format.hpp:
/local/include/boost/algorithm/string/detail/find_format_store.hpp:
/local/include/boost/algorithm/string/detail/replace_storage.hpp:
/local/include/boost/algorithm/string/sequence_traits.hpp:
/local/include/boost/algorithm/string/yes_no_type.hpp:
/local/include/boost/algorithm/string/detail/sequence.hpp:
/local/include/boost/mpl/logical.hpp:
/local/include/boost/algorithm/string/detail/find_format_all.hpp:
/local/include/boost/algorithm/string/finder.hpp:
/local/include/boost/algorithm/string/constants.hpp:
/local/include/boost/algorithm/string/detail/finder.hpp:
/local/include/boost/algorithm/string/compare.hpp:
/local/include/boost/algorithm/string/formatter.hpp:
/local/include/boost/algorithm/string/detail/formatter.hpp:
/local/include/boost/algorithm/string/detail/util.hpp:
/local/include/boost/date_time/special_values_formatter.hpp:
/local/include/boost/date_time/period_formatter.hpp:
/local/include/boost/date_time/period_parser.hpp:
/local/include/boost/date_time/string_parse_tree.hpp:
/local/include/boost/lexical_cast.hpp:
/local/include/boost/detail/lcast_precision.hpp:
/local/include/boost/array.hpp:
/local/include/boost/swap.hpp:
/local/include/boost/utility/swap.hpp:
/local/include/boost/functional/hash_fwd.hpp:
/local/include/boost/functional/hash/hash_fwd.hpp:
/local/include/boost/numeric/conversion/cast.hpp:
/local/include/boost/type.hpp:
/local/include/boost/numeric/conversion/converter.hpp:
/local/include/boost/numeric/conversion/conversion_traits.hpp:
/local/include/boost/numeric/conversion/detail/conversion_traits.hpp:
/local/include/boost/numeric/conversion/detail/meta.hpp:
/local/include/boost/mpl/equal_to.hpp:
/local/include/boost/mpl/aux_/comparison_op.hpp:
/local/include/boost/mpl/aux_/numeric_op.hpp:
/local/include/boost/mpl/numeric_cast.hpp:
/local/include/boost/mpl/tag.hpp:
/local/include/boost/mpl/aux_/has_tag.hpp:
/local/include/boost/mpl/aux_/numeric_cast_utils.hpp:
/local/include/boost/mpl/aux_/config/forwarding.hpp:
/local/include/boost/mpl/aux_/msvc_eti_base.hpp:
/local/include/boost/mpl/aux_/is_msvc_eti_arg.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/equal_to.hpp:
/local/include/boost/numeric/conversion/detail/int_float_mixture.hpp:
/local/include/boost/numeric/conversion/int_float_mixture_enum.hpp:
/local/include/boost/numeric/conversion/detail/sign_mixture.hpp:
/local/include/boost/numeric/conversion/sign_mixture_enum.hpp:
/local/include/boost/numeric/conversion/detail/udt_builtin_mixture.hpp:
/local/include/boost/numeric/conversion/udt_builtin_mixture_enum.hpp:
/local/include/boost/numeric/conversion/detail/is_subranged.hpp:
/local/include/boost/mpl/multiplies.hpp:
/local/include/boost/mpl/times.hpp:
/local/include/boost/mpl/aux_/arithmetic_op.hpp:
/local/include/boost/mpl/aux_/largest_int.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/times.hpp:
/local/include/boost/mpl/aux_/preprocessor/default_params.hpp:
/local/include/boost/mpl/less.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/less.hpp:
/local/include/boost/numeric/conversion/converter_policies.hpp:
/local/include/boost/numeric/conversion/detail/converter.hpp:
/local/include/boost/numeric/conversion/bounds.hpp:
/local/include/boost/numeric/conversion/detail/bounds.hpp:
/local/include/boost/numeric/conversion/numeric_cast_traits.hpp:
/local/include/boost/numeric/conversion/detail/numeric_cast_traits.hpp:
/local/include/boost/numeric/conversion/detail/preprocessed/numeric_cast_traits_common.hpp:
/local/include/boost/numeric/conversion/detail/preprocessed/numeric_cast_traits_long_long.hpp:
/local/include/boost/type_traits/has_left_shift.hpp:
/local/include/boost/type_traits/detail/has_binary_operator.hpp:
/local/include/boost/type_traits/is_fundamental.hpp:
/local/include/boost/type_traits/has_right_shift.hpp:
/local/include/boost/math/special_functions/sign.hpp:
/local/include/boost/math/tools/config.hpp:
/local/include/boost/math/tools/user.hpp:
/local/include/boost/math/special_functions/detail/round_fwd.hpp:
/local/include/boost/detail/fenv.hpp:
/local/include/boost/math/special_functions/math_fwd.hpp:
/local/include/boost/math/tools/promotion.hpp:
/local/include/boost/type_traits/is_floating_point.hpp:
/local/include/boost/math/policies/policy.hpp:
/local/include/boost/mpl/list.hpp:
/local/include/boost/mpl/limits/list.hpp:
/local/include/boost/mpl/list/list20.hpp:
/local/include/boost/mpl/list/list10.hpp:
/local/include/boost/mpl/list/list0.hpp:
/local/include/boost/mpl/long.hpp:
/local/include/boost/mpl/long_fwd.hpp:
/local/include/boost/mpl/list/aux_/push_front.hpp:
/local/include/boost/mpl/push_front_fwd.hpp:
/local/include/boost/mpl/list/aux_/item.hpp:
/local/include/boost/mpl/list/aux_/tag.hpp:
/local/include/boost/mpl/list/aux_/pop_front.hpp:
/local/include/boost/mpl/pop_front_fwd.hpp:
/local/include/boost/mpl/list/aux_/push_back.hpp:
/local/include/boost/mpl/push_back_fwd.hpp:
/local/include/boost/mpl/list/aux_/front.hpp:
/local/include/boost/mpl/front_fwd.hpp:
/local/include/boost/mpl/list/aux_/clear.hpp:
/local/include/boost/mpl/clear_fwd.hpp:
/local/include/boost/mpl/list/aux_/O1_size.hpp:
/local/include/boost/mpl/O1_size_fwd.hpp:
/local/include/boost/mpl/list/aux_/size.hpp:
/local/include/boost/mpl/size_fwd.hpp:
/local/include/boost/mpl/list/aux_/empty.hpp:
/local/include/boost/mpl/empty_fwd.hpp:
/local/include/boost/mpl/list/aux_/begin_end.hpp:
/local/include/boost/mpl/begin_end_fwd.hpp:
/local/include/boost/mpl/list/aux_/iterator.hpp:
/local/include/boost/mpl/iterator_tags.hpp:
/local/include/boost/mpl/deref.hpp:
/local/include/boost/mpl/aux_/msvc_type.hpp:
/local/include/boost/mpl/aux_/lambda_spec.hpp:
/local/include/boost/mpl/list/aux_/include_preprocessed.hpp:
/local/include/boost/mpl/list/aux_/preprocessed/plain/list10.hpp:
/local/include/boost/mpl/list/aux_/preprocessed/plain/list20.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/list.hpp:
/local/include/boost/mpl/contains.hpp:
/local/include/boost/mpl/contains_fwd.hpp:
/local/include/boost/mpl/sequence_tag.hpp:
/local/include/boost/mpl/sequence_tag_fwd.hpp:
/local/include/boost/mpl/aux_/has_begin.hpp:
/local/include/boost/mpl/aux_/contains_impl.hpp:
/local/include/boost/mpl/begin_end.hpp:
/local/include/boost/mpl/aux_/begin_end_impl.hpp:
/local/include/boost/mpl/aux_/traits_lambda_spec.hpp:
/local/include/boost/mpl/find.hpp:
/local/include/boost/mpl/find_if.hpp:
/local/include/boost/mpl/aux_/find_if_pred.hpp:
/local/include/boost/mpl/aux_/iter_apply.hpp:
/local/include/boost/mpl/iter_fold_if.hpp:
/local/include/boost/mpl/pair.hpp:
/local/include/boost/mpl/aux_/iter_fold_if_impl.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/iter_fold_if_impl.hpp:
/local/include/boost/mpl/same_as.hpp:
/local/include/boost/mpl/remove_if.hpp:
/local/include/boost/mpl/fold.hpp:
/local/include/boost/mpl/O1_size.hpp:
/local/include/boost/mpl/aux_/O1_size_impl.hpp:
/local/include/boost/mpl/aux_/has_size.hpp:
/local/include/boost/mpl/aux_/fold_impl.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/fold_impl.hpp:
/local/include/boost/mpl/reverse_fold.hpp:
/local/include/boost/mpl/aux_/reverse_fold_impl.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/reverse_fold_impl.hpp:
/local/include/boost/mpl/aux_/inserter_algorithm.hpp:
/local/include/boost/mpl/back_inserter.hpp:
/local/include/boost/mpl/push_back.hpp:
/local/include/boost/mpl/aux_/push_back_impl.hpp:
/local/include/boost/mpl/inserter.hpp:
/local/include/boost/mpl/front_inserter.hpp:
/local/include/boost/mpl/push_front.hpp:
/local/include/boost/mpl/aux_/push_front_impl.hpp:
/local/include/boost/mpl/clear.hpp:
/local/include/boost/mpl/aux_/clear_impl.hpp:
/local/include/boost/mpl/vector.hpp:
/local/include/boost/mpl/limits/vector.hpp:
/local/include/boost/mpl/vector/vector20.hpp:
/local/include/boost/mpl/vector/vector10.hpp:
/local/include/boost/mpl/vector/vector0.hpp:
/local/include/boost/mpl/vector/aux_/at.hpp:
/local/include/boost/mpl/at_fwd.hpp:
/local/include/boost/mpl/vector/aux_/tag.hpp:
/local/include/boost/mpl/aux_/config/typeof.hpp:
/local/include/boost/mpl/vector/aux_/front.hpp:
/local/include/boost/mpl/vector/aux_/push_front.hpp:
/local/include/boost/mpl/vector/aux_/item.hpp:
/local/include/boost/mpl/vector/aux_/pop_front.hpp:
/local/include/boost/mpl/vector/aux_/push_back.hpp:
/local/include/boost/mpl/vector/aux_/pop_back.hpp:
/local/include/boost/mpl/pop_back_fwd.hpp:
/local/include/boost/mpl/vector/aux_/back.hpp:
/local/include/boost/mpl/back_fwd.hpp:
/local/include/boost/mpl/vector/aux_/clear.hpp:
/local/include/boost/mpl/vector/aux_/vector0.hpp:
/local/include/boost/mpl/vector/aux_/iterator.hpp:
/local/include/boost/mpl/plus.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/plus.hpp:
/local/include/boost/mpl/minus.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/minus.hpp:
/local/include/boost/mpl/advance_fwd.hpp:
/local/include/boost/mpl/distance_fwd.hpp:
/local/include/boost/mpl/prior.hpp:
/local/include/boost/mpl/vector/aux_/O1_size.hpp:
/local/include/boost/mpl/vector/aux_/size.hpp:
/local/include/boost/mpl/vector/aux_/empty.hpp:
/local/include/boost/mpl/vector/aux_/begin_end.hpp:
/local/include/boost/mpl/vector/aux_/include_preprocessed.hpp:
/local/include/boost/mpl/vector/aux_/preprocessed/typeof_based/vector10.hpp:
/local/include/boost/mpl/vector/aux_/preprocessed/typeof_based/vector20.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/vector.hpp:
/local/include/boost/mpl/at.hpp:
/local/include/boost/mpl/aux_/at_impl.hpp:
/local/include/boost/mpl/advance.hpp:
/local/include/boost/mpl/negate.hpp:
/local/include/boost/mpl/aux_/advance_forward.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/advance_forward.hpp:
/local/include/boost/mpl/aux_/advance_backward.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/advance_backward.hpp:
/local/include/boost/mpl/size.hpp:
/local/include/boost/mpl/aux_/size_impl.hpp:
/local/include/boost/mpl/distance.hpp:
/local/include/boost/mpl/iter_fold.hpp:
/local/include/boost/mpl/aux_/iter_fold_impl.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/iter_fold_impl.hpp:
/local/include/boost/mpl/iterator_range.hpp:
/local/include/boost/mpl/comparison.hpp:
/local/include/boost/mpl/not_equal_to.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/not_equal_to.hpp:
/local/include/boost/mpl/greater.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/greater.hpp:
/local/include/boost/mpl/less_equal.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/less_equal.hpp:
/local/include/boost/mpl/greater_equal.hpp:
/local/include/boost/mpl/aux_/preprocessed/gcc/greater_equal.hpp:
/local/include/boost/config/no_tr1/complex.hpp:
/local/include/boost/math/special_functions/detail/fp_traits.hpp:
/local/include/boost/detail/endian.hpp:
/local/include/boost/math/special_functions/fpclassify.hpp:
/local/include/boost/math/tools/real_cast.hpp:
/local/include/boost/container/container_fwd.hpp:
/local/include/boost/algorithm/string/case_conv.hpp:
/local/include/boost/iterator/transform_iterator.hpp:
/local/include/boost/type_traits/function_traits.hpp:
/local/include/boost/utility/result_of.hpp:
/local/include/boost/preprocessor/repetition/enum_binary_params.hpp:
/local/include/boost/preprocessor/repetition/enum_shifted_params.hpp:
/local/include/boost/preprocessor/facilities/intercept.hpp:
/local/include/boost/utility/declval.hpp:
/local/include/boost/utility/detail/result_of_iterate.hpp:
/local/include/boost/algorithm/string/detail/case_conv.hpp:
/local/include/boost/date_time/string_convert.hpp:
/local/include/boost/date_time/date_generator_formatter.hpp:
/local/include/boost/date_time/date_generator_parser.hpp:
/local/include/boost/date_time/format_date_parser.hpp:
/local/include/boost/date_time/strings_from_facet.hpp:
/local/include/boost/date_time/special_values_parser.hpp:
/local/include/boost/date_time/gregorian/parsers.hpp:
/local/include/boost/date_time/date_parsing.hpp:
/local/include/boost/tokenizer.hpp:
/local/include/boost/token_iterator.hpp:
/local/include/boost/iterator/detail/minimum_category.hpp:
/local/include/boost/token_functions.hpp:
/local/include/boost/date_time/posix_time/posix_time_types.hpp:
/local/include/boost/date_time/time_clock.hpp:
/local/include/boost/date_time/microsec_time_clock.hpp:
/local/include/boost/date_time/filetime_functions.hpp:
/local/include/boost/date_time/posix_time/posix_time_duration.hpp:
/local/include/boost/date_time/posix_time/time_period.hpp:
/local/include/boost/date_time/time_iterator.hpp:
/local/include/boost/date_time/dst_rules.hpp:
/local/include/boost/date_time/time_formatting_streams.hpp:
/local/include/boost/date_time/date_formatting_locales.hpp:
/local/include/boost/date_time/date_names_put.hpp:
/local/include/boost/date_time/time_parsing.hpp:
/local/include/boost/date_time/posix_time/posix_time_io.hpp:
/local/include/boost/date_time/time_facet.hpp:
/local/include/boost/algorithm/string/erase.hpp:
/local/include/boost/date_time/posix_time/conversion.hpp:
/local/include/boost/date_time/posix_time/time_parsers.hpp:
/local/caffe/include/caffe/util/io.hpp:
/local/include/boost/filesystem.hpp:
/local/include/boost/filesystem/config.hpp:
/local/include/boost/system/api_config.hpp:
/local/include/boost/filesystem/path.hpp:
/local/include/boost/filesystem/path_traits.hpp:
/local/include/boost/type_traits/decay.hpp:
/local/include/boost/type_traits/remove_bounds.hpp:
/local/include/boost/system/error_code.hpp:
/local/include/boost/system/config.hpp:
/local/include/boost/noncopyable.hpp:
/local/include/boost/cerrno.hpp:
/local/include/boost/config/abi_prefix.hpp:
/local/include/boost/config/abi_suffix.hpp:
/local/include/boost/system/system_error.hpp:
/local/include/boost/io/detail/quoted_manip.hpp:
/local/include/boost/filesystem/operations.hpp:
/local/include/boost/detail/scoped_enum_emulation.hpp:
/local/include/boost/detail/bitmask.hpp:
/local/include/boost/filesystem/convenience.hpp:
/local/caffe/include/caffe/util/format.hpp:
/local/caffe/include/caffe/util/upgrade_proto.hpp:
