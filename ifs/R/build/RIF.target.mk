# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := RIF
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=RIF' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DNAPI_DISABLE_CPP_EXCEPTIONS' \
	'-DBUILDING_NODE_EXTENSION' \
	'-DDEBUG' \
	'-D_DEBUG' \
	'-DV8_ENABLE_CHECKS'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-m64 \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-std=gnu++1y

INCS_Debug := \
	-I/local/nodejs/include/node \
	-I/local/nodejs/src \
	-I/local/nodejs/deps/openssl/config \
	-I/local/nodejs/deps/openssl/openssl/include \
	-I/local/nodejs/deps/uv/include \
	-I/local/nodejs/deps/zlib \
	-I/local/nodejs/deps/v8/include \
	-I$(srcdir)/. \
	-I$(srcdir)/../mac \
	-I$(INCLUDE)/R/RInside \
	-I$(INCLUDE)/R/Rcpp \
	-I$(INCLUDE)/R/R \
	-I/local/service/atomic/ifs/R/node_modules/node-addon-api

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=RIF' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DNAPI_DISABLE_CPP_EXCEPTIONS' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-m64 \
	-O3 \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-std=gnu++1y

INCS_Release := \
	-I/local/nodejs/include/node \
	-I/local/nodejs/src \
	-I/local/nodejs/deps/openssl/config \
	-I/local/nodejs/deps/openssl/openssl/include \
	-I/local/nodejs/deps/uv/include \
	-I/local/nodejs/deps/zlib \
	-I/local/nodejs/deps/v8/include \
	-I$(srcdir)/. \
	-I$(srcdir)/../mac \
	-I$(INCLUDE)/R/RInside \
	-I$(INCLUDE)/R/Rcpp \
	-I$(INCLUDE)/R/R \
	-I/local/service/atomic/ifs/R/node_modules/node-addon-api

OBJS := \
	$(obj).target/$(TARGET)/RIF.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic \
	-m64

LDFLAGS_Release := \
	-pthread \
	-rdynamic \
	-m64

LIBS := \
	$(LIB)/R/R/libRblas.so \
	$(LIB)/R/R/libR.so \
	$(LIB)/R/RInside/RInside.so

$(obj).target/RIF.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/RIF.node: LIBS := $(LIBS)
$(obj).target/RIF.node: TOOLSET := $(TOOLSET)
$(obj).target/RIF.node: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(obj).target/RIF.node
# Add target alias
.PHONY: RIF
RIF: $(builddir)/RIF.node

# Copy this to the executable output path.
$(builddir)/RIF.node: TOOLSET := $(TOOLSET)
$(builddir)/RIF.node: $(obj).target/RIF.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/RIF.node
# Short alias for building this executable.
.PHONY: RIF.node
RIF.node: $(obj).target/RIF.node $(builddir)/RIF.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/RIF.node

