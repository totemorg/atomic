cmd_Release/obj.target/opencvIF.so := g++ -shared -pthread -rdynamic -m64  -Wl,-soname=opencvIF.so -o Release/obj.target/opencvIF.so -Wl,--whole-archive ./Release/obj.target/opencvIF/opencvIF.o -Wl,--no-whole-archive /local/caffe/build/lib/libcaffe.so /local/lib64/opencv/libopencv_calib3d.so /local/lib64/opencv/libopencv_core.so /local/lib64/opencv/libopencv_features2d.so /local/lib64/opencv/libopencv_flann.so /local/lib64/opencv/libopencv_highgui.so /local/lib64/opencv/libopencv_imgproc.so /local/lib64/opencv/libopencv_ml.so /local/lib64/opencv/libopencv_objdetect.so /local/lib64/opencv/libopencv_photo.so /local/lib64/opencv/libopencv_stitching.so /local/lib64/opencv/libopencv_superres.so /local/lib64/opencv/libopencv_video.so /local/lib64/opencv/libopencv_videostab.so
