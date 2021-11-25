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
		"target_name": "RIF",
		
		#"type": "<(library)",
		
		"include_dirs": [
			".",
			"../mac",
			"$(INCLUDE)/R/RInside",
			"$(INCLUDE)/R/Rcpp",
			#"$(INCLUDE)/R/RcppArmadillo",
			"$(INCLUDE)/R/R",
			"<!@(node -p \"require('node-addon-api').include\")"    # has to be last
		],
		
		"sources": [
			"RIF.cpp"
		],
		
		"libraries": [
			"$(LIB)/R/R/libRblas.so",
			#"$(LIB)/R/R/libRlapack.so",
			#"$(LIB)/R/R/libRrefblas.so",
			"$(LIB)/R/R/libR.so",
			"$(LIB)/R/RInside/RInside.so",
			#"$(LIB)/R/Rcpp/Rcpp.so"
		],

		"define": [   # caffe make options needed (place in defines?)
		],

		"cflags_cc!": [  # remove gcc no-rtti for opencv3.x
			"-fno-rtti" ,
			"-fno-exceptions" 
		],
		
		"defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
		
	}]
}
