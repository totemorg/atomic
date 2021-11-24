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
		"cflags!": [ "-fno-exceptions" ],
		"cflags_cc!": [ "-fno-exceptions" ],
		'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
	  
		"target_name": "pythonIF",
		#"type": "<(library)",
		"include_dirs": [
			".",
			"../mac",
			#"$(CONDA)/include/python2.7",
			"$(PYTHONINC)",
			"<!@(node -p \"require('node-addon-api').include\")"    # has to be last
		],
		"sources": [
			"pythonIF.cpp"
		],
		"libraries": [
			#"$(CONDA)/lib/libpython2.7.so"
			#$(LIB)/python/libpython2.7.so"
			"$(PYTHONLIB)"
		]	
	}]
}



