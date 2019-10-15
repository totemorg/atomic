// UNCLASSIFIED

/*
Use:
 
 		V8POOL(MAC,MAX,CLS)
 
to generate MAX CLS-machines named MAC_machine[0, ... MAX-1].  Each MAC_machine(args) accepts
a list of args = [ name string, code string, ctx hash or list ] || [ name string, port string, ctx hash or list ] ||
[ name string, code string, NULL ctx ] to program, execute, or reset a machine.  If an error occurs, a 
non-zero error code is returned.  CLS specifies the technology (opencv, python, ....) being interfaced.

A machine name (typically "Client.Engine.Instance") uniquely identifies the engine's compute thread.  
Compute threads are automatically added to the pool (when the args ctx is not NULL), or removed 
from the pool (when the args ctx is NULL).  An error is returned should the pool become full.  
 
When stepping a machine, port specifies either the name of the input port on which arriving events [ tau, tau, ... ] 
are latched, or the name of the output port on which departing events [ tau, tau, ... ] are latched; thus stepping the 
machine in a stateful way (to maximize data restfulness).  An empty port will cause the machine to be 
stepped in a stateless way with the supplied context hash.
 
When programming a machine, the context hash = { ports: {name1: {...}, name2: {...}, ...}, key: value, .... } defines 
parameters to/from a machine.  Empty code will cause the machine to monitor its current parameters.

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
 
#include <string.h>
#include <stdlib.h>

#define TRACE "mac>"
#define QUOTE(X) #X
#define MAX_KEYLEN 512
#define MAX_CODELEN 65536

// v8 interface

// getters and setters

#define V8DEF(TAR,VAL,NAME) MACHINE::set(TAR,QUOTE(NAME),VAL)
#define V8SET(TAR,SRC,NAME) MACHINE::set(TAR,QUOTE(NAME),SRC.NAME)
#define V8INDEX(X,NAME) X->Get(V8TOKEY(NAME))
#define V8GETVALUE(X,KEY) V8INDEX(X,KEY)->ToNumber(scope)->Value()
#define V8GETSTRING(X,KEY) mac_strclone( V8INDEX(X,KEY)->ToString() )
#define V8GETARRAY(X,KEY) Local<v8::Array>::Cast( V8INDEX(X,KEY) )
#define V8GETOBJECT(X,KEY) V8INDEX(X,KEY)->ToObject()

#define V8NULLSTR (str) ""
#define V8NULLARR v8::Array::New(scope,0)
#define V8NULLOBJ v8::Object::New(scope)

// convertors

#define V8TOSTR(X,B) mac_strclone(X->ToString(),B)
#define V8TOSTRING(X) mac_strclone(X->ToString())
#define V8TOKEY(X) v8::String::NewFromUtf8(scope,X)
#define V8TOARRAY(X) Local<v8::Array>::Cast(X)
#define V8TOOBJECT(X) X->ToObject()
#define V8TONUMBER(X) v8::Number::New(scope,X)
#define V8ENTRY(X) X.GetIsolate()
#define V8EXIT(X)  GetReturnValue().Set(Integer::New(scope, X))

// basic data type

typedef char *str;
typedef Local<v8::Object> V8OBJECT;
typedef Local<v8::Array> V8ARRAY;
typedef Local<v8::String> V8STRING;
typedef Handle<v8::Value> V8HANDLE;
typedef Local<v8::Value> V8VALUE;
typedef FunctionCallbackInfo<v8::Value> V8STACK;
typedef void V8MACHINE(const V8STACK& args);

// Machine argument getters, entry and exit 

#define NAMEARG(X,B) (X[0]->IsString() ? V8TOSTR(X[0],B) : V8NULLSTR)
#define CODEARG(X,B) (X[1]->IsString() ? V8TOSTR(X[1],B) : V8NULLSTR)
#define TAUARG(X)  (X[2]->IsArray()  ? V8TOARRAY(X[2])  : V8NULLARR)
#define CTXARG(X) (X[2]->IsObject() ? V8TOOBJECT(X[2]) : V8NULLOBJ)

// Error codes

#define badModule 	101
#define badStep 	102
#define badPort	103
#define badCode 104
#define badPool		105
#define badArgs		106

// String minipulators

int
	mac_strmatch(str find, str List[]);

str 
	mac_strclone(str src),
	mac_strclone(int N,str init),
	mac_strclone(V8STRING src),
	mac_strclone(V8STRING src, str buf),
	mac_strcat(str src[]),
	mac_strcat(str src[], int n, str insert),
	mac_strjson(str buffs[], int N);

class MACHINE {
	public:
		MACHINE(void) {
			steps = depth = drops = err = 0; 
			name = code = NULL;		// NULL signals machine available
			scope = NULL; 
			init = false;
		}
		
		~MACHINE(void) {
			if (name) {
				printf("machine ~delete=%s\n", name);
				free(name);
				name = NULL;
			}
		}
	
		int monitor(void) {   // monitor used for debugging machine 
			V8ARRAY keys = ctx->GetOwnPropertyNames();
			char buf[MAX_KEYLEN];
			
			printf(TRACE "%s keys=%d\n",name,keys->Length());
			
			for (int n=0,N=keys->Length(); n<N; n++) {
				str key = V8TOSTR(keys->Get(n), buf);
				V8VALUE val = V8INDEX(ctx,key);
				printf(TRACE "key=%s isobj=%d\n",key,val->IsObject());
			}
			
			return err;
		}
		
		int setup(const V8STACK& args) {   // setup used when machine is called
			err = 0;	// signal ok
			scope = V8ENTRY(args);  // retain scope for V8 garbage collection
			
			if ( args.Length() != 3 ) return badArgs;	// text engine args list
			if ( !args[0]->IsString() ) return badArgs;  // test engine name string
			if ( !args[1]->IsString() ) return badArgs;	// test engine code/port string
			
			port = code = CODEARG(args, codebuf);
			if ( strlen(code) > MAX_CODELEN) return badCode;

			if ( args[2]->IsNull() ) {  // init/clear/reset the machine
				init = true;
			}
			
			else {	// program/execute the machine
				init = false;
				ctx = CTXARG(args);  // define context or empty object if not an object
				tau = TAUARG(args);	// define event taus or empty list if not a list
	//printf(TRACE "setup name=%s code=%s args=%d initialized=%d err=%d\n",name,code,args.Length(),(int) init, err);
			}
			
			return err;
		}
	
		// machine output argument setters
		void set(V8OBJECT tar, V8OBJECT src) {
			V8ARRAY keys = src->GetOwnPropertyNames();
//printf(TRACE "set keys=%d\n",keys->Length());
			
			for (int n=0,N=keys->Length(); n<N; n++) {
				V8VALUE key = keys->Get(n);
				tar->Set(key,src->Get(key));
			}
		}
		
		void set(V8ARRAY tar, V8VALUE src) {
//printf(TRACE "set array\n");
			if (src->IsArray()) {
				V8ARRAY v = V8TOARRAY(src); //Array::Cast(*src);
				set(tar,v);
			}
			else
			for (int n=0,N=tar->Length(); n<N; n++)
				tar->Set(n,src->ToObject());
		}

		void set(V8ARRAY tar, V8ARRAY src) {
//printf(TRACE "set tars=%d\n",src->Length());
			for (int n=0,M=tar->Length(),N=src->Length(); n<N; n++) {
				if (n<M) 
					tar->Set(n,src->Get(n)->ToObject());  // assume src is an array of objects
				else
					return;
			}
		}
		
		void set(V8OBJECT tar, str key, str val) {
			tar->Set(V8TOKEY(key),V8TOKEY(val));
		}

		void set(V8OBJECT tar, str key, double val) {
			tar->Set(V8TOKEY(key),V8TONUMBER(val));
		}
		
		void set(V8OBJECT tar, str key, float val) {
			tar->Set(V8TOKEY(key),V8TONUMBER(val));
		}
		
		void set(V8OBJECT tar, str key, int val) {
			tar->Set(V8TOKEY(key),V8TONUMBER(val));
		}

		// machine error 
		void throwError(str err) {
			scope->ThrowException(v8::Exception::TypeError(V8TOKEY(err)));
		}

		int steps,depth,drops,err;	// number of steps, current call depth, dropped events, return code
		bool init;	 	// reinit/clear machine flag
		str name, code, port; 		// engine name and engine code/port being latched
		char codebuf[MAX_CODELEN];  // holds code string
		V8OBJECT ctx;		// context parameters
		V8ARRAY tau; 	// port events
		Isolate *scope; 		// v8 garbage collection thread
};

/*
Reserves a pool of machines named MAC_machine[0,1, ... MAX-1].  Each MAC_machine accepts 
an args = [ name, port, ctx ] || [ name, code, ctx ] || [ name, code, null ] list.  If the named machine does 
not exists in the pool, it is added to the pool at the last open slot.  If there are no more open slots, the 
badPool error is returned.
*/

#define V8POOL(MAC,MAX,CLS) \
CLS MAC##_machine[MAX]; \
\
void MAC(const V8STACK& args) { \
	Isolate *scope = V8ENTRY(args); \
	char buf[MAX_KEYLEN]; \
	str name = NAMEARG(args,buf); \
	int n; \
\
	for (n=0; n<MAX; n++) { \
		if ( MAC##_machine[n].name ) \
			if ( strcmp(MAC##_machine[n].name,name) == 0 ) { \
				args.V8EXIT( MAC##_machine[n].call(args) ); \
				if ( args[2]->IsNull() ) MAC##_machine[n].name = NULL; \
				return; \
			 } \
	} \
\
	for (n=0; n<MAX; n++) { \
		if ( ! MAC##_machine[n].name ) { \
			MAC##_machine[n].name = mac_strclone(name); \
			args.V8EXIT( MAC##_machine[n].call(args) ); \
			return; \
		} \
	} \
\
	args.V8EXIT( badPool ); \
}

// UNCLASSIFIED
