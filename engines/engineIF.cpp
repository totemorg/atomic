// UNCLASSIFIED

/*
 * Reserves a pool of V8 machine interfaces:
 * 
 *		opencv(args) 
 *		python(args) 
 *		matlab(args) 
 *		R(args) 
 * 
 * where:
 * 
 * 		args = name string, port string, tau list
 * 		args = name string, parm hash, code string
 * 
 * A typical machine name = "Client.Engine.Instance" uniquely identifies the 
 * machine's compute thread and can be freely added to the pool until 
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
 * See testIF.js for JS usage examples.  This interface is created using 
 * node-gyp with the binding.gyp provided.
 * */

/*
Notes: 
	google's rapidjson does not provide a useful V8 interface here as (1) its
	"Value" class conflicts with V8 "Value" class, and (2) passing rapidjson 
	objects to machines is self-defeating.  Similar conflicts occured with the
	nodejs nan module.

References:
	machines/opencv/objdet for an example opencv tau-machine.  
	machines/python for an example python tau-machine.  
	http://izs.me/v8-docs/ for API to V8 engine.
	http://nodejs.org/api/addons.html for node-gyp help.
	sigma/clients/models.js for the Tau Simulatorf client.
	tauIF.h for tau structure

Example python machine:

	# Define several i/o  ports for use in TAU workflows.  A ports always takes an input list of events,
	# and the parameter hash for that port.

	state = [1,2,3]

	def InputA(tau,parm):
		print "load state from A " + tau[0]['job']

	def InputB(tau,parm):
		print "load state from B " + tau[0]['job']

	def OutoutA(tau,parm):
		print "operate on state and save to A " + tau[0]['job']

	def OutputB(tau,parm):
		print "operate on state and save to B " + tau[0]['job']

	def OutputC(tau,parm):
		print "operate on state and save to C " + tau[0]['job']

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

// cpu health

void temp(const V8STACK& args) {  // board temp
	Isolate *scope = V8ENTRY(args);
	
	//printf("hello\n");
	
	args.V8EXIT( 0 );
}

// initialize engines and cpu health

void init(Handle<Object> exports) {
	extern V8MACHINE opencv;
	NODE_SET_METHOD(exports, "opencv", opencv);
	
	extern V8MACHINE python;
	NODE_SET_METHOD(exports, "python", python);

	NODE_SET_METHOD(exports, "temp", temp);

	/*
	extern V8MACHINE R;
	NODE_SET_METHOD(exports, "R", R);
	
	extern V8MACHINE matlab;
	NODE_SET_METHOD(exports, "matlab", matlab);
	* */
}

NODE_MODULE(tauIF, init)

// UNCLASSIFIED
