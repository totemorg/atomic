// UNCLASSIFIED

/*
Reserves a pool of V8 opencv (haar locator, dnn classifier) machines:
 
 		opencv([ name string, port string, event list ])
 		opencv([ name string, port hash, code string ])
 
A machine name (typically "Client.Engine.Instance") uniquely identifies the 
machine's compute thread and can be freely added to the pool until 
the pool becomes full.  
 
When stepping a machine, the port string specifies either the name of 
the input port on which arriving events [ tau, tau, ... ] list are latched, 
or the name of the output port on which departing events [ tau, 
tau, ... ] are latched.
 
When programming a machine, parm = { ports: {name1: {...}, 
name2: {...}, ...}, tau: [tau,tau,...], ... } defines parameters 
to machine i/o ports, default i/o event taus, and a code string to 
(re)program the machine (ignored by opencv).
 
See the tauIF.cpp for usage examples.  This interface is 
created using node-gyp with the binding.gyp provided.

Compile directives:
 		HASCAFFE = 1/0 if machine has/hasnot installed caffe
 		HASGPU = 1/0 if machine has/hasnot a gpu
*/

#include <caffe/caffe.hpp>
using namespace caffe;  // NOLINT(build/namespaces)
using std::string;

//==============================================================
// OpenCV HAAR interface

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
//using namespace std;

//==============================================================
// Node V8 interface

#include <node.h>
using namespace v8;

//==============================================================
// TAU machine interface

#include <macIF.h>

#define TRACE "cv>"
#define MAXPORTS 32

#define STRDEFINED(X) strcmp(X.data(),"undefined")
#define STREMPTY(X) (X.length() ? false : true)
#define STREQ(X,Y) (strcmp(X,Y) ? false : true) 

//=========================================================================
// CNN support functions

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
  shared_ptr<Net<float> > net_;
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
	  std::ifstream labels(label_file.c_str());
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
  ReadProtoFromBinaryFileOrDie(mean_file.c_str(), &blob_proto);

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

#define MAXDEPTH 10

class PORT {							 		// HAAR i/o port
	public:
		PORT(void) {
			isinput = isoutput = isquery = isenabled = false;
			cascades = 0;
			name = "";
			CNN_classify = NULL;
		};
		
		PORT(Isolate* scope, str Name, V8OBJECT Parm) {
			// port flags
			isquery = ISQUERY(Name);					// isquery port
			isenabled = !(isquery || ISSQL(Name));  	// isfunctional
			isinput = isenabled ? (V8GETVALUE(Parm,"sink")>0) ? true : false : false;  // isinput
			isoutput = isenabled ? !isinput : false; 	// isoutput
			
			// port name
			name = mac_strclone(Name);
				
//printf(TRACE "port %s query=%d i/o=%d/%d\n", name, isquery, isinput, isoutput);
	
			printf(TRACE "CAFFE %s GPU %s\n", 
					HASCAFFE ? "enabled" : "disabled",
					HASGPU ? "enabled" : "disabled");

			// port parameters
			if ( isoutput || isquery ) { 					// define output port 

				// Init HAAR Locator - see SQL.execute for HAAR trainer to create these cascade files
				
				scale = V8GETVALUE(Parm,"scale");
				dim = V8GETVALUE(Parm,"dim");
				delta = V8GETVALUE(Parm,"delta");
				hits = V8GETVALUE(Parm,"hits");
				
				min = Size(dim*(1-delta),dim*(1-delta));
				max = Size(dim*(1+delta),dim*(1+delta));
				
				if (isquery) {
					job = V8GETSTRING(Parm,"job");
					cascades = 1;
					HAAR_cascade[0] = V8GETSTRING(Parm,"cascade");
				}
				else {
					V8ARRAY Cascade = V8GETARRAY(Parm,"cascade");
					cascades = Cascade->Length();
					
					for (int n=0; n<cascades; n++) 
						HAAR_cascade[n] = V8TOSTRING(Cascade->Get(n));
				}

printf(TRACE "cascades=%d scale=%g dim=%g delta=%g hits=%d depth=%d min=%d,%d max=%d,%d\n",
	cascades,scale,dim,delta,hits,cascades,min.width,min.height,max.width,max.height);

				for (int n=0; n<cascades; n++) {
					str fparts[] = {"","","",0,".xml",0};
					str fname = mac_strcat(fparts,3,HAAR_cascade[n]);

					if( !HAAR_classify[n].load(fname) )
						printf(TRACE "HAAR rejected cascade %s\n",fname); 
					else
						printf(TRACE "HAAR loaded cascade %s\n",fname);
				}

				// Init CNN Classifier - see SQL.execute for CNN trainer to build these prototxt files

				std::string net = V8GETSTRING(Parm,"net"); // nural network to use for training and testing

				if ( STRDEFINED(net) && HASCAFFE) {
					std::string deploy_file = net + "deploy.prototxt"; 	
					std::string param_file = net + "params.dat"; 	
					std::string mean_file  = ""; //net + "means.dat";
					std::string label_file = net + "labels.names";
				
printf(TRACE "CNN Classifier: model=%s train=%s mean=%s label=%s\n",deploy_file.data(),param_file.data(),mean_file.data(),label_file.data());

					CNN_classify = new Classifier (deploy_file, param_file, mean_file, label_file);
				}
				else
					CNN_classify = NULL;

			}
			else { // input port parameters
				// reserved
			}
			
printf(TRACE "ports initialized\n");		
		};
		
		// HAAR Locator parameters

		bool isinput,isoutput,isquery,isenabled;
		int cascades;
		str name,job;
		float scale,dim,delta;
		Size min,max;
		int hits;
		
		str HAAR_cascade[MAXDEPTH];
		CascadeClassifier HAAR_classify[MAXDEPTH]; 
	
		// CNN Classifier parameters

		Classifier *CNN_classify;
};

typedef Mat FRAME; 								// Machine input 

class FEATURE { 								// Machine output 
	public:
		FEATURE(void) {
			name=NULL; features=0; row=0; col=0; rows=0; cols=0; label=NULL; level=0;
		};
		
		// Search Frame over specified AOI bounding-box for features to classifiy.
		//
		FEATURE(int Depth,Rect AOI,str Name,FRAME Frame,PORT &Port,Classifier *CNN) {
			name = mac_strclone(Name);

printf(TRACE "detect depth=%d,%d CNN=%p\n",Depth,Port.cascades,CNN);

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
				
				switch (5) {
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
	Name,Depth,Frame.cols,Frame.rows,Port.scale,Port.hits,features);

//printf("haar depth=%d at=%s found=%d rows=%d cols=%d\n",Depth,Port.HAAR_cascade[Depth],features,Frame.rows,Frame.cols);

				// Cascade through each detect to classify the detect and look for sub-features to further classify
				
				for(int i = 0; i < features; i++ ) {
					Rect	det = dets[i];
					FRAME subFrame = Frame( det );

					feature[i] = FEATURE(Depth+1, det, Port.HAAR_cascade[Depth], subFrame, Port, CNN);
				}

				if (false) {  // for debugging
					for(int i = 0; i < features; i++ ) {
						Rect det = dets[i];
						rectangle(Frame,det,255);
						det.x+=3; det.y+=3; //det.width-=6; det.height-=2;
						if (strcmp(feature[i].label,"car")==0)
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
		  
			// At end of cascade so mark this aoi bounding-box and classify this frame
			
			cols = (float) AOI.width;
			rows = (float) AOI.height;
			col = (float) AOI.x;
			row = (float) AOI.y;

			if (CNN) { 
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

				label = mac_strclone((str) predictions[0].first.c_str());
				level = predictions[0].second;
			}

		};

		float 	row,col,rows,cols;		// bounding-box within this frame
		str 	name;					// cascade used at this frame 
		int		features;				// number of features located within this frame
		float	level;					// classification level at this frame
		str 	label; 					// classification label at this frame
		FEATURE *feature;				// list of features found in this frame
		str		json(void);				// method to jsonize this feature
};

class CVMACHINE : public MACHINE {  	// HAAR machine via the MACHINE class
	public:
		CVMACHINE(void) : MACHINE() {
			for (int n=0;n<MAXPORTS;n++) ports[n] = NULL;
		};
	
		void set(V8ARRAY tar, FEATURE &src) { 	// Set array of HAAR features
			int n,N=tar->Length();
			for (n=0; n<N && n<src.features; n++) {
//printf(TRACE "set n=%d\n",n);
				set( tar->Get(n)->ToObject(), src.feature[n] );
			}
			// for ( ; n<N; n++) set( tar->Get(n)->ToObject() );  // for debugging
		}

		void set(V8OBJECT tar, FEATURE &src) {	// Set feature vector
//printf(TRACE "set name=%s\n",src.name);
			V8SET(tar,src,name);
			V8SET(tar,src,row);
			V8SET(tar,src,col);
			V8SET(tar,src,rows);
			V8SET(tar,src,cols);
			V8SET(tar,src,label);
			V8SET(tar,src,level);
		}

		void set(V8OBJECT tar) {				// Set null feature vector
			V8DEF(tar,"",name);
			V8DEF(tar,100.0,row);
			V8DEF(tar,101.0,col);
			V8DEF(tar,10.0,rows);
			V8DEF(tar,20.0,cols);
			//V8SET(tar,"",label);
			//V8SET(tar,0.0,level);
		}

		/*
		void set(FEATURE &tar, V8ARRAY src) {
		}
		void set(FEATURE &tar, V8OBJECT src) {
		}
		*/
		
		/*
		 * A machine implements 3 latch operations: (1) latch V8 input events to a specified input 
		 * port, (2) step the machine and latch its events to a specified output port, (3) latch
		 * program code and parameter hash.  After completing the requested operation, the machine 
		 * returns a V8 error handle.  
		 * */
		
		int latch(PORT &port, V8ARRAY tau);
		int latch(V8ARRAY tau, PORT &port);
	
		/*
		int latch(PORT &port, V8ARRAY tau) { 	// Latch tau input to HARR input port
			str job = port.isquery ? port.job : V8TOSTRING( V8INDEX(tau->Get(0)->ToObject(),"job") );

			frame = imread( job , 1 );

printf(TRACE "load=%s empty=%d\n",job,frame.empty());
			return frame.empty();
		}
		
		int latch(V8ARRAY tau, PORT &port) { 	// Latch HAAR output port to tau output
			steps++;
			
			if ( frame.empty() ) return 101;

			FEATURE detects(0,Rect(0,0,0,0),port.name,frame,port);
			
printf(TRACE "detects=%d\n",detects.features);

			set(tau,detects);
			return 0;
		}
		*/
		
		/*
		 * When a machine is used in a workflow it must be capable of holding state in each Client-Instance 
		 * compute thread; such a machine is uniquely identified by its name = "Client.Engine.Instance",
		 * and is called with a nonempty input-output port name to latch input-output to-from the
		 * machine.
		 * 
		 * Machines operated standalone (outside a  workflow) do not hold state; these machines are 
		 * identified by name = "Engine" and are called with an empty "" port name.
		 * */
		
		int standalone(V8ARRAY tau) {		// stateless step
			for (int n=0; n<MAXPORTS && ports[n]; n++) 
				if ( ports[n]->isquery ) 
					return latch(*ports[n],tau) || latch(tau,*ports[n]);
		}
		
		int workflow(V8ARRAY tau) { 		// stateful step
			for (int n=0; n<MAXPORTS && ports[n]; n++) {
				if ( strcmp(port,ports[n]->name) == 0 )
					if ( ports[n]->isinput )		return latch(*ports[n],tau);
					else
					if ( ports[n]->isoutput )		return latch(tau,*ports[n]);
			}
		}
		
		int call(const V8STACK& args) { 	// step or program the machine
			
			if (setup(args)) return err;

			if (init) { 					// Program or step stateless machine
				V8VALUE _Ports = V8INDEX(parm,"ports");
				V8OBJECT Ports = _Ports->IsObject() ? _Ports->ToObject() : V8NULLOBJ;

				V8ARRAY Keys = Ports->GetOwnPropertyNames();  
printf(TRACE "init ports=%d\n",Keys->Length());

				for (int n=0,N=Keys->Length(); n<N; n++) {
					str Key = V8TOSTRING(Keys->Get(n));
					
printf(TRACE "init port %d\n",n);
					ports[n] = new PORT(scope, Key, V8INDEX(Ports,Key)->ToObject());
				}
				
				return standalone(tau);
			}
			else  	// Step stateful machine
				return workflow(tau);
		}
		
		FRAME frame;
		PORT *ports[MAXPORTS];
};

//==========================================================================================
// HAAR feature detection machine for the opencvIF.cpp machine interface
// expected by the CVMACHINE pool requested in the (tauif.cpp,tauif.h) interface.

int CVMACHINE::latch(PORT &port, V8ARRAY tau) { 	// Latch tau input to HARR input port
	str job = port.isquery ? port.job : V8TOSTRING( V8INDEX(tau->Get(0)->ToObject(),"job") );

	frame = imread( job , 1 );

	//cvtColor(frame,frame,CV_RGB2GRAY);
	
	if (false) {
		namedWindow( "Display window", WINDOW_NORMAL );
		imshow( "Display window", frame);
		waitKey(0);
	}
	
	return frame.empty();
}

int CVMACHINE::latch(V8ARRAY tau, PORT &port) { 	// Latch HAAR output port to tau output
	steps++;
	
	if ( frame.empty() ) return 101;

	FEATURE detects(0,Rect(0,0,0,0),port.name,frame,port,port.CNN_classify);
	
	set(tau,detects);
	return 0;
}

str json(FEATURE objs[], int N) {
	int n;
	str buffs[N];
	
	for (n=0;n<N;n++) buffs[n] = objs[n].json();
	
	return mac_strjson(buffs,N);
}

str	FEATURE::json(void) {
	int 	outlen=0,bufflen,i;
	str		buffs[features],out;
	char 	buff[512];
	
	/*
	sprintf(buff,
		"\"FEATURE\":\"%s\",\"x\":%d,\"y\":%d,\"width\":%d,\"height\":%d,\"row\":%g,\"col\":%g,\"rows\":%g,\"cols\":%g\"children\":",
		name,box.x,box.y,box.width,box.height,row,col,rows,cols);
	*/
	
	V8JSONIFY;
	return out;
}

//==============================================
// Generate the TAU machine pool interface

#define MAXMACHINES 64

V8POOL(opencv,MAXMACHINES,CVMACHINE)

// UNCLASSIFIED
