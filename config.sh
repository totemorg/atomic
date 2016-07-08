#!/bin/bash
# UNCLASSIFIED when IP addresses and passwords are undefined

export node_path=./node_modules
export HERE=`pwd`

# Anaconda suite
export CONDA=$BASE/anaconda

# OpenCV
export CV=$BASE/opencv
export PATH=$PATH:$CV/include
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CV/lib

# To use python2.7 under anaconda

# make sure Python2.6 SQL connector was copied to $CONDA/lib/python2.7/site-packages/mysql/connector

export PYLINK=$CONDA

export PYTHON=$CONDA/bin/python2.7
export PYTHONHOME=$CONDA
export PYTHONPATH=$HERE/public/py:$CAFFE/python:$PYTHON/:$PYTHON/site-packages
#export PYTHONORIGIN=/usr
export PATH=$PATH:$CONDA/bin
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CONDA/lib

# Engines
export ENGINES=$HERE/engines
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ENGINES/python/build/Release:$ENGINES/opencv/build/Release:$ENGINES/mac/build/Release
export PATH=$PATH:/usr/lib/qt-3.3/bin:$CV/bin
export JOBS=$HERE/jobs

# boost etc
export BOOST=/usr
export PATH=$PATH:$BOOST/include
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$BOOST/lib64

# atlas blas
export ATLAS=$BASE/atlas
export PATH=$PATH:$ATLAS/include

# cuda-caffe
export CUDA=$BASE/cuda
export DNN=$BASE/cuDNN/cuda
export CAFFE=$BASE/caffe
export PATH=$PATH:$CUDA/bin:$DNN/include
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CUDA/lib64:$DNN/lib64:$CAFFE/lib
# required for node-gyp caffe binding
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CAFFE/build/lib:$DNN/lib64:$CONDA/lib

#python sql access
export DB_PASS=NGA
export DB_USER=root
export DB_NAME=app1

# engine compile switches
if [ "$HOST" == "swag-gpu-01.ec2.internal" ]; then
	export HASGPU=1
	export HASCAFFE=1
else
	export HASGPU=0
	export HASCAFFE=0
fi

# UNCLASSIFIED when IP addresses and passwords are undefined
