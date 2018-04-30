#!/bin/bash
# UNCLASSIFIED when IP addresses and passwords are undefined

export HERE=`pwd`

# OpenCV
export CV=$BASE/opencv
export PATH=$PATH:$INCLUDE/opencv:$BASE/opencv/bin
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/opencv

# To use python2.7 under anaconda

# make sure Python2.6 SQL connector was copied to $CONDA/lib/python2.7/site-packages/mysql/connector

# Anaconda suite
export CONDA=$BASE/anaconda
export PYLINK=$CONDA
export PYTHON=$CONDA/bin/python2.7
export PYTHONHOME=$CONDA
export PYTHONPATH=$CAFFE/python:$PYTHON/:$PYTHON/site-packages
#export PYTHONORIGIN=/usr
export PATH=$CONDA/bin:$INCLUDE/python:$PATH
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/python

# Engines
export ENGINES=$SRV/atomic/ifs
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ENGINES/python/build/Release:$ENGINES/opencv/build/Release:$ENGINES/mac/build/Release
#export JOBS=$HERE/jobs
#export PATH=$PATH:/usr/lib/qt-3.3/bin:$OPENCV/bin

#export PATH=$INCLUDE:$PATH

# boost etc
#export BOOST=$BASE/boost
#export PATH=$PATH:$INCLUDE/boost
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/boost

#export GFLAGS=$BASE/gflags
#export PATH=$PATH:$INCLUDE/gflags
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/gflags

#export GLOG=$BASE/glog
#export PATH=$PATH:$INCLUDE/glog
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/glog

#export LMDB=$BASE/lmdb
#export PATH=$PATH:$INCLUDE/lmdb
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/lmdb

#export LEVELDB=$BASE/leveldb
#export PATH=$PATH:$INCLUDE/leveldb
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/leveldb

#export HDF5=$BASE/hdf5
#export PATH=$PATH:$INCLUDE/hdf5
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/hdf5

# atlas and blas
#export ATLAS=$BASE/atlas
#export PATH=$PATH:$INCLUDE/atlas

# cuda-caffe
export CUDA=$BASE/cuda
#export DNN=$BASE/cuDNN/cuda
export CAFFE=$BASE/caffe
#export PATH=$PATH:$CUDA/bin:$DNN/include
#export PATH=$PATH:$INCLUDE/cuda:$INCLUDE/cuDNN:$INCLUDE/caffe:$INCLUDE/protobuf

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIB/cuda:$LIB/cuDNN:$LIB/caffe:$LIB/protobuf
#export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CUDA/lib64:$DNN/lib64:$CAFFE/lib

# required for node-gyp caffe binding
#export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CAFFE/build/lib:$DNN/lib64:$CONDA/lib

#python sql access
#export DB_PASS=$MYSQL_PASS
#export DB_USER=$MYSQL_USER
#export DB_NAME=$MYSQL_NAME
#export DB_HOST=$MYSQL_HOST

# engine compile switches
if [ "`hostname`" == "$GPUHOST" ]; then
	export HASGPU=1
	export HASCAFFE=1
else
	export HASGPU=0
	export HASCAFFE=0
fi

# UNCLASSIFIED when IP addresses and passwords are undefined
