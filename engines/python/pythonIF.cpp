// UNCLASSIFIED

/*
 * Reserves a pool of V8 python machines:
 * 
 * 		python(name string, port string, tau list)
 * 		python(name string, parm hash, code string)
 * 
 * A machine name = "Client.Engine.Instance" uniquely identifies the 
 * machine's compute thread and can be freely added to the pool until 
 * the pool becomes full.  
 * 
 * When stepping a machine, the port string specifies either the name of 
 * the input port on which input event taus = [ tau, tau, ... ] list are latched, 
 * or the name of the output port which latches output event taus = [ tau, 
 * tau, ... ] where each event tau is a hash.
 * 
 * When programming a machine, the parm = { ports: {port1: {parm1: ..., parm2: ...}, 
 * port2: {...}, ...}, ...} hash defines parameters to input-output ports, and a
 * code string (or a new-line-less string to import a module under $PYTHONPATH) 
 * to program the machine.
 * 
 * See the tauIF.cpp for usage examples.  This interface is 
 * created using node-gyp with the binding.gyp provided.
 * */
 
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

#define TRACE "python: "
#define MAXMACHINES 64
#define TAUIDX(X) "TAU['" X "']"
#define LOCAL(X) PyDict_GetItemString(pLocals,X)

// TAU hash members to pass to standalone machine

#define PYTAU "tau"		// py var for list of event tokens
#define PYPORT "port"		// py string for function (aka port) to call stateful machine, or empty to call stateless machine.
#define PYERR "err"			// py number to return erro code
#define PYPARM "parm" 		// py hash reserved to return hash from external modules
#define PYPORTS "ports"		// py hash of port hashes

// Parameters used to wrap python code to provide sql connector and debugging

#define WRAP_TRACE false
#define WRAP_CATCH false
#define WRAP_DBUSE true
#define WRAP_DBPASS getenv("DB_PASS")
#define WRAP_DBNAME getenv("DB_NAME")
#define WRAP_DBUSER getenv("DB_USER")
//#define PYTHONORIGIN getenv("PYTHONORIGIN")

// Danger zone

str indent(str code) {
	int n,N = strlen(code),m,M;
	
	for (n=0,M=0; n<N; n++) if (code[n] == '\n') M++;
	
	str err = mac_strclone(N+M+1,"\t");
	
	for (n=0,m=strlen(err); n<N; n++) {
		err[m++] = code[n];
		if (code[n] == '\n') err[m++] = '\t';
	}
	
	err[m] = '\0';
	
	return err;
}

str wrap(str code,str port,V8OBJECT parm,str idx,str args) {  // wrap user python code in machine interface
	str err = mac_strclone(strlen(code)+1000,"");
	
	if (strlen(args)) { // add tau front and back end if python args specified

#if WRAP_TRACE
		strcat(err, 
			"#TAU trace code\n"
			"print 'TAU running python'\n"
			"print locals()\n"
			"print 'TAU importing sys'\n"
			"import sys\n"
			"print sys.path\n"
			"print sys.version\n"
			//"import caffe\n"
			//"print 'TAU imported caffe'\n"
		);
#endif
		
		strcat(err,		// add entry TAU interface hash
			"#TAU entry code\n"
		);

		// mysql connection note:
		// import will fail with mysql-connector-python-X installed (rum or rpm installed as root using either
		// python 2.2 or python 2.7).  Will however import under python 2.6.  To fix, we must:
		//
		// 		cp -R /usr/lib/python2.6/site-packages/mysql $CONDA/lib/python2.7/site-packages
		//
		// after "rpm -i mysql-connector-python-2.X"
		
#if WRAP_CATCH
		strcat(err,			// add entry-exit excemption catch
			"try:\n"
		);
#endif

#if WRAP_DBUSE

		// install the python2.7 connector (rpm -Uvh mysql-conector-python-2.x.rpm)
		// into /usr/local/lib/python2.7/site-packages/mysql, then copy
		// this mysql folder to the anaconda/lib/python2.7/site-packages.
		
		strcat(err,
			"import mysql.connector\n"
//			"print 'TAU imported mysql'\n"
		);
		strcat(err,"SQL = mysql.connector.connect(user='");
		strcat(err,WRAP_DBUSER);
		strcat(err,"', password='");
		strcat(err,WRAP_DBPASS);
		strcat(err,"', database='");
		strcat(err,WRAP_DBNAME);
		strcat(err,"')\n");

		// add two sql cursors (more than 2 causes segment fault for some reason)
		int N = 2;
		
		if (N) {
			for (int n=0;n<N;n++)
				sprintf(err,"%sSQL%d=SQL.cursor(buffered=True)\n", err, n);
			/*
			strcat(err,"TAU['cur'] = [");

			for (int n=0; n<N; n++) {
				sprintf(err,"%s%s%s",err,n?",":"","TAU['cnx'].cursor(buffered=True)");
			}
			strcat(err,"]\n");
			* */
		}
#endif

		strcat(err,"#TAU user code\n");		// add user code

#if WRAP_CATCH
		strcat(err,indent(code)); 
#else
		strcat(err,code); 
#endif
		
		strcat(err,		// add exit code for port processing
			"\n#TAU exit code\n"
			"PORTS={"
		);

		V8ARRAY keys = parm->GetOwnPropertyNames();
		
		for (int n=0,k=0,N=keys->Length(); n<N; n++) {
			str key = V8TOSTRING(keys->Get(n)->ToString());
			
			sprintf(err,"%s%s'%s':%s",err,(k++)?",":"",key,key);
		}
		
		strcat(err,"}\n");
		
		if (strlen(idx)) 	// if port indexing, 
			sprintf(err,	// add call to the desired port providing specified arguments
				"%s\n"
				"if " PYPORT ":\n"
					"\tif %s in PORTS:\n"
						"\t\t" PYERR " = PORTS[%s](%s)\n"
					"\telse:\n"
						"\t\t" PYERR " = 104\n"
				"else:\n"
					"\t" PYERR " = 0\n",
			err,idx,idx,args);
			
#if WRAP_DBUSE
		strcat(err,  // close sql connection
			"\n"
			"SQL.commit()\n"
			"SQL.close()\n"
		);
#endif
	
#if WRAP_CATCH
		strcat(err, 	// catch entry-exit excemptions
			"except err:\n"
				"\t" PYERR " = 104\n"
		);
#endif
	}
	else 		// use user code as-is
		strcat(err,code);
	
	return err;
}

class PYMACHINE : public MACHINE {  				// Python machine extends MACHINE class
	public:
		PYMACHINE(void) : MACHINE() { 
			pModule = NULL;
			pCode = NULL;
		};

		V8VALUE clone(PyObject *src) { 				// clone python value into v8 value
			if (PyList_Check(src)) {
				int N=PyList_Size(src);
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

			if ( src->IsString() )
				return PyString_FromString( V8TOSTRING(src->ToString()) );
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
			
//printf(TRACE "clone object keys=%d\n",keys->Length());
			
			for (int n=0,N=keys->Length(); n<N; n++) {
				str key = V8TOSTRING(keys->Get(n)->ToString());
				
				PyDict_SetItemString(tar, key, clone(V8INDEX(src,key)));
			}

			return tar;
		}
				
		int call(const V8STACK& args) { 			// Monitor/Program/Step machine	
			
			if (setup(args)) return err;

			if ( init ) { 					// Program module
				//Py_SetProgramName("/base/anaconda/bin/python2.7");
				//Py_SetPythonHome("/base/anaconda");
/* 
 * All attempts to redirect Initialize to the anaconda install fail (SetProgramName, SetPythonName, redefine PYTHONHOME,
 * virtualized, etc, etc).  If PYTHONORIGIN = /usr is the default python install base, we must alias /usr/lib/python2.7 
 * AND /usr/lib64/python2.7 to the anaconda/lib/python2.7.  The default python (typically python-2.7.5) appears to be 
 * fully compatible with the anaconda-1.9 python-2.7.6.  Must then override PYTHONHOME to the default PYTHONORIGIN.
 * */
				//Py_SetPythonHome(PYTHONORIGIN);
//printf(TRACE "initialize %s\n",Py_GetPythonHome());

				Py_Initialize(); 
				
				if ( path ) { 				// load external module
					pModule = PyImport_Import(PyString_FromString(path));
					if ( !pModule ) return badModule;
				}
				else { 						// compile code 
					if (pCode) { 			// free old stuff
						Py_XDECREF(pCode);
						Py_XDECREF(pModule);
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

					str comp = wrap(
						code,
						port,
						V8INDEX(parm,PYPORTS)->ToObject(),
						PYPORT,
						PYTAU "," PYPORTS "[" PYPORT "]"
					);

//printf(TRACE "pgm compile=\n%s\n",comp);

					pCode = (PyCodeObject*) Py_CompileString(comp, "pycode", Py_file_input);
					//Py_Finalize(); // dont do this - will cause segment fault
				}
			}
			
			if (!pCode) 
				err = badCompile;
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
					err = badCall; 
			}
			else 					// Step compiled module
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
		PyCodeObject *pCode;
		PyObject *pArgs, *pValue;
		PyObject *pGlobals, *pLocals, *pMain, *pParm;
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
