// UNCLASSIFIED

#include <string.h>
#include <stdlib.h>

#define TRACE "machine: "

// v8 interface

#define QUOTE(X) #X

// getters and setters

#define V8DEF(TAR,VAL,NAME) MACHINE::set(TAR,QUOTE(NAME),VAL)
#define V8SET(TAR,SRC,NAME) MACHINE::set(TAR,QUOTE(NAME),SRC.NAME)
#define V8INDEX(X,NAME) X->Get(V8TOKEY(NAME))
#define V8GETVALUE(X,KEY) V8INDEX(X,KEY)->ToNumber()->Value()
#define V8GETSTRING(X,KEY) mac_strclone( V8INDEX(X,KEY)->ToString() )
#define V8GETARRAY(X,KEY) Local<v8::Array>::Cast( V8INDEX(X,KEY) )
#define V8GETOBJECT(X,KEY) V8INDEX(X,KEY)->ToObject()

#define V8NULLSTR (str) ""
#define V8NULLARR v8::Array::New(scope,0)
#define V8NULLOBJ v8::Object::New(scope)

// convertors

#define V8TOSTRING(X) mac_strclone(X->ToString())
#define V8TOKEY(X) v8::String::NewFromUtf8(scope,X)
#define V8TOARRAY(X) Local<v8::Array>::Cast(X)
#define V8TOOBJECT(X) X->ToObject()
#define V8TONUMBER(X) v8::Number::New(scope,X)
#define V8ENTRY(X) X.GetIsolate()
#define V8EXIT(X)  GetReturnValue().Set(Integer::New(scope, X))

#define V8JSONIFY \
	outlen += strlen(buff); \
\
	for (i=0; i<features; i++) { \
		buffs[i] = feature[i].json(); \
		outlen += strlen(buffs[i]); \
	} \
\
	out = mac_strclone(outlen+5+features,"{"); \
	strcat(out,buff); \
	strcat(out,"["); \
\
	for (i=0; i<features-1; i++) { \
		strcat(out,buffs[i]); \
		strcat(out,","); \
	} \
\
	if (features) strcat(out,buffs[i]); \
\
	strcat(out,"]}");


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

#define NAMEARG(X) (X[0]->IsString() ? V8TOSTRING(X[0]) : V8NULLSTR)
#define PORTARG(X) (X[1]->IsString() ? V8TOSTRING(X[1]) : V8NULLSTR)
#define TAUARG(X)  (X[2]->IsArray()  ? V8TOARRAY(X[2])  : V8NULLARR)
#define PARMARG(X) (X[1]->IsObject() ? V8TOOBJECT(X[1]) : V8NULLOBJ)
#define CODEARG(X) (X[2]->IsString() ? V8TOSTRING(X[2]) : V8NULLSTR)

// Error codes

#define badModule 	101
#define badCall 	102
#define badCompile 	103
#define badEntryExit 104
#define badPool		105
#define badArgs		106

// Test for special keys in machine parms

#define ISSQL(X) (strcmp(X,"sql")==0)
#define ISQUERY(X) (strcmp(X,"query")==0)

// String minipulators

int
	mac_strmatch(str find, str List[]);

str 
	mac_strclone(str src),
	mac_strclone(int N,str init),
	mac_strclone(V8STRING src),
	mac_strcat(str src[]),
	mac_strcat(str src[], int n, str insert),
	mac_strjson(str buffs[], int N);

class MACHINE {
	public:
		MACHINE(void) {
			steps = 0; 
			depth = 0; 
			drops = 0; 
			name = ""; 
			port = ""; 
			code = ""; 
			err = 0;
			init = false;
			scope = 0;			
		}
		
		// monitor machine parms for debugging
		void monitor(str msg,V8OBJECT parm) {
			V8ARRAY keys = parm->GetOwnPropertyNames();

			printf(TRACE "%s keys=%d\n",msg,keys->Length());
			
			for (int n=0,N=keys->Length(); n<N; n++) {
				str key = V8TOSTRING(keys->Get(n)->ToString());
				V8VALUE val = V8INDEX(parm,key);
				printf(TRACE "key=%s isobj=%d\n",key,val->IsObject());
			}
		}
		
		// initialize machine with arguments when called
		int setup(const V8STACK& args) {
			scope = V8ENTRY(args);
			err = 0;
			
			switch (args.Length()) {
				case 0:
					printf(TRACE "%s connected\n",name);
					break;
					
				case 1:
					monitor(TRACE "parms",parm);
					break;
						
				case 2:
					err = badArgs;
					break;
					
				case 3:					

					if (args[1]->IsObject()) {
						parm = PARMARG(args);
						name = NAMEARG(args);
						port = "";
						init = true;
						tau  = V8GETARRAY(parm,"tau");
						code = CODEARG(args);
						path = strstr(code,"\n") ? NULL : code;
					}
					else {
						port = PORTARG(args);
						init = false;
						tau  = TAUARG(args);				
					}

if (init)
printf(TRACE "setup name=%s port=%s code=%d args=%d init=%d\n",name,port,strlen(code),args.Length(),(int) init);

					break;

				default:
					err = badArgs;
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
		bool init;	 		// initialize flag
		str name, port, path, code;	// engine name, port name being latched, engine code file path, engine code
		V8ARRAY tau; 			// input/output events
		V8OBJECT parm;			// parameters
		Isolate *scope; 		// v8 garbage collection thread
};

// Generator for machine pool MAC_machine[0,1,...] and its MAC(args) interface.

#define V8POOL(MAC,MAX,CLS) \
CLS MAC##_machine[MAX]; \
\
void MAC(const V8STACK& args) { \
	Isolate *scope = V8ENTRY(args); \
	str name = NAMEARG(args); \
	int n; \
\
	for (n=0; n<MAX; n++) { \
		if ( strcmp(MAC##_machine[n].name,name) == 0 ) { \
			args.V8EXIT( MAC##_machine[n].call(args) ); \
			return; \
		} \
	} \
\
	for (n=0; n<MAX; n++) \
		if ( strcmp(MAC##_machine[n].name,"") == 0 ) { \
			MAC##_machine[n].name = mac_strclone(name); \
			args.V8EXIT( MAC##_machine[n].call(args) ); \
			return; \
		} \
\
	args.V8EXIT( badPool ); \
}

// UNCLASSIFIED
