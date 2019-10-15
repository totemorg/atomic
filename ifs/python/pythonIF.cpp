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

#define MAXMACHINES 64

// Python interface

#include <Python.h>

// V8 interface

#include <v8.h>
using namespace v8;

// Standard interface

#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
using namespace std;

// machine interface
#include <macIF.h>

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
	
		// machine V8-python converters
		V8VALUE clone(PyObject *src) { 				// clone python value into v8 value
			if (PyList_Check(src)) {
				int N = PyList_Size(src);
//printf(TRACE "clone py>>v8 list len=%d\n",N);
				V8ARRAY tar = v8::Array::New(scope,N);
				V8OBJECT Tar = tar->ToObject();
				
				for (int n=0; n<N; n++) {
					Tar->Set(n,clone( PyList_GetItem(src,n) ));
//printf(TRACE "clone py>>v8[%d] done\n",n);
				}
					
				return tar;
			}
			
			else
			if (PyDict_Check(src)) {
				V8OBJECT tar = v8::Object::New(scope);
				PyObject *key,*value;
				Py_ssize_t pos = 0;
				
				while (PyDict_Next(src,&pos,&key,&value)) {
					str Key = PyString_AsString(key);
					tar->Set(V8TOKEY(Key), clone( value ) );
				}
				
				return tar;
			}
			
			else
			if (PyFunction_Check(src)) 
				return V8TONUMBER(0.0);
			
			else
			if (PyFloat_Check(src)) 
				return V8TONUMBER(PyFloat_AsDouble(src));
			
			else
			if (PyInt_Check(src)) 
				return V8TONUMBER(PyInt_AsLong(src));
			
			else
			if (PyString_Check(src)) 
				return V8TOKEY(PyString_AsString(src));
			
			else
			if (src == Py_None)
				return V8TONUMBER(0.0);  // should return a V8NULL but not sure how to do this
				
			else 
				return V8TONUMBER(0.0);
		}
		
		PyObject *clone(V8VALUE src) {  			// clone v8 object into python object
//printf(TRACE "clone v8>>py str=%d num=%d arr=%d obj=%d null=%d\n ",  src->IsString(),src->IsNumber(),src->IsArray(),src->IsObject(),src->IsNull() );
			char buf[MAX_CODELEN];
			
			if ( src->IsString() )
				return PyString_FromString( V8TOSTR(src, buf) );
			
			else
			if ( src->IsNumber() )
				return PyFloat_FromDouble( src->ToNumber(scope)->Value() );
				
			else
			if ( src->IsArray() ) {
				V8ARRAY v = V8TOARRAY(src); //Array::Cast(src);
				return clone( v );
			}
			
			else
			if ( src->IsObject() )
				return clone(src->ToObject());
				
			else
			if ( src->IsNull() )
				return Py_None; //PyLong_FromVoidPtr(NULL);
				
			else
			if ( src->IsFunction() )
				return Py_None;  //PyLong_FromVoidPtr(NULL);
				
			else
				return PyFloat_FromDouble( 0.0 );

		}
	
		PyObject *clone(V8ARRAY src) { 				// clone v8 array into python object
			int N = src->Length();
			PyObject *tar = PyList_New(N);
			
//printf(TRACE "clone v8>>py list len=%d\n",N);
			
			for (int n=0; n<N; n++) 
				PyList_SetItem(tar, n, clone(src->Get(n)) );
			
			return tar;
		}

		PyObject *clone(V8OBJECT src) { 			// clone v8 object into python object
			PyObject *tar = PyDict_New();
			V8ARRAY keys = src->GetOwnPropertyNames();
			char buf[MAX_KEYLEN];
			
//printf(TRACE "clone v8>>py object keys=%d\n",keys->Length());
			
			for (int n=0,N=keys->Length(); n<N; n++) {
				str key = V8TOSTR(keys->Get(n), buf);
				
				PyDict_SetItemString(tar, key, clone(V8INDEX(src,key)));
//printf(TRACE "clone v8>>py key=%s\n", buf);
			}
//printf(TRACE "clone v8>>py object done\n");

			return tar;
		}
				
		// machine program/step interface
		int call(const V8STACK& args) { 			// Monitor/Program/Step machine	

			err = setup(args);
//printf(TRACE "setup err=%d init=%d pcode=%p\n", err, init, pCode);
			
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
					pModule = PyModule_New(name);

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
					pCode = (PyCodeObject*) Py_CompileString(code, "py_traceback", Py_file_input);
				}
			}
			
			if ( pCode ) { // Execute/Program machine
				/* 
				 * All attempts to redirect Initialize to the anaconda install fail (SetProgramName, SetPythonName, redefine PYTHONHOME,
				 * virtualized, etc, etc).  If PYTHONORIGIN = /usr is the default python install base, we must alias /usr/lib/python2.7 
				 * AND /usr/lib64/python2.7 to the anaconda/lib/python2.7.  The default python (typically python-2.7.5) appears to be 
				 * fully compatible with the anaconda-1.9 python-2.7.6.  Must then override PYTHONHOME to the default PYTHONORIGIN.
				 * */
				/*
				Py_SetProgramName("/base/anaconda/bin/python2.7");
				Py_SetPythonHome("/base/anaconda");
				Py_SetPythonHome(PYTHONORIGIN);
//printf(TRACE "initialize %s\n",Py_GetPythonHome());
				*/
				
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

						//set(ctx,clone( PyTuple_GetItem(pArgs,0) )->ToObject() );
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

					set(tau, clone( LOCAL(PYTAU) ));
					//set(ctx, clone( pLocals )->ToObject() );	
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

					set(ctx, clone( LOCAL(PYCTX) )->ToObject() );
					//set(ctx, clone( pLocals )->ToObject() );

					err = PyInt_AsLong( LOCAL(PYERR) );	
				}					
			}
				
			else {
				err = badCode;
				printf(TRACE "compile err=%d\n%s\n", err, code);
					//Py_Finalize(); // dont do this - will cause segment fault
			}
			
//printf(TRACE "stateless step err=%d\n",err);
			return err;
		}
		
	private:
		PyObject *pName, *pModule, *pFunc;
		PyCodeObject *pCode, *pCodeTest;
		PyObject *pArgs, *pValue;
		PyObject *pGlobals, *pLocals, *pMain, *pParm;
		str path, port;
};

// Generate a pool of machine python_machine[0 ... MAXMACHINES-1].

V8POOL(python,MAXMACHINES,PYMACHINE);

// UNCLASSIFIED
