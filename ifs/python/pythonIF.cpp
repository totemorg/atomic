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

/*
#define PYPORTS "ports"		// py hash of port hashes
*/

/*
// Parameters used to wrap python code to provide sql connector and debugging

#define WRAP_ADDTRACE trace
#define WRAP_ADDCATCH false
#define WRAP_ADDSQLCON true
#define WRAP_DBPASS getenv("DB_PASS")
#define WRAP_DBNAME getenv("DB_NAME")
#define WRAP_DBUSER getenv("DB_USER")
#define PYTHONORIGIN getenv("PYTHONORIGIN")
*/

// Danger zone

/*
str indent(str code) {
	int n,N = strlen(code),m,M;
	
	for (n=0,M=0; n<N; n++) if (code[n] == '\n') M++;
	
	str rtn = mac_strclone(N+M+1,"\t");
	
	for (n=0,m=strlen(rtn); n<N; n++) {
		rtn[m++] = code[n];
		if (code[n] == '\n') rtn[m++] = '\t';
	}
	
	rtn[m] = '\0';
	
	return rtn;
}

str wrap(str code,str port,V8OBJECT parm,str idx,str args) {  // wrap user python code in machine interface
	str rtn = mac_strclone(strlen(code)+1000,"");
	
	if (strlen(args)) { // add context front and back end if python args specified

#if WRAP_ADDTRACE
		strcat(rtn, 
			"\n#trace code\n"
			"print 'py>>dumping locals'\n"
			"print locals()\n"
			"print 'py>>importing sys'\n"
			"import sys\n"
			"print sys.path\n"
			"print sys.version\n"
			//"import caffe\n"
			//"print 'TAU imported caffe'\n"
		);
#endif
		
		strcat(rtn,		// add db connector interface 
			"\n#connector interface\n"
		);

		// mysql connection note:
		// import will fail with mysql-connector-python-X installed (rum or rpm installed as root using either
		// python 2.2 or python 2.7).  Will however import under python 2.6.  To fix, we must:
		//
		// 		cp -R /usr/lib/python2.6/site-packages/mysql $CONDA/lib/python2.7/site-packages
		//
		// after "rpm -i mysql-connector-python-2.X"
		
#if WRAP_ADDCATCH
		strcat(rtn,			// add entry-exit excemption catch
			"try:\n"
		);
#endif

#if WRAP_ADDSQLCON

		// install the python2.7 connector (rpm -Uvh mysql-conector-python-2.x.rpm)
		// into /usr/local/lib/python2.7/site-packages/mysql, then copy
		// this mysql folder to the anaconda/lib/python2.7/site-packages.
		
		strcat(rtn,
			"import mysql.connector\n"
//			"print 'TAU imported mysql'\n"
		);
		strcat(rtn,"SQL = mysql.connector.connect(user='");
		strcat(rtn,WRAP_DBUSER);
		strcat(rtn,"', password='");
		strcat(rtn,WRAP_DBPASS);
		strcat(rtn,"', database='");
		strcat(rtn,WRAP_DBNAME);
		strcat(rtn,"')\n");

		// add two sql cursors (more than 2 causes segment fault for some reason)
		int N = 2;
		
		if (N) {
			for (int n=0;n<N;n++)
				sprintf(rtn,"%sSQL%d=SQL.cursor(buffered=True)\n", rtn, n);
		}
#endif

		strcat(rtn,"\n#supplied code\n");		// add user code

#if WRAP_ADDCATCH
		strcat(rtn,indent(code)); 
#else
		strcat(rtn,code); 
#endif
		
		strcat(rtn,		// add entry code for port processing
			"\n#entry code\n"
			"PORTS={"
		);

		V8ARRAY keys = parm->GetOwnPropertyNames();
		char buf[MAX_KEYLEN];
		
		for (int n=0,k=0,N=keys->Length(); n<N; n++) {
			str key = V8TOSTR(keys->Get(n), buf);
			
			sprintf(rtn,"%s%s'%s':%s",rtn,(k++)?",":"",key,key);
		}
		
		strcat(rtn,"}\n");
		
		if (strlen(idx)) 	// if port indexing, 
			sprintf(rtn,	// add call to the desired port providing specified arguments
				"%s\n"
				"if " PYPORT ":\n"
					"\tif %s in PORTS:\n"
						"\t\t" PYERR " = PORTS[%s](%s)\n"
					"\telse:\n"
						"\t\t" PYERR " = 104\n"
				"else:\n"
					"\t" PYERR " = 0\n",
			rtn,idx,idx,args);
			
#if WRAP_ADDSQLCON
		strcat(rtn,  // close sql connection
			"\n#exit code\n"
			"SQL.commit()\n"
			"SQL.close()\n"
		);
#endif
	
#if WRAP_ADDCATCH
		strcat(rtn, 	// catch entry-exit excemptions
			"except rtn:\n"
				"\t" PYERR " = 104\n"
		);
#endif
	}
	
	else 		// use user code as-is
		strcat(rtn,code);
	
	return rtn;
}
*/

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
//printf(TRACE "clone list len=%d\n",N);
				V8ARRAY tar = v8::Array::New(scope,N);
				V8OBJECT Tar = tar->ToObject();
				
				for (int n=0; n<N; n++)
					Tar->Set(n,clone( PyList_GetItem(src,n) ));
					
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
				return V8TONUMBER(0.0);
		}
		
		PyObject *clone(V8VALUE src) {  			// clone v8 object into python object
//printf(TRACE " clone str=%d num=%d arr=%d obj=%d\n ",src->IsString(),src->IsNumber(),src->IsArray(),src->IsObject() );
			char buf[MAX_KEYLEN];
			
			if ( src->IsString() )
				return PyString_FromString( V8TOSTR(src, buf) );
			
			else
			if ( src->IsNumber() )
				return PyFloat_FromDouble( src->ToNumber()->Value() );
				
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
				return PyLong_FromVoidPtr(NULL);
				
			else
			if ( src->IsFunction() )
				return PyLong_FromVoidPtr(NULL);
				
			else
				return PyFloat_FromDouble( 0.0 );

		}
	
		PyObject *clone(V8ARRAY src) { 				// clone v8 array into python object
			int N = src->Length();
			PyObject *tar = PyList_New(N);
			
//printf(TRACE "clone list len=%d\n",N);
			
			for (int n=0; n<N; n++) 
				PyList_SetItem(tar, n, clone(src->Get(n)) );
			
			return tar;
		}

		PyObject *clone(V8OBJECT src) { 			// clone v8 object into python object
			PyObject *tar = PyDict_New();
			V8ARRAY keys = src->GetOwnPropertyNames();
			char buf[MAX_KEYLEN];
			
//printf(TRACE "clone object keys=%d\n",keys->Length());
			
			for (int n=0,N=keys->Length(); n<N; n++) {
				str key = V8TOSTR(keys->Get(n), buf);
				
				PyDict_SetItemString(tar, key, clone(V8INDEX(src,key)));
			}

			return tar;
		}
				
		// machine program/step interface
		int call(const V8STACK& args) { 			// Monitor/Program/Step machine	
			
			err = setup(args);
			
			if (err) 
				return err;
			
			else
			if ( !init ) { 					// Program module
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
				
				Py_Initialize(); 
				
				path = strstr(port,"\n") ? NULL : port;
				init = true;

//printf(TRACE "compile path=%s port=%s\n",path,port);
				
				if ( strlen(path) ) { 				// load external module
					pModule = PyImport_Import(PyString_FromString(path));
					if ( !pModule ) return badModule;
				}
				
				else {
					if (pCode) { 			// free old stuff
						Py_XDECREF(pCode);
						Py_XDECREF(pModule);	
						Py_XDECREF(pArgs);	
					}
					
					// Create a module for this new code
					pModule = PyModule_New(name);
					if ( !pModule ) return badModule;

					// Prime local dictionary with context hash
					pLocals = PyModule_GetDict(pModule);
//printf(TRACE "locals=%p/\n",pLocals);
					
					//PyDict_Merge(pLocals, clone(ctx), true);
					PyDict_SetItemString(pLocals, PYCTX, clone( ctx ));	
					
					PyDict_SetItemString(pLocals, PYERR, PyInt_FromLong(0));
					
					// Build a tuple to hold external module arguments
					pArgs = PyTuple_New(3);

					// Create global dictonary object (reserved)
					pMain = PyImport_AddModule("__main__");
					pGlobals = PyModule_GetDict(pMain);	
//printf(TRACE "globals=%p\n",pGlobals);
					
					/*
					str comp = wrap(  // generate code to compile
						code,
						port,
						V8INDEX(ctx,PYPORTS)->ToObject(),
						PYPORT,
						PYCTX "," PYPORTS "[" PYPORT "]"
					);
					*/

//printf(TRACE "compile=\n%s infile=%d\n",code,Py_file_input);
					// Uncomment if there is a need to define ctx at compile
					//PyDict_SetItemString(pLocals, PYPORT, PyString_FromString( port ) );
					//PyDict_SetItemString(pLocals, PYCTX, clone( ctx ));
					
					// For some reason cant recompile already compiled code.  
					pCodeTest = (PyCodeObject*) Py_CompileString(code, "py_traceback", Py_file_input);
					
					if (pCodeTest) {
						pCode = pCodeTest;
						err = 0;
					}
					
					else {
						pCode = NULL;
						err = badCode;
					}

//printf(TRACE "pcode %s\n", (pCode ? "generated" : "missing"));

					return err;
					//Py_Finalize(); // dont do this - will cause segment fault
				}
			}
			
//printf(TRACE "pcode %s\n", (pCode ? "generated" : "missing"));
			
			if (!pCode) 
				err = badCode;
			
			else		
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
//printf(TRACE "Stateful step port=%s\n",port);
				PyDict_SetItemString(pLocals, PYPORT, PyString_FromString(port) );
				PyDict_SetItemString(pLocals, PYTAU, clone(tau) );

				PyEval_EvalCode(pCode,pGlobals,pLocals);
				err = PyInt_AsLong( LOCAL(PYERR) );
				
				set(tau, clone( LOCAL(PYTAU) ));
				//set(ctx, clone( pLocals )->ToObject() );	
			}
			
			else {					// Stateless step
//printf(TRACE "Stateless step\n");
				pLocals = PyModule_GetDict(pModule);
				pGlobals = PyModule_GetDict(pMain);	

				PyDict_SetItemString(pLocals, PYPORT, PyString_FromString( port ) );
				PyDict_SetItemString(pLocals, PYCTX, clone( ctx ));

				PyEval_EvalCode(pCode,pGlobals,pLocals);

				set(ctx, clone( LOCAL(PYCTX) )->ToObject() );
				//set(ctx, clone( pLocals )->ToObject() );
				
				err = PyInt_AsLong( LOCAL(PYERR) );						
			}
					
//printf(TRACE "err=%d\n",err);
			
			return err;
		}
		
	private:
		PyObject *pName, *pModule, *pFunc;
		PyCodeObject *pCode, *pCodeTest;
		PyObject *pArgs, *pValue;
		PyObject *pGlobals, *pLocals, *pMain, *pParm;
		str path, port;
};

/*
 * Generates MAXMACHINES number of PYMACHINE-class machines of type PYTHON.
 * An engine accepts a V8 argument list args = [name string, port string, ctx array hash,
 * ctx array hash, context hash, and code string) and returns a V8 error scope handle.  Engine names
 * are of the form Client.Engine.Instance to uniquely identify a workflow engine, or of the form
 * Engine to uniquely identify standalone engines.  New engines threads can be freely added to the 
 * thread pool until the pool is exhausted.
 * */

V8POOL(python,MAXMACHINES,PYMACHINE);

// UNCLASSIFIED
