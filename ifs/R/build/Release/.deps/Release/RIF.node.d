cmd_Release/RIF.node := ln -f "Release/obj.target/RIF.node" "Release/RIF.node" 2>/dev/null || (rm -rf "Release/RIF.node" && cp -af "Release/obj.target/RIF.node" "Release/RIF.node")
