/**
@class engine [![Forked from SourceForge](https://sourceforge.net)]
# ENGINE

ENGINE provides a foundation for hyperthreaded workflows to (both stateless and stateful) engines of type

	X = py,js,sh,opencv,mat,matlab,csh,r,octave, ...

at ENGINE[X].  Engines are controlled via the following methods (restful http endpoints):

	step (POST,insert) to advance a stateful engine
	init (PUT,update) to compile a stateful engine
	kill (DELETE,delete) to deallocate a stateful engine
	read (GET,select) to execute a stateless engines

Stateful engines are supported by the step, init and kill methods, 
and are passed TAU event tokens:

	TAU.i = [{tau}, ...] = events arriving to engine's input port
	TAU.o = [{tau}, ...] = events departing from engine's output port
	TAU.p = {port1: {...}, ... port2: {...}, ... sql: {...} }
	TAU.port = engine's in/out port to step
	TAU.thread = engine's 0-base thread counter

where input/output port parameters and engine code are taken from
the Vars and Code engine context at workflow initialization, and 
where sql is a mysql database connector.  

Each event token contains the following default fields (they can 
be freely interpretted and extended by the engine):

	job = "" 	= Current job thread N.N...
	work = 0 	= Anticipated/delivered data volume (dims bits etc)
	disem = "" 	= Disemination channel for this event
	classif = ""	= Classification of this event
	cost = ""	= Billing center
	policy = ""	= Data retention policy
	status = 0	= Status code
	value = 0	= Flow calculation

Stateless engines are supported by the read method, and are passed
the following parameters:

	TAU.i = {tau} = input event sinked to an engine
	TAU.o = {tau} = output event sourced from an engine
	TAU.p = {sql: {...}, query: {...} }

where the query hash will contain the url parameters.

In addition to geoClient config paramaters, geoEngine accepts 
the config parameters:

	jobspath path to prefix to a tau.job
	app{...} crud interface to virtual tables

## Installation

Download the latest version with

	git clone https://git.geointapps.org/acmesds/flex
	
Typically, you will want to redirect the following to your project:

	ln -s ../myproject/test.js test.js 					# unit testing
	ln -s ../myproject/maint.sh maint.sh 			# test startup and maint scripts
	
## Usage

See Examples.

## Examples

Below sample use-cases are from engine/test.js.

### E1 - A default Totem client
	
	E1: function () {

		var ENGINE = require("../engine");
		var TOTEM = require("../totem");

		Trace( "A default Totem client", {
			a_tau_template: ENGINE.tau("somejob.pdf"),
			engine_errors: ENGINE.error,
			get_endpts: TOTEM.reader,
			my_paths: TOTEM.paths
		});
		
	},

### E2 - Totem being powered up and down

	E2: function () {

		var TOTEM = require("../totem");
		
		TOTEM.start({
			
			init: function () {

				Trace( "Totem being powered down" );
				
				TOTEM.stop();
			}
		});

		var ENGINE = require("../engine").config({
			thread: TOTEM.thread
		});

	},

### E3 - Starting a trivial Totem with a chipper fetcher and a database

	E3: function () {
		
		var TOTEM = require("../totem").start({

			"reader.": {
				chipper: function Chipper(req,res) {				
					res( 123 );
				}
			},
			
			mysql: {
				host: ENV.MYSQL_HOST,
				user: ENV.MYSQL_USER,
				pass: ENV.MYSQL_PASS
			}
			
		});

		var ENGINE = require("../engine").config({
			thread: TOTEM.thread
		});

		Trace( "Starting a trivial Totem with a chipper fetcher and a database" );

	}

### E4 - Unit test engines with /test?config=cv | py1 | py2 | py3 | js

	E4: function () {
		
		var TOTEM = require("../totem").start({

			"reader.": {
				test: function Chipper(req,res) {
					
					var itau = [ENGINE.tau()];
					var otau = [ENGINE.tau()];

					switch (req.query.config) {
						case "cv": // program and step haar opencv machine 
							parm =	{
								tau: [], 
								ports: {
									frame:	 {},
									helipads: {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							itau[0].job = "test.jpg";
							console.log(parm);

							for (var n=0,N=1;n<N;n++)  // program N>1 to test reprogram
								console.log(`INIT[${n}] = `, ENGINE.opencv("opencv.Me.Thread1","setup",parm));

							for (var n=0,N=5;n<N;n++) // step N>1 to test multistep
								console.log(`STEP[${n}] = `, ENGINE.opencv("opencv.Me.Thread1","frame",itau));

							// returns badStep if the cascades were undefined at the program step
							console.log("STEP = ", ENGINE.opencv("opencv.Me.Thread1","helipads",otau));
							console.log(otau);
							break;

						// python machines fail with "cant find forkpty" if "import cv2" attempted

						case "py1": // program python machine
							parm =	{ 
								tau:	["redefine on run"],
								ports: {	
									frame:	 {},
									helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};
							pgm = `
								print 'Look mom - Im running python!'
								print tau
								tau = [{'x':[11,12],'y':[21,22]}]
								`;

							// By default python attempts to connect to mysql.  
							// So, if mysql service not running or mysql.connector module not found, this will not run.
							console.log(parm);
							console.log("INIT = ", ENGINE.python("py1.thread",pgm,parm));
							console.log(parm.tau);
							break;

						case "py2": // program and step python machine 
							parm =	{ 
								ports: { 	
									frame:	 {},
									helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							itau[0].job = "test.jpg";
							pgm = `
								print 'Look mom - Im running python!'
								def frame(tau,parms):
									print parms
									return -101
								def helipads(tau,parms):
									print parms
									return -102
								def faces(tau,parms):
									print parms
									return -103
								`;		
							console.log("INIT = ", ENGINE.python("py2.Me.Thread1",pgm,parm));

							for (var n=0,N=1; n<N; n++)
								console.log(`STEP[${n}] = `, ENGINE.python("py2.Me.Thread1","frame",itau));

							console.log("STEP = ", ENGINE.python("py2.Me.Thread1","helipads",otau));
							break;

						case "py3": // program and step python machine string with reinit along the way
							parm =	{ 
								ports: {	
									frame:	 {},
									helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							itau[0].job = "test.jpg";
							pgm = `
									print 'Look mom - Im running python!'
									def frame(tau,parms):
										print parms
										return -101
									def helipads(tau,parms):
										print parms
										return -102
									def faces(tau,parms):
										print parms
										return -103
									`;

							console.log("INIT = ", ENGINE.python("py3",pgm,parm));
							console.log("STEP = ", ENGINE.python("py3","frame",itau));
							console.log("REINIT = ", ENGINE.python("py3",pgm,parm));
							console.log("STEP = ", ENGINE.python("py3","frame",itau));
							console.log(otau);
							break;

						case "js": // program and step a js machine string
							parm =	{ 
								ports: {	
									frame:	 {},
									helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							itau[0].job = "test.jpg";
							pgm = `
								CON.log('Look mom - Im running javascript!');
								function frame(tau,parms) { 
									CON.log("here I come to save the day");
									tau[0].xyz=123; 
									return 0; 
								}
								function helipads(tau,parms) { 
									tau[0].results=666; 
									return 101; 
								}
								function faces(tau,parms) { return 102; }
								`;

							console.log("INIT = ", ENGINE.js("mytest",pgm,parm));
							// frame should return a 0 = null noerror
							console.log("STEP = ", ENGINE.js("mytest","frame",itau));
							console.log(itau);
							// helipads should return a 101 = badload error
							console.log("STEP = ", ENGINE.js("mytest","helipads",otau));
							console.log(otau);
							break;	
					}
					
					res( "thanks!" );
				}
			},
			
			mysql: {
				host: ENV.MYSQL_HOST,
				user: ENV.MYSQL_USER,
				pass: ENV.MYSQL_PASS
			}
			
		});

		var ENGINE = require("../engine").config({
			thread: TOTEM.thread
		});

		Trace( "Unit test engines with /test?config=cv | py1 | py2 | py3 | js" );

	}
	
## License

[MIT](LICENSE)

*/
