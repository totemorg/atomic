# This node-gyp binding file is used to generate the mac Machines "build/Release/macIF.node" 
# from "src/macIF.cc".  macIF is a node.js package to interface a node.js Express server (e.g.
# "sigma") with the mac Simulator "sigmaApps/clients/sigma". A "mac" represents an event token 
# that the mac simulator pushes to its systems.  macIF prepares 8 mac machines (macMachine0 - 
# macMachine7) that accept and supply an arbitrary number of mac interface port compatible
# with the mac Simulator client.
#
# Generate this mac interface with "node-gyp rebuild".  Ignore "deprecated conversion" warning
# messages.  Test the mac Machines provided by macIF using the supplied "node testIF.js".  By
# using the opencv libraries provided in this binding, we override the default macMachine0 with
# the opencv mac machine "sigmaApps/opencv2".
#
# Edit this file with gedit (do not use geany - it embeds characters that cause Phyton to go bezerk).
#
# Tested with 
#	Python 2.6.6 and node-gyp v0.12.2.
#	Python 2.7 and node-gyp v5.5.
#

{
	"targets": [{
		"target_name": "macIF",
		"include_dirs": [
			#"$(CV)/include",
			"."
		],
		"type": "<(library)",
		"sources": [
			"macIF.cpp"
		]

	}]
}



