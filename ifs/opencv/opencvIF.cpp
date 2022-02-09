// UNCLASSIFIED

/**
Provides an opencv engine with a pool of opencv-machines

 	error = opencv( "thread name", "run code", { context } )
 	error = opencv( "thread name", "port name", [ event, ... ] )

which use HAAR-Lie-identifiers having parameters

	scale = 0:1 
		specifies how much the image size is reduced at each image scale step, and thus defines a 
		scale pyramid during the detection process.  E.g. 0.05 means reduce size by 5% when going to next image 
		scale step.  Smaller step sizes will thus increase the chance of detecting the features at diffrent scales. 
	delta = 0:1 
		features of dim*(1-delta) : dim*(1+delta) pixels are detected
	dim = integer 
		defines nominal feature size in pixels
	hits = integer 
		specifies number is required neighboring detects to declare a single detect.  A higher value
		results in less detections of higher quality. 3~6 is a good value.
	cascade = [ "path to xml file", ... ] 
		list of trained cascades
	net = string
		path to prototxt file used to train caffe cnn
	
with CAFFE-CNN-cassifiers having parameters

	TBD

See mac.h for machine information.

This interface is created using node-gyp with the binding.gyp provided
and expects the following compile directives

	HASCAFFE = 1/0 if machine has/hasnot installed caffe
	HASGPU = 1/0 if machine has/hasnot a gpu
*/

#define MAXPORTS 32
#define MAXCASCADES 10
#define MAXMACHINES 4
#define CVBUGJPG "./prime.jpg"

/*
#define JSONIFY \
	outlen += strlen(buff); \
\
	for (i=0; i<features; i++) { \
		buffs[i] = feature[i].json(); \
		outlen += strlen(buffs[i]); \
	} \
\
	out = mac_strclone(outlen+5+features,"{"); \
	strcat(out,buff); \
	strcat(out,"["); \
\
	for (i=0; i<features-1; i++) { \
		strcat(out,buffs[i]); \
		strcat(out,","); \
	} \
\
	if (features) strcat(out,buffs[i]); \
\
	strcat(out,"]}");
*/


//==============================================================
// OpenCV interface

#include <opencv2/objdetect/objdetect.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/opencv.hpp>

using namespace cv;

RNG rng(12345);

//=======================================================
// Basic stuff 

#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <iomanip>

//==============================================================
// Node V8 interface

#include <macIF.h>
#define TRACE "cv>"
#define QUOTE(X) #X
#define V8GETVALUE(X,KEY) X.Get(KEY).ToNumber().DoubleValue()
#define V8GETSTRING(X,KEY) X.Get(KEY).ToString()
#define V8GETOBJECT(X,KEY) X.Get(KEY).ToObject()
#define TOSTR(X) X.c_str()

// String testers

#define STRDEFINED(X) (X == "undefined")
#define STREMPTY(X) (X.length() ? false : true)

//=========================================================================
// CNN support functions

#if HASCAFFE
	#include <caffe/caffe.hpp>
	using namespace caffe;  // NOLINT(build/namespaces)
#endif

/* Pair (label, confidence) representing a prediction. */
typedef std::pair<string, float> Prediction;

class Classifier {
 public:
  Classifier(
	const string& deploy_file,
	const string& param_file,
	const string& mean_file,
	const string& label_file);

  std::vector<Prediction> Classify(const cv::Mat& img, int N = 5);

 private:
  void SetMean(const string& mean_file);

  std::vector<float> Predict(const cv::Mat& img);

  void WrapInputLayer(std::vector<cv::Mat>* input_channels);

  void Preprocess(const cv::Mat& img,
                  std::vector<cv::Mat>* input_channels);

 private:
#if HASCAFFE
  shared_ptr<Net<float> > net_;
#endif
  cv::Size input_geometry_;
  int num_channels_;
  cv::Mat mean_;
  std::vector<string> labels_;
};

Classifier::Classifier(
	const string& deploy_file,
	const string& param_file,
	const string& mean_file,
	const string& label_file) {


#if HASCAFFE

  Caffe::set_mode(HASGPU ? Caffe::GPU : Caffe::CPU);

  /* Load the deployed input-speced network. */

  net_.reset(new Net<float>( deploy_file, TEST));

  /* Transfer parameters learned from training network to this deployed network */

  if ( !STREMPTY(param_file) )
	net_->CopyTrainedLayersFrom(param_file);

  CHECK_EQ(net_->num_inputs(), 1) << TRACE "Network should have exactly one input.";
  CHECK_EQ(net_->num_outputs(), 1) << TRACE "Network should have exactly one output.";

  Blob<float>* input_layer = net_->input_blobs()[0];
  num_channels_ = input_layer->channels();

  CHECK(num_channels_ == 3 || num_channels_ == 1)
    << TRACE "Input layer should have 1 or 3 channels.";

  input_geometry_ = cv::Size(input_layer->width(), input_layer->height());

  /* Load the binaryproto mean file. */
  if ( !STREMPTY(mean_file) )
		SetMean(mean_file);

  /* Load labels. */
  if ( !STREMPTY(label_file) ) {
	  std::ifstream labels( TOSTR(label_file) );
	  CHECK(labels) << TRACE "Unable to open labels file " << label_file;
	  string line;
	  while (std::getline(labels, line))
		labels_.push_back(string(line));

	  Blob<float>* output_layer = net_->output_blobs()[0];
	  CHECK_EQ(labels_.size(), output_layer->channels())
		<< TRACE "Number of labels is different from the output layer dimension.";
  }

  printf(TRACE "Network loaded and trained inputs=%d outputs=%d input channels=%d w=%d h=%d\n", 
	(int) net_->num_inputs(), (int) net_->num_outputs(),
	num_channels_,
	input_layer->width(), input_layer->height() );
#endif

}

static bool PairCompare(
	const std::pair<float, int>& lhs,
	const std::pair<float, int>& rhs) {
		
  return lhs.first > rhs.first;
}

/* Return the indices of the top N values of vector v. */
static std::vector<int> Argmax(const std::vector<float>& v, int N) {
  std::vector<std::pair<float, int> > pairs;
  
  for (size_t i = 0; i < v.size(); ++i)
    pairs.push_back(std::make_pair(v[i], i));
    
  std::partial_sort(pairs.begin(), pairs.begin() + N, pairs.end(), PairCompare);

  std::vector<int> result;
  for (int i = 0; i < N; ++i)
    result.push_back(pairs[i].second);
    
  return result;
}

/* Return the top N predictions in (label,level) list. */
std::vector<Prediction> Classifier::Classify(
	const cv::Mat& img, int N) {
		
  std::vector<Prediction> predictions;

#if HASCAFFE
  std::vector<float> output = Predict(img);

  N = std::min<int>(labels_.size(), N);
  std::vector<int> maxN = Argmax(output, N);
  
  for (int i = 0; i < N; ++i) {
    int idx = maxN[i];
    predictions.push_back(std::make_pair(labels_[idx], output[idx]));
  }
#endif

  return predictions;
}

/* Load the mean file in binaryproto format. */
void Classifier::SetMean(const string& mean_file) {

#if HASCAFFE

  BlobProto blob_proto;
  ReadProtoFromBinaryFileOrDie( TOSTR(mean_file), &blob_proto);

  /* Convert from BlobProto to Blob<float> */
  Blob<float> mean_blob;
  mean_blob.FromProto(blob_proto);
  CHECK_EQ(mean_blob.channels(), num_channels_)
    << TRACE "Number of channels of mean file doesn't match input layer.";

  /* The format of the mean file is planar 32-bit float BGR or grayscale. */
  std::vector<cv::Mat> channels;
  float* data = mean_blob.mutable_cpu_data();
  for (int i = 0; i < num_channels_; ++i) {
    /* Extract an individual channel. */
    cv::Mat channel(mean_blob.height(), mean_blob.width(), CV_32FC1, data);
    channels.push_back(channel);
    data += mean_blob.height() * mean_blob.width();
  }

  /* Merge the separate channels into a single image. */
  cv::Mat mean;
  cv::merge(channels, mean);

  /* Compute the global mean pixel value and create a mean image
   * filled with this value. */
  cv::Scalar channel_mean = cv::mean(mean);
  mean_ = cv::Mat(input_geometry_, mean.type(), channel_mean);

#endif
}

/* Return vector of predictions */
std::vector<float> Classifier::Predict(const cv::Mat& img) {

#if HASCAFFE
  Blob<float>* input_layer = net_->input_blobs()[0];
  
  input_layer->Reshape(
	1, num_channels_,
    input_geometry_.height, input_geometry_.width);
    
  /* Forward dimension change to all layers. */
  net_->Reshape();

  std::vector<cv::Mat> input_channels;
  WrapInputLayer(&input_channels);

//printf(TRACE "preproc\n");
  Preprocess(img, &input_channels);

//printf(TRACE "predict\n");
  net_->ForwardPrefilled();

//printf(TRACE "save\n");
  /* Copy the output layer to a std::vector */
  Blob<float>* output_layer = net_->output_blobs()[0];
  const float* begin = output_layer->cpu_data();
  const float* end = begin + output_layer->channels();
  return std::vector<float>(begin, end);
  
#endif
}

/* Wrap the input layer of the network in separate cv::Mat objects
 * (one per channel). This way we save one memcpy operation and we
 * don't need to rely on cudaMemcpy2D. The last preprocessing
 * operation will write the separate channels directly to the input
 * layer. */
void Classifier::WrapInputLayer(std::vector<cv::Mat>* input_channels) {
	
#if HASCAFFE	
  Blob<float>* input_layer = net_->input_blobs()[0];

  int width = input_layer->width();
  int height = input_layer->height();
  float* input_data = input_layer->mutable_cpu_data();
  
  for (int i = 0; i < input_layer->channels(); ++i) {
    cv::Mat channel(height, width, CV_32FC1, input_data);
    input_channels->push_back(channel);
    input_data += width * height;
  }
#endif

}

/* Normalize image, resize and channelize it to match network inputs */
void Classifier::Preprocess(
	const cv::Mat& img,
	std::vector<cv::Mat>* input_channels) {

#if HASCAFFE		
  /* Convert the input image to the input image format of the network. */
  cv::Mat sample;
  if (img.channels() == 3 && num_channels_ == 1)
    cv::cvtColor(img, sample, cv::COLOR_BGR2GRAY);
  else if (img.channels() == 4 && num_channels_ == 1)
    cv::cvtColor(img, sample, cv::COLOR_BGRA2GRAY);
  else if (img.channels() == 4 && num_channels_ == 3)
    cv::cvtColor(img, sample, cv::COLOR_BGRA2BGR);
  else if (img.channels() == 1 && num_channels_ == 3)
    cv::cvtColor(img, sample, cv::COLOR_GRAY2BGR);
  else
    sample = img;

  cv::Mat sample_resized;
  if (sample.size() != input_geometry_)
    cv::resize(sample, sample_resized, input_geometry_);
  else
    sample_resized = sample;

  cv::Mat sample_float;
  if (num_channels_ == 3)
    sample_resized.convertTo(sample_float, CV_32FC3);
  else
    sample_resized.convertTo(sample_float, CV_32FC1);

  cv::Mat sample_normalized;
  // cv::subtract(sample_float, mean_, sample_normalized);
  sample_normalized = sample_float;

  /* This operation will write the separate BGR planes directly to the
   * input layer of the network because it is wrapped by the cv::Mat
   * objects in input_channels. */
  cv::split(sample_normalized, *input_channels);

  CHECK(reinterpret_cast<float*>(input_channels->at(0).data)
        == net_->input_blobs()[0]->cpu_data())
    << TRACE "Input channels are not wrapping the input layer of the network.";
    
#endif
}

/*
caffe sample template
int main(int argc, char** argv) {
  if (argc != 6) {
    std::cerr << "Usage: " << argv[0]
              << " deploy.prototxt network.caffemodel"
              << " mean.binaryproto labels.txt img.jpg" << std::endl;
    return 1;
  }

  ::google::InitGoogleLogging(argv[0]);

  string deploy_file   = argv[1];
  string param_file = argv[2];
  string mean_file    = argv[3];
  string label_file   = argv[4];
  Classifier CNN_classify(deploy_file, param_file, mean_file, label_file);

  string file = argv[5];

  std::cout << "---------- Prediction for "
            << file << " ----------" << std::endl;

  cv::Mat img = cv::imread(file, -1);
  CHECK(!img.empty()) << "Unable to decode image " << file;
  std::vector<Prediction> predictions = CNN_classify.Classify(img);

  // Print the top N predictions.
  for (size_t i = 0; i < predictions.size(); ++i) {
    Prediction p = predictions[i];
    std::cout << std::fixed << std::setprecision(4) << p.second << " - \""
              << p.first << "\"" << std::endl;
  }
}
#else
int main(int argc, char** argv) {
  LOG(FATAL) << "This example requires OpenCV; compile with USE_OPENCV.";
}
 * */
 
//================================================================
// HAAR feature detection machine for an opencvIF machine.

class IPORT {							 		// HAAR i/o port
	public:
		IPORT(void) {
		};
		
		~IPORT(void) {
		};
	
		IPORT(V8SCOPE scope, string Name, V8OBJECT Parm) {
			name = Name;
				
printf(TRACE "program %s port: CAFFE=%d GPU=%d\n", TOSTR(name), HASCAFFE, HASGPU );
			
			//<< cv bug. frame init required to prevent a "pure virtual method called" error when stepped
			frame = cv::imread( CVBUGJPG , 1 );  
			if ( frame.empty() ) 
				printf(TRACE "need a " CVBUGJPG " to avoid an opencv bug\n");			
		}
	
		// HAAR input frame parameters
		Mat frame;
		string name;
};

class OPORT {							 		// HAAR i/o port
	public:
		OPORT(void) {
			cascades = 0;
			name = "";
			CNN_classify = NULL;
			for (int n=0; n<MAXCASCADES; n++) HAAR_cascade[n] = "";
				//if (HAAR_cascade[n]) HAAR_cascade[n] = NULL;
		};
		
		~OPORT(void) {
			if (CNN_classify) delete CNN_classify;
			//if (name) free(name);
			
			//for (int n=0; n<MAXCASCADES; n++) 
			//	if (HAAR_cascade[n]) delete HAAR_cascade[n];
		};
	
		OPORT(V8SCOPE scope, string Name, V8OBJECT Parm) {
			name = Name;

printf(TRACE "program %s port: CAFFE=%d GPU=%d\n", TOSTR(name), HASCAFFE, HASGPU );
			
			// Initialize HAAR locator 

			scale = V8GETVALUE(Parm,"scale");
			dim = V8GETVALUE(Parm,"dim");
			delta = V8GETVALUE(Parm,"delta");
			hits = V8GETVALUE(Parm,"hits");

			min = Size(dim*(1-delta),dim*(1-delta));
			max = Size(dim*(1+delta),dim*(1+delta));

			V8ARRAY Cascade(scope,Parm.Get("cascade"));
			cascades = Cascade.Length();

			for (int n=0; n<cascades; n++) 
				HAAR_cascade[n] = V8GETSTRING(Cascade,n);

printf(TRACE "HAAR cascades=%d scale=%g dim=%g delta=%g hits=%d depth=%d min=%d,%d max=%d,%d\n",
	cascades,scale,dim,delta,hits,cascades,min.width,min.height,max.width,max.height);

			for (int n=0; n<cascades; n++) {
				//str fparts[] = {"","","",0,".xml",0};
				//str fname = mac_strcat(fparts,3,HAAR_cascade[n]);
				string fname = HAAR_cascade[n] + string(".xml");

				if( !HAAR_classify[n].load(fname) ) 
					printf(TRACE "HAAR ignored cascade %s\n", TOSTR(fname)); 
				
				else
					printf(TRACE "HAAR loaded cascade %s\n", TOSTR(fname));
			}

			// Initialize CNN Classifier 

			string net = V8GETSTRING(Parm,"net"); // trained caffe cnn 

			if ( STRDEFINED(net) && HASCAFFE) {
				string deploy_file = net + "deploy.prototxt"; 	
				string param_file = net + "params.dat"; 	
				string mean_file  = ""; //net + "means.dat";
				string label_file = net + "labels.names";

printf(TRACE "CNN model=%s train=%s mean=%s label=%s\n",deploy_file.data(),param_file.data(),mean_file.data(),label_file.data());

				CNN_classify = new Classifier (deploy_file, param_file, mean_file, label_file);
			}
			
			else
				CNN_classify = NULL;

//printf(TRACE "out port initialized\n");
		};
		
		// HAAR classifier parameters

		string name;
		int cascades;
		float scale,dim,delta;
		Size min,max;
		int hits;
		
		string HAAR_cascade[MAXCASCADES];
		CascadeClassifier HAAR_classify[MAXCASCADES]; 
	
		// CNN classifier parameters

		Classifier *CNN_classify;
};

class FEATURE { 								// Machine output 
	public:
		FEATURE(void) {
			feature = NULL;
			label = "";
			name = ""; 
			features = row = col = rows = cols = level = 0; 
		};
		
		~FEATURE(void) {
//printf(TRACE "[free features\n");
			//if (feature) delete[] feature;  //<dont force this
			//if (name) free(name);
//printf(TRACE "]free features\n");
		}
	
		// Classify features in Frame over specified AOI bounding-box.

		FEATURE(int Depth,Rect AOI,string Name,Mat Frame,OPORT &Port,Classifier *CNN) {
			
			name = Name;

printf(TRACE "HAAR path=%d,%d CNN=%p\n",Depth,Port.cascades,CNN);

			if ( Depth < Port.cascades ) {

				/*
				// scaleFactor specifies how much the image size is reduced at each image scale step, and thus defines a 
				// scale pyramid during the detection process.  E.g. 1.05 means reduce size by 5% when going to next image 
				// scale step.  Smaller step sizes will thus increase the chance of detecting the features at diffrent scales. 
				// 
				// minNeighbors specifies number is required neighboring detects to declare a single detect.  A higher value
				// results in less detections of higher quality. 3~6 is a good value.
				// 
				// minSize defines minimum possible feature size: features smaller than this size are simply ignored.
				// 
				// maxSize defines maximum possible feature size: features larger than this size are simply ignored.
				*/
				
				switch (5) {  //  hacks for testing
					case 5: 
						Port.min.width = 90;
						Port.min.height = 30;
						Port.max.width = 110;
						Port.max.height = 50;
						Port.hits = 10;
						break;

					case 1: 
						Port.min.width = 40;
						Port.min.height = 10;
						Port.max.width = 60;
						Port.max.height = 30;
						Port.hits = 10;
						break;
					
					case 2: 
						Port.min.width = 40;
						Port.min.height = 10;
						Port.max.width = 60;
						Port.max.height = 30;
						break;

					case 3: 
						Port.min.width = 80;
						Port.min.height = 30;
						Port.max.width = 120;
						Port.max.height = 70;
						break;

					case 4:
						Port.min.width = 20;
						Port.min.height = 20;
						Port.max.width = 150;
						Port.max.height = 150;
						break;
				}
				
printf(TRACE "feature minWH=%d,%d maxWH=%d,%d\n",Port.min.width,Port.min.height,Port.max.width,Port.max.height);
			
				// Locate phase.  Place feature detections into a dets bounding-box list.
			
				std::vector<Rect> dets;

				Port.HAAR_classify[Depth].detectMultiScale( Frame, dets, 1+Port.scale, Port.hits, 0, Port.min, Port.max );

				features = dets.size(); 						// number of detects (feature rectangles) detected
				feature = new FEATURE[features];   	// feature information to save on each detection

printf(TRACE "feature=%s depth=%d frameWH=%d,%d scale=%g hits=%d detects=%d\n",
	TOSTR(Name),Depth,Frame.cols,Frame.rows,Port.scale,Port.hits,features);

//printf("haar depth=%d at=%s found=%d rows=%d cols=%d\n",Depth,Port.HAAR_cascade[Depth],features,Frame.rows,Frame.cols);

				// Cascade through each detect to classify the detect and look for sub-features to further classify
				
				for(int i = 0; i < features; i++ ) {
					Rect	det = dets[i];
					Mat subFrame = Frame( det );

					feature[i] = FEATURE(Depth+1, det, Port.HAAR_cascade[Depth], subFrame, Port, CNN);
				}

				if (false) {  // for debugging
					for(int i = 0; i < features; i++ ) {
						Rect det = dets[i];
						rectangle(Frame,det,255);
						det.x+=3; det.y+=3; //det.width-=6; det.height-=2;
						if ( feature[i].label == string("car") )
							rectangle(Frame,det,255);
					}
					
					if (false) { // if gtk installed
						namedWindow( "Display window", WINDOW_NORMAL );
						imshow( "Display window", Frame);
						waitKey(0);
					}
					else {
						printf(TRACE "wrote ~/debug.jpg rtn=%d\n", (int) imwrite("/home/jamesdb/debug.jpg",Frame));
					}

				}
			}
			
			else 
				features = 0;
		  
			// At end of cascade so mark this aoi bounding-box 
			
			cols = (float) AOI.width;
			rows = (float) AOI.height;
			col = (float) AOI.x;
			row = (float) AOI.y;

			if (CNN) {   // refine classification of this frame 
				std::vector<Prediction> predictions = CNN->Classify( Frame );

				if (true) 	// Print the top N predictions.
					for (size_t i = 0; i < predictions.size(); ++i) {
						Prediction p = predictions[i];
						std::cout 
								<< TRACE "CNN Classifier: " << std::fixed << std::setprecision(4) 
								<< "xywh: " << col << "," << row << "," << cols << "," << rows << " "
								<< "level,class: " << p.second << ",'" << p.first << "'"
								<< std::endl;
					}

				label = predictions[0].first;
				level = predictions[0].second;
			}

		};

		float 	row,col,rows,cols;		// bounding-box within this frame
		string 	name;					// cascade used at this frame 
		int		features;				// number of features located within this frame
		float	level;					// classification level at this frame
		string 	label; 					// classification label at this frame
		FEATURE *feature;				// list of features found in this frame
		string	json(void);				// method to jsonize this feature
};

class CVMACHINE : public MACHINE {  	// The HAAR+CNN machine 
	public:
		// Inherit the base machine

		CVMACHINE(void) : MACHINE() {
			oPort = NULL;
			iPort = NULL;
		};
	
		~CVMACHINE(void) {
//printf(TRACE "[free ports\n");
			if (oPort) delete oPort;
			if (iPort) delete iPort;
//printf(TRACE "]free ports\n");
		};
	
		// Latch cv-ports to/from V8-ports

		void latch(V8ARRAY tar, FEATURE &src) { 	// Set array of HAAR features
			int n,N=tar.Length();
//printf(TRACE "set features=%d into tau length=%d\n", src.features, N);
			for (n=0; n<N && n<src.features; n++) {
//printf(TRACE "set n=%d\n",n);
				latch( V8GETOBJECT(tar,n), src.feature[n] );
			}
			
//printf(TRACE "set ending\n"); 
			//if (src.feature) delete[] src.feature;  //< dont force this 
			// for ( ; n<N; n++) latch( tar->Get(n)->ToObject() );  // for debugging
		}

		void latch(V8OBJECT tar, FEATURE &src) {	// Set feature vector
//printf(TRACE "set name=%s\n",TOSTR(src.name));
			tar["name"] = V8TOSTRING(src.name);
			tar["row"] = V8TONUMBER(src.row);
			tar["col"] = V8TONUMBER(src.col);
			tar["rows"] = V8TONUMBER(src.rows);
			tar["cols"] = V8TONUMBER(src.cols);
		}

		void latch(V8OBJECT tar) {				// Set null feature vector
			tar["name"] = V8TOSTRING("");
			tar["row"] = V8TONUMBER(100);
			tar["col"] = V8TONUMBER(101);
			tar["rows"] = V8TONUMBER(10);
			tar["cols"] = V8TONUMBER(20);
		}

		/*
		void latch(FEATURE &tar, V8ARRAY src) {
		}
		void latch(FEATURE &tar, V8OBJECT src) {
		}
		*/
		
		int latch(V8OBJECT tau, OPORT &port) { 	
			
			if ( iPort->frame.empty() ) 
				return badStep;
			
			else
			if (true) {  // debugging
				FEATURE detects( 1, Rect(0,0,0,0), port.name, iPort->frame, port, port.CNN_classify);
//printf(TRACE "save detections to tau context\n");
				V8ARRAY dets(scope, tau.Get("dets"));
				latch( dets, detects);
//printf(TRACE "save completed\n");
				return 0;
			}
			
			else {
				FEATURE detects( 0, Rect(0,0,0,0), port.name, iPort->frame, port, port.CNN_classify);
				V8ARRAY dets(scope, tau.Get("dets"));
				latch( dets, detects);
				return 0;
			}
		}
	
		int latch(IPORT &port, V8OBJECT tau) { 	
			string job = V8GETSTRING(tau,"job");

//printf(TRACE "job=%s\n", TOSTR(job));
			port.frame = cv::imread( job , 1 );
printf(TRACE "frame %s\n", port.frame.empty() ? "failed" : "loaded" );

			//cvtColor(frame,frame,CV_RGB2GRAY);

			if (false) {
				namedWindow( "Display window", WINDOW_NORMAL );
				imshow( "Display window", iPort->frame);
				waitKey(0);
			}

			return port.frame.empty() ? badStep : 0;
		}

		/*
		// legacy
		int latch(OPORT &port, V8ARRAY tau) { 	// Latch tau input to HARR input port
			str job = port.isquery ? port.job : V8TOSTRING( V8INDEX(tau->Get(0)->ToObject(),"job") );

			frame = imread( job , 1 );

printf(TRACE "load=%s empty=%d\n",job,frame.empty());
			return frame.empty();
		}
		
		int latch(V8ARRAY tau, OPORT &port) { 	// Latch HAAR output port to tau output
			steps++;
			
			if ( frame.empty() ) return 101;

			FEATURE detects(0,Rect(0,0,0,0),port.name,frame,port);
			
printf(TRACE "detects=%d\n",detects.features);

			latch(tau,detects);
			return 0;
		}
		*/
		
		/*
		 * When a machine is used in a stepStateful it must be capable of holding state in each Client-Instance 
		 * compute thread; such a machine is uniquely identified by its name = "Client.Engine.Instance",
		 * and is called with a nonempty input-output port name to latch input-output to-from the
		 * machine.
		 * 
		 * Machines operated stepStateless (outside a  stepStateful) do not hold state; these machines are 
		 * identified by name = "Engine" and are called with an port=code string.
		 * */
	
		int stepStateless(void) {
			err = latch(*iPort, V8GETOBJECT(ctx,"frame") );
			if (err) return err;
			
			err = latch(V8GETOBJECT(ctx,"detector") ,*oPort);
			return err; 
		}
		
		int stepStateful(void) {
			return badStep;  
		}

		// Program/step the machine
	
		int program (void) { 
			str iKey = "input", oKey = "output";
			
printf(TRACE "pgm %s port\n", oKey );
			if (oPort) delete oPort;  
			oPort = new OPORT(scope, oKey, V8GETOBJECT(ctx,string(oKey) ) );

printf(TRACE "pgm %s port\n", iKey);
			if (iPort) delete iPort;  
			iPort = new IPORT(scope, iKey, V8GETOBJECT(ctx,string(iKey) ) );

			init = true;
			return 0;
		}

		int run(const V8STACK& args) {
			
printf(TRACE "run init mode=%d\n", init);
			err  = setup(args);
			
			if ( err ) 
				return err;

			else
			if ( init ) // already initialized so step machine
				return stepStateless();
				
			else 		// must initialize the machine
				return program();
			
		}
	
		// Define i/o ports
	
		OPORT *oPort;
		IPORT *iPort;
};

//==========================================================================================
// HAAR feature detection machine for the opencvIF.cpp machine interface
// expected by the CVMACHINE pool requested in the (tauif.cpp,tauif.h) interface.

string json(FEATURE objs[], int N) {
	/*
	int n;
	str buffs[N];
	
	for (n=0;n<N;n++) buffs[n] = objs[n].json();
	
	return mac_strjson(buffs,N);
	*/
	string out = "";
	return out;
}

string FEATURE::json(void) {
	/*
	int 	outlen=0,bufflen,i;
	str		buffs[features],out;
	char 	buff[512];
	
	sprintf(buff,
		"\"FEATURE\":\"%s\",\"x\":%d,\"y\":%d,\"width\":%d,\"height\":%d,\"row\":%g,\"col\":%g,\"rows\":%g,\"cols\":%g\"children\":",
		name,box.x,box.y,box.width,box.height,row,col,rows,cols);
	*/
	
	//JSONIFY;
	string out = "";
	return out;
}

//==============================================
// Generate a pool of opencv machines

V8POOL(cvPool,MAXMACHINES,CVMACHINE)

V8NUMBER run(const V8STACK& args) {
	V8SCOPE scope = args.Env();
	return V8NUMBER::New(scope,cvPool(args) );
}

V8OBJECT Init(V8SCOPE scope, V8OBJECT exports) {
	return V8FUNCTION::New(scope, run, "run");
}

NODE_API_MODULE(opencvIF, Init)

// UNCLASSIFIED
