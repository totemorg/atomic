# This node-gyp binding file is used to generate the tau Machines "build/Release/engineIF.node" 
# from "src/engineIF.cc".  engineIF is a node.js package to interface a node.js Express server (e.g.
# "sigma") with the tau Simulator "sigmaApps/clients/sigma". A "tau" represents an event token 
# that the tau simulator pushes to its systems.  engineIF prepares 8 tau machines (tauMachine0 - 
# tauMachine7) that accept and supply an arbitrary number of tau interface port compatible
# with the tau Simulator client.
#
# Generate this tau interface with "node-gyp rebuild".  Ignore "deprecated conversion" warning
# messages.  Test the tau Machines provided by engineIF using the supplied "node testIF.js".  By
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
		"target_name": "engineIF",
		"include_dirs": [
			"./mac",
			"."
		],
		"sources": [
			"engineIF.cpp"
		],
		"libraries": [
			# ENGINES shared libs
			
			"$(ENGINES)/opencv/build/Release/opencvIF.so",
			"$(ENGINES)/python/build/Release/pythonIF.so",
			"$(ENGINES)/mac/build/Release/macIF.so",

			# python shared libs
			
			#"$(PYLINK)/lib/libpython2.7.so",
			
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
		]
	}]
}
