// UNCLASSIFIED

/*
Reserves a pool of V8 python machines:
 
 		error = python.call( [ id string, code string, context hash ] )
 		error = python.call( [ id string, port string, context hash or event list] )
 
and returns an interger error code.

A machine id (typically "Name.Client.Instance") uniquely identifies the machine's compute thread.  Compute
threads can be freely added to the pool until the pool becomes full.  
 
When stepping a machine, port specifies either the name of the input port on which arriving events [ tau, tau, ... ] 
are latched, or the name of the output port on which departing events [ tau, tau, ... ] are latched; thus stepping the 
machine in a stateful way (to maximize data restfulness).  An empty port will cause the machine to be 
stepped in a stateless way with the supplied context hash.
 
When programming a machine, the context hash = { ports: {name1: {...}, name2: {...}, ...}, key: value, .... } defines 
parameters to/from a machine.  Empty code will cause the machine to monitor its current parameters.  
*/

// machine interface
//#include <macIF.h>

// Python interface

#include <Python.h>

// V8 interface

//#include <v8.h>
//using namespace v8;

// Standard interface

#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
//using namespace std;

// Machine specs

#define TRACE "py>"
#define LOCAL(X) PyDict_GetItemString(pLocals,X)

/*
#define CTXINDEX(X) "CTX['" X "']"
*/

// machine context parameters
#define PYERR "ERR"			// parameter to hold error code
#define PYPORT "PORT"		// parameter used to call stateful machine port, or empty for stateless call
#define PYPARM "PARM" 		// name of hash when using external modules
#define PYCTX "CTX"		// engine context during stateless call
#define PYTAU "TAU"		// port events during stateful call
#define PYINIT "INIT" 		// initialize flag
// #define PYOS "OS" 		// OS dictionary


// Generate a pool of machine python_machine[0 ... MAXMACHINES-1].

#include <napi.h>

//#define MAX_CODELEN 1024

typedef Napi::Object V8OBJECT;
typedef char *str;
typedef Napi::Env V8SCOPE;
typedef Napi::Number V8NUMBER;
typedef Napi::String V8STRING;
typedef Napi::Function V8FUNCTION;
typedef Napi::CallbackInfo V8STACK;
typedef Napi::Array V8ARRAY;
typedef Napi::Value V8VALUE;

#define V8STR(X) V8TOSTR(X).c_str()
#define V8TOSTR(X) X.ToString().Utf8Value()
#define V8TOSTRING(X) V8STRING::New(scope,X)
#define V8TONUMBER(X) V8NUMBER::New(scope,X)
#define V8ENTRY(X) X.Env()
#define NAMEARG(X) (X[0].IsString() ? V8TOSTR(X[0]) : V8NULLSTR)
#define CODEARG(X) (X[1].IsString() ? V8TOSTR(X[1]) : V8NULLSTR)
#define TAUARG(X)  X[2]
#define CTXARG(X)  (X[2].IsObject() ? X[2].ToObject()  : V8NULLOBJ)
#define V8NULLSTR (str) ""
#define V8NULLARR V8ARRAY::New(scope)
#define V8NULLOBJ V8OBJECT::New(scope)
#define badModule 	101
#define badStep 	102
#define badPort		103
#define badCode 	104
#define badPool		105
#define badArgs		106

class MACHINE {
	public:
		MACHINE(void) {
printf(TRACE "construct machine\n");
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
	
	int monitor(void) {   // monitor used for debugging machine 
		V8ARRAY keys = ctx.GetPropertyNames();
		//char buf[MAX_KEYLEN];

		printf(TRACE "%s keys=%d\n",name.c_str(),keys.Length());

		for (int n=0,N=keys.Length(); n<N; n++) {
			V8VALUE key = keys[n];
			V8VALUE val = ctx[ V8TOSTR(key) ];
			printf(TRACE "key=%s isobj=%d\n", V8STR(key),val.IsObject());
		}

		return err;
	}
	
	int setup(const V8STACK& args) {   // setup used when machine is called
		err = 0;	// signal ok
		scope = V8ENTRY(args);

		if ( args.Length() != 3 ) return badArgs;	// text engine args list
		if ( !args[0].IsString() ) return badArgs;  // test engine name string
		if ( !args[1].IsString() ) return badArgs;	// test engine code/port string

		port = "";
		code = CODEARG(args);
		//if ( strlen(code) > MAX_CODELEN) return badCode;

		if ( args[2].IsNull() ) {  // init/clear/reset the machine
			init = true;
		}

		else {	// program/execute the machine
			init = false;
			ctx = CTXARG(args);  // define context or empty object if not an object
			V8ARRAY x(scope,TAUARG(args));	// define event taus or empty list if not a list
			tau = x;
//printf(TRACE "setup name=%s code=%s args=%d initialized=%d err=%d\n",name,code,args.Length(),(int) init, err);
		}

		return err;
	}

	// latch V8 objects to host js-script
	void latch(V8OBJECT tar, V8OBJECT src) {
		V8ARRAY keys = src.GetPropertyNames();
//printf(TRACE "set keys=%d\n",keys.Length());

		for (int n=0,N=keys.Length(); n<N; n++) {
			V8VALUE key = keys[n];
			tar[key.ToString()] = src[key.ToString()];
		}
	}

	void latch(V8ARRAY tar, V8VALUE src) {
//printf(TRACE "set array\n");
		if (src.IsArray()) {
			V8ARRAY x(scope,src);
			latch(tar,x);
		}
		
		else
			for (int n=0,N=tar.Length(); n<N; n++)
				tar[n] = src;
	}

	void latch(V8ARRAY tar, V8ARRAY src) {
//printf(TRACE "set tars=%d\n",src.Length());
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

	int steps,depth,drops,err;	// number of steps, current call depth, dropped events, return code
	bool init;	 	// reinit/clear machine flag
	std::string name, code, port; 		// engine name and engine code/port being latched
	V8OBJECT ctx;		// context parameters
	V8ARRAY tau; 	// port events
	V8SCOPE scope = NULL; 		// v8 garbage collection thread	
};

class PYMACHINE : public MACHINE {  				// Python machine extends MACHINE class
	public:
	
		// inherit the base machine
		PYMACHINE(void) : MACHINE() { 
			pModule = NULL;
			pCode = NULL;
			port = "";
			path = "";
		};

		~PYMACHINE(void) {
		};
	
		// V8 to python converters

		V8VALUE clone(PyObject *src) { 				// clone python value to v8 value
			
			if (PyList_Check(src)) {
				int N = PyList_Size(src);
//printf(TRACE "clone py>>v8 list len=%d\n",N);
				V8ARRAY tar = V8ARRAY::New(scope,N);
				V8OBJECT Tar = tar.ToObject();
				
				for (int n=0; n<N; n++) {
					Tar[n] = clone( PyList_GetItem(src,n) );
//printf(TRACE "clone py>>v8[%d] done\n",n);
				}
					
				return tar;
			}
			
			else
			if (PyDict_Check(src)) {
				V8OBJECT tar = V8OBJECT::New(scope);
				PyObject *key,*value;
				Py_ssize_t pos = 0;
				
				while (PyDict_Next(src,&pos,&key,&value)) {
					str Key = PyString_AsString(key);
					tar[ Key ] = clone( value );
				}
				
				return tar;
			}
			
			//else
			//if (PyFunction_Check(src)) 
			//	return V8TONUMBER(0.0);
			
			else
			if (PyFloat_Check(src)) 
				return V8TONUMBER(PyFloat_AsDouble(src));
			
			else
			if (PyInt_Check(src)) 
				return V8TONUMBER(PyInt_AsLong(src));
			
			else
			if (PyString_Check(src)) 
				return V8TOSTRING(PyString_AsString(src));
			
			else
			if (src == Py_None)
				return V8TONUMBER(0.0);  // should return a V8NULL but not sure how to do this
				
			else 
				return V8TONUMBER(0.0);
			
		}
		
		PyObject *clone(V8VALUE src) {  			// clone v8 object into python object
//printf(TRACE "clone v8>>py str=%d num=%d arr=%d obj=%d null=%d\n ",  src.IsString(),src.IsNumber(),src.IsArray(),src.IsObject(),src.IsNull() );
			if ( src.IsString() )
				return PyString_FromString( V8STR(src) );
			
			else
			if ( src.IsNumber() )
				return PyFloat_FromDouble( src.ToNumber().DoubleValue() );
				
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
				return Py_None; //PyLong_FromVoidPtr(NULL);
				
			else
			if ( src.IsFunction() )
				return Py_None;  //PyLong_FromVoidPtr(NULL);
				
			else
				return PyFloat_FromDouble( 0.0 );
		}
	
		PyObject *clone(V8ARRAY src) { 				// clone v8 array into python object
			int N = src.Length();
			PyObject *tar = PyList_New(N);
			
//printf(TRACE "clone v8>>py list len=%d\n",N);
			
			for (int n=0; n<N; n++) 
				PyList_SetItem(tar, n, clone(src[n]) );
			
			return tar;
		}

		PyObject *clone(V8OBJECT src) { 			// clone v8 object into python object
			PyObject *tar = PyDict_New();
			V8ARRAY keys = src.GetPropertyNames();
			
//printf(TRACE "clone v8>>py object keys=%d\n",keys->Length());
			
			for (int n=0,N=keys.Length(); n<N; n++) {
				V8VALUE key = keys[n];
				PyDict_SetItemString(tar, V8STR(key), clone( src[ V8TOSTR(key) ]));
			}
//printf(TRACE "clone v8>>py object done\n");

			return tar;
		}

		// machine program/step interface
		int run(const V8STACK& args) { 			// Monitor/Program/Step machine	
printf(TRACE "run");
			/*
			err = setup(args);
printf(TRACE "setup err=%d init=%d pcode=%p\n", err, init, pCode);
			
			if (err) 
				return err;
			
			else 
			if ( init || !pCode ) {		// compile the machine
				
				if (pCode) { 			// free old stuff
					Py_XDECREF(pCode);
					Py_XDECREF(pModule);	
					Py_XDECREF(pArgs);	
				}
				
				Py_Initialize(); 

				path = strstr(port,"\n") ? NULL : port;

	//printf(TRACE "compile path=%s port=%s\n",path,port);

				if ( strlen(path) ) { 				// load external module
					pModule = PyImport_Import(PyString_FromString(path));
					//pCode = pModule ? 1 : NULL;
				}

				else {
					// Create a module for this new code
					pModule = PyModule_New(name.c_str());

					// Prime local dictionary with context hash
					pLocals = PyModule_GetDict(pModule);
	//printf(TRACE "locals=%p/\n",pLocals);

					//PyDict_Merge(pLocals, clone(ctx), true);
					PyDict_SetItemString(pLocals, PYCTX, clone( ctx ));	
					PyDict_SetItemString(pLocals, PYERR, PyInt_FromLong(0));
					PyDict_SetItemString(pLocals, PYINIT, PyInt_FromLong(1));

					// Build a tuple to hold external module arguments
					pArgs = PyTuple_New(3);

					// Create global dictonary object (reserved)
					pMain = PyImport_AddModule("__main__");
					pGlobals = PyModule_GetDict(pMain);	
					//PyDict_SetItemString(pGlobals, PYOS, PyModule_GetDict(pModule));
	//printf(TRACE "globals=%p\n",pGlobals);

	//printf(TRACE "compile=\n%s infile=%d\n",code,Py_file_input);
					// Uncomment if there is a need to define ctx at compile
					//PyDict_SetItemString(pLocals, PYPORT, PyString_FromString( port ) );
					//PyDict_SetItemString(pLocals, PYCTX, clone( ctx ));

					// For some reason cant recompile already compiled code.  
					pCode = (PyCodeObject*) Py_CompileString(code.c_str(), "py_traceback", Py_file_input);
				}
			}
			
			if ( pCode ) { // Execute/Program machine
				/ * 
				 * All attempts to redirect Initialize to the anaconda install fail (SetProgramName, SetPythonName, redefine PYTHONHOME,
				 * virtualized, etc, etc).  If PYTHONORIGIN = /usr is the default python install base, we must alias /usr/lib/python2.7 
				 * AND /usr/lib64/python2.7 to the anaconda/lib/python2.7.  The default python (typically python-2.7.5) appears to be 
				 * fully compatible with the anaconda-1.9 python-2.7.6.  Must then override PYTHONHOME to the default PYTHONORIGIN.
				 * * /
				/ *
				Py_SetProgramName("/base/anaconda/bin/python2.7");
				Py_SetPythonHome("/base/anaconda");
				Py_SetPythonHome(PYTHONORIGIN);
//printf(TRACE "initialize %s\n",Py_GetPythonHome());
				* /
				
				if ( strlen(path) ) {			// Step external module
	//printf(TRACE "module path=%s\n",port);
					pFunc = PyObject_GetAttrString(pModule, port);
					//err = PyInt_AsLong( PyRun_String(port, Py_file_input, pGlobals, pLocals) );
					//err = PyRun_SimpleString(port);

					if ( PyCallable_Check(pFunc) ) {
	//printf(TRACE "module step\n");
						PyTuple_SetItem(pArgs, 0, clone(ctx));
						PyTuple_SetItem(pArgs, 1, LOCAL(PYPARM));

						err = PyInt_AsLong( PyObject_CallObject(pFunc, pArgs) );

	//printf(TRACE "module err: %ld\n", err);
						Py_XDECREF(pFunc);

						//latch(ctx,clone( PyTuple_GetItem(pArgs,0) )->ToObject() );
	//monitor("py set ctx[0]",ctx->ToObject()->Get(0)->ToObject());
					}
					
					else 									// Bad call
						err = badCode; 
				}

				else 
				if ( strlen(port) ) {		// Stateful step
	//printf(TRACE "stateful step port=%s\n",port);
					PyDict_SetItemString(pLocals, PYPORT, PyString_FromString(port) );
					PyDict_SetItemString(pLocals, PYTAU, clone(tau) );

					PyEval_EvalCode(pCode,pGlobals,pLocals);
					err = PyInt_AsLong( LOCAL(PYERR) );

					//latch(tau, clone( LOCAL(PYTAU) ));
					////latch(ctx, clone( pLocals )->ToObject() );	
				}

				else {					// Stateless step
	//printf(TRACE "stateless step port=%s\n", port);
					pLocals = PyModule_GetDict(pModule);
					pGlobals = PyModule_GetDict(pMain);	

					PyDict_SetItemString(pLocals, PYPORT, PyString_FromString( port ) );
					PyDict_SetItemString(pLocals, PYCTX, clone( ctx ));
	//printf(TRACE "context cloned\n");
					PyEval_EvalCode(pCode,pGlobals,pLocals);
	//printf(TRACE "code evaled\n");

					//latch(ctx, clone( LOCAL(PYCTX) ).ToObject() );
					////latch(ctx, clone( pLocals )->ToObject() );

					err = PyInt_AsLong( LOCAL(PYERR) );	
				}					
			}
				
			else {
				err = badCode;
				printf(TRACE "compile err=%d\n%s\n", err, code.c_str());
					//Py_Finalize(); // dont do this - will cause segment fault
			}
			
//printf(TRACE "stateless step err=%d\n",err);
			return err;
			*/
		}
		
	private:
		PyObject *pName, *pModule, *pFunc;
		PyCodeObject *pCode, *pCodeTest;
		PyObject *pArgs, *pValue;
		PyObject *pGlobals, *pLocals, *pMain, *pParm;
		str path, port;
};

#define V8POOL(PREFIX,MAX,CLASS) \
CLASS PREFIX##_machine[MAX]; \
\
int PREFIX(const V8STACK& args) { \
	V8SCOPE scope = V8ENTRY(args); \
	std::string name = NAMEARG(args); \
\
	for (int n=0; n<MAX; n++) { \
		if ( PREFIX##_machine[n].name.length() ) \
			if ( PREFIX##_machine[n].name == name ) { \
				int err = PREFIX##_machine[n].run(args); \
				if ( args[2].IsNull() ) PREFIX##_machine[n].name = ""; \
				return err; \
			 } \
	} \
\
	for (int n=0; n<MAX; n++) { \
		if ( ! PREFIX##_machine[n].name.length() ) { \
			PREFIX##_machine[n].name = name; \
			return PREFIX##_machine[n].run(args); \
		} \
	} \
\
	return badPool; \
}

#define MAXMACHINES 10

V8POOL(python, MAXMACHINES, PYMACHINE)

V8OBJECT run(const V8STACK& info) {
	V8SCOPE scope = info.Env();
	V8OBJECT obj = V8OBJECT::New(scope);
	obj[ V8TOSTRING("msg") ] = info[0].ToString();

	return obj;
}

V8OBJECT Init(V8SCOPE scope, V8OBJECT exports) {
	return V8FUNCTION::New(scope, run, "run");
	//exports[ V8TOSTRING("run") ] = V8FUNCTION::New(scope, run, "run"));
	//return exports;
}

NODE_API_MODULE(pythonIF, Init)

// UNCLASSIFIED
