cmd_Release/opencvIF.node := ln -f "Release/obj.target/opencvIF.node" "Release/opencvIF.node" 2>/dev/null || (rm -rf "Release/opencvIF.node" && cp -af "Release/obj.target/opencvIF.node" "Release/opencvIF.node")
