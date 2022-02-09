// UNCLASSIFIED

/**
Use
 
 	V8POOL(IF,MAX,CLASS)
 
to generate a pool of CLASS-machines n = 0 ... MAX-1

 	error = IF_machine[n]( "thread name", "run code", { context } )
 	error = IF_machine[n]( "thread name", "port name", [ event, ... ] )

accessed from an engine interface

 	error = IF( "thread name", "run code", { context } )
 	error = IF( "thread name", "port name", [ event, ... ] )

which returns an error code

	ok			0
	badModule 	101
	badStep 	102
	badPort		103
	badCode 	104
	badPool		105
	badArgs		106

The "thread name" (e.g. "Client.Engine.Instance") uniquely identifies the engine's compute thread.  
Compute threads are automatically added to the pool ({context} not NULL), or removed 
from the pool ({context} is NULL).  An error is returned should the pool become full.  
 
When stepping a machine, the "port name" specifies either the name of the input port on which arriving 
events [ tau, tau, ... ] are latched, or the name of the output port on which departing events
[ tau, tau, ... ] are latched; thus stepping the machine in a stateful way (to maximize data 
restfulness).  An empty port will cause the machine to be stepped in a stateless way with the 
supplied { context }.
 
When programming a machine, the { context } = { ports: {PORT1: {...}, PORT2: {...}, ...}, 
key: value, .... } defines parameters to/from a machine with the named ports PORT.  Empty 
code will cause the machine to monitor its current parameters.

See the opencv.cpp, python.cpp, R.cpp machines for usage examples.  This interface is created using 
node-gyp with the binding.gyp provided.

Implementation notes: 
	google's rapidjson does not provide a useful V8 interface here as (1) its"Value" class conflicts with V8 "Value" 
	class, and (2) passing rapidjson objects to machines is self-defeating.  Similar conflicts occured with the
	nodejs nan module.  NodeJS has evolved to using the Napi module to provide a consistent interface, independent 
	of the EMAC V8 api.

References:
	machines/opencv/objdet for an example opencv mac-machine.  
	machines/python for an example python mac-machine.  
	http://izs.me/v8-docs/ for API to V8 engine.
	http://nodejs.org/api/addons.html for node-gyp help.
	macIF.h for machine classes.
*/
 

#include <napi.h>
#include <string.h>

using std::string;

typedef char *str;
typedef Napi::Object V8OBJECT;
typedef Napi::Env V8SCOPE;
typedef Napi::Number V8NUMBER;
typedef Napi::String V8STRING;
typedef Napi::Function V8FUNCTION;
typedef Napi::CallbackInfo V8STACK;
typedef Napi::Array V8ARRAY;
typedef Napi::Value V8VALUE;

#define TRACE "mac>"
#define V8STR(X) V8TOSTR(X).c_str()
#define V8TOSTR(X) X.ToString().Utf8Value()
#define V8TOSTRING(X) V8STRING::New(scope,X)
#define V8TONUMBER(X) V8NUMBER::New(scope,X)
#define V8ENTRY(X) X.Env()
#define NAMEARG(X) (X[0].IsString() ? V8TOSTR(X[0]) : V8NULLSTR)
#define CODEARG(X) (X[1].IsString() ? V8TOSTR(X[1]) : V8NULLSTR)
#define TAUARG(X)  (X[2].IsArray() ? X[2] : V8NULLARR)
#define CTXARG(X)  ( (X[2].IsObject() && !X[2].IsArray()) ? X[2].ToObject()  : V8NULLOBJ)
#define V8NULLSTR (str) ""
#define V8NULLARR V8ARRAY::New(scope)
#define V8NULLOBJ V8OBJECT::New(scope)
#define STREMPTY(X) (X.length() ? false : true)

#define badModule 	101
#define badStep 	102
#define badPort		103
#define badCode 	104
#define badPool		105
#define badArgs		106

/**
A machine implements latch and setup methods

	latch input V8-port to a machine port 
	latch output machine-port to a V8-port
	setup machine using specified V8-context
	monitor machine during debugging

and is extended to provide a run method

	run program/step the engine code in the specifed V8-context
	
After completing the requested operation, the machine returns a V8 error handle.  
*/

class MACHINE {
	public:
		MACHINE(void) {
//printf(TRACE "create machine\n" );
			steps = depth = drops = err = 0; 
			name = "";
			code = "";		// NULL signals machine available
			scope = NULL;
			init = false;
		}
		
		~MACHINE(void) {
			/*
			if (name) {
				printf("machine ~delete=%s\n", name);
				free(name);
				name = NULL;
			} */
		}
	
	// monitor/debug the machine 
	
	int monitor(void) {   
		V8ARRAY keys = ctx.GetPropertyNames();

		printf(TRACE "%s keys=%d\n",name.c_str(),keys.Length());

		for (int n=0,N=keys.Length(); n<N; n++) {
			V8VALUE key = keys[n];
			V8VALUE val = ctx[ V8TOSTR(key) ];
			printf(TRACE "key=%s isobj=%d\n", V8STR(key),val.IsObject());
		}

		return err;
	}
	
	// setup (initialize/program) the machine using V8-context args
	
	int setup(const V8STACK& args) {   
		err = 0;	// signal ok
		scope = V8ENTRY(args);	// define v8 garbage collection thread

		if ( args.Length() != 3 ) return badArgs;	// text engine args list
		if ( !args[0].IsString() ) return badArgs;  // test engine name string
		if ( !args[1].IsString() ) return badArgs;	// test engine code/"port name"

		port = "";
		code = CODEARG(args);	// retain machine "run code"

		if ( args[2].IsNull() ) {  // init/clear/reset the machine
			init = true;
		}

		else {	// program/execute the machine
			init = false;
//printf(TRACE "arg[2] isobj=%d isarr=%d\n", args[2].IsObject(), args[2].IsArray() );
			ctx = CTXARG(args);  // define context or empty object if not an object
			//ctx["zzz"] = 123;
			V8ARRAY x(scope,TAUARG(args));	// define event taus or empty list if not a list
			tau = x;
//printf(TRACE "setup name=%s code=%s args=%d initialized=%d err=%d\n",name,code,args.Length(),(int) init, err);
		}

		return err;
	}
	
	// latch V8-objects to/from the machine

	void latch(V8OBJECT& tar, V8OBJECT src) {
		V8ARRAY keys = src.GetPropertyNames();
//printf(TRACE "latch keys=%d\n",keys.Length());

		for (int n=0,N=keys.Length(); n<N; n++) {
			V8VALUE key = keys[n];
			string Key = key.ToString();
//printf(TRACE "latch key=%s\n", Key.c_str() );
			V8VALUE Src = src[Key];
			
			if ( Src.IsNumber() ) 
				tar[Key] = Src.ToNumber();
			
			else
			if ( Src.IsString() ) 
				tar[Key] = Src.ToString();
			
			else
			if ( Src.IsArray() ) {
				V8ARRAY xSrc(scope,Src);
				tar[Key] = xSrc;
			}
			
			else
			if ( Src.IsObject() ) 
				tar[Key] = Src.ToObject();
				
			else
			if ( Src.IsBoolean() )
				tar[Key] = Src.ToBoolean();
			
			else
				tar[Key] = 0;
			
		}
	}

	void latch(V8ARRAY tar, V8VALUE src) {
//printf(TRACE "latch array\n");
		if (src.IsArray()) {
			V8ARRAY x(scope,src);
			latch(tar,x);
		}
		
		else
			for (int n=0,N=tar.Length(); n<N; n++)
				tar[n] = src;
	}

	void latch(V8ARRAY tar, V8ARRAY src) {
//printf(TRACE "latch tars=%d\n",src.Length());
		for (int n=0,M=tar.Length(),N=src.Length(); n<N; n++) {
			if (n<M) 
				tar[n] = src[n];  // assume src is an array of objects
			else
				return;
		}
	}

	void latch(V8OBJECT tar, str key, str val) {
		tar[ key ] = V8STRING::New(scope,val);
	}

	void latch(V8OBJECT tar, str key, double val) {
		tar[ key ] = V8TONUMBER(val);
	}

	void latch(V8OBJECT tar, str key, float val) {
		tar[ key ] = V8TONUMBER(val);
	}

	void latch(V8OBJECT tar, str key, int val) {
		tar[ key ] = V8TONUMBER(val);
	}

	int steps,depth,drops,err;		// number of steps, current call depth, dropped events, return code
	bool init;	 					// reinit/clear machine flag (intially false)
	string name, code, port; 		// engine name and engine code/port being latched
	V8OBJECT ctx;					// context parameters
	V8ARRAY tau; 					// port events
	V8SCOPE scope = NULL; 			// v8 garbage collection thread	
};

//printf(TRACE "scan[%d] %s = %s\n", n, name.c_str(), IF##_machine[n].name.c_str() ); \
//printf(TRACE "define %s\n", name.c_str() ); \

/*
Allocate MAX machine interfaces IF##_machine[0 ... MAX-1] of
the specifed machine CLASS.  A V8 call to IF##_machine( [ 
"thread name", "code", [ event, ... ] ) will IF-execute the 
code in the named context thread with the supplied event list.
*/

#define TRACEPOOL 0

#define V8POOL(IF,MAX,CLASS) \
CLASS IF##_machine[MAX]; \
\
int IF(const V8STACK& args) { \
	V8SCOPE scope = V8ENTRY(args); \
	string name = NAMEARG(args); \
\
	for (int n=0; n<MAX; n++) { \
		if ( TRACEPOOL ) printf("find machine[%d]: (%s)=(%s)\n", n, IF##_machine[n].name.c_str(), name.c_str() ); \
		if ( !STREMPTY( IF##_machine[n].name ) ) \
			if ( IF##_machine[n].name == name ) { \
				int err = IF##_machine[n].run(args); \
				if ( args[2].IsNull() ) IF##_machine[n].name = ""; \
				return err; \
			 } \
	} \
\
	for (int n=0; n<MAX; n++) { \
		if ( TRACEPOOL ) printf("make machine[%d]: (%s)=(%s)\n", n, IF##_machine[n].name.c_str(), name.c_str() ); \
		if ( STREMPTY( IF##_machine[n].name ) ) { \
			IF##_machine[n].name = name; \
			return IF##_machine[n].run(args); \
		} \
	} \
\
	return badPool; \
}

// UNCLASSIFIED
