# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := opencvIF
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=opencvIF' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
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
	-D HASCAFFE=$(HASCAFFE) \
	-D HASGPU=$(HASGPU) \
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
	-I$(INCLUDE)/opencv \
	-I$(INCLUDE)/cuda \
	-I$(CAFFE)/build/src \
	-I$(CAFFE)/include \
	-I$(INCLUDE)/atlas \
	-I/local/service/atomic/ifs/opencv/node_modules/node-addon-api

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=opencvIF' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
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
	-D HASCAFFE=$(HASCAFFE) \
	-D HASGPU=$(HASGPU) \
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
	-I$(INCLUDE)/opencv \
	-I$(INCLUDE)/cuda \
	-I$(CAFFE)/build/src \
	-I$(CAFFE)/include \
	-I$(INCLUDE)/atlas \
	-I/local/service/atomic/ifs/opencv/node_modules/node-addon-api

OBJS := \
	$(obj).target/$(TARGET)/opencvIF.o

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
	$(LIB)/opencv/libopencv_calib3d.so \
	$(LIB)/opencv/libopencv_core.so \
	$(LIB)/opencv/libopencv_features2d.so \
	$(LIB)/opencv/libopencv_flann.so \
	$(LIB)/opencv/libopencv_highgui.so \
	$(LIB)/opencv/libopencv_imgproc.so \
	$(LIB)/opencv/libopencv_ml.so \
	$(LIB)/opencv/libopencv_objdetect.so \
	$(LIB)/opencv/libopencv_photo.so \
	$(LIB)/opencv/libopencv_stitching.so \
	$(LIB)/opencv/libopencv_video.so

$(obj).target/opencvIF.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/opencvIF.node: LIBS := $(LIBS)
$(obj).target/opencvIF.node: TOOLSET := $(TOOLSET)
$(obj).target/opencvIF.node: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(obj).target/opencvIF.node
# Add target alias
.PHONY: opencvIF
opencvIF: $(builddir)/opencvIF.node

# Copy this to the executable output path.
$(builddir)/opencvIF.node: TOOLSET := $(TOOLSET)
$(builddir)/opencvIF.node: $(obj).target/opencvIF.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/opencvIF.node
# Short alias for building this executable.
.PHONY: opencvIF.node
opencvIF.node: $(obj).target/opencvIF.node $(builddir)/opencvIF.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/opencvIF.node

