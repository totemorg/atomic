// UNCLASSIFIED

/*
Defines a V8 machine pool generator:
 
 		V8POOL(MAC,MAX,CLS)
 
to generate MAX number of CLS-class machines MAX_machine[0, ...] each machine accepting a list of either:
 
 		[ name string, port string, event list ]
 		[ name string, code string, parm hash ]
 
and returning an interger error code.  CLS specifies the technology being interfaced (opencv, python, ....).

A machine name (typically "Client.Engine.Instance") uniquely identifies the engine's compute thread.  Compute threads
can be freely added to the pool until the pool becomes full.  
 
When stepping a machine, port specifies either the name of the input port on which arriving events [ tau, tau, ... ] list 
are latched, or the name of the output port on which departing events [ tau, tau, ... ] are latched; thus stepping the 
machine in a stateful way (to maximize data restfulness).  Given, however, an empty port will, the machine is 
stepped in a stateless way: by latching events to all input ports, then latching all output ports to events.
 
When programming a machine with code, parm = { ports: {name1: {...}, name2: {...}, ...}, tau: [tau,tau,...], ... } defines 
parameters to machine i/o ports and i/o events.  Empty code will monitor current machine parameters.

See the opencv.cpp, python.cpp, etc machines for usage examples.  This interface is created using node-gyp with 
the binding.gyp provided.

Implementation notes: 
	google's rapidjson does not provide a useful V8 interface here as (1) its"Value" class conflicts with V8 "Value" 
	class, and (2) passing rapidjson objects to machines is self-defeating.  Similar conflicts occured with the
	nodejs nan module.

References:
	machines/opencv/objdet for an example opencv mac-machine.  
	machines/python for an example python mac-machine.  
	http://izs.me/v8-docs/ for API to V8 engine.
	http://nodejs.org/api/addons.html for node-gyp help.
	macIF.h for machine classes.
 */
 
#include <node.h>

using namespace v8;

#include <macIF.h>

// String functions

int mac_strmatch(str find, str List[]) {
	for (int n=0; List[n]; n++)
		if ( strcmp(find,List[n]) == 0 ) return n;
		
	return -1;
}

str mac_strclone(str src) {
	str rtn = (str) malloc(strlen(src)+1);
	strcpy(rtn,src);
	return rtn;
}

str mac_strclone(int N,str init) {
	str rtn = (str) malloc(N+1);
	strcpy(rtn,init);
	return rtn;
}	

str mac_strcat(str src[]) {
	static char rtn[512];
	
	strcpy(rtn,"");
	for (int n=0;src[n];n++) strcat(rtn,src[n]);	
	return rtn;
}

str mac_strcat(str src[], int n, str insert) {
	src[n] = insert;
	return mac_strcat(src);
}

str mac_strjson(str buffs[], int N) {
	int n,len=0;
	str rtn;
	
	for (n=0;n<N;n++) len += strlen(buffs[n]);
	
	rtn = mac_strclone(len+2+N,"[");
	
	for (n=0;n<N-1;n++) {
		strcat(rtn,buffs[n]);
		strcat(rtn,",");
	}
	
	if (N) strcat(rtn,buffs[n]);
	
	strcat(rtn,"]");
	
	return rtn;
}

str mac_strclone(V8STRING src) {
	str rtn = new char[src->Length()+1];
	
	if (rtn) {
		int len = src->WriteUtf8( rtn );
		rtn[len] = '\0';
	}
	
	return rtn;
}

// UNCLASSIFIED
