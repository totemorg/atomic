// UNCLASSIFIED

/**
Provides an R engine with a pool of R-machines

 	error = R( "thread name", "run code", { context } )
 	error = R( "thread name", "port name", [ event, ... ] )
	
See mac.h for machine information.
*/

#include <RInside.h>                    // for the embedded R via RInside
#include <macIF.h>						// Node V8 interface

#define QUOTE "'"
#define TRACE "R>"
#define MAXMACHINES 1

typedef Rcpp::RObject ROBJECT;
typedef Rcpp::String RSTRING;
typedef Rcpp::List RLIST;

#define RISSTRING(X) Rcpp::is<RSTRING>(X)
#define RISLIST(X) Rcpp::is<RLIST>(X)
#define RASSTRING(X) Rcpp::as<RSTRING>(X)

class RMACHINE : public MACHINE {  				// Python machine extends MACHINE class
	public:
	
		// Inherit the base machine
	
		RMACHINE(void) : MACHINE() { 
			char	*argv[] = {};
			int		argc = 0;

			R = new RInside(argc, argv);              // create an embedded R instance
			port = "";
			path = "";
		};

		~RMACHINE(void) {
		};
	
		// Latch R-ports to/from V8-ports

		V8VALUE clone( ROBJECT src ) {  // R to V8
			if ( RISSTRING(src) ) {
				RSTRING val = RASSTRING( src );
				return V8TOSTRING( val.get_cstring() );				
			}
			
			else
			if ( RISLIST(src) ) {
				bool isObject = src.hasAttribute("names");
				RLIST list = Rcpp::as<RLIST>(src);
				int N = list.size();
				
//printf(TRACE "clone isobj=%d len=%d\n", isObject, N );
				if ( isObject ) {
					Rcpp::StringVector names = src.attr("names");
					V8OBJECT tar = V8OBJECT::New(scope);	
					
					for ( int n=0; n<N; n++ ) {
						RSTRING name = names[n];
						string key = name.get_cstring();
						ROBJECT val = list[n];
//printf(TRACE "clone key=%s idx=%d\n", key.c_str(), n);
						tar[ key ] = clone( val );
					}
					return tar;
				}
				
				else { 
					V8ARRAY tar = V8ARRAY::New(scope,N);
					
					for (int n=0; n<N; n++) {
						ROBJECT val = list[n];
						tar[n] = clone( val );
					}
					return tar;					
				}
			}
			
			else {
				double val = Rcpp::as<double>(src);
				return V8TONUMBER( val );
			}
		}
	
		/*
		V8VALUE clone(string src) { 				// clone R value to v8 value
			string type = R->parseEval( "typeof(" + src + ")" );
			
printf(TRACE "save %s type=%s\n", src.c_str(), type.c_str());
			
			if ( type == "NULL" ) 
				return V8TONUMBER( 0 );
			
			else
			if ( type == "list" ) {
				//Rcpp::Vector u = R->parseEval( src );
//printf(TRACE "clone vec len=%d\n", u.size() );
				ROBJECT junk;
				int isArray = R->parseEval( "is.null(names(" + src + "))" );
printf(TRACE "clone isarray=%d\n", isArray );
				
				if ( isArray ) { // return v8 array
					int N = 0;
printf(TRACE "clone array len=%d\n",N);
					V8ARRAY tar = V8ARRAY::New(scope,N);
					V8OBJECT Tar = tar.ToObject();
					
					for (int n=0; n<N; n++) {
						Tar[n] = clone( src + "[[" + std::to_string(n) + "]]" );
					}
					return Tar;
				}
				
				else { // return v8 object
					V8OBJECT tar = V8OBJECT::New(scope);				
					Rcpp::StringVector names = R->parseEval( "names(" + src + ")" );
					int N = names.size();
					
					for ( int n=0 ; n<N; n++ ) {
						Rcpp::String name = names[n];
						string key = src + "$" + name.get_cstring();
						tar[ key ] = clone( key );
						printf("saved list[%d=%s]\n",n,key.c_str());
					}
					return tar;
				}
			}
			
			else
			if ( type == "character" ) {
				string val = R->parseEval( src );
				return V8TOSTRING( val );
			}
			
			else {
				double val = R->parseEval( src );
				return V8TONUMBER( val );
			}
				
		} 
		*/
	
		string clone(V8VALUE src) {  			// clone v8 object into python object
//printf(TRACE "clone v8>>py str=%d num=%d arr=%d obj=%d null=%d\n ",  src.IsString(),src.IsNumber(),src.IsArray(),src.IsObject(),src.IsNull() );
			if ( src.IsString() ) 
				return QUOTE + V8TOSTR(src) + QUOTE;
			
			else
			if ( src.IsNumber() )
				return std::to_string( src.ToNumber().DoubleValue() );
				
			else
			if ( src.IsArray() ) {
				V8ARRAY x(scope,src);
				return clone( x );
			}
			
			else
			if ( src.IsObject() )
				return clone(src.ToObject());
				
			else
			if ( src.IsNull() )
				return "NULL";

			else
			if ( src.IsBoolean() )
				return src.ToBoolean() ? "TRUE" : "FALSE";
				
			else
				return "0";
		}
	
		string clone(V8ARRAY src) { 				// clone v8 array into python object
			int N = src.Length();
			string list = "list(";
			
			for (int n=0; n<N; n++) {
				if ( n ) list += ",";
				list += clone( src[n] );
			}
			return list + ")";
		}

		string clone(V8OBJECT src) { 			// clone v8 object into python object
			string obj = "list(";
			
			V8ARRAY keys = src.GetPropertyNames();
			for (int n=0,N=keys.Length(); n<N; n++) {
				V8VALUE key = keys[n];
				if ( n ) obj += ",";
				obj += V8TOSTR(key) + "=" + clone(src[ V8TOSTR(key) ]);
			}
			
			return obj+")";
		}

		// Program/step the machine
	
		int run(const V8STACK& args) { 			// Monitor/Program/Step machine	
			string  runCode;
			
			err = setup(args);
//printf(TRACE "run setup err=%d init=%d\n", err, init);
			
			if (err) 
				return err;
			
			else { 
				runCode = "ERR=0;\nTAU=" + clone( tau ) + ";\nCTX=" + clone(ctx) + ";\n" + code;
//printf(TRACE "run stateless step port=%s code:\n\n%s\n", port, runCode.c_str() );

				R->parseEvalQ(runCode); 
				//latch(ctx, .ToObject() );
				err = (int) (*R)["ERR"];
//printf(TRACE "run err=%d\n", err);
				
				//(*R)["junk"] = "this is a test";
				ROBJECT CTX = (*R)["CTX"];
				latch(ctx, clone( CTX ).ToObject() );
				//ctx["abc"] = 123;
				
				/*
				(*R)["testset"] = "123.456";
				string ts = (*R)["testset"];
				printf("test set = %s\n", ts.c_str());
				
				try {
					Rcpp::StringVector names = R->parseEval("names(CTX)");
					for ( int n =0; n<names.size(); n++ ) {
						Rcpp::String name = names[n];
						printf("name[%d]=%s\n", n, name.get_cstring());
					}
				}
				
				catch (std::exception& ex) {
					printf("##### no names\n");
				}
				
				catch( ... ) {
					printf("!!!! no names\n");
				} 
				*/
			}
			
			return err;
		}
		
	private:
		str path, port;
		RInside *R;
};

/*
int Rmac(int argc, char *argv[]) {

	RInside R(argc, argv);              // create an embedded R instance
	int junk[] = {1,2,3};
	string test = "prefix ";
	
    R["y"] = "Hello, world!\n";      // assign a char* (string) to 'txt'
	R["x"] = 123;
	R["z"] = 123.456;
	
    R.parseEvalQ("cat(x,y,z)");           // eval the init string, ignoring any returns

	Rcpp::NumericVector v = R.parseEval("diag(1:3)");
	
	test = test + "a";
	printf("test=%s\n",test.c_str());
	
	//printf("size v=%d cols=%d rows=%d\n", (int) v.size(), (int) v.ncol(), (int) v.nrow() );
	for (int i=0;i<v.size(); i++)
		std::cout << "Elem " << i << " is " << v[i] << std::endl;
	
    //exit(0);
	return 0;
}
*/

//RMACHINE Rmac;

V8POOL(rPool, MAXMACHINES, RMACHINE)
	
V8NUMBER runMachine(const V8STACK& args) {
	V8SCOPE scope = args.Env();
	//return V8NUMBER::New(scope,Rmac.run(args) );
	return V8NUMBER::New(scope,rPool(args) );
}

V8OBJECT Init(V8SCOPE scope, V8OBJECT exports) {
	return V8FUNCTION::New(scope, runMachine, "runMachine");
}

NODE_API_MODULE(RIF, Init)
