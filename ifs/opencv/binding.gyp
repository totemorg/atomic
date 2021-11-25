# This node-gyp binding file is used to generate the tau Machines "build/Release/tauIF.node" 
# from "src/tauIF.cc".  tauIF is a node.js package to interface a node.js Express server (e.g.
# "sigma") with the tau Simulator "sigmaApps/clients/sigma". A "tau" represents an event token 
# that the tau simulator pushes to its systems.  tauIF prepares 8 tau machines (tauMachine0 - 
# tauMachine7) that accept and supply an arbitrary number of tau interface port compatible
# with the tau Simulator client.
#
# Generate this tau interface with "node-gyp rebuild".  Ignore "deprecated conversion" warning
# messages.  Test the tau Machines provided by tauIF using the supplied "node testIF.js".  By
# using the opencv libraries provided in this binding, we override the default tauMachine0 with
# the opencv tau machine "sigmaApps/opencv2".
#
# Edit this file with gedit (do not use geany - it embeds characters that cause Phyton to go bezerk).
#
# Tested with 
#	Python 2.6.6 and node-gyp v0.12.2.
#	Python 2.7 and node-gyp v5.5.
#

{
	"targets": [{
		"target_name": "opencvIF",
		
		#"type": "<(library)",
		
		"include_dirs": [
			".",
			"../mac",
			"$(INCLUDE)/opencv",
			"$(INCLUDE)/cuda",
			"$(CAFFE)/build/src",
			"$(CAFFE)/include",
			"$(INCLUDE)/atlas",
			#"$(INCLUDE)",
			
			#"$(CV)/include",
			#"$(CAFFE)/include",
			#"$(CAFFE)/build/src",
			#"$(CUDA)/include",
			#"$(ATLAS)/include",
			"<!@(node -p \"require('node-addon-api').include\")"    # has to be last
		],
		
		"sources": [
			"opencvIF.cpp"
		],
		
		"libraries": [
			# caffe shared libs (others must be placed on LD_LIBRARY_PATH)

			##>> Manually uncomment if HASCAFFE=1 (need to make a test for this)
			##>> "$(CAFFE)/build/lib/libcaffe.so",

			# opencv shared libs

			#"$(CV)/lib/libopencv_Features.so",
			#"$(CV)/lib/libopencv_contrib.so",
			#"$(CV)/lib/libopencv_gpu.so",
			#"$(CV)/lib/libopencv_legacy.so",
			#"$(CV)/lib/libopencv_nonfree.so",
			#"$(CV)/lib/libopencv_ocl.so",
			
			#"$(CV)/lib/libopencv_calib3d.so",	
			#"$(CV)/lib/libopencv_core.so",
			#"$(CV)/lib/libopencv_features2d.so",
			#"$(CV)/lib/libopencv_flann.so",
			#"$(CV)/lib/libopencv_highgui.so",
			#"$(CV)/lib/libopencv_imgproc.so",
			#"$(CV)/lib/libopencv_ml.so",
			#"$(CV)/lib/libopencv_objdetect.so",
			#"$(CV)/lib/libopencv_photo.so",
			#"$(CV)/lib/libopencv_stitching.so",
			#"$(CV)/lib/libopencv_superres.so",
			#"$(CV)/lib/libopencv_video.so",
			#"$(CV)/lib/libopencv_videostab.so"

			"$(LIB)/opencv/libopencv_calib3d.so",	
			"$(LIB)/opencv/libopencv_core.so",
			"$(LIB)/opencv/libopencv_features2d.so",
			"$(LIB)/opencv/libopencv_flann.so",
			"$(LIB)/opencv/libopencv_highgui.so",
			"$(LIB)/opencv/libopencv_imgproc.so",
			"$(LIB)/opencv/libopencv_ml.so",
			"$(LIB)/opencv/libopencv_objdetect.so",
			"$(LIB)/opencv/libopencv_photo.so",
			"$(LIB)/opencv/libopencv_stitching.so",
			#"$(LIB)/opencv/libopencv_superres.so",
			"$(LIB)/opencv/libopencv_video.so",
			#"$(LIB)/opencv/libopencv_videostab.so",
			
			"$(LIB)/conda/libjpeg.so"
		],

		"define": [   # caffe make options needed (place in defines?)
			# "CPU_ONLY",
			"USE_CUDNN",
			"USE_OPENCV",
			"USE_LEVELDB"
			# "USE_LMDB"
			# "ALLOW_LMDB_NOLOCK",
		],

		#"conditions": [   # add gcc flags for boost
		#	[ 'OS=="linux"' , {
		#		"cflags_cc+": ["-fexceptions"]
		#	}]
		#],
		
		"cflags_cc+": [   # add gcc flags for opencvIF conditional GPU support
			"-D HASCAFFE=$(HASCAFFE)",
			"-D HASGPU=$(HASGPU)",
			"-fno-exceptions"
		],
		
		"cflags_cc!": [  # remove gcc no-rtti for opencv3.x
			"-fno-rtti" ,
			"-fno-exceptions" 
		],
		
		"defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
		
	}]
}
