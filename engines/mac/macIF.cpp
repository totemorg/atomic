// UNCLASSIFIED

/*
 * Defines a V8 machine pool generator:
 * 
 * 		V8POOL(MAC,MAX,CLS)
 * 
 * to generate MAX number of CLS-class machines and a MAC(args) interface:
 * 
 * 		args = name string, port string, tau list
 * 		args = name string, parm hash, code string
 * 
 * The engine name = "Client.Engine.Instance" uniquely identifies the 
 * engine's compute thread and can be freely added to the pool until 
 * the pool becomes full.  
 * 
 * When stepping a machine, the port string specifies either the name of 
 * the input port on which input event taus = [ tau, tau, ... ] are latched, 
 * or the name of the output port which latches output event taus = [ tau, 
 * tau, ... ] where each event tau is a hash.
 * 
 * When programming a machine, the parm hash = { ports: {name1: {...}, 
 * name2: {...}, ...}, tau: [tau,tau,...], ... } defines parameters 
 * to machine i/o ports, default i/o event taus, and a code string to 
 * (re)program the machine.
 *
 * See the opencv.cpp, python.cpp, etc machines for usage examples.  This 
 * interface is created using node-gyp with the binding.gyp provided.
 * */

/*
Notes: 
	google's rapidjson does not provide a useful V8 interface here as (1) its
	"Value" class conflicts with V8 "Value" class, and (2) passing rapidjson 
	objects to machines is self-defeating.  Similar conflicts occured with the
	nodejs nan module.

References:
	machines/opencv/objdet for an example opencv mac-machine.  
	machines/python for an example python mac-machine.  
	http://izs.me/v8-docs/ for API to V8 engine.
	http://nodejs.org/api/addons.html for node-gyp help.
	sigma/clients/models.js for the Tau Simulatorf client.
	tauIF.h for mac structure

Example python machine:

	# Define several i/o  ports for use in TAU workflows.  A ports always takes an input list of events,
	# and the parameter hash for that port.

	state = [1,2,3]

	def InputA(mac,parm):
		print "load state from A " + mac[0]['job']

	def InputB(mac,parm):
		print "load state from B " + mac[0]['job']

	def OutoutA(mac,parm):
		print "operate on state and save to A " + mac[0]['job']

	def OutputB(mac,parm):
		print "operate on state and save to B " + mac[0]['job']

	def OutputC(mac,parm):
		print "operate on state and save to C " + mac[0]['job']

	# load regression data from app1

	TAU['cur0'].execute("SELECT * from app1.Htest", () )
	for (Rec) in TAU['cur0']:
		print Rec

Example js machine:

	// We'll use mathjs here to do a regression analysis.

	var MATH = require('../node_modules/mathjs');
	
	// acquire url parameters from the TAU.p parameter hash

	var Case = TAU.p.query.case, M = TAU.p.query.M;
	
	// return a spare matrix

	TAU.o.x = [1,2,3];
	TAU.o.y = [4,5];
	TAU.o.z = 6;

	// here is how i/o ports are defined for use in TAU workflows

	TAU.myi = function (itau,otau,parm) { }
	TAU.myo = function (itau,otau,parm) { }
	
	// use the supplied sql connection to query app1 for regression data point, do the regression, 
	// then save results into app1

	TAU.p.sql.query("SELECT * FROM app1.Htest WHERE least(?)", {Name:Case,Used:1}, function (err,recs) {
		var N = recs.length;
		var X = new Array(N); y = new Array(N);
		
		console.log([Case,M,N]);
		
		for (var n=0;n<N;n++) {
			var data = recs[n];
			var Xn = X[n] = [1];

			y[n] = data.FPR;
			for (var m=1;m<M;m++) Xn[m] = data["p"+(m-1)];
		}
			
		var scope = {X:X, y:y};
		
		MATH.eval("a = inv(X' * X) * X' * y",scope);
		console.log(scope.a);
		
		var reg = {Name:Case,Tests:N,Computed:new Date()}, a=scope.a;
		for (var n=0,N=a.length;n<N;n++) reg['a'+n] = a[n];
		
		TAU.p.sql.query("REPLACE INTO app1.Hreg SET ?",reg);
	});
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
