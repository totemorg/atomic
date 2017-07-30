// UNCLASSIFIED

/*
Reserves a pool of V8 python machines:
 
 		error = python.call( [ id string, code string, context hash ] )
 
and returns an interger error code.

A machine id (typically "Name.Client.Instance") uniquely identifies the machine's compute thread.  Compute
threads can be freely added to the pool until the pool becomes full.  
 
When stepping a machine, code specifies either the name of the input port on which the arriving context 
is latched, or the name of the output port on which the departing context is latched; thus stepping
the machine in a stateful way (to maximize data restfulness).  Given, however, an empty port will, the machine is 
stepped in a stateless way: by latching events to all input ports, then latching all output ports to events.

When programming a machine with code, the context = { ports: {name1: {...}, name2: {...}, ...}, ...} defines 
parameters to input-output ports, and port = "python program\n" (or "module name"  to import 
under $PYTHONPATH).  Empty code will monitor current machine parameters.

See the tauIF.cpp for usage examples.  This interface is created using node-gyp with the binding.gyp provided.
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

// tau machine interface
#include <macIF.h>

// Machine specs

#define TRACE "py>"
#define TAUIDX(X) "TAU['" X "']"
#define LOCAL(X) PyDict_GetItemString(pLocals,X)

// TAU hash members to pass to standalone machine

#define PYTAU "tau"		// py var for list of event tokens
#define PYPORT "port"		// py string for function (aka port) to call stateful machine, or empty to call stateless machine.
#define PYERR "err"			// py number to return erro code
#define PYPARM "parm" 		// py hash reserved to return hash from external modules
#define PYPORTS "ports"		// py hash of port hashes

// Parameters used to wrap python code to provide sql connector and debugging

#define WRAP_ADDTRACE false
#define WRAP_ADDCATCH false
#define WRAP_ADDCONNECT true
#define WRAP_DBPASS getenv("DB_PASS")
#define WRAP_DBNAME getenv("DB_NAME")
#define WRAP_DBUSER getenv("DB_USER")
#define PYTHONORIGIN getenv("PYTHONORIGIN")

// Danger zone

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
	
	if (strlen(args)) { // add tau front and back end if python args specified

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

#if WRAP_ADDCONNECT

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
			/*
			strcat(rtn,"TAU['cur'] = [");

			for (int n=0; n<N; n++) {
				sprintf(rtn,"%s%s%s",rtn,n?",":"","TAU['cnx'].cursor(buffered=True)");
			}
			strcat(rtn,"]\n");
			* */
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
		char buf[MAXSTR];
		
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
			
#if WRAP_ADDCONNECT
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

class PYMACHINE : public MACHINE {  				// Python machine extends MACHINE class
	public:
	
		// inherit the base machine
		PYMACHINE(void) : MACHINE() { 
			pModule = NULL;
			pCode = NULL;
		};

		~PYMACHINE(void) {
		};
	
		// provide V8-python converters
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
			if (PyFunction_Check(src)) {
				
			}
			else
			if (PyFloat_Check(src)) 
				return V8TONUMBER(PyFloat_AsDouble(src));
			else
			if (PyInt_Check(src)) 
				return V8TONUMBER(PyInt_AsLong(src));
			else
			if (PyString_Check(src)) 
				return V8TOKEY(PyString_AsString(src));
			else 							// might want to check for null and funcion too
				return V8TONUMBER(0.0);
		}
		
		PyObject *clone(V8VALUE src) {  			// clone v8 object into python object
//printf(TRACE " clone str=%d num=%d arr=%d obj=%d\n ",src->IsString(),src->IsNumber(),src->IsArray(),src->IsObject() );
			char buf[MAXSTR];
			
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
			else 									// might want to check for null and function too
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
			char buf[MAXSTR];
			
//printf(TRACE "clone object keys=%d\n",keys->Length());
			
			for (int n=0,N=keys->Length(); n<N; n++) {
				str key = V8TOSTR(keys->Get(n), buf);
				
				PyDict_SetItemString(tar, key, clone(V8INDEX(src,key)));
			}

			return tar;
		}
				
		// define program/step interface
		int call(const V8STACK& args) { 			// Monitor/Program/Step machine	
			
			if (setup(args)) 
				return err;
			
			else
			if ( init ) { 					// Program module
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
				
				if ( path ) { 				// load external module
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

					// Prime local dictionary with context parm hash
					pLocals = PyModule_GetDict(pModule);
//printf(TRACE "locals=%p/\n",pLocals);
					
					PyDict_Merge(pLocals, clone(parm), true);
					
					PyDict_SetItemString(pLocals, PYERR, PyInt_FromLong(0));
					
					// Build a tuple to hold external module arguments
					pArgs = PyTuple_New(3);

					// Create global dictonary object (reserved)
					pMain = PyImport_AddModule("__main__");
					pGlobals = PyModule_GetDict(pMain);	
//printf(TRACE "globals=%p\n",pGlobals);

					// Compile code with empty port
					code = port;
					port = "";
					
					str comp = wrap(
						code,
						port,
						V8INDEX(parm,PYPORTS)->ToObject(),
						PYPORT,
						PYTAU "," PYPORTS "[" PYPORT "]"
					);

//printf(TRACE "pgm compile=\n%s pfi=%d\n",comp,Py_file_input);

					// For some reason cant recompile already compiled code.  
					pCodeTest = (PyCodeObject*) Py_CompileString(comp, "py>traceback", Py_file_input);

					if (pCodeTest) pCode = pCodeTest;
					else
						printf(TRACE "reprogram ignored!!\n");
					
					//Py_Finalize(); // dont do this - will cause segment fault
				}
			}
			
			if (!pCode) 
				err = badInit;
			
			else		
			if (path) {			// Step external module
//printf(TRACE "find port=%s\n",port);
				pFunc = PyObject_GetAttrString(pModule, port);
				//err = PyInt_AsLong( PyRun_String(port, Py_file_input, pGlobals, pLocals) );
				//err = PyRun_SimpleString(port);
					
				if ( PyCallable_Check(pFunc) ) {
//printf(TRACE "module step\n");
					PyTuple_SetItem(pArgs, 0, clone(tau));
					PyTuple_SetItem(pArgs, 1, LOCAL(PYPARM));

					err = PyInt_AsLong( PyObject_CallObject(pFunc, pArgs) );

//printf(TRACE "module err: %ld\n", err);
					Py_XDECREF(pFunc);

					set(tau,clone( PyTuple_GetItem(pArgs,0) ));
//monitor("py set tau[0]",tau->ToObject()->Get(0)->ToObject());
				}
				else 									// Bad call
					err = badInit; 
			}
			
			else 
			if (strlen(port)) {		// Stateful step
//printf(TRACE "port call=%s\n",port);
				PyDict_SetItemString(pLocals, PYPORT, PyString_FromString(port) );
				PyDict_SetItemString(pLocals, PYTAU, clone(tau) );

				PyEval_EvalCode(pCode,pGlobals,pLocals);
				err = PyInt_AsLong( LOCAL(PYERR) );
				
				set(tau, clone( LOCAL(PYTAU) ));
			}
			
			else {					// Stateless step
//printf(TRACE "portless call\n");

				pLocals = PyModule_GetDict(pModule);
				pGlobals = PyModule_GetDict(pMain);	

				PyDict_SetItemString(pLocals, PYPORT, PyString_FromString("") );
				PyDict_SetItemString(pLocals, PYTAU, clone( tau ));

				PyEval_EvalCode(pCode,pGlobals,pLocals);

				set(tau, V8TOARRAY(clone( LOCAL(PYTAU) )));
				
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
		str path, code;
};

/*
 * Generates MAXMACHINES number of PYMACHINE-class machines of type PYTHON.
 * An engine accepts a V8 argument list args = [name string, port string, tau array hash,
 * tau array hash, parm hash, and code string) and returns a V8 error scope handle.  Engine names
 * are of the form Client.Engine.Instance to uniquely identify a workflow engine, or of the form
 * Engine to uniquely identify standalone engines.  New engines threads can be freely added to the 
 * thread pool until the pool is exhausted.
 * */

V8POOL(python,MAXMACHINES,PYMACHINE);

// UNCLASSIFIED
